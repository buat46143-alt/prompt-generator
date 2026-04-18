import { useState } from 'react';

export default function PromptResult({ prompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!prompt) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Generated Prompt</h2>
        <button
          onClick={handleCopy}
          className="btn-secondary flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <pre className="whitespace-pre-wrap text-sm text-white/80 font-mono">
          {prompt}
        </pre>
      </div>

      <div className="mt-4 bg-primary-500/10 border border-primary-400/30 rounded-lg p-4">
        <p className="text-sm text-white/80">
          <strong>Tip:</strong> Copy this prompt and use it with your preferred AI assistant to get structured, high-quality responses.
        </p>
      </div>
    </div>
  );
}
