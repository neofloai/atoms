import { z } from 'zod';

import { loadInstallation, loadRelease } from '../data-loader';
import { renderSteps } from '../format';

import type { InstallationManifest, ReleaseManifest } from '../types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function renderFramework(
  guide: InstallationManifest,
  frameworkId: string
): string {
  const setup = guide.frameworks.find((f) => f.id === frameworkId);
  if (!setup) {
    const available = guide.frameworks.map((f) => f.id).join(', ');
    return `Unknown framework "${frameworkId}". Available: ${available}.`;
  }

  const installSteps = renderSteps(guide.shared, 1);
  const setupSteps = renderSteps(setup.steps, guide.shared.length + 1);
  const notes = guide.notes.map((note) => `- ${note}`).join('\n');

  return [
    `# Install ${guide.packageName} — ${setup.label}`,
    setup.summary,
    `## Install`,
    installSteps,
    `## Set up (${setup.label})`,
    setupSteps,
    `## Rules`,
    notes,
  ].join('\n\n');
}

/**
 * Which version this installs, and how to find out later.
 *
 * Appended once rather than per framework: it is the same answer for
 * both, and the thing it prevents is version-agnostic. An install with no
 * version recorded anywhere is one nobody can check afterwards, and the
 * check is what the code-serving tools need.
 */
function renderVersionSection(release: ReleaseManifest): string {
  return [
    `## Version`,
    '',
    `The current release is **${release.current}** (\`${release.currentTag}\`). Install it by range so npm resolves against release tags rather than tracking the default branch:`,
    '',
    '```bash',
    release.commands.pin,
    '```',
    '',
    'Afterwards, that project can be asked what it actually got:',
    '',
    '```bash',
    release.commands.readInstalled,
    '```',
    '',
    `Use that number, not the \`${release.packageName}\` line in \`package.json\` — for a git install that line is a ref or a range, not a version. Pass it to \`check_version\` to see what has shipped since, and to \`get_component\` and \`get_pattern\`, which withhold their code examples until they know what the project is on.`,
  ].join('\n');
}

/**
 * Registers the `get_installation` tool: returns framework-specific setup
 * instructions for adding @neofloai/atoms to a project.
 */
export function registerGetInstallation(server: McpServer): void {
  server.registerTool(
    'get_installation',
    {
      title: 'Get installation steps',
      description:
        'Returns step-by-step instructions to install and set up @neofloai/atoms in a project, tailored to the framework. Pass framework "nextjs" for a Next.js App Router app or "react" for a React app (Vite/CRA); omit it to get instructions for every supported framework. Always call this when the user asks how to install, add, or set up the design system.',
      inputSchema: {
        framework: z
          .enum(['nextjs', 'react'])
          .optional()
          .describe(
            'Target framework: "nextjs" for Next.js App Router, "react" for React (Vite/CRA). Omit to return all frameworks.'
          ),
      },
    },
    async ({ framework }) => {
      const [guide, release] = await Promise.all([
        loadInstallation(),
        loadRelease(),
      ]);

      const steps = framework
        ? renderFramework(guide, framework)
        : guide.frameworks
            .map((f) => renderFramework(guide, f.id))
            .join('\n\n---\n\n');

      return {
        content: [
          { type: 'text', text: `${steps}\n\n${renderVersionSection(release)}` },
        ],
      };
    }
  );
}
