<!-- Generated from src/project/ in neofloai/atoms. Edit it there, not here. -->

# Working in this project

This is a Neoflo Atoms prototype: Vite, TypeScript, React Router and oxlint, with UI from `@neofloai/atoms`. It has no backend and needs no network: sample data lives in each feature's `mocks/` and is held in React state, so a change made on one screen shows on every other and a reload resets it. Every Atoms app is laid out the same way, so anyone who has worked in one can work in any of them.

**These rules are not suggestions.** If you are an AI agent, follow every one of them exactly, on every change, without being reminded. When a request cannot be met without breaking one, stop and say which rule and why rather than working around it.

## Layout

```
src/
├── main.tsx              Mounts <App />. Nothing else goes here.
├── app/                  Composition root: wiring, never features.
│   ├── App.tsx
│   ├── providers/        NeofloThemeProvider, Snackbar, each feature's state.
│   ├── router/           Route table. Every page is lazy-loaded.
│   ├── layout/           The shell: rail, bar, <Outlet />, nav rows.
│   └── errors/           Route error boundary.
├── pages/                One folder per route. Thin: composes features.
│   └── <route>/<Route>Page.tsx
├── features/             One folder per business capability.
│   └── <feature>/        See the slice shape below.
└── shared/               Domain-free building blocks.
    ├── config/           paths.ts (every route).
    ├── lib/              Pure helpers: formatting, dates, maths.
    ├── ui/               Compositions of Atoms used by 2+ pages.
    └── hooks/            Domain-free hooks (useDebounce, …).
```

A feature is always the same shape:

```
features/<feature>/
├── index.ts              The public API. The only file outside code imports.
├── model/                Types and pure functions, including every change
│                         to the data. No React.
├── mocks/                Sample data in the real API's shape. Read only by state/.
├── state/                <Feature>Provider.tsx (React state seeded from the
│                         mocks), use<Feature>.ts (the hook), and the context
│                         they share.
└── components/           The feature's UI, built from Atoms components.
```

`features/invoices` is the worked example. Copy its shape for every new feature.

## Layers

Each layer imports only from the layers below it. oxlint fails the build on anything else.

| Layer | Owns | May import |
| --- | --- | --- |
| `src/app` | Providers (each feature's state among them), the router, the shell and the error boundary — the wiring that turns pages into an app. | `pages`, `features`, `shared` |
| `src/pages` | One component per route that lays out the screen and composes features. No business logic. | `features`, `shared` |
| `src/features` | A business capability end to end: its types, its sample data, the state that holds it and its UI. | `shared` |
| `src/shared` | Code with no domain knowledge: routes, formatting, and Atoms compositions used by more than one page. | nothing |

## Rules

### Structure

1. **Put every file in one of the four layers — `app`, `pages`, `features`, `shared` — in the folder this document names for it. Do not create new top-level folders under `src/` (no `src/components`, `src/utils`, `src/helpers`, `src/services`, `src/store`).**
   A second place for the same kind of code is how two engineers end up writing the same thing twice. One answer to "where does this go" is what keeps a codebase navigable at fifty features.
2. **Import only downwards: `app → pages → features → shared`. `shared` imports no layer; a feature imports only `shared`; a page imports features and `shared`.**
   Dependencies that point one way can be reasoned about, tested and deleted one layer at a time. A single upward import makes the bottom layer depend on everything above it. *Checked by oxlint.*
3. **Features never import other features. When two features need each other, compose them in a page; when they need the same code, move it to `shared` if it has no domain knowledge.**
   Features that import each other stop being separable — a change to one is a change to all of them, and none can be removed or rewritten alone. *Checked by oxlint.*
4. **Import a feature only through its `index.ts` (`@/features/invoices`), never a file inside it. Export from `index.ts` only what a page needs.**
   The index is the feature's contract. Everything behind it can be reorganised without breaking a caller — and because `package.json` declares the app free of side effects, a page that imports one hook from the index does not bundle the feature's table along with it. *Checked by oxlint.*
5. **Inside a feature, use relative imports (`../model/invoice`). Across folders, use the `@/` alias. Never `../../`.**
   The alias says which layer an import comes from at a glance, and it survives a file moving one folder deeper. *Checked by oxlint.*
6. **Keep `shared` free of business words. If code names an invoice, a vendor or a user role, it belongs to a feature.**
   `shared` is imported by everything, so domain logic there leaks into every feature and is owned by none of them.
7. **Promote code to `shared` on its second user, not its first. Until then it stays in the feature that has it.**
   An abstraction with one caller is a guess about the second. Waiting costs one copy; guessing wrong costs a refactor across every caller.

### Pages and routing

1. **One folder per route under `pages/`, one `<Name>Page.tsx` in it, registered in `app/router/router.tsx` with `lazy`. Pages do not import each other.**
   Lazy routes keep the first load paying only for the first page. Pages importing pages is how a route ends up bundling three others. *Checked by oxlint.*
2. **Pages compose: they call feature hooks and pass the data to feature components. A page holds no fetch, no business rule and no data transformation.**
   Logic in a page cannot be reused by the next page that needs it, and is tested only through a full screen render.
3. **Every route path lives in `shared/config/paths.ts`. Link and navigate with `paths.x`, never a string literal.**
   Renaming a route is then one edit, and a typo is a type error rather than a 404 found in a demo.

### Data

1. **Sample data lives in `features/<f>/mocks/`, typed with the feature's `model/` records and in the shape the real API will return. Only the feature's `state/` reads it.**
   Changing what is on screen — a vendor name, a total, a fifth row — is then an edit to one data file, not a hunt through components. And if the prototype becomes a real project, the records and the mocks carry over unchanged.
2. **Data a screen can change is held by the feature's provider, `state/<Feature>Provider.tsx`: React state seeded from the mocks, mounted once in `app/providers/AppProviders.tsx` above the router. Components read and change it only through the feature's hook (`useInvoices()`).**
   Above the router, a change made on one screen is still there on the next — approve an invoice and the home page's total moves. A reload puts everything back to the mocks, so the demo resets in one keystroke.
3. **Every change to the data is a pure function in `model/` (`withStatus(invoices, id, 'approved')`). The provider's actions only call it.**
   The rule then lives in one place rather than in a click handler, and it is the part a real project keeps.
4. **Nothing needs a network: no `fetch`, no HTTP client, no TanStack Query, SWR or other data-fetching library.**
   A prototype has no server, so there is nothing to fetch or cache. And if the room has no wifi, the demo still has to run. *Checked by oxlint.*
5. **UI state — filters, tabs, the selected row — lives in React state, or in the URL (`useSearchParams`) when it should be shareable. Never `localStorage` or `sessionStorage`, and no Redux, Zustand, Jotai or other store.**
   A prototype that remembers what the last person did cannot be reset before the next demo, and a value read back at the wrong moment looks like a bug in the design. *Checked by oxlint.*

### UI and Atoms

1. **Build UI only from `@neofloai/atoms`, `@neofloai/atoms/icons`, `@neofloai/atoms/tokens` and `@neofloai/atoms/theme`. Never import `@mui/*`, `@emotion/*` or `@neofloai/atoms/dist/*`, and do not add another UI kit or CSS framework (Tailwind, styled-components, CSS modules for components).**
   MUI resolves because Atoms ships it, and importing it silently bypasses the design system. A second styling system means two ways to draw every control. *Checked by oxlint.*
2. **Before composing a screen call the Atoms MCP `get_pattern`; before using a component call `get_component`; before writing any colour, spacing, radius or type value call `get_tokens`. Never hardcode a hex or pixel value a token carries.**
   A pattern carries an arrangement that has already been reviewed, and a component's Related section says when a different one is right. Hardcoded values stop following the theme, including dark mode.
3. **Use Atoms components unmodified. No `sx` selector reaching inside a component (`& .MuiButton-…`), no wrapper that overrides its styles. When a design needs a variant Atoms lacks, use the closest one and report the gap.**
   A local override stops tracking the design system the day it is written, and every project ends up with a different button.
4. **`NeofloThemeProvider` is mounted once, in `app/providers/AppProviders.tsx`. Never call `createTheme` or mount a second theme provider.**
   Two providers fight, and the inner one silently wins for everything inside it.
5. **A component used by two or more pages and free of business words goes in `shared/ui/`; anything else stays in its feature's `components/`.**
   Same rule as `shared` itself — reuse is earned by the second caller.

### Code

1. **Named exports only, no default exports (config files excepted).**
   A named export is the same name at every import site, so search and rename find all of them. *Checked by oxlint.*
2. **TypeScript stays strict. No `any`, no non-null `!`, no `@ts-ignore` or `@ts-expect-error`, no `as` cast to silence an error. Records are typed in the feature's `model/`.**
   Each escape hatch is a place the compiler stops checking — and the place the next bug comes from. *Checked by oxlint.*
3. **A module does nothing when it is imported: only declarations at the top level — no registration, no global mutation, no code that runs for its effect. The one exception is a `.css` import. Anything that must run at startup goes in `main.tsx` or `app/providers/`.**
   `package.json` declares `"sideEffects": ["**/*.css"]` so the bundler can drop every export a page does not use. A module that runs code on import would be dropped along with it, and the bug would only show in the production build.
4. **Name files by what they export: components `PascalCase.tsx` with one component per file, hooks `useThing.ts`, everything else `camelCase.ts`.**
   The file name is then the import name.
5. **Do not add a dependency without asking. Never a data-fetching library, HTTP client, state library, second router, date library or UI kit.**
   A prototype has no server and its state is React's, so each of those is weight with nothing to do. The project a prototype becomes starts from the full template, which has them.

### Before calling it done

1. **Run `npm run check` (typecheck and lint) and `npm run build`. Both must pass before reporting the work as finished.**
   A change that only works in the dev server has not been checked by anything. *Checked by npm run check.*
2. **Then click through every screen in `npm run dev`: every control lands somewhere, and a change made on one screen shows on the others.**
   The checks prove it compiles, not that the demo works. A dead control in front of a room is the one thing anyone remembers.
3. **Never weaken a check to make it pass: do not disable or downgrade a lint rule, add an `oxlint-disable` comment, loosen `tsconfig`, or edit `.oxlintrc.json`, `tsconfig*.json`, `vite.config.ts` or `AGENTS.md` unless the user asked for that change.**
   These files are the architecture. An agent that edits them to get to green has removed the rule rather than followed it.
4. **Report what was built, how to see it (`npm run dev`, then the route), and which interactions are real and which run on mock data.**
   A demo whose limits go unsaid gets presented as though it has none.

## Recipes

### Add a page

1. Add its path to `shared/config/paths.ts`.
2. Create `pages/<route>/<Route>Page.tsx` exporting `<Route>Page`.
3. Register it in `app/router/router.tsx` with `lazy`.
4. If it belongs in the rail, add a row to `app/layout/navigation.ts`.

### Add a feature

1. Create `features/<feature>/` with `model/`, `mocks/`, `state/`, `components/` and `index.ts`, following `features/invoices`.
2. Type the records in `model/` first, then write the mock data in that shape.
3. Write the context, the provider (`useState` seeded from the mocks) and the hook in `state/`, and mount the provider in `app/providers/AppProviders.tsx`.
4. Export from `index.ts` only what a page or the app will use.

### Make a control change the data

1. Write the change as a pure function in `model/`.
2. Add an action to the feature's provider that calls it, and expose it through the hook.
3. Call the action from the component. When the change shows somewhere other than where the click happened, confirm it with `useSnackbar`.

### Turn the prototype into a real project

1. Start a new project from the full Atoms React template (`start_project` with purpose `new-project`).
2. Copy each feature's `model/`, `mocks/` and `components/` across unchanged.
3. Replace `state/` with that template's `api/` folder and TanStack Query hooks, as its `AGENTS.md` describes. Changes become mutations against the real API.

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173. |
| `npm run check` | Typecheck and oxlint. |
| `npm run build` | Production build into `dist/`. |
| `npm run lint:fix` | Apply oxlint's safe fixes. |
