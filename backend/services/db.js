import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
let pool;

const getPool = () => {
  if (pool) return pool;
  
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  return pool;
};

export const initDb = async () => {
  const pool = getPool();
  
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

    CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
    CREATE INDEX IF NOT EXISTS idx_prompt_history_provider ON prompt_history(provider);
    CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON prompt_history(created_at);
    CREATE INDEX IF NOT EXISTS idx_embeddings_source ON embeddings(source_type, source_id);
  `);
};

export const uuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const dbAll = async (sql, params = []) => {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return result.rows;
};

export const dbGet = async (sql, params = []) => {
  const rows = await dbAll(sql, params);
  return rows[0] || null;
};

export const dbRun = async (sql, params = []) => {
  const pool = getPool();
  await pool.query(sql, params);
};

export const saveDb = async () => {};