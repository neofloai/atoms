import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from '@/app/_lib/Link';

import type { ComponentExamplesData } from '@/src/types/docs';
import { data as alert } from '@/src/components/Alert/Alert.examples';
import { data as avatar } from '@/src/components/Avatar/Avatar.examples';
import { data as box } from '@/src/components/Box/Box.examples';
import { data as button } from '@/src/components/Button/Button.examples';
import { data as checkbox } from '@/src/components/Checkbox/Checkbox.examples';
import { data as chip } from '@/src/components/Chip/Chip.examples';
import { data as collapse } from '@/src/components/Collapse/Collapse.examples';
import { data as container } from '@/src/components/Container/Container.examples';
import { data as divider } from '@/src/components/Divider/Divider.examples';
import { data as fade } from '@/src/components/Fade/Fade.examples';
import { data as grid } from '@/src/components/Grid/Grid.examples';
import { data as grow } from '@/src/components/Grow/Grow.examples';
import { data as iconButton } from '@/src/components/IconButton/IconButton.examples';
import { data as menu } from '@/src/components/Menu/Menu.examples';
import { data as radio } from '@/src/components/Radio/Radio.examples';
import { data as select } from '@/src/components/Select/Select.examples';
import { data as skeleton } from '@/src/components/Skeleton/Skeleton.examples';
import { data as slide } from '@/src/components/Slide/Slide.examples';
import { data as stack } from '@/src/components/Stack/Stack.examples';
import { data as textField } from '@/src/components/TextField/TextField.examples';
import { data as zoom } from '@/src/components/Zoom/Zoom.examples';

export const metadata = {
  title: 'Components — Atoms',
  description:
    'Every Neoflo Atoms component — Neoflo-branded wrappers around Material UI.',
};

/**
 * One card on this index. `data` carries the name, category, and
 * tagline straight from the component's `.examples.tsx` file, so the
 * copy here can never drift from the component page or the MCP
 * manifest. Unbuilt components are listed with `data: null` and a
 * category, mirroring the `disabled: true` entries in `navigation.ts`.
 */
interface ComponentEntry {
  readonly name: string;
  readonly href: string;
  readonly category: string;
  readonly data: ComponentExamplesData | null;
}

const built: readonly (readonly [ComponentExamplesData, string])[] = [
  [box, '/components/box'],
  [stack, '/components/stack'],
  [grid, '/components/grid'],
  [container, '/components/container'],
  [divider, '/components/divider'],
  [button, '/components/button'],
  [iconButton, '/components/icon-button'],
  [textField, '/components/text-field'],
  [select, '/components/select'],
  [checkbox, '/components/checkbox'],
  [radio, '/components/radio'],
  [avatar, '/components/avatar'],
  [chip, '/components/chip'],
  [alert, '/components/alert'],
  [skeleton, '/components/skeleton'],
  [menu, '/components/menu'],
  // The five motion primitives share one page, mirroring MUI's own
  // single Transitions page — five near-identical pages would say the
  // same thing five times. Each still gets its own card and its own
  // MCP manifest entry, so `get_component("Fade")` resolves.
  [fade, '/components/animations#fade'],
  [grow, '/components/animations#grow'],
  [zoom, '/components/animations#zoom'],
  [slide, '/components/animations#slide'],
  [collapse, '/components/animations#collapse'],
];

/** Not yet built — kept visible so the roadmap is legible. */
const planned: readonly ComponentEntry[] = [
  {
    name: 'Card',
    href: '/components/card',
    category: 'Data Display',
    data: null,
  },
];

const entries: readonly ComponentEntry[] = [
  ...built.map(([data, href]) => ({
    name: data.name,
    href,
    category: data.category,
    data,
  })),
  ...planned,
];

/** Section order in the UI. Categories outside this list sort last. */
const CATEGORY_ORDER: readonly string[] = [
  'Layout',
  'Inputs',
  'Data Display',
  'Feedback',
  'Navigation',
  'Motion',
];

function categoryRank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

const groups: readonly (readonly [string, readonly ComponentEntry[]])[] = [
  ...new Set(entries.map((entry) => entry.category)),
]
  .sort((a, b) => categoryRank(a) - categoryRank(b))
  .map(
    (category) =>
      [category, entries.filter((entry) => entry.category === category)] as const
  );

const readyCount = entries.filter((entry) => entry.data !== null).length;

function ComponentCard({ entry }: { entry: ComponentEntry }) {
  const ready = entry.data !== null;
  return (
    <Paper
      variant="outlined"
      {...(ready
        ? { component: NextLink, href: entry.href }
        : { component: 'div' })}
      sx={{
        p: 2.5,
        borderRadius: 2,
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        transition: 'border-color 120ms, box-shadow 120ms',
        ...(ready && {
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 1px var(--mui-palette-primary-main)',
          },
        }),
      }}
    >
      <Stack spacing={1} sx={{ height: '100%' }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: ready ? 'text.primary' : 'text.disabled',
            }}
          >
            {entry.name}
          </Typography>
          {!ready && (
            <Chip
              label="Soon"
              size="small"
              sx={{
                fontSize: 10,
                height: 18,
                fontWeight: 700,
                letterSpacing: 0.4,
              }}
            />
          )}
        </Stack>
        <Typography
          variant="body2"
          sx={{ color: ready ? 'text.secondary' : 'text.disabled' }}
        >
          {entry.data?.tagline ?? 'Not built yet.'}
        </Typography>
      </Stack>
    </Paper>
  );
}

ComponentCard.displayName = 'ComponentCard';

export default function ComponentsIndexPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Components
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {readyCount} components built on Material UI. Anything with a
            visual identity is wrapped and reads its colours, spacing, and
            radii from the design tokens, so a token change lands everywhere
            at once; the layout and motion primitives are re-exported
            unchanged, because they render nothing a designer could redline.
            Import them all from <code>@neoflo/atoms</code>.
          </Typography>
        </Stack>

        {groups.map(([category, items]) => (
          <Stack key={category} spacing={2}>
            <Divider />
            <Typography variant="overline" color="text.secondary">
              {category}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2.5,
              }}
            >
              {items.map((entry) => (
                <ComponentCard key={entry.name} entry={entry} />
              ))}
            </Box>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}
