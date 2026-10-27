# Atoms App

A Neoflo Atoms React app: Vite, TypeScript, React Router, TanStack Query, oxlint and oxfmt, with UI from [`@neofloai/atoms`](https://atoms.neoflo.ai).

```bash
npm install
npm run dev        # http://localhost:5173
```

It runs on the mock data in each feature until `VITE_API_URL` is set. Copy `.env.example` to `.env.local` to configure it.

## Before you open a pull request

```bash
npm run check      # typecheck, lint, format check, tests (what CI runs)
npm run build
```

## How it is built

The structure and the rules for working in it are in [AGENTS.md](AGENTS.md): every file sits in one of four layers (`app → pages → features → shared`), each layer imports only from the ones below it, and oxlint fails the check when a boundary is crossed. Read it before adding a page or a feature. AI agents read the same file, through `CLAUDE.md` and `AGENTS.md`.

`features/invoices` is the worked example. Copy its shape for each new feature, then delete it, `pages/invoices`, `pages/home`'s use of it and its row in `app/layout/navigation.ts` once the app has its own.
