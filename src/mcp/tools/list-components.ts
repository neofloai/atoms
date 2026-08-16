import { loadComponents } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ComponentData } from '../types';

function formatComponentList(components: ComponentData[]): string {
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

  return `# @neofloai/atoms components\n\n${sections.join('\n\n')}\n\nCall \`get_component\` with a component name for the full spec.`;
}

/**
 * Registers the `list_components` tool: lists every published component
 * grouped by category.
 */
export function registerListComponents(server: McpServer): void {
  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description:
        'Lists all @neofloai/atoms components grouped by category, with a one-line tagline each. Returns markdown. Always call this first to discover what exists before reaching for raw MUI.',
    },
    async () => {
      const manifest = await loadComponents();
      return {
        content: [
          { type: 'text', text: formatComponentList(manifest.components) },
        ],
      };
    }
  );
}
