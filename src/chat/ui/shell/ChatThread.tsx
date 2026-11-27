import { Box } from '@/src/components/Box';
import { IconButton } from '@/src/components/IconButton';
import { Skeleton } from '@/src/components/Skeleton';
import { Stack } from '@/src/components/Stack';
import { ArrowDownIcon } from '@/src/icons/glyphs';
import { elevation, surface } from '@/src/tokens';
import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import type { ChatMessage } from '../../core/store/types';
import { useChatActions, useLabels, useThread } from '../../react/hooks';
import { Thread, useThreadScroll } from '../../react/primitives';
import { ErrorNotice } from '../kit/helpers';
import { mode, type AtomsTheme } from '../kit/tokens';
import { AssistantTurn, PendingTurn, UserTurn } from './Turn';
import { WelcomeScreen } from './Welcome';

export interface ThreadComponents {
  Welcome?: ComponentType;
  UserTurn?: ComponentType<{ message: ChatMessage }>;
  AssistantTurn?: ComponentType<{ message: ChatMessage }>;
}

function ThreadSkeleton() {
  return (
    <Stack spacing={3} aria-hidden>
      <Skeleton variant="rounded" height={48} width="45%" sx={{ alignSelf: 'flex-end' }} />
      <Stack spacing={1}>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="75%" />
        <Skeleton variant="text" width="60%" />
      </Stack>
    </Stack>
  );
}

/** Scrolls to the newest message whenever the user sends one. */
function FollowOnSend() {
  const { scrollToBottom } = useThreadScroll();
  const lastUserId = useThread((s) => {
    const last = s.messages[s.messages.length - 1];
    return last?.role === 'user' ? last.id : undefined;
  });
  const prev = useRef(lastUserId);
  useEffect(() => {
    if (lastUserId && lastUserId !== prev.current) scrollToBottom('auto');
    prev.current = lastUserId;
  }, [lastUserId, scrollToBottom]);
  return null;
}

function LoadError() {
  const labels = useLabels();
  const error = useThread((s) => s.loadError);
  const id = useThread((s) => s.conversationId);
  const { selectConversation, newConversation } = useChatActions();
  return (
    <ErrorNotice
      title={labels.loadError}
      message={error?.message}
      onRetry={() => void (id ? selectConversation(id) : newConversation().catch(() => undefined))}
    />
  );
}

/**
 * Whether the empty chat's welcome is up: no messages yet, and the chat either settled or still
 * being created (so the welcome holds its place instead of flashing the thread's skeleton). A chat
 * that is loading its history or failed to load is a thread, not a welcome.
 */
export function useWelcomeOpen(): boolean {
  return useThread(
    (s) => s.messages.length === 0 && (s.loadStatus === 'loading' ? s.conversationId === null : s.loadStatus !== 'error'),
  );
}

export interface ChatThreadProps {
  components?: ThreadComponents;
  /** Width of the reading column. @default 760 */
  maxWidth?: number;
  /**
   * A composer to set inside the built-in welcome, between the greeting and the suggested
   * prompts. `AgenticChat` passes it while the welcome is up. Ignored with your own `Welcome`.
   */
  welcomeComposer?: ReactNode;
}

/** The scrolling message list with the welcome screen, loading and error states. */
export function ChatThread({ components, maxWidth = 760, welcomeComposer }: ChatThreadProps) {
  const labels = useLabels();
  const loadStatus = useThread((s) => s.loadStatus);
  const empty = useThread((s) => s.messages.length === 0);
  const creating = useThread((s) => s.loadStatus === 'loading' && s.conversationId === null);
  const Welcome = components?.Welcome ?? WelcomeScreen;
  // The built-in welcome with a composer in it holds the screen while the chat is being created.
  const centered = welcomeComposer !== undefined && !components?.Welcome;

  return (
    <Thread.Root asChild>
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <FollowOnSend />
        <Thread.Viewport style={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ maxWidth, mx: 'auto', px: 2, pt: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 4.5 }}>
            {loadStatus === 'loading' && empty && !(centered && creating) ? <ThreadSkeleton /> : null}
            {loadStatus === 'error' ? <LoadError /> : null}
            {centered ? (
              <WelcomeScreen composer={welcomeComposer} />
            ) : (
              <Thread.Empty>
                <Welcome />
              </Thread.Empty>
            )}
            <Thread.Messages
              components={{
                UserMessage: components?.UserTurn ?? UserTurn,
                AssistantMessage: components?.AssistantTurn ?? AssistantTurn,
              }}
            />
            <PendingTurn />
          </Box>
        </Thread.Viewport>
        <Thread.ScrollToBottom asChild>
          <IconButton
            size="sm"
            variant="secondary"
            appearance="outline"
            aria-label={labels.jumpToLatest}
            // Filled, not see-through: it floats over the thread, and the text under it would show.
            sx={(t: AtomsTheme) => ({
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              boxShadow: elevation.medium,
              ...mode(t, { backgroundColor: surface.layers.card1 }),
            })}
          >
            <ArrowDownIcon />
          </IconButton>
        </Thread.ScrollToBottom>
      </Box>
    </Thread.Root>
  );
}
