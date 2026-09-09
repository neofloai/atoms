import { colors } from './colors';

/**
 * Icon semantic tokens.
 *
 * Same Figma-verbatim naming as `text` — see `./text.ts` for how a
 * variable name maps to a property path — and the same shape, so an
 * icon beside a body string takes the matching rung:
 * `icon.default.b2` sits next to `text.default.b2`.
 *
 * As of this export the accent ladders hold identical *values* to their
 * text counterparts; only `default.subtle` and `disabled['on-color']`
 * differ. The one naming difference is `warning`, which starts at `1`
 * here and `0` on `text` (DESIGNER_QUESTIONS.md #56).
 *
 * Generated from the Figma "component" collection DTCG export
 * (2026-09-09) — never hand-edit.
 */

import type { ModeToken } from './surface';
export type { ModeToken };

export const icon = {
  default: {
    heading: { light: colors.grey[1200], dark: colors.grey[25] },
    b1: { light: colors.grey[800], dark: colors.grey[300] },
    b2: { light: colors.grey[650], dark: colors.grey[600] },
    b3: { light: colors.grey[625], dark: colors.grey[650] },
    subtle: { light: colors.grey[500], dark: colors.grey[700] },
    "heading on-color": { light: colors.grey[25], dark: colors.grey[1100] },
    "body on-color": { light: colors.grey[100], dark: colors.grey[900] },
    "caption on-color": { light: colors.grey[300], dark: colors.grey[700] },
    "placeholder on-color": { light: colors.grey[500], dark: colors.grey[600] },
  },
  primary: {
    1: { light: colors.primary[700], dark: colors.primary[200] },
    2: { light: colors.primary[600], dark: colors.primary[300] },
    3: { light: colors.primary[500], dark: colors.primary[400] },
    4: { light: colors.primary[400], dark: colors.primary[500] },
  },
  information: {
    1: { light: colors.blue[700], dark: colors.blue[200] },
    2: { light: colors.blue[600], dark: colors.blue[300] },
    3: { light: colors.blue[500], dark: colors.blue[400] },
    4: { light: colors.blue[400], dark: colors.blue[500] },
  },
  success: {
    1: { light: colors.green[700], dark: colors.green[100] },
    2: { light: colors.green[600], dark: colors.green[200] },
    3: { light: colors.green[500], dark: colors.green[300] },
    4: { light: colors.green[400], dark: colors.green[400] },
  },
  error: {
    1: { light: colors.red[700], dark: colors.red[100] },
    2: { light: colors.red[600], dark: colors.red[200] },
    3: { light: colors.red[500], dark: colors.red[300] },
    4: { light: colors.red[400], dark: colors.red[400] },
  },
  warning: {
    1: { light: colors.yellow[800], dark: colors.yellow[300] },
    2: { light: colors.yellow[700], dark: colors.yellow[400] },
    3: { light: colors.yellow[600], dark: colors.yellow[500] },
    4: { light: colors.yellow[500], dark: colors.yellow[500] },
  },
  orange: {
    0: { light: colors.orange[800], dark: colors.orange[100] },
    2: { light: colors.orange[700], dark: colors.orange[200] },
    3: { light: colors.orange[600], dark: colors.orange[300] },
    4: { light: colors.orange[500], dark: colors.orange[400] },
  },
  purple: {
    1: { light: colors.purple[700], dark: colors.purple[200] },
    2: { light: colors.purple[600], dark: colors.purple[300] },
    3: { light: colors.purple[500], dark: colors.purple[400] },
    4: { light: colors.purple[400], dark: colors.purple[500] },
  },
  disabled: {
    default: { light: colors.grey[500], dark: colors.grey[700] },
    "on-color": { light: colors.grey[500], dark: colors.grey[600] },
  },
} as const;

export type IconTokens = typeof icon;
