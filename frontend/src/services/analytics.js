import { historyStorage } from './storage';

// Very rough default pricing (USD per 1K tokens). Users can adjust later.
const DEFAULT_PRICING_PER_1K = {
  openai: { input: 0.01, output: 0.03 },
  anthropic: { input: 0.008, output: 0.024 },
  gemini: { input: 0.002, output: 0.006 },
  grok: { input: 0.01, output: 0.03 },
  openrouter: { input: 0.01, output: 0.03 },
  mistral: { input: 0.004, output: 0.012 },
  ollama: { input: 0, output: 0 },
};

// Simple heuristic: ~4 chars/token for English; varies a lot.
const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.max(1, Math.round(text.length / 4));
};

export const analytics = {
  buildSummary({ items: itemsInput = null, pricingPer1k = DEFAULT_PRICING_PER_1K } = {}) {
    const items = itemsInput || historyStorage.getAll();

    const totalPrompts = items.length;
    const byProvider = items.reduce((acc, item) => {
      acc[item.provider] = (acc[item.provider] || 0) + 1;
      return acc;
    }, {});

    const promptsByDay = items.reduce((acc, item) => {
      const day = new Date(item.createdAt).toISOString().slice(0, 10);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const providerCosts = items.reduce((acc, item) => {
      const provider = item.provider;
      const pricing = pricingPer1k[provider] || { input: 0, output: 0 };
      const inputTokens = estimateTokens(item.userInput);
      const outputTokens = estimateTokens(item.generatedPrompt);
      const cost = (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
      acc[provider] = (acc[provider] || 0) + cost;
      return acc;
    }, {});

    return {
      totalPrompts,
      byProvider,
      promptsByDay,
      providerCosts,
      // performance placeholders (we don't measure backend latency yet)
      avgGenerationMs: null,
      successRate: null,
    };
  },

  exportHistory(format, itemsInput) {
    const items = itemsInput || historyStorage.getAll();

    if (format === 'json') {
      return {
        mime: 'application/json',
        filename: `prompt-history-${new Date().toISOString().slice(0, 10)}.json`,
        content: JSON.stringify(items, null, 2),
      };
    }

    if (format === 'txt') {
      const content = items
        .map((x) => {
          return [
            `ID: ${x.id}`,
            `Date: ${x.createdAt}`,
            `Provider: ${x.provider}`,
            `Model: ${x.model}`,
            `User Input:\n${x.userInput}`,
            `Generated Prompt:\n${x.generatedPrompt}`,
            '---',
          ].join('\n');
        })
        .join('\n');

      return {
        mime: 'text/plain',
        filename: `prompt-history-${new Date().toISOString().slice(0, 10)}.txt`,
        content,
      };
    }

    if (format === 'csv') {
      const escape = (v) => {
        const s = String(v ?? '');
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };

      const headers = ['id', 'createdAt', 'provider', 'model', 'userInput', 'generatedPrompt'];
      const rows = items.map((x) => headers.map((h) => escape(x[h])).join(','));
      const content = [headers.join(','), ...rows].join('\n');
      return {
        mime: 'text/csv',
        filename: `prompt-history-${new Date().toISOString().slice(0, 10)}.csv`,
        content,
      };
    }

    throw new Error('Unsupported export format');
  },
};
