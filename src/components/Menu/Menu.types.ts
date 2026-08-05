import type { MenuProps as MuiMenuProps } from '@mui/material';

/**
 * Props for the Neoflo `Menu`.
 *
 * Identical to MUI's `MenuProps` — nothing is remapped, nothing is
 * removed, nothing is added. The Figma panel (node 3228:62331) has a
 * single appearance with no variant axis of its own, so there is no
 * Neoflo vocabulary to put in front of MUI's. `open`, `anchorEl`,
 * `onClose`, the `anchorOrigin` / `transformOrigin` positioning props
 * inherited from `Popover`, `slots` / `slotProps`, `transitionDuration`,
 * `autoFocus`, `disableAutoFocusItem`, and MUI's own focus `variant`
 * (`'menu' | 'selectedMenu'`) all pass through untouched. The wrapper
 * exists to carry the surface styling, not to change the API.
 *
 * Declared as an alias rather than an empty `interface … extends` so it
 * tracks MUI's declaration exactly, including props added in future
 * MUI releases. Consumers can still extend it:
 *
 *   interface AccountMenuProps extends MenuProps {
 *     onSignOut: () => void;
 *   }
 */
export type MenuProps = MuiMenuProps;
