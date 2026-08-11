import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Radio`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Radio',
  category: 'Inputs',
  tagline:
    'Single-selection control for mutually exclusive options, with an optional clickable label, two sizes, and a RadioGroup wrapper.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3653-28080',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description:
        'Visible label beside the control. When omitted, provide an `aria-label` instead.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description:
        'Circle size: `md` is the 16px circle, `sm` the 12px one. Set it on every radio in a group — `RadioGroup` has no size axis to inherit from.',
    },
    {
      name: 'value',
      type: 'unknown',
      default: '—',
      description:
        'Value reported to the surrounding `RadioGroup` when this radio is selected.',
    },
    {
      name: 'checked',
      type: 'boolean',
      default: '—',
      description:
        'Controlled checked state. Usually managed by the surrounding `RadioGroup` instead.',
    },
    {
      name: 'onChange',
      type: '(event, checked) => void',
      default: '—',
      description:
        'Fires when the user selects the control. Usually handled on the `RadioGroup`.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the control and applies disabled styling.',
    },
  ],
  examples: [
    {
      title: 'Radio group',
      code: [
        '<RadioGroup value={plan} onChange={handlePlanChange}>',
        '  <Radio value="starter" label="Starter" />',
        '  <Radio value="pro" label="Pro" />',
        '  <Radio value="enterprise" label="Enterprise" />',
        '</RadioGroup>',
      ].join('\n'),
    },
    {
      title: 'Horizontal group',
      code: [
        '<RadioGroup row value={size} onChange={handleSizeChange}>',
        '  <Radio value="sm" label="Small" />',
        '  <Radio value="md" label="Medium" />',
        '  <Radio value="lg" label="Large" />',
        '</RadioGroup>',
      ].join('\n'),
    },
    {
      title: 'Small radios in a group',
      code: [
        '<RadioGroup value={density} onChange={handleDensityChange}>',
        '  <Radio size="sm" value="compact" label="Compact" />',
        '  <Radio size="sm" value="cosy" label="Cosy" />',
        '</RadioGroup>',
      ].join('\n'),
    },
    {
      title: 'Disabled options',
      code: [
        '<RadioGroup value={tier} onChange={handleTierChange}>',
        '  <Radio value="free" label="Free" />',
        '  <Radio value="paid" label="Paid" disabled />',
        '</RadioGroup>',
      ].join('\n'),
    },
    {
      title: 'Standalone, no visible label',
      code: [
        '<Radio',
        '  value="row-1"',
        '  aria-label="Select row"',
        '  checked={isSelected}',
        '  onChange={handleSelect}',
        '/>',
      ].join('\n'),
    },
  ],
  dos: [
    'Wrap radios in a `RadioGroup` so selection and keyboard navigation work',
    'Use the `label` prop so the text is part of the click target',
    'Provide an `aria-label` whenever there is no visible label',
    'Use radios for 2–5 mutually exclusive options that should all be visible',
    'Give every radio in a group the same `size` — the group does not set it for them',
  ],
  donts: [
    "Don't use a Radio for independent options — that's a Checkbox",
    "Don't use radios for long option lists — use a Select instead",
    "Don't leave a radio group with no selected default unless 'none' is meaningful",
    "Don't override the selected colour — it is part of the selector identity",
    "Don't rely on the border alone to show what is selected — hover draws the same border, so the dot is the only unambiguous signal",
  ],
  relatedComponents: ['Checkbox', 'Select', 'TextField'],
  accessibility: [
    'The label is wired to the input via `FormControlLabel`, so clicking it selects the control',
    'Within a `RadioGroup`, Arrow keys move selection and Tab moves focus out of the group',
    'The pointer target is 34px at `md` and 30px at `sm` — both above the 24px WCAG 2.5.8 minimum, though neither reaches the 44px enhanced target',
    'Focus-visible draws a 3px ring around the circle. The Figma set specifies no focus state, so this is the same ring `Button` and `IconButton` use',
    'Selected and hovered radios share the same border colour, so selection is carried by the dot alone — do not remove it or rely on the ring to convey state',
    '`aria-label` is required when no visible label is rendered',
  ],
};
