import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Radio`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Radio',
  category: 'Inputs',
  tagline:
    'Single-selection control for mutually exclusive options, with an optional clickable label and a RadioGroup wrapper.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=2080-23677',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description:
        'Visible label beside the control. When omitted, provide an `aria-label` instead.',
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
  ],
  donts: [
    "Don't use a Radio for independent options — that's a Checkbox",
    "Don't use radios for long option lists — use a Select instead",
    "Don't leave a radio group with no selected default unless 'none' is meaningful",
    "Don't override the selected colour — it is part of the selector identity",
  ],
  relatedComponents: ['Checkbox', 'TextField'],
  accessibility: [
    'The label is wired to the input via `FormControlLabel`, so clicking it selects the control',
    'Within a `RadioGroup`, Arrow keys move selection and Tab moves focus out of the group',
    '`aria-label` is required when no visible label is rendered',
  ],
};
