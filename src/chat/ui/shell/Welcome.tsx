import { NeofloLogo } from '@/src/brand/NeofloLogo';
import { Box, type BoxProps } from '@/src/components/Box';
import { IconButton } from '@/src/components/IconButton';
import { Skeleton } from '@/src/components/Skeleton';
import { Stack } from '@/src/components/Stack';
import { Typography } from '@/src/components/Typography';
import {
  CalendarBlankIcon,
  ChartBarIcon,
  ChartLineIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyCircleDollarIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  ReceiptIcon,
  SparkleIcon,
  StorefrontIcon,
  TrayIcon,
  WarningIcon,
  XIcon,
  type Icon,
} from '@/src/icons/glyphs';
import { border, fontFamilies, icon as iconTokens, radius, surface, text } from '@/src/tokens';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SuggestedPrompt, SuggestionIcon } from '../../core/protocol/types';
import { useLabels, usePreference, useThread, useThreadMeta } from '../../react/hooks';
import { Suggestions } from '../../react/primitives';
import { mode, type AtomsTheme } from '../kit/tokens';

/** The empty chat's column: the mark, the greeting, the composer and the prompts share one width. */
export const WELCOME_WIDTH = 640;

/** Every name in `SUGGESTION_ICONS`, drawn. A `Record` so a name added to the list without a glyph fails the build. */
const SUGGESTION_GLYPHS: Record<SuggestionIcon, Icon> = {
  sparkle: SparkleIcon,
  inbox: TrayIcon,
  warning: WarningIcon,
  chart: ChartBarIcon,
  trend: ChartLineIcon,
  document: FileTextIcon,
  receipt: ReceiptIcon,
  money: CurrencyCircleDollarIcon,
  vendor: StorefrontIcon,
  calendar: CalendarBlankIcon,
  clock: ClockIcon,
  check: CheckCircleIcon,
  search: MagnifyingGlassIcon,
};

/** The glyph for a prompt's `icon`: `sparkle` when it has none, or one this version doesn't know. */
export function suggestionGlyph(name: string | undefined): Icon {
  return (name && Object.prototype.hasOwnProperty.call(SUGGESTION_GLYPHS, name) ? SUGGESTION_GLYPHS[name as SuggestionIcon] : undefined) ?? SparkleIcon;
}

/** The preference that holds removed prompts, by their `prompt` text, on this device. */
const REMOVED_KEY = 'suggestions.removed';
/** Enough for every prompt a person would ever remove; older entries fall off first. */
const REMOVED_LIMIT = 100;

export interface ChatSuggestionsProps {
  /** Prompts to show instead of the conversation's own. */
  prompts?: SuggestedPrompt[];
  /**
   * Show the × that removes a prompt. A removed prompt stays hidden in every new chat on this
   * device (it is a preference, so it follows the chat's `persist` settings).
   * @default true
   */
  removable?: boolean;
  sx?: BoxProps['sx'];
}

/**
 * Figma ChatSuggestions: the opening prompts, one row each with its icon, under the composer.
 * Clicking a row sends its prompt; its × removes it.
 */
export function ChatSuggestions({ prompts, removable = true, sx }: ChatSuggestionsProps) {
  const labels = useLabels();
  const meta = useThreadMeta();
  const [removed, setRemoved] = usePreference<string[]>(REMOVED_KEY, []);
  const list = (prompts ?? meta.suggestedPrompts).filter((p) => !removed.includes(p.prompt));

  // Removing a row takes its × with it, so focus moves to the row that takes its place.
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const [refocus, setRefocus] = useState<number | null>(null);
  useEffect(() => {
    if (refocus === null) return;
    const next = rows.current.slice(0, list.length);
    next[Math.min(refocus, next.length - 1)]?.focus();
    setRefocus(null);
  }, [refocus, list.length]);

  if (!list.length) return null;
  return (
    <Box
      component="ul"
      aria-label={labels.suggestionsLabel}
      sx={[
        { listStyle: 'none', m: 0, px: 1, py: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Suggestions.Root prompts={list}>
        {(p, i) => {
          const Glyph = suggestionGlyph(p.icon);
          return (
            <Box
              component="li"
              key={`${p.prompt}:${i}`}
              sx={(t: AtomsTheme) => ({
                display: 'flex',
                alignItems: 'center',
                borderRadius: `${radius.sm}px`,
                transition: 'background-color 120ms ease',
                '&:hover, &:focus-within': mode(t, { backgroundColor: surface.default.default }),
                '& [data-remove]': { opacity: 0, transition: 'opacity 120ms ease' },
                '&:hover [data-remove], &:focus-within [data-remove]': { opacity: 1 },
                '@media (hover: none)': { '& [data-remove]': { opacity: 1 } },
              })}
            >
              <Suggestions.Item prompt={p} asChild>
                <Box
                  component="button"
                  ref={(el: HTMLButtonElement | null) => {
                    rows.current[i] = el;
                  }}
                  sx={(t: AtomsTheme) => ({
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1,
                    m: 0,
                    border: 0,
                    borderRadius: `${radius.sm}px`,
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    ...t.typography.body0,
                    ...mode(t, { color: text.default.b3 }),
                    '&:focus-visible': { outline: '2px solid', outlineOffset: -2, ...mode(t, { outlineColor: border.primary.focus }) },
                    '& svg': { flexShrink: 0, ...mode(t, { color: iconTokens.default.b3 }) },
                  })}
                >
                  <Glyph size={16} aria-hidden />
                  <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                    {p.label}
                  </Box>
                </Box>
              </Suggestions.Item>
              {removable ? (
                <IconButton
                  data-remove=""
                  size="sm"
                  variant="secondary"
                  appearance="text"
                  aria-label={labels.dismissSuggestion(p.label)}
                  onClick={() => {
                    setRemoved([...removed.filter((x) => x !== p.prompt), p.prompt].slice(-REMOVED_LIMIT));
                    setRefocus(i);
                  }}
                  sx={{ mr: 0.5 }}
                >
                  <XIcon />
                </IconButton>
              ) : null}
            </Box>
          );
        }}
      </Suggestions.Root>
    </Box>
  );
}

export interface WelcomeScreenProps {
  /**
   * The composer, set between the greeting and the suggested prompts. `AgenticChat` passes its own;
   * without one the screen is the greeting and the prompts alone, over a composer docked below.
   */
  composer?: ReactNode;
}

/**
 * The default empty chat: the Neoflo mark, the server's greeting, the composer and the suggested
 * prompts, in one centered column.
 */
export function WelcomeScreen({ composer }: WelcomeScreenProps) {
  const labels = useLabels();
  const meta = useThreadMeta();
  // The chat is being created: the greeting and the prompts are on their way.
  const creating = useThread((s) => s.loadStatus === 'loading');
  return (
    <Stack sx={{ alignItems: 'center', width: '100%', maxWidth: WELCOME_WIDTH, mx: 'auto', pt: 6, pb: 3 }}>
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Box aria-hidden sx={(t: AtomsTheme) => ({ display: 'inline-flex', p: 0.75, ...mode(t, { color: text.default.heading }) })}>
          <NeofloLogo size={28} />
        </Box>
        {creating ? (
          <Skeleton variant="text" width={320} height={48} />
        ) : (
          <Typography
            variant="h3"
            component="h2"
            weight="regular"
            sx={(t: AtomsTheme) => ({ m: 0, fontFamily: fontFamilies.product.display, ...mode(t, { color: text.default.b1 }) })}
          >
            {meta.greeting || labels.welcomeTitle}
          </Typography>
        )}
      </Stack>
      {composer ? <Box sx={{ width: '100%', mt: 4 }}>{composer}</Box> : null}
      <ChatSuggestions sx={{ mt: composer ? 2.5 : 4 }} />
    </Stack>
  );
}
