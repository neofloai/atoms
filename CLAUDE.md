# Neoflo Atoms — Claude Code

Project rules are shared with Cursor and live in `.cursor/rules/` — that folder is the **single source of truth for both tools, so edit rules there, not here.** Cursor auto-attaches them by glob. Claude has no glob auto-attach, so this file imports the always-on rules and points to the path-scoped ones.

## Always-on rules (imported into every session)

@.cursor/rules/00-core.mdc
@.cursor/rules/70-code-style.mdc
@.cursor/rules/80-project-intake.mdc

## Path-scoped rules — open the matching file before working in that area

- MUI usage → `.cursor/rules/10-mui-usage.mdc` — `src/components/**`, `src/theme/**`
- Design tokens → `.cursor/rules/20-tokens.mdc` — `src/tokens/**`, `src/theme/**`, `src/components/**`
- Component authoring → `.cursor/rules/30-components.mdc` — `src/components/**`
- Next.js App Router → `.cursor/rules/40-nextjs.mdc` — `app/**`, `next.config.ts`
- Documentation → `.cursor/rules/50-docs.mdc` — `*.examples.tsx`, `app/(docs)/**`
- MCP server → `.cursor/rules/60-mcp.mdc` — `src/mcp/**`, `app/mcp/**`, `scripts/generate.ts`

## Workflow for adding a component

1. Check MUI has it first: https://mui.com/material-ui/all-components/
2. Create `src/components/<Name>/` with `<Name>.tsx`, `<Name>.types.ts`, `<Name>.examples.tsx`, `index.ts`
3. Wrap the MUI component with the Neoflo API
4. Add it to `src/index.ts` public exports
5. Add a docs page at `app/(docs)/components/<slug>/page.tsx`
6. Run `npm run generate`
7. Test in the browser: `npm run dev`

## When stuck

- MUI component API → https://mui.com/material-ui/
- MUI v9 migration → https://mui.com/material-ui/migration/upgrade-to-v7/
- Architecture question → re-read `.cursor/rules/00-core.mdc`
