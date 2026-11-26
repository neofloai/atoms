/**
 * The headless layer: the engine plus React bindings, with no styling. Not an entry point of
 * its own — `@neofloai/atoms/chat` re-exports all of it beside the styled UI. It is kept as
 * one module so the layering stays legible: nothing reachable from here imports an Atoms
 * component, MUI or Recharts (ESLint enforces it), so a custom chat built from these hooks
 * and primitives tree-shakes the styled UI away.
 */
export * from './core/index';
export * from './registry/index';
export * from './blocks/index';

export { ChatProvider, ThreadProvider, type ChatProviderProps } from './react/provider';
export { ChatContext, ThreadContext, MessageContext, BlockContext, useChatContext, type ChatContextValue } from './react/context';
export { defaultLabels, type ChatLabels, type FileKind } from './react/labels';
export {
  useChatRuntime,
  useChatConfig,
  useCapabilities,
  useSourceLabel,
  useLabels,
  useActiveConversationId,
  useThreadHandle,
  useThread,
  useMessages,
  useRun,
  useThreadMeta,
  useIsBusy,
  useChatActions,
  useComposer,
  usePreference,
  useConversations,
  useScope,
  useMessage,
  useBlock,
  useHitl,
  useBlockActions,
  useChatEvent,
  useStoreSelector,
  shallowEqual,
  type GroupSelectionState,
} from './react/hooks/index';
export {
  Thread,
  Message,
  Composer,
  Suggestions,
  ConversationList,
  Hitl,
  Block,
  MessageBlocks,
  useThreadScroll,
  useComposerContext,
  useHitlChoice,
  messageText,
  type ScrollController,
  type MessageComponents,
  type ComposerInputProps,
} from './react/primitives/index';
