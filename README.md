# Atoms

> **Neoflo's AI-Powered Design System** — One repo. One platform. Consistent UI everywhere.

A Next.js-based design system that wraps Material UI v9 with Neoflo's brand, exposes components via a documentation website, and provides an MCP endpoint so AI editors (Cursor, Claude Code) generate design-system-compliant code automatically.

---

## What Atoms is

Atoms is **three things in one repo**:

1. **A React component library** — engineers install `@neoflo/atoms` in their projects
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
├── app/                        # Next.js App Router
│   ├── (docs)/                 # Documentation website routes
│   │   ├── page.tsx            # Home — component gallery
│   │   ├── components/         # Component documentation pages
│   │   ├── tokens/             # Design tokens reference
│   │   └── patterns/           # Page layout patterns
│   ├── mcp/                    # MCP endpoint (HTTP transport)
│   │   └── route.ts            # POST /mcp — MCP server handler
│   ├── layout.tsx              # Root layout with MUI ThemeProvider
│   └── globals.css             # Global styles (minimal)
│
├── src/
│   ├── components/             # Neoflo wrapper components (export these)
│   │   ├── Button/
│   │   │   ├── Button.tsx      # Wraps MUI Button with Neoflo API
│   │   │   ├── Button.types.ts # TypeScript prop interfaces
│   │   │   ├── Button.examples.tsx  # Code examples for docs + MCP
│   │   │   └── index.ts
│   │   ├── TextField/
│   │   ├── Card/
│   │   └── ...
│   │
│   ├── tokens/                 # Design tokens (single source of truth)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   ├── radius.ts
│   │   └── index.ts
│   │
│   ├── theme/                  # MUI theme built from Neoflo tokens
│   │   ├── index.ts            # createTheme(...) export
│   │   ├── palette.ts          # Color mapping to MUI palette
│   │   ├── typography.ts       # Typography variants
│   │   └── components.ts       # MUI component default overrides
│   │
│   ├── patterns/               # Page layout recipes
│   │   ├── dashboard.tsx
│   │   ├── settings.tsx
│   │   └── auth.tsx
│   │
│   ├── mcp/                    # MCP server logic
│   │   ├── server.ts           # MCP server instance
│   │   ├── tools/              # Individual tool implementations
│   │   │   ├── list-components.ts
│   │   │   ├── get-component.ts
│   │   │   ├── get-tokens.ts
│   │   │   ├── get-pattern.ts
│   │   │   └── search-docs.ts
│   │   └── data-loader.ts      # Loads JSON from data/ directory
│   │
│   └── index.ts                # Public package exports
│
├── scripts/
│   └── generate.ts             # Generates data/ JSON from src/components/
│
├── data/                       # Auto-generated (DO NOT EDIT MANUALLY)
│   ├── components.json
│   ├── tokens.json
│   └── patterns.json
│
├── .cursor/
│   ├── mcp.json                # MCP config for this repo
│   └── rules/                  # Cursor AI guardrails
│       ├── 00-core.mdc         # Core architecture rules
│       ├── 10-mui-usage.mdc    # MUI integration rules
│       ├── 20-tokens.mdc       # Token usage rules
│       ├── 30-components.mdc   # Component authoring rules
│       ├── 40-nextjs.mdc       # Next.js App Router conventions
│       ├── 50-docs.mdc         # Documentation rules
│       ├── 60-mcp.mdc          # MCP server rules
│       └── 70-code-style.mdc   # Code style guide
│
├── CLAUDE.md                   # Guidelines for Claude Code users
├── package.json
├── tsconfig.json
├── next.config.ts
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

## Connect from Cursor

> Full guide with Claude Code instructions and the tool reference: [atoms.neoflo.ai/mcp-guide](https://atoms.neoflo.ai/mcp-guide)

In **your product project** (not this repo), add `.cursor/mcp.json`:

**For local development:**

```json
{
  "mcpServers": {
    "atoms": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**For production:**

```json
{
  "mcpServers": {
    "atoms": {
      "url": "https://atoms.neoflo.ai/mcp",
      "headers": {
        "Authorization": "Bearer <NEOFLO_INTERNAL_TOKEN>"
      }
    }
  }
}
```

Restart Cursor. Open the **MCP Servers** panel — "atoms" should appear with a green dot.

---

## Installing Atoms in Product Projects

> Full guide with CI/Docker auth and version pinning: [atoms.neoflo.ai/installation](https://atoms.neoflo.ai/installation)

The package is not published to the public npm registry — it installs straight from the private GitHub repo (read access required):

```bash
# SSH (recommended for local machines)
npm install git+ssh://git@github.com/neofloai/atoms.git

# Pin to a tag for reproducible builds
npm install git+ssh://git@github.com/neofloai/atoms.git#v0.1.0
```

The package ships TypeScript source, so tell Next.js to compile it:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@neoflo/atoms"],
};

export default nextConfig;
```

```tsx
// app/layout.tsx
import { NeofloThemeProvider } from "@neoflo/atoms";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NeofloThemeProvider>{children}</NeofloThemeProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx
import { Button, TextField, Card } from "@neoflo/atoms";

export default function Page() {
  return (
    <Card>
      <TextField label="Email" placeholder="you@neoflo.ai" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

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
4. Every product project using `@neoflo/atoms` gets the new color on next deploy

---

## AI Editor Integration

This repo is built **AI-first**. The Cursor rules in `.cursor/rules/` are loaded automatically when working in this repo. They enforce:

- Always wrap MUI components, never write from scratch
- Always use tokens from the theme
- Always export Neoflo API (not MUI API) to consumers
- Always update component examples after API changes

See `CLAUDE.md` for Claude Code specific guidelines.

---

## Scripts

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start docs website + MCP endpoint (localhost:3000) |
| `npm run build`    | Production build of docs website                   |
| `npm run start`    | Start production server                            |
| `npm run lint`     | Run ESLint                                         |
| `npm run generate` | Generate `data/*.json` from `src/components/`      |

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

- **Component not in Atoms?** — [Raise an issue](https://github.com/neofloai/atoms/issues) with the `component-request` label
- **MUI behaves oddly?** — Check [mui.com](https://mui.com) first, then ping #design-system on Slack
- **MCP not connecting?** — Verify `npm run generate` ran, check `.cursor/mcp.json` URL, see the [MCP guide](https://atoms.neoflo.ai/mcp-guide)

---

**Maintained by:** Frontend platform team
**Tech lead:** @ankit
**Design lead:** @dhruva
