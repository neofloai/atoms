import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerCheckVersion } from './tools/check-version';
import { registerGetComponent } from './tools/get-component';
import { registerGetInstallation } from './tools/get-installation';
import { registerGetPattern } from './tools/get-pattern';
import { registerGetTokens } from './tools/get-tokens';
import { registerListComponents } from './tools/list-components';
import { registerScaffoldApp } from './tools/scaffold-app';
import { registerSearchDocs } from './tools/search-docs';
import { registerStartProject } from './tools/start-project';

/**
 * What a client is told about this server before it calls anything.
 *
 * Tool descriptions only get read once a tool is already being
 * considered, which is too late for the mistakes that matter here: an
 * agent that has decided to write a dashboard from scratch never looks
 * up whether a dashboard already exists. These are the instructions that
 * arrive at connect time, so they are the only place to put the order of
 * operations.
 */
const INSTRUCTIONS = `Atoms is Neoflo's design system: React components, design tokens, page patterns, and the brand.

Order of operations, and it matters:

1. If the user wants something BUILT — a prototype, a demo, an app, a screen, or a feature in an app that already exists — call \`start_project\` FIRST, before writing any code. It returns the questions to ask. Ask them, then call it again with the answers to get a build plan. Do not scaffold, install, or write a component before that plan exists. The most expensive mistakes here are decisions made on the user's behalf, not typos.

2. Never create a project inside your own working directory or a temp path. \`scaffold_app\` puts it in the user's Desktop folder, where they can find and open it again.

3. Atoms code is version-specific, and this server cannot see the project. If Atoms is going into an app that already exists, resolve its installed version FIRST — \`npm ls @neofloai/atoms --depth=0\` in that project, not the dependency line in its package.json — and pass it as \`installedVersion\` to \`check_version\`, \`get_component\` and \`get_pattern\`. Those last two withhold their code examples until they have it. Nothing to resolve for a new project: \`scaffold_app\` installs the current release.

4. Before composing a screen, call \`get_pattern\`. A pattern is a whole arrangement that has already been reviewed; a screen assembled from individual component docs gets the arrangement wrong in ways no single component doc can warn about. \`list_components\` names the published patterns first for this reason.

5. Before using a component, call \`get_component\`. Read its Related section: several components render the same shape and belong in different contexts, and choosing between them is a decision made before any prop is read.

6. Before writing any colour, spacing, radius or type value, call \`get_tokens\`. Never hardcode a hex or a pixel value the tokens already carry.

7. Import only from \`@neofloai/atoms\`, \`@neofloai/atoms/icons\`, \`@neofloai/atoms/tokens\` and \`@neofloai/atoms/theme\`. Importing from \`@mui/material\` resolves and silently bypasses the design system.

Use \`search_docs\` when you are not sure which of these to reach for; it also answers brand questions inline.`;

/**
 * Atoms MCP server.
 *
 * Tool implementations live in `./tools/` and are registered here. The
 * HTTP transport (Streamable HTTP) is wired up in `app/mcp/route.ts`.
 */
export function createAtomsMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'atoms',
      // Minor: `check_version` added, and `installedVersion` added as an
      // optional input on `get_component` and `get_pattern`. Nothing an
      // existing client called stopped working, so this is not a major.
      version: '1.2.0',
    },
    { instructions: INSTRUCTIONS }
  );

  registerStartProject(server);
  registerCheckVersion(server);
  registerScaffoldApp(server);
  registerListComponents(server);
  registerGetComponent(server);
  registerGetTokens(server);
  registerGetPattern(server);
  registerSearchDocs(server);
  registerGetInstallation(server);

  return server;
}
