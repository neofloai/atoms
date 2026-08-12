'use client';

import * as React from 'react';
import { Switch as MuiSwitch, switchClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';

import type { SwitchProps } from './Switch.types';

/*
 * Track (28x12) and thumb (16) are the three dimensions specified for
 * this control; MUI's own `size="medium"` defaults are 34x14 and 20.
 * Every remaining number is derived from those three rather than
 * hand-picked, using MUI's own internal relationships so the parts stay
 * in proportion:
 *   - switchBase padding (the ripple's inset around the thumb, and so
 *     its radius) scales off MUI's own thumb:padding ratio — 9 for a
 *     20px thumb, hence 7 for 16. Left at MUI's literal 9 it drew a
 *     34px ripple around a 16px thumb, proportionally far heavier than
 *     the 38-around-20 MUI itself ships; 7 restores that ratio at 30.
 *   - thumb overhang past the track = (thumb - track height) / 2, the
 *     amount by which a thumb taller than its track has to spill. MUI
 *     applies it on all four sides (its 20/14 default spills 3px, and
 *     its root padding is exactly switchBase padding + 3), so both root
 *     paddings below add it to the switchBase padding — 2px here.
 *   - root width/height = track + 2x the matching root padding.
 *   - checked translateX = root width - thumb - 2x switchBase padding,
 *     which lands the thumb's trailing overhang exactly opposite its
 *     resting one.
 * This only targets `size="medium"` (the default); `size="small"` is
 * unaffected, since nothing here is conditioned on it.
 */
const THUMB_SIZE_PX = 16;
const TRACK_WIDTH_PX = 28;
const TRACK_HEIGHT_PX = 12;
/** MUI's own ripple inset is 9 for its 20px thumb — scaled to ours. */
const SWITCH_BASE_PADDING_PX = 7;
const THUMB_OVERHANG_PX = (THUMB_SIZE_PX - TRACK_HEIGHT_PX) / 2;
const ROOT_PADDING_X_PX = SWITCH_BASE_PADDING_PX + THUMB_OVERHANG_PX;
const ROOT_PADDING_Y_PX = SWITCH_BASE_PADDING_PX + THUMB_OVERHANG_PX;
const ROOT_WIDTH_PX = TRACK_WIDTH_PX + ROOT_PADDING_X_PX * 2;
const ROOT_HEIGHT_PX = TRACK_HEIGHT_PX + ROOT_PADDING_Y_PX * 2;
const CHECKED_TRANSLATE_X_PX =
  ROOT_WIDTH_PX - THUMB_SIZE_PX - SWITCH_BASE_PADDING_PX * 2;

/*
 * TODO(DESIGNER_QUESTIONS.md #32): every colour below comes back from
 * `get_variable_defs` on the Figma switch set (node 3650:26506) as a
 * raw scale variable (`grey/300`, `grey/400`, `grey/125`,
 * `primary/200`, `primary/400`, `primary/75`) rather than a named
 * semantic token, and the file exports one mode only, so nothing here
 * has an exact same-family token match. Each value is the nearest
 * *exact-hex* token regardless of family (`surface` reused for the
 * thumb's border colour, `border` reused for the disabled thumb's
 * fill), mirroring how Checkbox/Radio resolved the same gap.
 * `color="default"` is fixed below so MUI's own per-palette-colour
 * variant never fires and fights these rules for the checked
 * track/thumb colour.
 */
const StyledSwitch = styled(MuiSwitch)(({ theme }) => ({
  width: ROOT_WIDTH_PX,
  height: ROOT_HEIGHT_PX,
  padding: `${ROOT_PADDING_Y_PX}px ${ROOT_PADDING_X_PX}px`,

  [`& .${switchClasses.switchBase}`]: {
    padding: SWITCH_BASE_PADDING_PX,
  },

  [`& .${switchClasses.track}`]: {
    opacity: 1,
    ...paired(theme, { backgroundColor: surface.default.defaultPressed }),
  },
  [`& .${switchClasses.thumb}`]: {
    width: THUMB_SIZE_PX,
    height: THUMB_SIZE_PX,
    ...paired(theme, {
      backgroundColor: surface.default.default,
      borderColor: border.primary.defaultHover,
    }),
  },

  /*
   * MUI's own switchBase carries an unconditional
   * `&.checked {transform:translateX(20px)}`, declared directly on
   * switchBase's own generated class — an equal-specificity tie
   * against a same-shape selector here, which resolved in MUI's
   * favour in earlier testing (its default 20px overshot a narrower
   * root and clipped the thumb behind `overflow: hidden`). Repeating
   * `.switchBase` below adds one more class than MUI's own rule can
   * match, so this wins outright regardless of stylesheet insertion
   * order.
   */
  [`& .${switchClasses.switchBase}.${switchClasses.checked}`]: {
    transform: `translateX(${CHECKED_TRANSLATE_X_PX}px)`,
  },

  /*
   * MUI's own switchBase carries an unconditional
   * `&.checked + .track {opacity:.5}` (and the disabled equivalent),
   * declared directly on switchBase's own generated class — an
   * equal-specificity tie against a same-shape selector here that
   * resolved in MUI's favour in testing, leaving the checked/disabled
   * track visibly washed out. Repeating `.switchBase` in the selectors
   * below adds one more class than MUI's own rule can match, so these
   * win outright instead of depending on stylesheet insertion order.
   * Checked is declared before disabled so a disabled + checked switch
   * falls through to the muted disabled colours instead of the primary
   * ones (both ties on specificity; later wins).
   */
  [`& .${switchClasses.switchBase}.${switchClasses.checked} + .${switchClasses.track}`]:
    {
      opacity: 1,
      ...paired(theme, { backgroundColor: surface.primary.defaultPressed }),
    },
  [`& .${switchClasses.switchBase}.${switchClasses.checked} .${switchClasses.thumb}`]:
    paired(theme, {
      backgroundColor: surface.primary.defaultHover,
      borderColor: surface.soft.defaultPressed,
    }),

  [`& .${switchClasses.switchBase}.${switchClasses.disabled} + .${switchClasses.track}`]:
    {
      opacity: 1,
      ...paired(theme, { backgroundColor: surface.default.defaultPressed }),
    },
  [`& .${switchClasses.switchBase}.${switchClasses.disabled} .${switchClasses.thumb}`]:
    {
      ...paired(theme, { backgroundColor: border.default.defaultHover }),
      borderColor: 'transparent',
    },
}));

/**
 * Branded switch. Wraps MUI `Switch` with the track/thumb colours from
 * the Product Design System Figma switch set (node 3650:26506) —
 * muted grey track and thumb off, primary-filled track with a primary
 * thumb on, and disabled styling in both colour schemes. The default
 * `size="medium"` runs on a 28x12 track with a 16px thumb, tighter than
 * MUI's own 34x14 / 20px; every other measurement is derived from those
 * so the parts stay in MUI's own proportions. Interaction behaviour —
 * keyboard toggling, the ripple, the sliding transition, the thumb
 * shadow — is MUI default throughout.
 *
 * Pass `label` to render a clickable label beside the control.
 *
 * @example Labelled switch
 * <Switch label="Enable notifications" defaultChecked />
 *
 * @example Controlled, no visible label
 * <Switch aria-label="Enable notifications" checked={enabled} onChange={handleToggle} />
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, 'aria-label': ariaLabel, ...rest }, ref) => {
    const control = (
      <StyledSwitch
        ref={ref}
        color="default"
        slotProps={{ input: { 'aria-label': ariaLabel } }}
        {...rest}
      />
    );

    if (label === undefined || label === null) {
      return control;
    }

    return <SelectorFormControlLabel control={control} label={label} />;
  }
);

Switch.displayName = 'Switch';
