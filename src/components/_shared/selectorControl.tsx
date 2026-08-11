'use client';

import * as React from 'react';

import { icon } from '@/src/tokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * Shared geometry and glyphs for the selector controls (`Checkbox`,
 * `Radio`). Both Figma sets — nodes 3205:121943 and 3653:28080, read
 * 11 August — draw the same shape: a 1px-stroked box sized off the
 * `Scale/*` primitives with a vector glyph centred inside it. Only the
 * corner radius, the fills, and the glyph differ, so the parts that do
 * not differ live here once.
 *
 * This replaces the earlier approach of rendering a whole Phosphor
 * square / circle glyph (node 2080:23677). The new sets draw the box
 * and the mark as separate objects, which no single-glyph icon can
 * express: the box has its own fill, border and radius per state while
 * the mark keeps a fixed size.
 *
 * Internal — not exported from the package.
 */

/**
 * Size of a selector control, mapped from the `small` boolean on both
 * component sets. `md` is Figma's `small=false` 16px box (`Scale/300`),
 * `sm` its 12px one (`Scale/250`).
 *
 * Figma models this as a boolean; it is mirrored here as a `size` ramp
 * because neither control had a size prop before, so there is no
 * existing rung to redefine. `Chip` had to take the same boolean as
 * `dense` precisely because it *did* already have `sm` and `md`
 * (DESIGNER_QUESTIONS.md #30).
 */
export type SelectorSize = 'sm' | 'md';

/** Box edge per size: `Scale/300` (16) and `Scale/250` (12). */
const BOX_SIZE_PX: Record<SelectorSize, number> = { md: 16, sm: 12 };

/**
 * Both sets stroke the box at 1px. Held constant across every state,
 * including the ones Figma draws with no stroke at all — those get a
 * `transparent` border rather than `none`, so the box never changes
 * size between states. A background paints under a transparent border,
 * so the two render identically.
 */
export const SELECTOR_BORDER_WIDTH_PX = 1;

/** Class on the box element, so state rules can reach it from the root. */
export const SELECTOR_BOX_CLASS = 'NeofloSelector-box';

/** Class on every mark, carrying the shared grow transition. */
export const SELECTOR_GLYPH_CLASS = 'NeofloSelector-glyph';

/** Per-mark classes, so each state can grow only its own. */
export const SELECTOR_CHECK_CLASS = 'NeofloSelector-check';
export const SELECTOR_DASH_CLASS = 'NeofloSelector-dash';
export const SELECTOR_DOT_CLASS = 'NeofloSelector-dot';

/**
 * The glyph on a filled selector. Figma binds it to
 * `foundations/white`, a primitive with no mode pair, and the repo
 * exposes no white — the nearest semantic token is
 * `icon.default.headingOnColor`.
 *
 * That token is pinned to its light value here instead of being passed
 * through `paired`. Its dark value inverts to near-black, which is
 * right for a glyph on a surface that turns light in dark mode; this
 * one does not. The checked box stays a saturated
 * `surface.primary.default` in both schemes (`primary/500` light,
 * `primary/600` dark), so an inverted glyph would sit at roughly 2:1
 * against its own fill. See DESIGNER_QUESTIONS.md #32.
 */
export const SELECTOR_GLYPH_ON_FILL: ModeToken = {
  light: icon.default.headingOnColor.light,
  dark: icon.default.headingOnColor.light,
};

/** One exported vector: its own pixel box, path, and stroke weight. */
interface GlyphSpec {
  readonly width: number;
  readonly height: number;
  readonly d: string;
  readonly strokeWidth: number;
}

/**
 * Check mark, verbatim from the exported assets. The box is the
 * stroke's bounding box, not the path's: Figma centres a nominal 8x6
 * (`md`) or 6x4 (`sm`) leaf and lets the round caps overhang it, which
 * is why the height carries decimals — 6 + 0.75 top + 1.0875 bottom at
 * `md`. Centring the stroke box instead of the nominal leaf shifts the
 * ink up by 0.17px, well inside one device pixel.
 */
const CHECK_GLYPH: Record<SelectorSize, GlyphSpec> = {
  md: {
    width: 9.5,
    height: 7.8375,
    d: 'M0.750001 4.35L3.03572 6.75L8.75 0.750001',
    strokeWidth: 1.5,
  },
  sm: {
    width: 7.20003,
    height: 5.40116,
    d: 'M0.600028 3L2.65717 4.6L6.60003 0.6',
    strokeWidth: 1.2,
  },
};

/**
 * Indeterminate dash — Figma's `unselect` state, drawn as a
 * zero-height 8px (`md`) or 6px (`sm`) line.
 *
 * Note the stroke stays 1.5 at `sm` while the check mark thins to 1.2,
 * so the two marks are not the same weight at the small size. Carried
 * as drawn; flagged in DESIGNER_QUESTIONS.md #32.
 */
const DASH_GLYPH: Record<SelectorSize, GlyphSpec> = {
  md: { width: 9.5, height: 1.5, d: 'M0.75 0.75H8.75', strokeWidth: 1.5 },
  sm: { width: 7.5, height: 1.5, d: 'M0.75 0.75H6.75', strokeWidth: 1.5 },
};

/** Radio dot diameter: 10px at `md`, 6px at `sm`. */
const DOT_SIZE_PX: Record<SelectorSize, number> = { md: 10, sm: 6 };

/**
 * `overflow: visible` keeps the round caps that overhang the stroke box
 * from being clipped, matching the exported SVG's own attribute.
 */
function StrokeGlyph({
  spec,
  markClass,
}: {
  spec: GlyphSpec;
  markClass: string;
}): React.JSX.Element {
  return (
    <svg
      className={`${SELECTOR_GLYPH_CLASS} ${markClass}`}
      width={spec.width}
      height={spec.height}
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={spec.d}
        stroke="currentColor"
        strokeWidth={spec.strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

StrokeGlyph.displayName = 'StrokeGlyph';

/** Check mark for the checked checkbox. */
export function SelectorCheckGlyph({
  size,
}: {
  size: SelectorSize;
}): React.JSX.Element {
  return (
    <StrokeGlyph spec={CHECK_GLYPH[size]} markClass={SELECTOR_CHECK_CLASS} />
  );
}

SelectorCheckGlyph.displayName = 'SelectorCheckGlyph';

/** Dash for the indeterminate checkbox. */
export function SelectorDashGlyph({
  size,
}: {
  size: SelectorSize;
}): React.JSX.Element {
  return (
    <StrokeGlyph spec={DASH_GLYPH[size]} markClass={SELECTOR_DASH_CLASS} />
  );
}

SelectorDashGlyph.displayName = 'SelectorDashGlyph';

/** Filled dot for the selected radio. */
export function SelectorDotGlyph({
  size,
}: {
  size: SelectorSize;
}): React.JSX.Element {
  const edge = DOT_SIZE_PX[size];
  const centre = edge / 2;

  return (
    <svg
      className={`${SELECTOR_GLYPH_CLASS} ${SELECTOR_DOT_CLASS}`}
      width={edge}
      height={edge}
      viewBox={`0 0 ${edge} ${edge}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <circle cx={centre} cy={centre} r={centre} fill="currentColor" />
    </svg>
  );
}

SelectorDotGlyph.displayName = 'SelectorDotGlyph';

/**
 * The box itself. Passed to MUI's `icon` / `checkedIcon` /
 * `indeterminateIcon` slots so every state renders the same element and
 * only its colours change.
 */
export function SelectorBox({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  return <span className={SELECTOR_BOX_CLASS}>{children}</span>;
}

SelectorBox.displayName = 'SelectorBox';

/**
 * Size, shape and centring for the box — everything except colour,
 * which is per-state and per-control.
 *
 * Centring reproduces Figma's absolute offsets exactly: the radio dot
 * is placed at 2px,2px inside a 16px box whose 1px border leaves a 14px
 * content area, and a centred 10px dot lands on exactly that.
 *
 * A single grid cell rather than flex, because the checkbox stacks its
 * check and dash in the same place — see `selectorGlyphHidden`.
 */
export function selectorBoxBase(
  size: SelectorSize,
  cornerRadius: number,
): CSSObject {
  const edge = BOX_SIZE_PX[size];

  return {
    boxSizing: 'border-box',
    width: edge,
    height: edge,
    flexShrink: 0,
    borderRadius: cornerRadius,
    borderWidth: SELECTOR_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    display: 'grid',
    placeItems: 'center',
  };
}

/**
 * Resting state for a mark: scaled away, ready to grow.
 *
 * This is MUI's own selection animation, lifted from `RadioButtonIcon`
 * — `scale(0)` to `scale(1)` over `duration.shortest`, easing in on the
 * way out and out on the way in. It only runs because every mark stays
 * mounted in every state: all of MUI's icon slots are handed the same
 * element, so React keeps the DOM node and CSS animates the class
 * change. Swapping a different element per slot, which is what the
 * `icon` / `checkedIcon` API invites, mounts the mark at full size and
 * the transition never fires.
 *
 * Stacking every mark in one grid cell is what makes that possible for
 * the checkbox, which has two of them.
 */
export function selectorGlyphHidden(theme: Theme): CSSObject {
  return {
    gridArea: '1 / 1',
    transform: 'scale(0)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.shortest,
    }),
  };
}

/** The grown state of whichever mark the current state calls for. */
export function selectorGlyphShown(theme: Theme): CSSObject {
  return {
    transform: 'scale(1)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shortest,
    }),
  };
}
