import * as React from 'react';
import { WarningDiamondIcon, XIcon } from '@/src/icons/glyphs';

import type { IconProps } from '@/src/icons/glyphs';

/**
 * The alert glyph and close affordance, shared by `Alert` and `Snackbar`.
 *
 * Held here rather than inside `Alert` because `Snackbar` composes the
 * close button itself — it puts an action and a dismiss in the one slot
 * MUI gives it — and a second copy of the glyph would drift from this
 * one the first time either changed.
 */

/** Icon box in the alert sheet. Phosphor's own default is 24. */
const ICON_SIZE_PX = 20;

/** Close glyph. Smaller than the severity icon, as the sheet draws it. */
const CLOSE_SIZE_PX = 16;

/**
 * One glyph for all four severities.
 *
 * The 2026-08-18 resync of the alert sheet (node 973:3010) draws
 * `WarningDiamond` in every state — error, warning, success and info —
 * with only the colour changing between them. Verified three ways: every
 * variant names its icon layer `WarningDiamond`, the four exported SVGs
 * are byte-identical, and the sheet's component list contains no other
 * glyph. So the per-severity mapping this component used to carry
 * (`CheckCircle` / `Info` / `Warning` / `WarningDiamond`) is gone, and a
 * success alert now shows the same diamond an error does.
 *
 * That is a question rather than a preference — see
 * DESIGNER_QUESTIONS.md #52 — but it is what the sheet says, and the
 * sheet is the source.
 *
 * `weight="fill"` matches the solid diamond with the knocked-out mark
 * that the sheet renders. The colour comes from the parent: the glyph
 * inherits `currentColor`, which `Alert` sets per severity from the
 * `icon/*` token group.
 */
export const ALERT_ICON: React.ReactNode = (
  <WarningDiamondIcon weight="fill" size={ICON_SIZE_PX} />
);

/**
 * Close-icon slot.
 *
 * MUI passes its internal `ownerState` into slot components; Phosphor
 * icons are not MUI-aware and would forward it straight onto the DOM
 * `<svg>` (a React warning), so it is stripped here and the Phosphor
 * `XIcon` rendered with the rest. Sized to the sheet's `X` box —
 * Phosphor's own default of 24px rendered noticeably larger than the
 * design.
 */
export const AlertCloseIcon = React.forwardRef<
  SVGSVGElement,
  IconProps & { ownerState?: unknown }
>(function AlertCloseIcon(props, ref) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop MUI's slot-internal ownerState so it never reaches the DOM
  const { ownerState, ...rest } = props;
  return <XIcon ref={ref} size={CLOSE_SIZE_PX} {...rest} />;
});

AlertCloseIcon.displayName = 'AlertCloseIcon';
