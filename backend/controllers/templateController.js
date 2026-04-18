import { z } from 'zod';
import { templateService } from '../services/templateService.js';
import { indexingService } from '../services/indexingService.js';

const upsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  prompt: z.string().min(1),
  isPublic: z.boolean().optional().default(false),
});

const rateSchema = z.object({
  templateId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

export const listTemplates = async (req, res) => {
  const { category, q } = req.query;
  const items = await templateService.list({ category, q });
  res.json({ success: true, data: items });
};

export const upsertTemplate = async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.message });
  }
  const item = await templateService.upsert(parsed.data);

  // auto-index embedding (best-effort)
  await indexingService.indexText({
    sourceType: 'template',
    sourceId: item.id,
    text: `${item.name}\n${item.category}\n${(item.tags || []).join(', ')}\n\n${item.prompt}`,
  });

  res.json({ success: true, data: item });
};

export const deleteTemplate = async (req, res) => {
  const { id } = req.params;
  await templateService.remove(id);
  res.json({ success: true });
};

export const rateTemplate = async (req, res) => {
  const parsed = rateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.message });
  }
  const item = await templateService.rate(parsed.data);
  res.json({ success: true, data: item });
};
