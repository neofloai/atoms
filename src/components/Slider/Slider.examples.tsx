import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Slider`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Figma file has a `slider` component set, but its
 * node id could not be resolved through the MCP, so there is no
 * node-specific link to point at yet. See DESIGNER_QUESTIONS.md #33.
 */
export const data: ComponentExamplesData = {
  name: 'Slider',
  category: 'Inputs',
  tagline:
    'Horizontal control for picking a number, or a range, from a continuous or stepped scale.',
  props: [
    {
      name: 'size',
      type: "'sm' | 'md'",
      default: "'md'",
      description:
        'Bar thickness and thumb size — `md` is a 4px bar with a 20px thumb, `sm` a 2px bar with a 12px thumb.',
    },
    {
      name: 'value',
      type: 'number | number[]',
      default: '—',
      description:
        'Controlled value. An array of two numbers renders a range slider with a thumb per entry.',
    },
    {
      name: 'defaultValue',
      type: 'number | number[]',
      default: '0',
      description: 'Initial value for uncontrolled usage.',
    },
    {
      name: 'onChange',
      type: '(event, value, activeThumb) => void',
      default: '—',
      description: 'Fires on every movement while dragging.',
    },
    {
      name: 'onChangeCommitted',
      type: '(event, value) => void',
      default: '—',
      description:
        'Fires once the user lets go. Use this to save, not `onChange`.',
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: 'Lowest selectable value.',
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: 'Highest selectable value.',
    },
    {
      name: 'step',
      type: 'number | null',
      default: '1',
      description:
        'Granularity of the scale. `null` restricts the value to the `marks` you supply.',
    },
    {
      name: 'marks',
      type: 'boolean | { value, label? }[]',
      default: 'false',
      description:
        '`true` draws a tick at every step; an array draws ticks — and optional labels — only where you say.',
    },
    {
      name: 'valueLabelDisplay',
      type: "'off' | 'auto' | 'on'",
      default: "'off'",
      description:
        'When the value bubble appears. `auto` shows it while hovering, dragging, or focused.',
    },
    {
      name: 'track',
      type: "'normal' | 'inverted' | false",
      default: "'normal'",
      description:
        'Which side of the thumb is filled. `false` fills neither, for a slider that reads as a pointer rather than an amount.',
    },
    {
      name: 'disableSwap',
      type: 'boolean',
      default: 'false',
      description:
        'On a range slider, stops one thumb being dragged past the other.',
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
      title: 'Single value',
      description: 'A range, a value, and an `onChange`.',
      code: '<Slider aria-label="Volume" defaultValue={40} />',
    },
    {
      title: 'Stepped, with labelled ticks',
      code: [
        '<Slider',
        '  aria-label="Team size"',
        '  defaultValue={25}',
        '  step={25}',
        '  marks={[',
        "    { value: 0, label: '0' },",
        "    { value: 50, label: '50' },",
        "    { value: 100, label: '100' },",
        '  ]}',
        '  valueLabelDisplay="auto"',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Range',
      description:
        'An array value gives one thumb per entry. `getAriaLabel` names them individually.',
      code: [
        '<Slider',
        "  getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}",
        '  value={priceRange}',
        '  onChange={handlePriceChange}',
        '  valueLabelDisplay="auto"',
        '  disableSwap',
        '/>',
      ].join('\n'),
    },
    {
      title: 'Small',
      code: '<Slider size="sm" aria-label="Opacity" defaultValue={70} />',
    },
    {
      title: 'Saving on release',
      description:
        '`onChange` fires on every pixel of movement; `onChangeCommitted` fires once.',
      code: [
        '<Slider',
        '  aria-label="Budget"',
        '  value={budget}',
        '  onChange={(event, value) => setBudget(value as number)}',
        '  onChangeCommitted={(event, value) => saveBudget(value as number)}',
        '/>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `getAriaLabel` on a range slider so each thumb is named separately',
    'Save on `onChangeCommitted`, and treat `onChange` as a preview — it fires on every movement',
    'Show the chosen value somewhere: `valueLabelDisplay="auto"`, `marks` with labels, or your own readout',
    'Use a TextField instead when the exact number matters more than the relative amount',
  ],
  donts: [
    "Don't reach for a vertical slider — this component is horizontal only, by design",
    "Don't use a slider for a value the user has to hit precisely, like a price to the cent",
    "Don't leave the value invisible — a bare bar gives no feedback about what was picked",
    "Don't put a slider in a narrow column; the thumb needs room to be draggable",
    "Don't override the rail or track colour — they carry the filled/unfilled distinction",
  ],
  relatedComponents: ['Switch', 'TextField'],
};
