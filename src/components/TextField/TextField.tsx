'use client';

import * as React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  ASTERISK_GAP_PX,
  adornmentBox,
  adornmentButton,
} from '../_shared/fieldStyles';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { TextFieldProps, TextFieldStatus } from './TextField.types';

/**
 * Field inset + icon/text gap (Scale/200) from the fresh Figma export
 * (node 3179:106156). Resolves DESIGNER_QUESTIONS.md #15 — the earlier
 * 16px measurement was against a stale node; this export uses 8px
 * uniformly, which the spacing scale already names (`spacing.component.xs`).
 */
const FIELD_PADDING_PX = spacing.component.xs;

const statusBorderTokens: Record<TextFieldStatus, ModeToken> = {
  error: border.error.focus,
  success: border.success.focus,
  warning: border.warning.focus,
};

/**
 * Label + helper text colour per status (node 3179:106156). The `focus`
 * step happens to be the exact saturated shade the status rows use at
 * rest — see the `border.ts`/`text.ts`/`icon.ts` sync notes.
 */
const statusTextTokens: Record<TextFieldStatus, ModeToken> = {
  error: text.error.onColorHover,
  success: text.success.onColorHover,
  warning: text.warning.caption,
};

interface StyledTextFieldProps {
  neofloStatus?: TextFieldStatus;
}

const StyledTextField = styled(MuiTextField, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus',
})<StyledTextFieldProps>(({ theme, neofloStatus }) => {
  const labelFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.b2.leading}px`,
  };

  const fieldFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b1.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.b1.leading}px`,
    letterSpacing: `${typography.body.b1.letterSpacing}em`,
  };

  const helperFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.caption.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.caption.leading}px`,
    letterSpacing: `${typography.body.caption.letterSpacing}em`,
  };

  const styles: CSSObject = {
    // Static label above the field, with the character counter
    // right-aligned on the same row (Figma's "1/100").
    '& .MuiInputLabel-root': {
      position: 'static',
      transform: 'none',
      maxWidth: 'none',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      // Packed from the start, with the counter claiming the slack
      // below. `space-between` was the obvious way to push the counter
      // right and it is wrong here, because MUI renders the required
      // asterisk as a *sibling* of the label text rather than inside
      // it: on a required field with no counter the asterisk became
      // the second flex item and got thrown to the far edge, so `PO
      // Number *` on a 244px field put its mark 228px from the word it
      // belongs to — closer to the next column's label than its own.
      justifyContent: 'flex-start',
      padding: `0 ${FIELD_PADDING_PX}px`,
      marginBottom: spacing.component.xxs,
      ...labelFont,
      ...paired(theme, { color: text.default.placeholder }),
      // MUI's InputLabel colours itself with the theme's primary colour
      // on focus by default; the Figma label stays neutral except when
      // a status is set (handled separately below).
      '&.Mui-focused': paired(theme, { color: text.default.placeholder }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
      // MUI's asterisk node is the string " *", and that leading space
      // sits at the start of a flex item's line box, where it
      // collapses. This is the space put back.
      '& .MuiFormLabel-asterisk': { marginLeft: ASTERISK_GAP_PX },
      '& .Neoflo-TextField-counter': {
        // What `space-between` used to do, asked for by the one element
        // that actually wants it.
        marginLeft: 'auto',
        ...helperFont,
        ...paired(theme, { color: text.default.placeholder }),
      },
      '&.Mui-disabled .Neoflo-TextField-counter': paired(theme, {
        color: text.disabled.default,
      }),
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: radius.sm,
      // Inset from the border on every edge; `gap` only spaces the
      // icon/input/icon children apart from each other, not from the
      // box edges, so it can't stand in for this on its own.
      padding: FIELD_PADDING_PX,
      gap: FIELD_PADDING_PX,
      ...fieldFont,
      ...paired(theme, {
        color: text.default.body,
        backgroundColor: surface.layers.page,
      }),
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1,
        ...paired(theme, { borderColor: border.layers.card1 }),
        // The label renders outside the field, so collapse the notch.
        '& legend': { width: 0 },
      },
      // Focus keeps the resting border on three sides and recolours
      // only the bottom edge (node 3179:106156's focused variant) — an
      // underline accent rather than a full border colour swap. MUI's
      // OutlinedInput sets its own `.Mui-focused` border colour (theme
      // primary) and doubles the width, so both must be cancelled
      // explicitly before the bottom-edge override is applied.
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1,
        // `borderColor` (all sides) then `borderBottomColor` in one
        // `paired()` call, in that order, so the bottom override wins
        // in both colour schemes without either clobbering the other's
        // dark-mode selector.
        ...paired(theme, {
          borderColor: border.layers.card1,
          borderBottomColor: border.primary.focus,
        }),
      },
      '&.Mui-disabled': {
        ...paired(theme, {
          color: text.disabled.default,
          backgroundColor: surface.disabled.default,
        }),
        '& .MuiOutlinedInput-notchedOutline': paired(theme, {
          borderColor: border.layers.card2,
        }),
      },
    },
    '& .MuiOutlinedInput-input': {
      height: 'auto',
      padding: 0,
      '&::placeholder': {
        opacity: 1,
        ...paired(theme, { color: text.default.placeholder }),
      },
      '&.Mui-disabled': {
        ...paired(theme, { color: text.disabled.default }),
        WebkitTextFillColor: 'unset',
      },
    },
    // Multiline padding lives on the root, not the textarea.
    '& .MuiInputBase-inputMultiline': { padding: 0 },
    '& .MuiInputAdornment-root': {
      ...adornmentBox(),
      ...paired(theme, { color: text.default.caption }),
    },
    // Any button in either adornment, whether or not it is wrapped in an
    // `InputAdornment`: one circular target, one ripple, and no effect on
    // the field's height. Without this, an `IconButton` at the end took
    // the house `sm` size of 32px and pushed a 36px field to 48px, so two
    // fields in the same form disagreed depending on what they carried.
    // See `../_shared/fieldStyles.ts`.
    '& .MuiInputAdornment-root .MuiIconButton-root, & .MuiOutlinedInput-root > .MuiIconButton-root':
      adornmentButton(theme),
    '& .MuiFormHelperText-root': {
      margin: `${spacing.component.xxs}px 0 0`,
      padding: `0 ${FIELD_PADDING_PX}px`,
      ...helperFont,
      ...paired(theme, { color: text.default.placeholder }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
    },
  };

  if (!neofloStatus) {
    // No status: a subtle tint communicates hover and "has a value"
    // (node 3179:106156's `hover`/`filled` variants) — skipped entirely
    // once a status colours the border instead.
    styles['& .MuiOutlinedInput-root'] = {
      ...(styles['& .MuiOutlinedInput-root'] as CSSObject),
      '&:hover:not(.Mui-focused):not(.Mui-disabled), &[data-filled="true"]:not(.Mui-focused):not(.Mui-disabled)':
        paired(theme, { backgroundColor: surface.layers.card1 }),
    };
  } else {
    // Status colour wins over the resting, hover, and focused borders,
    // and recolours the label + helper text (the counter stays neutral).
    styles[
      [
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline',
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline',
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline',
      ].join(', ')
    ] = paired(theme, { borderColor: statusBorderTokens[neofloStatus] });
    // Merged into the existing selector (not a separate `:not(.Mui-disabled)`
    // rule) so the nested `&.Mui-disabled` override -- one class more
    // specific -- always wins regardless of declaration order.
    styles['& .MuiInputLabel-root'] = {
      ...(styles['& .MuiInputLabel-root'] as CSSObject),
      ...paired(theme, { color: statusTextTokens[neofloStatus] }),
    };
    styles['& .MuiFormHelperText-root'] = {
      ...(styles['& .MuiFormHelperText-root'] as CSSObject),
      ...paired(theme, { color: statusTextTokens[neofloStatus] }),
    };
  }

  return styles;
});

/**
 * Branded text input. Wraps MUI `TextField` with the Neoflo API from
 * the Product Design System Figma (node 3179:106156): static label
 * above the field with an optional character counter, a 1px border
 * with hover / focus / disabled styling, validation statuses that
 * colour the border and label/helper text, and single or multi-line
 * input in both colour schemes.
 *
 * Multi-line behaviour maps to the Figma variants: `minRows`/`maxRows`
 * grows with content (flexible), `rows` fixes the height and scrolls
 * overflow (inflexible / scroll).
 *
 * @example Labelled field with helper text
 * <TextField label="Email" placeholder="you@neoflo.ai" helperText="Work email preferred" />
 *
 * @example Validation error
 * <TextField label="Amount" status="error" helperText="Amount is required" />
 *
 * @example Character counter
 * <TextField label="Bio" maxLength={100} />
 *
 * @example Fixed-height multi-line
 * <TextField label="Notes" multiline rows={4} />
 */
export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
      status,
      startAdornment,
      endAdornment,
      maxLength,
      label,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledLength, setUncontrolledLength] = React.useState(
      () => String(defaultValue ?? '').length
    );
    const length = isControlled ? String(value ?? '').length : uncontrolledLength;

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (!isControlled) setUncontrolledLength(event.target.value.length);
      onChange?.(event);
    };

    return (
      <StyledTextField
        ref={ref}
        variant="outlined"
        error={status === 'error'}
        neofloStatus={status}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        label={
          maxLength === undefined || !label ? (
            label
          ) : (
            <React.Fragment>
              {label}
              <span className="Neoflo-TextField-counter">
                {length}/{maxLength}
              </span>
            </React.Fragment>
          )
        }
        slotProps={{
          inputLabel: { shrink: true, disableAnimation: true },
          input: {
            notched: false,
            startAdornment,
            endAdornment,
            // MUI's OutlinedInput spreads unknown props onto its root DOM
            // node, but its slot type doesn't model arbitrary `data-*`
            // attributes -- cast needed for the "has a value" bg tint hook.
            'data-filled': length > 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          htmlInput: maxLength === undefined ? undefined : { maxLength },
        }}
        {...rest}
      />
    );
  }
);

TextField.displayName = 'TextField';
