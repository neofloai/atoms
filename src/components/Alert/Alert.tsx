'use client';

import * as React from 'react';
import { AlertTitle as MuiAlertTitle } from '@mui/material';

import { ALERT_ICON, AlertCloseIcon } from '../_shared/alertIcons';
import { StyledAlert } from './alertStyles';

import type { AlertProps, AlertSeverity } from './Alert.types';

/**
 * MUI's Material mapping, replaced by the one glyph the sheet draws.
 *
 * A full record rather than a bare `icon` prop so `iconMapping` keeps
 * working: passing `icon` directly would win over it and silently retire
 * a documented prop.
 */
const defaultIconMapping: Record<AlertSeverity, React.ReactNode> = {
  error: ALERT_ICON,
  warning: ALERT_ICON,
  success: ALERT_ICON,
  info: ALERT_ICON,
};

/**
 * Branded alert for non-blocking feedback. Wraps MUI `Alert` with the
 * Neoflo API from the Product Design System Figma (node 973:3010,
 * resynced 2026-08-18).
 *
 * The sheet's only two axes are `state` and `float`, and both are
 * modelled literally as `severity` and `floating`. There is no
 * `style`/emphasis axis, so there is no `variant` prop.
 *
 * ## The composition
 *
 * Icon, then a title with the message under it, then an action and a
 * close — in that order, at every severity, in both styles. The title
 * carries what happened at 13px and the message carries what it means at
 * 10px; the two are separated by size and colour, not by weight.
 *
 * The sheet no longer draws an untitled alert, so `title` is what this
 * component is built around even though the prop stays optional. Without
 * one, the message takes the title's own type slot rather than rendering
 * as a lone 10px line.
 *
 * ## The two styles
 *
 * `floating` is the sheet's `float=True`: a tinted surface, a 1px border
 * in the severity's own colour, and an 8px corner — a card sitting on top
 * of the page. That is what `Snackbar` uses it for.
 *
 * The default is `float=False`: a near-white tint of the same colour,
 * square, no border. It is drawn full-bleed, so it belongs to the region
 * it sits at the top of rather than to itself.
 *
 * Both styles show the icon. An earlier version of this component
 * suppressed it under `floating`; the resynced sheet draws it in both.
 *
 * Every colour resolves from the surface, border, text and icon token
 * groups, so all four severities are correct in light and dark without a
 * hardcoded value anywhere. MUI's `action`, `icon`, `iconMapping` and
 * `onClose` slots all still pass through.
 *
 * @example The composition the sheet draws
 * <Alert severity="success" title="Changes saved">
 *   Your edits are live for everyone on the team.
 * </Alert>
 *
 * @example A failure with somewhere to go
 * <Alert
 *   severity="error"
 *   title="Payment failed"
 *   action={<Button variant="secondary" size="sm">Update card</Button>}
 * >
 *   We could not charge the card on file.
 * </Alert>
 *
 * @example Dismissible, floating
 * <Alert
 *   severity="warning"
 *   floating
 *   title="Trial ending"
 *   onClose={handleDismiss}
 * >
 *   Three days left, then the workspace goes read-only.
 * </Alert>
 *
 * @see Related: Snackbar for the same alert as a transient toast, Button
 * and IconButton for what goes in `action`.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      severity = 'info',
      floating = false,
      title,
      icon,
      iconMapping,
      slots,
      children,
      ...rest
    },
    ref
  ) => (
    <StyledAlert
      ref={ref}
      severity={severity}
      neofloFloating={floating}
      neofloHasTitle={title !== undefined && title !== null}
      icon={icon}
      iconMapping={{ ...defaultIconMapping, ...iconMapping }}
      slots={{ closeIcon: AlertCloseIcon, ...slots }}
      {...rest}
    >
      {title ? <MuiAlertTitle>{title}</MuiAlertTitle> : null}
      {children}
    </StyledAlert>
  )
);

Alert.displayName = 'Alert';
