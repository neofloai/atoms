import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Select`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Select',
  category: 'Inputs',
  tagline:
    'Dropdown field with the same static label and validation statuses as TextField, built on MUI Select.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3179-107344',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description:
        'Static label rendered above the field. Inherited from MUI.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'Options, as MUI `MenuItem` elements.',
    },
    {
      name: 'value / defaultValue',
      type: 'unknown',
      default: '—',
      description: 'Controlled or uncontrolled selected value.',
    },
    {
      name: 'status',
      type: "'error' | 'success' | 'warning'",
      default: '—',
      description:
        'Validation status. Colours the border and helper text. Omit for the neutral state.',
    },
    {
      name: 'helperText',
      type: 'ReactNode',
      default: '—',
      description:
        'Supporting text below the field. Coloured by `status` when one is set.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Allows selecting more than one option. Inherited from MUI.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the field and applies disabled styling.',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description: 'Stretches the field to the width of its container.',
    },
  ],
  examples: [
    {
      title: 'Basic select',
      code: [
        "import { MenuItem } from '@mui/material';",
        "import { Select } from '@neofloai/atoms';",
        '',
        '<Select label="Country" defaultValue="us">',
        '  <MenuItem value="us">United States</MenuItem>',
        '  <MenuItem value="ca">Canada</MenuItem>',
        '  <MenuItem value="mx">Mexico</MenuItem>',
        '</Select>',
      ].join('\n'),
    },
    {
      title: 'With helper text',
      code: [
        '<Select label="Role" defaultValue="editor" helperText="Controls workspace permissions">',
        '  <MenuItem value="admin">Admin</MenuItem>',
        '  <MenuItem value="editor">Editor</MenuItem>',
        '  <MenuItem value="viewer">Viewer</MenuItem>',
        '</Select>',
      ].join('\n'),
    },
    {
      title: 'Validation error',
      code: [
        '<Select label="Plan" status="error" helperText="Choose a plan to continue">',
        '  <MenuItem value="pro">Pro</MenuItem>',
        '  <MenuItem value="team">Team</MenuItem>',
        '</Select>',
      ].join('\n'),
    },
    {
      title: 'Disabled',
      code: '<Select label="Region" defaultValue="us-east" disabled><MenuItem value="us-east">US East</MenuItem></Select>',
    },
  ],
  dos: [
    'Always provide a `label`',
    'Pair every `status` with a `helperText` explaining what to fix or confirm',
    'Use MUI `MenuItem` for options so keyboard navigation works out of the box',
  ],
  donts: [
    "Don't rely on border colour alone to communicate validation — set `helperText` too",
    "Don't override the 1px border or 8px radius — they are part of the field identity",
  ],
  relatedComponents: ['TextField'],
};
