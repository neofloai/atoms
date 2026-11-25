When the backend emits a `checkpoint`, the card that asked the question becomes live. The turn stops with `stop_reason: "paused"`, the composer shows "Respond to the card above to continue", and the answer goes back through endpoint 6 (`POST /v1/conversations/{id}/messages`):

```json
{
  "stream": true,
  "message": { "role": "user", "type": "hitl", "content": { "checkpoint_id": "z93hdnf02c", "decision": "approve" } }
}
```

The rest of the turn streams into the same message. A double click can't send two decisions. If the resume request fails, the card shows the error and lets the user try again.

The built-in decision cards are `approval` and `choice`; their payloads are in [block contracts](/chat/block-contracts#approval). They need `hitl` in the backend's [config](/chat/backend-contract#3-the-config-endpoint-0): without it, the chat ignores `checkpoint` events and never shows approval or choice cards. The `hitl.composerWhilePaused` option (default `'disabled'`) decides whether people can type while a card waits for a decision.

## Your own decision card

Write your own decision card with `useHitl()`:

```tsx
import { Button, TextField } from '@neofloai/atoms';
import { PencilSimpleIcon } from '@neofloai/atoms/icons';
import { BlockShell, defineBlock, useHitl } from '@neofloai/atoms/chat';
import { useState } from 'react';

interface AmountData {
  title: string;
  suggested: number;
}

function AmountCard({ data }: { data: AmountData }) {
  const hitl = useHitl();
  const [amount, setAmount] = useState(String(data.suggested));
  return (
    <BlockShell
      icon={<PencilSimpleIcon />}
      title={data.title}
      tone={hitl.isPending ? 'primary' : 'default'}
      footer={
        hitl.isResolved ? null : (
          <Button
            size="sm"
            loading={hitl.isSubmitting}
            disabled={!hitl.canSubmit}
            // Sent as { stream, message: { type: 'hitl', content: { checkpoint_id, decision } } }
            onClick={() => void hitl.submit({ amount: Number(amount) })}
          >
            Confirm
          </Button>
        )
      }
    >
      <TextField label="Amount" value={amount} disabled={!hitl.canSubmit} onChange={(e) => setAmount(e.target.value)} />
    </BlockShell>
  );
}

export const amountCard = defineBlock<AmountData>({
  type: 'amount_confirmation',
  parse: (b) => ({ title: String(b.title ?? 'Confirm the amount'), suggested: Number(b.suggested ?? 0) }),
  render: ({ data }) => <AmountCard data={data} />,
});
```

Register it in `blocks` like any [custom block](/chat/custom-blocks).

Inside `render`, `useHitl()` returns `canSubmit`, `isPending`, `isSubmitting`, `isResolved`, `decision`, `error`, `requires` and `submit(decision)`. `canSubmit` is true only when the card is the thread's live question and nothing is streaming. It also guards double submits.

## After a reload

On reload, the history endpoint has to let the chat rebuild each card, including one whose checkpoint is still waiting for a decision. [Backend contract §6](/chat/backend-contract#6-history-and-hitl) lists what the chat reads to restore it.
