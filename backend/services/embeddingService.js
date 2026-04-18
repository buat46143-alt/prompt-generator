import { dbAll, dbGet, dbRun, uuid } from './db.js';

const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? -1 : dot / denom;
};

export const embeddingService = {
  cosineSimilarity,

  async upsertEmbedding({ sourceType, sourceId, provider, model = null, vector }) {
    const existing = await dbGet(
      `SELECT id FROM embeddings WHERE source_type = ? AND source_id = ? AND provider = ? AND IFNULL(model, '') = IFNULL(?, '')`,
      [sourceType, sourceId, provider, model]
    );

    const id = existing?.id || uuid();
    const createdAt = new Date().toISOString();
    const dims = Array.isArray(vector) ? vector.length : null;

    await dbRun(
      `INSERT INTO embeddings (id, source_type, source_id, provider, model, dims, vector_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         vector_json = excluded.vector_json,
         dims = excluded.dims,
         created_at = excluded.created_at`,
      [id, sourceType, sourceId, provider, model, dims, JSON.stringify(vector), createdAt]
    );

    return { id, sourceType, sourceId, provider, model, dims };
  },

  async listEmbeddings({ sourceType } = {}) {
    const where = [];
    const params = [];
    if (sourceType) {
      where.push('source_type = ?');
      params.push(sourceType);
    }

    const rows = await dbAll(
      `SELECT id, source_type as sourceType, source_id as sourceId, provider, model, dims, vector_json as vectorJson, created_at as createdAt
       FROM embeddings
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}`,
      params
    );

    return rows.map((r) => ({
      ...r,
      vector: JSON.parse(r.vectorJson),
    }));
  },

  async searchSimilar({ queryVector, sourceTypes = ['template', 'history'], topK = 5 }) {
    const rows = await dbAll(
      `SELECT id, source_type as sourceType, source_id as sourceId, provider, model, dims, vector_json as vectorJson
       FROM embeddings
       WHERE source_type IN (${sourceTypes.map(() => '?').join(',')})`,
      sourceTypes
    );

    const scored = rows
      .map((r) => {
        const v = JSON.parse(r.vectorJson);
        return {
          ...r,
          score: cosineSimilarity(queryVector, v),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  },
};
