**Slots** replace any part of `<AgenticChat>`: `Welcome`, `UserTurn`, `AssistantTurn`, `Header`, `History` and `Composer`.

```tsx
import { Button, Stack, Typography } from '@neofloai/atoms';
import { AgenticChat, useChatActions, useThreadMeta, type ChatAdapter } from '@neofloai/atoms/chat';

function Welcome() {
  const meta = useThreadMeta();
  const { send } = useChatActions();
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', py: 8 }}>
      <Typography variant="h4" component="h2">
        {meta.greeting ?? 'Good morning'}
      </Typography>
      <Stack direction="row" spacing={1}>
        {meta.suggestedPrompts.map((p) => (
          <Button key={p.label} size="sm" variant="secondary" appearance="outline" onClick={() => void send(p.prompt)}>
            {p.label}
          </Button>
        ))}
        <Button size="sm" onClick={() => void send('What changed since yesterday?')}>
          Daily digest
        </Button>
      </Stack>
    </Stack>
  );
}

export function Chat({ adapter }: { adapter: ChatAdapter }) {
  return <AgenticChat adapter={adapter} components={{ Welcome }} history={false} />;
}
```

- **Layout props.** `history`, `header`, `title`, `headerActions`, `maxWidth`, `composerProps` and `compactBelow`. Below 720px of container width, history becomes an overlay.
- **Compose it yourself.** `ChatThread`, `ChatComposer`, `ChatHistory`, `ChatHeader`, `WelcomeScreen`, `ChatSuggestions` and `RunStatus` all work inside a `ChatProvider`, in any layout you like.

## The empty chat

Until the first message, the built-in welcome holds the whole screen in one 640px column: the Neoflo mark, the server's greeting, the composer, and the suggested prompts under it.

- **The composer moves.** It starts under the greeting, three lines tall, and grows to 18 lines before it scrolls. When the first message goes out it docks under the thread, one line tall and growing to 8, and keeps the focus.
- **Each prompt is a row with its icon.** The backend picks the icon by name, from the list in the [backend contract](/chat/backend-contract#suggested-prompts). A prompt without one shows a sparkle.
- **The × removes a prompt.** It stays removed in every new chat on that device, as a preference (so `persistence` decides how long). Use `ChatSuggestions` with `removable={false}` in your own layout to keep every prompt.
- **Your own `Welcome` keeps the composer docked.** A replaced welcome is shown above a docked composer, as before, so it never renders a second one.

The placeholder is `labels.welcomePlaceholder` on the empty chat and `labels.composerPlaceholder` under a conversation; `composerProps.placeholder` sets both, as `composerProps.minRows` and `maxRows` set both heights.

## Under each answer

Each answer ends with a row: 👍 and 👎, copy, ↻ (ask again) on the newest answer, and when it was given ("40 mins ago"). `turnActions` sets each part:

```tsx
<AgenticChat
  adapter={adapter}
  turnActions={{
    // The standard has no feedback endpoint, so 👍 and 👎 show only when you take the feedback.
    onFeedback: (f) => api.post('/feedback', f), // { rating, messageId, conversationId, runId, issueType?, details? }
    feedbackIssueTypes: [
      { id: 'wrong', label: 'Wrong numbers' },
      { id: 'slow', label: 'Too slow' },
    ],
    copy: true,
    retry: true, // or false, or (message) => yourOwnRetry(message)
    timestamp: true,
    extra: (message) => <TurnActionButton label="Share" onClick={() => share(message)}><ShareIcon /></TurnActionButton>,
    visibility: 'always', // or 'hover', which keeps older answers quiet until pointed at
  }}
/>
```

- **👍** sends at once; **👎** opens a dialog for an optional issue type and details first. When `onFeedback` resolves the chat thanks the user, and it remembers the rating on the device.
- **↻** asks the answer's question again, as a new turn: the standard has no way to replace an answer. Pass a function to do your own thing.
- **`turnActions={false}`** hides the row.

## Header or rail

`navigation` decides how people reach the history and New chat:

- **`header`** (the default): a bar over the thread with the history toggle, the title and New chat. The history opens on the left.
- **`rail`**: no bar (your app shows the title). A narrow rail on the right has New chat, History and Search; the history opens on the right in its place, and Search opens it with the search field focused. `railFooter` puts your own buttons at the rail's foot, such as Help.

```tsx
<AgenticChat adapter={adapter} navigation="rail" railFooter={<HelpButton />} />
```

With the header, `title` replaces the conversation's title in the chat's own bar.

### The title in your app bar

With the rail, the chat's title goes in your app bar. `onTitleChange` gives you the conversation's title whenever it changes. Put it in a `NavbarTitle`, which shows whatever you pass, so your other pages can say "Home" or their own name in the same place. The id is `null` for a new chat that hasn't been sent yet, when the title is still "New chat"; show your own label then if you like.

```tsx
import { AccountMenu, Box, IconButton, Navbar, NavbarTitle, Stack } from '@neofloai/atoms';
import { SidebarSimpleIcon } from '@neofloai/atoms/icons';

const [title, setTitle] = useState('Ask Neo');

<Navbar>
  <Stack direction="row" sx={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 2 }}>
    <IconButton variant="secondary" appearance="text" size="sm" {...sidebar.toggleProps}>
      <SidebarSimpleIcon />
    </IconButton>
    <NavbarTitle>{title}</NavbarTitle>
    <Box sx={{ flex: 1 }} />
    <AccountMenu user={user} onSignOut={signOut} />
  </Stack>
</Navbar>
<AgenticChat
  adapter={adapter}
  navigation="rail"
  onTitleChange={(chatTitle, conversationId) => setTitle(conversationId ? chatTitle : 'Ask Neo')}
/>
```

## Composer controls

The composer has the + button, two optional slots, and Send, which appears once there is something to send. Under a conversation they share one row with the input; on the empty chat they sit under it. Pass the slots to `ChatComposer`, or through `composerProps` on `<AgenticChat>`:

| Prop | Where it goes | Use it for |
| --- | --- | --- |
| `menu` | The + button | See [The plus menu](#the-plus-menu) |
| `leadingActions` | After + on the empty chat; before Send under a conversation | A mode switch, a picker that should always show |
| `extraActions` | Right, before Send | A model picker, a mic |
| `scopePicker` | With `leadingActions` | Omit it for the built-in workflows (a submenu of +, or a pill with `menu: false`), pass your own node to put it in the row, or `false` to leave the workflows out |
| `footer` | Under the composer | A disclaimer, such as "Neo can make mistakes. Check important numbers against the source." A string is set small and centered. |

## The plus menu

+ opens a menu. Built in, it holds **Add files & photos** (when the chat takes attachments) and **Workflows**, the workflow picker in a panel with a search field. Pass `menu` a function to change it: it receives the built-in items and returns the menu, so you can add your own, reorder, disable or hide any of them. Items in different `group`s are ruled off from each other.

An item can open a panel beside it: a list of actions, or a picker over a value you own. Inside a panel, any row can hold `children`, which open in place under it, to any depth: folders and files, say. Give the children up front, or as a function that loads them the first time the folder opens.

```tsx
import { FolderSimplePlusIcon, NutIcon } from '@neofloai/atoms/icons';
import { AgenticChat, type ChatAdapter, type ComposerPickerItem } from '@neofloai/atoms/chat';
import { useState } from 'react';

// `api` stands for your own backend client.
const folders: ComposerPickerItem[] = [
  { id: 'bank', label: 'Bank statements', trailing: 5, children: () => api.listFolder('bank') },
  { id: 'close', label: 'September close', trailing: 2, children: () => api.listFolder('close') },
  { id: 'q3', label: 'Q3 target revenue.pdf' },
];

export function Chat({ adapter }: { adapter: ChatAdapter }) {
  const [files, setFiles] = useState<string[]>([]);
  const [tools, setTools] = useState(['web']);
  return (
    <AgenticChat
      adapter={adapter}
      // The chat doesn't send what is picked: send it the way your backend wants, here as context.
      workflowContext={() =>
        files.length ? [{ workflow_name: 'ip', workspace_id: ['ws_finance'], context: { files } }] : undefined
      }
      composerProps={{
        menu: (builtIns) => [
          ...builtIns, // attach, then workflows
          {
            id: 'folder',
            label: 'Folder',
            icon: <FolderSimplePlusIcon />,
            submenu: {
              searchable: true,
              searchPlaceholder: 'Search 17 files',
              picker: { items: folders, value: files, onChange: setFiles, cards: true },
            },
          },
          {
            id: 'tools',
            label: 'Tools',
            icon: <NutIcon />,
            submenu: {
              picker: {
                items: [
                  { id: 'web', label: 'Web search' },
                  { id: 'erp', label: 'ERP', disabled: true },
                ],
                value: tools,
                onChange: setTools,
              },
            },
          },
        ],
      }}
    />
  );
}
```

- **Folders open in place.** Clicking a folder's row, or →, opens it; ← closes it, or steps back to its folder. Its checkbox, or Space, ticks it.
- **A ticked folder stands for everything in it.** Its own id goes in `value` and its contents' don't, so files added to it later are covered. Unticking one file breaks the folder into the rest; ticking every file in a folder rolls them up into it. A folder with only some of its contents ticked shows a dash.
- **Search** finds rows in every folder that has been given or opened, and opens the way to them.
- **`cards: true`** shows what is picked as cards in the composer, beside any attached files, each with × to take it out. Leave it off for a setting like the workflows.
- **`maxDepth`** stops folders opening below a depth; a folder at the limit can still be ticked.
- **Hide or disable anything.** `hidden: true` leaves an item or row out; `disabled: true` shows it but stops it being chosen. Both work at every level, built-ins included: `builtIns.map((item) => (item.id === 'workflows' ? { ...item, disabled: true } : item))`.
- **No menu at all.** `menu: false` makes + attach files directly and puts the workflows back in the row as a pill. With every item hidden, + hides too.

Attached and dropped files show as the same cards: a tile for the file type, the name, and what it is (Spreadsheet, PDF document, Image, Document, Folder). `labels.fileKind` changes those words.

## Theming and copy

- **Theming.** Everything reads Atoms tokens, so it follows `NeofloThemeProvider`, including light and dark. Don't restyle the internals with CSS overrides. If Atoms lacks something, request it in Atoms.
- **Copy.** `labels` overrides any string. See `defaultLabels` for the full list.
