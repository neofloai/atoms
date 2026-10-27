import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { projectGuide } from '@/src/project';

import { CodeBlock } from '../_components/CodeBlock';
import { QuestionSections, TargetTable } from './_components/BriefSections';
import { LayerTable, RuleGroups } from './_components/StructureSections';

export const metadata = {
  title: 'Start a project — Atoms',
  description:
    'What an AI editor asks before it builds anything with Atoms, how it decides between a React prototype and a Next app, and where the project ends up on disk.',
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

const structure = projectGuide.structure;
const required = projectGuide.questions.filter((q) => q.required);
const recommended = projectGuide.questions.filter((q) => !q.required);

const firstCall = `start_project`;

const secondCall = `start_project {
  brief: {
    purpose: "prototype",
    screens: [
      "Query log — scan and filter incoming queries",
      "Query detail — read one and route it"
    ],
    shell: "rail-and-bar",
    colorMode: "light",
    projectName: "vendor-query-prototype"
  }
}`;

export default function StartAProjectPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Getting started
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Start a project
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ask an AI editor for a dashboard and it will produce one. Whether
            it is the dashboard you wanted depends entirely on what it knew
            before it started typing.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Why there is a gate
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The expensive mistakes are not typos. They are decisions made on
            your behalf: a table built against invented columns, a shell
            assembled the wrong way round, half the interactions wired and
            nobody having said which half mattered, and the whole thing left
            in a directory you cannot find again. Each one is cheap to avoid
            with a question and expensive to undo afterwards.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are nine, and between three and six of them block —
            depending on the first answer, which scopes the rest. It stays
            short because <code>purpose</code> settles most of it: a prototype
            is React with sample data and no backend, so there is nothing left
            to ask about sign-ins, databases or where the rows come from. None
            of them asks who you are, either — a designer, a manager and an
            engineer reach for Atoms for the same three reasons, and which of
            the three it is says everything a job title would have.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            So <code>start_project</code> withholds its build plan until the
            required answers are in. Advice at the top of a response gets
            skipped; a tool that returns nothing useful until it has been
            answered does not. Call it with nothing and it returns the
            questions. Call it again with the answers and it returns the
            framework, the location on disk, and the tool calls to make in
            order.
          </Typography>
          <CodeBlock>{firstCall}</CodeBlock>
          <CodeBlock>{secondCall}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Answer partially and it says what is still missing rather than
            filling the gaps in for you. Several questions apply to only some
            purposes — an existing project is never asked what its screens
            are, and a prototype is never asked which framework it wants — so
            what blocks depends on the first answer.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            What gets built
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asked, not guessed at. A prototype is always React with Vite —
            fastest to start, nothing to configure, and a prototype has no
            server behind it. A new project is asked which stack it wants,
            with React the recommended default: Next is not more capable for
            the UI, only for what sits behind it. A project that already
            exists gets an install and nothing else.
          </Typography>
          <TargetTable targets={projectGuide.targets} />
          <Typography variant="body2" color="text.secondary">
            Once the target is known, <code>scaffold_app</code> returns the
            ordered commands. A React project is copied from the Atoms
            template, which arrives with the install, the provider, the{' '}
            <Link href="/branding#favicon">favicon set</Link>, the rail and the
            project structure already in place, so what is left is naming it,
            the colour scheme and running it. A Next app is created, then
            wired step by step. Nothing about either is improvised per project.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Prototypes hold their state in React and nothing else. No{' '}
            <code>localStorage</code>, no database — a prototype that
            remembers what the last person did cannot be reset before the next
            demo, and stale state read back at the wrong moment reads as a bug
            in the design. Ask for persistence and you get it; it is not added
            on your behalf.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where it lands
          </Typography>
          <Typography variant="body2" color="text.secondary">
            In <code>{projectGuide.parentDir}/&lt;project-name&gt;</code>. Not
            a temp directory, not inside the Atoms repo, not whatever
            directory the conversation happened to start in — an agent&apos;s
            working directory is a sandbox, and a prototype nobody can open
            again was not delivered. If a folder of that name is already
            there, the tools stop and ask rather than writing into it.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={2} sx={{ maxWidth: PROSE }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Project structure
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Every Atoms React app is laid out the same way, so anyone who has
              worked in one can work in any of them. It starts from the
              template, copied at the tag of the Atoms release it installs:
            </Typography>
            <CodeBlock>{structure.createCommand.replace('{{name}}', 'my-app')}</CodeBlock>
            <Typography variant="body2" color="text.secondary">
              Vite, TypeScript in strict mode, React Router with every page
              lazy-loaded, TanStack Query for server state, Vitest, oxlint and
              oxfmt. The code sits in four layers, and each imports only from
              the layers below it:
            </Typography>
            <CodeBlock>{structure.tree}</CodeBlock>
            <LayerTable layers={structure.layers} />
            <Typography variant="body2" color="text.secondary">
              A feature is always the same shape, so the second one is written
              by copying the first:
            </Typography>
            <CodeBlock>{structure.featureTree}</CodeBlock>
          </Stack>

          <Stack spacing={0.5} sx={{ maxWidth: PROSE }}>
            <Typography variant="overline" color="text.secondary">
              The rules
            </Typography>
            <Typography variant="body2" color="text.secondary">
              An AI editor follows these on every change, and so should you.
              They ship in each project as <code>AGENTS.md</code> and come back
              with every <code>scaffold_app</code> plan. The ones marked{' '}
              <code>oxlint</code> fail <code>npm run check</code> when broken;
              the rest are the reason each exists, for the places a linter
              cannot see.
            </Typography>
          </Stack>
          <Box sx={{ maxWidth: PROSE }}>
            <RuleGroups groups={structure.ruleGroups} />
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5} sx={{ maxWidth: PROSE }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              The questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Worth reading before you ask for something built — having the
              answers ready turns the interview into a sentence. These are the
              ones that hold the plan back, though not all at once: each is
              marked with the purposes it applies to.
            </Typography>
          </Stack>
          <QuestionSections questions={required} />
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5} sx={{ maxWidth: PROSE }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Also asked
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These do not block anything. They come back with the plan as
              still-unanswered, because each one is otherwise decided by
              whoever writes the screen.
            </Typography>
          </Stack>
          <QuestionSections questions={recommended} />
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Rules that hold either way
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {projectGuide.rules.map((rule) => (
              <Typography
                key={rule}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                {rule}
              </Typography>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            And two more when something is being created, which a plan for an
            app that already exists leaves out — it has no folder to make:
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {projectGuide.creationRules.map((rule) => (
              <Typography
                key={rule}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                {rule}
              </Typography>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Connect an editor to the endpoint first — see the{' '}
            <Link href="/mcp-guide">MCP guide</Link>. Adding Atoms to an app
            that already exists is the{' '}
            <Link href="/installation">installation guide</Link> instead;
            nothing gets scaffolded in that case.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
