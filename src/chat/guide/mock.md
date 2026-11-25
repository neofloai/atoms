`@neofloai/atoms/chat/mock` runs a backend on the standard in memory: the config endpoint, `selected_model`, `client_message_id` with duplicate detection, error envelopes and paired tool calls. Use it to build UI before the API exists, in tests, and in demos. The chat running on the [overview](/chat) uses it.

## Scenarios

```ts
import { createMockAdapter } from '@neofloai/atoms/chat/mock';

const adapter = createMockAdapter({
  latency: 200,
  scenarios: [
    {
      name: 'invoice',
      match: (prompt) => prompt.includes('invoice'),
      run: async (w) => {
        await w.status('Looking it up');
        await w.block({ type: 'invoice_card', category: 'ui', invoice_id: 'INV-1042', vendor: 'Acme', total: '$1,200' });
        await w.text('Here it is.');
      },
    },
  ],
});
```

The writer has `status`, `text`, `thinking`, `tool` (a `tool_use` and its `tool_result`), `block` (with streamed `snapshots`), `pause` (a HITL checkpoint with an `onResume` continuation), `error` and `wait`. Cancel and abort work the same as on a real backend.

## Config and connections

Pass `config` to change what the mock's config reports (`null` behaves like a backend without one). Its invoice-processing connection starts expired, so a prompt that mentions "invoice processing" fails with `connection_expired` until something calls `adapter.connect('invoice_processing')`, which is how the demo shows Reconnect.

## Tests

Register your block with the mock backend and assert on what renders:

```tsx
import { NeofloThemeProvider } from '@neofloai/atoms';
import { AgenticChat } from '@neofloai/atoms/chat';
import { createMockAdapter } from '@neofloai/atoms/chat/mock';
import { render } from '@testing-library/react';
import { invoiceCard } from './invoiceCard'; // the card from Custom blocks

const adapter = createMockAdapter({
  latency: 0,
  speed: 0,
  includeDefaultScenarios: false,
  scenarios: [
    {
      name: 'card',
      match: () => true,
      run: (w) => w.block({ type: 'invoice_card', category: 'ui', invoice_id: '1' }).then(() => undefined),
    },
  ],
});
render(
  <NeofloThemeProvider>
    <AgenticChat adapter={adapter} blocks={[invoiceCard]} persistence={false} />
  </NeofloThemeProvider>,
);
```
