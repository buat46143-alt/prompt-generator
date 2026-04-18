import { z } from 'zod';
import { suggestionService } from '../services/suggestionService.js';

const schema = z.object({
  userInput: z.string().min(1),
  engine: z.enum(['ollama', 'openrouter']).optional().default('ollama'),
  topK: z.number().int().min(1).max(20).optional().default(5),
});

export const suggestPrompt = async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.message });
  }

  try {
    const result = await suggestionService.suggest(parsed.data);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Suggestion failed' });
  }
};
