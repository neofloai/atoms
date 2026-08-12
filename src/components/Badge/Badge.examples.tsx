import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Badge`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System file has no Badge sheet, so
 * the colours come from the semantic tokens and the geometry from MUI —
 * see the notes in `Badge.tsx`.
 */
export const data: ComponentExamplesData = {
  name: 'Badge',
  category: 'Data Display',
  tagline:
    'Small count or status mark anchored to the corner of another element, for unread items, pending work, and presence.',
  props: [
    {
      name: 'badgeContent',
      type: 'ReactNode',
      default: '—',
      description:
        'What the badge shows. A number is clamped by `max`; a short string is rendered as-is. Omit it for `variant="dot"`.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The element the badge is anchored to. Leave it out to render the badge on its own, inline with text.',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'information'",
      default: "'primary'",
      description:
        "Colour role. `secondary` is the neutral treatment (MUI's `default`), `information` is MUI's `info`.",
    },
    {
      name: 'variant',
      type: "'standard' | 'dot'",
      default: "'standard'",
      description:
        'Shape. `standard` draws the 20px counter; `dot` draws an 8px mark and ignores `badgeContent`.',
    },
    {
      name: 'max',
      type: 'number',
      default: '99',
      description:
        'Highest number shown before the count becomes `99+`. Only applies when `badgeContent` is a number.',
    },
    {
      name: 'showZero',
      type: 'boolean',
      default: 'false',
      description:
        'Keeps the badge visible when the count is `0`. Off by default, so an empty inbox shows nothing.',
    },
    {
      name: 'invisible',
      type: 'boolean',
      default: 'false',
      description:
        'Hides the badge while keeping it mounted, so it scales out and back in rather than popping.',
    },
    {
      name: 'overlap',
      type: "'rectangular' | 'circular'",
      default: "'rectangular'",
      description:
        'Shape of the element underneath. `circular` tucks the badge inwards by 14% so it does not float off a round avatar.',
    },
    {
      name: 'anchorOrigin',
      type: "{ vertical: 'top' | 'bottom', horizontal: 'left' | 'right' }",
      default: "{ vertical: 'top', horizontal: 'right' }",
      description: 'Which corner the badge sits in.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'span'",
      description:
        'Element the root renders as. The root is only a positioning wrapper, so this is rarely needed.',
    },
    {
      name: 'slotProps',
      type: '{ root?, badge? }',
      default: '—',
      description:
        'Props forwarded to the root or badge span — the seam for a `title`, a `data-*` attribute, or an id.',
    },
  ],
  examples: [
    {
      title: 'Unread count',
      description:
        'The count belongs in the control\'s accessible name, because the badge itself is `aria-hidden`.',
      code: [
        '<Badge badgeContent={4} color="error">',
        '  <IconButton aria-label="4 unread notifications">',
        '    <BellIcon />',
        '  </IconButton>',
        '</Badge>',
      ].join('\n'),
    },
    {
      title: 'Status dot',
      description:
        'No `badgeContent` — the dot is the whole signal, so pair it with text elsewhere.',
      code: [
        '<Badge variant="dot" color="success" overlap="circular">',
        '  <Avatar src="/users/olivia.jpg" alt="Olivia Park" />',
        '</Badge>',
      ].join('\n'),
    },
    {
      title: 'Clamping a large count',
      description: 'Anything over `max` renders as `max+`.',
      code: [
        '<Badge badgeContent={1204} max={99} color="error">',
        '  <IconButton aria-label="1204 unread notifications">',
        '    <EnvelopeIcon />',
        '  </IconButton>',
        '</Badge>',
      ].join('\n'),
    },
    {
      title: 'Animating in and out',
      description:
        '`invisible` keeps the badge mounted so it scales away instead of disappearing.',
      code: [
        '<Badge badgeContent={count} color="primary" invisible={count === 0}>',
        '  <IconButton aria-label={`${count} items in cart`}>',
        '    <ShoppingCartIcon />',
        '  </IconButton>',
        '</Badge>',
      ].join('\n'),
    },
    {
      title: 'Moving the anchor',
      code: [
        '<Badge',
        '  badgeContent={7}',
        "  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}",
        '>',
        '  <Avatar>OP</Avatar>',
        '</Badge>',
      ].join('\n'),
    },
    {
      title: 'Standalone',
      description:
        'With no child the root collapses to nothing and the badge stays centred on that point, overhanging on all four sides — so give it room rather than a slot in a text run.',
      code: [
        '<Box sx={{ px: 2, py: 1.5 }}>',
        '  <Badge badgeContent={12} color="primary" />',
        '</Box>',
      ].join('\n'),
    },
  ],
  dos: [
    'Put the count in the wrapped control\'s `aria-label` — MUI marks the badge `aria-hidden`, so it is never read out',
    'Use `overlap="circular"` over an avatar or any round target, so the badge tucks in rather than floating off the edge',
    'Use `variant="dot"` when the fact that something changed matters more than how much did',
    'Keep `badgeContent` to a number or one short word; the counter is 20px tall and grows sideways',
    'Let the default `showZero={false}` hide an empty count instead of rendering a `0`',
    'Reach for `Chip size="sm"` when you want a label beside text — a badge is anchored to a corner, not set inline',
  ],
  donts: [
    "Don't rely on the colour alone to carry meaning — a `warning` and an `error` dot are two shades of the same 8px circle to most people",
    "Don't use a badge as a label for the element it covers; it sits on top of the corner and will hide content",
    "Don't put anything interactive inside `badgeContent` — the badge is `aria-hidden` and cannot be reached by keyboard",
    "Don't raise `max` past three digits; use a standalone badge or plain text when the exact number matters",
    "Don't wrap a block-level layout in a badge — the root is `inline-flex`, so it is meant to sit around a single control",
    "Don't drop a childless badge into a row of text expecting it to take up space: the root measures 0x0 and the badge overhangs it on every side, so it will land on whatever is next to it",
  ],
  relatedComponents: ['Avatar', 'Chip', 'IconButton'],
  accessibility: [
    'MUI renders the badge with `aria-hidden="true"`, so assistive technology never reads `badgeContent`. Whatever it says has to be repeated in the wrapped control\'s accessible name — `aria-label="4 unread notifications"` rather than `aria-label="Notifications"`',
    'Keep that label in sync with the count as it changes, so a screen reader and the screen never disagree',
    'A badge is decoration, not a control: it takes no focus and fires no events. Anything clickable has to be the child',
    "The counter pairs each role's fill with its own ink, which clears 4.5:1 on ten of the twelve role-and-scheme combinations. Two do not, both inherited from the same tokens a filled `Button` uses: `warning` in light mode (3.1:1) and `primary` in dark mode (2.3:1) — so don't put a number that has to be read precisely on either",
    'A `dot` clears 3:1 against the page on every role except light-mode `warning` (2.2:1), which is a mid yellow on a near-white page. Nothing has a dot as its only indication of state, so pair it with text either way',
    '`invisible` animates with a transform, so it is exempt from `prefers-reduced-motion` concerns about movement across the page, but it does still animate — pass `invisible` only when the change is meaningful',
  ],
};
