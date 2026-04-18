import express from 'express';
import cors from 'cors';
import { initDb, dbAll, dbGet, dbRun } from '../backend/services/db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    if (process.env.DATABASE_URL) await initDb();
    next();
  } catch (e) {
    next(e);
  }
});

app.get('/api/prompt/providers', async (req, res) => {
  res.json({
    data: [
      { id: 'openrouter', name: 'OpenRouter', requiresApiKey: true },
      { id: 'ollama', name: 'Ollama (Local)', requiresApiKey: false },
    ]
  });
});

app.post('/api/prompt/generate', async (req, res) => {
  const { provider, model, apiKey, userInput } = req.body;
  res.json({ data: { generatedPrompt: `Generated for ${provider}/${model}: ${userInput}` } });
});

app.get('/api/templates', async (req, res) => {
  const rows = await dbAll('SELECT * FROM templates ORDER BY created_at DESC');
  res.json({ data: rows });
});

app.post('/api/templates', async (req, res) => {
  const { name, category, tags, prompt, is_public, rating } = req.body;
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await dbRun(
    `INSERT INTO templates (id, name, category, tags, prompt, is_public, rating, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, name, category, tags, prompt, is_public || 0, rating || 0, new Date().toISOString()]
  );
  res.json({ data: { id } });
});

app.delete('/api/templates/:id', async (req, res) => {
  await dbRun('DELETE FROM templates WHERE id = $1', [req.params.id]);
  res.json({ data: { success: true } });
});

app.get('/api/history', async (req, res) => {
  const rows = await dbAll('SELECT * FROM prompt_history ORDER BY created_at DESC LIMIT 50');
  res.json({ data: rows });
});

app.post('/api/history', async (req, res) => {
  const { provider, model, userInput, generatedPrompt, success } = req.body;
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await dbRun(
    `INSERT INTO prompt_history (id, provider, model, user_input, generated_prompt, created_at, success)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, provider, model, userInput, generatedPrompt, new Date().toISOString(), success ? 1 : 0]
  );
  res.json({ data: { id } });
});

app.delete('/api/history/:id', async (req, res) => {
  await dbRun('DELETE FROM prompt_history WHERE id = $1', [req.params.id]);
  res.json({ data: { success: true } });
});

app.post('/api/history/clear', async (req, res) => {
  await dbRun('DELETE FROM prompt_history');
  res.json({ data: { success: true } });
});

app.post('/api/suggestions', async (req, res) => {
  res.json({ data: { text: '{"betterUserInput":"' + req.body.userInput + '"}' } });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;