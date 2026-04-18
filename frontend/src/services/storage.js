const HISTORY_KEY = 'promptMaker.history.v1';
const TEMPLATES_KEY = 'promptMaker.templates.v1';

const safeJsonParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const uuid = () => {
  // Prefer crypto.randomUUID when available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const historyStorage = {
  getAll() {
    const data = safeJsonParse(localStorage.getItem(HISTORY_KEY), []);
    // newest first
    return Array.isArray(data)
      ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];
  },

  save(entry) {
    const all = historyStorage.getAll();
    const item = {
      id: entry.id || uuid(),
      provider: entry.provider,
      model: entry.model,
      userInput: entry.userInput,
      generatedPrompt: entry.generatedPrompt,
      createdAt: entry.createdAt || new Date().toISOString(),
    };

    const next = [item, ...all];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return item;
  },

  remove(id) {
    const next = historyStorage.getAll().filter((x) => x.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  },

  clear() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  },
};

const defaultTemplates = [
  {
    id: 'tpl-content-writing-blog',
    name: 'Content Writing: Blog Outline',
    category: 'Content Writing',
    tags: ['blog', 'outline', 'seo'],
    rating: 4.7,
    prompt: 'Create a detailed SEO-friendly blog outline about: {topic}. Include title ideas, headings (H2/H3), key points per section, and FAQs.',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-code-review',
    name: 'Code Review Checklist',
    category: 'Code Review',
    tags: ['code', 'review', 'quality'],
    rating: 4.5,
    prompt: 'You are a senior engineer. Review the following code for correctness, security, readability, and performance. Provide actionable suggestions and a prioritized list of issues. Code:\n\n{code}',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-data-analysis',
    name: 'Data Analysis: Insights',
    category: 'Data Analysis',
    tags: ['analysis', 'insights'],
    rating: 4.3,
    prompt: 'Analyze this dataset summary and produce insights, anomalies, and recommended next analyses. Summary: {summary}',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-creative-writing',
    name: 'Creative Writing: Short Story',
    category: 'Creative Writing',
    tags: ['story', 'creative'],
    rating: 4.6,
    prompt: 'Write a short story in the style of {style} with the theme: {theme}. Use vivid descriptions and a strong ending.',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-business-email',
    name: 'Business: Professional Email',
    category: 'Business',
    tags: ['email', 'professional'],
    rating: 4.4,
    prompt: 'Draft a professional email to {recipient} about {subject}. Context: {context}. Tone: {tone}. Include a clear call-to-action.',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-education-lesson',
    name: 'Education: Lesson Plan',
    category: 'Education',
    tags: ['lesson', 'teaching'],
    rating: 4.2,
    prompt: 'Create a lesson plan for {gradeLevel} about {topic}. Include objectives, materials, warm-up, activities, assessment, and homework.',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-database-sql',
    name: 'Database: SQL Generator',
    category: 'Database',
    tags: ['sql', 'database'],
    rating: 4.1,
    prompt: 'Given the schema: {schema}. Write an optimized SQL query to: {task}. Explain the query briefly and suggest indexes if needed.',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'tpl-financing-budget',
    name: 'Financing: Budget Planner',
    category: 'Financing',
    tags: ['budget', 'finance'],
    rating: 4.0,
    prompt: 'Create a monthly budget plan based on income {income} and expenses {expenses}. Suggest optimizations and savings targets.',
    isPublic: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const templateStorage = {
  getAll() {
    const stored = safeJsonParse(localStorage.getItem(TEMPLATES_KEY), null);
    if (!stored) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultTemplates));
      return defaultTemplates;
    }
    return Array.isArray(stored) ? stored : [];
  },

  save(template) {
    const all = templateStorage.getAll();
    const item = {
      id: template.id || uuid(),
      name: template.name,
      category: template.category,
      tags: template.tags || [],
      rating: typeof template.rating === 'number' ? template.rating : null,
      prompt: template.prompt,
      isPublic: !!template.isPublic,
      createdAt: template.createdAt || new Date().toISOString(),
    };

    const next = [item, ...all.filter((t) => t.id !== item.id)];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
    return item;
  },

  rate(templateId, rating) {
    const all = templateStorage.getAll();
    const next = all.map((t) => {
      if (t.id !== templateId) return t;
      return { ...t, rating };
    });
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  },

  remove(templateId) {
    const next = templateStorage.getAll().filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  },
};
