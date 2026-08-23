import { z } from 'zod';

import { loadPatterns } from '../data-loader';
import { gateVersion, installedVersionSchema } from '../version-gate';

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
        'Returns the full page layout code for a named pattern (dashboard, settings, auth, etc.) built from @neofloai/atoms components. Returns markdown with a complete tsx code block. Use this instead of composing page layouts from scratch. Pass `installedVersion` with the version of @neofloai/atoms in the target project — a pattern is a whole file, so it is the response most likely to be pasted wholesale, and the code is withheld until the installed version is known.',
      inputSchema: {
        name: z
          .string()
          .describe('Pattern name or slug, e.g. "dashboard", "settings".'),
        installedVersion: installedVersionSchema,
      },
    },
    async ({ name, installedVersion }) => {
      const [manifest, gate] = await Promise.all([
        loadPatterns(),
        gateVersion(installedVersion),
      ]);
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

      // The same reasoning as `get_component`, with more at stake: this
      // response is a whole file, so it is the one most likely to be
      // pasted without being read. The description, the component list
      // and the do/don't lines still go out when the code does not —
      // knowing which components a screen needs is what makes the next
      // call the right one.
      const body = gate.blocked
        ? gate.notice
        : `\`\`\`tsx\n${pattern.code}\n\`\`\``;
      const banner = !gate.blocked && gate.notice ? [gate.notice] : [];

      const sections = [
        `# ${pattern.name}`,
        pattern.description,
        `Built from: ${pattern.components.join(', ')}. Call \`get_component\` for any of them.`,
        ...banner,
        body,
        `## Do\n\n${pattern.dos.map((item) => `- ${item}`).join('\n')}`,
        `## Don't\n\n${pattern.donts.map((item) => `- ${item}`).join('\n')}`,
      ];

      return {
        content: [{ type: 'text', text: sections.join('\n\n') }],
      };
    }
  );
}
