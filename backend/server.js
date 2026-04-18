import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import promptRoutes from './routes/promptRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import suggestionRoutes from './routes/suggestionRoutes.js';
import embeddingRoutes from './routes/embeddingRoutes.js';
import { initDb, saveDb } from './services/db.js';
import { seedDbIfEmpty } from './services/dbSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const isProduction = process.env.NODE_ENV === 'production';
const frontendDist = path.join(__dirname, '../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/prompt', promptRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/embeddings', embeddingRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

if (isProduction) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, async () => {
  try {
    if (process.env.DATABASE_URL) {
      await initDb();
      console.log('Database initialized');
    }
    await seedDbIfEmpty();
  } catch (e) {
    console.error('DB seed error:', e.message);
  }
  console.log(`Server running on port ${PORT}`);
});