import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the accordion family. Read by `scripts/generate.ts`
 * and served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers all four parts. Props belonging to a part other
 * than `Accordion` are prefixed with the component that owns them, since
 * the table is one flat list.
 */
export const data: ComponentExamplesData = {
  name: 'Accordion',
  category: 'Layout',
  tagline:
    'A row that opens to reveal more: an FAQ, a settings section, a filter group. One title always visible, one body that is not.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3653-30452&m=dev',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'An `AccordionSummary` first, then whatever the item reveals. The order is load-bearing: MUI takes the first child as the header and wraps everything after it in the collapsing region.',
    },
    {
      name: 'expanded',
      type: 'boolean',
      default: '—',
      description:
        'Whether the item is open. Setting it makes the accordion controlled, which is what you want as soon as opening one item should close another. Leave it off and the item keeps its own state.',
    },
    {
      name: 'defaultExpanded',
      type: 'boolean',
      default: 'false',
      description:
        'Starts the item open without making it controlled. Good for the first row of an FAQ, so the page does not open as a wall of closed titles.',
    },
    {
      name: 'onChange',
      type: '(event, expanded: boolean) => void',
      default: '—',
      description:
        'Fired on every toggle, with the state being moved *to*. The second argument is what you store — do not read the current state back out of your own variable inside the handler.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Makes the row inert: it cannot be opened, and it leaves the tab order because the summary renders a real disabled `button`. The ink greys to `text/disabled/default` and the surface is held — MUI’s translucent disabled tint is overridden, since a darker band reads as more active rather than less.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'div'",
      description:
        'Element rendered at the item root, fully type-checked so the swapped element’s own props are accepted. `article` or `section` both read well for a substantial item.',
    },
    {
      name: 'slots / slotProps',
      type: 'AccordionSlots / AccordionSlotProps',
      default: '{}',
      description:
        'MUI’s four slots: `root`, `heading`, `transition`, `region`. `slots={{ heading: "h2" }}` is the one worth knowing — the header is an `h3` by default, and the level should match the page.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      default: '—',
      description:
        'One-off styling. Note what is deliberately absent: no `elevation`, `variant`, `raised`, `square`, or `disableGutters`. The design draws one flat, square, gutterless item, so all five are removed from the type rather than accepted and ignored.',
    },
    {
      name: 'AccordionSummary children',
      type: 'ReactNode',
      default: '—',
      description:
        'The title. Set at 13/20 regular in `text/default/b1`, so a plain string is already correct. It wraps rather than pushing the caret out of the row.',
    },
    {
      name: 'AccordionSummary expandIcon',
      type: 'ReactNode',
      default: '<CaretDownIcon size={16} />',
      description:
        'The indicator at the trailing edge. Defaults to the design’s 16px caret, which MUI rotates 180° when the item opens — that rotation is Phosphor’s `CaretUp` to the pixel, which is the second glyph the sheet draws. Pass `null` to remove it.',
    },
    {
      name: 'AccordionSummary id / aria-controls',
      type: 'string',
      default: '—',
      description:
        'Worth passing together. MUI labels the revealed region from the summary’s `id` and gives the region the summary’s `aria-controls` as its own `id`; with neither set, the region has `role="region"` and no accessible name, so it is not exposed as a landmark.',
    },
    {
      name: 'AccordionDetails children',
      type: 'ReactNode',
      default: '—',
      description:
        'The body. Set at 13/20 regular in `text/default/b2`, so a plain string needs no `Typography` around it; anything nested keeps its own colour.',
    },
    {
      name: 'AccordionActions children',
      type: 'ReactNode',
      default: '—',
      description:
        'Buttons for the item, pushed to the trailing edge with 8px between them. The design’s row is a `secondary` and a `primary` at `size="sm"`.',
    },
    {
      name: 'AccordionActions disableSpacing',
      type: 'boolean',
      default: 'false',
      description:
        'Removes the 8px between children. Rarely wanted — 8px is the `Scale/200` the design specifies — but it is there for a row that does its own spacing.',
    },
  ],
  examples: [
    {
      title: 'One item',
      description:
        'The minimum. Uncontrolled, so the item keeps its own open state.',
      code: [
        '<Accordion>',
        '  <AccordionSummary>Shipping and returns</AccordionSummary>',
        '  <AccordionDetails>',
        '    Orders placed before 2pm ship the same day. Returns are free within 30 days.',
        '  </AccordionDetails>',
        '</Accordion>',
      ].join('\n'),
    },
    {
      title: 'A list of them',
      description:
        'Siblings, no wrapper needed — the design’s `stack` variant is exactly this, with no gap and no shared chrome. Each item keeps its own state, so several can be open at once.',
      code: [
        '<div>',
        '  {faqs.map((faq) => (',
        '    <Accordion key={faq.id}>',
        '      <AccordionSummary>{faq.question}</AccordionSummary>',
        '      <AccordionDetails>{faq.answer}</AccordionDetails>',
        '    </Accordion>',
        '  ))}',
        '</div>',
      ].join('\n'),
    },
    {
      title: 'One open at a time',
      description:
        'Control the group from one piece of state. `false` for "nothing open" keeps the type honest — there is no id that means closed.',
      code: [
        "const [open, setOpen] = React.useState<string | false>('shipping');",
        '',
        '<div>',
        '  {faqs.map((faq) => (',
        '    <Accordion',
        '      key={faq.id}',
        '      expanded={open === faq.id}',
        '      onChange={(_, isExpanded) => setOpen(isExpanded ? faq.id : false)}',
        '    >',
        '      <AccordionSummary>{faq.question}</AccordionSummary>',
        '      <AccordionDetails>{faq.answer}</AccordionDetails>',
        '    </Accordion>',
        '  ))}',
        '</div>',
      ].join('\n'),
    },
    {
      title: 'Open on arrival',
      description:
        'Uncontrolled but starting open. One row of an FAQ open on first paint shows people what the pattern does.',
      code: [
        '<Accordion defaultExpanded>',
        '  <AccordionSummary>What is included</AccordionSummary>',
        '  <AccordionDetails>Everything in the free plan, plus SSO and audit logs.</AccordionDetails>',
        '</Accordion>',
      ].join('\n'),
    },
    {
      title: 'With actions',
      description:
        'The sheet’s `open-button` variant. The buttons sit 16px under the body and 16px from the bottom edge, and 8px apart.',
      code: [
        '<Accordion defaultExpanded>',
        '  <AccordionSummary>Notification preferences</AccordionSummary>',
        '  <AccordionDetails>',
        '    Email digests are sent every Monday at 9am in your local timezone.',
        '  </AccordionDetails>',
        '  <AccordionActions>',
        '    <Button variant="secondary" size="sm">Reset</Button>',
        '    <Button size="sm">Save</Button>',
        '  </AccordionActions>',
        '</Accordion>',
      ].join('\n'),
    },
    {
      title: 'The heading level, and the region’s name',
      description:
        'Two details that only matter for assistive technology, and both are one prop each. The header is an `h3` by default; the revealed region is only announced as a landmark if it has a name.',
      code: [
        '<Accordion slots={{ heading: \'h2\' }}>',
        '  <AccordionSummary id="billing-header" aria-controls="billing-panel">',
        '    Billing',
        '  </AccordionSummary>',
        '  <AccordionDetails>Invoices are issued on the first of the month.</AccordionDetails>',
        '</Accordion>',
      ].join('\n'),
    },
    {
      title: 'A row that says why it is closed',
      description:
        '`disabled` leaves the row visible and inert. Pair it with a reason somewhere the user can read — a disabled row with no explanation is a dead end.',
      code: [
        '<Accordion disabled>',
        '  <AccordionSummary>Team settings</AccordionSummary>',
        '  <AccordionDetails>Available on the Business plan.</AccordionDetails>',
        '</Accordion>',
      ].join('\n'),
    },
    {
      title: 'More than a title in the row',
      description:
        'The summary is a flex row, so a count or a status can ride along with the title. Keep it non-interactive: the whole row is already one button, and a button inside a button is invalid HTML.',
      code: [
        '<Accordion>',
        '  <AccordionSummary>',
        '    <span style={{ flex: 1 }}>Attachments</span>',
        '    <Chip size="sm" variant="secondary" label="3" />',
        '  </AccordionSummary>',
        '  <AccordionDetails>brief.pdf, wireframes.fig, notes.txt</AccordionDetails>',
        '</Accordion>',
      ].join('\n'),
    },
    {
      title: 'Ending a group without a rule',
      description:
        'Every item carries a hairline along its bottom edge, including the last — faithful to the sheet, and right for a list that continues. For a group of three that ends there, drop the last one.',
      code: [
        "<Box sx={{ '& .MuiAccordion-root:last-of-type': { borderBottom: 'none' } }}>",
        '  {faqs.map((faq) => (',
        '    <Accordion key={faq.id}>…</Accordion>',
        '  ))}',
        '</Box>',
      ].join('\n'),
    },
  ],
  dos: [
    'Write the summary as the question or the label someone is scanning for — it is the only part of the item that is always on screen',
    'Control the group when opening one item should close the others, and leave every item uncontrolled when they are independent',
    'Pass `id` and `aria-controls` on the summary, so the revealed body is a named region rather than an anonymous one',
    'Set `slots={{ heading: "h2" }}` (or whichever level fits) when a page has several of these — the default `h3` is a guess about your outline',
    'Open one item by default when the pattern is not obvious from the page, using `defaultExpanded`',
    'Keep the body short enough that opening one item does not push the next one off the screen; a long body wants a page, not a row',
    'Use `AccordionActions` for buttons that act on the item, and `Button size="sm"` inside it — that is the 32px row the design draws',
  ],
  donts: [
    "Don't put an accordion around content people need to compare — two things that have to be read together should not take two clicks and a scroll to see at once",
    "Don't hide anything a first-time user must read to proceed; a collapsed row is a row most people will not open",
    "Don't nest an accordion inside an accordion. Two levels of disclosure is a navigation tree, and it should look like one",
    "Don't put a button, link, or checkbox inside `AccordionSummary` — the summary *is* a button, and nesting one inside it is invalid HTML that assistive technology reports inconsistently. Put the control in the body, or move it out of the item",
    "Don't reach for `sx` to add a radius or a shadow to make an item look like a card. If a card is what is wanted, use `Card`; this component is a list row on purpose",
    "Don't use `expanded` without `onChange` — the item will render open or closed and then refuse to move, which reads as a broken control rather than a locked one",
  ],
  relatedComponents: ['Card', 'Collapse', 'Divider', 'Button', 'MenuItem'],
  accessibility: [
    'The full ARIA disclosure pattern comes for free. MUI renders the summary as a real `<button>` carrying `aria-expanded`, wraps it in a heading element, and gives the revealed body `role="region"` — so Enter and Space both toggle, and the state is announced. Nothing here had to be added',
    'Two attributes are still yours to pass. `id` and `aria-controls` on `AccordionSummary` are what wire the region to its heading (`aria-labelledby` and the panel `id` are derived from them); with neither, the region has no accessible name and is not exposed as a landmark at all',
    'The heading is an `h3` by default, which is a guess. A page whose sections are `h2` should pass `slots={{ heading: "h2" }}` — the element is reset with `all: unset`, so changing the level changes nothing visually',
    'Tab moves between summaries and nothing else — there is no arrow-key navigation, which matches the WAI-ARIA accordion pattern where arrow support is explicitly optional. Every row stays a single tab stop',
    'The whole row is the hit target, not just the caret: 52px tall closed, which clears the 44px of WCAG 2.5.5 Target Size (AAA) with room to spare',
    'Text contrast is comfortable in both schemes: the title measures 12.62:1 in light and 10.96:1 in dark, and the body 5.09:1 and 6.94:1, against the item’s own `surface/layers/card 1`. The caret is the title’s colour, so it clears 1.4.11 at the same 12.62:1 and 10.96:1',
    'The focus ring is the one measured failure, and it is not this component’s alone. The house 3px ring (`border/default/defaultPressed`, `grey/500`) is 2.19:1 against the item in light mode — under the 3:1 WCAG 1.4.11 asks of a focus indicator — while dark mode is fine at 7.83:1. The same token rings `Button`, `IconButton`, `Chip`, `Checkbox`, `Radio`, and `ToggleButton`, so the fix belongs to the system rather than here: `grey/625` would clear both schemes at 3.67:1 and 4.69:1 (DESIGNER_QUESTIONS.md #38)',
    'The ring is drawn *inset* rather than outside the box, because the summary spans the item edge to edge — an outer ring would paint over the next row’s hairline. Same 3px, same token, same behaviour on `:focus-visible` only, so a mouse click never shows it',
    'The hairline between two rows is 1.11:1 in light and 1.05:1 in dark against the surface it sits on — the same `border/layers/card 1` on `surface/layers/card 1` pairing `Card` measured (DESIGNER_QUESTIONS.md #31). WCAG does not set a threshold for a grouping edge, but at those ratios the separation is carried by the 16px rhythm rather than by the line, so do not rely on it to mark where one row ends',
    'A disabled row leaves the tab order entirely (a real `disabled` button), so it can never be focused and then found unresponsive. Its ink measures 2.19:1 and 1.74:1 — below 4.5:1, but 1.4.3 exempts inactive controls, and the alternative is MUI’s 38% fade of the whole row, which is worse on both counts',
    'The theme sets `motion.reducedMotion: "system"`, so under `prefers-reduced-motion: reduce` the height animation, the caret rotation, and the summary’s padding all land instantly instead of tweening. The item still opens; it just stops moving',
  ],
};
