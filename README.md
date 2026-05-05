# One More Step

A full-stack job application tracker with a Kanban board, OAuth login, and AI-powered email parsing.

**Live demo:** _add your Vercel URL here_

---

## Features

- **Kanban board** — drag cards across 6 stages: Wishlist → Applied → Phone Screen → Interview → Offer → Rejected
- **AI email parsing** — paste a job confirmation email and AI auto-fills company, role, date, and URL
- **List view** — sortable table of all applications
- **Stats dashboard** — response rate, funnel breakdown by stage
- **OAuth login** — GitHub and Google via NextAuth v5

---

## Architecture

```
Browser
  │
  ├─ Next.js 16 App Router (Vercel)
  │     ├─ app/(dashboard)/page.tsx       — Kanban board (server component)
  │     ├─ app/(dashboard)/list/page.tsx  — Table view
  │     ├─ app/(dashboard)/stats/page.tsx — Stats
  │     ├─ app/api/applications/          — CRUD route handlers
  │     └─ app/api/parse-email/           — AI parsing endpoint
  │
  ├─ NextAuth v5 (Auth.js)
  │     ├─ proxy.ts                       — Edge-compatible auth check
  │     └─ auth.ts                        — Full config with Prisma adapter
  │
  ├─ Prisma 7 + @prisma/adapter-pg        — Type-safe ORM
  │
  └─ Neon (serverless PostgreSQL)
```

### Key decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Auth strategy | NextAuth v5 + Prisma adapter | Session stored in DB for persistence |
| Proxy split | `auth.config.ts` (Edge) + `auth.ts` (Node) | Prisma uses `node:path` — incompatible with Edge Runtime |
| Drag-and-drop | `@dnd-kit/core` | Tree-shakeable, works with React 19 |
| AI parsing | `lib/ai.ts` wrapper | Isolated behind a single function — easy to swap models |
| DB adapter | `@prisma/adapter-pg` | Prisma 7 removed inline `url` from schema; requires driver adapter |

### Email parsing flow

```
User pastes email
  → POST /api/parse-email
  → AI extracts {company, role, appliedDate, jobUrl, notes}
  → Pre-fills ApplicationForm
  → User reviews and saves
  → POST /api/applications → Prisma → Neon
```

---

## Local setup

```bash
# 1. Clone and install
git clone <your-repo>
cd one-more-step
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, OAuth IDs, ANTHROPIC_API_KEY

# 3. Push schema to your database
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Run
npm run dev
```

### Environment variables

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | [Neon](https://neon.tech) → new project → connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub → Settings → Developer settings → OAuth Apps |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `ANTHROPIC_API_KEY` | AI provider console |

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all env vars in Vercel project settings
4. Deploy — done

---

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [NextAuth v5](https://authjs.dev)
- [Prisma 7](https://prisma.io) + [Neon](https://neon.tech)
- [@dnd-kit](https://dndkit.com)
- [Tailwind CSS v4](https://tailwindcss.com)
