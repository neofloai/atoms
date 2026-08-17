import { loadComponents, loadPatterns } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ComponentData, PatternData } from '../types';

/**
 * The published patterns, offered before the component list rather than
 * after it.
 *
 * A caller asking what exists is usually about to build a screen, and a
 * screen assembled from six component specs comes out subtly wrong in
 * ways no single spec can warn about. The catalog is the fallback; the
 * pattern is the answer when one covers the screen.
 */
function formatPatternLead(patterns: PatternData[]): string {
  if (patterns.length === 0) {
    return '';
  }

  const lines = patterns.map((p) => `- **${p.slug}** — ${p.description}`);
  return [
    '## Start here: published patterns',
    '',
    'Whole screens, already composed. If one of these is the screen you are building, call `get_pattern` and start from it instead of assembling the layout out of the components below.',
    '',
    lines.join('\n'),
    '',
  ].join('\n');
}

function formatComponentList(
  components: ComponentData[],
  patterns: PatternData[]
): string {
  if (components.length === 0) {
    return 'No components published yet. The @neofloai/atoms component catalog is being built — check back soon.';
  }

  const byCategory = new Map<string, ComponentData[]>();
  for (const component of components) {
    const category = component.category || 'Uncategorized';
    const group = byCategory.get(category) ?? [];
    group.push(component);
    byCategory.set(category, group);
  }

  const sections = [...byCategory.entries()].map(
    ([category, group]) =>
      `## ${category}\n\n${group
        .map((c) => `- **${c.name}** — ${c.tagline}`)
        .join('\n')}`
  );

  return [
    '# @neofloai/atoms components',
    '',
    formatPatternLead(patterns),
    sections.join('\n\n'),
    '',
    'Call `get_component` with a component name for the full spec — props, examples, and the related components worth comparing it against. Taglines say what a component is for, not only what it looks like: two components can render the same shape and belong in different places, so read the spec before choosing between them.',
  ].join('\n');
}

/**
 * Registers the `list_components` tool: lists every published component
 * grouped by category, led by the patterns that already compose them.
 */
export function registerListComponents(server: McpServer): void {
  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'Lists all @neofloai/atoms components grouped by category with a one-line tagline each, led by the published page patterns. Returns markdown. Always call this first to discover what exists before reaching for raw MUI — and prefer a listed pattern over composing a screen yourself.',
    },
    async () => {
      const [manifest, patterns] = await Promise.all([
        loadComponents(),
        loadPatterns(),
      ]);
      return {
        content: [
          {
            type: 'text',
            text: formatComponentList(manifest.components, patterns.patterns),
          },
        ],
      };
    }
  );
}
