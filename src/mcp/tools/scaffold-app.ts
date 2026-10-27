import { z } from 'zod';

import { structureRuleLines } from '@/src/project';
import { loadInstallation, loadProject } from '../data-loader';
import { renderSteps } from '../format';

import type { InstallStep } from '@/src/install';
import type { BrandAsset, ProjectGuide } from '@/src/project/types';
import type { InstallationManifest } from '../types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * A project name that is safe as a directory and as a package name.
 *
 * Checked rather than sanitised: silently turning "Vendor Query" into
 * "vendor-query" leaves the user looking for a folder that is not there.
 */
const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/** The create step, which is the one that decides where the app lands. */
function renderCreateStep(
  guide: ProjectGuide,
  createCommand: string,
  projectName: string,
  parentDir: string
): InstallStep {
  return {
    title: `Create it in ${parentDir}`,
    body: `Run this from ${parentDir}, so the project is somewhere the user can find and open again. Do not create it in a temp directory, inside the Atoms repo, or in whatever directory this conversation started in. If \`${projectName}\` is already there, stop and ask rather than writing into it. If ${guide.parentDir} does not exist on this machine, ask where the project should go.`,
    code: `cd ${parentDir}\n${createCommand.replace('{{name}}', projectName)}\ncd ${projectName}`,
    language: 'bash',
  };
}

/** The brand files, downloaded once into the new project. */
function renderBrandStep(
  assets: readonly BrandAsset[],
  origin: string
): InstallStep {
  const notes = assets
    .map((asset) => `# ${asset.file} — ${asset.note}`)
    .join('\n');
  const dirs = [...new Set(assets.map((asset) => asset.target.split('/').slice(0, -1).join('/')))]
    .filter((dir) => dir !== '')
    .sort();
  const commands = assets
    .map((asset) => `curl -fsSL ${origin}${asset.path} -o ${asset.target}`)
    .join('\n');

  return {
    title: 'Add the brand icons',
    body: 'Download them into the project and commit them. The package ships `dist` only, so there is nothing to copy out of `node_modules`, and an icon linked from an origin you do not control disappears the day that origin does. Skip this step for an app that carries a customer\'s brand rather than Neoflo\'s — their favicon stays theirs.',
    code: `${notes}\nmkdir -p ${dirs.join(' ')}\n${commands}`,
    language: 'bash',
  };
}

const MODE_SWITCH_SNIPPET = `import { IconButton, useColorScheme } from '@neofloai/atoms';
import { MoonIcon, SunIcon } from '@neofloai/atoms/icons';

export function ColorModeToggle() {
  const { mode, setMode } = useColorScheme();

  // Undefined on the first render, before the provider has read the
  // stored preference. Render the space, not a guess, or the icon
  // flips after hydration.
  if (!mode) {
    return <IconButton aria-label="Colour scheme" disabled sx={{ visibility: 'hidden' }} />;
  }

  return (
    <IconButton
      variant="secondary"
      appearance="text"
      aria-label={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
    >
      {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}`;

/** Where the template mounts the provider and the bar. */
const TEMPLATE_PROVIDERS_FILE = 'src/app/providers/AppProviders.tsx';
const TEMPLATE_LAYOUT_FILE = 'src/app/layout/AppLayout.tsx';

/**
 * The scheme step for a project made from the template, which already
 * mounts the provider pinned to light. Light needs nothing; the others
 * name the file the change goes in rather than describing a provider
 * the reader would then have to find.
 */
function renderTemplateSchemeStep(mode: 'dark' | 'switch'): InstallStep {
  if (mode === 'dark') {
    return {
      title: 'Pin the colour scheme to dark',
      body: `The brief asked for dark. The template pins light in \`${TEMPLATE_PROVIDERS_FILE}\`; change that one prop. Every token carries both schemes, so nothing else moves.`,
      code: `<NeofloThemeProvider defaultMode="dark">`,
      language: 'tsx',
    };
  }
  return {
    title: 'Build the colour-scheme switch',
    body: `Keep \`defaultMode="light"\` in \`${TEMPLATE_PROVIDERS_FILE}\` as the starting scheme. Put this control in \`src/shared/ui/ColorModeToggle.tsx\` and render it at the end of the \`Navbar\` in \`${TEMPLATE_LAYOUT_FILE}\`. \`mode\` is \`undefined\` on the first render, before the stored preference has been read — render the space rather than a guess, or the icon flips after hydration.`,
    code: MODE_SWITCH_SNIPPET,
    language: 'tsx',
  };
}

/**
 * Pinning the scheme the brief actually asked for.
 *
 * Written here rather than reused from the installation guide, whose
 * version is an illustration with `light` hardcoded in it. A step that
 * says "pinned to dark" above a snippet that pins light is worse than no
 * step, because it looks correct.
 */
function renderSchemeStep(
  framework: 'react' | 'nextjs',
  mode: 'light' | 'dark'
): InstallStep {
  const child = framework === 'nextjs' ? '{children}' : '<App />';
  return {
    title: `Pin the colour scheme to ${mode}`,
    body: `The brief asked for ${mode}. Every token carries both schemes, so this one prop decides it — and pinning matters most when the app will be opened on a machine that is not the user's own, where following the OS means not knowing what it will look like.`,
    code: `<NeofloThemeProvider defaultMode="${mode}">${child}</NeofloThemeProvider>`,
    language: 'tsx',
  };
}

/**
 * A scheme the person viewing can change, which is a control rather than
 * a prop.
 *
 * `useColorScheme` is re-exported from Atoms so this needs no MUI import.
 * The provider persists the choice, which is the one place stored state
 * is right in a prototype: it is a preference about the app rather than
 * data inside it.
 */
function renderSwitchStep(framework: 'react' | 'nextjs'): InstallStep {
  const child = framework === 'nextjs' ? '{children}' : '<App />';
  return {
    title: 'Build the colour-scheme switch',
    body: `Leave the provider on \`defaultMode="light"\` as the starting scheme (\`<NeofloThemeProvider defaultMode="light">${child}</NeofloThemeProvider>\`) and put this control in the bar. \`mode\` is \`undefined\` on the first render, before the stored preference has been read — render the space rather than a guess, or the icon flips after hydration.`,
    code: MODE_SWITCH_SNIPPET,
    language: 'tsx',
  };
}

/** Everything to run and wire, in the order it has to happen. */
function renderPlan(
  guide: ProjectGuide,
  install: InstallationManifest,
  framework: 'react' | 'nextjs',
  projectName: string,
  parentDir: string,
  colorMode: 'light' | 'dark' | 'switch'
): string {
  const recipe = guide.targets.find((target) => target.id === framework);
  const setup = install.frameworks.find((f) => f.id === framework);

  if (!recipe?.createCommand || !setup) {
    return `No scaffold recipe for "${framework}". Available: ${guide.targets
      .filter((target) => target.createCommand !== null)
      .map((target) => target.id)
      .join(', ')}.`;
  }

  // The guide's optional steps are illustrations for an existing
  // project. They are left out and named in "Not covered here" rather
  // than dropped quietly, because a scaffold that silently omits a step
  // reads as a scaffold that did not need one.
  const required = setup.steps.filter(
    (step) => !step.title.startsWith('Optional')
  );
  const optional = setup.steps.filter((step) =>
    step.title.startsWith('Optional')
  );
  const recipeSteps = recipe.steps.map((step) => ({
    ...step,
    ...(step.code && { code: step.code.replaceAll('{{name}}', projectName) }),
  }));
  // One ordered list rather than a section per source: whoever runs this
  // needs to know what comes after what, and which steps came from the
  // installation guide and which from the scaffold recipe is a fact
  // about this repo rather than about the task.
  //
  // A template already carries the install, the provider, the icons and
  // the mark, so its list is the copy, the scheme if it is not light,
  // and the recipe's own steps. Re-running the others on top of it would
  // write a second provider into a file that has one.
  const steps: InstallStep[] = recipe.fromTemplate
    ? [
        renderCreateStep(guide, recipe.createCommand, projectName, parentDir),
        ...recipeSteps.slice(0, 1),
        ...(colorMode === 'light' ? [] : [renderTemplateSchemeStep(colorMode)]),
        ...recipeSteps.slice(1),
      ]
    : [
        renderCreateStep(guide, recipe.createCommand, projectName, parentDir),
        install.shared[0],
        ...required,
        colorMode === 'switch'
          ? renderSwitchStep(framework)
          : renderSchemeStep(framework, colorMode),
        renderBrandStep(guide.brandAssets, guide.brandOrigin),
        ...(recipe.iconStep ? [recipe.iconStep] : []),
        guide.logoStep,
        ...recipeSteps,
      ];

  const schemeNote =
    colorMode === 'switch'
      ? 'The app carries its own colour-scheme control, starting in light.'
      : `The provider is pinned to \`defaultMode="${colorMode}"\`.`;

  // The guide's own colour-scheme step is always superseded here, since
  // one is emitted above for whichever mode was asked for.
  const notCovered = [
    '- Pinning the install to a commit, and what a CI or Docker build needs: `get_installation` has both, and they start mattering the moment this is kept rather than thrown away.',
    ...optional
      .filter((step) => !step.title.includes('color scheme'))
      .map((step) => `- "${step.title}" — in \`get_installation\`, if you want it.`),
  ].join('\n');

  return [
    `# Scaffold ${projectName} — ${recipe.label}`,
    '',
    `Chosen because ${recipe.chooseWhen}. Every command below runs on the user's machine, in \`${parentDir}/${projectName}\`. ${schemeNote}`,
    '',
    renderSteps(steps, 1),
    '',
    ...(recipe.fromTemplate
      ? [
          '## Project structure — mandatory',
          '',
          'The project is laid out in four layers, each importing only from those below it:',
          '',
          '```',
          guide.structure.tree,
          '```',
          '',
          'Follow every rule below on every change, without being reminded. They are also in the project\'s `AGENTS.md`, with the reason for each; those marked *(oxlint)* fail `npm run check`. When a request cannot be met without breaking one, stop and say which rule rather than working around it.',
          '',
          structureRuleLines(guide.structure)
            .map((rule) => `- ${rule}`)
            .join('\n'),
          '',
        ]
      : []),
    '## Rules',
    '',
    install.notes.map((note) => `- ${note}`).join('\n'),
    '',
    '## Not covered here',
    '',
    notCovered,
    '',
    '## When it runs',
    '',
    `Tell the user the full path (\`${parentDir}/${projectName}\`) and the command that starts it, then say which interactions are real and which are only drawn. A prototype whose limits go unsaid gets demoed as though it has none.`,
  ].join('\n');
}

/**
 * Registers the `scaffold_app` tool: the commands to create a new Atoms
 * app on the user's own disk.
 *
 * Separate from `start_project` because the two answer different
 * questions — what should be built, then how it gets made — and because
 * an agent that already knows the target should not have to resubmit the
 * whole brief to get the commands again.
 */
export function registerScaffoldApp(server: McpServer): void {
  server.registerTool(
    'scaffold_app',
    {
      title: 'Scaffold a new app',
      description:
        'Returns the exact ordered commands to create a new app with @neofloai/atoms already wired, and how to run it. Framework "react" copies the Atoms template — Vite, React Router, TanStack Query, oxlint and oxfmt, with the provider, brand, shell and a strict four-layer structure in place — and returns the structure rules every change in it must follow. Pass "nextjs" when the app needs a server. Creates the project in the user\'s Desktop folder, never in a temp directory or the current working directory. Call start_project first to decide which framework the brief actually needs.',
      inputSchema: {
        framework: z
          .enum(['react', 'nextjs'])
          .describe(
            'Target: "react" for the Atoms Vite + React template (prototypes, demos, anything with no server-side work), "nextjs" when the app needs auth, persistence, API routes, or secrets. Resolve this with start_project rather than guessing.'
          ),
        projectName: z
          .string()
          .describe(
            'Folder and package name, kebab-case, e.g. "vendor-query-prototype".'
          ),
        parentDirectory: z
          .string()
          .optional()
          .describe(
            'Where to create it. Defaults to the user\'s Desktop. Only override this when the user has named somewhere else.'
          ),
        colorMode: z
          .enum(['light', 'dark', 'switch'])
          .optional()
          .describe(
            'What the app runs in: a pinned scheme, or "switch" for a control the viewer can change. Defaults to light.'
          ),
      },
    },
    async ({ framework, projectName, parentDirectory, colorMode }) => {
      const [guide, install] = await Promise.all([
        loadProject(),
        loadInstallation(),
      ]);

      if (!NAME_PATTERN.test(projectName)) {
        return {
          content: [
            {
              type: 'text',
              text: `"${projectName}" will not work as a folder and package name. Use lower-case letters, digits and hyphens, starting with a letter or digit — for example "vendor-query-prototype". Ask the user to confirm the name rather than picking one for them.`,
            },
          ],
        };
      }

      const parentDir = parentDirectory ?? guide.parentDir;

      return {
        content: [
          {
            type: 'text',
            text: renderPlan(
              guide,
              install,
              framework,
              projectName,
              parentDir,
              colorMode ?? 'light'
            ),
          },
        ],
      };
    }
  );
}
