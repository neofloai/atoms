# Atoms Prototype

A Neoflo Atoms prototype: Vite, TypeScript, React Router and oxlint, with UI from [`@neofloai/atoms`](https://atoms.neoflo.ai). It has no backend and needs no network. Sample data lives in each feature's `mocks/` folder and is held in React state.

```bash
npm install
npm run dev        # http://localhost:5173
```

What you change in the app carries across screens: approve an invoice and the total on the home page drops. Reload the page and everything starts again from the sample data, so the demo can be reset before the next run.

## Before you share it

```bash
npm run check      # typecheck and lint
npm run build
```

Then click through every screen. Every control should land somewhere.

## How it is built

The structure and the rules for working in it are in [AGENTS.md](AGENTS.md): every file sits in one of four layers (`app → pages → features → shared`), each layer imports only from the ones below it, and oxlint fails the check when a boundary is crossed or something reaches for the network. AI agents read the same file, through `CLAUDE.md` and `AGENTS.md`.

`features/invoices` is the worked example: its records in `model/`, its sample data in `mocks/`, the provider that holds it in `state/`, and its table in `components/`. Copy its shape for each new feature, then delete it, `pages/invoices`, `pages/home`'s use of it, its provider in `app/providers/AppProviders.tsx` and its row in `app/layout/navigation.ts` once the prototype has its own.

## When it becomes a real project

Start the project from the full Atoms React template (`start_project` with purpose `new-project`) and carry each feature's `model/`, `mocks/` and `components/` across unchanged. That template's `AGENTS.md` says how the data moves to TanStack Query and a real API.
