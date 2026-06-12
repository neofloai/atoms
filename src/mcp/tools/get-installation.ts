import { z } from 'zod';

import { loadInstallation } from '../data-loader';

import type { InstallStep } from '@/src/install';
import type { InstallationManifest } from '../types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function renderSteps(steps: InstallStep[], startIndex: number): string {
  return steps
    .map((step, offset) => {
      const heading = `### ${startIndex + offset}. ${step.title}`;
      const code = step.code
        ? `\n\n\`\`\`${step.language ?? ''}\n${step.code}\n\`\`\``
        : '';
      return `${heading}\n\n${step.body}${code}`;
    })
    .join('\n\n');
}

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
 * Registers the `get_installation` tool: returns framework-specific setup
 * instructions for adding @neoflo/atoms to a project.
 */
export function registerGetInstallation(server: McpServer): void {
  server.registerTool(
    'get_installation',
    {
      title: 'Get installation steps',
      description:
        'Returns step-by-step instructions to install and set up @neoflo/atoms in a project, tailored to the framework. Pass framework "nextjs" for a Next.js App Router app or "react" for a React app (Vite/CRA); omit it to get instructions for every supported framework. Always call this when the user asks how to install, add, or set up the design system.',
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
      const guide = await loadInstallation();

      const text = framework
        ? renderFramework(guide, framework)
        : guide.frameworks
            .map((f) => renderFramework(guide, f.id))
            .join('\n\n---\n\n');

      return {
        content: [{ type: 'text', text }],
      };
    }
  );
}
