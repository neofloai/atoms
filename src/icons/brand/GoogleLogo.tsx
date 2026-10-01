import * as React from 'react';

import type { SVGProps } from 'react';

/**
 * Google's four-colour "G", for the sign-in button that carries it.
 *
 * ## Why this is not a Phosphor icon
 *
 * Phosphor ships a `GoogleLogoIcon`, and it is the wrong mark for this
 * job: a single monochrome path that takes `currentColor`, drawn to sit
 * in a row of interface glyphs. A "Continue with Google" button has to
 * show the actual brand mark in the actual brand colours — that is the
 * point of it, and it is what Google's own sign-in guidance requires.
 * So this is a hand-held asset rather than a barrel export, and its
 * four fills are literals rather than tokens: they are someone else's
 * colours and the theme has no business moving them.
 *
 * It is also why the name is `GoogleLogoColorIcon` rather than
 * `GoogleLogoIcon`. The Phosphor name is still exported from this
 * subpath and still resolves; shadowing it would have made
 * `import { GoogleLogoIcon }` mean two different marks depending on
 * which version a consumer had.
 *
 * The paths are the Figma asset unmodified (node 4149:5559). The viewBox
 * is not the asset's, though, and that is deliberate: the Figma icon is
 * a frame with the mark inset 1/12 of its size on every side, so a 16px
 * icon shows a 13.33px G with 1.33px of air around it. The exported
 * vector is tight to its paths, and shipping it as-is made the G fill
 * its slot edge to edge — visibly larger than the sheet, and crowding
 * the label. So the paths keep their 16.667-unit extents and the viewBox
 * puts them back in a 20-unit frame, `20 / 12` in from each edge: the
 * same construction the Figma component uses and that every Phosphor
 * icon carries in its own 256 grid.
 *
 * ## Sizing
 *
 * `size` is a convenience for a bare call site. Inside a `Button` it is
 * overridden: the control sets `width` and `height` on whatever sits in
 * its icon slot, so the mark follows the button's own ladder without
 * the caller passing anything.
 *
 * @example
 * <Button appearance="social" fullWidth startIcon={<GoogleLogoColorIcon />}>
 *   Continue with Google
 * </Button>
 */
export function GoogleLogoColorIcon({
  size = 24,
  ...rest
}: Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** Width and height in pixels. @default 24 */
  size?: number | string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-1.6667 -1.6667 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M16.5046 6.70125H15.8333V6.66667H8.33333V10H13.0429C12.3558 11.9404 10.5096 13.3333 8.33333 13.3333C5.57208 13.3333 3.33333 11.0946 3.33333 8.33333C3.33333 5.57208 5.57208 3.33333 8.33333 3.33333C9.60792 3.33333 10.7675 3.81417 11.6504 4.59958L14.0075 2.2425C12.5192 0.855417 10.5283 0 8.33333 0C3.73125 0 0 3.73125 0 8.33333C0 12.9354 3.73125 16.6667 8.33333 16.6667C12.9354 16.6667 16.6667 12.9354 16.6667 8.33333C16.6667 7.77458 16.6092 7.22917 16.5046 6.70125Z"
        fill="#FFC107"
      />
      <path
        d="M0.961914 4.45458L3.69983 6.4625C4.44066 4.62833 6.23483 3.33333 8.33441 3.33333C9.609 3.33333 10.7686 3.81417 11.6515 4.59958L14.0086 2.2425C12.5202 0.855417 10.5294 0 8.33441 0C5.13358 0 2.35775 1.80708 0.961914 4.45458Z"
        fill="#FF3D00"
      />
      <path
        d="M8.33184 16.6671C10.4843 16.6671 12.4402 15.8433 13.9189 14.5037L11.3398 12.3212C10.5031 12.955 9.46309 13.3337 8.33184 13.3337C6.16434 13.3337 4.32392 11.9516 3.63059 10.0229L0.913086 12.1166C2.29225 14.8154 5.09309 16.6671 8.33184 16.6671Z"
        fill="#4CAF50"
      />
      <path
        d="M16.5062 6.70115H15.835V6.66656H8.33496V9.9999H13.0445C12.7145 10.932 12.115 11.7357 11.3416 12.3211L11.3429 12.3203L13.922 14.5028C13.7395 14.6686 16.6683 12.4999 16.6683 8.33323C16.6683 7.77448 16.6108 7.22906 16.5062 6.70115Z"
        fill="#1976D2"
      />
    </svg>
  );
}

GoogleLogoColorIcon.displayName = 'GoogleLogoColorIcon';
