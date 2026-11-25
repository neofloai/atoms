A block definition tells the chat how to render one kind of content block. Built-in blocks use the same API, so anything they do, yours can do.

## Example

```tsx
import { Button } from '@neofloai/atoms';
import { ReceiptIcon } from '@neofloai/atoms/icons';
import { AgenticChat, BlockShell, KeyValueList, defineBlock, type ChatAdapter } from '@neofloai/atoms/chat';

interface InvoiceCardData {
  id: string;
  vendor: string;
  total: string;
  status: string;
}

// Matches blocks whose `type` is "invoice_card". `parse` validates the payload; if it throws,
// the block falls back to the unknown-block renderer instead of crashing the thread.
export const invoiceCard = defineBlock<InvoiceCardData>({
  type: 'invoice_card',
  parse: (block) => ({
    id: String(block.invoice_id),
    vendor: String(block.vendor),
    total: String(block.total),
    status: String(block.status ?? 'open'),
  }),
  render: ({ data, actions }) => (
    <BlockShell
      icon={<ReceiptIcon />}
      title={`Invoice ${data.id}`}
      meta={data.status}
      footer={
        <Button size="sm" onClick={() => actions.emit('open_invoice', { id: data.id })}>
          Open invoice
        </Button>
      }
    >
      <KeyValueList
        items={[
          { key: 'vendor', value: data.vendor },
          { key: 'total', value: data.total },
        ]}
      />
    </BlockShell>
  ),
  toText: (data) => `Invoice ${data.id}: ${data.vendor}, ${data.total}`,
});

export function Chat({ adapter, openInvoice }: { adapter: ChatAdapter; openInvoice: (id: string) => void }) {
  // Define blocks at module scope, not inside render.
  return (
    <AgenticChat
      adapter={adapter}
      blocks={[invoiceCard]}
      onAction={(action) => {
        if (action.name === 'open_invoice') openInvoice((action.payload as { id: string }).id);
      }}
    />
  );
}
```

- **Matching.** Use `type` (one or several), `category`, or `match(block)` for anything else. Later registrations override built-ins, so `{ ...approvalBlock, type: 'approval_card' }` maps a backend's own name onto a built-in card.
- **Safety.** If `parse` throws, the block falls back to the unknown-block renderer. A renderer that throws is caught by its own error boundary, so the rest of the answer still shows.
- **Streaming.** `applyDelta(block, delta, snapshot)` takes over how deltas apply to your block type.
- **`actions`.** `send(text)` starts a follow-up turn, `resume(decision)` answers a checkpoint, `emit(name, payload)` reaches your `onAction`, and `retry()` retries the last failed turn.
- **The kit.** `BlockShell`, `KeyValueList`, `Shimmer`, `ChartCard` and `useChartPalette` are the same pieces the built-in blocks use, so custom cards look native. The last two come from `@neofloai/atoms/chat/charts`.

## Anatomy

```ts
defineBlock<TData>({
  type: 'invoice_card', // string or string[]; matched against block.type
  category: 'ui', // fallback when no definition claims the type
  match: (block) => boolean, // full control; checked before type and category
  parse: (block, chatBlock) => TData, // validate and normalize; throw to fall back
  applyDelta: (block, delta, snapshot) => block | undefined, // custom streaming
  render: Component, // receives BlockRenderProps<TData>
  toText: (data, chatBlock) => string, // used by Copy
  group: 'activity', // render consecutive blocks of this group together
});
```

`render` receives:

| Prop | What it is |
| --- | --- |
| `data` | The output of `parse`, or the raw block without a parser |
| `block` | The runtime block: `id`, `type`, `status` (`streaming`, `complete`, `interrupted`), `checkpoint`, timings |
| `message` | The message it belongs to |
| `status`, `checkpoint` | Shortcuts for `block.status` and `block.checkpoint` |
| `isLast` | It's the last block of a message that's still streaming |
| `actions` | `send(text)`, `resume(decision)`, `emit(name, payload)`, `retry()` |

## Resolution

1. `match()` functions, newest registration first
2. An exact `type`
3. A `category`
4. The fallback (`unknownBlock`: JSON in development, nothing in production)

Because later registrations win, you can replace a built-in:

```tsx
import { AgenticChat, defineBlock, tableBlock } from '@neofloai/atoms/chat';

const myTable = defineBlock({ ...tableBlock, render: MyTable });
<AgenticChat adapter={adapter} blocks={[myTable]} />;
```

Or map a backend's own type name onto a built-in:

```ts
import { approvalBlock } from '@neofloai/atoms/chat';

const approvals = { ...approvalBlock, type: ['approval', 'approval_card'] };
```

## Looking native

Build cards from the kit so they match the built-in blocks:

- `BlockShell`: the card itself. It takes `icon`, `title`, `meta`, `actions`, `footer`, `collapsible` (with `defaultOpen={false}` to start folded, as the tool card does, or `open` and `onOpenChange` to control it), `tone` (`primary`, `warning`, `danger` for attention), and `flushBody` for edge-to-edge content.
- `KeyValueList`: muted keys against values.
- `Shimmer`: text still arriving.
- `ChartCard`, `ChartLegend`, `useChartPalette` from `@neofloai/atoms/chat/charts`.
- `Markdown`, `DataTable`, `ErrorNotice`.

Use Atoms components and tokens for everything else. `mode(theme, { color: text.default.b2 })` resolves an Atoms `{ light, dark }` token inside `sx`; `mode` comes from `@neofloai/atoms/chat` and `text` from `@neofloai/atoms/tokens`.

## Talking to the host app

`actions.emit(name, payload)` calls the `onAction` prop with `{ name, payload, block, message, conversationId }`. Use it for navigation, opening records, downloads, analytics: anything the card shouldn't own.

## Streaming your block

By default, a `snapshot` string replaces the block's `text`, a `snapshot` object is merged into the block, and `delta.text` is appended. Provide `applyDelta` when your block streams differently, for example a plan whose snapshot is a step array:

```ts
applyDelta: (block, _delta, snapshot) => (Array.isArray(snapshot) ? { ...block, steps: snapshot } : undefined),
```

Return `undefined` to fall back to the default.

## HITL cards

Inside `render`, `useHitl()` returns `canSubmit`, `isPending`, `isSubmitting`, `isResolved`, `decision`, `error`, `requires` and `submit(decision)`. `canSubmit` is true only when the card is the thread's live question and nothing is streaming. It also guards double submits. [Human-in-the-loop](/chat/hitl) has a full example.

To test a card against the mock backend, see [mock backend tests](/chat/mock#tests).
