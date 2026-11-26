`@neofloai/atoms/chat` is a React chat UI for agentic assistants. Point it at any backend that implements the **Neoflo chat standard** (schema v1, revision 1.3). You get streaming answers, chat history, human-in-the-loop decisions, tool activity, tables, charts and custom cards without building any of it yourself.

It's part of Atoms and built from Atoms components and tokens, so it looks like the rest of your Neoflo product in light and dark.

## What you get

- **A complete chat in one component.** `<AgenticChat>` renders the history panel, the thread and the composer.
- **An empty chat that invites the first question.** The greeting, the composer and the backend's suggested prompts sit in one column, each prompt with its icon. A prompt the user removes stays removed on that device.
- **Streaming that holds up in production.** It handles SSE over `fetch`, snapshot-based deltas, cancel, retry, idle timeouts and dropped connections.
- **Human-in-the-loop.** Approval and choice cards pause the turn, lock the composer, and resume with your decision.
- **12 built-in blocks.** Text, thinking, tool call, table, sources, approval, choice, error, artifact, image, plan and charts.
- **Your own cards.** `defineBlock` registers a card, and `actions.emit` routes clicks into your app.
- **Chat history.** Search, date groups, rename, archive and delete, all with optimistic updates.
- **Configurable local persistence.** Choose session, local, memory, off, or your own storage, partitioned per user.
- **Three levels of control.** Use the styled UI, swap parts through slots, or go fully headless with hooks and primitives.
- **One standard for every product.** Each backend describes itself through `GET /v1/chat/config`, so the same UI hides what a product doesn't support. A [conformance check](/chat/conformance) tells a backend team what's left to fix.

## Install

The chat ships inside Atoms, which installs straight from GitHub. It has no registry, needs no token, and follows semver through release tags:

```bash
npm install github:neofloai/atoms#semver:^4.3.0

# The chat's own dependencies — install them in the app that renders a chat
npm install react-markdown remark-gfm @radix-ui/react-slot

# Only if you use the chart blocks
npm install recharts
```

These are optional peer dependencies of Atoms, so an app without a chat never installs them, and an app without charts never installs Recharts.

Requirements:

- React 18.2 or 19.
- A `git` binary on machines that install it. `node:*-alpine` and `-slim` images don't ship one (`apk add --no-cache git`).
- Atoms builds itself on install, so don't run `npm ci --ignore-scripts`.

## Entry points

| Import | What it contains | Needs |
| --- | --- | --- |
| `@neofloai/atoms/chat` | `<AgenticChat>`, every UI part and block, the kit, and the headless engine: runtime, adapters, hooks, primitives, block registry and parsers | `react-markdown`, `remark-gfm`, `@radix-ui/react-slot` |
| `@neofloai/atoms/chat/core` | The framework-free engine and the standard's types — no React, so server code can import it | nothing |
| `@neofloai/atoms/chat/charts` | `chartBlock` (bar, line, area, donut) and the chart kit | `recharts` |
| `@neofloai/atoms/chat/mock` | An in-memory backend on the standard, with demo scenarios — no React | nothing |
| `@neofloai/atoms/chat/conformance` | The [backend conformance check](/chat/conformance), also the `atoms-chat-conformance` command — no React | nothing |

## Quick start

Mount `NeofloThemeProvider` once, give the chat a sized container, and hand it an adapter:

```tsx
import { NeofloThemeProvider } from '@neofloai/atoms';
import { AgenticChat, createRestAdapter } from '@neofloai/atoms/chat';
import { chartBlock } from '@neofloai/atoms/chat/charts';

// getAccessToken stands for your app's own token getter.
const adapter = createRestAdapter({
  baseUrl: 'https://api.example.com',
  headers: async () => ({ Authorization: `Bearer ${await getAccessToken()}` }),
});

export function App() {
  return (
    <NeofloThemeProvider>
      <div style={{ height: '100vh' }}>
        <AgenticChat adapter={adapter} blocks={[chartBlock]} />
      </div>
    </NeofloThemeProvider>
  );
}
```

That's the whole integration. The chat creates a conversation, shows the server's greeting and suggested prompts, streams answers, and keeps history.

## How it talks to your backend

`createRestAdapter` implements the endpoints of the chat standard:

| # | Call | Used for |
| --- | --- | --- |
| 0 | `GET /v1/chat/config` | What the backend supports: features, models, sources, limits. |
| 1 | `POST /v1/conversation` | New chat. The response supplies the greeting and suggested prompts. |
| 2 | `GET /v1/conversations` | The history panel |
| 3 | `GET /v1/conversations/{id}` | Opening a chat and its messages |
| 4 | `PATCH /v1/conversations/{id}` | Rename, archive, model, default sources |
| 5 | `DELETE /v1/conversations/{id}` | Delete |
| 6 | `POST /v1/conversations/{id}/messages` | Sending a turn, or resuming a HITL checkpoint. Streamed as SSE. |
| 7 | `POST /v1/conversations/{id}/messages/cancel` | The Stop button |

It reads all nine stream events (`message_start` through `error`), treats `snapshot` as a full overwrite, and ignores event types it doesn't know. A newer backend therefore never breaks an older UI. Identity comes only from your `headers` or the session cookie. The chat never puts user or tenant data in a payload, and never keeps a credential it was handed.

- **The config decides what shows.** The attach button, the scope picker, Archive and approval cards appear only when the backend's `capabilities` allow them. Model and source labels, the workflow catalog and the message length limit come from the config too. A backend without the endpoint (404) gets the defaults, or whatever you pass as `capabilities`.
- **Every message has a `client_message_id`.** A retry of a message the server never confirmed reuses it, so a flaky network or a double click never starts two replies. If the server already has it (409 `duplicate_message`), the chat reloads the conversation instead of showing an error.
- **Errors are read by code first.** `session_busy`, `rate_limited` (with a countdown), `connection_expired` (with Reconnect) and the rest each get the right action; a code the chat doesn't know falls back to its HTTP status. Each error keeps the server's `request_id` for bug reports.
- **Stop matches the backend.** With `cancel: "disconnect"` it closes the stream at once; with `"server"` it calls endpoint 7 first.

## Server rendering

The chat is plain React and works in any React app. If yours renders on the server:

- Nothing touches `window` or storage at import time or during server render. Persistence hydrates on the client.
- `@neofloai/atoms/chat/core`, `@neofloai/atoms/chat/mock` and `@neofloai/atoms/chat/conformance` contain no React, so server code (a route handler, a server action) can import them.
- Create the adapter and render `<AgenticChat>` from a client component — in the Next.js App Router, a file that starts with `'use client'`. An adapter holds functions, and functions can't be passed as props from a server component.

## Where to go next

- [Configuration](/chat/configuration): every option of `<AgenticChat>` and the REST adapter, driving the chat from your app, and adapting a backend that doesn't follow the standard.
- [Blocks](/chat/blocks): the built-in blocks an answer is made of.
- [Custom blocks](/chat/custom-blocks): your own cards with `defineBlock`.
- [Customizing the UI](/chat/customizing): slots, your own layout, composer controls and copy.
- [History and persistence](/chat/persistence): the history panel and what the chat remembers on the device.
- [Human-in-the-loop](/chat/hitl): approval and choice cards, and decision cards of your own.
- [Headless](/chat/headless): the provider, primitives, hooks and parsers with no styling.
- [Mock backend](/chat/mock): an in-memory backend for building UI, tests and demos.
- [Troubleshooting](/chat/troubleshooting): symptoms and their fixes.
- [Backend contract](/chat/backend-contract): the reference for backend teams — auth and credentials, the config, error codes, ordering rules and retries.
- [Block contracts](/chat/block-contracts): the payload of every block type.
- [Checking a backend](/chat/conformance): the conformance check, for CI.
- [Schema gaps](/chat/schema-gaps): what the standard still leaves open.
