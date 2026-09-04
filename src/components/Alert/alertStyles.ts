/**
 * Severity tokens and the styled root for `Alert`.
 *
 * Split out of `Alert.tsx` to keep both files inside the 300-line limit,
 * and because this is the half that moves when the design sheet moves — a
 * resync edits this file and leaves the component alone.
 */

import { Alert as MuiAlert } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  icon as iconTokens,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { ModeToken } from '@/src/tokens';
import type { AlertSeverity } from './Alert.types';

/** Every colour slot one severity fills, across both styles. */
interface RoleTokens {
  /** Surface under `floating` — the raised, bordered card. */
  floatBg: ModeToken;
  /** Its 1px border. Only `floating` draws one. */
  floatBorder: ModeToken;
  /** Surface when not floating — the flat, full-bleed fill. */
  fillBg: ModeToken;
  /** The title line. */
  title: ModeToken;
  /** The message under it. */
  body: ModeToken;
  /** The glyph. */
  glyph: ModeToken;
  /** The action label, which is the body colour everywhere but `info`. */
  action: ModeToken;
}

/**
 * Severity to tokens, read off node 973:3010 on 2026-08-18.
 *
 * Every value below was checked hex-for-hex against the export rather
 * than assumed from the token name, and all 26 matched — the token layer
 * was already right, and only this mapping was stale.
 *
 * Two entries are not what the pattern predicts, and both are the sheet's
 * own (see DESIGNER_QUESTIONS.md #52):
 *
 *   - `success.glyph` is the role's `accent` rung where the other three
 *     take `caption`. Green at 20px does need the extra weight, so this
 *     reads as intent rather than a slip.
 *   - `info` draws its title, message and fill from the **primary** group
 *     while its surface, border and action label come from
 *     **information**. So an info alert carries two blues: `#343eb3` in
 *     the message and `#1c47bf` in the action beside it. Transcribed as
 *     drawn rather than unified, because the two are a few hex digits
 *     apart and picking one would put the code out of step with the sheet
 *     for no visible gain.
 */
const roleTokens: Record<AlertSeverity, RoleTokens> = {
  error: {
    floatBg: surface.error.default,
    floatBorder: border.error.default,
    fillBg: surface.error.subtle,
    title: text.error.body,
    body: text.error.caption,
    glyph: iconTokens.error.caption,
    action: text.error.caption,
  },
  warning: {
    floatBg: surface.warning.default,
    floatBorder: border.warning.default,
    fillBg: surface.warning.subtle,
    title: text.warning.body,
    body: text.warning.caption,
    glyph: iconTokens.warning.caption,
    action: text.warning.caption,
  },
  success: {
    floatBg: surface.success.default,
    floatBorder: border.success.default,
    fillBg: surface.success.subtle,
    title: text.success.body,
    body: text.success.caption,
    glyph: iconTokens.success.accent,
    action: text.success.caption,
  },
  info: {
    floatBg: surface.information.default,
    floatBorder: border.information.default,
    // `surface.primary.subtle`, not `information/subtle`. The latter is
    // `blue/100` (`#d1dcf9`), several rungs louder than the near-white
    // fills the other three take, so the sheet's choice is also the one
    // that keeps all four fills at one lightness.
    fillBg: surface.primary.subtle,
    title: text.primary.body,
    body: text.primary.caption,
    glyph: iconTokens.information.caption,
    action: text.information.caption,
  },
};

/** Inset on all four sides, and the gap from the text to the action. */
const PADDING_PX = spacing.component.md;

/** Icon to text, and action to close. */
const GAP_PX = spacing.component.xs;

/** Title to message. */
const TITLE_GAP_PX = spacing.component.xxs;

/** Corner on the floating card. The flat fill has none. */
const RADIUS_PX = spacing.component.xs;

/** Props the styled root consumes and does not forward to the DOM. */
export interface StyledAlertProps {
  neofloFloating: boolean;
  neofloHasTitle: boolean;
}

export const StyledAlert = styled(MuiAlert, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloFloating' && prop !== 'neofloHasTitle',
})<StyledAlertProps>(({ theme, severity, neofloFloating, neofloHasTitle }) => {
  const role = roleTokens[severity ?? 'info'];

  // One `paired` call per selector, never two spread into the same rule:
  // each emits a single `theme.applyStyles('dark', ...)` key, so a second
  // one silently drops the first's dark block. See `actionStyles.paired`.
  const surfaceTokens: Record<string, ModeToken> = {
    backgroundColor: neofloFloating ? role.floatBg : role.fillBg,
    color: role.body,
  };
  if (neofloFloating) {
    surfaceTokens.borderColor = role.floatBorder;
  }

  return {
    // MUI stretches `.MuiAlert-icon`/`.MuiAlert-message`/`.MuiAlert-action`
    // to match whichever is tallest (e.g. the close button), then only
    // `.MuiAlert-message` re-centres itself inside that extra height — the
    // icon stays pinned near its own top padding, so the gap grows with
    // however much taller the action makes the row. `flex-start` keeps
    // every child at its own natural height, which is also the sheet's
    // `items-start`.
    alignItems: 'flex-start',
    padding: PADDING_PX,
    ...paired(theme, surfaceTokens),
    ...(neofloFloating
      ? { borderWidth: 1, borderStyle: 'solid', borderRadius: RADIUS_PX }
      : // The flat style is drawn full-bleed and square: it belongs to the
        // region it sits at the top of, not to itself.
        { borderRadius: 0 }),
    '& .MuiAlert-icon': {
      // MUI's own 7px vertical padding is tuned for its 22px Material
      // glyph. The sheet's 20px box against the title's 20px line-height
      // needs none: both start at the same edge and align exactly.
      padding: 0,
      marginRight: GAP_PX,
      ...paired(theme, { color: role.glyph }),
    },
    '& .MuiAlert-message': {
      padding: 0,
      // Lets the text column shrink so a long message wraps instead of
      // pushing the action out of the box.
      minWidth: 0,
      ...(neofloHasTitle
        ? {
            fontSize: typography.body.caption.size,
            lineHeight: `${typography.body.caption.leading}px`,
            letterSpacing: `${typography.body.caption.letterSpacing}em`,
          }
        : // The sheet only draws the titled composition, where the message
          // is the 10px second line under a 13px first one. With no title
          // that line is the whole alert, and 10px alone reads as a
          // caption that lost its heading — so it takes the title's own
          // slot instead. An extrapolation, not a transcription:
          // DESIGNER_QUESTIONS.md #52 asks for the case to be drawn.
          {
            fontSize: typography.body.b1.size,
            lineHeight: `${typography.body.b1.leading}px`,
            letterSpacing: `${typography.body.b1.letterSpacing}em`,
          }),
    },
    '& .MuiAlertTitle-root': {
      margin: `0 0 ${TITLE_GAP_PX}px`,
      fontSize: typography.body.b1.size,
      lineHeight: `${typography.body.b1.leading}px`,
      letterSpacing: `${typography.body.b1.letterSpacing}em`,
      // Regular, not MUI's 500. The sheet separates the two lines by size
      // and colour and leaves both at the same weight.
      fontWeight: fontWeights.regular,
      ...paired(theme, { color: role.title }),
    },
    '& .MuiAlert-action': {
      padding: 0,
      margin: 0,
      marginLeft: 'auto',
      paddingLeft: PADDING_PX,
      gap: GAP_PX,
      alignItems: 'center',
      ...paired(theme, { color: role.action }),
    },
  };
});
