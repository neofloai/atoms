import { ATOMS_VERSION } from '../release/version';

/**
 * The one project structure every Atoms React app is built in, and the
 * rules an agent follows while working inside it.
 *
 * Written once, here, and delivered three ways so they cannot drift:
 *   - `npm run generate` renders it into `templates/react/AGENTS.md`
 *     (and a `CLAUDE.md` that imports it), so any agent that opens a
 *     scaffolded project reads it before touching a file;
 *   - `scaffold_app` and `start_project` serve it with every plan for a
 *     new React project;
 *   - the Start a project docs page renders it for people.
 *
 * Every rule an `.oxlintrc.json` rule can check says so in `enforcedBy`,
 * and the template's config is where that check lives. A rule with no
 * check is the one most likely to be broken, which is why each carries
 * its reason: an agent that knows why holds the line where the linter
 * cannot see.
 */

/** Where the template lives in this repo, and the command that copies it. */
export const REACT_TEMPLATE_PATH = 'templates/react';

/**
 * Pinned to the release tag, so the template a project starts from is
 * the one written for the Atoms version it installs.
 */
export const REACT_TEMPLATE_COMMAND = `npx giget@3 gh:neofloai/atoms/${REACT_TEMPLATE_PATH}#v${ATOMS_VERSION} {{name}}`;

export interface StructureLayer {
  /** Folder under `src/`. */
  dir: string;
  /** What belongs in it. */
  owns: string;
  /** Layers it may import from. Anything not listed is a lint error. */
  mayImport: readonly string[];
}

export type RuleCheck = 'oxlint' | 'tsc' | 'npm run check' | 'review';

export interface StructureRule {
  rule: string;
  why: string;
  enforcedBy: RuleCheck;
}

export interface StructureRuleGroup {
  title: string;
  rules: readonly StructureRule[];
}

export interface StructureRecipe {
  /** The task, as someone would ask for it. */
  task: string;
  steps: readonly string[];
}

export interface ProjectStructure {
  templatePath: string;
  createCommand: string;
  tree: string;
  featureTree: string;
  layers: readonly StructureLayer[];
  ruleGroups: readonly StructureRuleGroup[];
  recipes: readonly StructureRecipe[];
  commands: readonly { command: string; does: string }[];
}

const TREE = `src/
├── main.tsx              Mounts <App />. Nothing else goes here.
├── app/                  Composition root: wiring, never features.
│   ├── App.tsx
│   ├── providers/        NeofloThemeProvider, QueryClient, Snackbar.
│   ├── router/           Route table. Every page is lazy-loaded.
│   ├── layout/           The shell: rail, bar, <Outlet />, nav rows.
│   └── errors/           Route error boundary.
├── pages/                One folder per route. Thin: composes features.
│   └── <route>/<Route>Page.tsx
├── features/             One folder per business capability.
│   └── <feature>/        See the slice shape below.
├── shared/               Domain-free building blocks.
│   ├── api/              httpClient, mockResponse.
│   ├── config/           env.ts (every env var), paths.ts (every route).
│   ├── lib/              Pure helpers: formatting, dates, maths.
│   ├── ui/               Compositions of Atoms used by 2+ pages.
│   └── hooks/            Domain-free hooks (useDebounce, …).
└── test/                 Test setup and renderWithProviders.`;

const FEATURE_TREE = `features/<feature>/
├── index.ts              The public API. The only file outside code imports.
├── model/                Types and pure functions. No React, no fetching.
├── api/                  <feature>Api.ts (transport) and <feature>Queries.ts
│                         (query keys + TanStack Query hooks).
├── mocks/                Sample data in the API's exact shape. Read only by api/.
├── components/           The feature's UI, built from Atoms components.
└── hooks/                Feature hooks that are not queries (optional).`;

const LAYERS: readonly StructureLayer[] = [
  {
    dir: 'app',
    owns: 'Providers, the router, the shell and the error boundary — the wiring that turns pages into an app.',
    mayImport: ['pages', 'features', 'shared'],
  },
  {
    dir: 'pages',
    owns: 'One component per route that lays out the screen and composes features. No business logic.',
    mayImport: ['features', 'shared'],
  },
  {
    dir: 'features',
    owns: 'A business capability end to end: its types, its API calls, its queries, its mocks and its UI.',
    mayImport: ['shared'],
  },
  {
    dir: 'shared',
    owns: 'Code with no domain knowledge: the HTTP client, config, formatting, and Atoms compositions used by more than one page.',
    mayImport: [],
  },
];

const RULE_GROUPS: readonly StructureRuleGroup[] = [
  {
    title: 'Structure',
    rules: [
      {
        rule: 'Put every file in one of the four layers — `app`, `pages`, `features`, `shared` — in the folder this document names for it. Do not create new top-level folders under `src/` (no `src/components`, `src/utils`, `src/helpers`, `src/services`, `src/store`).',
        why: 'A second place for the same kind of code is how two engineers end up writing the same thing twice. One answer to "where does this go" is what keeps a codebase navigable at fifty features.',
        enforcedBy: 'review',
      },
      {
        rule: 'Import only downwards: `app → pages → features → shared`. `shared` imports no layer; a feature imports only `shared`; a page imports features and `shared`.',
        why: 'Dependencies that point one way can be reasoned about, tested and deleted one layer at a time. A single upward import makes the bottom layer depend on everything above it.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Features never import other features. When two features need each other, compose them in a page; when they need the same code, move it to `shared` if it has no domain knowledge.',
        why: 'Features that import each other stop being separable — a change to one is a change to all of them, and none can be removed or rewritten alone.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Import a feature only through its `index.ts` (`@/features/invoices`), never a file inside it. Export from `index.ts` only what a page needs.',
        why: 'The index is the feature\'s contract. Everything behind it can be reorganised without breaking a caller.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Inside a feature, use relative imports (`../model/invoice`). Across folders, use the `@/` alias. Never `../../`.',
        why: 'The alias says which layer an import comes from at a glance, and it survives a file moving one folder deeper.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Keep `shared` free of business words. If code names an invoice, a vendor or a user role, it belongs to a feature.',
        why: '`shared` is imported by everything, so domain logic there leaks into every feature and is owned by none of them.',
        enforcedBy: 'review',
      },
      {
        rule: 'Promote code to `shared` on its second user, not its first. Until then it stays in the feature that has it.',
        why: 'An abstraction with one caller is a guess about the second. Waiting costs one copy; guessing wrong costs a refactor across every caller.',
        enforcedBy: 'review',
      },
    ],
  },
  {
    title: 'Pages and routing',
    rules: [
      {
        rule: 'One folder per route under `pages/`, one `<Name>Page.tsx` in it, registered in `app/router/router.tsx` with `lazy`. Pages do not import each other.',
        why: 'Lazy routes keep the first load paying only for the first page. Pages importing pages is how a route ends up bundling three others.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Pages compose: they call feature hooks and pass the data to feature components. A page holds no fetch, no business rule and no data transformation.',
        why: 'Logic in a page cannot be reused by the next page that needs it, and is tested only through a full screen render.',
        enforcedBy: 'review',
      },
      {
        rule: 'Every route path lives in `shared/config/paths.ts`. Link and navigate with `paths.x`, never a string literal.',
        why: 'Renaming a route is then one edit, and a typo is a type error rather than a 404 found in a demo.',
        enforcedBy: 'review',
      },
    ],
  },
  {
    title: 'Data',
    rules: [
      {
        rule: 'Server state goes through TanStack Query: transport functions in `features/<f>/api/<f>Api.ts`, query keys and hooks in `features/<f>/api/<f>Queries.ts`. Components never call `fetch` or the HTTP client directly.',
        why: 'One cache gives every screen loading, error, retry, deduplication and invalidation for free. A component that fetches for itself gets none of it and duplicates the request the next one makes.',
        enforcedBy: 'review',
      },
      {
        rule: 'All HTTP goes through `shared/api/httpClient.ts`. Do not add axios, ky or a second client.',
        why: 'Auth headers, base URLs and error shapes then change in one file.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Build query keys from the feature\'s key factory (`invoiceKeys.list()`), always prefixed with the feature name.',
        why: 'Invalidating `invoiceKeys.all` then refreshes exactly what the feature cached and nothing else.',
        enforcedBy: 'review',
      },
      {
        rule: 'Sample data lives in `features/<f>/mocks/`, in the exact shape the API returns, and only the feature\'s `api/` folder reads it, behind `env.useMocks`.',
        why: 'Swapping to the real endpoint is then one file in `api/`, and no component knows the data was ever fake.',
        enforcedBy: 'review',
      },
      {
        rule: 'UI state lives in React state, or in the URL (`useSearchParams`) when it should survive a reload or be shareable — filters, tabs, the selected row. Never `localStorage` or `sessionStorage` for app data. Do not add Redux, Zustand, Jotai or any global store unless the user asks for one.',
        why: 'With server state in the query cache, what is left is almost always local. A global store added "for later" becomes the place everything goes, and a stored value read back at the wrong moment looks like a bug in the design.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Read environment variables only from `shared/config/env.ts`. A new variable is declared in three places: `env.ts`, `src/vite-env.d.ts` and `.env.example`. Never put a secret in a `VITE_` variable.',
        why: 'Every `VITE_` variable ships to the browser. One file that reads them all is the list of what a deploy needs.',
        enforcedBy: 'review',
      },
    ],
  },
  {
    title: 'UI and Atoms',
    rules: [
      {
        rule: 'Build UI only from `@neofloai/atoms`, `@neofloai/atoms/icons`, `@neofloai/atoms/tokens` and `@neofloai/atoms/theme`. Never import `@mui/*`, `@emotion/*` or `@neofloai/atoms/dist/*`, and do not add another UI kit or CSS framework (Tailwind, styled-components, CSS modules for components).',
        why: 'MUI resolves because Atoms ships it, and importing it silently bypasses the design system. A second styling system means two ways to draw every control.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Before composing a screen call the Atoms MCP `get_pattern`; before using a component call `get_component`; before writing any colour, spacing, radius or type value call `get_tokens`. Never hardcode a hex or pixel value a token carries.',
        why: 'A pattern carries an arrangement that has already been reviewed, and a component\'s Related section says when a different one is right. Hardcoded values stop following the theme, including dark mode.',
        enforcedBy: 'review',
      },
      {
        rule: 'Use Atoms components unmodified. No `sx` selector reaching inside a component (`& .MuiButton-…`), no wrapper that overrides its styles. When a design needs a variant Atoms lacks, use the closest one and report the gap.',
        why: 'A local override stops tracking the design system the day it is written, and every project ends up with a different button.',
        enforcedBy: 'review',
      },
      {
        rule: '`NeofloThemeProvider` is mounted once, in `app/providers/AppProviders.tsx`. Never call `createTheme` or mount a second theme provider.',
        why: 'Two providers fight, and the inner one silently wins for everything inside it.',
        enforcedBy: 'review',
      },
      {
        rule: 'A component used by two or more pages and free of business words goes in `shared/ui/`; anything else stays in its feature\'s `components/`.',
        why: 'Same rule as `shared` itself — reuse is earned by the second caller.',
        enforcedBy: 'review',
      },
    ],
  },
  {
    title: 'Code',
    rules: [
      {
        rule: 'Named exports only, no default exports (config files excepted).',
        why: 'A named export is the same name at every import site, so search and rename find all of them.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'TypeScript stays strict. No `any`, no non-null `!`, no `@ts-ignore` or `@ts-expect-error`, no `as` cast to silence an error. Records are typed in the feature\'s `model/`.',
        why: 'Each escape hatch is a place the compiler stops checking — and the place the next bug comes from.',
        enforcedBy: 'oxlint',
      },
      {
        rule: 'Name files by what they export: components `PascalCase.tsx` with one component per file, hooks `useThing.ts`, everything else `camelCase.ts`. Tests sit next to the file as `<file>.test.ts(x)`.',
        why: 'The file name is then the import name, and a test is found by looking next to what it tests.',
        enforcedBy: 'review',
      },
      {
        rule: 'Every feature ships with tests for its `model/` logic; a page with real behaviour gets a render test using `renderWithProviders`.',
        why: 'Model functions are pure, so their tests are cheap and never flaky. They are the ones that catch a wrong total before a customer does.',
        enforcedBy: 'review',
      },
      {
        rule: 'Do not add a dependency without asking. Never a second router, data-fetching library, state library, HTTP client, date library or UI kit.',
        why: 'Every dependency is code you now maintain. Two of the same kind means every engineer has to learn both.',
        enforcedBy: 'review',
      },
    ],
  },
  {
    title: 'Before calling it done',
    rules: [
      {
        rule: 'Run `npm run check` (typecheck, lint, format check, tests) and `npm run build`. Both must pass before reporting the work as finished.',
        why: 'A change that only works in the dev server has not been checked by anything the CI will run.',
        enforcedBy: 'npm run check',
      },
      {
        rule: 'Never weaken a check to make it pass: do not disable or downgrade a lint rule, add an `oxlint-disable` comment, loosen `tsconfig`, or edit `.oxlintrc.json`, `tsconfig*.json`, `vite.config.ts` or `AGENTS.md` unless the user asked for that change.',
        why: 'These files are the architecture. An agent that edits them to get to green has removed the rule rather than followed it.',
        enforcedBy: 'review',
      },
      {
        rule: 'Report what was built, how to see it (`npm run dev`, then the route), and which interactions are real and which run on mock data.',
        why: 'A demo whose limits go unsaid gets presented as though it has none.',
        enforcedBy: 'review',
      },
    ],
  },
];

const RECIPES: readonly StructureRecipe[] = [
  {
    task: 'Add a page',
    steps: [
      'Add its path to `shared/config/paths.ts`.',
      'Create `pages/<route>/<Route>Page.tsx` exporting `<Route>Page`.',
      'Register it in `app/router/router.tsx` with `lazy`.',
      'If it belongs in the rail, add a row to `app/layout/navigation.ts`.',
    ],
  },
  {
    task: 'Add a feature',
    steps: [
      'Create `features/<feature>/` with `model/`, `api/`, `mocks/`, `components/` and `index.ts`, following `features/invoices`.',
      'Type the records in `model/` first, then the mock data in that shape.',
      'Write the transport in `api/<feature>Api.ts` with the `env.useMocks` branch, then the key factory and hooks in `api/<feature>Queries.ts`.',
      'Export from `index.ts` only what a page will use, and add a test for the `model/` logic.',
    ],
  },
  {
    task: 'Connect a real API',
    steps: [
      'Set `VITE_API_URL` in `.env.local` and `VITE_USE_MOCKS=false`.',
      'Point the feature\'s `api/<feature>Api.ts` at the endpoint. Nothing outside `api/` changes.',
      'If the response shape differs from the mock, fix the type in `model/` and let the compiler list every place that has to change.',
    ],
  },
  {
    task: 'Change data after a mutation',
    steps: [
      'Add the mutation to `api/<feature>Queries.ts` with `useMutation`.',
      'In `onSuccess`, invalidate with the feature\'s key factory — `queryClient.invalidateQueries({ queryKey: invoiceKeys.all })`.',
    ],
  },
];

const COMMANDS: readonly { command: string; does: string }[] = [
  { command: 'npm run dev', does: 'Dev server on http://localhost:5173.' },
  { command: 'npm run check', does: 'Typecheck, oxlint, oxfmt check and tests — what CI runs.' },
  { command: 'npm run build', does: 'Production build into `dist/`.' },
  { command: 'npm run lint:fix', does: 'Apply oxlint\'s safe fixes.' },
  { command: 'npm run format', does: 'Format everything with oxfmt.' },
  { command: 'npm test', does: 'Vitest in watch mode.' },
];

export const projectStructure: ProjectStructure = {
  templatePath: REACT_TEMPLATE_PATH,
  createCommand: REACT_TEMPLATE_COMMAND,
  tree: TREE,
  featureTree: FEATURE_TREE,
  layers: LAYERS,
  ruleGroups: RULE_GROUPS,
  recipes: RECIPES,
  commands: COMMANDS,
};

/** Every rule as one line, for a plan that has to carry them inline. */
export function structureRuleLines(structure: ProjectStructure): string[] {
  return structure.ruleGroups.flatMap((group) =>
    group.rules.map((r) => `${r.rule}${r.enforcedBy === 'oxlint' ? ' *(oxlint)*' : ''}`)
  );
}

/**
 * The template's AGENTS.md: the structure and every rule with its
 * reason, for whoever — or whatever — opens the project next.
 */
export function renderAgentsMd(structure: ProjectStructure): string {
  const layers = structure.layers
    .map(
      (layer) =>
        `| \`src/${layer.dir}\` | ${layer.owns} | ${
          layer.mayImport.length > 0 ? layer.mayImport.map((d) => `\`${d}\``).join(', ') : 'nothing'
        } |`
    )
    .join('\n');

  const groups = structure.ruleGroups
    .map((group) => {
      const rules = group.rules
        .map(
          (r, i) =>
            `${i + 1}. **${r.rule}**\n   ${r.why}${r.enforcedBy === 'review' ? '' : ` *Checked by ${r.enforcedBy}.*`}`
        )
        .join('\n');
      return `### ${group.title}\n\n${rules}`;
    })
    .join('\n\n');

  const recipes = structure.recipes
    .map(
      (recipe) =>
        `### ${recipe.task}\n\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    )
    .join('\n\n');

  const commands = structure.commands
    .map((c) => `| \`${c.command}\` | ${c.does} |`)
    .join('\n');

  return `<!-- Generated from src/project/structure.ts in neofloai/atoms. Edit it there, not here. -->

# Working in this project

This is a Neoflo Atoms React app: Vite, TypeScript, React Router, TanStack Query, oxlint and oxfmt, with UI from \`@neofloai/atoms\`. Every Atoms app is laid out the same way, so anyone who has worked in one can work in any of them.

**These rules are not suggestions.** If you are an AI agent, follow every one of them exactly, on every change, without being reminded. When a request cannot be met without breaking one, stop and say which rule and why rather than working around it.

## Layout

\`\`\`
${structure.tree}
\`\`\`

A feature is always the same shape:

\`\`\`
${structure.featureTree}
\`\`\`

\`features/invoices\` is the worked example. Copy its shape for every new feature.

## Layers

Each layer imports only from the layers below it. oxlint fails the build on anything else.

| Layer | Owns | May import |
| --- | --- | --- |
${layers}

## Rules

${groups}

## Recipes

${recipes}

## Commands

| Command | Does |
| --- | --- |
${commands}
`;
}
