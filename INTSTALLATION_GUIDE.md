# Panduan Instalasi dan Penggunaan Prompt Generator

## Langkah 1: Persiapan

Pastikan komputer Anda sudah terinstal:
- Node.js versi 18 atau lebih tinggi
- npm (biasanya sudah terinstall bersama Node.js)

Cek versi Node.js:
```bash
node --version
npm --version
```

## Langkah 2: Ekstrak dan Setup Project

1. Ekstrak folder `prompt-generator` ke lokasi yang Anda inginkan

2. Buka terminal/command prompt

## Langkah 3: Setup Backend

1. Masuk ke folder backend:
```bash
cd prompt-generator/backend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file .env (copy dari .env.example):
```bash
cp .env.example .env
```

Atau di Windows:
```bash
copy .env.example .env
```

4. Jalankan server backend:
```bash
npm start
```

Atau untuk development mode dengan auto-reload:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Langkah 4: Setup Frontend

1. Buka terminal baru (jangan tutup terminal backend)

2. Masuk ke folder frontend:
```bash
cd prompt-generator/frontend
```

3. Install dependencies:
```bash
npm install
```

4. Buat file .env (copy dari .env.example):
```bash
cp .env.example .env
```

Atau di Windows:
```bash
copy .env.example .env
```

5. Jalankan aplikasi frontend:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Langkah 5: Akses Aplikasi

1. Buka browser (Chrome, Firefox, Edge, Safari)
2. Akses `http://localhost:5173`
3. Aplikasi sudah siap digunakan!

## Cara Menggunakan Aplikasi

### 1. Pilih AI Provider
Klik dropdown "AI Provider" dan pilih salah satu:
- OpenAI
- Anthropic
- Google Gemini
- Grok
- OpenRouter
- Mistral
- Ollama

### 2. Pilih Model
Setelah memilih provider, dropdown "Model" akan muncul.
Pilih model yang ingin Anda gunakan.

### 3. Masukkan API Key
- Untuk semua provider kecuali Ollama, Anda perlu API key
- Dapatkan API key dari website masing-masing provider
- API key TIDAK disimpan, hanya digunakan untuk request saat itu

### 4. Masukkan Kebutuhan Prompt
Jelaskan prompt apa yang Anda butuhkan, contoh:
"Saya ingin sebuah prompt untuk membuat konten YouTube Shorts faceless dengan tema psikologi"

### 5. Generate
Klik tombol "Generate Prompt" dan tunggu beberapa detik.

### 6. Copy Prompt
Setelah prompt ter-generate, klik tombol "Copy" untuk menyalin prompt tersebut.

## Mendapatkan API Key

### OpenAI
1. Kunjungi https://platform.openai.com/api-keys
2. Login atau daftar akun
3. Klik "Create new secret key"
4. Copy dan simpan API key

### Anthropic (Claude)
1. Kunjungi https://console.anthropic.com/
2. Login atau daftar akun
3. Buka menu API Keys
4. Generate dan copy API key

### Google Gemini
1. Kunjungi https://makersuite.google.com/app/apikey
2. Login dengan Google account
3. Klik "Create API Key"
4. Copy API key

### Grok
1. Kunjungi https://x.ai/
2. Login atau daftar akun
3. Generate API key
4. Copy dan simpan

### OpenRouter
1. Kunjungi https://openrouter.ai/keys
2. Login atau daftar akun
3. Generate API key
4. Copy dan simpan

### Mistral
1. Kunjungi https://console.mistral.ai/
2. Login atau daftar akun
3. Buka API Keys section
4. Generate dan copy API key

### Ollama (Local)
Ollama berjalan di komputer lokal, tidak perlu API key:
1. Download Ollama dari https://ollama.ai/
2. Install Ollama
3. Jalankan command: `ollama serve`
4. Download model: `ollama pull llama2` (atau model lain)
5. Model siap digunakan

## Troubleshooting

### Error: "Cannot GET /api/prompt/providers"
- Pastikan backend server sudah berjalan
- Check terminal backend untuk error messages
- Restart backend server

### Error: "Failed to fetch providers"
- Check koneksi internet
- Pastikan port 5000 tidak digunakan aplikasi lain
- Check firewall settings

### Error: "Invalid API Key"
- Pastikan API key yang dimasukkan benar
- Check apakah API key masih aktif
- Untuk Ollama, pastikan Ollama server sedang berjalan

### Port Already in Use
Jika port 5000 atau 5173 sudah digunakan:

Backend (edit backend/.env):
```
PORT=5001
```

Frontend (edit frontend/vite.config.js):
```javascript
server: {
  port: 5174
}
```

### CORS Error
Jika ada CORS error, pastikan backend dan frontend berjalan di:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Tips Penggunaan

1. Mulai dengan prompt sederhana untuk testing
2. Model yang lebih besar (seperti GPT-4, Claude Opus) lebih lambat tapi hasilnya lebih baik
3. Model kecil (GPT-3.5, Claude Haiku) lebih cepat dan murah
4. Untuk testing, gunakan Ollama (gratis dan local)
5. Simpan prompt hasil generate untuk digunakan kembali
6. Jangan share API key Anda dengan orang lain

## Production Deployment

Untuk deploy ke production:

### Backend
1. Setup environment variables yang proper
2. Gunakan process manager seperti PM2
3. Setup reverse proxy dengan Nginx
4. Enable HTTPS dengan SSL certificate
5. Set CORS origin ke domain frontend

### Frontend
1. Build production:
```bash
npm run build
```
2. Deploy folder `dist` ke hosting (Vercel, Netlify, dll)
3. Update environment variable `VITE_API_URL` ke backend URL production

## Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi README.md
2. Lihat console browser untuk error messages
3. Check terminal backend untuk server errors
4. Pastikan semua dependencies terinstall dengan benar
