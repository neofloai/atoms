The hooks, primitives and parsers come from the same `@neofloai/atoms/chat` entry as `<AgenticChat>`. They carry no styling, and when you don't import the styled UI, it tree-shakes away. Use them when a product has its own design system, or when you need a layout the styled components can't express.

`@neofloai/atoms/chat/core` goes one step further and has no React at all.

## Example

```tsx
import {
  Block,
  ChatProvider,
  Composer,
  Message,
  Thread,
  defineBlock,
  parseText,
  useMessage,
  type ChatAdapter,
} from '@neofloai/atoms/chat';

// Headless blocks bring their own renderer; the parsers are shared with the styled UI.
const text = defineBlock({ type: 'text', category: 'content', parse: parseText, render: ({ data }) => <p>{data.text}</p> });

function AnyMessage() {
  const { message } = useMessage();
  return (
    <Message.Root className={`msg msg-${message.role}`}>
      {/* A tool_result paired with its tool_use renders inside that card (Message.Blocks does this for you). */}
      {message.blocks
        .filter((b) => !b.pairedWith)
        .map((b) => (
          <Block key={b.id} block={b} message={message} />
        ))}
    </Message.Root>
  );
}

export function MyChat({ adapter }: { adapter: ChatAdapter }) {
  return (
    <ChatProvider adapter={adapter} blocks={[text]}>
      <Thread.Root className="thread">
        <Thread.Viewport className="viewport">
          <Thread.Empty>
            <p>Ask me anything.</p>
          </Thread.Empty>
          <Thread.Messages components={{ UserMessage: AnyMessage, AssistantMessage: AnyMessage }} />
          <Thread.Status>{(label) => <span className="status">{label}</span>}</Thread.Status>
        </Thread.Viewport>
        <Thread.ScrollToBottom className="jump">↓</Thread.ScrollToBottom>
      </Thread.Root>
      <Composer.Root className="composer">
        <Composer.Input placeholder="Type a message" />
        <Composer.Cancel>Stop</Composer.Cancel>
        <Composer.Send>Send</Composer.Send>
      </Composer.Root>
    </ChatProvider>
  );
}
```

## Provider

```tsx
import { ChatProvider } from '@neofloai/atoms/chat';

<ChatProvider adapter={adapter} blocks={[...myBlocks]} onAction={handle} labels={{ composerPlaceholder: 'Ask' }}>
  …
</ChatProvider>
```

`ChatProvider` takes every runtime option (see [Configuration](/chat/configuration#options)), or a `runtime` you created with `createChatRuntime`. `ThreadProvider conversationId="…"` pins everything below it to one conversation instead of the active one, which is how you show two chats side by side.

## Primitives

Every part renders a plain element, accepts normal HTML props, supports `asChild` to render your own element instead, and exposes `data-*` attributes (`data-role`, `data-status`, `data-busy`, `data-at-bottom`…) for styling.

| Primitive | Parts |
| --- | --- |
| `Thread` | `Root`, `Viewport` (stick-to-bottom scrolling), `Messages`, `Empty`, `If`, `Status`, `ScrollToBottom` |
| `Message` | `Root`, `Blocks` (renders through the registry, with optional grouping), `If` |
| `Block` | Renders one block through the registry inside its own error boundary |
| `Composer` | `Root` (the form), `Input` (auto-growing, Enter sends, IME-safe, paste files), `Send`, `Cancel`, `AttachmentInput`, `Attachments` |
| `Suggestions` | `Root`, `Item` (sends the prompt text). `suggestionGlyph(prompt.icon)` gives the icon a prompt names, or the default. |
| `ConversationList` | `Root`, `Item`, `New` |
| `Hitl` | `Root`, `Option`, `Submit`, for building choice cards |

## Hooks

| Hook | Returns |
| --- | --- |
| `useThread(selector)` | Any slice of the thread state, re-rendering only when it changes |
| `useMessages()`, `useRun()`, `useThreadMeta()`, `useIsBusy()` | Common slices |
| `useComposer()` | Draft text, attachments, `canSend`, `busy`, `blockedByDecision`, `send`, `cancel`, `addFiles` |
| `useConversations()` | History: items, groups, search, create, select, rename, remove, archive |
| `useScope()` | The workflow picker: groups, selection, summary, `toggle`, `setGroup` |
| `useHitl()` | The current block's checkpoint state and `submit` |
| `useChatActions()` | `send`, `resume`, `cancel`, `retry`, conversation actions, `emit` |
| `useChatConfig()`, `useCapabilities()` | The backend's config (`models`, `sources` and the rest), and the capabilities the UI may use |
| `usePreference(key, fallback)` | A persisted UI preference |
| `useChatEvent(type, listener)` | Runtime events: `event`, `error`, `warning`, `activeChange` |
| `useChatRuntime()` | The runtime itself |

## Parsers

Every built-in block's parser is exported (`parseTable`, `parseToolCall`, `parseApproval`, …) along with `BLOCK_TYPES`, so a headless renderer can reuse the exact payload handling of the styled UI:

```tsx
import { BLOCK_TYPES, defineBlock, parseTable } from '@neofloai/atoms/chat';

const table = defineBlock({ type: BLOCK_TYPES.table, parse: parseTable, render: MyTable });
```
