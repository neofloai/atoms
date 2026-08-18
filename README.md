# Atoms

> **Neoflo's AI-Powered Design System** — One repo. One platform. Consistent UI everywhere.

A Next.js-based design system that wraps Material UI v9 with Neoflo's brand, exposes components via a documentation website, and provides an MCP endpoint so AI editors (Cursor, Claude Code) generate design-system-compliant code automatically.

---

## What Atoms is

Atoms is **three things in one repo**:

1. **A React component library** — engineers install `@neofloai/atoms` in their projects
2. **A documentation website** — [atoms.neoflo.ai](https://atoms.neoflo.ai) — designers and engineers browse components, tokens, and patterns
3. **An MCP endpoint** — [atoms.neoflo.ai/mcp](https://atoms.neoflo.ai/mcp) — AI editors query the design system before generating code

### Quick links

| Resource | URL |
| -------- | --- |
| Repository | [github.com/neofloai/atoms](https://github.com/neofloai/atoms) |
| Docs website | [atoms.neoflo.ai](https://atoms.neoflo.ai) |
| Installation guide | [atoms.neoflo.ai/installation](https://atoms.neoflo.ai/installation) |
| MCP endpoint guide | [atoms.neoflo.ai/mcp-guide](https://atoms.neoflo.ai/mcp-guide) |
| Design tokens | [atoms.neoflo.ai/tokens](https://atoms.neoflo.ai/tokens) |
| Help & support | [atoms.neoflo.ai/help](https://atoms.neoflo.ai/help) |
| Issues & requests | [github.com/neofloai/atoms/issues](https://github.com/neofloai/atoms/issues) |
| Icons | [atoms.neoflo.ai/icons](https://atoms.neoflo.ai/icons) |
| Deployment & CI/CD | [DEPLOYMENT.md](./DEPLOYMENT.md) |

---

## Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| Framework | Next.js 16 (App Router)         |
| Language  | TypeScript 5                    |
| UI base   | Material UI v9 React            |
| Styling   | Emotion (via MUI default)       |
| Icons     | @phosphor-icons/react           |
| MCP SDK   | @modelcontextprotocol/sdk       |
| Linting   | ESLint 9 + next/core-web-vitals |

---

## Project Structure

```
atoms/
├── app/                          # Next.js App Router
│   ├── (docs)/                   # Documentation website routes
│   │   ├── _components/          # Docs shell, sidebar, color-mode toggle
│   │   ├── components/           # Per-component doc pages (button, chip, ...)
│   │   ├── tokens/               # Design tokens reference
│   │   ├── icons/                # Icon browser
│   │   ├── installation/         # Installation guide
│   │   ├── start-a-project/      # The brief to gather before building
│   │   ├── mcp-guide/            # MCP endpoint guide
│   │   ├── patterns/             # Whole-screen patterns (dashboard)
│   │   ├── layout.tsx            # Docs layout (sidebar + shell)
│   │   └── page.tsx              # Home — component gallery
│   ├── api/health/route.ts       # Liveness/readiness probe
│   ├── mcp/route.ts              # POST /mcp — MCP server handler
│   ├── _lib/Link.tsx             # MUI <-> Next.js Link integration
│   ├── layout.tsx                # Root layout (cache provider + NeofloThemeProvider)
│   └── globals.css               # Global styles (minimal)
│
├── src/
│   ├── components/               # Neoflo wrapper components (export these)
│   │   ├── Button/
│   │   │   ├── Button.tsx         # Wraps MUI Button with Neoflo API
│   │   │   ├── Button.types.ts    # TypeScript prop interfaces
│   │   │   ├── Button.examples.tsx # Code examples for docs + MCP
│   │   │   └── index.ts
│   │   ├── Checkbox/  Chip/  IconButton/  Radio/  TextField/
│   │   ├── _shared/              # Internals shared across components
│   │   └── index.ts
│   │
│   ├── tokens/                   # Design tokens (single source of truth)
│   │   ├── colors.ts  surface.ts  border.ts  text.ts  icon.ts
│   │   ├── spacing.ts  typography.ts  elevation.ts  radius.ts
│   │   └── index.ts
│   │
│   ├── theme/                    # MUI theme built from Neoflo tokens
│   │   ├── index.ts              # createTheme(...) export
│   │   ├── palette.ts            # Token -> MUI palette mapping
│   │   ├── typography.ts         # Typography variants
│   │   ├── shadows.ts            # Elevation -> MUI shadows
│   │   └── ThemeProvider.tsx     # NeofloThemeProvider (framework-agnostic)
│   │
│   ├── patterns/                 # Whole-screen recipes (dashboard/)
│   │
│   ├── mcp/                      # MCP server logic
│   │   ├── server.ts             # MCP server instance
│   │   ├── tools/                # One file per tool
│   │   │   ├── start-project.ts
│   │   │   ├── scaffold-app.ts
│   │   │   ├── list-components.ts
│   │   │   ├── get-component.ts
│   │   │   ├── get-tokens.ts
│   │   │   ├── get-pattern.ts
│   │   │   ├── search-docs.ts
│   │   │   └── get-installation.ts
│   │   ├── data-loader.ts        # Loads JSON from data/ directory
│   │   ├── format.ts             # Markdown shared by more than one tool
│   │   └── types.ts              # Generated-manifest shapes
│   │
│   ├── install/                  # Install/setup instructions (source of truth)
│   │   └── index.ts              # Framework-aware setup steps (Next.js, React)
│   │
│   ├── project/                  # Project intake (source of truth)
│   │   ├── questions.ts          # The brief to gather before building
│   │   ├── targets.ts            # Scaffold recipes + where projects go
│   │   └── index.ts              # Target resolution + completeness checks
│   │
│   ├── types/                    # Shared TypeScript types
│   └── index.ts                  # Public package exports (built to dist/)
│
├── scripts/
│   └── generate.ts               # Generates data/ JSON from src/
│
├── data/                         # Auto-generated (DO NOT EDIT MANUALLY)
│   ├── components.json
│   ├── tokens.json
│   ├── patterns.json
│   ├── installation.json
│   ├── brand.json
│   └── project.json
│
├── .cursor/
│   ├── mcp.json                  # MCP config for this repo
│   └── rules/                    # Cursor AI guardrails (00-core … 80-project-intake)
│
├── .github/workflows/ci.yml      # CI: lint, typecheck, build, docker validate
├── buildspec.yml                 # AWS CodeBuild -> ECR -> ECS (deploy)
├── Dockerfile                    # Multi-stage standalone image
├── tsup.config.ts                # Library build (src -> dist)
├── tsconfig.json  tsconfig.lib.json
├── next.config.ts  eslint.config.mjs
├── CLAUDE.md  AGENTS.md  DEPLOYMENT.md
├── package.json
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
git clone git@github.com:neofloai/atoms.git
cd atoms
npm install
```

### Generate data files (required before first run)

```bash
npm run generate
```

This reads `src/components/` and writes structured JSON to `data/`. The MCP server and docs website both read from here.

### Run the docs website (with MCP endpoint)

```bash
npm run dev
```

- Docs website: http://localhost:3000
- MCP endpoint: http://localhost:3000/mcp

---

## Adding a New Component

Follow this exact workflow — do not deviate:

1. **Verify it doesn't exist in MUI first** — check [mui.com/material-ui/all-components](https://mui.com/material-ui/all-components/). If MUI has it, wrap it. Don't reinvent.

2. **Create the component folder:**

   ```
   src/components/MyComponent/
   ├── MyComponent.tsx
   ├── MyComponent.types.ts
   ├── MyComponent.examples.tsx
   └── index.ts
   ```

3. **Wrap MUI** (don't write CSS from scratch):

   ```tsx
   // MyComponent.tsx
   import { Chip as MuiChip, ChipProps as MuiChipProps } from "@mui/material";
   import { MyComponentProps } from "./MyComponent.types";

   const variantMap = {
     /* Neoflo → MUI mapping */
   };

   export const MyComponent = ({
     variant = "default",
     ...props
   }: MyComponentProps) => <MuiChip {...variantMap[variant]} {...props} />;
   ```

4. **Export from public API:**

   ```tsx
   // src/index.ts
   export { MyComponent } from "./components/MyComponent";
   export type { MyComponentProps } from "./components/MyComponent/MyComponent.types";
   ```

5. **Add examples for documentation:**

   ```tsx
   // MyComponent.examples.tsx — used by docs + MCP
   export const examples = [
     { title: "Default", code: "<MyComponent>Hello</MyComponent>" },
     {
       title: "With variant",
       code: '<MyComponent variant="success">Done</MyComponent>',
     },
   ];
   ```

6. **Regenerate data:**

   ```bash
   npm run generate
   ```

7. **Test in the docs site:**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000/components/my-component

8. **Open a PR.** CODEOWNERS will auto-request review from DS maintainers.

---

## Design Token Workflow

Tokens are the **single source of truth** for all visual values. Components reference tokens via the MUI theme — never hardcode hex values, pixel values, or font sizes.

```tsx
// Wrong
<Box sx={{ color: '#3B82F6', padding: '16px' }} />

// Right
<Box sx={{ color: 'primary.main', p: 2 }} />
```

To update a token (e.g., change brand color):

1. Edit `src/tokens/colors.ts`
2. The MUI theme automatically picks it up
3. Run `npm run generate` to update MCP data
4. Every product project using `@neofloai/atoms` gets the new color on next deploy

---

## AI Editor Integration

This repo is built **AI-first**. The Cursor rules in `.cursor/rules/` are loaded automatically when working in this repo. They enforce:

- Always wrap MUI components, never write from scratch
- Always use tokens from the theme
- Always export Neoflo API (not MUI API) to consumers
- Always update component examples after API changes

See `CLAUDE.md` for Claude Code specific guidelines.

### Building something with Atoms from another project

An editor connected to the MCP endpoint is handed the order of operations at connect time, so it applies without anyone pasting a prompt:

1. **`start_project` before any code.** Called with nothing it returns nine questions; called again with the answers it returns the build plan — framework, location on disk, and the calls to make in order. It withholds the plan until the required answers are in (three to six of the nine, depending on what is being built), because the expensive mistakes in this work are decisions made on the user's behalf rather than typos.

   The first question asks what you want to create, and it is the fork the rest hangs off: a **prototype** (always React + Vite, sample data, no backend and no stored state), the frontend of a **new project** (asked React or Next, React recommended), or Atoms going into a **project that already exists** (an install, nothing created). Nobody is asked who they are — the same three answers cover a designer, a manager and an engineer.
2. **`scaffold_app` to create it**, in the user's Desktop folder — never the agent's working directory, which is a sandbox. Atoms, the theme, the favicon and the mark are all wired by the returned commands.
3. **`get_pattern`** before composing a screen, **`get_component`** before using one (including its Related section), **`get_tokens`** before writing any colour or spacing value.

The questions, and why each one is asked: [atoms.neoflo.ai/start-a-project](https://atoms.neoflo.ai/start-a-project).

---

## Scripts

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start docs website + MCP endpoint (localhost:3000) |
| `npm run build`    | Production build of docs website                   |
| `npm run start`    | Start production server                            |
| `npm run lint`     | Run ESLint                                         |
| `npm run generate` | Generate `data/*.json` from `src/`                  |

---

## Governance

- **Components are locked.** Engineers install via npm — they can't modify `node_modules`.
- **CODEOWNERS approval required** for changes to `src/components/`, `src/tokens/`, and `src/theme/`.
- **No direct MUI imports** in product projects. If MUI is needed, it should be exposed through Atoms first.
- **No new components without design approval.** Designer signs off via Paper.design link in the PR.

---

## Troubleshooting

- **CI `verify` fails at the data-freshness step** — If your change touched components or tokens, run `npm run generate` and commit the updated `data/*.json` first, otherwise the `verify` job fails because the committed data is out of sync with `src/`.

---

## Need Help?

Full version, with what to put in an issue: [atoms.neoflo.ai/help](https://atoms.neoflo.ai/help).

- **Component not in Atoms?** — [Raise an issue](https://github.com/neofloai/atoms/issues/new?labels=component-request) with the `component-request` label
- **Found a bug?** — [Raise an issue](https://github.com/neofloai/atoms/issues/new?labels=bug) with the `bug` label. Say which colour mode and which surface, and paste the snippet
- **MUI behaves oddly?** — Check [mui.com](https://mui.com) first, then ping #frontend-design-system on Slack
- **MCP not connecting?** — Verify `npm run generate` ran, check `.cursor/mcp.json` URL, see the [MCP guide](https://atoms.neoflo.ai/mcp-guide)

---

**Maintained by:**

| Name                  | Area        | Contact                                             |
| --------------------- | ----------- | --------------------------------------------------- |
| Ankit Verma           | Engineering | [ankit.v@neoflo.ai](mailto:ankit.v@neoflo.ai)       |
| Dhruva Vijayaraghavan | Design      | [dhruva.v@neoflo.ai](mailto:dhruva.v@neoflo.ai)     |

Day to day, **#frontend-design-system** on Slack is faster than email.
