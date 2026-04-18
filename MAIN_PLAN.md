# Ringkasan Struktur Aplikasi Prompt Generator

## Overview
Aplikasi fullstack untuk generate prompt AI terstruktur dengan dukungan 7 AI providers.

## Teknologi yang Digunakan

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Web framework
- **Axios**: HTTP client untuk API calls
- **dotenv**: Environment variables management
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI library
- **Vite**: Build tool dan dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client

## API Endpoints

### GET /api/prompt/providers
Mendapatkan list semua providers dan model mereka.

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "openai",
      "name": "OpenAI",
      "models": ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"]
    }
  ]
}
```

### POST /api/prompt/generate
Generate prompt berdasarkan input user.

Request Body:
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "apiKey": "sk-...",
  "userInput": "Saya ingin prompt untuk..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "generatedPrompt": "**Role**\n...",
    "provider": "openai",
    "model": "gpt-4",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## File-File Penting

### Backend

#### 1. config/aiProviders.js
- Berisi konfigurasi semua AI providers (7 providers)
- Endpoint API untuk setiap provider
- List model untuk setiap provider
- Headers yang diperlukan untuk auth
- Template prompt terstruktur

#### 2. services/aiService.js
- Method untuk call setiap provider
- Handling response dari berbagai format API
- Error handling untuk setiap provider
- Format request yang berbeda-beda per provider

#### 3. controllers/promptController.js
- Handle request dari frontend
- Validasi input
- Call service untuk generate prompt
- Format response ke frontend

#### 4. routes/promptRoutes.js
- Define endpoint /generate dan /providers
- Connect route ke controller

#### 5. server.js
- Setup Express app
- Configure middleware (CORS, JSON parser)
- Mount routes
- Start server

### Frontend

#### 1. components/PromptForm.jsx
- Form input utama
- Dropdown provider dan model
- Input API key
- Textarea untuk user input
- Handle submit dan loading state

#### 2. components/PromptResult.jsx
- Display hasil prompt yang di-generate
- Copy to clipboard functionality
- Formatted display dengan syntax highlighting

#### 3. components/Header.jsx
- Header dengan branding
- Navigation (jika ada)

#### 4. components/Footer.jsx
- Footer dengan informasi
- List supported providers

#### 5. services/api.js
- Axios instance dengan base URL
- Method getProviders()
- Method generatePrompt()
- Error handling

#### 6. App.jsx
- Main component
- State management untuk generated prompt
- Layout aplikasi
- Integration semua components

## Flow Aplikasi

1. **User membuka aplikasi**
   - Frontend fetch list providers dari backend
   - Display dropdown providers dan models

2. **User memilih provider dan model**
   - Frontend update state
   - Display input API key (kecuali Ollama)

3. **User mengisi kebutuhan prompt**
   - Input text di textarea
   - Describe prompt yang diinginkan

4. **User klik Generate**
   - Frontend kirim request ke backend
   - Backend terima request dan validasi

5. **Backend process request**
   - Ambil konfigurasi provider dari config
   - Call method service sesuai provider
   - Service format request sesuai API provider
   - Service kirim request ke AI provider
   - AI provider return response
   - Service extract text dari response
   - Controller return ke frontend

6. **Frontend terima response**
   - Display hasil prompt
   - Enable copy button
   - User bisa copy prompt

## Security Features

1. **API Key Handling**
   - API key tidak disimpan di database
   - Tidak di-log di server
   - Hanya digunakan untuk request saat itu
   - Transmitted via HTTPS (production)

2. **CORS**
   - Configured untuk development
   - Restrict origin di production

3. **Input Validation**
   - Validasi required fields
   - Validasi provider dan model valid
   - Sanitize user input

4. **Error Handling**
   - Tidak expose sensitive info di error message
   - Generic error message ke user
   - Detailed log di server console

## Fitur-Fitur Utama

### 1. Multi-Provider Support
- 7 AI providers terintegrasi
- Easy to add new providers
- Consistent interface untuk semua providers

### 2. Dynamic Model Selection
- Model list update otomatis per provider
- No hardcoded default
- Support semua model yang tersedia

### 3. Structured Prompt Generation
- Follow best practice prompt engineering
- 7 section architecture
- Consistent format

### 4. User-Friendly Interface
- Clean, modern design
- Responsive layout
- Clear instructions
- Real-time feedback

### 5. Copy Functionality
- One-click copy
- Visual confirmation
- Formatted output

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Development Commands

### Backend
```bash
npm install          # Install dependencies
npm start           # Start server
npm run dev         # Start with nodemon (auto-reload)
```

### Frontend
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Testing Checklist

- [ ] Backend server starts tanpa error
- [ ] Frontend server starts tanpa error
- [ ] GET /api/prompt/providers return list providers
- [ ] Dropdown providers terisi
- [ ] Dropdown models terisi setelah pilih provider
- [ ] Input API key muncul (kecuali Ollama)
- [ ] Form validation bekerja
- [ ] Generate prompt berhasil untuk setiap provider
- [ ] Copy button bekerja
- [ ] Error handling bekerja
- [ ] Responsive di mobile

## Extensibility

Aplikasi ini mudah dikembangkan:

### Menambah Provider Baru
1. Tambah config di `config/aiProviders.js`
2. Tambah method di `services/aiService.js`
3. Update switch case di service

### Menambah Fitur
- History: Tambah database dan state management
- User accounts: Implement auth system
- Template library: Save dan manage templates
- Batch generation: Generate multiple prompts

### Customization
- Ubah prompt template di config
- Tambah styling di Tailwind
- Modify architecture sections
- Add new components

## Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "axios": "^1.6.0"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8"
}
```
