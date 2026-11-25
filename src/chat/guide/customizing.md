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

## Composer controls

The composer's bottom row has two optional slots, plus the place of the built-in workflow picker. Pass them to `ChatComposer`, or through `composerProps` on `<AgenticChat>`:

| Prop | Where it goes | Use it for |
| --- | --- | --- |
| `leadingActions` | Left, after the attach button and the workflow picker | A tools or data-source picker, a mode switch |
| `extraActions` | Right, before Send | A model picker, a mic |
| `scopePicker` | Left, after the attach button | Omit it for the built-in workflow picker (it hides itself when there's no workflow catalog), pass your own node to replace it, or `false` to hide it |

`ComposerPicker` is the pill-and-menu control the workflow picker is built from. It's controlled and knows nothing about what its items mean, so it works for tools, models, data sources or anything else:

```tsx
import { MenuItem } from '@neofloai/atoms';
import { AgenticChat, ComposerPicker, type ChatAdapter } from '@neofloai/atoms/chat';
import { useState } from 'react';

export function Chat({ adapter, openToolSettings }: { adapter: ChatAdapter; openToolSettings: () => void }) {
  const [tools, setTools] = useState(['web', 'docs']);
  const [model, setModel] = useState(['balanced']);
  return (
    <AgenticChat
      adapter={adapter}
      composerProps={{
        leadingActions: (
          <ComposerPicker
            name="Tools"
            groups={[
              {
                id: 'tools',
                label: 'Tools',
                selectAll: true, // the heading selects or clears the group ("Select all" / "Deselect all")
                items: [
                  { id: 'web', label: 'Web search' },
                  { id: 'docs', label: 'Documents', description: 'Files uploaded to this workspace' },
                ],
              },
            ]}
            value={tools}
            onChange={setTools}
            footer={(close) => (
              <MenuItem
                onClick={() => {
                  close();
                  openToolSettings();
                }}
              >
                Tool settings…
              </MenuItem>
            )}
          />
        ),
        extraActions: (
          <ComposerPicker
            name="Model"
            multiple={false}
            items={[
              { id: 'fast', label: 'Fast' },
              { id: 'balanced', label: 'Balanced' },
            ]}
            value={model}
            onChange={setModel}
          />
        ),
      }}
    />
  );
}
```

| `ComposerPicker` prop | What it does |
| --- | --- |
| `name` | What is picked ("Tools"). Labels the trigger and sets the default summary: "All tools", "Tools (2)", "No tools". |
| `groups` / `items` | The choices, in groups with an optional `label` heading, or one plain list. Item ids must be unique across the picker. |
| `value` / `onChange` | The selected item ids. |
| `multiple` | `true` (default): checkboxes, and the menu stays open. `false`: one choice, which closes the menu and shows on the trigger. |
| `group.selectAll` | The group's heading also selects or clears its items, and says which on its right. |
| `item.description`, `icon`, `disabled` | A second line, a 16px glyph, or an item that can't be changed (select-all leaves it as it is). |
| `triggerLabel` | Your own trigger text instead of the summary. |
| `footer` | Under a rule at the bottom of the menu, for example a `MenuItem` that opens your own dialog. A function receives `close`. |
| `disabled`, `loading`, `menuMinWidth` | Self-explanatory. `loading` disables the trigger. |

The picker only holds the selection; deciding what it changes is up to you. To make it drive the chat, call the chat's actions in `onChange`, for example `setModel(id)` or `setDefaultSources(...)` from `useChatActions()` with the backend's `config.models` and `config.sources` from `useChatConfig()`. The summary strings come from `labels.pickerSummary`, `labels.pickerSelectAll` and `labels.pickerDeselectAll`. The picker also works outside a `ChatProvider`, with the default strings.

## Theming and copy

- **Theming.** Everything reads Atoms tokens, so it follows `NeofloThemeProvider`, including light and dark. Don't restyle the internals with CSS overrides. If Atoms lacks something, request it in Atoms.
- **Copy.** `labels` overrides any string. See `defaultLabels` for the full list.
