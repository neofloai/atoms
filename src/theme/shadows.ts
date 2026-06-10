import type { Shadows } from '@mui/material/styles';
import { elevation } from '@/src/tokens';

/**
 * MUI `theme.shadows` is a fixed-length tuple of 25 strings indexed
 * 0..24. The Neoflo design system only defines three semantic levels
 * (small, medium, large) so we map MUI's elevation prop bands to them:
 *
 *   elevation = 0          -> 'none'
 *   elevation = 1          -> small   (subtle hover, focus)
 *   elevation = 2..8       -> medium  (dropdowns, tooltips)
 *   elevation = 9..24      -> large   (modals, dialogs, popovers)
 *
 * Consumers should prefer the named tokens (`elevation.small`, etc.)
 * over numeric MUI elevations when authoring wrapper components.
 */
const neofloShadows = ['none'] as string[];

neofloShadows.push(elevation.small);
for (let i = 2; i <= 8; i++) {
  neofloShadows.push(elevation.medium);
}
for (let i = 9; i <= 24; i++) {
  neofloShadows.push(elevation.large);
}

export const shadows = neofloShadows as unknown as Shadows;
