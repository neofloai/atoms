import { Box, type BoxProps } from '@/src/components/Box';
import { IconButton } from '@/src/components/IconButton';
import { Stack } from '@/src/components/Stack';
import { Tooltip } from '@/src/components/Tooltip';
import { Typography } from '@/src/components/Typography';
import {
  CaretDoubleRightIcon,
  ClockCounterClockwiseIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PlusIcon,
  SidebarSimpleIcon,
} from '@/src/icons/glyphs';
import { border, elevation, surface, text } from '@/src/tokens';
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { useIsomorphicLayoutEffect } from '../../react/hooks/use-store';
import type { ChatMessage } from '../../core/store/types';
import { useChatActions, useLabels, usePreference, useThread, useThreadMeta } from '../../react/hooks';
import { ChatProvider, type ChatProviderProps } from '../../react/provider';
import { BlockCrashNotice, defaultBlocks, unknownBlock } from '../blocks';
import { ChatHistory, type ChatHistoryProps } from '../history/ChatHistory';
import { mode, type AtomsTheme } from '../kit/tokens';
import { isDev } from '../../core/runtime/env';
import { ChatComposer, type ChatComposerProps } from './Composer';
import { ChatThread, useWelcomeOpen } from './ChatThread';
import { TurnActionsProvider, type TurnActionsOptions } from './TurnActions';

export interface ChatHeaderProps {
  title?: ReactNode;
  /** Controls before the New chat button. */
  actions?: ReactNode;
  historyOpen?: boolean;
  onToggleHistory?: () => void;
}

/** The bar above the thread: history toggle, the conversation title, New chat. */
export function ChatHeader({ title, actions, historyOpen, onToggleHistory }: ChatHeaderProps) {
  const labels = useLabels();
  const meta = useThreadMeta();
  const { newConversation } = useChatActions();
  return (
    <Stack
      component="header"
      direction="row"
      spacing={1}
      sx={(t: AtomsTheme) => ({
        alignItems: 'center',
        px: 1.5,
        py: 1,
        minHeight: 52,
        borderBottom: '1px solid',
        ...mode(t, { borderColor: border.layers.card1 }),
      })}
    >
      {onToggleHistory ? (
        <Tooltip title={historyOpen ? labels.closeHistory : labels.openHistory}>
          <IconButton
            size="sm"
            variant="secondary"
            appearance="text"
            aria-label={historyOpen ? labels.closeHistory : labels.openHistory}
            aria-expanded={historyOpen}
            onClick={onToggleHistory}
          >
            <SidebarSimpleIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          weight="medium"
          component="h1"
          noWrap
          sx={(t: AtomsTheme) => ({ m: 0, ...mode(t, { color: text.default.heading }) })}
        >
          {title ?? meta.title}
        </Typography>
        {meta.subtitle ? (
          <Typography variant="body2" component="div" noWrap sx={(t: AtomsTheme) => mode(t, { color: text.default.b3 })}>
            {meta.subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions}
      <Tooltip title={labels.newChat}>
        <IconButton
          size="sm"
          variant="secondary"
          appearance="text"
          aria-label={labels.newChat}
          onClick={() => void newConversation().catch(() => undefined)}
        >
          <NotePencilIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export interface ChatRailProps {
  /** Opens the history panel. */
  onOpenHistory: () => void;
  /** Opens the history panel with its search field focused. */
  onSearch: () => void;
  /** Your own buttons at the rail's foot, such as Help. */
  footer?: ReactNode;
}

/**
 * The narrow rail on the chat's right (`navigation="rail"`): New chat, History and Search, with
 * your own buttons at its foot. History opens in its place.
 */
export function ChatRail({ onOpenHistory, onSearch, footer }: ChatRailProps) {
  const labels = useLabels();
  const { newConversation } = useChatActions();
  const button = (label: string, icon: ReactNode, onClick: () => void) => (
    <Tooltip title={label} placement="left">
      <IconButton size="sm" variant="secondary" appearance="text" aria-label={label} onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
  return (
    <Box
      component="nav"
      aria-label={labels.history}
      sx={(t: AtomsTheme) => ({
        width: 48,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        borderLeft: '1px solid',
        ...mode(t, { borderColor: border.layers.card2, backgroundColor: surface.layers.page }),
      })}
    >
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        {button(labels.newChat, <PlusIcon />, () => void newConversation().catch(() => undefined))}
        {button(labels.openHistory, <ClockCounterClockwiseIcon />, onOpenHistory)}
        {button(labels.searchChats, <MagnifyingGlassIcon />, onSearch)}
      </Stack>
      {footer ? <Stack spacing={1} sx={{ alignItems: 'center' }}>{footer}</Stack> : null}
    </Box>
  );
}

/** Slots: replace any part of the default UI with your own component. */
export interface ChatComponents {
  /**
   * The empty-chat screen. Use hooks (`useThreadMeta`, `useChatActions`) inside it. The built-in one
   * holds the composer between its greeting and its prompts; with your own, the composer stays
   * docked under it.
   */
  Welcome: ComponentType;
  UserTurn: ComponentType<{ message: ChatMessage }>;
  AssistantTurn: ComponentType<{ message: ChatMessage }>;
  Header: ComponentType<ChatHeaderProps>;
  History: ComponentType<ChatHistoryProps>;
  Composer: ComponentType<ChatComposerProps>;
}

export interface AgenticChatProps extends ChatProviderProps {
  /** Show the conversation history panel. @default true */
  history?: boolean;
  /**
   * How people reach the history and New chat. `header`: a bar over the thread with the history
   * toggle, the title and New chat, and the history on the left. `rail`: no bar, a narrow rail on
   * the right with New chat, History and Search, and the history opening on the right in its place
   * (your app bar shows the title: see `onTitleChange`).
   * @default 'header'
   */
  navigation?: 'header' | 'rail';
  /** With `navigation="rail"`: your own buttons at the rail's foot, such as Help. */
  railFooter?: ReactNode;
  /**
   * Initial state of the history panel on wide layouts (remembered afterwards).
   * @default true with the header, false with the rail
   */
  defaultHistoryOpen?: boolean;
  /** Show the header bar. @default true with `navigation="header"`, false with the rail */
  header?: boolean;
  /**
   * The row under each answer: thumbs up and down (give it `onFeedback`), copy, ask again, your
   * own buttons, and when it was given. Each can be turned off; `false` hides the row.
   */
  turnActions?: TurnActionsOptions | false;
  /** Header title; defaults to the conversation title. */
  title?: ReactNode;
  /**
   * Called with the conversation's title whenever it changes, so your app bar can show it
   * (`navigation="rail"` has no header of its own). `conversationId` is `null` for a new chat that
   * hasn't been sent yet, when the title is still "New chat": show your own label then if you like.
   */
  onTitleChange?: (title: string, conversationId: string | null) => void;
  headerActions?: ReactNode;
  components?: Partial<ChatComponents>;
  composerProps?: ChatComposerProps;
  /** Reading-column width. @default 760 */
  maxWidth?: number;
  /** Below this container width the history panel overlays the chat. @default 720 */
  compactBelow?: number;
  className?: string;
  sx?: BoxProps['sx'];
}

let warnedTheme = false;
function checkTheme(theme: AtomsTheme) {
  if (warnedTheme) return;
  if (isDev() && !(theme as { vars?: unknown }).vars) {
    warnedTheme = true;
    console.warn(
      '[agentic-chat] Wrap your app in <NeofloThemeProvider> from @neofloai/atoms; the chat renders with the wrong theme without it.',
    );
  }
}

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Tells the app the conversation's title, each time it or the conversation changes. */
function useReportTitle(onTitleChange: AgenticChatProps['onTitleChange']) {
  const title = useThread((s) => s.meta.title);
  const conversationId = useThread((s) => s.conversationId);
  const report = useRef(onTitleChange);
  useIsomorphicLayoutEffect(() => {
    report.current = onTitleChange;
  });
  useEffect(() => {
    report.current?.(title, conversationId);
  }, [title, conversationId]);
}

function ChatLayout({
  history = true,
  navigation = 'header',
  railFooter,
  defaultHistoryOpen = navigation !== 'rail',
  header = navigation !== 'rail',
  turnActions,
  title,
  onTitleChange,
  headerActions,
  components,
  composerProps,
  maxWidth = 760,
  compactBelow = 720,
  className,
  sx,
}: AgenticChatProps) {
  const labels = useLabels();
  useReportTitle(onTitleChange);
  const [rootRef, width] = useContainerWidth<HTMLDivElement>();
  const compact = width !== null && width < compactBelow;
  const [wideOpen, setWideOpen] = usePreference('historyOpen', defaultHistoryOpen);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const historyOpen = history && (compact ? overlayOpen : wideOpen);
  const toggleHistory = () => (compact ? setOverlayOpen((o) => !o) : setWideOpen(!wideOpen));
  const rail = navigation === 'rail';
  // The rail's search button opens the history with its search field focused; its History button doesn't.
  const [searching, setSearching] = useState(false);
  const openHistory = (search: boolean) => {
    setSearching(search);
    if (compact) setOverlayOpen(true);
    else setWideOpen(true);
  };

  const Header = components?.Header ?? ChatHeader;
  const History = components?.History ?? ChatHistory;
  const ComposerSlot = components?.Composer ?? ChatComposer;

  // While the chat is empty the built-in welcome holds the composer, under its greeting; once the
  // first message goes out the composer docks under the thread.
  const centered = useWelcomeOpen() && !components?.Welcome;
  // Each move mounts the composer afresh in its new place, so that one takes focus and typing
  // carries on. Not on the first render: whether the page opens focused is `autoFocus`'s call.
  const [wasCentered, setWasCentered] = useState(centered);
  const [moved, setMoved] = useState(false);
  if (wasCentered !== centered) {
    setWasCentered(centered);
    setMoved(true);
  }
  const composer = (placement: 'welcome' | 'docked') => (
    <ComposerSlot {...composerProps} placement={placement} autoFocus={composerProps?.autoFocus || moved} />
  );

  return (
    <Box
      ref={rootRef}
      className={className}
      data-agentic-chat=""
      sx={[
        (t: AtomsTheme) => {
          checkTheme(t);
          return {
            display: 'flex',
            height: '100%',
            minHeight: 0,
            position: 'relative',
            overflow: 'hidden',
            ...mode(t, { backgroundColor: surface.layers.page, color: text.default.b1 }),
          };
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {historyOpen && !rail ? (
        <Box
          sx={(t: AtomsTheme) => ({
            width: compact ? 'min(320px, 85%)' : 280,
            flexShrink: 0,
            borderRight: '1px solid',
            ...mode(t, { borderColor: border.layers.card1, backgroundColor: surface.layers.card1 }),
            ...(compact ? { position: 'absolute', top: 0, bottom: 0, left: 0, zIndex: 2, boxShadow: elevation.large } : {}),
          })}
        >
          <History onSelect={compact ? () => setOverlayOpen(false) : undefined} />
        </Box>
      ) : null}
      {compact && historyOpen ? (
        <Box aria-hidden onClick={() => setOverlayOpen(false)} sx={{ position: 'absolute', inset: 0, zIndex: 1 }} />
      ) : null}
      <TurnActionsProvider options={turnActions}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {header ? (
            <Header
              title={title}
              actions={headerActions}
              historyOpen={historyOpen}
              onToggleHistory={history && !rail ? toggleHistory : undefined}
            />
          ) : null}
          <ChatThread components={components} maxWidth={maxWidth} welcomeComposer={centered ? composer('welcome') : undefined} />
          {centered ? null : (
            // The same column as the thread, padding included, so the composer's edges line up with
            // the messages above it.
            <Box sx={{ pb: 2, pt: 0.5 }}>
              <Box sx={{ maxWidth, mx: 'auto', px: 2 }}>{composer('docked')}</Box>
            </Box>
          )}
        </Box>
      </TurnActionsProvider>
      {rail && history && historyOpen ? (
        <Box
          sx={(t: AtomsTheme) => ({
            width: compact ? 'min(320px, 85%)' : 232,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid',
            ...mode(t, { borderColor: border.layers.card2, backgroundColor: surface.layers.page }),
            ...(compact ? { position: 'absolute', top: 0, bottom: 0, right: 0, zIndex: 2, boxShadow: elevation.large } : {}),
          })}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pt: 1 }}>
            <Tooltip title={labels.closeHistory}>
              <IconButton
                size="sm"
                variant="secondary"
                appearance="text"
                aria-label={labels.closeHistory}
                aria-expanded
                onClick={() => (compact ? setOverlayOpen(false) : setWideOpen(false))}
              >
                <CaretDoubleRightIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <History onSelect={compact ? () => setOverlayOpen(false) : undefined} autoFocusSearch={searching} />
          </Box>
        </Box>
      ) : rail && history ? (
        <ChatRail onOpenHistory={() => openHistory(false)} onSearch={() => openHistory(true)} footer={railFooter} />
      ) : null}
    </Box>
  );
}

/**
 * The complete chat: history, thread, composer and every built-in block, on Atoms. Mount it
 * inside `NeofloThemeProvider` and give it a sized container.
 *
 * ```tsx
 * <AgenticChat adapter={createRestAdapter({ baseUrl, headers })} />
 * ```
 */
export function AgenticChat(props: AgenticChatProps) {
  const {
    history,
    navigation,
    railFooter,
    turnActions,
    defaultHistoryOpen,
    header,
    title,
    onTitleChange,
    headerActions,
    components,
    composerProps,
    maxWidth,
    compactBelow,
    className,
    sx,
    blocks,
    fallbackBlock,
    blockErrorFallback,
    ...provider
  } = props;
  const allBlocks = useMemo(() => [...defaultBlocks, ...(blocks ?? [])], [blocks]);
  return (
    <ChatProvider
      {...provider}
      blocks={allBlocks}
      fallbackBlock={fallbackBlock ?? unknownBlock}
      blockErrorFallback={blockErrorFallback ?? (() => <BlockCrashNotice />)}
    >
      <ChatLayout
        history={history}
        navigation={navigation}
        railFooter={railFooter}
        turnActions={turnActions}
        defaultHistoryOpen={defaultHistoryOpen}
        header={header}
        title={title}
        onTitleChange={onTitleChange}
        headerActions={headerActions}
        components={components}
        composerProps={composerProps}
        maxWidth={maxWidth}
        compactBelow={compactBelow}
        className={className}
        sx={sx}
      />
    </ChatProvider>
  );
}
