import { z } from 'zod';

import { loadComponents } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ComponentData } from '../types';

function formatComponentResponse(comp: ComponentData): string {
  const propsTable =
    comp.props.length > 0
      ? [
          '| Prop | Type | Default | Description |',
          '|------|------|---------|-------------|',
          ...comp.props.map(
            (p) =>
              `| \`${p.name}\` | \`${p.type}\` | \`${p.default}\` | ${p.description} |`
          ),
        ].join('\n')
      : '_No props documented._';

  const examples =
    comp.examples.length > 0
      ? comp.examples
          .map((e) => `### ${e.title}\n\`\`\`tsx\n${e.code}\n\`\`\``)
          .join('\n\n')
      : '_No examples documented._';

  return [
    `# ${comp.name}`,
    '',
    comp.tagline,
    '',
    `**Import:** \`import { ${comp.name} } from '@neoflo/atoms';\``,
    '',
    '## Props',
    '',
    propsTable,
    '',
    '## Examples',
    '',
    examples,
    '',
    '## Do',
    comp.dos.map((d) => `- ${d}`).join('\n') || '_None documented._',
    '',
    "## Don't",
    comp.donts.map((d) => `- ${d}`).join('\n') || '_None documented._',
  ].join('\n');
}

/**
 * Registers the `get_component` tool: returns the full spec for a named
 * component.
 */
export function registerGetComponent(server: McpServer): void {
  server.registerTool(
    'get_component',
    {
      title: 'Get component spec',
      description:
        "Get full details for a specific component: props with TypeScript types, defaults, code examples, do's and don'ts. Returns markdown. Always call this before using a component to get the correct API.",
      inputSchema: {
        name: z
          .string()
          .describe('Component name, e.g. "Button", "TextField". Case-sensitive.'),
      },
    },
    async ({ name }) => {
      const manifest = await loadComponents();
      const component = manifest.components.find((c) => c.name === name);

      if (!component) {
        const available =
          manifest.components.map((c) => c.name).join(', ') ||
          'none published yet';
        return {
          content: [
            {
              type: 'text',
              text: `Component "${name}" not found. Available: ${available}`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: formatComponentResponse(component) }],
      };
    }
  );
}
