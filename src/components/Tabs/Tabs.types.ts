import type * as React from 'react';
import type {
  TabProps as MuiTabProps,
  TabsProps as MuiTabsProps,
} from '@mui/material';

/**
 * Public API for the tab family — `Tabs` and `Tab`, the two components
 * MUI documents on one page, from the Product Design System Figma
 * (node 3463:12374).
 *
 * MUI's prop surface survives almost whole. Two props are dropped, two
 * are added, and nothing is renamed.
 *
 * ## Dropped
 *
 * - `textColor`. MUI uses it to pick which palette colour the label
 *   takes. This design has no such axis: the label is neutral in every
 *   cell (`text/default/b1` selected, `b3` unselected) and colour
 *   appears only in the indicator. Leaving the prop in would let a
 *   caller set a value the wrapper then paints over.
 * - `indicatorColor`. Same reason, from the other end — Figma draws one
 *   indicator colour (`border/primary/3`), so there is nothing to
 *   choose between. `Divider` and `Progress` narrow their MUI props the
 *   same way when the design ships a single value.
 *
 * ## Added
 *
 * - `disabled` on `Tabs`, which is the Figma `enabled` axis of the bar
 *   (node 3463:12630 draws the whole row disabled, not one tab). It
 *   cascades to every child through context, and a child can still
 *   disable itself on its own. MUI has the same bar-level flag on
 *   `ToggleButtonGroup`; it just never added one to `Tabs`.
 * - `count` on `Tab`, which is the Figma `tag` axis — the small pill of
 *   numbers beside the label. Figma models it as a boolean plus a
 *   nested `chip-small` instance; here the value *is* the prop, so
 *   `count={12}` turns it on.
 *
 * ## Kept, with a note
 *
 * `variant` on `Tabs` stays MUI's word for the overflow behaviour
 * (`standard` / `scrollable` / `fullWidth`), not the house meaning of
 * "colour role" it carries on `Button` and `Chip`. There is no colour
 * role on this component for it to collide with, and renaming it would
 * put the docs out of step with MUI's own Tabs page for no gain —
 * the same call `Link` made for its `variant`.
 */

/**
 * `Tabs` props. Everything not listed here is MUI's, unchanged: `value`
 * + `onChange(event, value)` for the selection model, `orientation`,
 * `variant`, `centered`, `scrollButtons`, `allowScrollButtonsMobile`,
 * `visibleScrollbar`, `selectionFollowsFocus`, `action`, `slots` /
 * `slotProps`, plus `sx` / `classes` / `component`.
 */
export interface TabsProps
  extends Omit<MuiTabsProps, 'textColor' | 'indicatorColor'> {
  /**
   * Disables every tab in the bar, and dims the indicator with it. This
   * is the Figma `enabled` axis. A child `Tab` can also carry its own
   * `disabled`; the two are OR-ed, so the bar can never re-enable a tab
   * that opted out.
   *
   * @default false
   */
  disabled?: boolean;
}

/**
 * `Tab` props. Everything not listed here is MUI's, unchanged: `label`,
 * `value`, `disabled`, `icon`, `iconPosition`, `wrapped`,
 * `disableFocusRipple`, plus `sx` / `classes` / `component` and the rest
 * of `ButtonBase`.
 *
 * `Tabs` clones its children to hand them `value`, `selected`,
 * `onChange` and the indicator, so a `Tab` only works inside one — the
 * same contract MUI documents.
 */
export interface TabProps extends MuiTabProps {
  /**
   * A count shown after the label in a small pill — how many rows,
   * matches, or unread items sit behind this tab.
   *
   * Rendered as `Chip size="sm"`, which is the component Figma nests
   * here, so the pill is the same one used everywhere else.
   */
  count?: React.ReactNode;
}
