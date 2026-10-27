'use client';

import * as React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { GoogleLogoColorIcon } from '@/src/icons/brand/GoogleLogo';
import { CaretDownIcon } from '@/src/icons/glyphs';
import { fontFamilies, fontWeights, radius, spacing, typography } from '@/src/tokens';

import {
  appearanceStyles,
  OUTLINE_BORDER_WIDTH_PX,
  socialStyles,
  splitDividerStyles,
  splitRingStyles,
} from '../_shared/actionStyles';
import { Menu } from '../Menu';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ActionAppearance } from '../_shared/actionStyles';
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

/**
 * Which half of a split button a `StyledButton` is: the label's action
 * (`start`) or the caret that opens the menu (`end`).
 */
type SplitHalf = 'start' | 'end';

interface StyledButtonProps {
  neofloVariant: ButtonVariant;
  neofloAppearance: ButtonAppearance;
  neofloSize: ButtonSize;
  neofloSplit?: SplitHalf;
}

/**
 * What a split button's halves change about the plain button's box,
 * from the Figma cells with `Splitbutton=Yes` (node 4137:10495).
 *
 * The sheet draws one box: the label, a 1px rule as tall as the glyph,
 * and the caret, with the inline inset round the outside and the same
 * inset between the label and the rule. Two real buttons need two boxes,
 * so each half squares the corners it shares and the pair add up to the
 * drawn one: the label's half is `inset + content + inset` and the
 * caret's is `inset + glyph + inset`, which is 111 + 52 at `lg` and
 * matches the 163px frame.
 *
 * `outline` draws its border round the pair rather than round each half,
 * so each half gives back the border it would share. That leaves the
 * outer border and a rule in the middle, as drawn; the border width is
 * then borne by the padding on the outer side, the way `paddingFor`
 * does it for a single button.
 *
 * `borders` is returned apart because MUI redraws a full border on a
 * disabled outlined button, one specificity step above the base rule, so
 * the caller has to repeat it under `.Mui-disabled`.
 *
 * `minWidth` is cleared on the caret because MUI's 64px floor is wider
 * than the 40-52px the sheet draws it at.
 */
function splitGeometry(
  size: ButtonSize,
  appearance: ButtonAppearance,
  half: SplitHalf
): { box: CSSObject; borders: CSSObject } {
  const inline =
    appearance === 'text' ? TEXT_PADDING_INLINE_PX : sizeMetrics[size].inline;
  const inset = isBordered(appearance) ? OUTLINE_BORDER_WIDTH_PX : 0;

  if (half === 'start') {
    return {
      box: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
        paddingInlineEnd: inline,
      },
      borders: inset ? { borderInlineEndWidth: 0 } : {},
    };
  }
  return {
    box: {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      minWidth: 0,
      flexShrink: 0,
      paddingInlineStart: inline,
      paddingInlineEnd: inline - inset,
    },
    borders: inset ? { borderInlineStartWidth: 0 } : {},
  };
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize' &&
    prop !== 'neofloSplit',
})<StyledButtonProps>(({
  theme,
  neofloVariant,
  neofloAppearance,
  neofloSize,
  neofloSplit,
}) => {
  const { minHeight, label, icon } = metricsFor(neofloSize, neofloAppearance);
  const split =
    neofloSplit && splitGeometry(neofloSize, neofloAppearance, neofloSplit);
  const colours = appearanceFor(
    theme,
    neofloVariant,
    neofloAppearance,
    neofloSplit !== undefined
  );

  return {
    // 4px (`Scale/100`). The 11 August update took both action controls
    // off the stadium radius this shipped with (DESIGNER_QUESTIONS.md
    // #19); this tightens it one more rung, to the radius `Tag` draws.
    // `IconButton` and `ToggleButton` still sit at 8px, so a square icon
    // button beside a button no longer matches — see #57.
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
    ...colours,
    // After the colours: `outline` sets all four border widths, and the
    // halves take theirs back.
    ...(split && {
      ...split.box,
      ...split.borders,
      '&.Mui-disabled': {
        ...(colours['&.Mui-disabled'] as CSSObject),
        ...split.borders,
      },
    }),
    ...(neofloSplit === 'end' && {
      ...splitDividerStyles(
        theme,
        neofloVariant,
        neofloAppearance as ActionAppearance,
        icon.height
      ),
      // The menu's backdrop takes the pointer while it is open, so the
      // caret would drop back to rest under it. Holding the hover fill
      // keeps it reading as the thing that opened the menu.
      '&[aria-expanded="true"]': colours['&:hover'] as CSSObject,
    }),
  };
});

/**
 * The frame of a split button: the label's button and the caret's, side
 * by side, with the one focus ring round both. Not a MUI component —
 * there is nothing in MUI to wrap here, `ButtonGroup` being a different
 * shape (separate buttons that touch) — so the two halves are the
 * ordinary `Button` box, adjusted by `splitGeometry`.
 */
const SplitGroup = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' && prop !== 'neofloFullWidth',
})<{ neofloVariant: ButtonVariant; neofloFullWidth?: boolean }>(
  ({ theme, neofloVariant, neofloFullWidth }) => ({
    display: neofloFullWidth ? 'flex' : 'inline-flex',
    verticalAlign: 'middle',
    width: neofloFullWidth ? '100%' : undefined,
    borderRadius: radius.xs,
    ...splitRingStyles(theme, neofloVariant),
  })
);

/**
 * Colour and state styling for one appearance. `social`, the one
 * appearance `ButtonAppearance` adds on top of `ActionAppearance`,
 * answers from its own function; the other three go through the table
 * `IconButton` shares.
 *
 * `split` marks a half of a split button, whose focus ring is the
 * group's rather than its own.
 */
function appearanceFor(
  theme: Theme,
  variant: ButtonVariant,
  appearance: ButtonAppearance,
  split: boolean
): CSSObject {
  if (appearance === 'social') return socialStyles(theme);
  return appearanceStyles(theme, variant, appearance, 'button', {
    ring: !split,
  });
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
 * Passing `menu` makes it a split button: the label keeps its action
 * and a caret beside it opens the menu, anchored to the whole control
 * and closed when an option is chosen. The two are separate buttons, so
 * each has its own hover, press and focus; the focus ring runs round
 * both.
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
 * @example Split button — the label acts, the caret opens the menu
 * <Button
 *   startIcon={<HeartIcon />}
 *   onClick={save}
 *   menu={
 *     <>
 *       <MenuItem onClick={saveAs}>Save as…</MenuItem>
 *       <MenuItem onClick={saveCopy}>Save a copy</MenuItem>
 *     </>
 *   }
 * >
 *   Save
 * </Button>
 *
 * @see Related: IconButton, Menu
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      appearance = 'contained',
      size: sizeProp,
      startIcon,
      menu,
      menuLabel = 'More options',
      ...rest
    },
    ref
  ) => {
    const size = sizeProp ?? defaultSizeFor(appearance);
    const [open, setOpen] = React.useState(false);
    const groupRef = React.useRef<HTMLDivElement>(null);
    const menuId = React.useId();

    const shared = {
      variant: muiVariantMap[appearance],
      size: muiSizeMap[size],
      disableElevation: true,
      neofloVariant: variant,
      neofloAppearance: appearance,
      neofloSize: size,
    } as const;

    if (!menu || appearance === 'social') {
      return (
        <StyledButton
          ref={ref}
          {...shared}
          startIcon={leadingIconFor(appearance, startIcon)}
          {...rest}
        />
      );
    }

    const { className, style, sx, fullWidth, disabled, ...action } = rest;

    return (
      <>
        <SplitGroup
          ref={groupRef}
          className={className}
          style={style}
          sx={sx}
          neofloVariant={variant}
          neofloFullWidth={fullWidth}
        >
          <StyledButton
            ref={ref}
            {...shared}
            neofloSplit="start"
            startIcon={startIcon}
            fullWidth={fullWidth}
            disabled={disabled}
            {...action}
          />
          <StyledButton
            {...shared}
            neofloSplit="end"
            startIcon={<CaretDownIcon />}
            aria-label={menuLabel}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            disabled={disabled || Boolean(action.loading)}
            onClick={() => setOpen(true)}
          />
        </SplitGroup>
        <Menu
          id={menuId}
          anchorEl={groupRef.current}
          open={open}
          onClose={() => setOpen(false)}
          // Choosing an option closes the menu. Keyed on the row rather
          // than the click so a disabled row, a divider or a checkbox row
          // leaves it open.
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest('[role="menuitem"]:not([aria-disabled="true"])')) {
              setOpen(false);
            }
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {menu}
        </Menu>
      </>
    );
  }
);

Button.displayName = 'Button';
