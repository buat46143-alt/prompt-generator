import { useMemo, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptForm from './components/PromptForm';
import PromptResult from './components/PromptResult';
import HistorySidebar from './components/HistorySidebar';
import TemplateGallery from './components/TemplateGallery';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { apiV2 } from './services/apiV2';
import './index.css';

function App() {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('generator');
  const [historyOpen, setHistoryOpen] = useState(false);

  // draft state so history can rehydrate form
  const [draft, setDraft] = useState({ provider: '', model: '', userInput: '' });

  const handlePromptGenerated = (prompt) => {
    setGeneratedPrompt(prompt);

    // Persist to DB history
    if (draft.provider && draft.model && draft.userInput) {
      apiV2.history.add({
        provider: draft.provider,
        model: draft.model,
        userInput: draft.userInput,
        generatedPrompt: prompt,
        success: true,
      }).catch(() => {
        // ignore persistence errors to avoid breaking UX
      });
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const tabs = useMemo(
    () => [
      { id: 'generator', label: 'Generator' },
      { id: 'templates', label: 'Templates' },
      { id: 'analytics', label: 'Analytics' },
    ],
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-white">
      <Header onOpenHistory={() => setHistoryOpen(true)} />

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectHistoryItem={(item) => {
          setGeneratedPrompt(item.generatedPrompt);
        }}
        onEditFromHistory={(item) => {
          setActiveTab('generator');
          setDraft({ provider: item.provider, model: item.model, userInput: item.userInput });
          setHistoryOpen(false);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
        }}
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={
                  activeTab === t.id
                    ? 'btn-primary'
                    : 'btn-secondary'
                }
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
            <button type="button" className="btn-secondary" onClick={() => setHistoryOpen(true)}>
              History
            </button>
          </div>

          {activeTab === 'generator' && (
            <>
              <div className="bg-black/5 rounded-lg shadow-md p-6 border border-blu/10">
                <h2 className="text-xl font-semibold text-white mb-2">How It Works</h2>
                <ol className="list-decimal list-inside space-y-2 text-white/80">
                  <li>Select your preferred AI provider from the dropdown</li>
                  <li>Load and choose the specific model you want to use</li>
                  <li>Enter your API key (never saved)</li>
                  <li>Describe what kind of prompt you need</li>
                  <li>Get a professionally structured prompt ready to use</li>
                </ol>
              </div>

              <PromptForm
                onPromptGenerated={handlePromptGenerated}
                initialDraft={draft}
                onDraftChange={(d) => setDraft((prev) => ({ ...prev, ...d }))}
              />

              {generatedPrompt && <PromptResult prompt={generatedPrompt} />}
            </>
          )}

          {activeTab === 'templates' && (
            <TemplateGallery
              onUseTemplate={(templateText) => {
                setActiveTab('generator');
                setDraft((prev) => ({ ...prev, userInput: templateText }));
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
              }}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
