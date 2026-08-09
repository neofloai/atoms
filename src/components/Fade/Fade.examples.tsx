import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Fade`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System library specifies no
 * motion — no durations, no easing curves, no transition variants on
 * any component sheet. The timings documented below are
 * `theme.transitions`, which is still MUI's Material scale. See
 * `DESIGNER_QUESTIONS.md` #25.
 */
export const data: ComponentExamplesData = {
  name: 'Fade',
  category: 'Motion',
  tagline:
    'Animates a child between transparent and opaque when a boolean flips — the quietest of the five transitions, and the right default for anything that appears in place.',
  props: [
    {
      name: 'in',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the child is shown. Flipping it runs the enter or exit transition. This is the only prop most usages need.',
    },
    {
      name: 'children',
      type: 'ReactElement',
      default: '—',
      description:
        'A single element that accepts a `ref` and a `style` prop — a DOM element, any Atoms component, or any `forwardRef` component. The transition writes `opacity` onto it, so a component that drops `style` will silently not animate.',
    },
    {
      name: 'timeout',
      type: 'number | { appear?, enter?, exit? }',
      default: '{ enter: 225, exit: 195 }',
      description:
        'Duration in milliseconds. The default reads `theme.transitions.duration.enteringScreen` and `leavingScreen`, so leaving it alone keeps the whole library in step.',
    },
    {
      name: 'easing',
      type: 'string | { enter?, exit? }',
      default: "theme.transitions.easing.easeInOut",
      description:
        'CSS timing function. Set it per direction when entering and exiting should not feel symmetric — `easeOut` in, `sharp` out is the Material pairing.',
    },
    {
      name: 'appear',
      type: 'boolean',
      default: 'true',
      description:
        'Whether to animate on first mount when `in` is already true. Set it to `false` for something that should simply be there when the page loads rather than fading in on arrival.',
    },
    {
      name: 'mountOnEnter',
      type: 'boolean',
      default: 'false',
      description:
        'Delay mounting the child until the first enter. Useful when the child is expensive and may never be shown.',
    },
    {
      name: 'unmountOnExit',
      type: 'boolean',
      default: 'false',
      description:
        'Remove the child from the DOM once it has faded out. Without it the node stays at `opacity: 0` — still focusable and still read by screen readers, which is usually wrong for content that is meant to be gone.',
    },
    {
      name: 'disablePrefersReducedMotion',
      type: 'boolean',
      default: 'false',
      description:
        'Keep animating even when the OS asks for reduced motion. The theme sets `motion: { reducedMotion: "system" }`, so this is an opt-out — reach for it only when the movement carries meaning that its absence would lose.',
    },
    {
      name: 'onEntered / onExited',
      type: '(node, isAppearing) => void',
      default: '—',
      description:
        'Lifecycle callbacks, with `onEnter`, `onEntering`, `onExit`, and `onExiting` alongside them. Use `onExited` to run cleanup after the animation rather than at the moment state changed.',
    },
  ],
  examples: [
    {
      title: 'Revealing a result',
      description:
        'The default case: a boolean drives the transition and nothing else is configured. `unmountOnExit` matters here — a success message left in the DOM at zero opacity is still announced by a screen reader.',
      code: [
        '<Fade in={submitted} unmountOnExit>',
        '  <Alert severity="success">Invite sent to {email}.</Alert>',
        '</Fade>',
      ].join('\n'),
    },
    {
      title: 'Crossfading two states',
      description:
        'Two fades over one grid cell swap content without the layout moving. Both children occupy the same cell, so the container keeps the height of the taller one and nothing below it jumps.',
      code: [
        '<Box sx={{ display: "grid" }}>',
        '  <Fade in={!loading}>',
        '    <Box sx={{ gridArea: "1 / 1" }}>{chart}</Box>',
        '  </Fade>',
        '  <Fade in={loading}>',
        '    <Box sx={{ gridArea: "1 / 1" }}>',
        '      <Skeleton variant="rounded" height={180} />',
        '    </Box>',
        '  </Fade>',
        '</Box>',
      ].join('\n'),
    },
    {
      title: 'Asymmetric timing',
      description:
        'Appearing slowly and leaving quickly reads as responsive; the reverse reads as sluggish. Pass an object when the two directions should differ.',
      code: [
        '<Fade in={open} timeout={{ enter: 300, exit: 120 }}>',
        '  <Paper variant="outlined" sx={{ p: 2 }}>Details</Paper>',
        '</Fade>',
      ].join('\n'),
    },
    {
      title: 'Not animating on first paint',
      description:
        'A panel that is open when the page loads should already be open, not fade in as the user arrives. `appear={false}` keeps the transition for later state changes and skips the one on mount.',
      code: [
        '<Fade in={open} appear={false}>',
        '  <Box sx={{ p: 2 }}>{content}</Box>',
        '</Fade>',
      ].join('\n'),
    },
    {
      title: 'Cleaning up after the animation, not before',
      description:
        'Clearing state the instant `in` goes false empties the element mid-fade. `onExited` fires once the transition has finished, so the content stays intact until it is genuinely invisible.',
      code: [
        '<Fade in={Boolean(error)} onExited={() => setError(null)} unmountOnExit>',
        '  <Alert severity="error">{error?.message}</Alert>',
        '</Fade>',
      ].join('\n'),
    },
  ],
  dos: [
    'Reach for `Fade` first — it is the least movement that still communicates a change, and it never causes layout shift',
    'Pass `unmountOnExit` for anything that should be gone when hidden, so it leaves the accessibility tree and the tab order with it',
    'Leave `timeout` alone unless you have a reason; the default reads `theme.transitions` and keeps every transition in the library in step',
    'Use `appear={false}` for content that is already open on page load',
    'Do cleanup in `onExited` rather than in the handler that flipped the boolean',
  ],
  donts: [
    "Don't pass a component that drops `ref` or `style` — the transition writes the animation onto the child, so it will render but never animate",
    "Don't give it more than one child; wrap several elements in a `Box` and fade that",
    "Don't use it for content that changes the page height — that is `Collapse`, and fading a node in and out of the flow makes everything below it jump",
    "Don't set `disablePrefersReducedMotion` to make a design look right; if the motion is load-bearing, the still frame needs fixing instead",
    "Don't stack a fade on a parent and a fade on its child — the opacities multiply and the inner one appears to lag",
  ],
  relatedComponents: ['Grow', 'Zoom', 'Slide', 'Collapse'],
  accessibility: [
    'Respects `prefers-reduced-motion: reduce` automatically — the theme sets `motion: { reducedMotion: "system" }`, so the state change lands instantly rather than tweening',
    'Carries no ARIA and adds no DOM; the semantics belong to the child and to whatever control toggles it',
    'Without `unmountOnExit` the hidden child stays focusable and announced at `opacity: 0` — pass it, or manage `inert` yourself',
    'A fade is not an announcement: content that appears in response to a user action still needs a live region, or focus moved to it, for a screen reader to notice',
    'Keep durations short enough that a keyboard user tabbing quickly is never waiting on an animation to finish before the target is interactive',
  ],
};
