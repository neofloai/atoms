import { z } from 'zod';

import {
  missingRequired,
  resolveTarget,
  unansweredRecommended,
} from '@/src/project';
import { checkVersion } from '@/src/release';
import { loadPatterns, loadProject, loadRelease } from '../data-loader';
import { renderQuestion, renderQuestionSections } from '../format';

import type {
  BriefQuestion,
  ProjectBrief,
  ProjectGuide,
  ProjectPurpose,
} from '@/src/project/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PatternData, ReleaseManifest } from '../types';

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
    techStack: z.enum(['react', 'nextjs']).optional(),
    existingApp: z
      .object({
        framework: z.string(),
        reactVersion: z.string(),
        usesMui: z.boolean(),
        atomsVersion: z
          .string()
          .optional()
          .describe(
            'The Atoms version already in that app, as `npm ls @neofloai/atoms --depth=0` reports it. "none" if it is not installed. Omit only if nobody has looked yet.'
          ),
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

/** How the plan names what is being built, in a sentence that reads. */
const PURPOSE_HEADINGS: Record<ProjectPurpose, string> = {
  prototype: 'a prototype rather than a product',
  'new-project': 'a new project that will be maintained',
  'existing-project': 'code going into an app that already runs',
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
    [...guide.rules, ...guide.creationRules]
      .map((rule) => `- ${rule}`)
      .join('\n'),
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

/**
 * What the screens are framed in, which is the first thing built and the
 * easiest thing to leave out.
 *
 * `shell` is an optional answer, and the previous version of this note only
 * fired on the one value `rail-and-bar` — so a brief that answered
 * `bar-only`, or never reached the question at all, got a plan that never
 * mentioned the shell. An agent reading that plan has no reason to reach for
 * `Drawer` and `Navbar`, composes each screen as a bare page, and the app
 * ends up with no chrome. Every branch now says something, including the
 * unanswered one, because silence here is what gets read as "no shell".
 *
 * Named components rather than "the shell": `Drawer` is MUI's word for a
 * sidebar and not what anyone would guess, so the plan has to say it.
 */
function renderShellAdvice(brief: ProjectBrief): string {
  switch (brief.shell) {
    case 'rail-and-bar':
      return ' The brief asks for a rail and a bar — `Drawer variant="permanent" size="sm"` for the side navigation and `Navbar` for the bar above the page. That is exactly what the dashboard pattern already arranges, so start from it rather than composing the shell, because the arrangement is the part that comes out wrong: the page is a row, the rail owns the full height, and the bar begins where the rail ends rather than running the full width above it.';
    case 'bar-only':
      return ' The brief asks for a bar and no rail, so the shell is `Navbar` alone at the top of the page. Build it once in the layout rather than per screen, and take the dashboard pattern as the reference for everything below it.';
    case 'none':
      return ' The brief asks for no shell, so the screens are full-bleed and neither `Drawer` nor `Navbar` belongs in them. Say so in the layout, so a later screen does not quietly add one.';
    default:
      return ' The brief does not say what the screens sit in. Almost every app is a rail and a bar — `Drawer variant="permanent" size="sm"` for the side navigation, `Navbar` for the bar that begins where the rail ends — so assume that pair, build it once in the layout before the first screen, and confirm it with the user rather than composing screens with no chrome at all.';
  }
}

/**
 * Which Atoms version this plan is written against, and whether the
 * target project is on it.
 *
 * Only an integration can already be wrong about this: something created
 * by `scaffold_app` installs the current release as its first act, so the
 * two agree by construction. An app that installed Atoms at some point in
 * the past is on whatever it installed, and every code block these tools
 * serve is written against the release the server was built from.
 */
function renderVersionSection(
  brief: ProjectBrief,
  release: ReleaseManifest,
  isExisting: boolean
): string[] {
  if (!isExisting) {
    return [
      '',
      '## Version',
      '',
      `This plan is written against **${release.packageName} ${release.current}**, and \`scaffold_app\` installs exactly that — \`${release.commands.pin}\` — so nothing here can be out of step with what the project has. Tell the user which version went in, and note that \`check_version\` is how they find out later what has shipped since.`,
    ];
  }

  const check = checkVersion(brief.existingApp?.atomsVersion, release);
  const lead = `This plan is written against **${release.packageName} ${release.current}**. The app it is going into has whatever it installed, and the two are not the same question.`;

  const verdict = (() => {
    switch (check.status) {
      case 'current':
        return `The brief reports ${check.resolved}, which is the current release. Nothing to reconcile — pass \`installedVersion: "${check.resolved}"\` to \`get_component\` and \`get_pattern\` and their examples come back targeting exactly what is there.`;
      case 'behind':
        return `The brief reports ${check.resolved}, one or more releases behind ${release.current}. The served code still runs on it, but call \`check_version { installedVersion: "${check.resolved}" }\` before building and tell the user what they are missing.`;
      case 'unsupported':
        return `The brief reports ${check.resolved}, which is older than ${release.minimumSupported} — the served code will not run on it. Stop and put the upgrade to the user before writing anything: \`${release.commands.upgrade}\`.`;
      case 'ahead':
        return `The brief reports ${check.resolved}, which is ahead of the ${release.current} this server knows. Where the installed package's types disagree with what these tools describe, the installed types are right.`;
      case 'not-installed':
        return `The brief reports Atoms is not installed there yet, so the install is part of this work: \`${release.commands.pin}\`, then \`get_installation\` for the provider wiring. That lands ${release.current}, which is what every code block here targets.`;
      case 'unresolved':
        return `The brief reports \`${check.reported}\`, which is a ref or a path rather than a version. Resolve it with \`${release.commands.readInstalled}\` in that project before writing code.`;
      case 'unknown':
        return `The brief does not say which Atoms version is in that app. Find out before writing any code — \`${release.commands.readInstalled}\`, run in the project, not the \`${release.packageName}\` line in its \`package.json\` — then pass it to \`check_version\`. \`get_component\` and \`get_pattern\` withhold their code examples until they have it, so this is the first thing to resolve rather than a footnote.`;
    }
  })();

  return ['', '## Version', '', lead, '', verdict];
}

/** The patterns worth starting from, given what the brief describes. */
function renderPatternAdvice(
  brief: ProjectBrief,
  patterns: PatternData[]
): string {
  if (patterns.length === 0) {
    // The shell advice belongs here too. With no pattern to crib the
    // arrangement from, an agent composing every screen by hand is exactly
    // the one most likely to leave the chrome out.
    return `No patterns are published yet, so the screens are composed from components. Call \`get_component\` for each one before using it.${renderShellAdvice(brief)}`;
  }
  const list = patterns.map((p) => `\`${p.slug}\` (${p.description})`).join('; ');
  return `Published patterns: ${list}. Call \`get_pattern\` for any that matches a screen in the brief before writing that screen.${renderShellAdvice(brief)}`;
}

/** The resolved plan, for a brief with every required answer in it. */
function renderPlan(
  brief: ProjectBrief,
  guide: ProjectGuide,
  patterns: PatternData[],
  release: ReleaseManifest
): string {
  const decision = resolveTarget(brief);
  const recipe = guide.targets.find((t) => t.id === decision.target);
  const name = brief.projectName ?? 'the-project';
  const stillOpen = unansweredRecommended(guide.questions, brief);

  // `purpose` is required, so a rendered plan always has one — the guard
  // is what makes that provable rather than asserted.
  const purposeSection = brief.purpose
    ? [
        '',
        `## Because this is ${PURPOSE_HEADINGS[brief.purpose]}`,
        '',
        guide.purposeNotes[brief.purpose].map((note) => `- ${note}`).join('\n'),
      ]
    : [];

  const location =
    decision.target === 'existing'
      ? 'Nothing is created. The work goes into the app that already exists.'
      : `\`${guide.parentDir}/${name}\` — create it there. Not a temp directory, not inside the Atoms repo, not whatever directory this conversation started in. If a folder of that name is already there, stop and ask.`;

  const mode = brief.colorMode ?? 'light';
  // The version call leads for an integration, because the two calls
  // after it withhold their code until it has been made. Ordering it
  // anywhere else describes a sequence that stalls on step three.
  const reportedVersion = brief.existingApp?.atomsVersion;
  const versionArg = reportedVersion
    ? `{ installedVersion: "${reportedVersion}" }`
    : '{ installedVersion: "<what npm ls reports>" }';
  const nextCalls =
    decision.target === 'existing'
      ? [
          `1. \`check_version ${versionArg}\` — what that app is on, and whether the code below will run on it`,
          `2. \`get_installation { framework: "${brief.existingApp?.framework.toLowerCase().includes('next') ? 'nextjs' : 'react'}" }\` — install and provider steps for that app`,
          '3. `get_pattern` for any screen a published pattern covers — pass the same `installedVersion`',
          '4. `get_component` for each component you are about to use — same again',
          '5. `get_tokens` before writing any colour, spacing or type value',
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
    ...renderVersionSection(brief, release, decision.target === 'existing'),
    ...purposeSection,
    '',
    '## Rules',
    '',
    // The location rules are dropped for an integration: there is no
    // folder to make, and a plan that says both is one an agent can obey
    // either way.
    (decision.target === 'existing'
      ? guide.rules
      : [...guide.rules, ...guide.creationRules]
    )
      .map((rule) => `- ${rule}`)
      .join('\n'),
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
        'ALWAYS call this first when the user wants something built with @neofloai/atoms — a prototype, the frontend of a new project, or Atoms added to a project that already exists. Call it with no arguments to get the nine questions to ask the user; call it again with `brief` once you have the answers to get the resolved build plan: which framework, where on disk, which patterns and components, and the tool calls to make in order. Three to six answers are required depending on the purpose, and it withholds the plan until they are in, so do not scaffold, install, or write components before calling it.',
      inputSchema: {
        brief: briefSchema.describe(
          'The answers gathered so far. Omit entirely on the first call to get the questions.'
        ),
      },
    },
    async ({ brief }) => {
      const [manifest, patterns, release] = await Promise.all([
        loadProject(),
        loadPatterns(),
        loadRelease(),
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
            text: renderPlan(brief, manifest, patterns.patterns, release),
          },
        ],
      };
    }
  );
}
