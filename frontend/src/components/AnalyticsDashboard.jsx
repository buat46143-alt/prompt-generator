import { useEffect, useMemo, useState } from 'react';
import { analytics } from '../services/analytics';
import { apiV2 } from '../services/apiV2';

const currency = (n) => {
  if (n == null) return '—';
  return `$${n.toFixed(4)}`;
};

export default function AnalyticsDashboard() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    apiV2.history
      .list({ limit: 5000 })
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, []);

  const summary = useMemo(() => {
    return analytics.buildSummary({ items });
  }, [items]);

  const topProviders = Object.entries(summary.byProvider)
    .sort((a, b) => b[1] - a[1]);

  const trends = Object.entries(summary.promptsByDay)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const costs = Object.entries(summary.providerCosts)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>
        <p className="text-sm text-white/70">
          Basic analytics based on local prompt history. Cost estimates use a rough token heuristic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <div className="text-xs text-white/60">Total prompts</div>
          <div className="text-3xl font-semibold text-white">{summary.totalPrompts}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-white/60">Avg generation time</div>
          <div className="text-2xl font-semibold text-white">{summary.avgGenerationMs ?? 'Not tracked yet'}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-white/60">Success rate</div>
          <div className="text-2xl font-semibold text-white">{summary.successRate ?? 'Not tracked yet'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="font-semibold text-white mb-2">Popular providers</h3>
          <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-2 text-white/80">Provider</th>
                  <th className="text-right p-2 text-white/80">Count</th>
                </tr>
              </thead>
              <tbody>
                {topProviders.map(([p, c]) => (
                  <tr key={p} className="border-t border-white/10">
                    <td className="p-2 text-white/80">{p}</td>
                    <td className="p-2 text-right text-white/80">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-2">Estimated costs (USD)</h3>
          <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-2 text-white/80">Provider</th>
                  <th className="text-right p-2 text-white/80">Cost</th>
                </tr>
              </thead>
              <tbody>
                {costs.map(([p, cost]) => (
                  <tr key={p} className="border-t border-white/10">
                    <td className="p-2 text-white/80">{p}</td>
                    <td className="p-2 text-right text-white/80">{currency(cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-white mb-2">Usage trend (by day)</h3>
        <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-2 text-white/80">Date</th>
                <th className="text-right p-2 text-white/80">Prompts</th>
              </tr>
            </thead>
            <tbody>
              {trends.map(([day, count]) => (
                <tr key={day} className="border-t border-white/10">
                  <td className="p-2 text-white/80">{day}</td>
                  <td className="p-2 text-right text-white/80">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
