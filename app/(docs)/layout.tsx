import * as React from 'react';
import { DocsShell } from './_components/DocsShell';

interface DocsLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared layout for every page under the `(docs)` route group.
 *
 * The MCP HTTP handler at `app/mcp/route.ts` lives outside this group
 * and is intentionally not wrapped by the docs chrome.
 */
export default function DocsLayout({ children }: DocsLayoutProps) {
  return <DocsShell>{children}</DocsShell>;
}
