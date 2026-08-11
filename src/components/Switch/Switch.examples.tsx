import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Switch`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Switch',
  category: 'Inputs',
  tagline:
    'On/off control with an optional clickable label and a disabled state, for settings that take effect immediately.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3650-26506',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description:
        'Visible label beside the control. When omitted, provide an `aria-label` instead.',
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
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the control and applies disabled styling.',
    },
    {
      name: 'size',
      type: "'medium' | 'small'",
      default: "'medium'",
      description:
        "Control size. Inherited from MUI as-is — the design system maps colour, not geometry.",
    },
  ],
  examples: [
    {
      title: 'Labelled switch',
      code: '<Switch label="Enable notifications" defaultChecked />',
    },
    {
      title: 'Controlled, no visible label',
      code: [
        '<Switch',
        '  aria-label="Enable notifications"',
        '  checked={enabled}',
        '  onChange={handleToggle}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Disabled states',
      code: [
        '<Switch label="Unavailable" disabled />',
        '<Switch label="Locked on" disabled defaultChecked />',
      ].join('\n'),
    },
  ],
  dos: [
    'Use the `label` prop so the text is part of the click target',
    'Provide an `aria-label` whenever there is no visible label',
    'Use a Switch for settings that take effect immediately, with no separate save step',
    'Use checkboxes instead for a form field the user submits later',
  ],
  donts: [
    "Don't use a Switch inside a form that requires an explicit submit — use a Checkbox",
    "Don't rewrap the control in your own `FormControlLabel` — the `label` prop handles it",
    "Don't override the track or thumb colour — they are part of the selector identity",
  ],
  relatedComponents: ['Checkbox', 'Radio'],
  accessibility: [
    'The label is wired to the input via `FormControlLabel`, so clicking it toggles the control',
    'Keyboard accessible: focusable with Tab, toggled with Space',
    'Exposed to assistive tech with `role="switch"`, so its state reads as "on"/"off" rather than "checked"/"unchecked"',
    '`aria-label` is required when no visible label is rendered',
  ],
};
