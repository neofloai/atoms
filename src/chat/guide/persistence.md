The history panel lists the conversations the server keeps. Local persistence remembers state on the device, and you choose where and how much.

## Chat history

The history panel lists conversations from endpoint 2 (`GET /v1/conversations`), newest first. It groups them into Today, Yesterday, Previous 7 days, Previous 30 days and Older, and searches titles as you type. Rename, archive and delete are optimistic, and they roll back if the server refuses.

- A new chat joins the list when its first message is sent. Empty chats never clutter history.
- A reply keeps streaming if you switch chats mid-answer. The list marks that conversation "Replying…".
- `message_stop.title` updates the title everywhere as soon as the server names the chat.
- Build your own panel with `useConversations()`, which returns items, groups, the active id, search, create, select, rename, remove, archive and refresh.

## Local persistence

The chat can remember state on the device, so a reload lands people back where they were: same chat, same half-typed question. You choose where it's stored and what's kept.

```ts
persistence: {
  storage: 'session',          // 'session' (default) | 'local' | 'memory' | 'none' | StorageAdapter
  namespace: 'neoflo-chat',    // key prefix
  scope: user.idHash,          // partitions keys per user
  persist: {
    activeConversation: true,  // reopen the same chat after a reload (not an empty one: see below)
    drafts: true,              // unsent text + uploaded attachments, per chat
    preferences: true,         // history panel, model, scope selection, removed prompts, anything set with usePreference
    history: false,            // conversation list + recent message histories, for instant loads
  },
  maxCachedConversations: 20,  // LRU cap for cached histories
  ttl: undefined,              // ms; older entries are dropped on read
  debounceMs: 400,
}
```

An empty chat isn't reopened. A reload opens a new chat instead, with the server's greeting and suggested prompts, which a reopened one wouldn't have. It is reopened once it has a message, or a half-typed question with `drafts` on.

`history` is off by default because chat content can be sensitive. Turn it on together with `scope`.

Pass `persistence={false}` to turn it off entirely.

## Choosing a storage

| Storage | Survives | Use it when |
| --- | --- | --- |
| `session` | Reloads in the same tab | The default. Nothing lingers after the tab closes. |
| `local` | Browser restarts, and it syncs across tabs | People expect the chat to still be there tomorrow. Set `scope`. |
| `memory` | Nothing | Tests and demos. |
| `none` | Nothing | You manage state elsewhere. |
| A `StorageAdapter` | Whatever it does | IndexedDB, localforage, encryption at rest, a native bridge. |

A custom `StorageAdapter`:

```ts
import { createChatRuntime, createRestAdapter, type StorageAdapter } from '@neofloai/atoms/chat/core';

// kv stands for your own async key-value store (IndexedDB, an encrypted store…).

const encryptedStore: StorageAdapter = {
  getItem: async (key) => (await kv.get(key)) ?? null,
  setItem: (key, value) => kv.set(key, value),
  removeItem: (key) => kv.del(key),
  keys: () => kv.keys(), // optional; lets clear() find every key
};

export const runtime = createChatRuntime({
  adapter: createRestAdapter({ baseUrl: 'https://api.example.com' }),
  persistence: {
    storage: encryptedStore,
    scope: 'user-7f3a', // a hash of the signed-in user, so accounts never share state
    persist: { drafts: true, activeConversation: true, preferences: true, history: true },
    maxCachedConversations: 50,
    ttl: 7 * 24 * 60 * 60 * 1000, // forget cached chats after a week
  },
});
```

Async adapters are fine. The chat hydrates as soon as reads resolve; sync storages hydrate before the first paint.

## Guarantees

- **Scoped.** Keys are `namespace:scope:name`. Two users on one device never read each other's drafts or history.
- **Versioned.** Every entry is an envelope `{ v, savedAt, data }`. Entries from a newer library version are left alone. Corrupt or foreign entries are deleted instead of crashing the chat.
- **Safe on failure.** A full quota, private mode or a blocked storage falls back to memory for the session and reports once through `onWarning` (`storage_error`).
- **Consistent.** Only finished messages are cached. A message that was mid-stream at reload is shown as interrupted, and the conversation is refetched.
- **Server wins.** Cached history renders instantly and is replaced by the server's copy when it arrives. Decisions made in the session are kept if the server's copy doesn't carry them yet ([schema gap #2](/chat/schema-gaps)).
- **SSR-safe.** Nothing touches storage during server render or at import time.

## Logout

Call `runtime.persistence.clear()` on logout:

```ts
await runtime.persistence.clear(); // removes every key this chat wrote for the current scope
runtime.dispose();
```

When you render `<AgenticChat adapter={…}>` without your own runtime, read it with `useChatRuntime()` inside the tree, or create the runtime yourself with `createChatRuntime` and pass `runtime={…}` (see [driving the chat from your app](/chat/configuration#driving-the-chat-from-your-app)).
