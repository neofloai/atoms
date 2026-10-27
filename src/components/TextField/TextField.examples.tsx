import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `TextField`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'TextField',
  category: 'Inputs',
  tagline:
    'Text input with a static label, two heights, validation statuses, helper text, single or multi-line entry, and a password variant.',
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
        'Validation status. Tints the field and colours its border, helper text and adornment glyphs; the label stays neutral. Omit for the neutral state.',
    },
    {
      name: 'size',
      type: "'md' | 'lg'",
      default: "'md'",
      description:
        'Field height: 36px or 40px. Label, helper text and input type are the same at both — only the field box grows. Use `lg` where a field stands alone or leads a page (a search bar, a sign-in form); `md` in dense forms and filter rows.',
    },
    {
      name: 'helperText',
      type: 'ReactNode',
      default: '—',
      description:
        'Supporting text below the field. Coloured by `status` when one is set. Accepts a node, so a leading icon can sit before the text — it is sized to 14px.',
    },
    {
      name: 'startAdornment',
      type: 'ReactNode',
      default: '—',
      description:
        'Element rendered at the start of the input, e.g. a search icon. Wrap decorative icons in `InputAdornment` for the correct colour/spacing; interactive controls like `IconButton` can be passed directly.',
    },
    {
      name: 'endAdornment',
      type: 'ReactNode',
      default: '—',
      description:
        'Element rendered at the end of the input, e.g. a clear `IconButton` or a unit. With `type="password"` it renders before the show / hide toggle.',
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
      name: 'type',
      type: 'string',
      default: "'text'",
      description:
        'The input type, as on any input. `"password"` is the password variant: a show / hide toggle at the end of the field, and the `requirements` and `forgotPassword` rows below when asked for. `autoComplete` then defaults to `new-password` with requirements and `current-password` without.',
    },
    {
      name: 'requirements',
      type: '{ label: ReactNode; met: boolean }[]',
      default: '—',
      description:
        '`type="password"` only. The rules a new password has to meet, listed under the field: a cross until each is met, a green tick after. The field does not test the value — work out `met` from it yourself, so the rules stay yours to define. Pass it when the field creates a password; leave it out when it signs someone in.',
    },
    {
      name: 'forgotPassword',
      type: 'ReactNode',
      default: '—',
      description:
        '`type="password"` only. Shown right-aligned under the field. Pass a `Link` with `color="secondary"`; it takes the row’s type.',
    },
    {
      name: 'visible / defaultVisible / onVisibleChange',
      type: 'boolean / boolean / (visible: boolean) => void',
      default: '— / false / —',
      description:
        '`type="password"` only. Whether the password shows as text, controlled or uncontrolled. The toggle shows the eye while it is hidden and the slashed eye while it shows.',
    },
    {
      name: 'showPasswordLabel / hidePasswordLabel',
      type: 'string',
      default: "'Show password' / 'Hide password'",
      description: '`type="password"` only. The toggle’s label in each state.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'Renders the field’s skeleton in its place while its value loads: a bar for the label, the field and the helper text, each only when the loaded field has that row. The field bar is the loaded field’s height, so nothing moves when the value arrives.',
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
      title: 'Large field',
      description:
        'The 40px field, for a search bar or a sign-in form where the field stands on its own.',
      code: '<TextField size="lg" label="Work email" placeholder="you@neoflo.ai" />',
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
        'Wrap non-interactive icons in `InputAdornment` so they pick up the correct colour and spacing. It is exported from Atoms — there is no reason to reach into `@mui/material` for it.',
      code: [
        "import { InputAdornment, TextField } from '@neofloai/atoms';",
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
    {
      title: 'Password: signing in',
      description:
        'The toggle comes with the type. Add `forgotPassword` for the way back, right-aligned under the field.',
      code: [
        "import { Link, TextField } from '@neofloai/atoms';",
        '',
        '<TextField',
        '  type="password"',
        '  label="Password"',
        '  required',
        '  forgotPassword={',
        '    <Link color="secondary" underline="hover" href="/reset-password">',
        '      Forgot password?',
        '    </Link>',
        '  }',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Password: creating one',
      description:
        'Each rule is crossed until the value meets it and ticked after, so the reader sees what is left rather than being told after they submit.',
      code: [
        "const [value, setValue] = React.useState('');",
        '',
        '<TextField',
        '  type="password"',
        '  label="New password"',
        '  required',
        '  maxLength={100}',
        '  value={value}',
        '  onChange={(event) => setValue(event.target.value)}',
        '  requirements={[',
        "    { label: 'Minimum 8 letters', met: value.length >= 8 },",
        "    { label: 'At least one number', met: /\\d/.test(value) },",
        "    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(value) },",
        '  ]}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'While the value loads',
      description:
        'The skeleton keeps the loaded field’s rows and height, so the form does not shift when the data arrives.',
      code: [
        '<TextField',
        '  label="Company name"',
        '  helperText="As registered"',
        '  value={company?.name ?? \'\'}',
        '  loading={!company}',
        '/>',
      ].join('\n'),
    },
  ],
  dos: [
    'Always provide a `label`',
    'Pair every `status` with a `helperText` explaining what to fix or confirm',
    'Use `minRows`/`maxRows` for free-form text so the field grows with content',
    'Keep helper text to one short sentence',
    'List the rules with `requirements` when a password is being created, so each one is visible before it is broken',
    'Offer `forgotPassword` wherever someone signs in',
  ],
  donts: [
    "Don't use placeholder text as a substitute for a label",
    "Don't rely on border colour alone to communicate validation — set `helperText` too",
    "Don't override the 1px border or 4px radius — they are part of the field identity",
    "Don't mix `md` and `lg` fields in one form row — pick one height per form",
    "Don't use `rows` for inputs that commonly exceed the visible area unless scrolling is intended",
    "Don't add your own show / hide button to a password field — `type=\"password\"` brings one, with its labels and `autoComplete`",
    "Don't show `requirements` on a sign-in field — the rules are for choosing a password, not for typing one",
    "Don't set `status=\"error\"` for a password rule that is not met yet — the checklist already says so; keep the status for a password that was rejected",
  ],
  relatedComponents: ['Select', 'IconButton', 'Link'],
};
