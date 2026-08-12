import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the stepper family. Read by `scripts/generate.ts`
 * and served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers all six parts in one flat list, `Stepper` first,
 * and prefixes each row with the component that owns it.
 */
export const data: ComponentExamplesData = {
  name: 'Stepper',
  category: 'Navigation',
  tagline:
    'A run of steps down the page with a line threading them together. An 8px dot per step, coloured while the run is done and grey once it is not, and a tapered pin to end it.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3663-39805&m=dev',
  props: [
    {
      name: 'Stepper activeStep',
      type: 'number',
      default: '0',
      description:
        'Zero-based index of the step in progress. Everything before it is drawn as done, the step itself is drawn as done, and everything after it is not. Pass `-1` to drive the states per step instead, which is what a timeline wants.',
    },
    {
      name: 'Stepper orientation',
      type: "'vertical' | 'horizontal'",
      default: "'vertical'",
      description:
        'Which way the steps run. This is the one MUI default the family moves — MUI ships `horizontal`, and every cell in Figma is vertical. Horizontal still works and reads from the same tokens, but it is the vertical set turned on its side rather than a specified treatment.',
    },
    {
      name: 'Stepper nonLinear',
      type: 'boolean',
      default: 'false',
      description:
        'Stops the stepper deriving each step’s state from `activeStep`, so steps can be entered in any order and you set `completed` on each one yourself. MUI’s prop, unchanged.',
    },
    {
      name: 'Stepper connector',
      type: 'ReactElement | null',
      default: '<StepConnector />',
      description:
        'The line between two steps. Already the house one, so this is only worth passing to restyle it or to remove it — `connector={null}` drops the line and leaves the dots.',
    },
    {
      name: 'Step expanded',
      type: 'boolean',
      default: 'false',
      description:
        'Keeps this step’s `StepContent` mounted and open whether or not the step is active. This is the switch between the two shapes the component has: a wizard shows one description at a time, the timeline Figma draws shows them all.',
    },
    {
      name: 'Step completed',
      type: 'boolean',
      default: '—',
      description:
        'Marks the step done, colouring its dot and the line into it. Set it per step when the order is not an index; otherwise it falls out of `activeStep`.',
    },
    {
      name: 'Step last',
      type: 'boolean',
      default: '—',
      description:
        'Draws the step as the end of the run: the dot becomes a tapered pin and no line continues past it. Injected by `Stepper` on its final child, so it is rarely passed by hand.',
    },
    {
      name: 'StepLabel children',
      type: 'ReactNode',
      default: '—',
      description:
        'The header, at 13/20 Medium. Its ink does not change with state — all ten Figma cells draw it the same — so a step that has not been reached still reads at full strength.',
    },
    {
      name: 'StepLabel optional',
      type: 'ReactNode',
      default: '—',
      description:
        'A caption under the header, in the description’s 12/16 type. Unlike `StepContent` it is always visible, which suits a short aside like "Skipped" that should not wait for the step to become active.',
    },
    {
      name: 'StepLabel icon',
      type: 'ReactNode',
      default: 'index + 1',
      description:
        'Replaces what sits in the 12px indicator column. A number is ignored — this design has no numbered steps — but a node is rendered in the column at its own size, which is how a step gets a bespoke marker.',
    },
    {
      name: 'StepLabel error',
      type: 'boolean',
      default: 'false',
      description:
        'Marks the step as failed: the dot takes the house error fill and the header its caption ink. Not drawn in Figma — derived from the error ladder the same way `Button`’s error role is.',
    },
    {
      name: 'StepContent children',
      type: 'ReactNode',
      default: '—',
      description:
        'The region beside the line: a description, and any buttons under it. Stack what goes in with `Stack spacing={2}` for the design’s 16px rhythm. Hidden until the step is active unless the `Step` carries `expanded`.',
    },
    {
      name: 'StepCollapse expanded',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the steps this row controls are showing. Controlled — hold it in state and flip it from `onChange`.',
    },
    {
      name: 'StepCollapse count',
      type: 'number',
      default: '—',
      description:
        'How many steps are hidden while collapsed, which the default label counts: `count={3}` reads "+ 3 more events". Left out, it reads "Show more events".',
    },
    {
      name: 'StepCollapse onChange',
      type: '(event: MouseEvent, expanded: boolean) => void',
      default: '—',
      description:
        'Fired when the row is activated, with the state it is moving to as the second argument — the same controlled pair `Accordion` uses.',
    },
  ],
  examples: [
    {
      title: 'A wizard',
      description:
        'The default shape. `activeStep` drives every state, and only the active step shows its content.',
      code: `const [step, setStep] = React.useState(0);

<Stepper activeStep={step}>
  <Step>
    <StepLabel>Campaign settings</StepLabel>
    <StepContent>
      <Stack spacing={2}>
        <span>Name the campaign and set a daily budget.</span>
        <Stack direction="row" spacing={1}>
          <Button size="sm" onClick={() => setStep(1)}>Continue</Button>
        </Stack>
      </Stack>
    </StepContent>
  </Step>
  <Step>
    <StepLabel>Ad group</StepLabel>
    <StepContent>
      <Stack spacing={2}>
        <span>Choose who sees the ads in this campaign.</span>
        <Stack direction="row" spacing={1}>
          <Button size="sm" onClick={() => setStep(2)}>Continue</Button>
          <Button size="sm" variant="secondary" onClick={() => setStep(0)}>
            Back
          </Button>
        </Stack>
      </Stack>
    </StepContent>
  </Step>
  <Step>
    <StepLabel>Review</StepLabel>
  </Step>
</Stepper>`,
    },
    {
      title: 'A timeline',
      description:
        'Figma’s sample composition. `activeStep={-1}` hands the states over, `expanded` keeps every description open, and the final step draws the pin.',
      code: `<Stepper activeStep={-1}>
  {events.map((event) => (
    <Step key={event.id} expanded completed={event.done}>
      <StepLabel>{event.title}</StepLabel>
      <StepContent>{event.detail}</StepContent>
    </Step>
  ))}
</Stepper>`,
    },
    {
      title: 'A header on its own',
      description:
        'Figma’s `title` cell — no `StepContent`, so the step is the 20px header plus the 16px of line under it.',
      code: `<Stepper activeStep={-1}>
  <Step completed>
    <StepLabel>Invoice issued</StepLabel>
  </Step>
  <Step completed>
    <StepLabel>Payment received</StepLabel>
  </Step>
  <Step>
    <StepLabel>Receipt sent</StepLabel>
  </Step>
</Stepper>`,
    },
    {
      title: 'Folding the middle of a run',
      description:
        'The `collapse` cell. `StepCollapse` goes inside a `Step` in place of a `StepLabel`, so the lines above and below come from the connectors either side of it.',
      code: `const [open, setOpen] = React.useState(false);

<Stepper activeStep={-1}>
  <Step expanded completed>
    <StepLabel>Campaign created</StepLabel>
    <StepContent>Budget capped at 200 a day.</StepContent>
  </Step>
  <Step>
    <StepCollapse
      expanded={open}
      count={3}
      onChange={(_, next) => setOpen(next)}
    />
  </Step>
  {open &&
    hidden.map((event) => (
      <Step key={event.id} expanded completed>
        <StepLabel>{event.title}</StepLabel>
      </Step>
    ))}
  <Step>
    <StepLabel optional="Waiting on review">Publish</StepLabel>
  </Step>
</Stepper>`,
    },
    {
      title: 'A step that failed',
      description:
        'The one state Figma does not draw. The dot takes the error fill and the header its caption ink; the line is unaffected.',
      code: `<Stepper activeStep={1}>
  <Step completed>
    <StepLabel>Payment authorised</StepLabel>
  </Step>
  <Step>
    <StepLabel error optional="Card declined">
      Payment captured
    </StepLabel>
  </Step>
  <Step>
    <StepLabel>Receipt sent</StepLabel>
  </Step>
</Stepper>`,
    },
    {
      title: 'Dots with no line',
      description:
        'Dropping the connector leaves the markers and the 28px margin, which suits a dense list where the rule is more ink than the rows can carry.',
      code: `<Stepper activeStep={-1} connector={null}>
  {regions.map((region) => (
    <Step key={region.id} completed={region.live}>
      <StepLabel>{region.name}</StepLabel>
    </Step>
  ))}
</Stepper>`,
    },
  ],
  dos: [
    'Add `expanded` to every `Step` when you want a timeline — without it only the active step shows its `StepContent`',
    'Set `activeStep={-1}` and `completed` per step when the order is not an index, so nothing is inferred from position',
    'Put the description and any buttons in `StepContent` and stack them with `Stack spacing={2}` for the design’s 16px rhythm',
    'Let the last step be last — `Stepper` marks it, and the pin plus the missing line is how a run reads as finished',
    'Use `StepLabel optional` for a caption that should show whichever step is active, and `StepContent` for one that should not',
  ],
  donts: [
    'Don’t number the steps — passing `StepLabel icon={3}` is ignored, and the design carries progress in the dot and the line instead',
    'Don’t reach for `orientation="horizontal"` to save vertical space; it is derived rather than drawn, so prefer a vertical run in a narrower column',
    'Don’t wrap the header in a `Typography` — `StepLabel` already sets the 13/20 Medium type, and a nested variant will fight it',
    'Don’t set `completed` on every step to make the line coloured throughout; a run where nothing is outstanding reads as finished, not as in progress',
    'Don’t put a `StepCollapse` in the same `Step` as a `StepLabel` — it replaces the header row rather than sitting beside it',
  ],
  relatedComponents: ['Accordion', 'Collapse', 'Divider', 'Tabs'],
};
