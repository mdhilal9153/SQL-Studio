# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries with real-time execution and AI-powered hints.

---

## Project Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/mdhilal9153/SQL-Studio.git
cd cipherassingment
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env  # fill in your values
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `/backend` directory with the following:

```
MONGO_URI=your_mongodb_atlas_connection_string
DATABASE_URL=your_neon_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

---

## Technology Choices

| Technology | Reason |
|---|---|
| React.js | Component-based UI development |
| SCSS | Full styling control with variables, mixins, and nesting |
| Monaco Editor | Rich SQL editing experience |
| Node.js + Express | Fast and lightweight REST API |
| PostgreSQL (Neon) | Executes user queries safely inside transactions |
| MongoDB Atlas | Stores assignment data and solution queries |
| Gemini API | Provides AI hints without revealing the full solution |

---

## Known Issue — Neon PostgreSQL Cold Start

This project uses Neon's free tier for PostgreSQL. Neon automatically pauses the database after a period of inactivity. The server works perfectly fine when started, but if left unused for a while, subsequent requests may fail due to the database going idle.

If you encounter this, simply restart the server and it will work fine until the next period of inactivity.
