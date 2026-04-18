import { useEffect, useMemo, useState } from 'react';
import { analytics } from '../services/analytics';
import { apiV2 } from '../services/apiV2';
import { migrateLocalToDb } from '../services/migrateLocalToDb';

const downloadFile = ({ content, filename, mime }) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function HistorySidebar({
  open,
  onClose,
  onSelectHistoryItem,
  onEditFromHistory,
}) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const refresh = async () => {
    const res = await apiV2.history.list({
      provider: provider || undefined,
      q: query || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: 500,
    });
    setItems(res.data);
  };

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, provider, dateFrom, dateTo]);

  const providers = useMemo(() => {
    const set = new Set(items.map((x) => x.provider));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toMs = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1 : null;

    return items.filter((x) => {
      if (provider && x.provider !== provider) return false;
      const ts = new Date(x.createdAt).getTime();
      if (fromMs != null && ts < fromMs) return false;
      if (toMs != null && ts > toMs) return false;

      if (!q) return true;
      return (
        (x.userInput || '').toLowerCase().includes(q) ||
        (x.generatedPrompt || '').toLowerCase().includes(q) ||
        (x.model || '').toLowerCase().includes(q)
      );
    });
  }, [items, query, provider, dateFrom, dateTo]);

  const handleExport = (format) => {
    const { content, filename, mime } = analytics.exportHistory(format, items);
    downloadFile({ content, filename, mime });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-space-800 text-white shadow-xl flex flex-col border-l border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Prompt History</h2>
            <p className="text-xs text-white/60">Stored in backend SQLite (this device)</p>
          </div>
          <button className="btn-secondary" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="p-4 space-y-3 border-b border-white/10">
          <input
            className="input-field"
            placeholder="Search keyword, model, prompt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select className="select-field" value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="">All providers</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button type="button" className="btn-secondary w-full" onClick={() => { setProvider(''); setQuery(''); setDateFrom(''); setDateTo(''); }}>
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="input-field"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              className="input-field"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                if (!confirm('Migrate localStorage history/templates to SQLite DB?')) return;
                const h = await migrateLocalToDb.migrateHistory();
                const t = await migrateLocalToDb.migrateTemplates();
                migrateLocalToDb.clearLocal();
                alert(`Migration done. History: ${h.migrated}, Templates: ${t.migrated}`);
                await refresh();
              }}
            >
              Migrate from localStorage
            </button>
            <button type="button" className="btn-secondary" onClick={() => handleExport('json')}>Export JSON</button>
            <button type="button" className="btn-secondary" onClick={() => handleExport('txt')}>Export TXT</button>
            <button type="button" className="btn-secondary" onClick={() => handleExport('csv')}>Export CSV</button>
            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                if (confirm('Clear all history in DB?')) {
                  await apiV2.history.clear();
                  await refresh();
                }
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-white/70">No history items match your filters.</div>
          ) : (
            <ul className="divide-y">
              {filtered.map((x) => (
                <li key={x.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-white/60">
                        {new Date(x.createdAt).toLocaleString()} • {x.provider} • {x.model}
                      </div>
                      <div className="text-sm font-medium text-white truncate">
                        {(x.userInput || '').slice(0, 120) || '(no input)'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onSelectHistoryItem(x)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onEditFromHistory(x)}
                      >
                        Edit/Regenerate
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={async () => {
                          await apiV2.history.remove(x.id);
                          await refresh();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
