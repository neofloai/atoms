import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the progress family — `CircularProgress` and
 * `LinearProgress`, the two components MUI documents on one page. Read
 * by `scripts/generate.ts` and served through the MCP `get_component`
 * tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System file has no progress,
 * spinner, or loader component, so the colours come from the semantic
 * tokens and the geometry from MUI — see the notes in
 * `progressTokens.ts` and DESIGNER_QUESTIONS.md #36.
 */
export const data: ComponentExamplesData = {
  name: 'Progress',
  category: 'Feedback',
  tagline:
    'Indeterminate spinner or determinate bar for work already underway — a request in flight, a file uploading, a page of results on its way.',
  props: [
    {
      name: 'variant',
      type: "CircularProgress: 'indeterminate' | 'determinate'. LinearProgress: adds 'buffer' | 'query'",
      default: "'indeterminate'",
      description:
        'Whether a percentage is known. `indeterminate` animates forever; `determinate` draws `value`. Not the emphasis axis `variant` names on Button or Chip — the colour role is on `color`.',
    },
    {
      name: 'value',
      type: 'number',
      default: '—',
      description:
        'The determinate value, between `min` and `max`. Required for `determinate` and `buffer`; ignored otherwise.',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'information' | 'inherit'",
      default: "'primary'",
      description:
        "Colour role. `secondary` is the neutral treatment, `information` is MUI's `info`, and `inherit` takes the colour of whatever it sits inside.",
    },
    {
      name: 'size',
      type: 'number | string',
      default: '40',
      description:
        'CircularProgress only. A raw dimension, not a `sm`/`md`/`lg` step: use 16 inside a button, 20 in a dense row, 40 standing alone.',
    },
    {
      name: 'thickness',
      type: 'number',
      default: '3.6',
      description:
        'CircularProgress only. Stroke width in a 44-unit viewBox, so it scales with `size` instead of staying a fixed pixel count.',
    },
    {
      name: 'enableTrackSlot',
      type: 'boolean',
      default: 'false',
      description:
        'CircularProgress only. Draws the unfilled ring behind the arc, so a determinate ring shows how far there is left to go.',
    },
    {
      name: 'disableShrink',
      type: 'boolean',
      default: 'false',
      description:
        'CircularProgress only. Stops the indeterminate arc from breathing, leaving a fixed-length arc that just rotates.',
    },
    {
      name: 'valueBuffer',
      type: 'number',
      default: '—',
      description:
        'LinearProgress `buffer` only. A second, further-ahead value — bytes fetched but not yet played. Not announced to assistive technology.',
    },
    {
      name: 'min / max',
      type: 'number',
      default: '0 / 100',
      description:
        'The scale `value` is read against, so a byte or step count can be passed straight through without converting to a percentage.',
    },
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description:
        'Neither component has an accessible name of its own. One of these is required, or the wait is announced as an unlabelled progress bar.',
    },
    {
      name: 'sx',
      type: 'SxProps',
      default: '—',
      description:
        'Escape hatch for the two dimensions with no prop: a taller bar (`sx={{ height: 8 }}`) or a bar that is not full width.',
    },
  ],
  examples: [
    {
      title: 'A wait with no percentage',
      description:
        'The default. Both components need a name — they have none of their own.',
      code: [
        '<CircularProgress aria-label="Loading results" />',
        '',
        '<LinearProgress aria-label="Loading results" />',
      ].join('\n'),
    },
    {
      title: 'A known percentage',
      description:
        '`enableTrackSlot` gives the ring its unfilled remainder; a bar always has one.',
      code: [
        '<CircularProgress',
        '  variant="determinate"',
        '  value={72}',
        '  enableTrackSlot',
        '  aria-label="Upload progress"',
        '/>',
        '',
        '<LinearProgress variant="determinate" value={72} aria-label="Upload progress" />',
      ].join('\n'),
    },
    {
      title: 'Loading a region',
      description:
        "MUI's documented ARIA pattern: the region owns the busy state and points at the bar, so the wait is announced once, in context.",
      code: [
        '<Box aria-busy={loading} aria-describedby="invoices-progress">',
        '  {loading && (',
        '    <LinearProgress id="invoices-progress" aria-label="Loading invoices" />',
        '  )}',
        '  <InvoiceTable rows={rows} />',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Inside a control',
      description:
        "`color=\"inherit\"` takes the control's own colour. `Button` and `IconButton` already do this for their `loading` state, at `size={16}` — use `loadingPosition=\"start\"` on a button that has a label.",
      code: [
        '<Button variant="primary" loading loadingPosition="start" startIcon={<FloppyDiskIcon />}>',
        '  Saving',
        '</Button>',
        '',
        '<Box sx={{ color: \'text.secondary\' }}>',
        '  <CircularProgress color="inherit" size={16} aria-label="Saving" />',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'A ring with its percentage in the middle',
      description:
        "MUI's own recipe rather than a `label` prop: the ring is a mark, and text inside it is a layout.",
      code: [
        "<Box sx={{ position: 'relative', display: 'inline-flex' }}>",
        '  <CircularProgress',
        '    variant="determinate"',
        '    value={value}',
        '    enableTrackSlot',
        '    aria-label="Upload progress"',
        '  />',
        '  <Box',
        '    sx={{',
        "      position: 'absolute',",
        '      inset: 0,',
        "      display: 'flex',",
        "      alignItems: 'center',",
        "      justifyContent: 'center',",
        '    }}',
        '  >',
        '    <Typography variant="caption" color="text.secondary">',
        '      {`${Math.round(value)}%`}',
        '    </Typography>',
        '  </Box>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Counting in real units',
      description:
        '`min` and `max` take the scale the data already has, so there is no percentage to compute.',
      code: [
        '<LinearProgress',
        '  variant="determinate"',
        '  value={bytesSent}',
        '  max={totalBytes}',
        '  aria-label={`Uploading, step ${step} of ${steps}`}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Buffered ahead of the value',
      description:
        'The dotted remainder is what has not been fetched; the solid band behind the bar is fetched but not yet played.',
      code: [
        '<LinearProgress variant="buffer" value={48} valueBuffer={64} aria-label="Buffering" />',
      ].join('\n'),
    },
    {
      title: 'A taller bar',
      description:
        'There is no `size` on the bar. Height comes from `sx`, and the rounded ends follow it.',
      code: ['<LinearProgress variant="determinate" value={40} sx={{ height: 8 }} />'].join(
        '\n'
      ),
    },
  ],
  dos: [
    'Give every indicator an `aria-label`, or point `aria-labelledby` at the heading it belongs to — neither component has a name of its own',
    'Use `LinearProgress` when a region is loading and `CircularProgress` when a single control is busy',
    'Use `determinate` as soon as a real percentage exists; a spinner that could be a bar wastes information the user already has',
    'Pass `min` / `max` and let the component do the arithmetic, rather than converting bytes or steps to a percentage first',
    "Put `aria-busy` on the region being loaded and have it point at the indicator with `aria-describedby` — MUI's documented pattern",
    'Reach for `Skeleton` instead when the shape of the content that is coming is already known — it says more than a spinner does',
    'Turn on `enableTrackSlot` for a determinate ring, so the remaining share of the circle is visible rather than implied',
  ],
  donts: [
    "Don't leave a spinner as the only thing on screen for a long wait — after a second or two people need to know what is being waited for, which is text, not an indicator",
    "Don't use `determinate` with a value that jumps backwards or sticks at 99 — an honest spinner beats a dishonest bar",
    "Don't put a spinner inside a `Button` by hand; the `loading` prop already renders one at the right size and colour, and keeps the label's width — pair it with `loadingPosition=\"start\"` so the spinner replaces the icon rather than sitting over the label",
    "Don't rely on `valueBuffer` to communicate anything important — it is drawn but never announced, because ARIA has no second value",
    "Don't stack several indicators for one operation; one indicator per wait, at the level the wait belongs to",
    "Don't use `color` to signal a result — a bar turning `error` red mid-flight reads as a state change, and a finished operation should be replaced by its outcome, not recoloured",
  ],
  relatedComponents: ['Skeleton', 'Button', 'Slider'],
  accessibility: [
    'MUI renders `role="progressbar"` with no name attached. `aria-label` or `aria-labelledby` is required on both components — this is the one accessibility detail the wrapper cannot supply for you',
    '`determinate` and `buffer` also get `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, so a percentage is announced. `indeterminate` and `query` deliberately omit them, which is how ARIA expresses "in progress, amount unknown"',
    'Pass `aria-valuetext` when the number needs units to make sense — "3 of 8 files" rather than "37"',
    'For a region that is loading, put `aria-busy` on the region and `aria-describedby` pointing at the indicator, rather than putting a live region on the indicator itself. Announcing every percentage tick is worse than announcing none',
    'The theme sets `motion.reducedMotion: "system"`, so both components stop animating under `prefers-reduced-motion`. A spinner then reads as a frozen arc and a bar as a static stub in the middle of the track — MUI\'s own behaviour, and the reason a wait needs accompanying text either way (DESIGNER_QUESTIONS.md #36)',
    'Where the fill meets the track, eleven of the twelve role-and-scheme combinations clear 3:1 — measured 3.5:1 to 10.7:1. The exception is `warning` in light mode at 1.35:1: a mid yellow and a mid grey are almost the same luminance, and no rung of the neutral ladder fixes it. Use `warning` on a dark page, or use the default `primary` and put the warning in text (DESIGNER_QUESTIONS.md #36)',
    'The track itself is a subtle fill rather than a 3:1 boundary — 1.62:1 against a light card, 1.20:1 against a dark one. That is deliberate: pushing the track to 3:1 would demand roughly 9:1 from the fill, which no role colour has. So the *filled* portion is what carries the value, and a bar whose remaining share has to be legible on its own needs a number beside it',
    'Both roots are `<span>`s with no interactive behaviour: they take no focus, fire no events, and add nothing to the tab order',
  ],
};
