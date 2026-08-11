import { z } from 'zod';

import { loadTokens } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function formatTokenCategory(category: string, value: unknown): string {
  return `## ${category}\n\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

/**
 * Registers the `get_tokens` tool: returns design tokens, optionally
 * filtered to a single category.
 */
export function registerGetTokens(server: McpServer): void {
  server.registerTool(
    'get_tokens',
    {
      title: 'Get design tokens',
      description:
        'Returns Neoflo design tokens as JSON grouped by category (colors, surface, border, text, icon, spacing, typography, responsive, elevation, radius). Pass a category to narrow the response, or omit it to get everything. Always use these token values instead of hardcoding colors or spacing.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe(
            'Token category to return, e.g. "colors", "spacing", "typography". Omit to list all categories.'
          ),
      },
    },
    async ({ category }) => {
      const manifest = await loadTokens();
      const categories = Object.keys(manifest.tokens);

      if (categories.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No tokens published yet. Run `npm run generate` in the atoms repo to publish token data.',
            },
          ],
        };
      }

      if (category) {
        const value = manifest.tokens[category];
        if (value === undefined) {
          return {
            content: [
              {
                type: 'text',
                text: `Token category "${category}" not found. Available: ${categories.join(', ')}`,
              },
            ],
          };
        }
        return {
          content: [
            { type: 'text', text: formatTokenCategory(category, value) },
          ],
        };
      }

      const sections = categories.map((key) =>
        formatTokenCategory(key, manifest.tokens[key])
      );
      return {
        content: [
          {
            type: 'text',
            text: `# Neoflo design tokens\n\n${sections.join('\n\n')}`,
          },
        ],
      };
    }
  );
}
