import { NextResponse } from 'next/server';

/**
 * MCP HTTP endpoint for `@neoflo/atoms`.
 *
 * Wires the MCP server in `src/mcp/server.ts` to a Streamable HTTP
 * transport so AI editors (Cursor, Claude Code) can list components,
 * tokens, and patterns at request time.
 *
 * Implementation lands once the first MCP tool is registered. For now
 * the handlers respond with a clear "not yet implemented" payload so
 * misconfigured clients fail loudly during local development.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      error: 'not_implemented',
      message:
        'MCP transport not yet wired up. See src/mcp/server.ts and app/mcp/route.ts.',
    },
    { status: 501 }
  );
}

export async function POST(): Promise<Response> {
  return NextResponse.json(
    {
      error: 'not_implemented',
      message:
        'MCP transport not yet wired up. See src/mcp/server.ts and app/mcp/route.ts.',
    },
    { status: 501 }
  );
}
