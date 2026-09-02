# FitCheck — Frontend

React + Vite frontend for the FitCheck vintage marketplace.

## Tech Stack
- React 19, TypeScript
- Vite + Tailwind CSS v4
- Framer Motion, Lucide React
- Vitest + Testing Library

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local — set VITE_API_URL to your backend URL
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend deployment URL (e.g. https://fitcheck-backend.vercel.app) |
| `VITE_ADMIN_EMAIL` | Email address with admin dashboard access |

## Deployment (Vercel)

1. Push this folder as a new GitHub repo
2. Import into Vercel
3. Set environment variables in Vercel dashboard
4. Deploy — Vercel auto-detects Vite

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests |
| `npm run lint` | TypeScript type check |
