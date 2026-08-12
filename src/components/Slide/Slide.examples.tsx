import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Slide`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl` — the design library specifies no motion. See
 * `DESIGNER_QUESTIONS.md` #25.
 */
export const data: ComponentExamplesData = {
  name: 'Slide',
  category: 'Motion',
  tagline:
    'Moves a child in from an edge of the screen and back out to it — the transition for anything that belongs to an edge, such as a sheet, a drawer, or a bar that arrives from the bottom.',
  props: [
    {
      name: 'direction',
      type: "'left' | 'right' | 'up' | 'down'",
      default: "'down'",
      description:
        'Where the child enters **from**, not where it travels to. `direction="up"` starts below the viewport and moves upward. This is the single most common mistake with the component.',
    },
    {
      name: 'in',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the child is shown. Flipping it runs the enter or exit transition.',
    },
    {
      name: 'children',
      type: 'ReactElement',
      default: '—',
      description:
        'A single element that accepts a `ref` and a `style` prop. The transition writes a `transform` onto it and measures the node to work out how far it has to travel.',
    },
    {
      name: 'container',
      type: 'Element | ((element) => Element) | null',
      default: '—',
      description:
        'Element whose edges the offset is measured against, instead of the window\'s. Without it a `Slide` inside a small card still travels the width of the screen — see the "clipped to its container" example.',
    },
    {
      name: 'timeout',
      type: 'number | { appear?, enter?, exit? }',
      default: '{ enter: 225, exit: 195 }',
      description:
        'Duration in milliseconds, reading `theme.transitions.duration.enteringScreen` and `leavingScreen` by default.',
    },
    {
      name: 'easing',
      type: 'string | { enter?, exit? }',
      default: '{ enter: easeOut, exit: sharp }',
      description:
        'CSS timing function. This transition is the one that ships asymmetric defaults: it decelerates on the way in and leaves at a constant rate, matching how Material treats objects that may return at any time.',
    },
    {
      name: 'appear',
      type: 'boolean',
      default: 'true',
      description:
        'Whether to animate on first mount when `in` is already true. Pass `false` for a panel that should already be open when the page loads, or the user watches it fly in on arrival.',
    },
    {
      name: 'mountOnEnter / unmountOnExit',
      type: 'boolean',
      default: 'false',
      description:
        'Defer mounting until the first enter, and remove the child once it has left. Both are usually right for an edge panel — an off-screen node that is still focusable is a keyboard trap waiting to happen.',
    },
    {
      name: 'disablePrefersReducedMotion',
      type: 'boolean',
      default: 'false',
      description:
        'Keep animating even when the OS asks for reduced motion. Least appropriate here of anywhere: a large translate is exactly what the setting exists to suppress.',
    },
  ],
  examples: [
    {
      title: 'A panel clipped to its container',
      description:
        'The offset is measured from the window, so an unclipped `Slide` inside a card travels the full width of the screen and is visible crossing everything in between. `overflow: hidden` on the parent is the fix — the child is then clipped to the container it belongs to.',
      code: [
        '<Box sx={{ overflow: "hidden" }}>',
        '  <Slide direction="left" in={open} mountOnEnter unmountOnExit>',
        '    <Paper variant="outlined" sx={{ p: 2 }}>Details</Paper>',
        '  </Slide>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'A save bar rising from the bottom',
      description:
        '`direction="up"` starts the child below the fold and brings it up. A fixed bar is the case this transition suits best: it belongs to the bottom edge, so arriving from there is what the user expects.',
      code: [
        '<Slide direction="up" in={isDirty} mountOnEnter unmountOnExit>',
        '  <Paper',
        '    sx={{ position: "fixed", bottom: 0, left: 0, right: 0, p: 2 }}',
        '  >',
        '    <Stack direction="row" spacing={1} justifyContent="flex-end">',
        '      <Button appearance="text" onClick={reset}>Discard</Button>',
        '      <Button variant="primary" onClick={save}>Save changes</Button>',
        '    </Stack>',
        '  </Paper>',
        '</Slide>',
      ].join('\n'),
    },
    {
      title: 'Measuring against a container instead of the window',
      description:
        'When the panel should travel only as far as its own parent is wide, hand `container` a ref to that parent. The offset is then computed from its edges, which is cheaper than clipping and keeps the movement proportionate.',
      code: [
        'const containerRef = React.useRef<HTMLDivElement>(null);',
        '',
        '<Box ref={containerRef} sx={{ position: "relative", overflow: "hidden" }}>',
        '  <Slide direction="right" in={open} container={containerRef.current}>',
        '    <Paper variant="outlined" sx={{ p: 2 }}>Filters</Paper>',
        '  </Slide>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Leaving the way it came',
      description:
        'A panel that enters from the left and exits to the right reads as being pushed past the user rather than dismissed. Keep one direction unless the movement is deliberately conveying a sequence, such as steps in a wizard.',
      code: [
        '<Slide direction={step > previousStep ? "left" : "right"} in={active}>',
        '  <Box sx={{ p: 3 }}>{stepContent}</Box>',
        '</Slide>',
      ].join('\n'),
    },
  ],
  dos: [
    'Read `direction` as where the child comes **from** — `up` enters from below',
    'Clip the parent with `overflow: hidden`, or pass `container`, whenever the panel is not meant to travel the full width of the window',
    'Pair it with `mountOnEnter` and `unmountOnExit` so an off-screen panel is not in the tab order',
    'Match the direction to the edge the thing belongs to — a bottom bar comes up, a right drawer comes from the right',
    'Pass `appear={false}` for a panel that is already open on first paint',
  ],
  donts: [
    "Don't use it for content in the normal flow — a sliding element that also reflows the page fights itself; that is `Collapse`",
    "Don't slide something in from one edge and out through another unless the movement genuinely represents a sequence",
    "Don't leave a large panel sliding across the whole viewport when it belongs to a card — clip it or set `container`",
    "Don't set `disablePrefersReducedMotion` here; of the five transitions this is the one most likely to make a motion-sensitive user unwell",
  ],
  relatedComponents: ['Fade', 'Grow', 'Zoom', 'Collapse'],
};
