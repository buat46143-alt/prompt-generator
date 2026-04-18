export default function Header({ onOpenHistory }) {
  return (
    <header className="bg-gradient-to-r from-space-900 via-space-800 to-primary-900 text-white shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Prompt Generator</h1>
            <p className="text-white/70 mt-1">
              Create structured, professional AI prompts in seconds
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={onOpenHistory}
            >
              History
            </button>
            <div className="hidden md:block">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
