import { Box } from '@/src/components/Box';
import { IconButton } from '@/src/components/IconButton';
import { Stack } from '@/src/components/Stack';
import { Typography } from '@/src/components/Typography';
import { ArrowElbowDownLeftIcon, PlusIcon, StopIcon } from '@/src/icons/glyphs';
import { border, radius, surface, text } from '@/src/tokens';
import { forwardRef, useEffect, useId, useState, type FormHTMLAttributes, type ReactNode } from 'react';
import { useChatEvent, useComposer, useLabels } from '../../react/hooks';
import { ComposerChosen, ComposerMenu, useScopePicker, type ComposerMenuConfig } from './ComposerMenu';
import { FileCard } from './FileCard';
import { ComposerPicker } from './ComposerPicker';
import { Composer, useComposerContext } from '../../react/primitives';
import { composerGlow, mode, type AtomsTheme } from '../kit/tokens';

export { AttachmentCard, FileCard, fileKindOf, type FileCardProps } from './FileCard';

/**
 * Figma Composer-scope + SourcePicker: which workflows the question is about, as a pill. It is the
 * composer's when its + menu is off (`menu={false}`); otherwise the workflows are a submenu of +.
 * It hides itself when there is no catalog or the backend takes no workflow context.
 */
export function ScopePicker() {
  const labels = useLabels();
  const { scope, groups, value, onChange } = useScopePicker();
  if (!scope.enabled) return null;
  const { selected, allSelected } = scope.summary;
  const summary =
    scope.status !== 'ready' || allSelected ? labels.scopeAll : selected === 0 ? labels.scopeNone : labels.scopeSome(selected);
  return (
    <ComposerPicker
      name={labels.scopeLabel}
      triggerLabel={summary}
      selectAllLabel={labels.scopeSelectAll}
      deselectAllLabel={labels.scopeDeselectAll}
      loading={scope.status === 'loading'}
      groups={groups}
      value={value}
      onChange={onChange}
    />
  );
}

/** Shown when the draft is longer than the backend's `max_message_chars`. */
function TooLongNotice() {
  const labels = useLabels();
  const { tooLong, maxChars } = useComposer();
  if (!tooLong || !maxChars) return null;
  return (
    <Typography role="alert" variant="body2" sx={(t: AtomsTheme) => mode(t, { color: text.error[3] })}>
      {labels.messageTooLong(maxChars)}
    </Typography>
  );
}

function RejectedNotice() {
  const [message, setMessage] = useState<string | null>(null);
  useChatEvent('warning', (w) => {
    if (w.code === 'attachment_rejected') setMessage(w.message);
  });
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <Typography role="alert" variant="body2" sx={(t: AtomsTheme) => mode(t, { color: text.error[3] })}>
      {message}
    </Typography>
  );
}

type BodyProps = Pick<ChatComposerProps, 'leadingActions' | 'extraActions' | 'scopePicker' | 'menu'> & {
  placement: ChatComposerPlacement;
  input: ReactNode;
};

/** Send while there is something to send, Stop while a reply runs, nothing at rest. */
function SendOrStop() {
  const c = useComposerContext();
  const labels = useLabels();
  if (c.busy) {
    return (
      <Composer.Cancel asChild>
        <IconButton size="sm" variant="secondary" aria-label={labels.stop}>
          <StopIcon weight="fill" />
        </IconButton>
      </Composer.Cancel>
    );
  }
  if (!c.canSend) return null;
  return (
    <Composer.Send asChild>
      <IconButton size="sm" aria-label={labels.send}>
        <ArrowElbowDownLeftIcon />
      </IconButton>
    </Composer.Send>
  );
}

/**
 * The card's inside. On the empty chat: the input, with a row under it (+, your controls, send).
 * Docked: one row (+, the input, your controls, send), the buttons held to its last line as the
 * input grows.
 */
function ComposerBody({ placement, input, menu, scopePicker, leadingActions, extraActions }: BodyProps) {
  const labels = useLabels();
  const docked = placement === 'docked';
  // `scopePicker={false}` takes the workflows out of the menu as well as the row.
  const config: Exclude<ComposerMenuConfig, false> | undefined =
    menu === false
      ? undefined
      : scopePicker === false
        ? (builtIns) => {
            const withoutWorkflows = builtIns.filter((item) => item.id !== 'workflows');
            return typeof menu === 'function' ? menu(withoutWorkflows) : (menu ?? withoutWorkflows);
          }
        : menu;
  const plus =
    menu === false ? (
      <Composer.AttachmentInput asChild>
        <IconButton size="sm" variant="secondary" appearance={docked ? 'contained' : 'text'} aria-label={labels.attach}>
          <PlusIcon />
        </IconButton>
      </Composer.AttachmentInput>
    ) : (
      <ComposerMenu menu={config} appearance={docked ? 'contained' : 'text'} />
    );
  // With the menu on, the workflows live in it; a node of your own still takes the row.
  const pill = scopePicker === undefined ? (menu === false ? <ScopePicker /> : null) : scopePicker || null;
  const field = (
    <>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, '&:empty': { display: 'none' } }}>
        <ComposerAttachmentRow menu={menu === false ? undefined : config} />
      </Stack>
      {input}
    </>
  );

  if (docked) {
    return (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-end', p: 1 }}>
        {plus}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, '& textarea': { py: '5px' } }}>
          {field}
        </Box>
        {pill || leadingActions || extraActions ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {pill}
            {leadingActions}
            {extraActions}
          </Stack>
        ) : null}
        <SendOrStop />
      </Stack>
    );
  }
  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 1.5, pt: 1, pb: 0.5 }}>{field}</Box>
      <Box sx={{ px: 1, pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minHeight: 32 }}>
          {plus}
          {pill}
          {leadingActions}
          <Box sx={{ flex: 1 }} />
          {extraActions}
          <SendOrStop />
        </Stack>
      </Box>
    </>
  );
}

/** Files on their way into the message, then what the + menu's pickers hold, as cards. */
function ComposerAttachmentRow({ menu }: { menu?: Exclude<ComposerMenuConfig, false> }) {
  return (
    <>
      <Composer.Attachments>
        {(a, remove) => (
          <FileCard
            key={a.id}
            name={a.name}
            size={a.size}
            contentType={a.contentType}
            status={a.status}
            progress={a.progress}
            error={a.error}
            onRemove={remove}
          />
        )}
      </Composer.Attachments>
      <ComposerChosen menu={menu} />
    </>
  );
}

/** Where the composer sits. `AgenticChat` sets it; a composer you place yourself is `docked`. */
export type ChatComposerPlacement = 'docked' | 'welcome';

export interface ChatComposerProps {
  /**
   * `welcome` is the empty chat's composer, under the greeting: it starts three lines tall and
   * takes the welcome placeholder. `docked` is the one under a conversation.
   * @default 'docked'
   */
  placement?: ChatComposerPlacement;
  /** Defaults to the labels' `welcomePlaceholder` on the empty chat and `composerPlaceholder` under a conversation. */
  placeholder?: string;
  /**
   * Controls on the left, after the attach button and the workflow picker: a `ComposerPicker` for
   * tools or data sources, a mode switch…
   */
  leadingActions?: ReactNode;
  /** Controls on the right, before the send button: a model picker, a mic… */
  extraActions?: ReactNode;
  /**
   * The + menu: attach files, then the workflows as a submenu, by default. A function receives
   * those items and returns the menu, to add your own (two levels at most), reorder, disable or
   * hide any of them; an array replaces them; `false` turns the menu off, so + attaches directly
   * and the workflows are a pill in the row again.
   */
  menu?: ComposerMenuConfig;
  /**
   * The workflow picker. Omit it for the built-in one: a submenu of +, or a pill when the menu is
   * off (either hides itself without a workflow catalog). Pass your own node to put it in the row,
   * or `false` to leave the workflows out altogether.
   */
  scopePicker?: ReactNode | false;
  /** Under the composer: a disclaimer such as "Neo can make mistakes…". A string is set small and centered. */
  footer?: ReactNode;
  /** Rows the input starts at. @default 3 on the empty chat, 1 under a conversation */
  minRows?: number;
  /** Rows the input grows to before it scrolls. @default 18 on the empty chat, 8 under a conversation */
  maxRows?: number;
  autoFocus?: boolean;
}

const ROWS: Record<ChatComposerPlacement, { min: number; max: number }> = {
  welcome: { min: 3, max: 18 },
  docked: { min: 1, max: 8 },
};

/**
 * Figma Composer: the input, attachments, the workflow picker, your own controls, and send/stop.
 * The card glows while someone is typing in it; the border only turns blue to take a dropped file.
 */
export function ChatComposer({
  placement = 'docked',
  placeholder,
  menu,
  leadingActions,
  extraActions,
  scopePicker,
  footer,
  minRows = ROWS[placement].min,
  maxRows = ROWS[placement].max,
  autoFocus,
}: ChatComposerProps) {
  const labels = useLabels();
  const [dragging, setDragging] = useState(false);
  const hintId = useId();
  return (
    <Box>
      <Composer.Root asChild>
        <DropZone onDragChange={setDragging}>
          <Box
            data-placement={placement}
            sx={(t: AtomsTheme) => ({
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
              borderRadius: `${radius.sm}px`,
              border: '1px solid',
              overflow: 'hidden',
              transition: 'border-color 120ms ease, box-shadow 160ms ease',
              ...mode(t, {
                backgroundColor: surface.layers.card1,
                borderColor: dragging ? border.primary.focus : border.layers.card3,
                boxShadow: composerGlow.rest,
              }),
              '&:focus-within': mode(t, { boxShadow: composerGlow.active }),
              '& textarea': {
                display: 'block',
                width: '100%',
                border: 0,
                outline: 0,
                p: 0,
                m: 0,
                background: 'transparent',
                fontFamily: 'inherit',
                ...t.typography.body0,
                ...mode(t, { color: text.default.b1 }),
                // Past `maxRows` the text scrolls inside the card, on a slim bar rather than the
                // platform's full-width one.
                scrollbarWidth: 'thin',
                ...mode(t, { scrollbarColor: { light: `${border.default.default.light} transparent`, dark: `${border.default.default.dark} transparent` } }),
                '&::-webkit-scrollbar': { width: 8 },
                '&::-webkit-scrollbar-thumb': { borderRadius: 100, ...mode(t, { backgroundColor: border.default.default }) },
              },
              '& textarea::placeholder': { opacity: 1, ...mode(t, { color: text.default['placeholder on-color'] }) },
              '& textarea:disabled': { cursor: 'not-allowed' },
            })}
          >
            <ComposerBody
              placement={placement}
              menu={menu}
              scopePicker={scopePicker}
              leadingActions={leadingActions}
              extraActions={extraActions}
              input={
                <>
                  <Composer.Input
                    placeholder={placeholder ?? (placement === 'welcome' ? labels.welcomePlaceholder : undefined)}
                    minRows={minRows}
                    maxRows={maxRows}
                    autoFocus={autoFocus}
                    aria-describedby={hintId}
                  />
                </>
              }
            />
          </Box>
        </DropZone>
      </Composer.Root>
      <Box
        id={hintId}
        sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', '&:empty': { display: 'none' } }}
      >
        <RejectedNotice />
        <TooLongNotice />
        {typeof footer === 'string' ? (
          <Typography variant="body2" component="p" sx={(t: AtomsTheme) => ({ m: 0, textAlign: 'center', ...mode(t, { color: text.default.b2 }) })}>
            {footer}
          </Typography>
        ) : (
          footer
        )}
      </Box>
    </Box>
  );
}

/** The form element; accepts dropped files when attachments are enabled. */
interface DropZoneProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onDragOver' | 'onDragLeave' | 'onDrop'> {
  children: ReactNode;
  onDragChange: (dragging: boolean) => void;
}

const DropZone = forwardRef<HTMLFormElement, DropZoneProps>(function DropZone({ children, onDragChange, ...props }, ref) {
  const c = useComposerContext();
  return (
    <Box
      component="form"
      ref={ref}
      noValidate
      {...props}
      onDragOver={(e: React.DragEvent) => {
        if (!c.attachmentsEnabled || !e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        onDragChange(true);
      }}
      onDragLeave={() => onDragChange(false)}
      onDrop={(e: React.DragEvent) => {
        onDragChange(false);
        if (!c.attachmentsEnabled || !e.dataTransfer.files.length) return;
        e.preventDefault();
        c.addFiles(e.dataTransfer.files);
      }}
    >
      {children}
    </Box>
  );
});
