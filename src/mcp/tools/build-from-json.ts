import { z } from 'zod';

import { HANDOVER_FORMAT, HANDOVER_FORMAT_VERSION } from '@/extension/src/shared/schema';
import { loadComponents, loadTokens } from '../data-loader';
import { colourPairs, findNode, gapLine, keptInCode, pascal, screenCode } from '../screen-code';
import { gateVersion, installedVersionSchema } from '../version-gate';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Handover, HandoverNode } from '@/extension/src/shared/schema';

/** Names in a subtree, for the regions and ids a caller can build instead. */
function outline(root: HandoverNode): string[] {
  const out: string[] = [];
  const walk = (n: HandoverNode, depth: number) => {
    if (depth > 2 || n.kind === 'text') return;
    const label = n.kind === 'element' ? `<${n.tag}>` : n.kind === 'repeat' ? `list of ${n.count}` : n.name;
    if (n.id) out.push(`${'  '.repeat(depth)}- \`${n.id}\` ${label}${'region' in n && n.region ? ` — region \`${n.region}\`` : ''}`);
    const kids = n.kind === 'repeat' ? n.items.slice(0, 1) : 'children' in n ? (n.children ?? []) : [];
    for (const k of kids) walk(k, depth + 1);
  };
  walk(root, 0);
  return out;
}

function parse(input: unknown): { doc: Handover } | { error: string } {
  let value = input;
  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch (error) {
      return { error: `That is not JSON: ${error instanceof Error ? error.message : String(error)}. Pass the whole \`.atoms.json\` file's contents.` };
    }
  }
  const doc = value as Partial<Handover> | null;
  if (!doc || typeof doc !== 'object' || doc.format !== HANDOVER_FORMAT) {
    return {
      error: `This is not an Atoms export: its \`format\` is ${doc && typeof doc === 'object' && 'format' in doc ? `\`${String(doc.format)}\`` : 'missing'}, not \`${HANDOVER_FORMAT}\`. This tool reads the \`.atoms.json\` file that the Atoms Inspector's Export and Atoms Studio's Hand over write.`,
    };
  }
  if (!doc.tree) return { error: 'The file has no `tree`, so there is nothing to build. Export it again from the Atoms Inspector.' };
  return { doc: doc as Handover };
}

/**
 * Registers the `build_from_json` tool: reads an Atoms export and returns
 * the React code for it, the components to look up, what to wire, and
 * where the design went outside the library.
 */
export function registerBuildFromJson(server: McpServer): void {
  server.registerTool(
    'build_from_json',
    {
      title: 'Build UI from an Atoms JSON export',
      description:
        'Reads an Atoms JSON export — the `.atoms.json` file written by the Atoms Inspector\'s Export and by Atoms Studio\'s Hand over (format "atoms-screen") — and returns markdown with: a complete tsx file that rebuilds the screen from @neofloai/atoms components, layout primitives, icons and tokens, with the props the design passed and its lists turned into sample data; the components to call `get_component` for; the handlers and functions left to wire; and a numbered list of gaps, the places the design went outside the library — restyles of a component (sx, style, Studio overrides) are deliberately left out of the code, and off-token values in the design\'s own markup are kept and marked for a token. Always call this when the user gives you an Atoms JSON export, instead of reading the file and writing the screen by hand. Pass `installedVersion` with the version of @neofloai/atoms in the target project — the code is withheld until it is known.',
      inputSchema: {
        json: z
          .union([z.string(), z.record(z.string(), z.unknown())])
          .describe(
            'The whole Atoms export: the contents of the `.atoms.json` file, as text or as the parsed object. Minified is fine and much smaller — the file is written indented.'
          ),
        installedVersion: installedVersionSchema,
        node: z
          .string()
          .optional()
          .describe(
            'Build only part of the export: a node id from the file (`c12`, `l3`) or a pattern region name (`toolbar`). Omit to build the whole export.'
          ),
        componentName: z
          .string()
          .regex(/^[A-Z][A-Za-z0-9]*$/)
          .optional()
          .describe('The name of the generated React component, in PascalCase. Defaults to one made from the export\'s name.'),
      },
    },
    async ({ json, installedVersion, node, componentName }) => {
      const parsed = parse(json);
      if ('error' in parsed) return { content: [{ type: 'text', text: parsed.error }] };
      const { doc } = parsed;

      const root = node ? findNode(doc.tree, node) : doc.tree;
      if (!root) {
        return {
          content: [
            {
              type: 'text',
              text: [`No node or region \`${node}\` in this export. Its outline:`, '', ...outline(doc.tree), '', 'Pass one of these ids, a region name, or omit `node` to build the whole export.'].join('\n'),
            },
          ],
        };
      }

      const [manifest, tokens, gate] = await Promise.all([loadComponents(), loadTokens(), gateVersion(installedVersion)]);
      const known = manifest.exports ?? manifest.components.map((c) => c.name);
      const name = componentName ?? pascal(node ? `${doc.name}-${node}` : doc.name);
      const built = screenCode(doc, root, known, name, colourPairs(tokens.tokens), node);

      const captured = doc.atoms?.version;
      const facts = [
        `**Source:** ${doc.source?.url ? `\`${doc.source.url}\`` : 'unknown page'} · ${doc.scope?.kind === 'selection' ? `selection "${doc.scope.label}"` : 'whole screen'} · ${doc.scope?.size?.width ?? '?'}×${doc.scope?.size?.height ?? '?'} · ${doc.source?.mode ?? 'light'} mode`,
        `**Captured with:** Atoms ${captured ?? 'unknown (the page carried no development marks)'}${doc.atoms?.marked ? ' — token names are exact' : ' — token names were matched by value, so a value several tokens share names the first'}`,
        ...(node ? [`**Built:** only \`${node}\` (${root.kind === 'element' ? `<${root.tag}>` : root.kind === 'repeat' ? 'a list' : root.kind === 'text' ? 'text' : root.name})`] : []),
      ];

      const warnings: string[] = [];
      if (doc.formatVersion > HANDOVER_FORMAT_VERSION) warnings.push(`This file is format version ${doc.formatVersion}; this tool reads up to ${HANDOVER_FORMAT_VERSION}. Anything newer in it was ignored.`);
      if (doc.formatVersion < 2) warnings.push('This is a version 1 export: its lists kept only three sample items, and it has no Studio edits. Export it again from the Atoms Inspector for every item of a short list.');
      if (doc.truncated) warnings.push('The export was cut short (the page had more nodes than the inspector keeps). Build what is here, and export smaller selections for the rest.');
      if (captured && gate.check.resolved && captured !== gate.check.resolved) {
        warnings.push(`The design was captured on Atoms ${captured}; the project has ${gate.check.resolved}. Check every component below with \`get_component\` before using it.`);
      }
      if (built.unknown.length) warnings.push(`Not exported by Atoms: ${built.unknown.map((n) => `\`${n}\``).join(', ')}. They are the design's own components; the code marks each with a TODO.`);

      const next = [
        ...(doc.pattern && !node && doc.scope?.kind === 'screen'
          ? [`This screen is the \`${doc.pattern.name}\` pattern. Call \`get_pattern\` with \`"${doc.pattern.name}"\` and start from its code, since it is reviewed and has the behaviour this export cannot carry. Then carry over what this file adds: its props, its data and the Studio edits.`]
          : doc.pattern
            ? [`This comes from the \`${doc.pattern.name}\` pattern${'region' in root && root.region ? ` (region \`${root.region}\`)` : ''}. \`get_pattern\` has the reviewed arrangement around it.`]
            : []),
        `Call \`get_component\` for: ${built.components.filter((n) => !['Box', 'Stack', 'Grid', 'Container'].includes(n)).map((n) => `\`${n}\``).join(', ') || 'nothing beyond the layout primitives'}. The props below are what the design passed; keep them unless the spec says otherwise.`,
        'Keep token imports as written. Do not add `sx` to put the gaps back — raise them with the design team.',
      ];

      const wire = [
        ...built.handlers.map((h) => `- ${h.what}${h.count > 1 ? ` ×${h.count}` : ''}: a no-op in the code — write the handler.`),
        ...built.todos.map((t) => `- ${t}`),
        ...built.lists.map((l) => `- ${l} Replace the sample data with the real source.`),
      ];

      const gapRows = built.gaps.map(({ n, deviation: d }) => {
        const status = d.resolution ? ` — ${d.resolution.status === 'accepted' ? 'accepted as a library gap' : d.resolution.status}${d.resolution.note ? `: ${d.resolution.note}` : ''}` : '';
        const where = keptInCode(d) ? 'in the code as written, marked ⚠ — swap it for a token' : 'left out of the code';
        return `${n}. ${gapLine(d)}${d.nodes.length > 1 ? ` · on ${d.nodes.length} nodes` : ''} — ${where}${status}`;
      });

      const edits = doc.edited?.edits ?? [];
      const sections = [
        `# ${doc.name} → React`,
        facts.join('\n'),
        ...(warnings.length ? [`## Check first\n\n${warnings.map((w) => `- ${w}`).join('\n')}`] : []),
        `## Next\n\n${next.map((n, i) => `${i + 1}. ${n}`).join('\n')}`,
        ...(gate.blocked ? [gate.notice] : [...(gate.notice ? [gate.notice] : []), `## Code\n\n\`\`\`tsx\n${built.code}\`\`\``]),
        ...(wire.length ? [`## Wire up\n\n${wire.join('\n')}`] : []),
        ...(gapRows.length
          ? [`## Gaps\n\nWhere the design went outside the library. What restyled an Atoms component is left out, so each component draws as Atoms does: find the prop that does it (\`get_component\`), or tell the user it is a library gap to raise with the design team. Off-token values in the design's own layout and markup are kept and marked ⚠; replace each with the nearest token the note names.\n\n${gapRows.join('\n')}`]
          : []),
        ...(edits.length ? [`## Changed in Atoms Studio\n\nThe designer changed these after capture; the code already includes them.\n\n${edits.map((e) => `- \`${e.node}\` ${e.change}: ${e.detail}`).join('\n')}`] : []),
        ...(doc.note ? [`## Designer's note\n\n${doc.note}`] : []),
      ];

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
