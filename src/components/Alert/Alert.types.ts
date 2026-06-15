import type { AlertProps as MuiAlertProps } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Semantic state of the alert, mapped from the Figma `state` axis
 * (node 973:3010). Drives both the colour and the default icon.
 */
export type AlertSeverity = 'error' | 'warning' | 'success' | 'info';

/**
 * Visual emphasis, mapped from the Figma `style` axis. Mirrors MUI's
 * `variant`, renamed for the Neoflo API:
 *
 *   - `filled`  -> MUI `filled`   (solid severity surface)
 *   - `subtle`  -> MUI `standard` (tinted surface, the default)
 *   - `outline` -> MUI `outlined` (1px border, transparent surface)
 */
export type AlertVariant = 'filled' | 'subtle' | 'outline';

/**
 * Props for the Neoflo `Alert`.
 *
 * Extends MUI's `AlertProps` minus the props we remap (`variant`,
 * `severity`, `color`). Everything else — `action`, `icon`,
 * `iconMapping`, `onClose`, `slots`, `sx` — passes through. Colours come
 * from the token-built theme palette, never from inline values.
 */
export interface AlertProps
  extends Omit<MuiAlertProps, 'variant' | 'severity' | 'color' | 'title'> {
  /** Semantic state driving colour and icon. @default 'info' */
  severity?: AlertSeverity;
  /** Visual emphasis. @default 'subtle' */
  variant?: AlertVariant;
  /** Optional bold title rendered above the message. */
  title?: ReactNode;
}
