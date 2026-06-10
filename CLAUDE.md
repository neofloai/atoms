# Atoms — Guidelines for Claude Code

You are working in the **Neoflo Atoms** repo. This is a Next.js 16 design system that wraps Material UI v9 and exposes an MCP endpoint for AI editors.

## Read these first

Before writing any code, read these files to understand the architecture:

- `.cursor/rules/00-core.mdc` — Core architecture
- `.cursor/rules/10-mui-usage.mdc` — How to use MUI
- `.cursor/rules/20-tokens.mdc` — Design token rules
- `.cursor/rules/30-components.mdc` — Component authoring standards
- `.cursor/rules/40-nextjs.mdc` — Next.js App Router conventions
- `.cursor/rules/50-docs.mdc` — Documentation standards
- `.cursor/rules/60-mcp.mdc` — MCP server rules
- `.cursor/rules/70-code-style.mdc` - Code style guide

## Tech stack (locked)

- Next.js 16 App Router (not Pages Router)
- React 19
- TypeScript 5 (strict mode)
- MUI v9 (`@mui/material@^9.0.1`)
- Emotion (MUI default styling engine)
- @modelcontextprotocol/sdk

Do not propose alternatives without explicit user approval.

## The most important rules

1. **Wrap MUI, don't reinvent.** Every component wraps something MUI already provides.
2. **Neoflo API on the outside, MUI API on the inside.** Consumers see `variant="primary"`, not `variant="contained"`.
3. **Tokens through the theme.** Never hardcode `#hex`, `px`, or font sizes.
4. **MCP data is generated.** Never hand-edit `data/*.json` — always go through `scripts/generate.ts`.
5. **App Router only.** No `pages/` directory.

## Workflow for adding a component

1. Check MUI has it first: https://mui.com/material-ui/all-components/
2. Create `src/components/<Name>/` with: `<Name>.tsx`, `<Name>.types.ts`, `<Name>.examples.tsx`, `index.ts`
3. Wrap the MUI component with Neoflo API
4. Add to `src/index.ts` public exports
5. Add docs page at `app/(docs)/components/<slug>/page.tsx`
6. Run `npm run generate`
7. Test in browser: `npm run dev`

## Common mistakes to avoid

- Do not import from `@mui/material` outside `src/components/` and `src/theme/`
- Do not write CSS files (use `sx` prop or `styled()`)
- Do not hardcode values that should be tokens
- Do not forget `'use client'` directive on interactive components
- Do not use deep MUI imports (`@mui/material/styles/createTheme` — broken in v7+)
- Do not edit `data/*.json` by hand
- Do not add `npm` dependencies without confirming with the user

## When stuck

- MUI question? Check https://mui.com/material-ui/
- MUI v9 migration? Check https://mui.com/material-ui/migration/upgrade-to-v7/
- Architecture question? Re-read `.cursor/rules/00-core.mdc`

## Important behavioral rules

- **Be precise about file paths.** This repo has strict directory ownership. Don't put files in wrong locations.
- **Confirm before installing packages.** Every new dependency adds maintenance cost.
- **Run `npm run generate` after structural changes.** Forgetting this breaks MCP data.
- **Read the rules files when working in their scoped paths.** The `globs` field tells you when they apply.
