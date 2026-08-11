import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Tooltip`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 */
export const data: ComponentExamplesData = {
  name: 'Tooltip',
  category: 'Data Display',
  tagline:
    'Short label or description that appears on hover, focus, or long press, pointing at the element it explains.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3223-54057',
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      default: '—',
      description:
        'The content of the bubble. Required. An empty string, `null`, `undefined`, or `false` renders the child with no tooltip — that is how you disable one conditionally.',
    },
    {
      name: 'children',
      type: 'ReactElement',
      default: '—',
      description:
        'The trigger. A single element that accepts a ref and spreads the event handlers it is given.',
    },
    {
      name: 'arrow',
      type: 'boolean',
      default: 'true',
      description:
        'Draws the tip pointing at the trigger. Defaults on, against MUI, because every variant on the sheet has one.',
    },
    {
      name: 'placement',
      type: "'top' | 'bottom' | 'left' | 'right' | '<side>-start' | '<side>-end'",
      default: "'bottom'",
      description:
        'Preferred side. Popper flips and shifts it automatically when there is no room, so this is a preference rather than a guarantee.',
    },
    {
      name: 'describeChild',
      type: 'boolean',
      default: 'false',
      description:
        'Exposes the title as the trigger\'s description (`aria-describedby`) rather than its label. Use it when the trigger already has visible text.',
    },
    {
      name: 'open',
      type: 'boolean',
      default: '—',
      description:
        'Controls visibility. Pair with `onOpen` / `onClose`; omit for the usual uncontrolled behaviour.',
    },
    {
      name: 'onOpen',
      type: '(event) => void',
      default: '—',
      description: 'Fires when the tooltip asks to open.',
    },
    {
      name: 'onClose',
      type: '(event) => void',
      default: '—',
      description: 'Fires when the tooltip asks to close.',
    },
    {
      name: 'enterDelay',
      type: 'number',
      default: '100',
      description: 'Milliseconds to wait before showing on hover or focus.',
    },
    {
      name: 'leaveDelay',
      type: 'number',
      default: '0',
      description:
        'Milliseconds to wait before hiding. Raise it if users need to move the pointer into the bubble.',
    },
    {
      name: 'enterTouchDelay',
      type: 'number',
      default: '700',
      description: 'How long a touch has to be held before the tooltip opens.',
    },
    {
      name: 'leaveTouchDelay',
      type: 'number',
      default: '1500',
      description: 'How long the tooltip stays up after a touch ends.',
    },
    {
      name: 'followCursor',
      type: 'boolean',
      default: 'false',
      description:
        'Anchors the bubble to the pointer instead of the trigger. Useful over large or irregular targets, like a chart.',
    },
    {
      name: 'disableInteractive',
      type: 'boolean',
      default: 'false',
      description:
        'Closes the tooltip as soon as the pointer leaves the trigger, even if it moves onto the bubble. Leave it off if the title contains a link.',
    },
    {
      name: 'disableHoverListener',
      type: 'boolean',
      default: 'false',
      description:
        'Stops hover from opening it. There are matching `disableFocusListener` and `disableTouchListener` props.',
    },
  ],
  examples: [
    {
      title: 'Naming an icon-only control',
      description:
        'The most common use: the tooltip becomes the trigger\'s accessible label.',
      code: [
        '<Tooltip title="Archive">',
        '  <IconButton aria-label="Archive">',
        '    <ArchiveIcon />',
        '  </IconButton>',
        '</Tooltip>',
      ].join('\n'),
    },
    {
      title: 'Describing a control that already has a label',
      description:
        '`describeChild` wires the title up as a description, so a screen reader reads the button text first.',
      code: [
        '<Tooltip',
        '  title="Sends a copy to everyone on the thread"',
        '  describeChild',
        '  placement="top"',
        '>',
        '  <Button>Reply all</Button>',
        '</Tooltip>',
      ].join('\n'),
    },
    {
      title: 'Longer copy',
      description:
        'The bubble wraps at a 300px text column, so a sentence or two is fine.',
      code: [
        '<Tooltip title="Tooltip content will help people understand things which are hidden, which are deep, or which need a second of thought.">',
        '  <Button appearance="outline">What is this?</Button>',
        '</Tooltip>',
      ].join('\n'),
    },
    {
      title: 'Interactive content',
      description:
        'Tooltips are interactive by default, so the pointer can move into the bubble to reach a link.',
      code: [
        '<Tooltip',
        '  leaveDelay={200}',
        '  title={<span>See the <a href="/docs/billing">billing docs</a></span>}',
        '>',
        '  <Button appearance="text">Plan limits</Button>',
        '</Tooltip>',
      ].join('\n'),
    },
    {
      title: 'On a disabled button',
      description:
        'A disabled element fires no pointer events, so wrap it in something that does.',
      code: [
        '<Tooltip title="Only owners can delete a workspace">',
        '  <span>',
        '    <Button disabled>Delete</Button>',
        '  </span>',
        '</Tooltip>',
      ].join('\n'),
    },
    {
      title: 'Controlled',
      code: [
        '<Tooltip',
        '  title="Copied to clipboard"',
        '  open={copied}',
        '  onClose={() => setCopied(false)}',
        '  disableHoverListener',
        '  disableFocusListener',
        '>',
        '  <IconButton aria-label="Copy" onClick={handleCopy}>',
        '    <CopyIcon />',
        '  </IconButton>',
        '</Tooltip>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use a tooltip to name an icon-only control — it becomes the accessible label',
    "Keep an icon button's `aria-label` identical to the tooltip's `title`; the trigger's own label wins, so a different one hides the tooltip text from screen readers",
    'Add `describeChild` when the trigger already has visible text, so the label is not replaced',
    'Keep it to a phrase or a sentence; the bubble wraps at a 300px column but is not a place for paragraphs',
    'Wrap a disabled trigger in a `<span>`, since a disabled element emits no pointer events',
    'Raise `leaveDelay` when the title holds a link, so the pointer can reach it',
  ],
  donts: [
    "Don't put anything essential in a tooltip — it is invisible on hover-less devices until long-pressed",
    "Don't repeat text that is already on screen; a tooltip that echoes the label is noise",
    "Don't put a button, form field, or anything focusable inside the title — a tooltip is not a popover",
    "Don't rely on `placement` alone near a viewport edge; Popper will flip it, so both sides have to read well",
    "Don't wrap a fragment or a plain string — the trigger has to be a single element that takes a ref",
  ],
  relatedComponents: ['IconButton', 'Menu', 'Alert'],
  accessibility: [
    'By default the title becomes the trigger\'s `aria-label`; with `describeChild` it is exposed as `aria-describedby` instead, and only while the tooltip is open',
    "An `aria-label` on the trigger itself wins over the one derived from `title` — MUI lets the child's own props through last. If the two disagree, the tooltip text is never announced, so keep them identical",
    'Opens on keyboard focus as well as hover, so a tab-only user gets the same information',
    'Escape closes an open tooltip without moving focus',
    'On touch, a long press opens it (`enterTouchDelay`, 700ms) and it hides again after `leaveTouchDelay`',
    'Interactive by default: the pointer can move onto the bubble without it closing, which is what lets a link inside it be reached',
    'The bubble is portalled to the end of the body; the popper around it carries `role="tooltip"` and the id that `aria-describedby` points at, so it is announced with the trigger rather than as loose text',
  ],
};
