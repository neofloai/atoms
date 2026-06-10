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
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description: 'Chip content. Inherited from MUI.',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'success' | 'error' | 'warning'",
      default: "'primary'",
      description:
        'Colour role. `secondary` renders on neutral grey surfaces; all others use their semantic colour scale.',
    },
    {
      name: 'appearance',
      type: "'contained' | 'outline'",
      default: "'contained'",
      description: 'Visual emphasis: solid fill or 1px border.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description: 'Pill height: 32px or 40px.',
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
      title: 'Sizes',
      code: [
        '<Chip size="sm" label="Small" />',
        '<Chip size="md" label="Medium" />',
      ].join('\n'),
    },
  ],
  dos: [
    'Match the `variant` to the meaning (e.g. `success` for healthy states, `error` for failures)',
    'Use `appearance="outline"` for filter chips and lower-emphasis tags',
    'Use `onDelete` for removable selections so the affordance is consistent',
    'Keep labels short — one or two words',
  ],
  donts: [
    "Don't use a Chip as a primary action — use `Button` instead",
    "Don't rely on colour alone to communicate status — the label must carry the meaning",
    "Don't mix sizes within one group of chips",
    "Don't hardcode background or border colours — the variant covers both colour schemes",
  ],
  relatedComponents: ['Button', 'IconButton'],
  accessibility: [
    'Clickable chips are focusable and render a 3px focus-visible ring',
    'The delete affordance is keyboard-accessible via Backspace/Delete when the chip has focus',
  ],
};
