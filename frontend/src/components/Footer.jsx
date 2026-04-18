export default function Footer() {
  return (
    <footer className="bg-white/5 text-white/70 mt-auto border-t border-white/10">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-2">PromptMaker</h3>
            <p className="text-sm">
              Generate structured AI prompts using multiple providers
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-2">Supported Providers</h3>
            <ul className="text-sm space-y-1">
              <li>OpenAI</li>
              <li>Anthropic Claude</li>
              <li>Google Gemini</li>
              <li>Grok</li>
              <li>OpenRouter</li>
              <li>Mistral</li>
              <li>Ollama</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-2">Privacy</h3>
            <p className="text-sm">
              Your API keys are never stored. All requests are processed securely and temporarily.
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-6 pt-6 text-center text-sm">
          <p>&copy; 2024 Prompt Generator. Built with React and Node.js</p>
        </div>
      </div>
    </footer>
  );
}
