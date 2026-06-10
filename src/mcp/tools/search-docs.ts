import { z } from 'zod';

import { loadComponents, loadPatterns, loadTokens } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface SearchHit {
  kind: 'component' | 'pattern' | 'token category';
  name: string;
  summary: string;
}

function matches(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query);
}

/**
 * Registers the `search_docs` tool: keyword search across components,
 * patterns, and token categories.
 */
export function registerSearchDocs(server: McpServer): void {
  server.registerTool(
    'search_docs',
    {
      title: 'Search docs',
      description:
        'Searches across @neoflo/atoms components, patterns, and token categories by keyword. Returns a markdown list of hits with the tool to call next for full details. Use this when you are not sure which component or pattern you need.',
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe('Search keyword, e.g. "button", "spacing", "dashboard".'),
      },
    },
    async ({ query }) => {
      const [components, patterns, tokens] = await Promise.all([
        loadComponents(),
        loadPatterns(),
        loadTokens(),
      ]);

      const q = query.toLowerCase();
      const hits: SearchHit[] = [];

      for (const component of components.components) {
        const text = [
          component.name,
          component.category,
          component.tagline,
          ...component.props.map((p) => `${p.name} ${p.description}`),
        ].join(' ');
        if (matches(text, q)) {
          hits.push({
            kind: 'component',
            name: component.name,
            summary: component.tagline,
          });
        }
      }

      for (const pattern of patterns.patterns) {
        if (matches(`${pattern.name} ${pattern.slug} ${pattern.description}`, q)) {
          hits.push({
            kind: 'pattern',
            name: pattern.slug,
            summary: pattern.description,
          });
        }
      }

      for (const category of Object.keys(tokens.tokens)) {
        if (matches(category, q)) {
          hits.push({
            kind: 'token category',
            name: category,
            summary: `Design tokens for ${category}. Fetch with get_tokens.`,
          });
        }
      }

      if (hits.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No results for "${query}". Try list_components to browse everything that exists.`,
            },
          ],
        };
      }

      const lines = hits.map(
        (hit) => `- **${hit.name}** (${hit.kind}) — ${hit.summary}`
      );
      return {
        content: [
          {
            type: 'text',
            text: `# Search results for "${query}"\n\n${lines.join('\n')}\n\nNext step: call get_component, get_pattern, or get_tokens for full details.`,
          },
        ],
      };
    }
  );
}
