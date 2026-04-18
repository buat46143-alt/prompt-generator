const containsAny = (text, needles) => needles.some((n) => text.includes(n));

export const promptIntelligence = {
  detectType(userInput) {
    const t = (userInput || '').toLowerCase();

    if (containsAny(t, ['sql', 'database', 'schema', 'postgres', 'mysql'])) return 'Database';
    if (containsAny(t, ['review', 'refactor', 'bug', 'pull request', 'pr', 'code'])) return 'Code Review';
    if (containsAny(t, ['analyze', 'analysis', 'dataset', 'csv', 'insight', 'metrics'])) return 'Data Analysis';
    if (containsAny(t, ['story', 'novel', 'poem', 'creative', 'character'])) return 'Creative Writing';
    if (containsAny(t, ['lesson', 'teach', 'student', 'curriculum', 'quiz'])) return 'Education';
    if (containsAny(t, ['invoice', 'budget', 'financ', 'expense', 'revenue'])) return 'Financing';
    if (containsAny(t, ['email', 'proposal', 'client', 'stakeholder', 'strategy'])) return 'Business';
    return 'Content Writing';
  },

  detectTone(userInput) {
    const t = (userInput || '').toLowerCase();
    if (containsAny(t, ['angry', 'furious', 'hate', 'annoyed'])) return 'Aggressive';
    if (containsAny(t, ['sad', 'depressed', 'upset', 'disappointed'])) return 'Sad';
    if (containsAny(t, ['excited', 'amazing', 'great', 'happy'])) return 'Positive';
    return 'Neutral';
  },

  suggestions(userInput) {
    const suggestions = [];
    const len = (userInput || '').trim().length;

    if (len < 40) {
      suggestions.push('Add more context: target audience, constraints, and expected output format.');
    }

    if (!/(format|structure|output)/i.test(userInput || '')) {
      suggestions.push('Specify the output format (e.g., bullet points, JSON, table) and length.');
    }

    if (!/(examples?|sample)/i.test(userInput || '')) {
      suggestions.push('Provide 1–2 examples of desired output to improve consistency.');
    }

    suggestions.push('Include constraints (do/don\'t), tone, and success criteria.');

    return suggestions;
  },

  autocompleteHints(userInput) {
    const t = (userInput || '').toLowerCase();
    const hints = [];

    if (t.includes('youtube')) hints.push('Add: video length, hook style, CTA, target audience, and tone.');
    if (t.includes('resume') || t.includes('cv')) hints.push('Add: role, seniority, achievements, and keywords.');
    if (t.includes('sql')) hints.push('Add: DB engine, schema, and expected result columns.');

    return hints;
  },
};
