'use client';

import * as React from 'react';
import { Alert as MuiAlert, AlertTitle as MuiAlertTitle } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  WarningDiamondIcon,
  XIcon,
} from '@phosphor-icons/react';

import { border, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { IconProps } from '@phosphor-icons/react';
import type { ModeToken } from '@/src/tokens';
import type { AlertProps, AlertSeverity } from './Alert.types';

/**
 * Phosphor severity icons, replacing MUI's Material defaults so alerts
 * draw from the same icon family as the rest of the system. `error`
 * uses WarningDiamondIcon to mirror the Figma alert sheet (node
 * 973:3010). Icons inherit `currentColor`, so they track the severity
 * text colour in both `floating` states and both colour schemes.
 */
const defaultIconMapping: Partial<Record<AlertSeverity, React.ReactNode>> = {
  success: <CheckCircleIcon weight="fill" />,
  info: <InfoIcon weight="fill" />,
  warning: <WarningIcon weight="fill" />,
  error: <WarningDiamondIcon weight="fill" />,
};

/**
 * Close-icon slot. MUI passes its internal `ownerState` into slot
 * components; Phosphor icons are not MUI-aware and would forward it
 * straight onto the DOM `<svg>` (a React warning), so we strip it here
 * and render the Phosphor `XIcon` with the rest. Sized at 16px to
 * match the sheet's `X` (node 973:3010: `size-[16px]`) — Phosphor's
 * own default (24px) rendered noticeably larger than the design.
 */
const AlertCloseIcon = React.forwardRef<
  SVGSVGElement,
  IconProps & { ownerState?: unknown }
>(function AlertCloseIcon(props, ref) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop MUI's slot-internal ownerState so it never reaches the DOM
  const { ownerState, ...rest } = props;
  return <XIcon ref={ref} size={16} {...rest} />;
});

interface RoleColor {
  bg: ModeToken;
  border: ModeToken;
}

/**
 * Background + border per severity for `floating`. Node 973:3010's
 * `float=True` symbols swap in a tinted, bordered, rounded surface with
 * no icon in place of the plain tinted surface `float=False` (the
 * default, inline look) uses. `error`/`success`/`information` matched
 * the existing tokens exactly; the check surfaced a real bug in
 * `surface.warning` (see its header comment) which is now fixed.
 */
const floatingRoleTokens: Record<AlertSeverity, RoleColor> = {
  error: { bg: surface.error.default, border: border.error.default },
  warning: { bg: surface.warning.default, border: border.warning.default },
  success: { bg: surface.success.default, border: border.success.default },
  info: { bg: surface.information.default, border: border.information.default },
};

interface StyledAlertProps {
  neofloFloating: boolean;
}

const StyledAlert = styled(MuiAlert, {
  shouldForwardProp: (prop) => prop !== 'neofloFloating',
})<StyledAlertProps>(({ theme, severity, neofloFloating }) => {
  const base = {
    // MUI stretches `.MuiAlert-icon`/`.MuiAlert-message`/`.MuiAlert-action`
    // to match whichever is tallest (e.g. the close button), then only
    // `.MuiAlert-message` re-centres itself inside that extra height —
    // the icon stays pinned near its own top padding, so the gap grows
    // with however much taller the action makes the row. `flex-start`
    // keeps every child at its own natural height instead.
    alignItems: 'flex-start',
    // MUI's `.MuiAlert-icon` padding (7px) is tuned for its own default
    // 22px icon; ours (Phosphor, 24px) plus our smaller message
    // line-height leaves the icon ~3px lower than the message text's
    // visual centre. 4px lines the two up for both a bare message and
    // a title (verified against both by measuring rendered geometry).
    '& .MuiAlert-icon': { paddingTop: 4, paddingBottom: 4 },
  };
  if (!neofloFloating) return base;
  const role = floatingRoleTokens[severity ?? 'info'];
  return {
    ...base,
    ...paired(theme, { backgroundColor: role.bg, borderColor: role.border }),
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: theme.shape.borderRadius,
  };
});

/**
 * Branded alert for inline, non-blocking feedback. Wraps MUI `Alert`
 * with the Neoflo API from the Product Design System Figma
 * (node 973:3010, resynced 2026-07-29): four severities (error /
 * warning / success / info), plus `floating` for the sheet's
 * `float=True` treatment — a tinted, bordered, rounded surface with no
 * icon, for Alert used as a toast (e.g. inside MUI's `Snackbar`) rather
 * than inline in the page. The sheet's only two axes are `state` and
 * `float`; both are modelled literally (`severity`, `floating`) — there
 * is no `style`/emphasis axis, so unlike an earlier version of this
 * component there is no `variant` prop (see DESIGNER_QUESTIONS.md #17).
 *
 * Colours resolve from the token-built theme palette (and, for
 * `floating`, the shared surface/border tokens), so every severity is
 * correct in both light and dark mode without any hardcoded values.
 * Supports MUI's `action`, `icon`, `onClose`, and `iconMapping` slots;
 * `onClose` renders an on-brand close affordance.
 *
 * @example Inline confirmation
 * <Alert severity="success" title="Saved">Your changes are live.</Alert>
 *
 * @example Dismissible warning
 * <Alert severity="warning" onClose={handleDismiss}>
 *   Your trial ends in 3 days.
 * </Alert>
 *
 * @example Floating (toast)
 * <Snackbar open>
 *   <Alert severity="success" floating>Changes saved.</Alert>
 * </Snackbar>
 *
 * @see Related: Button, IconButton
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { severity = 'info', floating = false, title, icon, iconMapping, slots, children, ...rest },
    ref
  ) => (
    <StyledAlert
      ref={ref}
      severity={severity}
      neofloFloating={floating}
      icon={icon ?? (floating ? false : undefined)}
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
