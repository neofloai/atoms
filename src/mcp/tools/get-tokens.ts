import { z } from 'zod';

import { loadTokens } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Preambles for categories whose key names need a word of explanation.
 *
 * `text` and `icon` carry the Figma variable names verbatim, so a
 * designer's instruction ("make this text/default/b2") names the token
 * directly. Worth stating outright: an agent that reads `"1": {...}` in
 * the JSON and has to guess whether that is the lightest or darkest rung
 * will sometimes guess wrong, and picking a neighbouring rung produces a
 * wrong colour that looks deliberate.
 */
const CATEGORY_NOTES: Readonly<Record<string, string>> = {
  text: [
    'Every key is the Figma variable name. Drop the category prefix and turn',
    'the slashes into property access:',
    '',
    '  text/default/b2            ->  text.default.b2',
    '  text/primary/3             ->  text.primary[3]',
    '  text/default/body on-color ->  text.default[\'body on-color\']',
    '  text/disabled/on-color     ->  text.disabled[\'on-color\']',
    '',
    'Accent ladders run darkest first, so `1` is the deepest ink and `4` the',
    'lightest. If a designer names a rung that is not here, say so rather than',
    'substituting the nearest one. `warning` and `orange` run 0, 2, 3, 4 — the',
    'missing `1` is Figma\'s numbering, not an omission.',
  ].join('\n'),
  icon: [
    'Named and grouped exactly like `text`, so an icon beside a body string',
    'takes the matching rung: `icon.default.b2` next to `text.default.b2`.',
    'Note `icon/warning` starts at `1` where `text/warning` starts at `0`.',
  ].join('\n'),
  surface: 'Renamed from Figma: tier numbers become state names, so `surface/default/2` is `surface.default.defaultHover`.',
  border: 'Renamed from Figma: tier numbers become state names, so `border/primary/2` is `border.primary.defaultHover`.',
};

function formatTokenCategory(category: string, value: unknown): string {
  const note = CATEGORY_NOTES[category];
  const preamble = note ? `${note}\n\n` : '';
  return `## ${category}\n\n${preamble}\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
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
        'Returns Neoflo design tokens as JSON grouped by category (colors, surface, border, text, icon, spacing, typography, responsive, elevation, radius). Pass a category to narrow the response, or omit it to get everything. Always use these token values instead of hardcoding colors or spacing. Font and icon colours carry the Figma variable names verbatim, so a designer asking for "text/default/b2" is naming `text.default.b2` — call this with category "text" or "icon" to resolve one.',
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
