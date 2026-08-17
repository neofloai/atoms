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

      // The guidance goes with the code rather than being left on the
      // docs page: a caller reaching for a whole screen is the caller
      // most likely to paste it verbatim, and the do/don't lines are
      // where the layout rules that are easy to get backwards live.
      const sections = [
        `# ${pattern.name}`,
        pattern.description,
        `Built from: ${pattern.components.join(', ')}. Call \`get_component\` for any of them.`,
        `\`\`\`tsx\n${pattern.code}\n\`\`\``,
        `## Do\n\n${pattern.dos.map((item) => `- ${item}`).join('\n')}`,
        `## Don't\n\n${pattern.donts.map((item) => `- ${item}`).join('\n')}`,
      ];

      return {
        content: [{ type: 'text', text: sections.join('\n\n') }],
      };
    }
  );
}
