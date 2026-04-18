import axios from 'axios';
import { templateService } from './templateService.js';
import { historyService } from './historyService.js';
import { embeddingService } from './embeddingService.js';

const getEnv = () => ({
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_EMBEDDING_MODEL: process.env.OPENROUTER_EMBEDDING_MODEL || 'text-embedding-3-small',
  OPENROUTER_CHAT_MODEL: process.env.OPENROUTER_CHAT_MODEL || 'openai/gpt-4o-mini',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_CHAT_MODEL: process.env.OLLAMA_CHAT_MODEL || 'llama3',
});

const buildContextBlock = async (hits) => {
  const parts = [];
  for (const h of hits) {
    if (h.sourceType === 'template') {
      const tpl = await templateService.get(h.sourceId);
      if (tpl) {
        parts.push({
          type: 'template',
          id: tpl.id,
          title: `${tpl.name} (${tpl.category})`,
          text: tpl.prompt,
          score: h.score,
        });
      }
    }
    if (h.sourceType === 'history') {
      const item = await historyService.get(h.sourceId);
      if (item) {
        parts.push({
          type: 'history',
          id: item.id,
          title: `${item.provider} / ${item.model} @ ${item.createdAt}`,
          text: `User input:\n${item.userInput}\n\nGenerated prompt:\n${item.generatedPrompt}`,
          score: h.score,
        });
      }
    }
  }

  return parts;
};

export const openRouterEmbed = async (text) => {
  const { OPENROUTER_API_KEY, OPENROUTER_EMBEDDING_MODEL } = getEnv();
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const res = await axios.post(
    'https://openrouter.ai/api/v1/embeddings',
    {
      model: OPENROUTER_EMBEDDING_MODEL,
      input: text,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      timeout: 60000,
    }
  );

  const vector = res.data?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error('Failed to create embedding');
  return vector;
};

const ollamaGenerate = async ({ prompt }) => {
  const { OLLAMA_BASE_URL, OLLAMA_CHAT_MODEL } = getEnv();
  const res = await axios.post(
    `${OLLAMA_BASE_URL}/api/chat`,
    {
      model: OLLAMA_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    },
    { timeout: 120000 }
  );

  const text = res.data?.message?.content;
  if (!text) throw new Error('Ollama returned empty response');
  return text;
};

const openRouterGenerate = async ({ prompt }) => {
  const { OPENROUTER_API_KEY, OPENROUTER_CHAT_MODEL } = getEnv();
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: OPENROUTER_CHAT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1400,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      timeout: 120000,
    }
  );

  const text = res.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned empty response');
  return text;
};

export const suggestionService = {
  async suggest({ userInput, engine = 'ollama', topK = 5 }) {
    // 1) embedding
    const queryVector = await openRouterEmbed(userInput);

    // 2) retrieve similar contexts
    const hits = await embeddingService.searchSimilar({ queryVector, topK, sourceTypes: ['template', 'history'] });
    const contextParts = await buildContextBlock(hits);

    // 3) build prompt
    const contextText = contextParts
      .map(
        (c) =>
          `### ${c.type.toUpperCase()} (${c.score.toFixed(3)}) - ${c.title}\n${c.text}`
      )
      .join('\n\n');

    const finalPrompt = `You are a prompt-engineering assistant.\n\nUser request:\n${userInput}\n\nRelevant context from this app (templates/history):\n${contextText || '(none)'}\n\nTask:\n1) Improve the user request into a clearer prompt request (ask clarifying questions if needed).\n2) Produce a "Better User Input" that the app can feed into its structured PROMPT_TEMPLATE.\n3) Provide bullet suggestions to improve the prompt (format, constraints, examples, tone).\n\nOutput JSON with keys: betterUserInput, suggestions, clarifyingQuestions.`;

    // 4) generate
    const text = engine === 'openrouter'
      ? await openRouterGenerate({ prompt: finalPrompt })
      : await ollamaGenerate({ prompt: finalPrompt });

    return { text, context: contextParts };
  },
};
