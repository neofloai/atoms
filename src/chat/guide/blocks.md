A block is one piece of an answer. The renderer is picked by the block's `type`, falling back to its `category`. A product's own `<product>.<name>` type never falls back by category: without a registered renderer it shows its `fallback_text`.

## Built-in blocks

| `type` (aliases) | Renders | Payload |
| --- | --- | --- |
| `text` (`markdown`) | Markdown on the Atoms type scale. Raw HTML is never rendered. | [text](/chat/block-contracts#text) |
| `thinking` (`reasoning`) | "Thought for N seconds". Open while streaming, folds when done. | [thinking](/chat/block-contracts#thinking) |
| `tool_use` + `tool_result` | One card per tool call: name and duration, folded; open it for inputs and results. "Interrupted" when the result never came. | [tool_use](/chat/block-contracts#tool-use-and-tool-result) |
| `tool_call` (`tool`) | The older single-block form of the same card | [tool_call](/chat/block-contracts#tool-call) |
| `table` | A titled, sortable result set with a row count | [table](/chat/block-contracts#table) |
| `sources` (`citations`) | What the answer read. Items can link out or be selectable. | [sources](/chat/block-contracts#sources) |
| `approval` | Approve or reject a proposed action (HITL) | [approval](/chat/block-contracts#approval) |
| `choice` | Single or multi-select question (HITL) | [choice](/chat/block-contracts#choice) |
| `error` | Failure with a Try again button that respects `retry_after` | [error](/chat/block-contracts#error) |
| `artifact` (`document`) | A generated file with a preview, full view and download | [artifact](/chat/block-contracts#artifact) |
| `image` | An image with a caption that opens larger | [image](/chat/block-contracts#image) |
| `plan` (`steps`) | The agent's steps as a live stepper | [plan](/chat/block-contracts#plan) |
| `chart` | Bar, line, area and donut in Atoms colors (`@neofloai/atoms/chat/charts`) | [chart](/chat/block-contracts#chart) |

Charts need `recharts` installed and come from `@neofloai/atoms/chat/charts`: pass its `chartBlock` in `blocks`, as the [quick start](/chat/overview#quick-start) does.

To render a block type of your own, or to replace one of these, see [custom blocks](/chat/custom-blocks).
