import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Skeleton`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System library has no skeleton,
 * placeholder, or shimmer component to link to — see
 * DESIGNER_QUESTIONS.md #24. The field is left off rather than pointed
 * at an approximate node, so the docs page does not imply a design
 * exists.
 */
export const data: ComponentExamplesData = {
  name: 'Skeleton',
  category: 'Feedback',
  tagline:
    'A grey stand-in for content that has not arrived yet, so the page holds its shape while data loads instead of collapsing and reflowing when it lands.',
  props: [
    {
      name: 'variant',
      type: "'text' | 'rectangular' | 'rounded' | 'circular'",
      default: "'text'",
      description:
        'Shape of the placeholder. `text` takes its height from the surrounding font size and gets a text-shaped radius; `rounded` uses the theme radius (8px); `rectangular` has square corners; `circular` is a disc, for avatars.',
    },
    {
      name: 'animation',
      type: "'pulse' | 'wave' | false",
      default: "'pulse'",
      description:
        'How the placeholder animates. `pulse` fades in and out, `wave` sweeps a highlight across it, `false` renders a static block. All three stop under `prefers-reduced-motion: reduce`.',
    },
    {
      name: 'width',
      type: 'number | string',
      default: '—',
      description:
        'Width of the placeholder. Numbers are pixels, strings pass through (`"60%"`). Omit it when the skeleton is a block-level child that should fill its parent, or when `children` supply the size.',
    },
    {
      name: 'height',
      type: 'number | string',
      default: '—',
      description:
        'Height of the placeholder. Leave it off for `variant="text"`, which derives its height from the font size — set `sx={{ fontSize }}` instead so the bar tracks the type scale.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'A real component to take dimensions from, instead of stating `width` and `height`. The child is rendered but hidden, so it is a measuring device only — never content the user is meant to read.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'span'",
      description:
        'Element rendered at the root. Fully type-checked, so `component=\"div\"` also accepts a div\'s own props — useful when a `span` would be invalid HTML inside the element you are filling.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. The usual reasons here are a card-sized radius (`borderRadius: 3`) or a font size for a text skeleton.',
    },
    {
      name: 'classes',
      type: 'Partial<SkeletonClasses>',
      default: '—',
      description:
        'Overrides for the generated class names (`root`, `text`, `rounded`, `circular`, `rectangular`, `pulse`, `wave`, `withChildren`). `sx` is the shorter route for one-off styling.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLSpanElement>',
      default: '—',
      description:
        'Forwarded to the root element, and re-typed when `component` changes it.',
    },
  ],
  examples: [
    {
      title: 'Shapes',
      description:
        'Four shapes cover almost everything. `text` is the default and is the only one that sizes itself — it reads the surrounding font size, so it lines up with the text it is replacing. The other three need a `width` and `height`, because a box has no intrinsic size to borrow.',
      code: [
        '<Skeleton />',
        '<Skeleton variant="circular" width={40} height={40} />',
        '<Skeleton variant="rounded" width={210} height={60} />',
        '<Skeleton variant="rectangular" width={210} height={60} />',
      ].join('\n'),
    },
    {
      title: 'Lines of text',
      description:
        'A text skeleton is measured in font sizes, not pixels. Put one inside the Typography variant it stands in for and it inherits the right height automatically. For a paragraph, vary the last line so the block reads as prose rather than as a stack of identical bars.',
      code: [
        '<Typography variant="h4">',
        '  {loading ? <Skeleton /> : title}',
        '</Typography>',
        '',
        '<Stack spacing={0.5}>',
        '  <Skeleton />',
        '  <Skeleton />',
        '  <Skeleton width="60%" />',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Sizing from the real component',
      description:
        'Rather than repeating an Avatar\'s dimensions as numbers that will drift, pass the Avatar itself. The child is rendered to measure it and then hidden, so the placeholder is exactly the size of the thing it replaces and stays correct when that size changes.',
      code: [
        '{loading ? (',
        '  <Skeleton variant="circular">',
        '    <Avatar size="md" />',
        '  </Skeleton>',
        ') : (',
        '  <Avatar size="md" src={user.avatarUrl} name={user.name} />',
        ')}',
      ].join('\n'),
    },
    {
      title: 'A list row',
      description:
        'Compose placeholders the same way you compose the real row, so the two occupy identical space and nothing shifts when the data lands. Render as many rows as you expect — a single row followed by ten is its own kind of layout jump.',
      code: [
        '<Stack spacing={2}>',
        '  {Array.from({ length: 3 }, (_, index) => (',
        '    <Stack key={index} direction="row" spacing={1.5} alignItems="center">',
        '      <Skeleton variant="circular" width={40} height={40} />',
        '      <Stack spacing={0.5} sx={{ flex: 1 }}>',
        '        <Skeleton width="40%" />',
        '        <Skeleton width="70%" />',
        '      </Stack>',
        '    </Stack>',
        '  ))}',
        '</Stack>',
      ].join('\n'),
    },
    {
      title: 'Standing in for a card',
      description:
        'The `rounded` variant uses the theme radius, which is 8px — the default for controls. A card in this system is 24px, so a card-shaped placeholder needs the radius stated. `borderRadius: 3` is the theme multiplier for it.',
      code: [
        '<Skeleton',
        '  variant="rounded"',
        '  height={180}',
        '  sx={{ borderRadius: 3 }}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Animation',
      description:
        'The default pulse suits most cases. Use `wave` when several placeholders sit together and a synchronised fade would read as flicker; use `false` when the skeleton is inside something that already animates. Reduced-motion users get a static block from all three without any extra work.',
      code: [
        '<Skeleton />',
        '<Skeleton animation="wave" />',
        '<Skeleton animation={false} />',
      ].join('\n'),
    },
    {
      title: 'Announcing the load',
      description:
        'The skeleton itself carries no ARIA, which is deliberate — the loading state belongs to the region, not to each grey block inside it. Mark the region busy and let a screen reader announce the content once it arrives, instead of narrating a dozen placeholders.',
      code: [
        '<Box aria-busy={loading} aria-live="polite">',
        '  {loading ? (',
        '    <Skeleton width={180} />',
        '  ) : (',
        '    <Typography>{user.name}</Typography>',
        '  )}',
        '</Box>',
      ].join('\n'),
    },
  ],
  dos: [
    'Match the placeholder to the shape and size of the content it replaces, so nothing jumps when the data lands',
    'Pass the real component as `children` to inherit its dimensions instead of hardcoding `width` and `height` that will drift',
    'Vary the line widths in a paragraph placeholder — a stack of identical bars does not read as text',
    'Put `aria-busy` on the region being loaded, and let the skeletons stay silent',
    'Render as many placeholder rows as you expect back, so the page height is roughly right before the data arrives',
  ],
  donts: [
    "Don't show a skeleton for a load that usually finishes in under about 300ms — a flash of grey is more distracting than a brief blank",
    "Don't use one for an action with no predictable shape, like saving or deleting — that is a spinner or a disabled button",
    "Don't set the fill with `sx={{ bgcolor }}` — it is translucent so it composites over whatever surface it sits on, and a solid colour stops working the moment it is nested in a card",
    "Don't leave placeholders on screen when a request fails — swap to an error state, or the page looks permanently stuck",
    "Don't wrap real text in a skeleton to grey it out; children are hidden outright, so it is a measuring device and not a dimming effect",
  ],
  relatedComponents: ['Avatar', 'Alert'],
  accessibility: [
    'Carries no ARIA and is not focusable, matching MUI — a placeholder is decoration, and the loading state belongs on the region around it via `aria-busy`',
    'Honours `prefers-reduced-motion: reduce`: both the pulse and the wave stop, leaving a static block that still communicates the layout',
    'Children passed for dimension inference are hidden with `visibility: hidden`, so they never reach the accessibility tree or get announced',
    'Announce the arrival once with `aria-live="polite"` on the container rather than per placeholder, so a screen reader reads the content and not the wait',
    'The fill composites against whatever surface it sits on, keeping a constant step in both colour schemes — a custom `bgcolor` needs its own contrast check on every surface it will appear on',
  ],
};
