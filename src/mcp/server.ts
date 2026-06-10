import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Atoms MCP server.
 *
 * Tool implementations live in `./tools/` and are registered here. The
 * HTTP transport (Streamable HTTP) is wired up in `app/mcp/route.ts`.
 *
 * Tools are registered lazily so the bundle stays small and so adding a
 * new tool does not require touching the transport layer.
 */
export function createAtomsMcpServer(): McpServer {
  const server = new McpServer({
    name: 'atoms',
    version: '0.1.0',
  });

  // Tool registrations land here as `src/mcp/tools/*` files are added:
  //   registerListComponents(server);
  //   registerGetComponent(server);
  //   registerGetTokens(server);
  //   registerGetPattern(server);
  //   registerSearchDocs(server);

  return server;
}
