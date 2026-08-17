import { z } from 'zod';

import { loadComponents, loadPatterns } from '../data-loader';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ComponentData, PatternData } from '../types';

/**
 * Escapes a value for a markdown table cell.
 *
 * Union types are the norm across this API surface — `Grid`'s `size` is
 * `number | 'auto' | 'grow' | false | responsive` — and an unescaped
 * pipe ends the cell, so the type an agent reads would be truncated at
 * the first union member and the row would gain phantom columns. A
 * literal pipe has to be escaped even inside a code span.
 */
function cell(value: string): string {
  return value.replace(/\|/g, '\\|');
}

/**
 * The published patterns a component appears in.
 *
 * Named on the component's own spec because the mistake this prevents
 * happens before any prop is read: an agent that opens six component
 * docs and assembles a screen from them will get the arrangement wrong,
 * where the pattern would have handed it over whole. The pointer has to
 * be where the reader already is.
 */
function patternsUsing(name: string, patterns: PatternData[]): PatternData[] {
  return patterns.filter((pattern) => pattern.components.includes(name));
}

function formatComponentResponse(
  comp: ComponentData,
  patterns: PatternData[]
): string {
  const propsTable =
    comp.props.length > 0
      ? [
          '| Prop | Type | Default | Description |',
          '|------|------|---------|-------------|',
          ...comp.props.map(
            (p) =>
              `| \`${cell(p.name)}\` | \`${cell(p.type)}\` | \`${cell(p.default)}\` | ${cell(p.description)} |`
          ),
        ].join('\n')
      : '_No props documented._';

  const examples =
    comp.examples.length > 0
      ? comp.examples
          .map((e) => `### ${e.title}\n\`\`\`tsx\n${e.code}\n\`\`\``)
          .join('\n\n')
      : '_No examples documented._';

  const inPatterns = patternsUsing(comp.name, patterns);
  const patternLine =
    inPatterns.length > 0
      ? [
          '',
          `**Used in patterns:** ${inPatterns.map((p) => p.slug).join(', ')}. If you are building a whole screen, call \`get_pattern\` first — the pattern is the arrangement, and the arrangement is what gets re-derived wrong.`,
        ]
      : [];

  const related =
    comp.relatedComponents && comp.relatedComponents.length > 0
      ? [
          '',
          '## Related',
          '',
          `Compare these before committing to ${comp.name}: ${comp.relatedComponents.join(', ')}. Call \`get_component\` for any of them.`,
        ]
      : [];

  return [
    `# ${comp.name}`,
    '',
    comp.tagline,
    '',
    `**Import:** \`import { ${comp.name} } from '@neofloai/atoms';\``,
    ...(comp.figmaUrl ? ['', `**Figma:** ${comp.figmaUrl}`] : []),
    ...patternLine,
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
    ...related,
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
        "Get full details for a specific component: props with TypeScript types, defaults, code examples, do's and don'ts, the patterns it appears in, and the related components worth comparing against it first. Returns markdown. Always call this before using a component to get the correct API — and read the Related section before committing, since several components look alike in a screenshot and are meant for different contexts.",
      inputSchema: {
        name: z
          .string()
          .describe('Component name, e.g. "Button", "TextField". Case-sensitive.'),
      },
    },
    async ({ name }) => {
      const [manifest, patterns] = await Promise.all([
        loadComponents(),
        loadPatterns(),
      ]);
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
        content: [
          {
            type: 'text',
            text: formatComponentResponse(component, patterns.patterns),
          },
        ],
      };
    }
  );
}
