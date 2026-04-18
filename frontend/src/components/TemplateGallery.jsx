import { useEffect, useMemo, useState } from 'react';
import { apiV2 } from '../services/apiV2';

const CATEGORIES = [
  'Content Writing',
  'Code Review',
  'Data Analysis',
  'Creative Writing',
  'Business',
  'Education',
  'Database',
  'Financing',
];

export default function TemplateGallery({ onUseTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category && t.category !== category) return false;
      if (!q) return true;
      const tags = (t.tags || []).join(' ').toLowerCase();
      return (
        (t.name || '').toLowerCase().includes(q) ||
        (t.prompt || '').toLowerCase().includes(q) ||
        tags.includes(q)
      );
    });
  }, [templates, query, category]);

  const [showCreate, setShowCreate] = useState(false);
  const [newTpl, setNewTpl] = useState({ name: '', category: 'Content Writing', tags: '', prompt: '' });

  const refresh = async () => {
    const res = await apiV2.templates.list();
    setTemplates(res.data);
  };

  // initial load
  useEffect(() => {
    refresh();
  }, []);

  const saveNew = async () => {
    if (!newTpl.name.trim() || !newTpl.prompt.trim()) return;
    await apiV2.templates.upsert({
      name: newTpl.name.trim(),
      category: newTpl.category,
      tags: newTpl.tags
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
      prompt: newTpl.prompt,
      isPublic: false,
    });
    await refresh();
    setShowCreate(false);
    setNewTpl({ name: '', category: 'Content Writing', tags: '', prompt: '' });
  };

  const rate = async (id, rating) => {
    await apiV2.templates.rate({ templateId: id, rating });
    await refresh();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Template Library</h2>
          <p className="text-sm text-white/70">Pick a template, preview it, and apply to your prompt input.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Close' : 'Create Template'}
        </button>
      </div>

      {showCreate && (
        <div className="border border-white/10 rounded-lg p-4 mb-6 bg-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Template name"
              value={newTpl.name}
              onChange={(e) => setNewTpl((p) => ({ ...p, name: e.target.value }))}
            />
            <select
              className="select-field"
              value={newTpl.category}
              onChange={(e) => setNewTpl((p) => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <input
            className="input-field mt-3"
            placeholder="Tags (comma separated)"
            value={newTpl.tags}
            onChange={(e) => setNewTpl((p) => ({ ...p, tags: e.target.value }))}
          />
          <textarea
            className="input-field mt-3 min-h-32"
            placeholder="Template prompt (use placeholders like {topic}, {code}, {context})"
            value={newTpl.prompt}
            onChange={(e) => setNewTpl((p) => ({ ...p, prompt: e.target.value }))}
          />
          <div className="flex gap-2 mt-3">
            <button type="button" className="btn-primary" onClick={saveNew}>
              Save
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input
          className="input-field"
          placeholder="Search templates by name, tag, or content"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-white/70">No templates found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="border border-white/10 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                  <div className="text-xs text-white/60">{t.category}</div>
                  <div className="text-xs text-white/60 mt-1">
                    Tags: {(t.tags || []).length ? (t.tags || []).join(', ') : '-'}
                  </div>
                </div>
                <div className="text-xs text-white/70 whitespace-nowrap">
                  Rating: {t.rating ?? '—'}
                </div>
              </div>

              <div className="mt-3 bg-white/5 border border-white/10 rounded p-3">
                <pre className="text-xs whitespace-pre-wrap text-white/80 font-mono">
                  {(t.prompt || '').slice(0, 300)}{t.prompt && t.prompt.length > 300 ? '…' : ''}
                </pre>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <button type="button" className="btn-primary" onClick={() => onUseTemplate(t.prompt)}>
                  Use
                </button>

                {t.isPublic && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/60">Rate:</span>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className="btn-secondary px-2 py-1"
                        onClick={() => rate(t.id, r)}
                        title={`Rate ${r}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {!t.isPublic && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={async () => {
                      if (confirm('Delete this custom template?')) {
                        await apiV2.templates.remove(t.id);
                        await refresh();
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
