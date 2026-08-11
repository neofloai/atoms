import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Checkbox`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Checkbox',
  category: 'Inputs',
  tagline:
    'Selection control with an optional clickable label, two sizes, and checked, indeterminate, and disabled states.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3205-121943',
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
        'Box size: `md` is the 16px box, `sm` the 12px one. The pointer target does not shrink with it — MUI keeps its 9px padding either way.',
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
        'Mixed state for parent checkboxes over partially-selected groups. Draws a dash on the same filled box as `checked` — visual only, so set `checked` separately.',
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
      title: 'Both sizes',
      code: [
        '<Checkbox label="Default" defaultChecked />',
        '<Checkbox label="Small" size="sm" defaultChecked />',
      ].join('\n'),
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
      title: 'Disabled states',
      code: [
        '<Checkbox label="Unavailable" disabled />',
        '<Checkbox label="Locked on" disabled defaultChecked />',
      ].join('\n'),
    },
  ],
  dos: [
    'Use the `label` prop so the text is part of the click target',
    'Provide an `aria-label` whenever there is no visible label',
    'Use `indeterminate` on a parent checkbox over a partially-selected group',
    'Use checkboxes for independent options — any number can be selected',
    'Keep one size within a single form; `sm` is for dense tables and toolbars',
  ],
  donts: [
    "Don't use a Checkbox for mutually exclusive options — that's a radio group",
    "Don't use a Checkbox to trigger an immediate action — use a Switch or Button",
    "Don't rewrap the control in your own `FormControlLabel` — the `label` prop handles it",
    "Don't override the checked colour — it is part of the selector identity",
    "Don't reach for `sm` to fit a tight layout — the 12px box keeps the same 30px pointer target, so it saves less room than it looks",
  ],
  relatedComponents: ['Radio', 'TextField', 'Button'],
  accessibility: [
    'The label is wired to the input via `FormControlLabel`, so clicking it toggles the control',
    'Keyboard accessible: focusable with Tab, toggled with Space',
    'The pointer target is 34px at `md` and 30px at `sm` — both above the 24px WCAG 2.5.8 minimum, though neither reaches the 44px enhanced target, so give a bare checkbox room in dense rows',
    'Focus-visible draws a 3px ring around the box. The Figma set specifies no focus state, so this is the same ring `Button` and `IconButton` use',
    '`aria-label` is required when no visible label is rendered',
    'A disabled unchecked box renders as a plain grey square with no mark, which reads as filled rather than empty — prefer hiding unavailable options over disabling them',
  ],
};
