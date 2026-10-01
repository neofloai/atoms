'use client';

import * as React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { GoogleLogoColorIcon } from '@/src/icons/brand/GoogleLogo';
import { fontFamilies, fontWeights, radius, spacing, typography } from '@/src/tokens';

import {
  appearanceStyles,
  OUTLINE_BORDER_WIDTH_PX,
  socialStyles,
} from '../_shared/actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';
import type {
  ButtonAppearance,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './Button.types';

const muiVariantMap: Record<
  ButtonAppearance,
  'contained' | 'outlined' | 'text'
> = {
  contained: 'contained',
  outline: 'outlined',
  // `social` carries a border, so it takes the outlined variant's box
  // even though it also paints a fill.
  social: 'outlined',
  text: 'text',
};

const muiSizeMap: Record<ButtonSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
  // MUI stops at `large`; the geometry is all ours either way.
  xl: 'large',
};

/**
 * `Scale/300`, the inline inset at `lg`. Not on `spacing.component`,
 * which jumps 12 -> 24 and has no 16 rung — the same gap
 * `tableTokens` works around. See DESIGNER_QUESTIONS.md #61.
 */
const INLINE_INSET_LG_PX = 16;

/**
 * One rung of the type scale. `typography` does not export its own slot
 * type, and the two rungs this file mixes (`headings.h6` and `body.b1`)
 * widen to different literal types without it.
 */
interface LabelType {
  readonly size: number;
  readonly leading: number;
  readonly letterSpacing: number;
}

/**
 * Control height, inline padding, glyph size and label rung per size,
 * from the September redraw of the Figma component set
 * (node 4137:10437). The whole ladder moved: every height came down
 * one rung (44/36/32 -> 40/32/28), the inline inset stopped being a
 * constant 12 and now steps with the size, `md`'s glyph came down to
 * 16 to match `sm`, and `lg` was promoted off the body rung onto
 * `Sans/H6/Medium`.
 *
 * `lg` is now the only size with a heading-sized label, which is what
 * makes it read as a page-level control rather than a big toolbar
 * button.
 */
const sizeMetrics: Record<
  ButtonSize,
  {
    readonly height: number;
    readonly inline: number;
    readonly icon: number;
    readonly label: LabelType;
  }
> = {
  // The page-level size: the 48px button that sits beside a page title.
  // It began life as a gradient `prominent` appearance (Revamp UI sheet,
  // node 1367:48486); the gradient was dropped and the geometry kept, so
  // it is now just the top rung — 12 + 24 + 12 on the h6 leading, the
  // same arithmetic as the rest — and takes every role and appearance.
  xl: {
    height: 48,
    inline: spacing.component.sm,
    icon: 20,
    label: typography.headings.h6,
  },
  lg: {
    height: 40,
    inline: INLINE_INSET_LG_PX,
    icon: 20,
    label: typography.headings.h6,
  },
  md: {
    height: 32,
    inline: spacing.component.sm,
    icon: 16,
    label: typography.body.b1,
  },
  sm: {
    height: 28,
    inline: spacing.component.xs,
    icon: 16,
    label: typography.body.b1,
  },
};

/**
 * Vertical padding, derived rather than pinned: whatever centres the
 * label's line box inside the drawn height.
 *
 * That gives 8 / 6 / 4, and the sheet agrees at `lg` (`Scale/200`) and
 * `sm` (`Scale/100`). It disagrees at `md`, which is drawn 32 tall with
 * `Scale/200` on a 20px line box — 36px of content in a 32px frame,
 * which Figma resolves by clipping and CSS would resolve by growing the
 * button. Height is the thing the redraw was about, so height wins and
 * the padding follows it. Logged as DESIGNER_QUESTIONS.md #66.
 */
function blockPaddingFor(size: ButtonSize): number {
  const { height, label } = sizeMetrics[size];
  return (height - label.leading) / 2;
}

/**
 * Padding for one size + appearance, in pixels.
 *
 * Two adjustments to the raw Figma numbers, both so the three
 * appearances line up at the same height and left edge the way the
 * component set draws them:
 *
 *   - `outline` and `social` give back their border width on all four
 *     sides. A Figma stroke drawn *inside* takes no layout space — it
 *     paints over the padding, so an outlined `lg` cell is border 1,
 *     padding 16/8 and content 328x24 in a 360x40 frame, the same box
 *     as a filled one. A CSS border sits outside the padding instead,
 *     so without this the button comes out 2px wider and 2px taller
 *     than the filled one beside it, with its content inset 1px further
 *     on every side. Giving the border back makes the content box and
 *     the outer box identical to Figma's; the padding then *reads* one
 *     less in devtools (15/7 against 16/8) because CSS draws that pixel
 *     beside the padding where Figma draws it on top.
 *   - `text` is inset less than the other two — 8px against 12/16 —
 *     which is the relationship MUI keeps between its own text and
 *     filled buttons (8 against 16). Figma gives it `Scale/0` at every
 *     size (node 4137:10504), which was right while a hovered text
 *     button took no fill; now that it shades, a flush label would have
 *     the fill running straight into the glyphs on both sides. Recorded
 *     in DESIGNER_QUESTIONS.md #45 with the hover change that caused it.
 */
const TEXT_PADDING_INLINE_PX = spacing.component.xs;

/** The two appearances that draw a 1px border. */
function isBordered(appearance: ButtonAppearance): boolean {
  return appearance === 'outline' || appearance === 'social';
}

function paddingFor(size: ButtonSize, appearance: ButtonAppearance): CSSObject {
  const inset = isBordered(appearance) ? OUTLINE_BORDER_WIDTH_PX : 0;
  const inline =
    appearance === 'text' ? TEXT_PADDING_INLINE_PX : sizeMetrics[size].inline;
  return {
    paddingBlock: blockPaddingFor(size) - inset,
    paddingInline: inline - inset,
  };
}

/**
 * `social`'s glyph, which stays 16 at every size.
 *
 * Drawn that way in all three frames (nodes 4149:5558, 4203:9266,
 * 4203:9275), so it is a rule rather than an artefact of one instance,
 * and it is off the ladder only at `lg` — where every other appearance
 * takes 20. A brand mark is a badge of whose account this is, not an
 * interface glyph that should scale with the control's emphasis.
 */
const SOCIAL_ICON_PX = 16;

function iconPxFor(size: ButtonSize, appearance: ButtonAppearance): number {
  if (appearance === 'social') return SOCIAL_ICON_PX;
  return sizeMetrics[size].icon;
}

/** Type and box for one appearance + size, all from the `size` ladder. */
function metricsFor(size: ButtonSize, appearance: ButtonAppearance) {
  const { height, label } = sizeMetrics[size];
  const icon = iconPxFor(size, appearance);
  return {
    minHeight: height,
    label,
    icon: { width: icon, height: icon },
  };
}

interface StyledButtonProps {
  neofloVariant: ButtonVariant;
  neofloAppearance: ButtonAppearance;
  neofloSize: ButtonSize;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize',
})<StyledButtonProps>(({
  theme,
  neofloVariant,
  neofloAppearance,
  neofloSize,
}) => {
  const { minHeight, label, icon } = metricsFor(neofloSize, neofloAppearance);

  return {
    // 4px (`Scale/100`). The 11 August update took both action controls
    // off the stadium radius this shipped with, matching the move Chip
    // already made (DESIGNER_QUESTIONS.md #19); this tightens it one more
    // rung. `IconButton`, `ToggleButton` and `Chip` still sit at 8px, so a
    // square icon button beside a button no longer matches — see #57.
    borderRadius: radius.xs,
    fontFamily: fontFamilies.product.sans,
    fontSize: label.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${label.leading}px`,
    letterSpacing: `${label.letterSpacing}em`,
    textTransform: 'none',
    boxShadow: 'none',
    gap: spacing.component.xs,
    '&:hover': { boxShadow: 'none' },
    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
      margin: 0,
    },
    '& .MuiButton-startIcon > *, & .MuiButton-endIcon > *': { ...icon },
    minHeight,
    ...paddingFor(neofloSize, neofloAppearance),
    ...appearanceFor(theme, neofloVariant, neofloAppearance),
  };
});

/**
 * Colour and state styling for one appearance. `social`, the one
 * appearance `ButtonAppearance` adds on top of `ActionAppearance`,
 * answers from its own function; the other three go through the table
 * `IconButton` shares.
 */
function appearanceFor(
  theme: Theme,
  variant: ButtonVariant,
  appearance: ButtonAppearance
): CSSObject {
  if (appearance === 'social') return socialStyles(theme);
  return appearanceStyles(theme, variant, appearance, 'button');
}

/**
 * The size a caller gets without asking: `md` for everything except
 * `social`, which defaults to `lg` because that is the size the sheet
 * draws it at first (node 4149:5558) and the size a sign-in column
 * wants. `md` and `sm` stay available by passing `size` explicitly.
 */
function defaultSizeFor(appearance: ButtonAppearance): ButtonSize {
  return appearance === 'social' ? 'lg' : 'md';
}

/**
 * The leading glyph, which `social` fills in for itself.
 *
 * Every social sign-in button in the sheet is a Google one, and a
 * "Continue with Google" with no mark in it is the shape of a bug
 * rather than a design. So the mark is the default rather than
 * something each call site remembers.
 *
 * `undefined` rather than a falsy check, so the two ways of not
 * wanting it stay distinguishable: passing nothing takes the Google
 * mark, and passing `null` takes no mark at all. Any other appearance
 * is left exactly as the caller wrote it.
 */
function leadingIconFor(
  appearance: ButtonAppearance,
  startIcon: React.ReactNode
): React.ReactNode {
  if (appearance !== 'social' || startIcon !== undefined) return startIcon;
  return <GoogleLogoColorIcon />;
}

/**
 * Branded action button. Wraps MUI `Button` with the Neoflo API from
 * the Product Design System Figma: five colour roles, four emphasis
 * levels, four sizes, full hover / pressed / focus / disabled state
 * styling in both colour schemes.
 *
 * `size="xl"` is the page-level size — 48px with a heading-sized label,
 * for the one action a screen exists for, beside its title. It paints
 * like every other size: pick the role with `variant` and the emphasis
 * with `appearance`.
 *
 * `appearance="social"` is the sign-in CTA — a near-white card inside a
 * neutral hairline, sized to hold someone else's logo and wordmark.
 * `variant` has no effect on it, it defaults to `size="lg"`, and it
 * supplies the Google mark as its own `startIcon` unless the caller
 * passes one.
 *
 * @example Primary call to action
 * <Button variant="primary">Submit</Button>
 *
 * @example The action a page exists for
 * <Button size="xl" startIcon={<UploadSimpleIcon />}>
 *   Add Invoice
 * </Button>
 *
 * @example Sign in with Google — the mark comes for free
 * <Button appearance="social" fullWidth>Continue with Google</Button>
 *
 * @example Sign in with someone else — pass their mark, or `null` for none
 * <Button appearance="social" fullWidth startIcon={<AppleLogoIcon />}>
 *   Continue with Apple
 * </Button>
 *
 * @example Low-emphasis destructive action
 * <Button variant="error" appearance="text">Delete account</Button>
 *
 * @see Related: IconButton
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      appearance = 'contained',
      size: sizeProp,
      startIcon,
      ...rest
    },
    ref
  ) => {
    const size = sizeProp ?? defaultSizeFor(appearance);
    return (
      <StyledButton
        ref={ref}
        variant={muiVariantMap[appearance]}
        size={muiSizeMap[size]}
        disableElevation
        neofloVariant={variant}
        neofloAppearance={appearance}
        neofloSize={size}
        startIcon={leadingIconFor(appearance, startIcon)}
        {...rest}
      />
    );
  }
);

Button.displayName = 'Button';
