import type { TooltipProps as MuiTooltipProps } from '@mui/material';

/**
 * Props for the Neoflo `Tooltip`.
 *
 * MUI's `TooltipProps` with one changed default and nothing removed.
 * The Figma component set (node 3223:54057) has a single axis —
 * `tipPosition`, six values — and that axis is MUI's `placement`, so
 * there is no Neoflo vocabulary to put in front of MUI's API. `title`,
 * `placement`, `open` / `onOpen` / `onClose`, every `enter*` / `leave*`
 * delay, `followCursor`, `describeChild`, `disableFocusListener` /
 * `disableHoverListener` / `disableTouchListener` /
 * `disableInteractive`, and `slots` / `slotProps` all behave exactly as
 * documented for MUI `Tooltip`.
 *
 * Two behaviours differ from a bare MUI `Tooltip`, both because of how
 * MUI's own component is built rather than by choice:
 *
 *   - `arrow` defaults to `true`. Every variant on the sheet draws the
 *     tip, so it is part of the design rather than an opt-in.
 *   - `className` and `sx` land on the **popper**, not on the trigger.
 *     MUI forwards a `Tooltip`'s `className` to `children`, and the
 *     bubble is portalled out of the trigger's subtree, so the popper
 *     is the only seam a wrapper can style through — this is MUI's own
 *     documented recipe. Style the trigger directly instead; it is your
 *     own element.
 *
 * Note that MUI types `title` as required and treats an empty string,
 * `null`, `undefined`, or `false` as "render the child, show nothing" —
 * that is how you disable a tooltip conditionally.
 */
export interface TooltipProps extends MuiTooltipProps {
  /**
   * If `true`, draws the tip pointing at the trigger.
   *
   * Defaults to `true` here, against MUI's `false`: all six variants on
   * the sheet have a tip. Pass `false` for a plain bubble.
   *
   * @default true
   */
  arrow?: boolean;
}
