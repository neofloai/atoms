import { Box } from '@/src/components/Box';
import { Fade } from '@/src/components/Fade';
import { Stack } from '@/src/components/Stack';
import { Tag } from '@/src/components/Tag';
import { Typography } from '@/src/components/Typography';
import { radius, surface, text } from '@/src/tokens';
import type { ChatMessage } from '../../core/store/types';
import { useLabels, useThread } from '../../react/hooks';
import { Message, MessageBlocks, messageText } from '../../react/primitives';
import { ErrorNotice, TurnErrorNotice } from '../kit/helpers';
import { PulseDot, Shimmer } from '../kit/Shimmer';
import { mode, type AtomsTheme } from '../kit/tokens';
import { AttachmentCard } from './Composer';
import { TurnActions } from './TurnActions';

const BUSY = new Set(['submitting', 'streaming', 'cancelling']);

/**
 * Figma Turn (question): the user's message, right-aligned in a tinted bubble. The bubble stops at
 * 70% of the column (510px at the default width), so a long question wraps inside it and still
 * reads as the user's side of the conversation.
 */
export function UserTurn({ message }: { message: ChatMessage }) {
  const body = messageText(message);
  return (
    <Message.Root asChild>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        {message.attachments?.length ? (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
            {message.attachments.map((a, i) => (
              <AttachmentCard key={`${a.url}:${i}`} attachment={a} />
            ))}
          </Stack>
        ) : null}
        {body ? (
          <Box
            sx={(t: AtomsTheme) => ({
              maxWidth: 'min(70%, 510px)',
              px: 1.5,
              py: 1,
              borderRadius: `${radius.sm}px`,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              ...mode(t, {
                backgroundColor: surface.primary.subtleHover,
                color: text.default.b1,
              }),
            })}
          >
            <Typography variant="body0" component="div">
              {body}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Message.Root>
  );
}

/** Figma Turn (answer): the assistant's blocks, unbubbled, full width. */
export function AssistantTurn({ message }: { message: ChatMessage }) {
  const labels = useLabels();
  const waiting = message.status === 'streaming' && message.blocks.length === 0;
  const failed = message.status === 'interrupted' || (message.status === 'error' && message.error);
  return (
    <Message.Root asChild>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 0,
          '& .acu-turn-actions': { opacity: 0, transition: 'opacity 120ms ease' },
          '&:hover .acu-turn-actions, & .acu-turn-actions:focus-within': { opacity: 1 },
        }}
      >
        <MessageBlocks />
        {waiting ? <Shimmer>{labels.thinkingLive}</Shimmer> : null}
        {failed && message.error ? (
          <TurnErrorNotice
            error={message.error}
            title={message.status === 'interrupted' ? labels.interrupted : message.error.message}
            message={message.status === 'interrupted' ? message.error.message : undefined}
          />
        ) : failed ? (
          <ErrorNotice title={labels.interrupted} />
        ) : null}
        {message.status === 'cancelled' ? (
          <Typography variant="body2" sx={(t: AtomsTheme) => mode(t, { color: text.default.b3 })}>
            {labels.stopped}
          </Typography>
        ) : null}
        {message.status !== 'streaming' ? <TurnActions message={message} /> : null}
      </Box>
    </Message.Root>
  );
}

/** Figma RunStatus: the live progress pill fed by `status` events. */
export function RunStatus() {
  const label = useThread((s) => (BUSY.has(s.run.status) ? s.run.statusLabel : undefined));
  return (
    <Box aria-live="polite" aria-atomic="true" sx={{ minHeight: 0 }}>
      <Fade in={Boolean(label)} unmountOnExit>
        <Box sx={{ display: 'inline-flex' }}>
          <Tag
            appearance="outline"
            variant="secondary"
            // Tag sizes its icon slot to 12px; centre the 6px dot in it rather than stretch it.
            icon={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <PulseDot />
              </Box>
            }
            label={label ?? ''}
          />
        </Box>
      </Fade>
    </Box>
  );
}

/** What shows under the last message while a turn is in flight or failed before starting. */
export function PendingTurn() {
  const labels = useLabels();
  const state = useThread(
    (s) => {
      const last = s.messages[s.messages.length - 1];
      const awaitingReply = last?.role === 'user' || !last;
      return {
        submitting: s.run.status === 'submitting' && awaitingReply,
        failedBeforeReply: s.run.status === 'error' && last?.role === 'user' ? s.run.error : undefined,
      };
    },
    (a, b) => a.submitting === b.submitting && a.failedBeforeReply === b.failedBeforeReply,
  );
  return (
    <>
      {state.submitting ? <Shimmer>{labels.thinkingLive}</Shimmer> : null}
      <RunStatus />
      {state.failedBeforeReply ? <TurnErrorNotice error={state.failedBeforeReply} /> : null}
    </>
  );
}
