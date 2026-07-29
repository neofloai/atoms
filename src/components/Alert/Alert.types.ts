import type { AlertProps as MuiAlertProps } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Semantic state of the alert, mapped from the Figma `state` axis
 * (node 973:3010). Drives both the colour and the default icon.
 */
export type AlertSeverity = 'error' | 'warning' | 'success' | 'info';

/**
 * Props for the Neoflo `Alert`.
 *
 * Extends MUI's `AlertProps` minus the props we remap (`variant`,
 * `severity`, `color`) — `variant` is dropped entirely: the component
 * set (node 973:3010, resynced 2026-07-29) has only two axes, `state`
 * and `float`, both modelled below (`severity`, `floating`); there is
 * no `style`/emphasis axis in the design (see DESIGNER_QUESTIONS.md
 * #17). Everything else — `action`, `icon`, `iconMapping`, `onClose`,
 * `slots`, `sx` — passes through. Colours come from the token-built
 * theme palette, never from inline values.
 */
export interface AlertProps
  extends Omit<MuiAlertProps, 'variant' | 'severity' | 'color' | 'title'> {
  /** Semantic state driving colour and icon. @default 'info' */
  severity?: AlertSeverity;
  /**
   * Render as a floating/toast surface — tinted background, coloured
   * border, rounded corners, and no default icon — instead of the
   * plain inline surface. Mapped from the Figma `float` axis (node
   * 973:3010); pair with MUI's `Snackbar` for toast placement.
   * @default false
   */
  floating?: boolean;
  /** Optional bold title rendered above the message. */
  title?: ReactNode;
}
