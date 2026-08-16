import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Checkbox`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Checkbox',
  category: 'Inputs',
  tagline:
    'Selection control in two sizes, with an optional clickable label, checked, indeterminate, and disabled states.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3205-121943',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description: 'Visible label beside the control.',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description:
        'Control size — `md` is a 16px box, `sm` is 12px. The same ramp `Radio` takes, and both sit in the same 32px target, so a form mixing the two controls still lines up.',
    },
    {
      name: 'checked',
      type: 'boolean',
      default: '—',
      description: 'Controlled checked state. Inherited from MUI.',
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      default: 'false',
      description: 'Initial state for uncontrolled usage.',
    },
    {
      name: 'onChange',
      type: '(event, checked) => void',
      default: '—',
      description: 'Fires when the user toggles the control.',
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: 'false',
      description:
        'Mixed state for parent checkboxes over partially-selected groups. Visual only — set `checked` separately.',
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
      title: 'Labelled checkbox',
      code: '<Checkbox label="Remember me" defaultChecked />',
    },
    {
      title: 'Controlled, no visible label',
      code: [
        '<Checkbox',
        '  aria-label="Select row"',
        '  checked={isSelected}',
        '  onChange={handleToggle}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Parent with partially-selected children',
      code: [
        '<Checkbox',
        '  label="Select all"',
        '  checked={allSelected}',
        '  indeterminate={someSelected && !allSelected}',
        '  onChange={handleSelectAll}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'The smaller control',
      description:
        'Same box, 12px instead of 16 — for a dense row where a full-size control would crowd the text beside it.',
      code: '<Checkbox size="sm" label="Include archived" defaultChecked />',
    },
    {
      title: 'Disabled states',
      code: [
        '<Checkbox label="Unavailable" disabled />',
        '<Checkbox label="Locked on" disabled defaultChecked />',
      ].join('\n'),
    },
  ],
  dos: [
    'Use the `label` prop so the text is part of the click target',
    'Use `indeterminate` on a parent checkbox over a partially-selected group',
    'Use checkboxes for independent options — any number can be selected',
    'Keep one `size` across a form, and match it to any `Radio` beside it',
  ],
  donts: [
    "Don't use a Checkbox for mutually exclusive options — that's a radio group",
    "Don't use a Checkbox to trigger an immediate action — use a Switch or Button",
    "Don't rewrap the control in your own `FormControlLabel` — the `label` prop handles it",
    "Don't override the checked colour — it is part of the selector identity",
  ],
  relatedComponents: ['TextField', 'Button'],
};
