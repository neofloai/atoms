import { REACT_TEMPLATE_COMMAND } from './structure';

import type { BrandAsset, ProjectTargetRecipe } from './types';

/**
 * Where a new project goes, and the reason it is stated as a rule rather
 * than left to judgement.
 *
 * An agent's own working directory is a sandbox: it may be a temp path,
 * a checkout of this repo, or somewhere that disappears when the session
 * ends. None of those are where a person can find their own app
 * afterwards, and a prototype nobody can open again was not delivered.
 */
export const PROJECT_PARENT_DIR = '~/Desktop';

/** Docs origin the brand files are downloaded from, once, at setup. */
export const BRAND_ORIGIN = 'https://atoms.neoflo.ai';

/**
 * The icon set a new app needs its own copy of.
 *
 * Downloaded and committed rather than linked: the package ships `dist`
 * only, so there is nothing to copy out of `node_modules`, and an icon
 * served from an origin you do not control disappears the day that
 * origin does. The mark inside the app is a different problem with a
 * better answer — `NeofloLogo` is a component and inherits
 * `currentColor`, so it needs no file at all.
 */
export const BRAND_ASSETS: readonly BrandAsset[] = [
  {
    file: 'favicon.ico',
    path: '/favicon.ico',
    target: 'public/favicon.ico',
    note: '16/32/48px copy of the default, for the /favicon.ico path crawlers request directly',
  },
  {
    file: 'favicon-dark.png',
    path: '/brand/favicon-dark.png',
    target: 'public/brand/favicon-dark.png',
    note: 'Off-white disc with a dark mark. The default: the only file that survives both light and dark browser chrome',
  },
  {
    file: 'apple-touch-icon.png',
    path: '/brand/apple-touch-icon.png',
    target: 'public/brand/apple-touch-icon.png',
    note: 'Full-bleed square for the iOS home screen, which ignores transparency and applies its own rounding',
  },
];

const NEXT_ICON_METADATA = `// app/layout.tsx
export const metadata = {
  title: 'Your product name',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/brand/favicon-dark.png', type: 'image/png' },
    ],
    apple: { url: '/brand/apple-touch-icon.png', type: 'image/png' },
  },
};`;

const LOGO_USAGE = `import { NeofloLogo } from '@neofloai/atoms';

// Top of the nav rail, above the switcher.
<NeofloLogo variant="full" size={20} />`;

const REACT_TARGET: ProjectTargetRecipe = {
  id: 'react',
  label: 'React + Vite + TypeScript (Atoms template)',
  chooseWhen:
    'it is a prototype, or a new project whose frontend does not need a server of its own',
  createCommand: REACT_TEMPLATE_COMMAND,
  fromTemplate: true,
  iconStep: null,
  steps: [
    {
      title: 'Name it and install',
      body: 'The template arrives named `atoms-app` and titled "Atoms App". Give it the project\'s name, then install. Commit the `package-lock.json` this writes.',
      code: 'npm pkg set name={{name}}\n# and set <title> in index.html to the product name\nnpm install',
      language: 'bash',
    },
    {
      title: 'Read AGENTS.md before writing anything',
      body: 'The project\'s `AGENTS.md` (which `CLAUDE.md` imports) is the structure and the rules for working in it, and they are strict: every file goes in one of four layers, each layer imports only downwards, and oxlint fails `npm run check` on a boundary crossed. `features/invoices` is the worked example — copy its shape for each feature, then delete it, its page and its nav row once the app has its own.',
    },
    {
      title: 'Run it',
      body: 'Vite serves on port 5173. Leave it running while you build; it reloads on save. Run `npm run check` and `npm run build` before calling anything done.',
      code: 'npm run dev\n# http://localhost:5173',
      language: 'bash',
    },
  ],
};

const NEXTJS_TARGET: ProjectTargetRecipe = {
  id: 'nextjs',
  label: 'Next.js (App Router) + TypeScript',
  chooseWhen:
    'a new project was asked for with Next: something behind the UI needs a server — a sign-in, data that outlives a reload, an API route, or a secret that must stay out of the browser',
  createCommand:
    'npx create-next-app@latest {{name}} --typescript --app --eslint --no-tailwind --no-src-dir --use-npm --yes',
  fromTemplate: false,
  iconStep: {
    title: 'Declare the icons in the root layout',
    body: 'The `app/icon.png` file convention cannot express a `media` query, so the icons are declared as metadata instead. One PNG rather than a light/dark pair — the off-white disc is legible on both chromes, and a browser that ignores `media` on an icon link would otherwise show nothing at all.',
    code: NEXT_ICON_METADATA,
    language: 'tsx',
  },
  steps: [
    {
      title: 'Keep server work on the server',
      body: 'Components are server components by default; `NeofloThemeProvider` is a client component and is rendered inside the server layout. Fetch in server components or route handlers, and keep API keys in `.env.local`, which is git-ignored by default. A key read in a client component ships to the browser.',
    },
    {
      title: 'Run it',
      body: 'Next serves on port 3000.',
      code: 'npm run dev\n# http://localhost:3000',
      language: 'bash',
    },
  ],
};

const EXISTING_TARGET: ProjectTargetRecipe = {
  id: 'existing',
  label: 'A project that already exists',
  chooseWhen:
    'Atoms is being added to an app that is already running, so nothing is created and nothing is scaffolded',
  createCommand: null,
  fromTemplate: false,
  iconStep: null,
  steps: [
    {
      title: 'Do not create a project',
      body: 'Work inside the repo that exists. Call `get_installation` with that app\'s framework for the install and provider steps, and read the rules it returns before importing anything.',
    },
    {
      title: 'Check React first',
      body: 'Atoms needs React 18 or 19 as a peer dependency. On React 17 or earlier, stop and say so — there is no workaround, and finding out after the install is a rollback.',
    },
    {
      title: 'Reconcile an existing theme provider',
      body: 'If the app already mounts a MUI theme, two providers will fight and the inner one silently wins for anything it styles. `NeofloThemeProvider` is the only theme Atoms components are correct under, so either the existing provider wraps a region that excludes Atoms components, or it goes. That is a decision for whoever owns the app, not one to make while installing.',
    },
    {
      title: 'Leave the brand alone unless asked',
      body: 'A customer-facing app keeps its own favicon and its own mark. Do not replace either without being asked to.',
    },
  ],
};

export const PROJECT_TARGETS: readonly ProjectTargetRecipe[] = [
  REACT_TARGET,
  NEXTJS_TARGET,
  EXISTING_TARGET,
];

/** The mark inside the app, which is a component rather than a file. */
export const LOGO_STEP = {
  title: 'Put the mark in the app',
  body: 'The logo is a component and inherits `currentColor`, so there is no asset to add and no light/dark pair to switch between. It belongs at the top of the nav rail; in a customer-branded app it is their name that goes there instead, and the favicon stays theirs too.',
  code: LOGO_USAGE,
  language: 'tsx' as const,
};
