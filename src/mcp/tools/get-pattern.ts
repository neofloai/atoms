import { z } from 'zod';

import { loadPatterns } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Registers the `get_pattern` tool: returns the full code for a named
 * page layout pattern.
 */
export function registerGetPattern(server: McpServer): void {
  server.registerTool(
    'get_pattern',
    {
      title: 'Get page pattern',
      description:
        'Returns the full page layout code for a named pattern (dashboard, settings, auth, etc.) built from @neofloai/atoms components. Returns markdown with a complete tsx code block. Use this instead of composing page layouts from scratch.',
      inputSchema: {
        name: z
          .string()
          .describe('Pattern name or slug, e.g. "dashboard", "settings".'),
      },
    },
    async ({ name }) => {
      const manifest = await loadPatterns();
      const query = name.toLowerCase();
      const pattern = manifest.patterns.find(
        (p) => p.name.toLowerCase() === query || p.slug.toLowerCase() === query
      );

      if (!pattern) {
        const available =
          manifest.patterns.map((p) => p.slug).join(', ') ||
          'none published yet';
        return {
          content: [
            {
              type: 'text',
              text: `Pattern "${name}" not found. Available: ${available}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `# ${pattern.name}\n\n${pattern.description}\n\n\`\`\`tsx\n${pattern.code}\n\`\`\``,
          },
        ],
      };
    }
  );
}
