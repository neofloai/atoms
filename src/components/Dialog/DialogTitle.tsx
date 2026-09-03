'use client';

import * as React from 'react';
import { DialogTitle as MuiDialogTitle } from '@mui/material';
import { styled } from '@mui/material/styles';

import { XIcon } from '@/src/icons/glyphs';
import {
  border,
  fontWeights,
  radius,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired, pairedFocusRing } from '../_shared/actionStyles';
import { IconButton } from '../IconButton';
import {
  DIALOG_PADDING_INLINE_PX,
  DIALOG_TITLE_GAP_PX,
  DIALOG_TITLE_ICON_GLYPH_PX,
  DIALOG_TITLE_ICON_SIZE_PX,
  DIALOG_TITLE_PADDING_BOTTOM_PX,
  DIALOG_TITLE_PADDING_TOP_PX,
} from './dialogRegions';

import type { DialogTitleProps as MuiDialogTitleProps } from '@mui/material';
import type { DialogTitleProps } from './Dialog.types';

/**
 * Figma's title block, node 3500:30050: `Sans/H5/Medium` over
 * `Sans/B1/Regular`, stacked with `gap: 0` so the two line-heights sit
 * flush — the same pairing `CardHeader` uses one rung further down the
 * ramp.
 */
const titleType = typography.headings.h5;
const subtitleType = typography.body.b1;

/**
 * The row: leading block, then the close button pushed to the trailing
 * edge. `flex-start` rather than `center`, so the close button stays level
 * with the *first* line however many lines the title runs to — which is
 * what all three Figma cells draw, including the tall `icon` one.
 */
const TitleRoot = styled(MuiDialogTitle)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: DIALOG_PADDING_INLINE_PX,
  paddingTop: DIALOG_TITLE_PADDING_TOP_PX,
  paddingBottom: DIALOG_TITLE_PADDING_BOTTOM_PX,
  paddingLeft: DIALOG_PADDING_INLINE_PX,
  paddingRight: DIALOG_PADDING_INLINE_PX,
  // Restated rather than inferred. `styled()` collapses MUI's
  // `OverridableComponent` generic down to its default root and drops
  // `component` altogether, so without this the `component="div"` below
  // fails to compile while still rendering a div at runtime — the same
  // cast `Card` and the picker panels use.
}) as React.JSXElementConstructor<MuiDialogTitleProps>;

/**
 * The leading column — badge, then text. One column whether or not there
 * is a badge: with a single child the 8px gap has nothing to act on, so
 * no conditional is needed.
 */
const LeadingBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: DIALOG_TITLE_GAP_PX,
  minWidth: 0,
});

/**
 * The badge above the title (node 3500:30048). Figma instances the
 * `button-icon` component here at `size=large`, `type=primary`,
 * `style=contained` — so the box is `IconButton`'s `lg` geometry and the
 * primary fill, and the two agree by construction rather than by a
 * transcribed number.
 *
 * Drawn as a plain box rather than an actual `IconButton`, because in a
 * dialog title it is decoration: it labels the dialog, it does not do
 * anything. Rendering the component Figma instanced would put a
 * focusable, clickable control in the tab order with nothing to click,
 * which is the more likely reading of a designer reaching for the
 * component that had the right box. Logged in DESIGNER_QUESTIONS.md #44.
 */
const IconBadge = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: DIALOG_TITLE_ICON_SIZE_PX,
  height: DIALOG_TITLE_ICON_SIZE_PX,
  borderRadius: radius.sm,
  ...paired(theme, {
    backgroundColor: surface.primary.default,
    color: text.default.headingOnColor,
  }),
  // The consumer passes their own glyph, so its size is pinned here
  // rather than trusted to arrive at 24 — Phosphor's own default is 24,
  // but an icon from anywhere else would not be.
  '& > svg': {
    width: DIALOG_TITLE_ICON_GLYPH_PX,
    height: DIALOG_TITLE_ICON_GLYPH_PX,
  },
}));

/**
 * The close button's fill, one rung up the *layers* ladder from the panel
 * it sits on.
 *
 * `IconButton`'s `secondary` `contained` fill is
 * `surface/default/default`, which is the value the design gives this
 * button and is correct in light mode — `grey/100`, a faint square on a
 * `grey/75` panel. In dark mode that token is `grey/1000`, which is
 * *exactly* the dialog panel's own fill, so the box disappeared entirely
 * and the button rendered as a bare glyph. Same collision that put the
 * picker cells' hover fill on `card 3`.
 *
 * The neutral ladder has nowhere to go from there: below `grey/900` the
 * scale jumps to `grey/800`, the body-text rung. So each state is drawn
 * from the layers ladder in dark mode and left on the neutral ladder in
 * light, which keeps light mode byte-for-byte what `IconButton` already
 * produced and gives dark mode a visible resting box:
 *
 *   - rest    `grey/100` / `grey/950`  — `card 2`, a rung off the panel
 *   - hover   `grey/200` / `grey/900`  — `card 3`
 *   - pressed `grey/300` / `grey/900`
 *
 * The one cost is that press and hover land on the same rung in dark mode.
 * That is the right trade: press is momentary and comes with the click,
 * where rest is what the button looks like the whole time it is on screen.
 * The underlying token collision is logged in DESIGNER_QUESTIONS.md #44 —
 * if a `grey/850` ever lands, all three states can go back to one ladder.
 */
const closeFill = {
  rest: surface.layers.card2,
  hover: {
    light: surface.default.defaultHover.light,
    dark: surface.layers.card3.dark,
  },
  pressed: {
    light: surface.default.defaultPressed.light,
    dark: surface.layers.card3.dark,
  },
} as const;

/**
 * Doubled `&&` throughout: these rules override `appearanceStyles`, which
 * writes the same selectors at the same specificity from inside
 * `IconButton`. Which of two equal rules wins would otherwise depend on
 * the order Emotion inserts them, and a wrapper's styles are not
 * necessarily inserted after the component it wraps.
 */
const CloseButton = styled(IconButton)(({ theme }) => ({
  '&&': {
    ...paired(theme, { backgroundColor: closeFill.rest }),
    '&:hover': paired(theme, { backgroundColor: closeFill.hover }),
    '&:active': paired(theme, { backgroundColor: closeFill.pressed }),
    '&.Mui-focusVisible': pairedFocusRing(
      theme,
      { backgroundColor: closeFill.hover },
      border.default.defaultPressed
    ),
  },
}));

/** The two text lines, flush (`Scale/0`). */
const TextBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

/**
 * The title line. `margin: 0` because this is a real `h2` and the browser
 * gives headings their own block margins.
 */
const TitleLine = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: titleType.size,
  fontWeight: fontWeights.medium,
  lineHeight: `${titleType.leading}px`,
  letterSpacing: `${titleType.letterSpacing}em`,
  ...paired(theme, { color: text.default.heading }),
}));

/** The subtitle line, same reason for the reset. */
const SubtitleLine = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: subtitleType.size,
  fontWeight: fontWeights.regular,
  lineHeight: `${subtitleType.leading}px`,
  letterSpacing: `${subtitleType.letterSpacing}em`,
  ...paired(theme, { color: text.default.body }),
}));

/**
 * The heading at the top of a dialog. Wraps MUI `DialogTitle` and maps
 * one-to-one onto Figma's three `modal-title` cells (node 3500:30051):
 * `1-line` is a title on its own, `2-line` adds `subtitle`, and `icon`
 * adds a badge above both. Every cell carries the close button, which
 * `onClose` renders.
 *
 * ## What this wrapper adds
 *
 * The three content slots and the type ramp. MUI's `DialogTitle` is a
 * single `Typography` — `variant="h6"` on an `h2`, padded `16px 24px` —
 * with no room in it for a second line, a badge, or a close button. All
 * three are things Figma draws in every cell, and MUI's own answer is to
 * compose them inside the title by hand (its customization demo puts an
 * absolutely positioned `IconButton` there). This does that composition
 * once, so a dialog does not have to rebuild it:
 *
 *   - **`children`** is the title, as in MUI. `Sans/H5/Medium` — 20/28 at
 *     weight 500 — in `text/default/heading`. MUI's `h6` resolves to 16px
 *     here, a rung short of the design.
 *   - **`subtitle`** is the 13px line under it, in `text/default/b1`.
 *     Named for the layer Figma names, rather than `CardHeader`'s
 *     `subheader`: a dialog title is not a header, and MUI has no single
 *     convention to follow here anyway (`CardHeader` says `subheader`,
 *     `ListItemText` says `secondary`).
 *   - **`icon`** is the glyph inside the 44px primary badge. See
 *     `IconBadge` for why it is not a button.
 *   - **`onClose`** renders the 32px close button at the trailing edge,
 *     which is `IconButton` at `secondary` / `contained` / `sm` — the
 *     house component, with one correction to its resting fill so the box
 *     reads on this panel in dark mode as well as light (see
 *     `closeFill`). Omit it and no button renders, exactly as `Alert`
 *     behaves.
 *
 * ## The root is a `div`
 *
 * MUI renders `DialogTitle` as an `h2` and points the dialog's
 * `aria-labelledby` at it. A subtitle is a `<p>`, and a `<p>` inside an
 * `<h2>` is invalid markup that browsers will unnest, so the root becomes
 * a `div` and the `h2` moves inside it. MUI's own id wiring is untouched —
 * it is applied before the overriding `component`, so the dialog is still
 * labelled by this element.
 *
 * `component` and `variant` are removed from the type for that reason:
 * both would silently break the structure this composes, and a compiler
 * error is the better failure. `sx`, `className`, `classes` and every
 * other Typography prop still work.
 *
 * @example The `1-line` cell
 * <DialogTitle onClose={handleClose}>Delete workspace?</DialogTitle>
 *
 * @example The `2-line` cell
 * <DialogTitle subtitle="They will get an email invitation." onClose={handleClose}>
 *   Invite a teammate
 * </DialogTitle>
 *
 * @example The `icon` cell
 * <DialogTitle
 *   icon={<WarningIcon />}
 *   subtitle="This removes every project in the workspace."
 *   onClose={handleClose}
 * >
 *   Delete workspace?
 * </DialogTitle>
 *
 * @example No close button — a decision that has to be made
 * <DialogTitle subtitle="Accept the terms to continue.">Terms updated</DialogTitle>
 *
 * @see Related: Dialog, DialogContent, DialogActions, IconButton
 */
export const DialogTitle = React.forwardRef<HTMLDivElement, DialogTitleProps>(
  function DialogTitle(
    { children, subtitle, icon, onClose, slotProps, ...rest },
    ref
  ) {
    return (
      <TitleRoot ref={ref} component="div" {...rest}>
        <LeadingBlock>
          {icon ? <IconBadge>{icon}</IconBadge> : null}
          <TextBlock>
            <TitleLine>{children}</TitleLine>
            {subtitle ? <SubtitleLine>{subtitle}</SubtitleLine> : null}
          </TextBlock>
        </LeadingBlock>
        {onClose ? (
          <CloseButton
            variant="secondary"
            appearance="contained"
            size="sm"
            aria-label="Close"
            {...slotProps?.closeButton}
            onClick={onClose}
          >
            <XIcon />
          </CloseButton>
        ) : null}
      </TitleRoot>
    );
  }
);

DialogTitle.displayName = 'DialogTitle';
