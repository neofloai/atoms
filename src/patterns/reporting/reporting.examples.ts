import { reportingCode } from './reportingCode';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `reporting` pattern. Read by `scripts/generate.ts`
 * and served through the MCP `get_pattern` tool and the docs site, so the
 * snippet a reader copies and the one an agent is handed are the same string.
 */
export const data: PatternExamplesData = {
  name: 'Reporting',
  slug: 'reporting',
  description:
    'An analytics screen for an agent that works a queue: three bands of measured figures, two breakdowns of where the work went, and one filter band that every figure on the page is derived from. It reports and does not act — no row opens a record and no button changes anything, which is the line between this screen and the stages of a workflow.',
  code: reportingCode,
  components: [
    'Navbar',
    'Drawer',
    'ToggleButton',
    'Select',
    'Card',
    'Chip',
    'Progress',
    'Tooltip',
    'Divider',
    'Box',
    'Stack',
    'Typography',
  ],
  dos: [
    'Derive a trend pill from two figures rather than storing the change: an arrow that is the sign of `value − previous` and a colour that is whether that sign is the good one cannot end up pointing down beside a number that went up',
    'Say which way is better on the metric, not at the call site. A rising containment rate and a rising failed-auth override rate both point up and only one of them is green, and the difference belongs to what is being measured rather than to the tile drawing it',
    'Compute every bar width from the number printed beside it. A bar and a label are two renderings of one figure, so the moment the bar is measured by hand a row can read `0% auto` over a half-filled green track',
    'Rank a breakdown against its leading row rather than against the total, when the ranking is the point — six reasons that between them explain everything would each draw a stub, and the card would show nothing you could read',
    'Reach for a charting library for anything that plots a series. **Recharts** is the recommendation: it is composable, it takes a plain array, and its axes and tooltips are the parts that are least worth hand-drawing. Keep the data in the record and pass it in, so the same series feeds the chart and the text beside it',
    "Keep the finding, not just the picture. A floor line's whole purpose is the points below it, so state which days breached and by how much — that survives a narrow column, a print stylesheet and a screen reader, none of which a plotted line does",
    'Let a tile that is measured over a different window say so. Accuracy figures from an evaluation job hold still while the range moves, and a tile that quietly ignores the control the reader just used is worse than one that explains itself',
    'Name the comparison from the selected window. One derived label cannot drift into `vs prev 30d` on four tiles and `vs prior 30d` on two, and it stays true when the window changes',
    'Render a row with nothing in it. An intent nobody asked about in this window is a fact about the window, and dropping the row makes the card shorter every time the range narrows — the reader has to notice an absence to learn anything',
    'Give a metric one treatment for its figure and its unit, so a percentage, a duration and a count of hours can share a row without any of them reading as a different kind of thing',
  ],
  donts: [
    "Don't hand-draw a chart. An SVG path built from a series carries no axis, no tooltip, no legend and no empty state, and every one of those gets asked for the week after it ships — use Recharts and spend the effort on the record behind it",
    "Don't hardcode a figure on a reporting screen. It is the one screen where a wrong number looks exactly like a right one, because nothing else on the page disagrees with it — derive it and let the arithmetic be the thing that is reviewed",
    "Don't put an action on it. A screen that looks back at a month of work is not where an invoice gets approved: the decision belongs to the stage that owns the record, and a control here would be pressed by whoever happened to be reading",
    "Don't draw an info glyph with nothing behind it. Fourteen of them across a screen is fourteen promises, and a tooltip is the only place a tile can explain which window it is measured over without inventing a caption",
    "Don't scroll the filter band away. It is the screen's only input, and a window you cannot see is a window you will forget you chose — every figure below it is meaningless without it",
    "Don't pick series colours off the ramp. Four bars that mean sent-as-written, tidied, rewritten and thrown away are a ladder, so they take the success, information, warning and error roles — which also means they still read when the page is inverted",
    "Don't hide a zero. A driver with no occurrences and an intent with no queries are both results, and a card that silently omits them reports a cleaner month than the one that happened",
  ],
};
