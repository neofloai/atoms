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

/**
 * The two components a screen is framed in, called out by the words a
 * reader would actually use for them.
 *
 * Both are filed under `Navigation` alongside `Tabs`, `Link` and
 * `Breadcrumbs`, which says nothing about either being structural — so the
 * catalogue alone gives no hint that these two come first and that the rest
 * go inside them.
 *
 * Rendered only when both are published, so it never promises half a shell.
 */
function formatShellLead(components: ComponentData[]): string {
  const names = new Set(components.map((c) => c.name));
  if (!names.has('Drawer') || !names.has('Navbar')) {
    return '';
  }

  return [
    '## The app shell: build this first',
    '',
    'Most screens sit in a shell, and it is two components: **Drawer** is the sidebar / sidenav down the left — `variant="permanent" size="sm"` for the 220px rail — and **Navbar** is the topbar above the content. Lay the page out as a row, rail first: the rail owns the full height and the bar begins where the rail ends rather than running the full width above it. Getting that backwards is the single most common mistake, which is why the `dashboard` pattern already arranges it — start from that rather than composing the shell by hand.',
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
    // Named before the catalogue, because the shell is the one thing built
    // first and the easiest to skip. `Drawer` is MUI's word for a sidebar
    // and nobody's first guess for one, so a reader scanning categories for
    // "the sidebar component" does not find it and builds a bare page
    // instead. Two lines here cost less than a screen with no chrome.
    formatShellLead(components),
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
