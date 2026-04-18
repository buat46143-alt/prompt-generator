import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

const getPool = () => new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDb = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT,
      prompt TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      rating REAL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS template_ratings (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prompt_history (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      user_input TEXT NOT NULL,
      generated_prompt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      generation_ms INTEGER,
      success INTEGER
    );

    CREATE TABLE IF NOT EXISTS embeddings (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT,
      dims INTEGER,
      vector_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
};

const dbAll = async (pool, sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows;
};

const dbRun = async (pool, sql, params = []) => {
  await pool.query(sql, params);
};

const uuid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultTemplates = [
  { name: 'Content Writing: Blog Outline', category: 'Content Writing', tags: 'blog,outline,seo', prompt: 'Create a detailed SEO-friendly blog outline about: {topic}. Include title ideas, headings (H2/H3), key points per section, and FAQs.', isPublic: 1, rating: 4.7 },
  { name: 'Code Review Checklist', category: 'Code Review', tags: 'code,review,quality', prompt: 'You are a senior engineer. Review the following code for correctness, security, readability, and performance. Code:\n\n{code}', isPublic: 1, rating: 4.5 },
  { name: 'Data Analysis: Insights', category: 'Data Analysis', tags: 'analysis,insights', prompt: 'Analyze this dataset summary and produce insights. Summary: {summary}', isPublic: 1, rating: 4.3 },
  { name: 'Creative Writing: Short Story', category: 'Creative Writing', tags: 'story,creative', prompt: 'Write a short story in the style of {style} with the theme: {theme}.', isPublic: 1, rating: 4.6 },
  { name: 'Business: Professional Email', category: 'Business', tags: 'email,professional', prompt: 'Draft a professional email to {recipient} about {subject}. Tone: {tone}.', isPublic: 1, rating: 4.4 },
];

const seedDbIfEmpty = async (pool) => {
  const result = await pool.query('SELECT COUNT(*) as cnt FROM templates');
  if (parseInt(result.rows[0]?.cnt || 0) > 0) return;
  for (const t of defaultTemplates) {
    await dbRun(pool,
      `INSERT INTO templates (id, name, category, tags, prompt, is_public, rating, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuid(), t.name, t.category, t.tags, t.prompt, t.isPublic, t.rating, new Date().toISOString()]
    );
  }
};

export default async function handler(req, res) {
  const pool = getPool();
  
  try {
    await initDb(pool);
    await seedDbIfEmpty(pool);
  } catch (e) {
    console.error('DB init error:', e.message);
  }

  const { url, method } = req;

  try {
    if (url === '/api/prompt/providers') {
      return res.status(200).json({
        data: [
          { id: 'openrouter', name: 'OpenRouter', requiresApiKey: true },
          { id: 'ollama', name: 'Ollama (Local)', requiresApiKey: false },
        ]
      });
    }

    if (url === '/api/prompt/generate' && method === 'POST') {
      const { provider, model, userInput } = req.body;
      return res.status(200).json({
        data: { generatedPrompt: `[${provider}/${model}] ${userInput}` }
      });
    }

    if (url === '/api/templates' && method === 'GET') {
      const rows = await dbAll(pool, 'SELECT * FROM templates ORDER BY created_at DESC');
      return res.status(200).json({ data: rows });
    }

    if (url === '/api/templates' && method === 'POST') {
      const { name, category, tags, prompt, is_public, rating } = req.body;
      const id = uuid();
      await dbRun(pool,
        `INSERT INTO templates (id, name, category, tags, prompt, is_public, rating, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, name, category, tags, prompt, is_public || 0, rating || 0, new Date().toISOString()]
      );
      return res.status(200).json({ data: { id } });
    }

    if (url?.startsWith('/api/templates/') && method === 'DELETE') {
      const id = url.split('/api/templates/')[1];
      await dbRun(pool, 'DELETE FROM templates WHERE id = $1', [id]);
      return res.status(200).json({ data: { success: true } });
    }

    if (url === '/api/history' && method === 'GET') {
      const rows = await dbAll(pool, 'SELECT * FROM prompt_history ORDER BY created_at DESC LIMIT 50');
      return res.status(200).json({ data: rows });
    }

    if (url === '/api/history' && method === 'POST') {
      const { provider, model, userInput, generatedPrompt, success } = req.body;
      const id = uuid();
      await dbRun(pool,
        `INSERT INTO prompt_history (id, provider, model, user_input, generated_prompt, created_at, success) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, provider, model, userInput, generatedPrompt, new Date().toISOString(), success ? 1 : 0]
      );
      return res.status(200).json({ data: { id } });
    }

    if (url?.startsWith('/api/history/') && method === 'DELETE') {
      const id = url.split('/api/history/')[1];
      await dbRun(pool, 'DELETE FROM prompt_history WHERE id = $1', [id]);
      return res.status(200).json({ data: { success: true } });
    }

    if (url === '/api/history/clear' && method === 'POST') {
      await dbRun(pool, 'DELETE FROM prompt_history');
      return res.status(200).json({ data: { success: true } });
    }

    if (url === '/api/suggestions' && method === 'POST') {
      return res.status(200).json({ data: { text: '{"betterUserInput":"' + req.body.userInput + '"}' } });
    }

    if (url === '/health') {
      return res.status(200).json({ status: 'OK' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (e) {
    console.error('API error:', e.message);
    return res.status(500).json({ error: e.message });
  } finally {
    await pool.end();
  }
}