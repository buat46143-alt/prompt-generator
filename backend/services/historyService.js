import { dbAll, dbGet, dbRun, uuid } from './db.js';

export const historyService = {
  async list({ provider, q, dateFrom, dateTo, limit = 200 } = {}) {
    const where = [];
    const params = [];

    if (provider) {
      where.push('provider = ?');
      params.push(provider);
    }

    if (q) {
      where.push('(LOWER(user_input) LIKE ? OR LOWER(generated_prompt) LIKE ? OR LOWER(model) LIKE ?)');
      const like = `%${q.toLowerCase()}%`;
      params.push(like, like, like);
    }

    if (dateFrom) {
      where.push('datetime(created_at) >= datetime(?)');
      params.push(dateFrom);
    }

    if (dateTo) {
      where.push('datetime(created_at) <= datetime(?)');
      params.push(dateTo);
    }

    const sql = `SELECT id, provider, model,
                  user_input as userInput,
                  generated_prompt as generatedPrompt,
                  created_at as createdAt,
                  generation_ms as generationMs,
                  success
                FROM prompt_history
                ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                ORDER BY datetime(created_at) DESC
                LIMIT ?`;

    const rows = await dbAll(sql, [...params, limit]);
    return rows.map((r) => ({ ...r, success: r.success == null ? null : !!r.success }));
  },

  async get(id) {
    return await dbGet(
      `SELECT id, provider, model, user_input as userInput, generated_prompt as generatedPrompt, created_at as createdAt, generation_ms as generationMs, success
       FROM prompt_history WHERE id = ?`,
      [id]
    );
  },

  async add({ provider, model, userInput, generatedPrompt, generationMs = null, success = 1 }) {
    const id = uuid();
    const createdAt = new Date().toISOString();
    await dbRun(
      `INSERT INTO prompt_history (id, provider, model, user_input, generated_prompt, created_at, generation_ms, success)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, provider, model, userInput, generatedPrompt, createdAt, generationMs, success ? 1 : 0]
    );
    return await historyService.get(id);
  },

  async remove(id) {
    await dbRun('DELETE FROM prompt_history WHERE id = ?', [id]);
  },

  async clear() {
    await dbRun('DELETE FROM prompt_history');
  },
};
