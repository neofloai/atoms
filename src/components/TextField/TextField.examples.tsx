import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `TextField`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'TextField',
  category: 'Inputs',
  tagline:
    'Text input with a static label, validation statuses, helper text, and single or multi-line entry.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3179-106156',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      default: '—',
      description:
        'Static label rendered above the field. Inherited from MUI.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: '—',
      description: 'Placeholder shown when the field is empty.',
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
      name: 'startAdornment',
      type: 'ReactNode',
      default: '—',
      description:
        'Element rendered at the start of the input, e.g. a search icon. Wrap decorative icons in MUI’s `InputAdornment` for the correct colour/spacing; interactive controls like `IconButton` can be passed directly.',
    },
    {
      name: 'endAdornment',
      type: 'ReactNode',
      default: '—',
      description:
        'Element rendered at the end of the input, e.g. a clear `IconButton` or a password visibility toggle.',
    },
    {
      name: 'maxLength',
      type: 'number',
      default: '—',
      description:
        'Shows a live "length/max" counter next to the label and caps native input length. Requires `label`.',
    },
    {
      name: 'multiline',
      type: 'boolean',
      default: 'false',
      description: 'Renders a textarea instead of a single-line input.',
    },
    {
      name: 'rows',
      type: 'number',
      default: '—',
      description:
        'Fixes the textarea height; overflowing content scrolls (Figma inflexible / scroll variants).',
    },
    {
      name: 'minRows / maxRows',
      type: 'number',
      default: '—',
      description:
        'Lets the textarea grow with content between bounds (Figma flexible variant).',
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
      title: 'Labelled field with helper text',
      code: [
        '<TextField',
        '  label="Email"',
        '  placeholder="you@neoflo.ai"',
        '  helperText="Work email preferred"',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Validation error',
      code: [
        '<TextField',
        '  label="Amount"',
        '  status="error"',
        '  helperText="Amount is required"',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Start icon (decorative)',
      description:
        'Wrap non-interactive icons in MUI’s `InputAdornment` so they pick up the correct colour and spacing.',
      code: [
        "import InputAdornment from '@mui/material/InputAdornment';",
        "import { MagnifyingGlassIcon } from '@neofloai/atoms/icons';",
        '',
        '<TextField',
        '  label="Search"',
        '  placeholder="Search anything"',
        '  startAdornment={',
        '    <InputAdornment position="start">',
        '      <MagnifyingGlassIcon size={16} />',
        '    </InputAdornment>',
        '  }',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Clearable field (end icon button)',
      code: [
        "import { XIcon } from '@neofloai/atoms/icons';",
        '',
        '<TextField',
        '  label="Search"',
        '  endAdornment={',
        '    <IconButton appearance="text" size="sm" aria-label="Clear" onClick={handleClear}>',
        '      <XIcon />',
        '    </IconButton>',
        '  }',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Start + end adornments',
      description:
        'Combine a decorative start icon with an interactive end icon, e.g. a password field with a show/hide toggle.',
      code: [
        "import InputAdornment from '@mui/material/InputAdornment';",
        "import { EyeIcon, LockIcon } from '@neofloai/atoms/icons';",
        '',
        '<TextField',
        '  label="Password"',
        '  placeholder="Enter password"',
        '  startAdornment={',
        '    <InputAdornment position="start">',
        '      <LockIcon size={16} />',
        '    </InputAdornment>',
        '  }',
        '  endAdornment={',
        '    <IconButton appearance="text" size="sm" aria-label="Show password" onClick={handleToggleVisibility}>',
        '      <EyeIcon />',
        '    </IconButton>',
        '  }',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Multi-line: grows with content',
      code: '<TextField label="Notes" multiline minRows={3} maxRows={8} />',
    },
    {
      title: 'Multi-line: fixed height, scrolls',
      code: '<TextField label="Description" multiline rows={6} />',
    },
    {
      title: 'Character counter',
      code: '<TextField label="Bio" placeholder="Tell us about yourself" maxLength={100} />',
    },
  ],
  dos: [
    'Always provide a `label`',
    'Pair every `status` with a `helperText` explaining what to fix or confirm',
    'Use `minRows`/`maxRows` for free-form text so the field grows with content',
    'Keep helper text to one short sentence',
  ],
  donts: [
    "Don't use placeholder text as a substitute for a label",
    "Don't rely on border colour alone to communicate validation — set `helperText` too",
    "Don't override the 1px border or 8px radius — they are part of the field identity",
    "Don't use `rows` for inputs that commonly exceed the visible area unless scrolling is intended",
  ],
  relatedComponents: ['Button', 'IconButton'],
};
