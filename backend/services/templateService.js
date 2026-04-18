import { dbAll, dbGet, dbRun, uuid } from './db.js';

export const templateService = {
  async list({ category, q } = {}) {
    const where = [];
    const params = [];

    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    if (q) {
      where.push('(LOWER(name) LIKE ? OR LOWER(prompt) LIKE ? OR LOWER(tags) LIKE ?)');
      const like = `%${q.toLowerCase()}%`;
      params.push(like, like, like);
    }

    const sql = `SELECT id, name, category, tags, prompt, is_public as isPublic, rating, created_at as createdAt
                 FROM templates
                 ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                 ORDER BY datetime(created_at) DESC`;

    const rows = await dbAll(sql, params);
    return rows.map((r) => ({
      ...r,
      tags: r.tags ? r.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
      isPublic: !!r.isPublic,
    }));
  },

  async get(id) {
    const row = await dbGet(
      `SELECT id, name, category, tags, prompt, is_public as isPublic, rating, created_at as createdAt FROM templates WHERE id = ?`,
      [id]
    );
    if (!row) return null;
    return {
      ...row,
      tags: row.tags ? row.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
      isPublic: !!row.isPublic,
    };
  },

  async upsert({ id, name, category, tags, prompt, isPublic = false }) {
    const templateId = id || uuid();
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
    const createdAt = new Date().toISOString();

    await dbRun(
      `INSERT INTO templates (id, name, category, tags, prompt, is_public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         category = excluded.category,
         tags = excluded.tags,
         prompt = excluded.prompt,
         is_public = excluded.is_public`,
      [templateId, name, category, tagsStr, prompt, isPublic ? 1 : 0, createdAt]
    );

    return await templateService.get(templateId);
  },

  async remove(id) {
    await dbRun('DELETE FROM templates WHERE id = ?', [id]);
  },

  async rate({ templateId, rating }) {
    const id = uuid();
    await dbRun(
      `INSERT INTO template_ratings (id, template_id, rating, created_at) VALUES (?, ?, ?, ?)`,
      [id, templateId, rating, new Date().toISOString()]
    );

    // Recompute average rating
    const row = await dbGet(
      `SELECT AVG(rating) as avgRating FROM template_ratings WHERE template_id = ?`,
      [templateId]
    );

    await dbRun('UPDATE templates SET rating = ? WHERE id = ?', [row?.avgRating ?? null, templateId]);
    return await templateService.get(templateId);
  },
};
