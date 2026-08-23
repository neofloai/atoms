import * as React from 'react';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import NextLink from '@/app/_lib/Link';
import { release } from '@/src/release';

import { CodeBlock } from '../_components/CodeBlock';

import type { ChangeKind, Release } from '@/src/release/types';

/**
 * The changelog, rendered from `src/release/changelog.ts`.
 *
 * Same objects the MCP `check_version` tool serves, so the notes a person
 * reads on this page and the ones an agent is handed cannot drift. Adding
 * a release is an entry in that file; nothing here needs touching.
 */
export const metadata = {
  title: 'Changelog — Atoms',
  description:
    'Every @neofloai/atoms release, what changed in it, and how to find out which version a project has installed.',
};

/** Label and colour per change kind. Breaking reads as a warning. */
const KIND_META: Record<
  ChangeKind,
  { label: string; color: 'error' | 'warning' | 'success' | 'info' | 'default' }
> = {
  breaking: { label: 'Breaking', color: 'error' },
  removed: { label: 'Removed', color: 'warning' },
  changed: { label: 'Changed', color: 'info' },
  added: { label: 'Added', color: 'success' },
  fixed: { label: 'Fixed', color: 'default' },
};

/** Worst news first, so a reader deciding on an upgrade sees the cost. */
const KIND_ORDER: readonly ChangeKind[] = [
  'breaking',
  'removed',
  'changed',
  'added',
  'fixed',
];

/**
 * Renders the inline markdown the release notes are written in.
 *
 * The notes are consumed twice: as markdown by the MCP `check_version`
 * tool, where a backtick round a package name is what tells a model it is
 * an identifier, and as React here. Stripping the markup from the source
 * to make this page simpler would cost the tool the thing it reads best,
 * so the page renders it instead.
 *
 * Two constructs, which is all the notes use: `code` spans, and the
 * double hyphen the rest of this repo's data files write for an em dash
 * (they are read as plain text in a terminal, where a real em dash is not
 * guaranteed to survive the encoding).
 */
function InlineMarkdown({ text }: { text: string }) {
  const dashed = text.replace(/ -- /g, ' — ');
  // Odd indices are the inside of a backtick pair, so a stray backtick
  // renders as text rather than swallowing the rest of the line.
  const parts = dashed.split('`');

  // Keyed by position, which is the identity here: the same word can
  // appear twice in one line, once as prose and once as code.
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index}>{part}</code>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

function ReleaseSection({
  entry,
  isCurrent,
}: {
  entry: Release;
  isCurrent: boolean;
}) {
  const changes = [...entry.changes].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  );

  // `scope` is a machine field: it exists so `check_version` can tell a
  // caller which of the things they are about to use moved. A reader has
  // the sentence, so a scope the sentence already names is noise —
  // "ATOMS_VERSION, exported from the package root (ATOMS_VERSION)".
  const unnamedScopes = (change: (typeof changes)[number]): string[] =>
    (change.scope ?? []).filter((name) => !change.summary.includes(name));

  return (
    <Stack spacing={3} sx={{ maxWidth: 720 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {entry.version}
          </Typography>
          {isCurrent ? (
            <Chip label="Current" color="primary" size="small" />
          ) : null}
          <Typography variant="body2" color="text.secondary">
            {entry.date}
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          <InlineMarkdown text={entry.summary} />
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {changes.map((change) => (
          <Stack
            key={change.summary}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'flex-start' }}
          >
            <Chip
              label={KIND_META[change.kind].label}
              color={KIND_META[change.kind].color}
              size="small"
              variant="outlined"
              sx={{ flexShrink: 0, minWidth: 84 }}
            />
            <Typography variant="body2">
              <InlineMarkdown text={change.summary} />
              {unnamedScopes(change).length > 0 ? (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {' '}
                  ({unnamedScopes(change).join(', ')})
                </Typography>
              ) : null}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {entry.migration && entry.migration.length > 0 ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Moving onto {entry.version}
          </Typography>
          <Stack component="ul" spacing={0.75} sx={{ pl: 3, m: 0 }}>
            {entry.migration.map((note) => (
              <Typography
                key={note}
                component="li"
                variant="body2"
                color="text.secondary"
              >
                <InlineMarkdown text={note} />
              </Typography>
            ))}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}

const checkCommand = `# in your project — this is the installed version
npm ls @neofloai/atoms --depth=0

# no npm on the path, or an unusual tree
node -p "require('./node_modules/@neofloai/atoms/package.json').version"`;

const inAppCommand = `import { ATOMS_VERSION } from '@neofloai/atoms';

console.error(\`Atoms \${ATOMS_VERSION}\`);`;

export default function ChangelogPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Getting started
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Changelog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Every release of <code>@neofloai/atoms</code>, newest first.{' '}
            <strong>{release.current}</strong> is current. Install it with a{' '}
            <code>#semver:</code> range so npm resolves against release tags
            rather than tracking the default branch.
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Which version do I have?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask the installed tree, not your own{' '}
              <code>package.json</code>. Atoms installs from a git ref, so the
              dependency line there is a ref or a range —{' '}
              <code>github:neofloai/atoms#semver:^1.0.0</code>, or a bare commit
              SHA — and neither is the version that ended up on disk.
            </Typography>
          </Stack>
          <CodeBlock>{checkCommand}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            Or from inside the app, which is the version that is actually
            running:
          </Typography>
          <CodeBlock>{inAppCommand}</CodeBlock>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ maxWidth: 720 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Updating
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A range on the major picks up patches and minor releases with{' '}
              <code>npm update</code> and no <code>package.json</code> edit.
              Crossing a major stays deliberate — read the release notes below
              first, since that is where the migration steps are written down.
            </Typography>
          </Stack>
          <CodeBlock>{`${release.commands.upgrade}\n\n# later, within the same major\nnpm update @neofloai/atoms`}</CodeBlock>
          <Typography variant="body2" color="text.secondary">
            If you use an AI editor, the{' '}
            <Link component={NextLink} href="/mcp-guide">
              MCP endpoint
            </Link>{' '}
            serves this page as a tool: <code>check_version</code> takes the
            version you have and returns what has shipped since.{' '}
            <code>get_component</code> and <code>get_pattern</code> withhold
            their code examples until they know that version, so an agent
            cannot paste in code for a release the project does not have.
          </Typography>
        </Stack>

        <Divider />

        {release.releases.map((entry, index) => (
          <Stack key={entry.version} spacing={6}>
            <ReleaseSection entry={entry} isCurrent={index === 0} />
            {index < release.releases.length - 1 ? <Divider /> : null}
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}
