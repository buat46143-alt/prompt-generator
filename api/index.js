import express from 'express';
import pg from 'pg';
const { Pool } = pg;

const app = express();
app.use(express.json());

const getPool = () => new Pool({
  connectionString: process.env.DATABASE_URL,
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
      is_public INTEGER DEFAULT 0,
      rating REAL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS prompt_history (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      user_input TEXT NOT NULL,
      generated_prompt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      success INTEGER
    );
  `);
};

const uuid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultTemplates = [
  { name: 'Content Writing: Blog Outline', category: 'Content Writing', tags: 'blog,outline,seo', prompt: 'Create SEO blog outline: {topic}', isPublic: 1, rating: 4.7 },
  { name: 'Code Review Checklist', category: 'Code Review', tags: 'code,review', prompt: 'Review code for correctness & security', isPublic: 1, rating: 4.5 },
  { name: 'Data Analysis: Insights', category: 'Data Analysis', tags: 'analysis', prompt: 'Analyze dataset: {summary}', isPublic: 1, rating: 4.3 },
  { name: 'Creative Writing: Short Story', category: 'Creative Writing', tags: 'story', prompt: 'Write story style {style}', isPublic: 1, rating: 4.6 },
];

const seedDb = async (pool) => {
  const r = await pool.query('SELECT COUNT(*) FROM templates');
  if (parseInt(r.rows[0]?.count || 0) > 0) return;
  for (const t of defaultTemplates) {
    await pool.query(`INSERT INTO templates (id,name,category,tags,prompt,is_public,rating,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [uuid(), t.name, t.category, t.tags, t.prompt, t.isPublic, t.rating, new Date().toISOString()]);
  }
};

export default async function handler(req, res) {
  const pool = getPool();
  try {
    if (process.env.DATABASE_URL) {
      await initDb(pool);
      await seedDb(pool);
    }
  } catch (e) { console.error('DB:', e.message); }

  const { path, method: m, body } = req;
  const url = path || req.url || '';

  try {
    if (url === '/api/prompt/providers' || url?.startsWith('/api/prompt/providers')) {
      return res.json({ data: [{ id: 'openrouter', name: 'OpenRouter', requiresApiKey: true }] });
    }
    if (url === '/api/prompt/generate' && m === 'POST') {
      const { provider, model, userInput } = body || {};
      return res.json({ data: { generatedPrompt: `[${provider}/${model}] ${userInput}` } });
    }
    if ((url === '/api/templates' || url?.startsWith('/api/templates')) && m === 'GET') {
      const r = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
      return res.json({ data: r.rows });
    }
    if ((url === '/api/templates' || url?.startsWith('/api/templates')) && m === 'POST') {
      const { name, category, tags, prompt } = body || {};
      const id = uuid();
      await pool.query(`INSERT INTO templates (id,name,category,tags,prompt,is_public,rating,created_at) VALUES ($1,$2,$3,$4,$5,0,$6)`,
        [id, name, category, tags, prompt, new Date().toISOString()]);
      return res.json({ data: { id } });
    }
    if (url?.startsWith('/api/templates/') && m === 'DELETE') {
      const id = url.split('/templates/')[1]?.split('?')[0];
      if (id) await pool.query('DELETE FROM templates WHERE id=$1', [id]);
      return res.json({ data: { success: true } });
    }
    if ((url === '/api/history' || url?.startsWith('/api/history')) && m === 'GET') {
      const r = await pool.query('SELECT * FROM prompt_history ORDER BY created_at DESC LIMIT 50');
      return res.json({ data: r.rows });
    }
    if ((url === '/api/history' || url?.startsWith('/api/history')) && m === 'POST') {
      const { provider, model, userInput, generatedPrompt, success } = body || {};
      await pool.query(`INSERT INTO prompt_history (id,provider,model,user_input,generated_prompt,created_at,success) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [uuid(), provider, model, userInput, generatedPrompt, new Date().toISOString(), success ? 1 : 0]);
      return res.json({ data: { id: uuid() } });
    }
    if (url?.startsWith('/api/history/') && m === 'DELETE') {
      const id = url.split('/history/')[1]?.split('?')[0];
      if (id) await pool.query('DELETE FROM prompt_history WHERE id=$1', [id]);
      return res.json({ data: { success: true } });
    }
    if (url === '/api/suggestions' && m === 'POST') {
      return res.json({ data: { text: JSON.stringify({ betterUserInput: body?.userInput || '' }) } });
    }
    if (url === '/health') return res.json({ status: 'OK' });
    return res.json({ error: 'Not found' });
  } catch (e) {
    console.error('Error:', e.message);
    return res.status(500).json({ error: e.message });
  } finally {
    await pool.end();
  }
}