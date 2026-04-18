import { dbGet, dbRun, uuid } from './db.js';

const defaultTemplates = [
  {
    name: 'Content Writing: Blog Outline',
    category: 'Content Writing',
    tags: ['blog', 'outline', 'seo'],
    prompt: 'Create a detailed SEO-friendly blog outline about: {topic}. Include title ideas, headings (H2/H3), key points per section, and FAQs.',
    isPublic: 1,
    rating: 4.7,
  },
  {
    name: 'Code Review Checklist',
    category: 'Code Review',
    tags: ['code', 'review', 'quality'],
    prompt: 'You are a senior engineer. Review the following code for correctness, security, readability, and performance. Provide actionable suggestions and a prioritized list of issues. Code:\n\n{code}',
    isPublic: 1,
    rating: 4.5,
  },
  {
    name: 'Data Analysis: Insights',
    category: 'Data Analysis',
    tags: ['analysis', 'insights'],
    prompt: 'Analyze this dataset summary and produce insights, anomalies, and recommended next analyses. Summary: {summary}',
    isPublic: 1,
    rating: 4.3,
  },
  {
    name: 'Creative Writing: Short Story',
    category: 'Creative Writing',
    tags: ['story', 'creative'],
    prompt: 'Write a short story in the style of {style} with the theme: {theme}. Use vivid descriptions and a strong ending.',
    isPublic: 1,
    rating: 4.6,
  },
  {
    name: 'Business: Professional Email',
    category: 'Business',
    tags: ['email', 'professional'],
    prompt: 'Draft a professional email to {recipient} about {subject}. Context: {context}. Tone: {tone}. Include a clear call-to-action.',
    isPublic: 1,
    rating: 4.4,
  },
  {
    name: 'Education: Lesson Plan',
    category: 'Education',
    tags: ['lesson', 'teaching'],
    prompt: 'Create a lesson plan for {gradeLevel} about {topic}. Include objectives, materials, warm-up, activities, assessment, and homework.',
    isPublic: 1,
    rating: 4.2,
  },
  {
    name: 'Database: SQL Generator',
    category: 'Database',
    tags: ['sql', 'database'],
    prompt: 'Given the schema: {schema}. Write an optimized SQL query to: {task}. Explain the query briefly and suggest indexes if needed.',
    isPublic: 1,
    rating: 4.1,
  },
  {
    name: 'Financing: Budget Planner',
    category: 'Financing',
    tags: ['budget', 'finance'],
    prompt: 'Create a monthly budget plan based on income {income} and expenses {expenses}. Suggest optimizations and savings targets.',
    isPublic: 1,
    rating: 4.0,
  },
];

export const seedDbIfEmpty = async () => {
  const row = await dbGet('SELECT COUNT(*) as cnt FROM templates');
  if ((row?.cnt ?? 0) > 0) return;

  for (const t of defaultTemplates) {
    await dbRun(
      `INSERT INTO templates (id, name, category, tags, prompt, is_public, rating, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuid(),
        t.name,
        t.category,
        t.tags.join(','),
        t.prompt,
        t.isPublic,
        t.rating,
        new Date().toISOString(),
      ]
    );
  }
};
