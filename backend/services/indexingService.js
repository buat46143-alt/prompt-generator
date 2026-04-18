import { embeddingService } from './embeddingService.js';
import { openRouterEmbed } from './suggestionService.js';

export const indexingService = {
  async indexText({ sourceType, sourceId, text, provider = 'openrouter', model = null }) {
    try {
      const vector = await openRouterEmbed(text);
      await embeddingService.upsertEmbedding({
        sourceType,
        sourceId,
        provider,
        model,
        vector,
      });
      return { indexed: true };
    } catch (e) {
      // Do not fail main request if indexing is unavailable
      return { indexed: false, error: e.message };
    }
  },
};
