/**
 * Elevation / shadow tokens.
 *
 * Three Figma effect styles confirmed in the Neoflo Product Design
 * System file:
 *
 *   - `small`  buttons, input focus, slight elevation
 *   - `medium` dropdowns, tooltips, floating elements
 *   - `large`  modals, dialogs, popovers
 *
 * `large` is the authoritative value pulled from a card sample in
 * Figma (node 953:3035). `small` and `medium` are still placeholders
 * pending designer confirmation — see DESIGNER_QUESTIONS.md #10.
 */

export const elevation = {
  // Placeholder until the designer supplies the resolved spec.
  small: '0px 1px 2px 0px rgba(22, 22, 20, 0.08)',
  // Placeholder until the designer supplies the resolved spec.
  medium:
    '0px 2px 4px 0px rgba(22, 22, 20, 0.10), 0px 4px 8px 0px rgba(22, 22, 20, 0.06)',
  // Confirmed from Figma node 953:3035 — two stacked drop shadows.
  large:
    '0px 4px 8px 0px rgba(22, 22, 20, 0.16), 0px 8px 16px 0px rgba(22, 22, 20, 0.08)',
} as const;

export type ElevationTokens = typeof elevation;
