'use client';

import * as React from 'react';
import { ButtonBase, buttonBaseClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { CaretDownIcon, CaretRightIcon } from '@/src/icons';
import { border, radius, spacing } from '@/src/tokens';

import { focusRing, paired } from '../_shared/actionStyles';
import {
  COLLAPSE_ICON_SIZE_PX,
  COLLAPSE_ROW_HEIGHT_PX,
  CONTENT_INSET_PX,
  DOT_RADIUS,
  LINE_WIDTH_PX,
  STEP_GAP_PX,
  collapseDots,
  collapseType,
  ink,
} from './stepperTokens';

import type { StepCollapseProps } from './Stepper.types';

/** Number of squares in the vertical ellipsis. */
const ELLIPSIS_DOTS = 3;

const CollapseRoot = styled('span')({
  display: 'flex',
  alignItems: 'center',
  height: COLLAPSE_ROW_HEIGHT_PX,
});

/*
 * Same 28px box as `StepLabel`'s icon container — 12px of column and 16px
 * of gap — so the label lands on the step margin every other row uses.
 */
const EllipsisColumn = styled('span')({
  width: CONTENT_INSET_PX,
  paddingRight: STEP_GAP_PX,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: LINE_WIDTH_PX,
});

const EllipsisDot = styled('span')(({ theme }) => ({
  width: LINE_WIDTH_PX,
  height: LINE_WIDTH_PX,
  borderRadius: DOT_RADIUS,
  ...paired(theme, { backgroundColor: collapseDots }),
}));

/*
 * A bare label, not a control with a box: no horizontal padding, so the
 * text starts exactly on the step margin. Hover marks itself with an
 * underline and no fill, because a flush label has no room for a
 * surface — a fill would run straight into the glyphs. That makes this
 * the one underline left in the library: `Button`'s `text` appearance
 * used to work the same way and now takes a fill, having been given the
 * inline padding to hold one (DESIGNER_QUESTIONS.md #45).
 */
const CollapseButton = styled(ButtonBase)(({ theme }) => ({
  ...collapseType,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing.component.xs,
  height: COLLAPSE_ROW_HEIGHT_PX,
  padding: 0,
  borderRadius: radius.sm,
  // The caret is `icon/primary/2` and the label `text/primary/2`, which
  // hold the same value in both modes — so one colour, inherited.
  ...paired(theme, { color: ink.collapse }),

  '&:hover': {
    textDecorationLine: 'underline',
    textDecorationThickness: 'from-font',
    textUnderlinePosition: 'from-font',
  },
  [`&.${buttonBaseClasses.focusVisible}`]: focusRing(
    theme,
    border.primary.focus
  ),

  '& svg': { flexShrink: 0 },
}));

/**
 * A step-shaped row that hides or reveals the steps around it — the Figma
 * set's `collapse` cell (nodes 3663:40572 and 3663:40568).
 *
 * Drawn as a vertical ellipsis where the dot would be and a bare
 * primary-ink label beside it, on the same 28px margin as every other
 * row. Goes inside a `Step`, in place of a `StepLabel`, so the lines above
 * and below come from the connectors either side of it and nothing here
 * has to draw them.
 *
 * ## The one cell MUI has no component for
 *
 * The rest of this family is MUI's, renamed. This is not: MUI's stepper
 * has no notion of a row that folds the run up. What it does have is the
 * pieces — `ButtonBase` for the control, so focus, keyboard activation
 * and the ripple are MUI's, and `expanded` plus `onChange(event, expanded)`
 * for the disclosure, which is the controlled pair `Accordion` uses. No
 * behaviour is invented here, only assembled.
 *
 * ## The Figma axis is not step state
 *
 * `Property 2` means `done` / `not-done` on the other eight cells. On
 * these two it encodes collapsed against expanded instead — `done` draws
 * "+ 3 more events" with a right caret, `not-done` draws "Collapse
 * events" with a down one. The ellipsis is `surface/primary/default` in
 * both, so unlike a dot, this indicator does not move with anything.
 *
 * @example
 * const [open, setOpen] = React.useState(false);
 *
 * <Stepper activeStep={-1}>
 *   <Step expanded completed>
 *     <StepLabel>Invoice paid</StepLabel>
 *   </Step>
 *   <Step>
 *     <StepCollapse
 *       expanded={open}
 *       count={3}
 *       onChange={(_, next) => setOpen(next)}
 *     />
 *   </Step>
 *   {open && hidden.map((event) => (
 *     <Step key={event.id} expanded completed>
 *       <StepLabel>{event.title}</StepLabel>
 *     </Step>
 *   ))}
 * </Stepper>
 *
 * @see Related: Stepper, Step, StepLabel, StepContent, Collapse
 */
export const StepCollapse = React.forwardRef<
  HTMLButtonElement,
  StepCollapseProps
>(({ expanded = false, count, onChange, onClick, children, ...rest }, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    onChange?.(event, !expanded);
  };

  const label =
    children ??
    (expanded
      ? 'Collapse events'
      : count == null
        ? 'Show more events'
        : `+ ${count} more events`);

  const Caret = expanded ? CaretDownIcon : CaretRightIcon;

  return (
    <CollapseRoot>
      <EllipsisColumn aria-hidden>
        {Array.from({ length: ELLIPSIS_DOTS }, (_unused, index) => (
          <EllipsisDot key={index} />
        ))}
      </EllipsisColumn>
      <CollapseButton ref={ref} onClick={handleClick} {...rest}>
        {label}
        <Caret size={COLLAPSE_ICON_SIZE_PX} />
      </CollapseButton>
    </CollapseRoot>
  );
});

StepCollapse.displayName = 'StepCollapse';
