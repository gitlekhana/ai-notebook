# ◈ NoteAI — AI-Powered Notebook

A full-stack notebook application with AI features: ask questions about your notes, generate summaries, and enhance note quality — powered by OpenRouter AI.

---

## 🗂 Folder Structure

```
ai-notebook/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   ├── .env.example       # Copy to .env and fill in values
│   └── .gitignore
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── NoteCard.js       # Individual note display
    │   │   ├── NoteEditor.js     # Create/edit note modal
    │   │   ├── AIPanel.js        # Ask & Summarize AI features
    │   │   └── EnhanceModal.js   # AI note enhancement diff view
    │   ├── hooks/
    │   │   └── useNotes.js       # Notes state management hook
    │   ├── utils/
    │   │   └── api.js            # API helper functions
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── package.json
    ├── .env.example
    └── .gitignore
```

---

## ✅ Features

| Feature | Description |
|---|---|
| **Add / Edit / Delete Notes** | Full CRUD with title, content, and tags |
| **Search Notes** | Filter by title, content, or tags |
| **Select Notes** | Multi-select for targeted AI operations |
| **Ask AI** | Ask questions answered from your notes |
| **Summarize** | Generate structured summaries of notes |
| **Enhance Note** | AI rewrites a note for clarity and depth |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) account and API key (free tier available)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ai-notebook

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** — create `backend/.env`:
```env
OPENROUTER_API_KEY=sk-or-...your-key-here...
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Frontend** — create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Both Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # uses nodemon for hot reload
# OR: npm start

# Terminal 2 — Frontend
cd frontend
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| POST | `/api/ai/ask` | Ask a question about notes |
| POST | `/api/ai/summarize` | Summarize notes |
| POST | `/api/ai/enhance` | AI-enhance a note |
| GET | `/api/health` | Health check |

---

## ☁️ Deployment

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repo, select the `backend/` folder as root dir
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18+
5. Add Environment Variables:
   - `OPENROUTER_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL (after deploying frontend)
6. Deploy → copy the Render URL (e.g. `https://ai-notebook-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add Environment Variable:
   - `REACT_APP_API_URL` = your Render backend URL
5. Deploy → your app is live!

> **CORS Note**: After deploying, update `FRONTEND_URL` in Render's env vars to match your Vercel domain, then redeploy the backend.

---

## 🔑 Getting an OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to **Keys** → **Create Key**
3. Copy the key starting with `sk-or-...`
4. The app uses `openai/gpt-4o-mini` by default (very affordable). Change the `model` in `backend/server.js` to use any other model.

---

## 🧠 AI Model

Default: `openai/gpt-4o-mini` via OpenRouter.

To change the model, edit line in `backend/server.js`:
```js
model: "openai/gpt-4o-mini", // change to any OpenRouter model
```

Other good options:
- `anthropic/claude-3-haiku` — fast and smart
- `google/gemini-flash-1.5` — very cheap
- `meta-llama/llama-3-8b-instruct` — free tier available

---

## 📝 Notes on Storage

The backend currently uses **in-memory storage** — notes reset when the server restarts. For persistent storage, replace the `notes` array with:
- **SQLite**: Add `better-sqlite3` for lightweight local persistence
- **PostgreSQL**: Use `pg` or `prisma` on Render's free Postgres
- **MongoDB Atlas**: Use `mongoose` with a free cluster
