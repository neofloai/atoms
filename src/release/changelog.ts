import type { Release } from './types';

/**
 * Every published release, newest first.
 *
 * Hand-written rather than generated from commits. A commit log says what
 * changed in the repo; a release note says what changed for someone who
 * installed the package, and those are different lists -- most commits
 * here move docs, data or the MCP server and are invisible to a consumer.
 *
 * One entry per version, added in the same commit that bumps
 * `package.json` and `ATOMS_VERSION`. `scripts/generate.ts` fails the
 * build if the newest entry here and the package version disagree.
 *
 * Keep `scope` populated on any line that moves a component's API. It is
 * what lets `check_version` tell a caller which of the things they are
 * about to use changed since their install, without a `since` field on
 * every component.
 */
export const RELEASES: readonly Release[] = [
  {
    version: '4.5.0',
    tag: 'v4.5.0',
    date: '2026-11-26',
    headline:
      'The chat is redrawn. The empty chat leads with the Neoflo mark, the greeting and the composer, with removable prompt rows under it; answers get a row of thumbs up and down, copy, ask again and the time; the composer\'s + opens a two-level menu you configure; and an optional rail puts New chat, History and Search on the right. The type scale gains `body0` (14/22) and the Scope One display face.',
    summary:
      'A minor release; nothing is removed or renamed, and an app with a chat sees the new look on upgrade with no code change. Three defaults move, so check a chat you customised: the workflow picker is now a submenu of + rather than a pill in the row (`composerProps={{ menu: false }}` puts the pill back); Send appears only once there is something to send, so a test that looked for a disabled Send button should look for none; and the composer under the greeting is replaced by a docked one on the first send, so a test holding the textarea should query it again. The chat standard moves to revision 1.3, which adds one optional field: a suggested prompt may name its `icon` from a fixed list. A backend on 1.2 needs no change. Scope One adds `@fontsource/scope-one`, one weight, loaded by `NeofloThemeProvider` like the other brand fonts.',
    changes: [
      {
        kind: 'added',
        summary:
          'A type rung above `body1`: `variant="body0"`, 14px on 22px, Regular, from `typography.body.b0`. It renders a `<p>`, like `body1`. The chat sets its composer, prompts, answers and the user\'s message in it.',
        scope: ['Typography', 'body0', 'typography'],
      },
      {
        kind: 'added',
        summary:
          'Scope One, the display serif, as `fontFamilies.product.display`: self-hosted and loaded by `NeofloThemeProvider`. It ships Regular only, so set it with `weight="regular"`. The chat\'s greeting uses it at `h3` size.',
        scope: ['fontFamilies', 'NeofloThemeProvider'],
      },
      {
        kind: 'changed',
        summary:
          'The empty chat: the Neoflo mark, the server\'s greeting in Scope One, the composer (three lines, growing to 18) and the suggested prompts share one 640px column. Prompts are rows with an icon instead of pills, and a prompt\'s × removes it in every new chat on that device. With your own `Welcome` slot the composer stays docked under it, as before.',
        scope: ['AgenticChat', 'WelcomeScreen', 'ChatSuggestions'],
      },
      {
        kind: 'changed',
        summary:
          'The composer: an 8px radius and a soft blue glow that widens while someone types, built from `surface.primary` tokens; an Enter-arrow Send that appears only when there is something to send; a slim scrollbar past the last row. Docked under a conversation it is one row — +, the input, your controls, Send — with its edges on the messages\' column, and a string `footer` is set small and centered as a disclaimer.',
        scope: ['ChatComposer'],
      },
      {
        kind: 'added',
        summary:
          'The + menu, `ChatComposer`\'s `menu`: Add files & photos, then Workflows in a searchable panel, by default. A function receives those items and returns the menu, to add your own, reorder, disable or hide any of them, at every level. An item opens a panel of actions or a picker over your value, and inside it any row can hold `children` that open in place to any depth, given up front or loaded on first open: folders and files. A ticked folder stands for everything in it, a part-chosen one shows a dash, and search reaches into every folder it knows. `cards: true` shows a picker\'s choices as cards in the composer. `false` turns the menu off, so + attaches directly and the workflows are a pill again. `ComposerPickerItem` gains `children`, `hidden`, `trailing` (a count) and `searchText`; `ComposerPicker` gains `maxDepth`.',
        scope: ['ChatComposer', 'ComposerMenu', 'ComposerMenuItem', 'ComposerPicker'],
      },
      {
        kind: 'changed',
        summary:
          'Files in the composer are cards rather than tags: a tile for the type, the name, and what it is (Spreadsheet, PDF document, Image, Document, Folder), with × to take it out. `FileCard` takes `folder`, `kind` and `icon`, the same card shows a sent message\'s attachments, and `labels.fileKind` names the kinds.',
        scope: ['FileCard', 'ChatComposer', 'ChatLabels'],
      },
      {
        kind: 'changed',
        summary:
          'Answers are set in `body0`, with 36px between turns. The user\'s message is a borderless `surface.primary.subtleHover` bubble with an 8px radius, capped at 70% of the column (510px at the default width).',
        scope: ['AssistantTurn', 'UserTurn'],
      },
      {
        kind: 'added',
        summary:
          '`turnActions` on `<AgenticChat>`, the row under each answer: thumbs up and thumbs down when you pass `onFeedback` (thumbs down asks for an optional issue type and details first, and the chat thanks the user when it resolves), copy, ask again, `extra` buttons of your own (`TurnActionButton`), and when it was given. Each part can be turned off, or the row with `false`.',
        scope: ['AgenticChat', 'TurnActions', 'TurnActionButton', 'TurnFeedback'],
      },
      {
        kind: 'added',
        summary:
          '`navigation="rail"` on `<AgenticChat>`: no header bar, and a rail on the right with New chat, History and Search; the history opens there, and Search opens it with its field focused. `railFooter` takes your own buttons. The header stays the default.',
        scope: ['AgenticChat', 'ChatRail'],
      },
      {
        kind: 'added',
        summary:
          'The app bar\'s title. `NavbarTitle` now takes the style of the bar it sits in: in the 48px `sm` app bar it is one line at `body0` in body ink, after the sidebar toggle, and in the `md` page header it is the page title it was. It shows whatever you pass, a page name such as "Home" or the chat on screen. `onTitleChange` on `<AgenticChat>` reports the conversation\'s title and id as they change, so the bar can name the chat. A `NavbarTitle` already in a `sm` bar takes the smaller style; `size="md"` keeps the old one.',
        scope: ['NavbarTitle', 'Navbar', 'AgenticChat'],
      },
      {
        kind: 'added',
        summary:
          'Chat standard revision 1.3: `suggested_prompts[].icon`, optional, one of `SUGGESTION_ICONS` (`sparkle`, `inbox`, `warning`, `chart`, `trend`, `document`, `receipt`, `money`, `vendor`, `calendar`, `clock`, `check`, `search`). A missing or unknown name shows `sparkle`. The conformance check fails an icon that is not a string and warns about a name outside the list. The mock backend\'s prompts carry icons.',
        scope: ['@neofloai/atoms/chat/core', 'SUGGESTION_ICONS', 'SuggestionIcon', 'runConformance'],
      },
      {
        kind: 'added',
        summary:
          'For your own layouts: `ChatComposer` takes `placement` and `minRows`; `WelcomeScreen` takes `composer`; `ChatSuggestions` takes `removable` and `sx`; `ChatHistory` takes `autoFocusSearch`; `suggestionGlyph(name)` gives a prompt\'s icon. New labels for the welcome, the + menu, feedback, ask again and `timeAgo` — a full translation typed as `ChatLabels` needs them.',
        scope: ['ChatComposer', 'WelcomeScreen', 'ChatSuggestions', 'ChatHistory', 'suggestionGlyph', 'ChatLabels'],
      },
    ],
  },
  {
    version: '4.4.0',
    tag: 'v4.4.0',
    date: '2026-11-26',
    headline:
      'The backend conformance check moves into Atoms, as `@neofloai/atoms/chat/conformance` and the `atoms-chat-conformance` command, so a backend is checked against the same engine the chat runs on.',
    summary:
      'A minor release; nothing is removed or renamed, and an app bundles exactly what it did before. The check calls a backend the way `<AgenticChat>` will and reports every gap against the Neoflo chat standard. It shipped in `agentic-chat-ui`, which is being retired, and there it checked against a frozen copy of the chat engine. It now runs on Atoms\' own engine, needs nothing but Node, and a backend team runs it without adding Atoms to its dependencies: `npx --package=github:neofloai/atoms#semver:^4.4.0 atoms-chat-conformance --base-url <url>`. It imports no package, and neither the root entry nor `/chat` carries it, which the build proves.',
    changes: [
      {
        kind: 'added',
        summary:
          '`@neofloai/atoms/chat/conformance`: `runConformance`, `formatReport` and `runConformanceCli`, to check a chat backend from code. No React and no dependencies, so it runs in a backend\'s CI or a Node test.',
        scope: ['@neofloai/atoms/chat/conformance', 'runConformance', 'formatReport'],
      },
      {
        kind: 'added',
        summary:
          'The `atoms-chat-conformance` command, the package\'s first: `--base-url`, `--header` (or `CHAT_BASE_URL` and `CHAT_HEADERS`), `--no-messages` for a run that must not call the model, and `--json`. It exits 1 when a check fails.',
        scope: ['atoms-chat-conformance'],
      },
      {
        kind: 'changed',
        summary:
          'Coming from `agentic-chat-ui`: replace `npx --package=github:neofloai/agentic-chat-ui#semver:^0.3.0 agentic-chat-conformance` with `npx --package=github:neofloai/atoms#semver:^4.4.0 atoms-chat-conformance`, and `@neofloai/agentic-chat/conformance` with `@neofloai/atoms/chat/conformance`. The options and the report are the same.',
        scope: ['@neofloai/atoms/chat/conformance', 'atoms-chat-conformance'],
      },
      {
        kind: 'changed',
        summary:
          'The docs\' "Checking a backend" page and `get_chat` topic `conformance` give the new command and import, and the chat overview lists the fifth subpath.',
        scope: ['docs', 'get_chat'],
      },
    ],
  },
  {
    version: '4.3.0',
    tag: 'v4.3.0',
    date: '2026-11-25',
    headline:
      'The agentic chat moves into Atoms. `<AgenticChat>` — streaming answers, history, approval cards, tool activity, tables, charts and your own cards, against any backend on the Neoflo chat standard — now installs with the design system it is built from, from `@neofloai/atoms/chat`. The docs have a Chat section and the MCP server a `get_chat` tool.',
    summary:
      'A minor release; nothing is removed or renamed, and an app without a chat changes in no way at all. The chat was `@neofloai/agentic-chat`, a separate package that followed every Atoms major a release behind. It now lives in `src/chat/` and ships from four subpaths: `@neofloai/atoms/chat` (the UI, the kit for custom cards, and the headless engine under them), `/chat/core` and `/chat/mock` (no React, so server code can import them) and `/chat/charts`. Its own dependencies — `react-markdown`, `remark-gfm` and `@radix-ui/react-slot`, plus `recharts` for charts — are optional peers: install them in the app that renders a chat, and an app that never imports these paths never resolves them. The root entry reaches none of them, which the build now proves. The backend conformance check stays a standalone CLI in `agentic-chat-ui`, so a backend team does not install the design system to run it.',
    changes: [
      {
        kind: 'added',
        summary:
          '`@neofloai/atoms/chat`: `<AgenticChat>` and every part it is composed of (`ChatThread`, `ChatComposer`, `ComposerPicker`, `ChatHistory`, `ChatHeader`, `WelcomeScreen` and the rest), the built-in blocks, the kit for custom cards (`BlockShell`, `KeyValueList`, `Shimmer`, `defineBlock`), and the headless engine — `createRestAdapter`, `createChatRuntime`, `ChatProvider`, the hooks and the primitives. Needs `react-markdown`, `remark-gfm` and `@radix-ui/react-slot` in the app.',
        scope: ['@neofloai/atoms/chat', 'AgenticChat', 'ComposerPicker', 'defineBlock', 'createRestAdapter'],
      },
      {
        kind: 'added',
        summary:
          '`@neofloai/atoms/chat/core` (the engine and the chat standard\'s types, framework-free), `@neofloai/atoms/chat/charts` (`chartBlock` on Recharts, coloured from the Atoms ramps) and `@neofloai/atoms/chat/mock` (an in-memory backend on the standard, for building before the API exists, tests and demos).',
        scope: ['@neofloai/atoms/chat/core', '@neofloai/atoms/chat/charts', '@neofloai/atoms/chat/mock'],
      },
      {
        kind: 'changed',
        summary:
          'Coming from `@neofloai/agentic-chat`: replace `@neofloai/agentic-chat` and `/headless` with `@neofloai/atoms/chat`, and `/core`, `/charts` and `/mock` with `@neofloai/atoms/chat/core`, `/chat/charts` and `/chat/mock`. The API is the same. Install `react-markdown remark-gfm @radix-ui/react-slot` (and `recharts` if you use charts) and remove the old package.',
        scope: ['@neofloai/atoms/chat'],
      },
      {
        kind: 'added',
        summary:
          'A Chat section in the docs: the chat running live on the mock backend, every block and shell part in every state, and a page per topic — configuration, blocks, custom blocks, customizing, history and persistence, human-in-the-loop, headless, the mock backend, troubleshooting, and for backend teams the backend contract, the block contracts, the conformance check and the open points in the standard.',
        scope: ['docs'],
      },
      {
        kind: 'added',
        summary:
          '`get_chat` on the MCP server serves that guide one topic at a time, from the same text as the docs, and withholds its code from a project on an Atoms without the chat. `search_docs` finds chat topics by their own words, `list_components` names the chat beside the patterns, and `get_component` answers `AgenticChat`, `ComposerPicker` or "copilot" with a pointer to `get_chat` instead of "not found".',
        scope: ['get_chat', 'search_docs', 'list_components', 'get_component'],
      },
    ],
  },
  {
    version: '4.2.0',
    tag: 'v4.2.0',
    date: '2026-11-25',
    headline:
      'The account menu and the workspace switcher ship as components, so the shell every app starts from — and every new project — has both: the user at the end of the top bar, the workspace at the foot of the sidebar. The MCP server now understands the words people use for them.',
    summary:
      'A minor release; nothing is removed or renamed. `AccountMenu` is the avatar at the end of the `Navbar` and the dropdown it opens — the user, your rows, a System / Light / Dark switch and Sign out. `WorkspaceSwitcher` is the footer of the `Drawer`\'s rail and the list it opens upwards. Until now both were copy-paste examples on `Menu` that stopped tracking the design system the day they were pasted. The dashboard pattern and both app templates use them, so a new project opens with the shell complete. On the MCP side, `search_docs` matches a query word by word and ranks the hits, so "navbar sidebar" or "account dropdown" finds what it names instead of nothing, and `get_component` resolves a name in any case or by its everyday word — `Sidebar` returns `Drawer`.',
    changes: [
      {
        kind: 'added',
        summary:
          '`AccountMenu`: the signed-in user\'s avatar for the trailing edge of the `Navbar`, and the 240px panel it opens — name, address and role tag; the rows you pass as children, which close the menu when chosen; a System / Light / Dark switch wired to the theme provider; and Sign out in the `error` tone when `onSignOut` is given. Renders its own trigger and holds its own open state. `labels` translates the words it draws itself.',
        scope: ['AccountMenu'],
      },
      {
        kind: 'added',
        summary:
          '`WorkspaceSwitcher`: the footer of the sidebar — the current workspace\'s square avatar and name behind a rule — and the list it opens upwards, with the current workspace filled and checked and Create workspace behind a rule when `onCreate` is given. Controlled with `value` / `onChange` or left to hold its own state; `collapsed` folds it to the avatar for a 64px rail.',
        scope: ['WorkspaceSwitcher'],
      },
      {
        kind: 'changed',
        summary:
          'The "Account menu" and "Workspace switcher" examples on `Menu`, which had to be copied whole, are replaced by `AccountMenu` and `WorkspaceSwitcher`. Code copied from them still works; swap it for the components to pick up later fixes.',
        scope: ['Menu', 'AccountMenu', 'WorkspaceSwitcher'],
      },
      {
        kind: 'changed',
        summary:
          'The dashboard pattern\'s app bar ends in `AccountMenu`, and its rail\'s footer is `WorkspaceSwitcher` instead of 150 hand-written lines.',
        scope: ['get_pattern', 'dashboard'],
      },
      {
        kind: 'changed',
        summary:
          'Both app templates open with the shell complete: `AccountMenu` at the end of the top bar and `WorkspaceSwitcher` at the foot of the sidebar, with the sample user and workspaces in `app/layout/account.ts`. They install `^4.2.0`.',
        scope: ['scaffold_app', 'templates/react', 'templates/prototype'],
      },
      {
        kind: 'changed',
        summary:
          '`search_docs` matches each word of a query on its own and ranks the hits, best first. A query that names two things ("navbar sidebar") finds both, where it used to need the whole phrase in one component\'s text and returned nothing.',
        scope: ['search_docs'],
      },
      {
        kind: 'changed',
        summary:
          '`get_component` takes a name in any case (`navbar`, `account-menu`) or the everyday word for a component (`Sidebar` returns `Drawer`, `Topbar` returns `Navbar`) and says what it resolved to. A word two components share returns both to choose from. `list_components` shows each component\'s everyday names beside it.',
        scope: ['get_component', 'list_components'],
      },
    ],
  },
  {
    version: '4.1.0',
    tag: 'v4.1.0',
    date: '2026-10-27',
    headline:
      'Every new React app starts from an Atoms template — a full one for a project, a lighter one for a prototype — with a fixed structure and rules for the agents that build in it. Apps now ship only the components they import.',
    summary:
      'A minor release; nothing is removed or renamed. `scaffold_app` copies a template instead of wiring a Vite app step by step. A new React project gets the full one: Vite, React Router, TanStack Query, Vitest, oxlint and oxfmt. A prototype gets a lighter one: Vite, React Router and oxlint, with sample data held in React state and nothing that needs a network. Both arrive with the provider, brand, rail and an example feature in place, laid out in the same four layers that import only downwards. The structure and its rules ship in each project as `AGENTS.md` and come back with every plan that creates one; oxlint fails the check on the ones it can see. Separately, the ESM build is now split per component, so an app that imports `Button` no longer ships DataGrid or the date pickers.',
    changes: [
      {
        kind: 'added',
        summary:
          'A React template at `templates/react`, which `scaffold_app` copies at the release tag for a new React project: Vite, strict TypeScript, React Router with lazy pages, TanStack Query, Vitest, oxlint, oxfmt and CI, with `NeofloThemeProvider`, the favicons, the rail and an example `invoices` feature already wired.',
        scope: ['scaffold_app', 'templates/react'],
      },
      {
        kind: 'added',
        summary:
          'A prototype template at `templates/prototype`, which `scaffold_app` copies when `framework` is `"prototype"` — what `start_project` now resolves every prototype to. Vite, strict TypeScript, React Router and oxlint, with no TanStack Query, HTTP client, test runner or formatter. Each feature\'s sample data seeds a provider mounted above the router, so an approval on one screen still shows on the next and a reload resets the demo; oxlint rejects `fetch`, data-fetching libraries and global stores.',
        scope: ['scaffold_app', 'start_project', 'templates/prototype'],
      },
      {
        kind: 'added',
        summary:
          'A project structure and the rules for working in it: four layers (`app → pages → features → shared`) that import only downwards, one shape for every feature, and rules on data, routing, UI and when work is done. They ship in each project as `AGENTS.md` (imported by `CLAUDE.md`), come back with every `scaffold_app` and `start_project` plan for a new React project or a prototype, and are on the Start a project page. Ten are enforced by oxlint in each template.',
        scope: ['scaffold_app', 'start_project', 'templates/react', 'templates/prototype'],
      },
      {
        kind: 'changed',
        summary:
          'The ESM build is split per component. `dist/index.mjs` re-exports from chunks, so a bundler drops every component an app does not import: an app using `Button` alone no longer ships DataGrid, the date pickers, `Stepper` or `Slider`. The template\'s first load fell from 1.57 MB to 458 KB. The CommonJS build, the four entry points and their types are unchanged.',
        scope: ['@neofloai/atoms'],
      },
      {
        kind: 'changed',
        summary:
          'A prototype keeps its sample data in each feature\'s `mocks/` folder, in the shape the real API returns, rather than in one `src/data.ts`, and holds it in React state through the feature\'s provider.',
        scope: ['start_project', 'templates/prototype'],
      },
    ],
    migration: [
      'Nothing has to change in an existing app. Upgrade and rebuild; the bundle gets smaller on its own.',
      'If your app lists `sideEffects` in its own `package.json`, make sure any module that has to run on import is listed — the split relies on the bundler being allowed to drop what is unused.',
    ],
  },
  {
    version: '4.0.1',
    tag: 'v4.0.1',
    date: '2026-10-27',
    headline: 'The sidebar rail is 216px wide, down from 220.',
    summary:
      'A patch release. Nothing is added, removed or renamed. `Drawer size="sm"`, the app sidebar, is 216px, and the resize handle\'s floor moves with it, so `SIDEBAR_MIN_WIDTH_PX` is 216. The ceiling stays 320.',
    changes: [
      {
        kind: 'changed',
        summary:
          '`Drawer` `size="sm"` is 216px where it was 220, and `useSidebarToggle` starts the sidebar there. `SIDEBAR_MIN_WIDTH_PX` is 216, so a drag stops at the new width; `SIDEBAR_MAX_WIDTH_PX` stays 320. The page beside the rail gains 4px.',
        scope: ['Drawer'],
      },
    ],
    migration: [
      'Nothing has to change. Check any layout that hard-codes 220 to line something up with the rail; read `SIDEBAR_MIN_WIDTH_PX` instead, or 216.',
    ],
  },
  {
    version: '4.0.0',
    tag: 'v4.0.0',
    date: '2026-10-27',
    headline:
      '`Chip` is now `Tag`, redrawn as a label rather than a control. `Button` gains a split button, `TextField` gains a password variant and a loading state, and a tab\'s count follows its selection.',
    summary:
      'A breaking release, and TypeScript finds every part of it: `Chip` and its six types are renamed to `Tag`, and the props that made it a control are gone. A tag is now always the small label: 20px at `md`, 18px at `sm`, eight colour roles, `contained` or `outline`, with an optional glyph on either side. The rest is additive or visual. `Button` takes `menu` for a split button. `TextField` takes `type="password"` for a show / hide toggle, a checklist of password rules and a forgot-password link, and `loading` for a skeleton. Its input is 13px and its helper text 11px, which `Select`, `DatePicker` and `TimePicker` share. No token was renamed or retuned.',
    changes: [
      {
        kind: 'breaking',
        summary:
          '`Chip` is renamed `Tag`, and `ChipProps`, `ChipVariant`, `ChipAppearance`, `ChipSize`, `ChipColors` and `ChipColorValue` become `TagProps`, `TagVariant`, `TagAppearance`, `TagSize`, `TagColors` and `TagColorValue`. No alias is kept.',
        scope: ['Tag'],
      },
      {
        kind: 'breaking',
        summary:
          '`Tag` is a label, not a control. `onClick`, `onDelete`, `deleteIcon`, `clickable`, `avatar`, `disabled`, `selected` and `dense` are removed, and so is the 36px pill that `Chip`\'s default `size="md"` drew. `size` is now `md` (20px, 12/16, the old `size="sm"` tag) or `sm` (18px, 11/14), and `md` is the default.',
        scope: ['Tag'],
      },
      {
        kind: 'breaking',
        summary:
          '`Tag` `bordered` is replaced by `appearance="outline"`, which now works on every role, and `variant="muted"` by `variant="secondary"`. The roles are `primary` (the default), `secondary`, `information`, `success`, `warning`, `error`, `orange` and `purple`.',
        scope: ['Tag'],
      },
      {
        kind: 'added',
        summary:
          '`Tag` `endIcon`: a 12px glyph after the label, to go with the leading `icon`. `colors` still recolours the fill, outline and label per key.',
        scope: ['Tag'],
      },
      {
        kind: 'added',
        summary:
          '`Button` `menu`: pass `MenuItem`s and the button becomes a split button. The label keeps its own `onClick`, and a caret beside it opens the menu, anchored to the whole control. `menuLabel` names the caret (default "More options"). Drawn for `primary` and `secondary`, `contained` and `outline`, at `sm`, `md` and `lg`.',
        scope: ['Button', 'Menu', 'MenuItem'],
      },
      {
        kind: 'added',
        summary:
          '`TextField` `type="password"`: the same field with a show / hide toggle at its end. `requirements` lists the rules a new password has to meet, crossed until met and ticked after; `forgotPassword` puts a link right-aligned under the field. `visible`, `defaultVisible` and `onVisibleChange` control the toggle, and `showPasswordLabel` / `hidePasswordLabel` name it. `autoComplete` defaults to `new-password` with `requirements` and `current-password` without. The `PasswordRequirement` type is exported.',
        scope: ['TextField'],
      },
      {
        kind: 'added',
        summary:
          '`TextField` `loading`: draws the field\'s skeleton in its place, with a bar only for each row the loaded field has and the field bar at the loaded height, so the form does not move when the value arrives.',
        scope: ['TextField'],
      },
      {
        kind: 'changed',
        summary:
          'Field type: the input is 13px where it was 14, and helper text is 11/14 Medium where it was 12/16 Regular. A field with helper text is 86px tall at `lg` and 82px at `md`. `Select`, `DatePicker` and `TimePicker` share the field and change with it.',
        scope: ['TextField', 'Select', 'DatePicker', 'TimePicker'],
      },
      {
        kind: 'changed',
        summary:
          '`Tab` `count` is the neutral `Tag` in every state, where it was `primary`. Only its number moves: `text/default/b1` on the selected tab, `text/default/subtle` on the others, and `text/disabled/default` on a disabled tab.',
        scope: ['Tab', 'Tabs'],
      },
    ],
    migration: [
      'Rename `Chip` to `Tag` in imports and JSX, and each `Chip*` type to `Tag*`. Upgrade, run `tsc` and fix each error: every removed prop is gone from the types.',
      'A `Chip` with `size="sm"` becomes a `Tag` with no `size`. Replace `bordered` with `appearance="outline"` and `variant="muted"` with `variant="secondary"`.',
      'A `Chip` left on its default `size="md"` was a 36px pill and is now a 20px tag. If it labelled something, that is the intent. If it was pressed, selected or deleted, it was a control and wants one: a `ToggleButtonGroup` for a set of filters, a `Button` for an action.',
      'Check any form that pinned a height to a field with helper text. The helper row is 4px shorter, so the field and its helper are 86 / 82px tall.',
    ],
  },
  {
    version: '3.3.0',
    tag: 'v3.3.0',
    date: '2026-10-21',
    headline:
      'The sidebar resizes and slides: drag its edge between 220 and 320px or click it to collapse, and hiding or showing it animates the way MUI\'s persistent drawer does.',
    summary:
      'A minor release. Nothing is removed or renamed. `useSidebarToggle` now returns `dockProps` for the docked sidebar, a `persistent` `Drawer` kept mounted, so the toggle slides the sidebar out and back while the page reflows alongside, where 3.2.0 removed it instantly. The sidebar\'s right edge is a handle: hovered, it shows a grip and "Click to collapse / Drag to resize"; a click collapses the sidebar and a drag resizes it. One behaviour change in `Drawer`: a closed `persistent` drawer now gives its space back to the page.',
    changes: [
      {
        kind: 'added',
        summary:
          '`useSidebarToggle()` returns `dockProps`, `resizeHandleProps`, `resizeTooltipProps`, `width` and `setWidth`, and takes `defaultWidth`, `minWidth` and `maxWidth`. Spread `dockProps` on the docked `Drawer` and keep it mounted; put `resizeHandleProps` on an empty element inside it, wrapped in a `Tooltip` given `resizeTooltipProps`. The edge shows a 4 x 32 grip on hover; a click collapses the sidebar, a drag of more than 3px resizes it between 220 and 320px, and the arrow keys step it 8px. The peek floats in at the docked width. Also exported: `SIDEBAR_MIN_WIDTH_PX`, `SIDEBAR_MAX_WIDTH_PX` and the `SidebarResizeHandleProps` type.',
        scope: ['Drawer', 'Tooltip'],
      },
      {
        kind: 'changed',
        summary:
          'Hiding the sidebar with `useSidebarToggle` slides it out on MUI\'s persistent-drawer timings (195ms `sharp` out, 225ms `easeOut` in) instead of unmounting it. Render the docked sidebar with `dockProps` rather than only while `hidden` is false; the old pattern still works, without the animation.',
        scope: ['Drawer'],
      },
      {
        kind: 'changed',
        summary:
          '`Drawer` `variant="persistent"`: when closed, the space it reserves now closes with the panel, on the same timings, so the content beside it reflows on its own. If you copied MUI\'s demo and move the content back with a negative margin, remove the margin, or the content moves twice.',
        scope: ['Drawer'],
      },
    ],
  },
  {
    version: '3.2.0',
    tag: 'v3.2.0',
    date: '2026-10-21',
    headline:
      'The app sidebar ships in the package: `List variant="nav"` draws the sidebar rows, and `useSidebarToggle` hides the sidebar on click and peeks at it on hover.',
    summary:
      'A minor release. Nothing is removed or renamed, and the default `List` is unchanged. The sidebar used to live only in the docs and the Dashboard pattern code; its rows are now a treatment of `List`, built the way MUI builds a navigation drawer, and its toggle is a hook. Nav rows are 28px with the label in `text/default/b2` and the glyph in `icon/default/b2`, 12px apart at both levels. The toggle hides the sidebar outright, and hovering it while hidden floats the sidebar in under the bar.',
    changes: [
      {
        kind: 'added',
        summary:
          '`List` `variant="nav"`: the app sidebar. Rows are 28px on 4px corners, 4px apart, 8px in, with the glyph 12px from the label. At rest the label is `text/default/b2` and the glyph `icon/default/b2`; `selected` is the current page on a `surface/default/2` fill in `b1` at Medium; `aria-current="true"` gives a parent row the same ink and weight with no fill. Hover and focus take `card 3`. A nested `List` inherits the variant and draws the second level 40px in behind a branch rule. `ListVariant` is exported.',
        scope: ['List', 'ListItemButton', 'ListItemIcon', 'ListItemText'],
      },
      {
        kind: 'added',
        summary:
          '`ListSubheader` in a `nav` list is the section label, 8px in and 8px above the first row. With `component="button"` it is the toggle that folds its section away, with a hover fill and room for a caret.',
        scope: ['ListSubheader', 'List'],
      },
      {
        kind: 'added',
        summary:
          '`useSidebarToggle()`: the app shell\'s sidebar toggle. `toggleProps` go on the toggle in the `Navbar` -- pressed, it hides the docked sidebar; hovered while hidden, it floats the sidebar in under the bar, 8px in, on 12px corners with a shadow. `peekProps` go on a second `temporary` `Drawer` holding the same navigation: no backdrop, no focus trap, closing 300ms after the pointer leaves or on `closePeek`. Also exported: `SIDEBAR_PEEK_GRACE_MS` and the `SidebarToggleProps`, `UseSidebarToggleOptions` and `UseSidebarToggleResult` types.',
        scope: ['Drawer', 'Navbar'],
      },
    ],
  },
  {
    version: '3.1.0',
    tag: 'v3.1.0',
    date: '2026-10-21',
    headline:
      '`Menu` and `MenuItem` follow the navigation redraw, `MenuItem` gains an `error` tone, `ListSubheader` is exported, and the `sm` `Navbar` gutter is 16px.',
    summary:
      'A minor release from the navigation sheet, which draws the top bar, the sidebar and their two dropdowns. Nothing is removed or renamed. Menus are tighter and flatter: 28px rows on 4px corners, a near-white panel on 8px corners, and a neutral fill for the selected row in place of the primary tint. New: a destructive `error` tone for rows such as Sign out, and `ListSubheader`, the mono label over a group of rows. The docs sidebar and top bar are rebuilt to the sheet.',
    changes: [
      {
        kind: 'changed',
        summary:
          '`Menu` has 8px corners (was 16) and a near-white panel (`surface.layers.page`; dark mode stays on `card 2`). Rows sit 4px apart, and a `Divider` between groups sits 8px from the rows on either side.',
        scope: ['Menu'],
      },
      {
        kind: 'changed',
        summary:
          '`MenuItem` rows are 28px (were 36) on 4px corners (were 8), with the glyph 12px from the label (was 4) and labels in B1 Medium. `selected` is a neutral `surface/default/2` fill that holds under the pointer, in place of the primary tint. A row that leads with a `size="sm"` `Avatar` grows to 40px. A `dense` row is 24px.',
        scope: ['MenuItem'],
      },
      {
        kind: 'added',
        summary:
          '`MenuItem` `variant="error"`: the destructive row, in `text/error/4` for both label and glyph -- Sign out, Delete.',
        scope: ['MenuItem'],
      },
      {
        kind: 'added',
        summary:
          '`ListSubheader`, the label over a group of rows: DM Mono Medium at 12/16 in caption ink. In a `Menu` it lines up with the item labels; as a `List` `subheader` it takes the rows\' 16px inset. `color` is removed from its props. `ListSubheaderProps` and `ListSubheaderTypeMap` are exported.',
        scope: ['ListSubheader', 'Menu', 'List'],
      },
      {
        kind: 'changed',
        summary:
          '`Navbar` `size="sm"` has a 16px inline gutter (was 24). `size="md"` is unchanged at 24.',
        scope: ['Navbar'],
      },
    ],
  },
  {
    version: '3.0.0',
    tag: 'v3.0.0',
    date: '2026-10-01',
    headline:
      'Button, the four form fields, the small chip, the toggle group and Avatar follow the October redraw. `appearance="prominent"` and `color="accent"` are removed.',
    summary:
      'A breaking release driven by the Product Design System redraw. Two values are gone, and TypeScript finds both: `Button`\'s `appearance="prominent"` (use `size="xl"`) and `Avatar`\'s `color="accent"` (the default is now `primary`). Everything else is additive or visual. Buttons are 4px shorter at every size, avatars are larger, and the text field, `Select`, `DatePicker` and `TimePicker` now share one field design with a new `lg` size. New: a social sign-in button, a segmented toggle group, a `muted` small chip, an `xs` avatar and eight avatar hues. No token was renamed or retuned.',
    changes: [
      {
        kind: 'breaking',
        summary:
          '`Button` `appearance="prominent"` is removed, along with its gradient. `size="xl"` replaces it: the same 48px box with a heading-sized label, flat-filled, on every `variant` and `appearance`.',
        scope: ['Button'],
      },
      {
        kind: 'breaking',
        summary:
          '`Avatar` `color="accent"` is removed and the default is `primary`. The roles are now the eight hues of the redraw -- `primary`, `purple`, `information`, `success`, `warning`, `orange`, `error`, `secondary` -- each a pale fill, a 0.5px hairline a step deeper and a dark ink. `primary`, `success`, `error` and `warning` were saturated fills with white text and are now pale.',
        scope: ['Avatar'],
      },
      {
        kind: 'changed',
        summary:
          '`Button` heights are 28 / 32 / 40 at `sm` / `md` / `lg` (were 32 / 36 / 44), with 8 / 12 / 16 side padding. The `md` glyph is 16px (was 20) and the `lg` label is 16/24. Outline borders on `primary` and `warning` move a rung, and every role keeps its own border while pressed. `IconButton` is unchanged.',
        scope: ['Button'],
      },
      {
        kind: 'added',
        summary:
          '`Button` `appearance="social"`, the sign-in button: a near-white card in a neutral hairline, neutral only. It defaults to `size="lg"` and to the Google mark, and `GoogleLogoColorIcon` is exported from `@neofloai/atoms/icons`.',
        scope: ['Button', '@neofloai/atoms/icons'],
      },
      {
        kind: 'changed',
        summary:
          '`TextField`, `Select`, `DatePicker` and `TimePicker` share one field design: 12px inset, 4px corners, a card-1 fill in a card-3 hairline and 14px input type. Focus is a full dark hairline (was a primary bottom edge), and a status tints the field and colours its border, helper text and adornments while the label stays neutral. Adornment glyphs are held at 16px.',
        scope: ['TextField', 'Select', 'DatePicker', 'TimePicker'],
      },
      {
        kind: 'added',
        summary:
          '`size` on `TextField`, `Select`, `DatePicker` and `TimePicker`: `md` (36px, the default) or `lg` (40px). The `TextFieldSize`, `SelectSize`, `DatePickerSize` and `TimePickerSize` types are exported.',
        scope: ['TextField', 'Select', 'DatePicker', 'TimePicker'],
      },
      {
        kind: 'changed',
        summary:
          'The 20px `Chip` tag pads 4px on every side (inline was 8) and labels in B2 Medium. With `bordered`, the `warning` and `orange` outlines move a rung, `primary`\'s fill deepens, and the `success`, `error` and `purple` labels darken a step. The delete glyph is 12px.',
        scope: ['Chip'],
      },
      {
        kind: 'added',
        summary:
          '`Chip` `variant="muted"`: a paler grey tag for metadata that should recede, such as a file type. It is drawn at `size="sm"` only.',
        scope: ['Chip'],
      },
      {
        kind: 'added',
        summary:
          '`ToggleButtonGroup` `appearance="segmented"`: labelled buttons on a grey track, with the selected one raised as a thumb. It comes in one size and is neutral only, so `size` and `color` do not apply. The joined `outline` group and the `text` toolbar are unchanged.',
        scope: ['ToggleButtonGroup', 'ToggleButton'],
      },
      {
        kind: 'changed',
        summary:
          '`Avatar` sizes are 44 / 36 / 24 at `lg` / `md` / `sm` (were 40 / 32 / 24), with Medium initials. `shape="mid"` is a 4px corner (was 8). A photo keeps only a neutral hairline, and the status dot is sized and placed for each size and shape.',
        scope: ['Avatar'],
      },
      {
        kind: 'added',
        summary: '`Avatar` `size="xs"`, 20px, for a single initial.',
        scope: ['Avatar'],
      },
    ],
    migration: [
      'Replace `appearance="prominent"` with `size="xl"` on `Button`. Keep `variant` and `appearance` as they were, or omit them for the primary contained default.',
      'Remove `color="accent"` from `Avatar`, or pick one of the eight hues. If you relied on the old saturated `primary`, `success`, `error` or `warning` avatar, they are now pale.',
      'TypeScript finds both: `prominent` and `accent` are no longer in the prop types. Upgrade, run `tsc` and fix each error.',
      'Check any layout that pinned a width or height to a button or an avatar. Buttons are 4px shorter at every size, and `lg` and `md` avatars are 4px larger.',
    ],
  },
  {
    version: '2.2.0',
    tag: 'v2.2.0',
    date: '2026-09-30',
    headline:
      'Development builds now name the token behind every colour, for the Atoms Inspector. Production builds are unchanged.',
    summary:
      'An additive release for the Atoms Inspector, the Chrome extension that inspects a running page for Atoms components and tokens. In a development build, every colour a component paints now carries the token it came from as a CSS custom property, which is how the inspector names tokens exactly and flags where an `sx`, a `style` or an outside stylesheet overrode one. Production and test builds carry none of it, and the build fails if a mark reaches one. One export was added, `atomsRegion`, and the patterns served by `get_pattern` use it -- so pattern code now needs 2.2.0. Nothing was renamed or removed, and no colour, size or spacing moved.',
    changes: [
      {
        kind: 'added',
        summary:
          'In a development build (`NODE_ENV=development`), every colour applied through the library\'s colour helpers writes `--atoms-<property>: "<token>"` beside its value, plus `--atoms-v` with the release that drew it. For example, `--atoms-background-color: "surface.primary.default"`. The marks follow every state the value does -- hover, focus, disabled -- and are CSS only, so nothing changes in the DOM and nothing needs hydrating. Production and test builds contain none of it: `npm run check:dev-marks` checks the built package, and `build:lib` fails if a mark gets through.',
      },
      {
        kind: 'added',
        summary:
          '`atomsRegion(pattern, region)` marks a region of a page so the Atoms Inspector can name it and export it on its own. Spread it onto the region\'s root, as in `<Stack {...atomsRegion(\'dashboard\', \'toolbar\')}>`. It returns `data-atoms-pattern` and `data-atoms-region` in a development build and an empty object otherwise, so it adds nothing to production markup.',
        scope: ['@neofloai/atoms'],
      },
      {
        kind: 'changed',
        summary:
          'The six patterns served by `get_pattern` mark their regions with `atomsRegion` (shell, navbar, title, toolbar, table, filter and so on). Because they import it, pattern code needs 2.2.0 or later, and `check_version` now treats anything older as unsupported for served code. No layout or component in a pattern changed.',
        scope: ['get_pattern'],
      },
      {
        kind: 'added',
        summary:
          '`build_from_json` is a new MCP tool. It reads an Atoms JSON export (`.atoms.json`, written by the Atoms Inspector and by Atoms Studio) and returns a React file built from Atoms components, layout primitives and tokens. It also lists the components to look up, the handlers left to wire, and each place the design went outside the library. Restyles of a component are left out of the code and listed as gaps, rather than copied back as `sx`.',
        scope: ['build_from_json'],
      },
    ],
    migration: [
      'Most projects only need the version bump: `npm install github:neofloai/atoms#semver:^2.2.0`. No export was renamed or removed, and nothing renders differently in production.',
      'Before pasting pattern code from `get_pattern`, upgrade: it imports `atomsRegion`, which 2.1.0 does not export. If you already pasted a pattern from an earlier release, it keeps working. Add `atomsRegion` to its regions only if you want the inspector to name them.',
      'In development, computed styles now include `--atoms-*` custom properties. This matters only for a test that compares full computed styles while running in development mode. Under `NODE_ENV=test` nothing is marked.',
    ],
  },
  {
    version: '2.1.0',
    tag: 'v2.1.0',
    date: '2026-09-23',
    headline:
      'The table and the tab bar are redrawn, and a monospace ships with them. Nothing to change in your code; a lot to look at.',
    summary:
      'An additive release that will not compile any differently and will not look the same. Nothing was renamed or removed -- five exports and four props were added -- but `Table`, `DataGrid` and `Tabs` were all redrawn against new design sheets, so a screen built on 2.0.0 comes out visibly different after the bump. The table is the biggest of the three: columns sit 32 apart where they sat 16, the header strip is taller and filled, rows are opaque and their text is Medium, and the hairline moved a rung darker. DM Mono is now self-hosted and real, which changes the face on anything already using `fontFamilies.product.mono`. Read the migration list before upgrading a screen with fixed column widths -- they are the one thing that needs a number changed.',
    changes: [
      {
        kind: 'changed',
        summary:
          '`Table` and `DataGrid` are redrawn. A cell is padded 16 either side where it was 8, and the row inset dropped from 16 to 8 to compensate -- so the edges are still 24 from the table, but two columns are 32 apart where they used to be 16. The header strip is 40 tall (was 32) and carries a `surface.layers.card2` fill, rows carry `surface.layers.page` where they were transparent, and the hairline is `border.layers.card3` -- one rung darker than before, under the header and between rows alike. The last row no longer draws one: a rule divides two rows, and the last row has nothing under it.',
        scope: ['Table', 'TableCell', 'TableRow', 'TableHead', 'DataGrid'],
      },
      {
        kind: 'changed',
        summary:
          'Body cells are Medium (500) where they were Regular (400), in both `Table` and `DataGrid`. This touches every cell in every table rather than one column, so it is the change most likely to be noticed after the header. A cell\'s second line -- `TableCell secondary` -- is 11/13 where it was 12/16, and now sits 2px under the first rather than hard against it.',
        scope: ['TableCell', 'DataGrid'],
      },
      {
        kind: 'changed',
        summary:
          '`TableCell`\'s `icon` slot is 14px (was 16) and changes four things depending on what it sits beside. Next to one line it centres, takes a 6px gap and `icon.default.b2`; next to two it tops out, drops 2px onto the first line\'s cap height, takes 8px and the quieter `icon.default.b3`. Only the size is the same in both. A grid has no `icon` slot, so a `renderCell` doing the same job has to make those four decisions itself.',
        scope: ['TableCell'],
      },
      {
        kind: 'fixed',
        summary:
          'A sortable column\'s header label rendered in DM Sans while the plain column beside it rendered in DM Mono. `TableSortLabel` set its own `font-family`, which beat the family it should have inherited from the header cell.',
        scope: ['TableSortLabel'],
      },
      {
        kind: 'changed',
        summary:
          '`TABLE_HEADER_ROW_HEIGHT_PX` is 40, and `DATA_GRID_HEADER_HEIGHT_PX` with it. The export did not move but its value did, so anything sizing a box from it -- `40 + rows * rowHeight` -- comes out 8px taller.',
        scope: ['Table', 'DataGrid'],
      },
      {
        kind: 'changed',
        summary:
          '`Tabs` is redrawn. A tab is 12/16 padded with a 16/20 label and no height floor at all, so the bar is as tall as its content. Selection changes colour only -- the weight no longer moves, which is what stops the row reflowing as selection travels along it -- and the indicator is a 1px square `border.layers.card5OnColor` rule flush to the bottom. Hover is now a `surface.layers.card2` fill rather than a promotion of the ink, so a hovered tab no longer reads as briefly selected.',
        scope: ['Tabs', 'Tab'],
      },
      {
        kind: 'added',
        summary:
          '`Tabs divider` turns off the bar\'s own bottom hairline, for a bar inside a container that already draws one. Two hairlines on the same edge do not read as a double line -- they read as one line of the wrong weight. Defaults to `true`, so nothing changes unless you ask.',
        scope: ['Tabs'],
      },
      {
        kind: 'added',
        summary:
          '`Button appearance="prominent"` -- the page\'s single call to action, 48 tall with a vertical gradient. Available on all five roles: the ramp is each role\'s own hover fill running into its resting fill, so it resolves in both colour schemes with nothing hardcoded. `size` does not apply to it.',
        scope: ['Button'],
      },
      {
        kind: 'added',
        summary:
          '`Chip bordered` outlines the 20px tag in its role\'s own border token -- the treatment a table\'s Status column uses. `size="sm"` only. The border is taken out of the inline padding, so a bordered chip is exactly as wide as a plain one and a column of mixed statuses still lines up.',
        scope: ['Chip'],
      },
      {
        kind: 'added',
        summary:
          '`Chip colors` overrides the fill, the outline and the label independently, for a status the semantic roles have no colour for. `size="sm"` only, each key optional and falling back to the `variant`. Takes a design token -- a `{ light, dark }` pair that resolves per scheme -- or a plain CSS colour, which is used in both. `ChipColors` and `ChipColorValue` ship with it.',
        scope: ['Chip', '@neofloai/atoms'],
      },
      {
        kind: 'changed',
        summary:
          'DM Mono is self-hosted and real. `fontFamilies.product.mono` used to fall through to whatever monospace the machine had; it now resolves to a shipped DM Mono at 400 and 500. Anything already set in that family changes face on upgrade. Table and grid header labels are set in it at Medium 12/16, which is what now tells a header from its data -- the face, rather than the weight.',
        scope: ['@neofloai/atoms/tokens', 'Table', 'DataGrid'],
      },
      {
        kind: 'added',
        summary:
          'Three constants that were being rebuilt at call sites: `TABS_HEIGHT_PX` (the bar has no height floor, so its 44 is an outcome rather than a setting), `TABLE_CELL_ICON_PX` (the `icon` slot is the caller\'s to fill, and this is the size to fill it at), and `tableAmountType` (the mono face and `tabular-nums` that line a money column up on its decimal -- pair it with `align="right"`).',
        scope: ['@neofloai/atoms'],
      },
      {
        kind: 'changed',
        summary:
          'The invoice workflow patterns served by `get_pattern` carry a seven-status vocabulary with a colour per status, row actions pinned to one width per column, and the Status facet in a filter drawn with the same chip its column draws. Pattern code only -- no component API moved for any of it.',
        scope: ['get_pattern'],
      },
    ],
    migration: [
      'Nothing has to change for this to compile. Every export that existed in 2.0.0 still exists with the same name and the same type, and the four new props all default to the old behaviour. What follows is what to look at, not what to fix.',
      'Check any table with fixed column widths. A cell gained 16px of padding, which comes straight out of the room a pinned column has for its content -- a `width: 140` column now holds 16px less than it did. Every fixed column in this repo\'s own patterns needed exactly 16 added back. Flex columns size themselves and need nothing.',
      'Check anything using `fontFamilies.product.mono`. It was falling through to the system monospace and is now a real DM Mono, so the face changes even though the token did not.',
      'Check any layout computing a height from `TABLE_HEADER_ROW_HEIGHT_PX` or `DATA_GRID_HEADER_HEIGHT_PX`. Both are 40 where they were 32.',
      'Check any table sitting on a surface other than the page. Rows are opaque now (`surface.layers.page`) where they used to show whatever was behind them, so a table on a card no longer takes the card\'s colour. Say so with `sx` on the row if that is what you wanted.',
      'Check any `Tabs` inside a container that draws its own bottom border -- you now want `divider={false}`, or you get two hairlines on one edge reading as a single heavy one.',
    ],
  },
  {
    version: '2.0.0',
    tag: 'v2.0.0',
    date: '2026-09-09',
    headline:
      'Font and icon colour tokens now carry the Figma variable names verbatim. Every one of them is renamed.',
    summary:
      'A breaking release with one reason behind it: until now the library renamed every font and icon colour on its way in from Figma, so `text/default/b2` was stored as `text.default.caption` and `text/primary/3` as `text.primary.accent`. The new names read better in isolation, which is why they lasted three releases -- but it meant the name a designer said in a review did not exist in the code, someone had to translate it by hand, and twice they translated it wrong and shipped the wrong colour. The translation layer is gone rather than documented. Every `text` and `icon` key is now the Figma variable name exactly: ask for `text/default/b2` and you write `text.default.b2`. No colour value moved -- all 78 rungs resolve to the same light and dark hex they did in 1.0.1 -- so this is a rename and nothing else, but it is a rename of every one of them and it will not compile until you do it. `Button` and `ToggleButton` also move to a 4px corner, which needs nothing from you.',
    changes: [
      {
        kind: 'breaking',
        summary:
          'Every `text` and `icon` token key is renamed to its Figma variable name. `text.default.caption` is `text.default.b2`, `text.primary.accent` is `text.primary[3]`, `text.disabled.onColor` is `text.disabled[\'on-color\']`. Three spellings now, because no single one is both exact and a valid identifier: bare names stay bare, pure numbers become bracket access, and anything with a space or hyphen has to be quoted. The migration note below lists all twelve rules.',
        scope: ['@neofloai/atoms/tokens'],
      },
      {
        kind: 'changed',
        summary:
          'No token value changed. Every renamed rung resolves to the same light and dark hex it did in 1.0.1, verified rung by rung in both directions -- 78 matched, nothing orphaned, nothing new. If a colour looks different after upgrading, it is a mis-migrated key rather than a retuned palette.',
        scope: ['@neofloai/atoms/tokens'],
      },
      {
        kind: 'changed',
        summary:
          '`Button` corners are 4px (`radius.xs`) where they were 8px. Nothing else about the component moves, and there is no prop for it -- the corner is the corner.',
        scope: ['Button'],
      },
      {
        kind: 'changed',
        summary:
          '`ToggleButton` and `ToggleButtonGroup` follow `Button` to 4px, including the corners the group hands back at `appearance="text"`. If you wrap a toggle group in a container with a pixel or two of padding, drop that container to 4px as well or a sliver of it shows outside the buttons.',
        scope: ['ToggleButton', 'ToggleButtonGroup'],
      },
      {
        kind: 'changed',
        summary:
          '`get_tokens` now prefixes `text`, `icon`, `surface` and `border` with a note saying how their keys are named -- which of them carry Figma names verbatim, which rename Figma\'s tier numbers, and which end of a numeric ladder is the darkest. An agent reading `"1": {...}` out of the raw JSON had no way to tell, and a guessed rung is a wrong colour that looks deliberate.',
        scope: ['get_tokens'],
      },
      {
        kind: 'changed',
        summary:
          '`theme.shape.borderRadius` is still 8px. Only the three controls named above moved, so anything inheriting a corner -- including your own `borderRadius: 1` -- is unaffected.',
      },
    ],
    migration: [
      'Rename every `text` and `icon` token you reference. Twelve rules cover all of them: `text.default.body` is now `text.default.b1`; `.caption` is `.b2`; `.placeholder` is `.b3`; `.headingOnColor`, `.bodyOnColor`, `.captionOnColor` and `.placeholderOnColor` become `text.default[\'heading on-color\']`, `[\'body on-color\']`, `[\'caption on-color\']` and `[\'placeholder on-color\']`. On every other role -- `primary`, `information`, `success`, `error`, `warning`, `orange`, `purple` -- `.body` is `[1]`, `.caption` is `[2]`, `.accent` is `[3]` and `.onColorHover` is `[4]`. `text.disabled.onColor` is `text.disabled[\'on-color\']`. `icon` renames identically. `heading`, `subtle` and `disabled.default` did not move.',
      'Two ladders start at 0 rather than 1, so `.body` on them is `[0]`, not `[1]`: `text.warning` and `text.orange`. `icon.orange` starts at 0 too, but `icon.warning` starts at 1 -- that asymmetry is in the Figma file and was carried through rather than normalised, because guessing which side is right would put the code out of step with the design either way.',
      'Do not run a blind find-and-replace on `text.primary` or `text.disabled`. Those are also MUI palette references, and `sx={{ color: \'text.primary\' }}` and `theme.palette.text.disabled` are correct and must not be touched. Anchor on three segments -- the token is always `text.<role>.<rung>` -- and check that the file imports `text` from `@neofloai/atoms/tokens` before rewriting anything in it.',
      'TypeScript will find the rest for you. The token objects are `as const`, so every stale key is a compile error rather than an `undefined` that renders as a missing colour at runtime. Upgrade, run `tsc`, and work the list.',
      'Nothing to do for the corner radius on `Button` or `ToggleButton` -- it is a visual change and it arrives with the upgrade. Worth a look at any toolbar where one of them sits beside an `IconButton`, `Chip`, `TextField` or `Select`: those are still on 8px, so the two corners no longer match.',
    ],
  },
  {
    version: '1.0.1',
    tag: 'v1.0.1',
    date: '2026-09-03',
    headline:
      'Importing anything from the package root no longer pulls in the whole Phosphor icon set.',
    summary:
      'One fix, and it is worth upgrading for on its own: an app that imported a single component from `@neofloai/atoms` was retaining the entire Phosphor icon set -- about 5 MB of icons, in a bundle that asked for a button. Nothing about the API changed, so upgrading is an install and no edits. If you have been carrying an entry chunk you could not account for, this was very likely it.',
    changes: [
      {
        kind: 'fixed',
        summary:
          'The package root no longer pins every Phosphor icon. `src/icons` re-exported the whole icon set with `export *`, and because Phosphor is an external dependency the bundler could not see through that star -- it built a namespace object at runtime and turned every icon reference inside the library into a property lookup. A consumer\'s bundler cannot prove which properties are read, so it had to keep all 1,512 icons. Measured on an app importing only `Button`: 6,265 KB before, 1,180 KB after -- the icon set alone was 5,085 KB of that. The library now imports the sixteen glyphs it actually draws by name.',
      },
      {
        kind: 'fixed',
        summary:
          'The weight was invisible from the outside, which is why it survived to 1.0.0: the published bundle is ~250 KB either way, because the icons are external and only materialise once an app resolves them. `npm run check:icons` now fails the build if it comes back.',
      },
    ],
    migration: [
      'Reinstall to pick it up -- `npm install github:neofloai/atoms#semver:^1.0.1`. There is nothing to change in your own code, but you do have to take the upgrade: the fix is in how the package is built, so a project still resolved to 1.0.0 keeps the 6 MB.',
      '`@neofloai/atoms/icons` behaved correctly before this and behaves the same now. If you were importing icons from that subpath to work around the size, you can keep doing exactly that -- it was never the leak.',
    ],
  },
  {
    version: '1.0.0',
    tag: 'v1.0.0',
    date: '2026-08-23',
    headline: 'First release. The component library, the tokens, the patterns and the MCP endpoint.',
    summary:
      'The initial release, and the first version that can be installed by a range rather than a commit. Everything the design system had been building towards is in it: 44 components wrapping MUI v9 behind the Neoflo API, design tokens carrying both colour schemes, six whole-screen patterns, and an MCP endpoint that serves all three to an AI editor. Before this, a bare install tracked the default branch and could change under you between installs -- from 1.0.0 on, a version is a fixed thing, and what changes between two of them is written down here.',
    changes: [
      {
        kind: 'added',
        summary:
          '44 components across Layout, Inputs, Data Display, Navigation, Feedback and Motion. Each one wraps an MUI v9 component and renames its API to the Neoflo vocabulary, so `variant="primary"` rather than `variant="contained"`.',
      },
      {
        kind: 'added',
        summary:
          '`NeofloThemeProvider` -- the single provider an app mounts once. It applies the theme, the CSS baseline, the self-hosted brand fonts (DM Sans, Instrument Serif) and the Phosphor icon defaults, and it takes a `defaultMode` prop to pin light, dark, or follow the OS.',
        scope: ['NeofloThemeProvider'],
      },
      {
        kind: 'added',
        summary:
          'Design tokens in ten categories -- colours, surface, border, text, icon, spacing, typography, responsive, elevation, radius -- from `@neofloai/atoms/tokens`. Every semantic token carries a light and a dark value, so a colour scheme is one prop rather than a second stylesheet.',
      },
      {
        kind: 'added',
        summary:
          'Every Phosphor icon from `@neofloai/atoms/icons`, tree-shakable, with the house weight and size already applied by the provider.',
      },
      {
        kind: 'added',
        summary:
          'The constructed MUI theme object from `@neofloai/atoms/theme`, for the rare case that needs to read a theme value outside a component.',
      },
      {
        kind: 'added',
        summary:
          'Six page patterns -- dashboard, invoice-dashboard, extraction, matching, erp-posting, reporting -- each a whole screen rather than a fragment, served as pasteable tsx.',
      },
      {
        kind: 'added',
        summary:
          'The MCP endpoint at atoms.neoflo.ai/mcp, with nine tools covering project intake, scaffolding, components, tokens, patterns, search, installation and this version check.',
      },
      {
        kind: 'added',
        summary:
          '`ATOMS_VERSION`, exported from the package root, so an app or an agent can read the installed version from code instead of inferring it from a lockfile.',
        scope: ['ATOMS_VERSION'],
      },
      {
        kind: 'added',
        summary:
          'This changelog, on the docs site and through the `check_version` MCP tool, so an upgrade can be read before it is taken.',
      },
    ],
    migration: [
      'If you installed before 1.0.0, your `package.json` most likely pins a commit (`github:neofloai/atoms#1a2b3c4`) or tracks the default branch. Replace it with `github:neofloai/atoms#semver:^1.0.0` so npm resolves against release tags from here on.',
      'Nothing in the API changed at 1.0.0 -- there was no earlier release for it to change from. A pre-1.0.0 install can be moved onto the range without touching component code.',
    ],
  },
];
