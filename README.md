# Prompt Generator

A fullstack application to generate structured AI prompts using multiple AI providers.

## Features

- Multiple AI Provider Support: OpenAI, Anthropic, Google Gemini, Grok, OpenRouter, Mistral, and Ollama
- **Dynamic model loading**: Models fetched directly from each provider's API based on your valid API key
- **Ollama integration**: Automatically detects models installed on your local device
- Structured prompt generation following best practices
- Secure API key handling (never stored)
- Clean, modern UI built with React and Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- Axios for API calls

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Usage

1. Open your browser and go to `http://localhost:5173`
2. Select an AI provider from the dropdown
3. Enter your API key (required for all providers except Ollama)
4. Click "Load Models" button to fetch available models from the provider
5. Select a model from the dynamically loaded list
6. Describe what kind of prompt you need
7. Click "Generate Prompt"
8. Copy the generated structured prompt

### For Ollama Users
- Models are automatically loaded when you select Ollama as provider
- Make sure Ollama is running: `ollama serve`
- Install models first: `ollama pull llama2` (or other models)
- Only installed models will appear in the dropdown

## API Providers Configuration

### OpenAI
- Get API key from: https://platform.openai.com/api-keys
- Models: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo

### Anthropic
- Get API key from: https://console.anthropic.com/
- Models: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

### Google Gemini
- Get API key from: https://makersuite.google.com/app/apikey
- Models: Gemini Pro, Gemini 1.5 Pro, Gemini 1.5 Flash

### Grok
- Get API key from: https://x.ai/
- Models: Grok Beta, Grok Vision Beta

### OpenRouter
- Get API key from: https://openrouter.ai/keys
- Models: Multiple models from various providers

### Mistral
- Get API key from: https://console.mistral.ai/
- Models: Mistral Large, Mistral Medium, Mistral Small

### Ollama
- Install Ollama locally: https://ollama.ai/
- Run `ollama serve` before using
- No API key required
- Models: Llama2, Mistral, CodeLlama, Neural Chat, Phi

## Prompt Architecture

The application generates prompts following this structure:

1. Role: Define expert persona and communication style
2. Task: Specify objectives and requirements
3. Context: Provide relevant background
4. Examples: Show desired output format
5. Output: Define expected results
6. Constraints: Set boundaries and guidelines
7. Instructions: Guide the process

## Security Notes

- API keys are transmitted securely but never stored
- All API calls are made server-side
- CORS is configured for local development
- For production, add proper environment variables and security headers

## Development

### Backend Structure
```
backend/
â”œâ”€â”€ config/         # AI provider configurations
â”œâ”€â”€ controllers/    # Request handlers
â”œâ”€â”€ routes/         # API routes
â”œâ”€â”€ services/       # Business logic
â””â”€â”€ server.js       # Entry point
```

### Frontend Structure
```
frontend/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/ # React components
â”‚   â”œâ”€â”€ services/   # API client
â”‚   â”œâ”€â”€ App.jsx     # Main component
â”‚   â””â”€â”€ main.jsx    # Entry point
```

## Contributing

Feel free to submit issues and pull requests.

## License

MIT License
