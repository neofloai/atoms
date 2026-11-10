import {
  ADD_PAGE_RECIPE,
  ROUTING_RULES,
  SHARED_CODE_RULES,
  SHARED_DONE_RULES,
  STRUCTURE_RULES,
  templateCommand,
  UI_RULES,
} from './structure';

import type {
  ProjectStructure,
  StructureLayer,
  StructureRecipe,
  StructureRule,
  StructureRuleGroup,
} from './structure';

/**
 * The structure a prototype is built in.
 *
 * A prototype has no server, so it starts from a lighter template than a
 * new project: Vite, React Router and Atoms, with sample data held in
 * React state. There is no TanStack Query, no HTTP client, no environment
 * switch, no test runner and no formatter, because each of those exists
 * for a backend, a team or a deploy that a prototype does not have.
 *
 * The data model is the one thing that differs in kind rather than in
 * size. Each feature's `mocks/` seeds a provider mounted above the router,
 * so a change made on one screen is still there on the next, and a reload
 * puts everything back. A query cache over constant mocks would do the
 * opposite: a mutation followed by a refetch reads the unchanged mock and
 * the change disappears, mid-demo.
 *
 * Everything that is not about data — the four layers, routing, building
 * UI from Atoms, most of the code rules — is imported from
 * `./structure.ts`, so a prototype and the project it may become are laid
 * out the same way.
 */

export const PROTOTYPE_TEMPLATE_PATH = 'templates/prototype';
export const PROTOTYPE_TEMPLATE_COMMAND = templateCommand(PROTOTYPE_TEMPLATE_PATH);

const TREE = `src/
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
    └── hooks/            Domain-free hooks (useDebounce, …).`;

const FEATURE_TREE = `features/<feature>/
├── index.ts              The public API. The only file outside code imports.
├── model/                Types and pure functions, including every change
│                         to the data. No React.
├── mocks/                Sample data in the real API's shape. Read only by state/.
├── state/                <Feature>Provider.tsx (React state seeded from the
│                         mocks), use<Feature>.ts (the hook), and the context
│                         they share.
└── components/           The feature's UI, built from Atoms components.`;

const LAYERS: readonly StructureLayer[] = [
  {
    dir: 'app',
    owns: 'Providers (each feature\'s state among them), the router, the shell and the error boundary — the wiring that turns pages into an app.',
    mayImport: ['pages', 'features', 'shared'],
  },
  {
    dir: 'pages',
    owns: 'One component per route that lays out the screen and composes features. No business logic.',
    mayImport: ['features', 'shared'],
  },
  {
    dir: 'features',
    owns: 'A business capability end to end: its types, its sample data, the state that holds it and its UI.',
    mayImport: ['shared'],
  },
  {
    dir: 'shared',
    owns: 'Code with no domain knowledge: routes, formatting, and Atoms compositions used by more than one page.',
    mayImport: [],
  },
];

const DATA_RULES: readonly StructureRule[] = [
  {
    rule: 'Sample data lives in `features/<f>/mocks/`, typed with the feature\'s `model/` records and in the shape the real API will return. Only the feature\'s `state/` reads it.',
    why: 'Changing what is on screen — a vendor name, a total, a fifth row — is then an edit to one data file, not a hunt through components. And if the prototype becomes a real project, the records and the mocks carry over unchanged.',
    enforcedBy: 'review',
  },
  {
    rule: 'Data a screen can change is held by the feature\'s provider, `state/<Feature>Provider.tsx`: React state seeded from the mocks, mounted once in `app/providers/AppProviders.tsx` above the router. Components read and change it only through the feature\'s hook (`useInvoices()`).',
    why: 'Above the router, a change made on one screen is still there on the next — approve an invoice and the home page\'s total moves. A reload puts everything back to the mocks, so the demo resets in one keystroke.',
    enforcedBy: 'review',
  },
  {
    rule: 'Every change to the data is a pure function in `model/` (`withStatus(invoices, id, \'approved\')`). The provider\'s actions only call it.',
    why: 'The rule then lives in one place rather than in a click handler, and it is the part a real project keeps.',
    enforcedBy: 'review',
  },
  {
    rule: 'Nothing needs a network: no `fetch`, no HTTP client, no TanStack Query, SWR or other data-fetching library.',
    why: 'A prototype has no server, so there is nothing to fetch or cache. And if the room has no wifi, the demo still has to run.',
    enforcedBy: 'oxlint',
  },
  {
    rule: 'UI state — filters, tabs, the selected row — lives in React state, or in the URL (`useSearchParams`) when it should be shareable. Never `localStorage` or `sessionStorage`, and no Redux, Zustand, Jotai or other store.',
    why: 'A prototype that remembers what the last person did cannot be reset before the next demo, and a value read back at the wrong moment looks like a bug in the design.',
    enforcedBy: 'oxlint',
  },
];

const CODE_RULES: readonly StructureRule[] = [
  ...SHARED_CODE_RULES,
  {
    rule: 'Name files by what they export: components `PascalCase.tsx` with one component per file, hooks `useThing.ts`, everything else `camelCase.ts`.',
    why: 'The file name is then the import name.',
    enforcedBy: 'review',
  },
  {
    rule: 'Do not add a dependency without asking. Never a data-fetching library, HTTP client, state library, second router, date library or UI kit.',
    why: 'A prototype has no server and its state is React\'s, so each of those is weight with nothing to do. The project a prototype becomes starts from the full template, which has them.',
    enforcedBy: 'review',
  },
];

const RULE_GROUPS: readonly StructureRuleGroup[] = [
  { title: 'Structure', rules: STRUCTURE_RULES },
  { title: 'Pages and routing', rules: ROUTING_RULES },
  { title: 'Data', rules: DATA_RULES },
  { title: 'UI and Atoms', rules: UI_RULES },
  { title: 'Code', rules: CODE_RULES },
  {
    title: 'Before calling it done',
    rules: [
      {
        rule: 'Run `npm run check` (typecheck and lint) and `npm run build`. Both must pass before reporting the work as finished.',
        why: 'A change that only works in the dev server has not been checked by anything.',
        enforcedBy: 'npm run check',
      },
      {
        rule: 'Then click through every screen in `npm run dev`: every control lands somewhere, and a change made on one screen shows on the others.',
        why: 'The checks prove it compiles, not that the demo works. A dead control in front of a room is the one thing anyone remembers.',
        enforcedBy: 'review',
      },
      ...SHARED_DONE_RULES,
    ],
  },
];

const RECIPES: readonly StructureRecipe[] = [
  ADD_PAGE_RECIPE,
  {
    task: 'Add a feature',
    steps: [
      'Create `features/<feature>/` with `model/`, `mocks/`, `state/`, `components/` and `index.ts`, following `features/invoices`.',
      'Type the records in `model/` first, then write the mock data in that shape.',
      'Write the context, the provider (`useState` seeded from the mocks) and the hook in `state/`, and mount the provider in `app/providers/AppProviders.tsx`.',
      'Export from `index.ts` only what a page or the app will use.',
    ],
  },
  {
    task: 'Make a control change the data',
    steps: [
      'Write the change as a pure function in `model/`.',
      'Add an action to the feature\'s provider that calls it, and expose it through the hook.',
      'Call the action from the component. When the change shows somewhere other than where the click happened, confirm it with `useSnackbar`.',
    ],
  },
  {
    task: 'Turn the prototype into a real project',
    steps: [
      'Start a new project from the full Atoms React template (`start_project` with purpose `new-project`).',
      'Copy each feature\'s `model/`, `mocks/` and `components/` across unchanged.',
      'Replace `state/` with that template\'s `api/` folder and TanStack Query hooks, as its `AGENTS.md` describes. Changes become mutations against the real API.',
    ],
  },
];

const COMMANDS: readonly { command: string; does: string }[] = [
  { command: 'npm run dev', does: 'Dev server on http://localhost:5173.' },
  { command: 'npm run check', does: 'Typecheck and oxlint.' },
  { command: 'npm run build', does: 'Production build into `dist/`.' },
  { command: 'npm run lint:fix', does: 'Apply oxlint\'s safe fixes.' },
];

export const prototypeStructure: ProjectStructure = {
  templatePath: PROTOTYPE_TEMPLATE_PATH,
  createCommand: PROTOTYPE_TEMPLATE_COMMAND,
  intro:
    'This is a Neoflo Atoms prototype: Vite, TypeScript, React Router and oxlint, with UI from `@neofloai/atoms`. It has no backend and needs no network: sample data lives in each feature\'s `mocks/` and is held in React state, so a change made on one screen shows on every other and a reload resets it.',
  tree: TREE,
  featureTree: FEATURE_TREE,
  layers: LAYERS,
  ruleGroups: RULE_GROUPS,
  recipes: RECIPES,
  commands: COMMANDS,
};
