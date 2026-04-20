# ExamGen AI

Production-oriented full-stack app: **React (Vite) + Tailwind v4 + Framer Motion** frontend, **Node.js (Express) + Prisma + PostgreSQL** backend, **JWT auth** with **USER / ADMIN** roles, **AI-powered** exam generation (OpenAI / Gemini / local Ollama), **Swagger** API docs, and **glassmorphism / neumorphism** UI with **dark/light** theme.

## Folder structure

```
ExamGenAi/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # PostgreSQL schema (User, ExamSet)
│   ├── src/
│   │   ├── config/                # env validation, Swagger spec
│   │   ├── controllers/           # HTTP handlers
│   │   ├── dtos/                  # Zod request schemas
│   │   ├── middlewares/           # auth, errors, uploads
│   │   ├── repositories/          # Prisma data access
│   │   ├── routes/                # Route registration
│   │   ├── services/              # Business logic + OpenAI
│   │   ├── app.ts
│   │   └── index.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Layout, UI (shadcn-style), auth guard
│   │   ├── context/               # Auth + theme
│   │   ├── lib/                   # api client, cn()
│   │   ├── pages/                 # Landing, auth, dashboard, generator, CRUD, profile, 404
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css              # Tailwind v4 + glass utilities
│   ├── package.json
│   └── .env.example
├── docker-compose.yml             # Local PostgreSQL
└── README.md
```

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- **Local AI (Ollama)** OR **OpenAI/Gemini** API key (for AI generation)

**Note-grounded exams:** On the generator page you can upload **PDF, TXT, PPT, or PPTX** notes (or paste text). The API extracts text, merges it with optional pasted notes (up to ~100k characters sent to the model), and instructs the AI to base questions on that material. Legacy **JSON-only** `POST /api/exam-sets/generate` still works when no files are attached.

## Quick start

### 1. Database

**Option A — Docker**

```bash
docker compose up -d
```

**Option B — existing Postgres**  
Create a database (e.g. `examgenai`) and note the connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET (16+ chars), choose AI provider, CORS_ORIGIN

npm install
npx prisma generate
npx prisma db push
npm run dev
```

- API: `http://localhost:4000`
- Health: `GET http://localhost:4000/health`
- Swagger UI: `http://localhost:4000/api/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL: leave empty in dev (Vite proxies /api and /uploads)

npm install
npm run dev
```

- App: `http://localhost:5173`

### 4. First user

The **first registered user** is assigned the **ADMIN** role (handy for local demos). Later signups are **USER** by default.

## Database schema (Prisma)

| Model    | Fields |
|----------|--------|
| **User** | `id` (uuid), `email` (unique), `passwordHash`, `name`, `role` (`USER` \| `ADMIN`), `avatarUrl?`, timestamps |
| **ExamSet** | `id`, `userId` → User, `title`, `subject`, `topic`, `difficulty`, `questionCount`, `content` (text, Markdown), timestamps |

Indexes: `userId`, `createdAt` on `exam_sets`.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Liveness |
| GET | `/api/docs` | — | Swagger UI |
| POST | `/api/auth/register` | — | Register (first user = admin) |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/dashboard/stats` | JWT | User or admin stats |
| POST | `/api/exam-sets/generate` | JWT | AI-generate exam + save |
| GET | `/api/exam-sets` | JWT | List **my** exam sets (`page`, `limit`, `search`, `subject`) |
| GET | `/api/exam-sets/:id` | JWT | Get one (owner or admin) |
| PATCH | `/api/exam-sets/:id` | JWT | Update (owner or admin) |
| DELETE | `/api/exam-sets/:id` | JWT | Delete (owner or admin) |
| PATCH | `/api/users/me` | JWT | Update profile name |
| POST | `/api/users/me/avatar` | JWT | Multipart `avatar` image upload |
| GET | `/api/admin/exam-sets` | JWT **ADMIN** | List all exam sets (paginated) |

Responses are JSON: `{ success: true, data: ... }` or `{ success: false, error: "..." }`.

## Environment variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `4000`) |
| `DATABASE_URL` | PostgreSQL URL |
| `JWT_SECRET` | Min 16 characters |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `AI_PROVIDER` | Optional: `openai` \| `gemini` \| `ollama` (if set, forces provider) |
| `OPENAI_API_KEY` | OpenAI key (`sk-...`) |
| `GEMINI_API_KEY` | Google Gemini key (`AIza...` from [AI Studio](https://aistudio.google.com/apikey)) |
| `GEMINI_MODEL` | Optional, default `gemini-2.0-flash` |
| `OLLAMA_BASE_URL` | Local Ollama base URL (default `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | Local model name (e.g. `llama3.1:8b`, `qwen2.5:3b`) |

## Local AI setup (no installs): Mock AI mode

If you want the app to be fully functional **locally** without any API keys **and without installing model runtimes**, set:

```env
AI_PROVIDER=mock
```

The generator will create a structured Markdown exam grounded on detected keywords from your pasted/uploaded notes (demo-quality, but end-to-end functional).

## Local AI setup (Ollama)

1. Install Ollama: [ollama.com](https://ollama.com/)
2. Download a model (example):

```bash
ollama pull llama3.1:8b
```

3. Ensure Ollama is running, then in `backend/.env` set:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
```

Now the generator uses **local** AI with **no API keys**.
| `CORS_ORIGIN` | Allowed origin(s), comma-separated |

**Frontend (`frontend/.env`)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL; empty in dev uses Vite proxy |

## Production notes

- Run `npm run build` in both `frontend` and `backend`; start API with `node backend/dist/index.js` after `npm run build` in backend.
- Serve uploaded files from `/uploads` or move avatars to object storage.
- Set `VITE_API_URL` to your public API URL for production builds if the UI is not same-origin.
- Rotate `JWT_SECRET`, use TLS, and restrict `CORS_ORIGIN`.

## License

MIT (adjust as needed for your product).
