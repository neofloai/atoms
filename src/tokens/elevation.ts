/**
 * Elevation / shadow tokens.
 *
 * Three Figma effect styles, confirmed via the `styles.effectStyles`
 * export (2026-07-29) — see DESIGNER_QUESTIONS.md #10:
 *
 *   - `small`  buttons, input focus, slight elevation
 *   - `medium` dropdowns, tooltips, floating elements
 *   - `large`  modals, dialogs, popovers
 *
 * Each is two stacked drop shadows.
 */

export const elevation = {
  small:
    '0px 1px 2px 0px rgba(22, 22, 20, 0.08), 0px 2px 4px 0px rgba(22, 22, 20, 0.04)',
  medium:
    '0px 2px 4px 0px rgba(22, 22, 20, 0.08), 0px 4px 8px 0px rgba(22, 22, 20, 0.04)',
  large:
    '0px 2px 8px 0px rgba(22, 22, 20, 0.08), 0px 16px 16px 0px rgba(22, 22, 20, 0.04)',
} as const;

export type ElevationTokens = typeof elevation;
