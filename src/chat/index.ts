/**
 * `@neofloai/atoms/chat` — the complete agentic chat: `<AgenticChat>`, every UI part and
 * built-in block, the kit for custom cards, and the headless engine underneath (runtime,
 * adapters, hooks, primitives, block registry and parsers), so one import covers the
 * common case.
 *
 * ```tsx
 * import { AgenticChat, createRestAdapter } from '@neofloai/atoms/chat';
 * ```
 *
 * Its own subpath, never the root barrel: the chat needs `react-markdown`, `remark-gfm` and
 * `@radix-ui/react-slot`, optional peers an app installs only when it renders a chat. An app
 * that never imports this path never resolves them. Charts are one level further out, in
 * `/chat/charts`, because they need Recharts as well.
 */
export * from './headless';

export {
  AgenticChat,
  ChatHeader,
  type AgenticChatProps,
  type ChatComponents,
  type ChatHeaderProps,
} from './ui/shell/AgenticChat';
export { ChatThread, type ChatThreadProps, type ThreadComponents } from './ui/shell/ChatThread';
export {
  ChatComposer,
  ScopePicker,
  FileCard,
  AttachmentCard,
  type ChatComposerProps,
  type FileCardProps,
} from './ui/shell/Composer';
export {
  ComposerPicker,
  type ComposerPickerProps,
  type ComposerPickerGroup,
  type ComposerPickerItem,
} from './ui/shell/ComposerPicker';
export { UserTurn, AssistantTurn, RunStatus, PendingTurn, ChatSuggestions, WelcomeScreen } from './ui/shell/Turn';
export { ChatHistory, type ChatHistoryProps } from './ui/history/ChatHistory';

export {
  defaultBlocks,
  textBlock,
  thinkingBlock,
  toolCallBlock,
  tableBlock,
  sourcesBlock,
  approvalBlock,
  choiceBlock,
  errorBlock,
  artifactBlock,
  imageBlock,
  planBlock,
  unknownBlock,
  TextBlock,
  ThinkingBlock,
  ToolBlock,
  SourcesBlock,
  ErrorBlock,
  UnknownBlock,
  BlockCrashNotice,
  ApprovalBlock,
  ChoiceBlock,
  ArtifactBlock,
  ImageBlock,
  PlanBlock,
  TableBlock,
  DataTable,
  Markdown,
  type MarkdownProps,
  type MarkdownSize,
} from './ui/blocks/index';

// The kit: the same pieces the built-in blocks use, for custom cards that look native.
export { BlockShell, type BlockShellProps, type BlockTone } from './ui/kit/BlockShell';
export { KeyValueList, type KeyValueItem } from './ui/kit/KeyValueList';
export { Shimmer, PulseDot } from './ui/kit/Shimmer';
export { ErrorNotice, TurnErrorNotice, RetryButton, safeUrl, formatDuration, useCanRetry } from './ui/kit/helpers';
export { mode, monoFont, BLOCK_ICON_PX, type AtomsTheme } from './ui/kit/tokens';
