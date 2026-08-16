import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { NextResponse } from 'next/server';

import { createAtomsMcpServer } from '@/src/mcp/server';

/**
 * MCP HTTP endpoint for `@neofloai/atoms`.
 *
 * Serves the MCP server from `src/mcp/server.ts` over the Streamable
 * HTTP transport so AI editors (Cursor, Claude Code) can list
 * components, tokens, and patterns at request time.
 *
 * Runs in stateless mode: each request gets a fresh server + transport
 * pair, which keeps the route compatible with serverless deployment
 * (no in-memory session affinity required).
 *
 * Auth: open in development; in production a Bearer token is required
 * when the `MCP_TOKEN` env var is set.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function unauthorized(): Response {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isAuthorized(request: Request): boolean {
  const token = process.env.MCP_TOKEN;
  if (process.env.NODE_ENV !== 'production' || !token) {
    return true;
  }
  return request.headers.get('authorization') === `Bearer ${token}`;
}

async function handleMcpRequest(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  const server = createAtomsMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    // Stateless mode: no session IDs, every request is self-contained.
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function GET(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}
