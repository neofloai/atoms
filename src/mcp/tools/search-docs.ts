import { z } from 'zod';

import {
  loadBrand,
  loadComponents,
  loadPatterns,
  loadProject,
  loadRelease,
  loadTokens,
} from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

interface SearchHit {
  kind:
    | 'component'
    | 'pattern'
    | 'token category'
    | 'brand'
    | 'guide'
    | 'release';
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
        'Searches across @neofloai/atoms components, patterns, token categories, Neoflo brand guidelines (logo, brand colours, fonts, theme), the release changelog, and the project intake guide by keyword. Returns a markdown list of hits; brand, guide and release hits include the full guidance inline, others name the tool to call next. Use this when you are not sure which component, pattern, or brand answer you need.',
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
      const [components, patterns, tokens, brand, project, release] =
        await Promise.all([
          loadComponents(),
          loadPatterns(),
          loadTokens(),
          loadBrand(),
          loadProject(),
          loadRelease(),
        ]);

      const q = query.toLowerCase();
      const hits: SearchHit[] = [];

      // The release record goes first when it matches, for the same
      // reason the intake does: "which version am I on" has to be
      // answered before the answer to anything else can be trusted.
      //
      // Matched against curated keywords and version strings only — no
      // release prose, not the headlines and not the change summaries.
      // Prose names components, tokens and patterns in passing, and
      // because this block is pushed first, one word in a release note is
      // enough to bury the thing a search was actually for. It is not
      // hypothetical: the 1.0.0 headline reads "the component library,
      // the tokens, the patterns…", which was quietly answering every
      // search for `tokens` with the changelog.
      //
      // So a release becomes findable by adding a keyword in
      // `src/release/index.ts`, deliberately, rather than by whatever
      // words its summary happened to use.
      const releaseText = [
        'changelog',
        release.current,
        release.currentTag,
        ...release.keywords,
        ...release.releases.flatMap((entry) => [entry.version, entry.tag]),
      ].join(' ');
      if (matches(releaseText, q)) {
        hits.push({
          kind: 'release',
          name: `Changelog (current: ${release.current})`,
          summary: release.releases[0]?.headline ?? 'Release history.',
          details: `Call \`check_version\` for the full notes and a verdict on a project's installed version — pass \`installedVersion\` from \`${release.commands.readInstalled}\`. To install or move onto the current release: \`${release.commands.upgrade}\`.`,
        });
      }

      // The intake goes first when it matches at all: someone asking how
      // to start something is asking the question that has to be answered
      // before any component is the right answer. Matched against its own
      // keywords rather than the interview text, because the questions
      // mention tables and columns in passing and a search for `table`
      // wants a component.
      const projectText = [
        'starting a project',
        ...project.keywords,
        ...project.targets.map((target) => target.label),
      ].join(' ');
      if (matches(projectText, q)) {
        hits.push({
          kind: 'guide',
          name: 'Starting a project',
          summary:
            'What to find out before building anything, and which framework the answers resolve to.',
          details:
            'Call `start_project` with no arguments to get the questions to ask, then again with the answers to get the build plan. Do not scaffold or write components before that plan exists. `scaffold_app` then creates the project in the user\'s Desktop folder with Atoms, the theme and the brand already wired.',
        });
      }

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
          // The everyday names for the thing, which the tagline cannot
          // carry and still read as a sentence. Without these, finding the
          // app shell requires already knowing it is called `Drawer`.
          ...(component.keywords ?? []),
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
            text: `# Search results for "${query}"\n\n${lines.join('\n\n')}\n\nNext step: brand, guide and release hits are answered inline; for components/patterns/tokens call get_component, get_pattern, or get_tokens.`,
          },
        ],
      };
    }
  );
}
