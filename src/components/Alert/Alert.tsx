'use client';

import * as React from 'react';
import { Alert as MuiAlert, AlertTitle as MuiAlertTitle } from '@mui/material';
import {
  CheckCircle,
  Info,
  Warning,
  WarningDiamond,
  X,
} from '@phosphor-icons/react';

import type { AlertProps as MuiAlertProps } from '@mui/material';
import type { AlertProps, AlertSeverity, AlertVariant } from './Alert.types';

/**
 * Neoflo `variant` -> MUI `variant`. The Neoflo names come from the
 * Figma `style` axis; the behaviour and colour resolution stay MUI's.
 */
const muiVariantMap: Record<AlertVariant, MuiAlertProps['variant']> = {
  filled: 'filled',
  subtle: 'standard',
  outline: 'outlined',
};

/**
 * Phosphor severity icons, replacing MUI's Material defaults so alerts
 * draw from the same icon family as the rest of the system. `error`
 * uses WarningDiamond to mirror the Figma alert sheet (node 973:3010).
 * Icons inherit `currentColor`, so they track the severity text colour
 * across all three variants and both colour schemes.
 */
const defaultIconMapping: Partial<Record<AlertSeverity, React.ReactNode>> = {
  success: <CheckCircle weight="fill" />,
  info: <Info weight="fill" />,
  warning: <Warning weight="fill" />,
  error: <WarningDiamond weight="fill" />,
};

/**
 * Branded alert for inline, non-blocking feedback. Wraps MUI `Alert`
 * with the Neoflo API from the Product Design System Figma
 * (node 973:3010): four severities (error / warning / success / info)
 * across three styles (filled / subtle / outline).
 *
 * Colours resolve from the token-built theme palette, so every severity
 * and variant is correct in both light and dark mode without any
 * hardcoded values. Supports MUI's `action`, `icon`, `onClose`, and
 * `iconMapping` slots; `onClose` renders an on-brand close affordance.
 *
 * @example Inline confirmation
 * <Alert severity="success" title="Saved">Your changes are live.</Alert>
 *
 * @example Dismissible warning
 * <Alert severity="warning" variant="filled" onClose={handleDismiss}>
 *   Your trial ends in 3 days.
 * </Alert>
 *
 * @see Related: Button, IconButton
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      severity = 'info',
      variant = 'subtle',
      title,
      iconMapping,
      slots,
      children,
      ...rest
    },
    ref
  ) => (
    <MuiAlert
      ref={ref}
      severity={severity}
      variant={muiVariantMap[variant]}
      iconMapping={{ ...defaultIconMapping, ...iconMapping }}
      slots={{ closeIcon: X, ...slots }}
      {...rest}
    >
      {title ? <MuiAlertTitle>{title}</MuiAlertTitle> : null}
      {children}
    </MuiAlert>
  )
);

Alert.displayName = 'Alert';
