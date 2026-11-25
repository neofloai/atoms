import { z } from 'zod';

import {
  loadBrand,
  loadComponents,
  loadPatterns,
  loadProject,
  loadRelease,
  loadTokens,
} from '../data-loader';
import {
  STRONG_MATCH,
  componentSearchable,
  matchesEveryTerm,
  scoreMatch,
} from '../lookup';

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

/** A ranked hit, before it is formatted. */
interface ScoredHit extends SearchHit {
  score: number;
}

/**
 * How many components a search lists. A broad query ("menu", "layout")
 * touches a third of the catalogue in passing; past the first few, a hit
 * is noise that pushes the answer off the screen.
 */
const MAX_COMPONENT_HITS = 8;

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
        'Searches across @neofloai/atoms components, patterns, token categories, Neoflo brand guidelines (logo, brand colours, fonts, theme), the release changelog, and the project intake guide. Takes the words a user would use — "sidebar", "account dropdown", "navbar sidebar", "workspace switcher" — and matches each word on its own, so a query naming two things finds both; hits are ranked best first. Returns a markdown list; brand, guide and release hits include the full guidance inline, others name the tool to call next. Use this when you are not sure which component, pattern, or brand answer you need, or what Atoms calls the thing the user named.',
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe(
            'What to find, in the user\'s words, e.g. "sidebar", "account menu", "navbar sidebar", "spacing", "dashboard", "logo", "brand fonts".'
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
      // words its summary happened to use. Every term has to match, not
      // just one: "navbar version" is a question about the release, and
      // "navbar" alone is not.
      const releaseText = [
        'changelog',
        release.current,
        release.currentTag,
        ...release.keywords,
        ...release.releases.flatMap((entry) => [entry.version, entry.tag]),
      ].join(' ');
      if (matchesEveryTerm(query, releaseText)) {
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
      if (matchesEveryTerm(query, projectText)) {
        hits.push({
          kind: 'guide',
          name: 'Starting a project',
          summary:
            'What to find out before building anything, and which framework the answers resolve to.',
          details:
            'Call `start_project` with no arguments to get the questions to ask, then again with the answers to get the build plan. Do not scaffold or write components before that plan exists. `scaffold_app` then creates the project in the user\'s Desktop folder with Atoms, the theme and the brand already wired.',
        });
      }

      // Everything else is ranked together, best first, so a pattern that
      // is the whole answer ("dashboard", "app shell") is not listed under
      // every component that mentions it in passing.
      const ranked: ScoredHit[] = [];

      for (const section of brand.brand.sections) {
        const score = scoreMatch(query, {
          name: section.title,
          keywords: [brand.brand.name, ...section.keywords],
          summary: section.summary,
          body: section.body,
        });
        if (score > 0) {
          ranked.push({
            kind: 'brand',
            name: `${brand.brand.name} ${section.title}`,
            summary: section.summary,
            details: section.body,
            score,
          });
        }
      }

      // The everyday names a component carries in `keywords` count almost
      // as much as its own name. Without them, finding the app shell
      // requires already knowing it is called `Drawer`.
      const componentHits: ScoredHit[] = [];
      for (const component of components.components) {
        const score = scoreMatch(query, componentSearchable(component));
        if (score > 0) {
          componentHits.push({
            kind: 'component',
            name: component.name,
            summary: component.tagline,
            score,
          });
        }
      }
      componentHits.sort((a, b) => b.score - a.score);
      ranked.push(...componentHits.slice(0, MAX_COMPONENT_HITS));

      for (const pattern of patterns.patterns) {
        const score = scoreMatch(query, {
          name: pattern.name,
          keywords: [pattern.slug],
          summary: pattern.description,
          body: pattern.components.join(' '),
        });
        if (score > 0) {
          ranked.push({
            kind: 'pattern',
            name: pattern.slug,
            summary: pattern.description,
            score,
          });
        }
      }

      for (const category of Object.keys(tokens.tokens)) {
        // Every category answers to the word for all of them, so "tokens"
        // lists the categories rather than whichever components happen to
        // mention a token in their prose.
        const score = scoreMatch(query, {
          name: category,
          keywords: ['tokens', 'design tokens'],
          summary: '',
        });
        if (score > 0) {
          ranked.push({
            kind: 'token category',
            name: category,
            summary: `Design tokens for ${category}. Fetch with get_tokens.`,
            score,
          });
        }
      }

      // A term found only in a body is a mention in passing. Show those
      // only when nothing better matched, rather than as a tail of noise
      // under the real answers.
      ranked.sort((a, b) => b.score - a.score);
      const strong = ranked.filter((hit) => hit.score >= STRONG_MATCH);
      for (const hit of strong.length > 0 ? strong : ranked) {
        hits.push({ kind: hit.kind, name: hit.name, summary: hit.summary, details: hit.details });
      }

      if (hits.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No results for "${query}". Try the everyday word for the thing ("sidebar", "dropdown", "topbar"), or list_components to browse everything that exists.`,
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
