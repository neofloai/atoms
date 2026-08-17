import { z } from 'zod';

import {
  missingRequired,
  resolveTarget,
  unansweredRecommended,
} from '@/src/project';
import { loadPatterns, loadProject } from '../data-loader';
import { renderQuestion, renderQuestionSections } from '../format';

import type {
  BriefQuestion,
  ProjectAudience,
  ProjectBrief,
  ProjectGuide,
} from '@/src/project/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PatternData } from '../types';

/**
 * The brief, as the tool accepts it.
 *
 * Every field is optional on purpose: the tool's whole job is to report
 * what is still missing, so a half-filled brief has to be a valid call.
 * Enums rather than free strings wherever the answer drives a decision,
 * because "maybe a database" is not an answer the target can resolve
 * from.
 */
const briefSchema = z
  .object({
    purpose: z
      .enum(['prototype', 'new-project', 'existing-project'])
      .optional(),
    audience: z.enum(['designer', 'manager', 'engineer']).optional(),
    techStack: z.enum(['react', 'nextjs']).optional(),
    existingApp: z
      .object({
        framework: z.string(),
        reactVersion: z.string(),
        usesMui: z.boolean(),
      })
      .optional(),
    projectName: z.string().optional(),
    screens: z.array(z.string()).optional(),
    shell: z.enum(['rail-and-bar', 'bar-only', 'none']).optional(),
    records: z.array(z.string()).optional(),
    colorMode: z.enum(['light', 'dark', 'switch']).optional(),
    productName: z.string().optional(),
  })
  .optional();

/** How the plan names who it is for, in a sentence that reads. */
const AUDIENCE_HEADINGS: Record<ProjectAudience, string> = {
  designer: 'a designer',
  manager: 'someone showing it on rather than building it',
  engineer: 'an engineer',
};

/** The interview, for a call that arrived with nothing. */
function renderInterview(guide: ProjectGuide): string {
  const required = guide.questions.filter((q) => q.required);
  const optional = guide.questions.filter((q) => !q.required);

  return [
    '# Gather the brief before you build',
    '',
    'Do not scaffold, install, or write a single component yet. Ask the user the questions below — all of them, in one pass, in your own words rather than as a form — then call `start_project` again with the answers as `brief`. You will get back a build plan naming the framework, the location, and the tool calls to make in order.',
    '',
    'Ask `purpose` first: it decides which of the others apply. Several are marked "only when purpose is" — do not ask a prototype which framework the app it is going into runs on.',
    '',
    'Ask the follow-ups for anything that comes back vague. "A table of orders" is not a column list, and the columns are what decide whether the table fits.',
    '',
    '## Required — the plan is withheld until these are answered',
    '',
    renderQuestionSections(required),
    '',
    '## Worth asking — not blocking, but each one is a decision otherwise made for the user',
    '',
    renderQuestionSections(optional),
    '',
    '## Rules that hold whatever the answers are',
    '',
    guide.rules.map((rule) => `- ${rule}`).join('\n'),
  ].join('\n');
}

/** What is still needed, for a brief that arrived half full. */
function renderGaps(missing: BriefQuestion[], answered: number): string {
  return [
    '# Not yet — the brief is incomplete',
    '',
    `${answered} answer${answered === 1 ? '' : 's'} received. ${missing.length} required answer${missing.length === 1 ? '' : 's'} still missing, so there is no build plan yet. Ask for these, then call \`start_project\` again with the fuller brief.`,
    '',
    missing.map(renderQuestion).join('\n\n'),
    '',
    'Do not fill these in yourself, and do not start building around them. Each one changes what gets built rather than how it is worded.',
  ].join('\n');
}

/** One line per answered field, so the plan restates what it heard. */
function renderEcho(brief: ProjectBrief): string {
  const entries = Object.entries(brief).filter(
    ([, value]) => value !== undefined && value !== null
  );
  return entries
    .map(([key, value]) => {
      const rendered = Array.isArray(value)
        ? value.map((item) => `\n  - ${String(item)}`).join('')
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);
      return `- **${key}:** ${rendered}`;
    })
    .join('\n');
}

/** The patterns worth starting from, given what the brief describes. */
function renderPatternAdvice(
  brief: ProjectBrief,
  patterns: PatternData[]
): string {
  if (patterns.length === 0) {
    return 'No patterns are published yet, so the screens are composed from components. Call `get_component` for each one before using it.';
  }
  const list = patterns.map((p) => `\`${p.slug}\` (${p.description})`).join('; ');
  const shellNote =
    brief.shell === 'rail-and-bar'
      ? ' The brief asks for a rail and a bar, which is exactly what the dashboard pattern already arranges — start from it rather than composing the shell, because the arrangement is the part that comes out wrong.'
      : '';
  return `Published patterns: ${list}. Call \`get_pattern\` for any that matches a screen in the brief before writing that screen.${shellNote}`;
}

/** The resolved plan, for a brief with every required answer in it. */
function renderPlan(
  brief: ProjectBrief,
  guide: ProjectGuide,
  patterns: PatternData[]
): string {
  const decision = resolveTarget(brief);
  const recipe = guide.targets.find((t) => t.id === decision.target);
  const name = brief.projectName ?? 'the-project';
  const stillOpen = unansweredRecommended(guide.questions, brief);
  const audienceNotes = brief.audience
    ? guide.audienceNotes[brief.audience]
    : [];

  const location =
    decision.target === 'existing'
      ? 'Nothing is created. The work goes into the app that already exists.'
      : `\`${guide.parentDir}/${name}\` — create it there. Not a temp directory, not inside the Atoms repo, not whatever directory this conversation started in. If a folder of that name is already there, stop and ask.`;

  const mode = brief.colorMode ?? 'light';
  const nextCalls =
    decision.target === 'existing'
      ? [
          `1. \`get_installation { framework: "${brief.existingApp?.framework.toLowerCase().includes('next') ? 'nextjs' : 'react'}" }\` — install and provider steps for that app`,
          '2. `get_pattern` for any screen a published pattern covers',
          '3. `get_component` for each component you are about to use',
          '4. `get_tokens` before writing any colour, spacing or type value',
        ]
      : [
          `1. \`scaffold_app { framework: "${decision.target}", projectName: "${name}", colorMode: "${mode}" }\` — the commands to create it, install Atoms, and wire the brand`,
          '2. `get_pattern` for any screen a published pattern covers',
          '3. `get_component` for each component the pattern names, before using it',
          '4. `get_tokens` before writing any colour, spacing or type value',
          '5. Build the screens in the order the brief lists them, first screen first, so the thing is demonstrable early',
        ];

  // An integration has no folder to name, so it is titled by what it is
  // going into rather than by a project name it will never have.
  const heading =
    decision.target === 'existing'
      ? `# Build plan: Atoms into ${brief.existingApp?.framework ?? 'the existing app'}`
      : `# Build plan: ${name}`;

  return [
    heading,
    '',
    `**Target:** ${recipe?.label ?? decision.target}`,
    `**Because:** ${decision.trigger}`,
    `**Location:** ${location}`,
    '',
    '## What the brief says',
    '',
    renderEcho(brief),
    '',
    '## Start from a pattern where there is one',
    '',
    renderPatternAdvice(brief, patterns),
    '',
    '## Order of operations',
    '',
    nextCalls.join('\n'),
    ...(audienceNotes.length > 0 && brief.audience
      ? [
          '',
          `## Because this is for ${AUDIENCE_HEADINGS[brief.audience]}`,
          '',
          audienceNotes.map((note) => `- ${note}`).join('\n'),
        ]
      : []),
    '',
    '## Rules',
    '',
    guide.rules.map((rule) => `- ${rule}`).join('\n'),
    ...(stillOpen.length > 0
      ? [
          '',
          '## Still unanswered',
          '',
          'These do not block the build, but each one is a decision that gets made on the user\'s behalf if nobody asks. Ask before writing the screen it affects:',
          '',
          stillOpen.map(renderQuestion).join('\n\n'),
        ]
      : []),
  ].join('\n');
}

/**
 * Registers the `start_project` tool: the intake gate in front of every
 * build.
 *
 * It is a gate rather than a checklist because advice at the top of a
 * response gets skipped. Withholding the plan until the required answers
 * arrive is what makes the questions get asked, and the questions are
 * the difference between building the thing described and building
 * something plausible.
 */
export function registerStartProject(server: McpServer): void {
  server.registerTool(
    'start_project',
    {
      title: 'Start a project',
      description:
        'ALWAYS call this first when the user wants something built with @neofloai/atoms — a prototype, the frontend of a new project, or Atoms added to a project that already exists. Call it with no arguments to get the ten questions to ask the user; call it again with `brief` once you have the answers to get the resolved build plan: which framework, where on disk, which patterns and components, and the tool calls to make in order. Four to seven answers are required depending on the purpose, and it withholds the plan until they are in, so do not scaffold, install, or write components before calling it.',
      inputSchema: {
        brief: briefSchema.describe(
          'The answers gathered so far. Omit entirely on the first call to get the questions.'
        ),
      },
    },
    async ({ brief }) => {
      const [manifest, patterns] = await Promise.all([
        loadProject(),
        loadPatterns(),
      ]);

      if (!brief || Object.keys(brief).length === 0) {
        return {
          content: [{ type: 'text', text: renderInterview(manifest) }],
        };
      }

      const missing = missingRequired(manifest.questions, brief);
      if (missing.length > 0) {
        return {
          content: [
            {
              type: 'text',
              text: renderGaps(missing, Object.keys(brief).length),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: renderPlan(brief, manifest, patterns.patterns),
          },
        ],
      };
    }
  );
}
