Every option works the same on `<AgenticChat>`, `<ChatProvider>` and `createChatRuntime`. A chat with most of them set:

```tsx
import { AgenticChat, createRestAdapter, type Attachment } from '@neofloai/atoms/chat';

// getAccessToken, refreshSession, openWorkspacePicker, connectSource and uploadToStorage stand
// for your app's own functions; currentUser, invoiceOnScreen and router for its own state.

const adapter = createRestAdapter({
  baseUrl: 'https://api.example.com',
  headers: async () => ({ Authorization: `Bearer ${await getAccessToken()}` }),
  // A 401 calls this once with its error code; return true once the user can continue, to
  // retry the request. `unauthenticated` means sign in again; a product code can mean more.
  onUnauthorized: ({ code }) => (code === 'askneo.workspace_required' ? openWorkspacePicker() : refreshSession()),
});

export function Chat({ conversationId }: { conversationId?: string }) {
  return (
    <AgenticChat
      adapter={adapter}
      // The composer's "All workflows" picker. Groups are workspaces, items are workflows.
      scope={{
        groups: [
          {
            id: 'ws_finance',
            label: 'Finance',
            items: [
              { id: 'ip', label: 'Invoice Processing' },
              { id: 'col', label: 'Collections' },
            ],
          },
        ],
      }}
      // Context from the page the chat is embedded in, merged into every turn.
      workflowContext={() =>
        invoiceOnScreen
          ? [{ workflow_name: 'ip', workspace_id: ['ws_finance'], context: { invoice_id: invoiceOnScreen.id } }]
          : undefined
      }
      // The standard has no upload endpoint, so your app uploads and returns the Attachment.
      attachments={{
        accept: '.pdf,.xlsx,.csv,image/*',
        maxSize: 20 * 1024 * 1024,
        upload: async (file, { signal, onProgress }): Promise<Attachment> => ({
          url: await uploadToStorage(file, onProgress, signal),
          filename: file.name,
          content_type: file.type,
          size: file.size,
          meta: {},
        }),
      }}
      persistence={{ storage: 'local', scope: currentUser.idHash, persist: { history: true } }}
      // Keep the open chat in the URL.
      conversationId={conversationId}
      onConversationChange={(id) => router.push(id ? `/chat/${id}` : '/chat')}
      // Cards call actions.emit(...); route those into your app.
      onAction={(action) => {
        if (action.name === 'open_invoice') router.push(`/invoices/${(action.payload as { id: string }).id}`);
      }}
      // A connected system (an ERP, invoice processing…) needs reconnecting: hand your backend
      // the credential, return true, and the chat retries the message once.
      onConnectionRequired={({ sourceId }) => (sourceId ? connectSource(sourceId) : false)}
      onError={(error) => console.warn(error.type, error.message, error.requestId)}
      labels={{ composerPlaceholder: 'Ask Neo anything' }}
    />
  );
}
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `adapter` | required | The backend connection. Use `createRestAdapter` or your own. |
| `runtime` | | Pass a runtime you created yourself instead of `adapter`. See [Driving the chat from your app](/chat/configuration#driving-the-chat-from-your-app). |
| `blocks` | built-ins | Extra or replacement block definitions. Later entries win. |
| `scope` | none | Groups and items for the workflow picker. By default the selection becomes `workflow_context`. Change that with `scope.toRequest`. |
| `workflowContext` | none | Page context added to every turn. It merges with the scope by `workflow_name`. |
| `attachments` | off | `{ upload, accept, maxSize, maxFiles }`. This turns on the composer's + button, drag-and-drop and paste. |
| `persistence` | session storage | See [local persistence](/chat/persistence#local-persistence). |
| `conversationCreation` | `'eager'` | `'eager'` creates the chat when it opens, which is what fetches the greeting. `'lazy'` waits for the first message. |
| `hitl.composerWhilePaused` | `'disabled'` | Whether people can type while a card waits for a decision. |
| `conversationId` / `onConversationChange` | | A controlled active chat, for deep links. `null` means a new chat. |
| `onAction` | | Receives `actions.emit(name, payload)` from cards. |
| `capabilities` | from the config | Feature switches (`hitl`, `attachments`, `workflowContext`, `archive`, `cancel`, `perTurnModel`, `perTurnSources`). They decide what shows until the backend serves its config, then can only turn more off. |
| `onConnectionRequired` | | Called with `{ sourceId, code }` when a send fails with `connection_required` or `connection_expired`. Reconnect (for example `PUT /v1/connections/{sourceId}`), return `true`, and the message is retried once. |
| `onEvent` / `onError` / `onWarning` | | Telemetry hooks for every stream event, error and recoverable warning. |
| `labels` | English | Override any UI string, for copy changes or translation. |
| `navigation` | `'header'` | `'rail'` swaps the header bar for a rail on the right, with the history opening there. See [Header or rail](/chat/customizing#header-or-rail). |
| `railFooter` | | Your own buttons at the rail's foot. |
| `turnActions` | all on | The row under each answer: `onFeedback`, `feedbackIssueTypes`, `copy`, `retry`, `timestamp`, `extra`, `visibility`, or `false`. See [Under each answer](/chat/customizing#under-each-answer). |
| `streamIdleTimeoutMs` | `60000` | How long a silent stream waits before it counts as dropped and becomes retryable. |
| `refreshOnFocus` | `true` | Refresh history when the window regains focus. |

## REST adapter options

`createRestAdapter` takes these options:

| Option | What it does |
| --- | --- |
| `baseUrl` | The API origin. The `/v1/...` paths are appended to it. |
| `headers` | An object or an (async) function, called on every request so tokens stay fresh. |
| `onUnauthorized` | Called once on a 401 with `{ code, message, requestId }`. `unauthenticated` means sign in again; a product code (`askneo.gate_required`, `askneo.workspace_required`) says where else to send the user. Return `true` to retry that request. |
| `retry` | `{ retries, baseDelayMs, maxDelayMs }` for idempotent calls on 5xx, 429 and network errors. Message POSTs are never retried automatically. |
| `paths` | Override individual endpoint paths. |
| `credentials` | `'include'` sends the session cookie when the API is on another origin. |
| `fetch`, `timeoutMs` | Transport details. |

## Driving the chat from your app

Create the runtime outside React to reach it from anywhere:

```tsx
import { Button } from '@neofloai/atoms';
import { AgenticChat, createChatRuntime, createRestAdapter } from '@neofloai/atoms/chat';

// Create the runtime outside React to reach it from anywhere in the app.
export const chat = createChatRuntime({
  adapter: createRestAdapter({ baseUrl: 'https://api.example.com' }),
  persistence: { storage: 'session' },
});

export function AskAboutInvoice({ invoiceId }: { invoiceId: string }) {
  return (
    <Button
      onClick={async () => {
        await chat.newConversation();
        await chat.send(`Why is invoice ${invoiceId} on hold?`, {
          workflowContext: [{ workflow_name: 'ip', workspace_id: [], context: { invoice_id: invoiceId } }],
        });
      }}
    >
      Ask Neo about this invoice
    </Button>
  );
}

export function ChatPanel() {
  return <AgenticChat runtime={chat} />;
}

// On logout: stop streams and wipe everything the chat stored on this device.
export async function onLogout() {
  await chat.persistence.clear();
  chat.dispose();
}
```

The runtime also exposes `cancel`, `retry`, `reconnect`, `resume`, `selectConversation`, `renameConversation`, `deleteConversation`, `setModel`, `setDefaultSources`, `loadConfig`, the `chatConfig` store and `on('event' | 'error' | 'warning' | 'activeChange', listener)`. Several runtimes can share a page.

## A backend that doesn't follow the schema

`ChatAdapter` is the only seam. Keep the REST calls that match and translate the ones that don't:

```ts
import { createRestAdapter, type ChatAdapter, type StreamEvent } from '@neofloai/atoms/chat/core';

// legacyAsk(conversationId, question, signal) stands for your call to the old API.
// It resolves to { id, answer }.

const base = createRestAdapter({ baseUrl: 'https://legacy.example.com' });

// Keep the standard's calls that work and translate the ones that don't. The UI only ever sees
// the standard's events, so every block and hook keeps working.
export const legacyAdapter: ChatAdapter = {
  ...base,
  async *sendMessage(conversationId, body, { signal }): AsyncGenerator<StreamEvent> {
    if (body.message.type !== 'default') throw new Error('This backend has no HITL support.');
    const reply = await legacyAsk(conversationId, body.message.content.default, signal);
    yield { type: 'message_start', message_id: reply.id, conversation_id: conversationId, run_id: reply.id };
    const block = { id: `${reply.id}:0`, type: 'text', category: 'content', text: reply.answer };
    yield { type: 'content_block_start', index: 0, block };
    yield { type: 'content_block_stop', index: 0, block };
    yield { type: 'message_stop', message_id: reply.id, stop_reason: 'end_turn' };
  },
};
```
