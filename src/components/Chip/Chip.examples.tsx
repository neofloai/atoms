import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Chip`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Chip',
  category: 'Data Display',
  tagline:
    'Compact pill for tags, filters, and statuses with the same colour roles as Button.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=977-17709',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description: 'Chip content. Inherited from MUI.',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'information' | 'orange' | 'purple'",
      default: "'primary'",
      description:
        '`information`/`orange`/`purple` are only drawn at `size="sm"`; at `size="md"` they fall back to the `secondary` look.',
    },
    {
      name: 'appearance',
      type: "'contained' | 'outline'",
      default: "'contained'",
      description:
        'Visual emphasis: subtle fill or 1px border. Only applies at `size="md"` — `size="sm"` always renders a flat swatch.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description:
        '`md` = 36px pill (five roles, contained/outline, interactive). `sm` = 20px flat tag (eight roles, no states).',
    },
    {
      name: 'dense',
      type: 'boolean',
      default: 'false',
      description:
        'Renders the 32px pill instead of the 36px one. Only the vertical padding changes. No effect at `size="sm"`.',
    },
    {
      name: 'selected',
      type: 'boolean',
      default: '—',
      description:
        'Persistent selected state for filter chips: draws the role border plus the selected fill, and sets `aria-pressed` on clickable chips. No effect at `size="sm"`.',
    },
    {
      name: 'avatar',
      type: 'ReactElement',
      default: '—',
      description: 'Leading avatar element. Inherited from MUI.',
    },
    {
      name: 'icon',
      type: 'ReactElement',
      default: '—',
      description: 'Leading icon element. Inherited from MUI.',
    },
    {
      name: 'onDelete',
      type: '(event) => void',
      default: '—',
      description:
        'Shows a trailing delete affordance and fires when activated. Inherited from MUI.',
    },
    {
      name: 'onClick',
      type: '(event) => void',
      default: '—',
      description:
        'Makes the chip clickable; hover and pressed states only render on clickable chips.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the chip and applies disabled styling.',
    },
  ],
  examples: [
    {
      title: 'Status tag',
      code: '<Chip variant="success" label="Active" />',
    },
    {
      title: 'Removable filter',
      code: [
        '<Chip',
        '  appearance="outline"',
        '  label="Design"',
        '  onDelete={handleRemove}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'With avatar',
      code: [
        '<Chip',
        '  variant="secondary"',
        '  avatar={<Avatar>OP</Avatar>}',
        '  label="Olivia Park"',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Clickable chip',
      code: '<Chip label="View report" onClick={handleOpen} />',
    },
    {
      title: 'Selectable filter',
      description:
        'The selected state persists after the pointer leaves, so it draws a border rather than relying on the hover fill.',
      code: [
        '<Chip',
        '  label="Design"',
        '  appearance="outline"',
        '  selected={isSelected}',
        '  onClick={toggle}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Sizes',
      description:
        '`dense` is the 32px pill; the 36px pill is the default. `size="sm"` is the separate 20px flat tag.',
      code: [
        '<Chip size="sm" variant="purple" label="Small" />',
        '<Chip dense label="Dense" />',
        '<Chip label="Medium" />',
      ].join('\n'),
    },
    {
      title: 'Flat tag colours',
      description:
        '`size="sm"` adds three colour roles with no pill equivalent.',
      code: [
        '<Chip size="sm" variant="information" label="Info" />',
        '<Chip size="sm" variant="orange" label="Orange" />',
        '<Chip size="sm" variant="purple" label="Purple" />',
      ].join('\n'),
    },
  ],
  dos: [
    'Match the `variant` to the meaning (e.g. `success` for healthy states, `error` for failures)',
    'Use `appearance="outline"` for filter chips and lower-emphasis tags',
    'Use `onDelete` for removable selections so the affordance is consistent',
    'Pair `selected` with `onClick` so the state is reachable by keyboard and announced',
    'Keep labels short — one or two words',
  ],
  donts: [
    "Don't use a Chip as a primary action — use `Button` instead",
    "Don't rely on colour alone to communicate status — the label must carry the meaning",
    "Don't mix sizes within one group of chips",
    "Don't hardcode background or border colours — the variant covers both colour schemes",
    "Don't use `information`/`orange`/`purple` at `size=\"md\"` — they have no pill styling and fall back to `secondary`",
    "Don't use `selected` to mean \"active nav item\" — it announces a toggle, not a location",
    "Don't mix `dense` and default pills in the same row — the 4px difference reads as misalignment",
  ],
  relatedComponents: ['Button', 'IconButton'],
  accessibility: [
    'Clickable chips at `size="md"` are focusable and render a 3px focus-visible ring. Figma defines no focused state for either size, so the ring is a library addition',
    '`selected` sets `aria-pressed` on clickable chips, and is drawn with a border rather than a fill shift alone so it survives the pointer leaving',
    'The delete affordance is keyboard-accessible via Backspace/Delete when the chip has focus',
  ],
};
