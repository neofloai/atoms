import { z } from 'zod';

import {
  loadBrand,
  loadComponents,
  loadPatterns,
  loadTokens,
} from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface SearchHit {
  kind: 'component' | 'pattern' | 'token category' | 'brand';
  name: string;
  summary: string;
  /**
   * Full text for self-contained hits (brand guidance). Brand has no
   * dedicated `get_*` tool, so the answer travels with the hit.
   */
  details?: string;
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
        'Searches across @neoflo/atoms components, patterns, token categories, and Neoflo brand guidelines (logo, brand colours, fonts, theme) by keyword. Returns a markdown list of hits; brand hits include the full guidance inline, others name the tool to call next. Use this when you are not sure which component, pattern, or brand answer you need.',
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe(
            'Search keyword, e.g. "button", "spacing", "dashboard", "logo", "brand fonts".'
          ),
      },
    },
    async ({ query }) => {
      const [components, patterns, tokens, brand] = await Promise.all([
        loadComponents(),
        loadPatterns(),
        loadTokens(),
        loadBrand(),
      ]);

      const q = query.toLowerCase();
      const hits: SearchHit[] = [];

      for (const section of brand.brand.sections) {
        const text = [
          brand.brand.name,
          section.title,
          section.summary,
          section.body,
          ...section.keywords,
        ].join(' ');
        if (matches(text, q)) {
          hits.push({
            kind: 'brand',
            name: `${brand.brand.name} ${section.title}`,
            summary: section.summary,
            details: section.body,
          });
        }
      }

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

      const lines = hits.map((hit) => {
        const heading = `- **${hit.name}** (${hit.kind}) — ${hit.summary}`;
        if (!hit.details) return heading;
        // Indent the inline brand guidance so it nests under the bullet.
        const indented = hit.details
          .split('\n')
          .map((line) => (line ? `  ${line}` : ''))
          .join('\n');
        return `${heading}\n\n${indented}`;
      });
      return {
        content: [
          {
            type: 'text',
            text: `# Search results for "${query}"\n\n${lines.join('\n\n')}\n\nNext step: brand hits are answered inline; for components/patterns/tokens call get_component, get_pattern, or get_tokens.`,
          },
        ],
      };
    }
  );
}
