Find the symptom in the left column; the fix is beside it.

| Symptom | Fix |
| --- | --- |
| `Cannot find module ./dist/index.mjs` from Atoms | Your install skipped scripts. Remove `--ignore-scripts`. |
| `git: not found` in CI or Docker | Install git in the image: `apk add --no-cache git`. |
| The chat has no height, or never scrolls | Give its container a height (`height: 100vh`, or a flex child with `min-height: 0`). |
| Wrong fonts or colors, plus a console warning about `NeofloThemeProvider` | Mount `NeofloThemeProvider` once at the root. |
| An "Unsupported content: …" box | The backend sent a block type nothing renders. Register a `defineBlock` for it ([custom blocks](/chat/custom-blocks)). The box only shows in development. |
| Cards do nothing when clicked | Handle `onAction`. Cards emit, and your app decides. |
| A 401 loop | Return `false` from `onUnauthorized` when the refresh fails. The error then surfaces instead of retrying. |
| No attach button, scope picker, Archive or approval cards | The backend's config turns them off. Check `useCapabilities()`, or the config endpoint's `capabilities`. |
| A connection error with no Reconnect button | Pass `onConnectionRequired`. Without it the chat can only show the message. |
| A tool card says "Interrupted" | The reply ended without that tool's `tool_result`. Every `tool_use` needs exactly one, including on error. |
