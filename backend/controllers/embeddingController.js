import { z } from 'zod';
import { embeddingService } from '../services/embeddingService.js';
import { templateService } from '../services/templateService.js';
import { historyService } from '../services/historyService.js';
import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_EMBEDDING_MODEL = process.env.OPENROUTER_EMBEDDING_MODEL || 'text-embedding-3-small';

const embed = async (text) => {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not configured');
  const res = await axios.post(
    'https://openrouter.ai/api/v1/embeddings',
    { model: OPENROUTER_EMBEDDING_MODEL, input: text },
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_API_KEY}` }, timeout: 60000 }
  );
  const vector = res.data?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error('Failed to create embedding');
  return vector;
};

const indexSchema = z.object({
  sourceType: z.enum(['template', 'history']),
  sourceId: z.string().min(1),
  provider: z.string().optional().default('openrouter'),
  model: z.string().optional().nullable(),
});

export const indexEmbedding = async (req, res) => {
  const parsed = indexSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });

  const { sourceType, sourceId, provider, model } = parsed.data;

  let text;
  if (sourceType === 'template') {
    const tpl = await templateService.get(sourceId);
    if (!tpl) return res.status(404).json({ success: false, message: 'Template not found' });
    text = `${tpl.name}\n${tpl.category}\n${(tpl.tags || []).join(', ')}\n\n${tpl.prompt}`;
  } else {
    const item = await historyService.get(sourceId);
    if (!item) return res.status(404).json({ success: false, message: 'History not found' });
    text = `${item.provider} ${item.model}\n\nUser input:\n${item.userInput}\n\nGenerated prompt:\n${item.generatedPrompt}`;
  }

  try {
    const vector = await embed(text);
    const record = await embeddingService.upsertEmbedding({ sourceType, sourceId, provider, model: model || OPENROUTER_EMBEDDING_MODEL, vector });
    res.json({ success: true, data: record });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Indexing failed' });
  }
};

const searchSchema = z.object({
  userInput: z.string().min(1),
  topK: z.number().int().min(1).max(20).optional().default(5),
});

export const searchSimilar = async (req, res) => {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });

  try {
    const queryVector = await embed(parsed.data.userInput);
    const hits = await embeddingService.searchSimilar({ queryVector, topK: parsed.data.topK, sourceTypes: ['template', 'history'] });
    res.json({ success: true, data: hits });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Search failed' });
  }
};
