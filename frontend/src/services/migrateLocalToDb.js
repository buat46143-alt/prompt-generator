import { apiV2 } from './apiV2';

const HISTORY_KEY = 'promptMaker.history.v1';
const TEMPLATES_KEY = 'promptMaker.templates.v1';

const safeParse = (v, fallback) => {
  try {
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export const migrateLocalToDb = {
  async migrateHistory() {
    const items = safeParse(localStorage.getItem(HISTORY_KEY), []);
    if (!Array.isArray(items) || items.length === 0) return { migrated: 0 };

    let migrated = 0;
    for (const x of items) {
      if (!x?.provider || !x?.model || !x?.userInput || !x?.generatedPrompt) continue;
      try {
        await apiV2.history.add({
          provider: x.provider,
          model: x.model,
          userInput: x.userInput,
          generatedPrompt: x.generatedPrompt,
          success: true,
        });
        migrated += 1;
      } catch {
        // ignore individual failures
      }
    }

    return { migrated };
  },

  async migrateTemplates() {
    const items = safeParse(localStorage.getItem(TEMPLATES_KEY), []);
    if (!Array.isArray(items) || items.length === 0) return { migrated: 0 };

    let migrated = 0;
    for (const t of items) {
      if (!t?.name || !t?.category || !t?.prompt) continue;
      try {
        await apiV2.templates.upsert({
          name: t.name,
          category: t.category,
          tags: t.tags || [],
          prompt: t.prompt,
          isPublic: !!t.isPublic,
        });
        migrated += 1;
      } catch {
        // ignore
      }
    }

    return { migrated };
  },

  clearLocal() {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(TEMPLATES_KEY);
  },
};
