import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerGetComponent } from './tools/get-component';
import { registerGetInstallation } from './tools/get-installation';
import { registerGetPattern } from './tools/get-pattern';
import { registerGetTokens } from './tools/get-tokens';
import { registerListComponents } from './tools/list-components';
import { registerSearchDocs } from './tools/search-docs';

/**
 * Atoms MCP server.
 *
 * Tool implementations live in `./tools/` and are registered here. The
 * HTTP transport (Streamable HTTP) is wired up in `app/mcp/route.ts`.
 */
export function createAtomsMcpServer(): McpServer {
  const server = new McpServer({
    name: 'atoms',
    version: '1.0.0',
  });

  registerListComponents(server);
  registerGetComponent(server);
  registerGetTokens(server);
  registerGetPattern(server);
  registerSearchDocs(server);
  registerGetInstallation(server);

  return server;
}
