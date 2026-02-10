# SubStream 🎬
A Web3 Video Streaming Platform powered by **Tempo Network**, featuring gasless subscriptions and Passkey authentication.

## 🚀 Features
- **Passkey Auth**: Passwordless login and registration via WebAuthn.
- **Gasless Subscriptions**: Automated recurring payments using AlphaUSD.
- **Premium Content**: Access-controlled video streaming based on on-chain status.
- **Dynamic UI**: Modern, responsive design with high-end aesthetics.

## 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Viem (Tempo SDK).
- **Backend**: Node.js, Express, Prisma (SQLite), PM2.
- **Blockchain**: Tempo Moderato Testnet (AlphaUSD).

## 📂 Project Structure
```text
sub-stream/
├── ui/         # React Frontend (Vite)
└── backend/    # Express API & Payment Cron Job
```

## ⚙️ Local Setup

### 1. Backend
```bash
cd backend
npm install
# Configure .env with your SERVER_PRIVATE_KEY
npx prisma db push
npm run dev # Running on port 3001
```

### 2. UI
```bash
cd ui
npm install
npm run dev # Running on port 5173
```

## 🌐 VPS Deployment

### Backend (PM2)
```bash
cd backend
npm run build
pm2 start ecosystem.config.js
```

### UI (Build)
1. Set `VITE_API_URL=https://api.yourdomain.xyz/substream` in `ui/.env.production`.
2. Run `npm run build`.
3. Deploy `dist/` folder to your web server (Nginx).

### Nginx Configuration
Add the following location block to your server config:
```nginx
location /substream/ {
    proxy_pass http://localhost:3001/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
}
```

## 📄 License
MIT
