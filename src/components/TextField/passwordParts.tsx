'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';

import { CheckIcon, EyeIcon, EyeSlashIcon, XIcon } from '@/src/icons/glyphs';
import { icon, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  FIELD_ROW_GLYPH_PX,
  FIELD_ROW_INSET_PX,
  FIELD_STACK_GAP_PX,
  fieldType,
} from '../_shared/fieldStyles';
import { IconButton } from '../IconButton';
import { InputAdornment } from './InputAdornment';

import type { PasswordRequirement } from './TextField.types';

/**
 * What `type="password"` adds to `TextField`, from the Password field
 * sheet (node 4680:7190): the show / hide toggle at the end of the field,
 * the checklist of rules under it, and the forgot-password row. The field
 * itself is the ordinary one — same box, label row, sizes and statuses.
 */

/**
 * The field and the rows under it, stacked at the field's own gap. The
 * form control inside stays the field's root, so `ref` and every input
 * prop still reach it; `className`, `style` and `sx` land here, so they
 * move the checklist and the link along with it.
 */
export const PasswordStack = styled('div', {
  shouldForwardProp: (prop) => prop !== 'neofloFullWidth',
})<{ neofloFullWidth?: boolean }>(({ neofloFullWidth }) => ({
  display: neofloFullWidth ? 'flex' : 'inline-flex',
  flexDirection: 'column',
  gap: FIELD_STACK_GAP_PX,
  verticalAlign: 'top',
  width: neofloFullWidth ? '100%' : undefined,
}));

/**
 * The show / hide toggle. The eye while the password is hidden, the
 * slashed eye while it shows. Sized and inked by the field like any other
 * button in an adornment.
 */
export function PasswordToggle({
  visible,
  onToggle,
  disabled,
  controls,
  showLabel,
  hideLabel,
}: {
  visible: boolean;
  onToggle: () => void;
  disabled?: boolean;
  controls?: string;
  showLabel: string;
  hideLabel: string;
}): React.JSX.Element {
  return (
    <InputAdornment position="end">
      <IconButton
        appearance="text"
        variant="secondary"
        size="sm"
        aria-label={visible ? hideLabel : showLabel}
        aria-controls={controls}
        disabled={disabled}
        onClick={onToggle}
        // Keeps the caret in the field: pressing the toggle should not
        // take focus from what is being typed.
        onMouseDown={(event) => event.preventDefault()}
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </IconButton>
    </InputAdornment>
  );
}

PasswordToggle.displayName = 'PasswordToggle';

/**
 * The checklist (node 4680:7191). One row per rule in the helper row's
 * type, `Sans/Caption - md/Medium`, with a 14px cross in `icon/default/b3`
 * until the rule is met and a tick in `icon/success/4` after, the label
 * going from `text/default/b2` to `text/success/4` with it. `Scale/100`
 * round the list and between its rows, inset like the helper.
 */
const List = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: FIELD_STACK_GAP_PX,
  margin: 0,
  padding: `${FIELD_STACK_GAP_PX}px ${FIELD_ROW_INSET_PX}px`,
  listStyle: 'none',
  ...fieldType.helper,
  '& > li': {
    display: 'flex',
    alignItems: 'center',
    gap: FIELD_STACK_GAP_PX,
    ...paired(theme, { color: text.default.b2 }),
  },
  '& > li > svg': {
    width: FIELD_ROW_GLYPH_PX,
    height: FIELD_ROW_GLYPH_PX,
    flexShrink: 0,
    ...paired(theme, { color: icon.default.b3 }),
  },
  '& > li[data-met="true"]': paired(theme, { color: text.success[4] }),
  '& > li[data-met="true"] > svg': paired(theme, { color: icon.success[4] }),
}));

/** Words for a screen reader, which cannot see a cross turn into a tick. */
const Announce = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});

export function PasswordRequirements({
  requirements,
}: {
  requirements: readonly PasswordRequirement[];
}): React.JSX.Element {
  return (
    <List aria-live="polite">
      {requirements.map((rule, index) => (
        <li key={index} data-met={rule.met}>
          {rule.met ? <CheckIcon aria-hidden /> : <XIcon aria-hidden />}
          <span>{rule.label}</span>
          <Announce>{rule.met ? ', met' : ', not met'}</Announce>
        </li>
      ))}
    </List>
  );
}

PasswordRequirements.displayName = 'PasswordRequirements';

/**
 * The "Forgot Password?" row (node 4690:13740): right-aligned, inset like
 * the label, in the label's `Sans/B2/Medium` and `text/default/b1`. A
 * `Link` placed here inherits both.
 */
export const ForgotPasswordRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: `0 ${FIELD_ROW_INSET_PX}px`,
  ...fieldType.label,
  ...paired(theme, { color: text.default.b1 }),
}));
