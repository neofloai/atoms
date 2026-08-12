import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Container`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * Each `examples` entry is paired with a live preview on the docs page
 * by matching `title` (see `app/(docs)/components/container/_components/
 * demos.tsx`, which fails the build if a title has no preview). So the
 * code below must stay literally renderable — it is the same snippet
 * the page draws, not a paraphrase of it.
 *
 * No `figmaUrl`: Container is a layout primitive that renders nothing
 * visible, so it has no counterpart in the Product Design System file.
 */
export const data: ComponentExamplesData = {
  name: 'Container',
  category: 'Layout',
  tagline:
    'Centres page content and bounds its width — the outermost layout element, and the only thing it renders is a max-width.',
  props: [
    {
      name: 'maxWidth',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | false",
      default: "'lg'",
      description:
        'The width bound, named as a breakpoint from the theme — `sm` 600, `md` 900, `lg` 1200, `xl` 1536. `false` removes the bound but keeps the gutters. `"xs"` is the exception: that breakpoint is 0, so MUI clamps the container to 444px.',
    },
    {
      name: 'fixed',
      type: 'boolean',
      default: 'false',
      description:
        'Swaps the fluid bound for a stepped one — max-width jumps to the min-width of the current breakpoint instead of growing with the viewport. Overrides `maxWidth`.',
    },
    {
      name: 'disableGutters',
      type: 'boolean',
      default: 'false',
      description:
        'Removes the horizontal padding, which is otherwise 16px below `sm` and 24px from `sm` up. Use it when the child supplies its own edge padding.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. Reasonable for vertical padding; a background, border, or shadow belongs on a `Box` or `Paper` around the Container, not on the Container.',
    },
    {
      name: 'classes',
      type: 'Partial<ContainerClasses>',
      default: '—',
      description:
        'Overrides for the generated class names (`root`, `fixed`, `disableGutters`, `maxWidthSm` …). `sx` is the shorter route for one-off styling.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Element or component rendered at the root. Polymorphic — `component="main"` also types the element\'s own props. Usually worth setting, since a page-level container is almost always a landmark.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'The content to bound and centre.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLElement>',
      default: '—',
      description: 'Forwarded to the root element.',
    },
  ],
  examples: [
    {
      title: 'Fluid',
      description:
        'The default behaviour: the Container fills its parent until it reaches `maxWidth`, then stops growing and centres itself with automatic margins. Below the bound it is fully fluid, so there is nothing to undo on a phone.',
      code: [
        '// Filler styling, reused across the examples below. `band` outlines',
        '// the space each Container was given, so its bounds are visible.',
        "const panel = { p: 2, borderRadius: 1, bgcolor: 'action.hover', textAlign: 'center' };",
        "const band = { borderRadius: 1, border: '1px dashed', borderColor: 'text.disabled' };",
        '',
        '<Box sx={band}>',
        '  <Container maxWidth="sm">',
        '    <Box sx={panel}>maxWidth=sm — 600px, then centred</Box>',
        '  </Container>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Fixed',
      description:
        '`fixed` snaps the max-width to the min-width of the current breakpoint, so the page width jumps in steps — 600, 900, 1200, 1536 — rather than growing smoothly. Design for a handful of widths instead of a continuum. Resize the window to see it move; the step above this demo frame is off-screen, which is the honest reason the preview looks full-width.',
      code: [
        '<Box sx={band}>',
        '  <Container fixed>',
        '    <Box sx={panel}>fixed</Box>',
        '  </Container>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Gutters',
      description:
        'A Container pads itself horizontally so content never touches the screen edge — 16px below `sm`, 24px from `sm` up, both off the Neoflo spacing scale. `maxWidth={false}` on both of these isolates the gutter: the only difference between the two rows is the padding.',
      code: [
        '<Stack spacing={2}>',
        '  <Box sx={band}>',
        '    <Container maxWidth={false}>',
        '      <Box sx={panel}>default gutters</Box>',
        '    </Container>',
        '  </Box>',
        '  <Box sx={band}>',
        '    <Container maxWidth={false} disableGutters>',
        '      <Box sx={panel}>disableGutters</Box>',
        '    </Container>',
        '  </Box>',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Unbounded width',
      description:
        '`maxWidth={false}` removes the bound and keeps the gutters — the right choice for a section that should span the viewport but still hold its content off the edge. It is not the same as dropping the Container, which would lose the gutters too.',
      code: [
        '<Box sx={band}>',
        '  <Container maxWidth={false}>',
        '    <Box sx={panel}>unbounded — still guttered</Box>',
        '  </Container>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Full-bleed background',
      description:
        'The pattern worth learning first. Put the colour on the element *around* the Container, never on the Container itself: the background then spans the full viewport while the content stays bounded and centred. A background on the Container stops at the max-width and leaves the edges bare.',
      code: [
        "<Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 4 }}>",
        '  <Container maxWidth="sm">',
        "    <Box sx={{ textAlign: 'center' }}>",
        '      The colour spans the width. The content does not.',
        '    </Box>',
        '  </Container>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Page shell',
      description:
        'The four layout primitives compose in one direction and do not overlap: Container sets the page width, Stack the vertical rhythm, Grid the horizontal split, Box the surfaces. On a real page the outermost Container is `component="main"`; this one is a `section` because the docs page it is embedded in already has a `<main>`, and a page gets exactly one.',
      code: [
        '<Container component="section" maxWidth="sm">',
        '  <Stack spacing={3}>',
        '    <Box sx={panel}>Header</Box>',
        '    <Grid container spacing={2}>',
        '      <Grid size={{ xs: 12, sm: 8 }}>',
        '        <Box sx={panel}>Main</Box>',
        '      </Grid>',
        '      <Grid size={{ xs: 12, sm: 4 }}>',
        '        <Box sx={panel}>Sidebar</Box>',
        '      </Grid>',
        '    </Grid>',
        '  </Stack>',
        '</Container>',
      ].join('\n'),
    },
    {
      title: 'Nested containers double the gutters',
      description:
        'Containers nest without complaint, and their padding adds up — two default Containers put 48px between the content and the edge instead of 24px. The inner one also does nothing else, since its own `maxWidth` is wider than the space it was given. Disable its gutters, or do not nest.',
      code: [
        '<Stack spacing={2}>',
        '  {/* 24px from each Container: 48px of gutter. */}',
        '  <Box sx={band}>',
        '    <Container maxWidth="sm">',
        '      <Container>',
        '        <Box sx={panel}>nested — 48px</Box>',
        '      </Container>',
        '    </Container>',
        '  </Box>',
        '  {/* The fix, when the nesting is unavoidable. */}',
        '  <Box sx={band}>',
        '    <Container maxWidth="sm">',
        '      <Container disableGutters>',
        '        <Box sx={panel}>nested — 24px</Box>',
        '      </Container>',
        '    </Container>',
        '  </Box>',
        '</Stack>',
      ].join('\n'),
    },
  ],
  dos: [
    'Set `component` to the landmark the region actually is — `main`, `section`, `header`, `footer` — rather than shipping an unlabelled `<div>`',
    'Put the background on the element around the Container, so the colour spans the viewport while the content stays bounded',
    'Name `maxWidth` from the breakpoint scale so the page width keeps tracking the theme',
    'Reach for `maxWidth={false}` when a section should span the viewport but still keep its gutters',
    'Use `disableGutters` when the Container\'s child already supplies its own edge padding, so the two do not stack',
  ],
  donts: [
    "Don't give the Container a background, border, or shadow — it is a width, not a surface; that is a `Box` or a `Paper` around it",
    "Don't nest Containers without `disableGutters` on the inner one — the padding adds up and the inner bound does nothing",
    "Don't set a pixel `maxWidth` through `sx` when a breakpoint name does the job — a hard-coded width stops tracking the theme",
    'Don\'t read `maxWidth="xs"` as the `xs` breakpoint — that breakpoint is 0, so MUI clamps the container to 444px instead',
    "Don't use a Container just to centre one element — `mx: 'auto'` with a `maxWidth` on a `Box` is the whole of it, without the gutters or the breakpoint bound",
  ],
  relatedComponents: ['Box', 'Grid', 'Stack'],
};
