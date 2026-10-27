'use client';

import * as React from 'react';
import { Chip as MuiChip } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type {
  TagAppearance,
  TagColorValue,
  TagColors,
  TagProps,
  TagSize,
  TagVariant,
} from './Tag.types';

/**
 * Width of the outline.
 *
 * The sheet (node 4648:16784) draws it at 0.5. It ships at 1: a
 * half-pixel border is a physical pixel on a 2x screen and either a full
 * one or nothing on a 1x screen, depending on how the browser rounds, so
 * the drawn value is the one thing here that cannot be relied on to
 * render. See DESIGNER_QUESTIONS.md #61.
 */
const TAG_BORDER_WIDTH_PX = 1;

/** The glyph slot on both sides, at both sizes. */
const TAG_ICON_PX = 12;

/**
 * `Sans/B2/Medium` tracks -1% where the `b2` type token tracks 0, so the
 * `md` label's tracking is a literal. See DESIGNER_QUESTIONS.md #67.
 */
const MD_LABEL_TRACKING_EM = -0.01;

/**
 * `Sans/Caption - md/Medium`, the `sm` label: 11/14, no tracking. The
 * type tokens have no 11px slot — `caption` is 10/12 — so it is a
 * literal. See DESIGNER_QUESTIONS.md #73.
 */
const SM_LABEL_TYPE = { size: 11, leading: 14 } as const;

/**
 * Block padding at `sm`. The sheet binds `Scale/50`, which the component
 * spacing ladder (4/8/12/24) does not carry.
 */
const SM_PADDING_Y_PX = 2;

/**
 * Geometry per size, from node 4648:16784. `md` is 4 + 12 + 4 on the
 * block axis with a 16px line, pinned at 20; `sm` is 2 + 14 + 2, pinned
 * at 18. Both pad `Scale/100` inline and gap `Scale/100`.
 *
 * Every tag reserves the outline's 1px and gives it back out of the
 * padding, so the box is identical across `appearance` — which is how
 * the sheet draws it (a 67px contained and a 67px outlined tag), because
 * Figma strokes inside the frame while a CSS border sits outside the
 * content box. On a contained tag the reserved border is transparent and
 * the fill shows through it.
 */
const sizeStyles: Record<TagSize, CSSObject> = {
  md: {
    height: 20,
    paddingBlock: spacing.component.xxs - TAG_BORDER_WIDTH_PX,
    fontSize: typography.body.b2.size,
    lineHeight: `${typography.body.b2.leading}px`,
    letterSpacing: `${MD_LABEL_TRACKING_EM}em`,
  },
  sm: {
    height: 18,
    paddingBlock: SM_PADDING_Y_PX - TAG_BORDER_WIDTH_PX,
    fontSize: SM_LABEL_TYPE.size,
    lineHeight: `${SM_LABEL_TYPE.leading}px`,
    letterSpacing: 0,
  },
};

interface RoleTokens {
  bg: ModeToken;
  text: ModeToken;
  /**
   * The label at `outline`, where the sheet draws it a rung darker than
   * the swatch's — `success` and `error` only. Every other role keeps
   * `text`.
   */
  outlineText?: ModeToken;
  /**
   * The outline. `border/<role>/2` for every role that has a border
   * ramp, which is `defaultHover` in code, and `border/default/1` on the
   * grey. `orange` and `purple` have no border ramp in the collection
   * and the sheet binds raw `orange/300` and `purple/200`; those are the
   * light halves of `surface/orange/default pressed` and
   * `surface/purple/default pressed`, used instead so the outline has a
   * dark half. See DESIGNER_QUESTIONS.md #61.
   */
  border: ModeToken;
}

/**
 * Colour roles, read cell by cell off node 4648:16784. The sheet draws
 * no hover, pressed, focus or disabled states — a tag is a label — and
 * each role takes a different rung of its own ladder, so these are
 * copied per role rather than derived from a pattern.
 *
 * One deliberate merge: the outlined purple fills with
 * `surface/purple/subtle hover` where the contained one fills with
 * `surface/purple/default`. Both are `purple/75` in light, so it is the
 * dark half alone that would differ, and the two appearances keep one
 * fill here as every other role's do.
 */
const roleTokens: Record<TagVariant, RoleTokens> = {
  secondary: {
    bg: surface.layers.card3,
    text: text.default.b2,
    border: border.default.default,
  },
  primary: {
    bg: surface.primary.subtleHover,
    text: text.primary[3],
    border: border.primary.defaultHover,
  },
  warning: {
    bg: surface.warning.subtleHover,
    text: text.warning[0],
    border: border.warning.defaultHover,
  },
  purple: {
    bg: surface.purple.default,
    text: text.purple[2],
    border: surface.purple.defaultPressed,
  },
  success: {
    bg: surface.success.subtleHover,
    text: text.success[4],
    outlineText: text.success[3],
    border: border.success.defaultHover,
  },
  orange: {
    bg: surface.orange.default,
    text: text.orange[2],
    border: surface.orange.defaultPressed,
  },
  error: {
    bg: surface.error.subtlePressed,
    text: text.error[4],
    outlineText: text.error[3],
    border: border.error.defaultHover,
  },
  information: {
    bg: surface.information.default,
    text: text.information[3],
    border: border.information.defaultHover,
  },
};

/**
 * Lifts a `colors` value to the `{ light, dark }` shape `paired` wants.
 *
 * A token arrives as that shape already. A plain CSS colour is widened
 * to both schemes, which is the honest reading of what a caller passing
 * one bare string has said — and the reason the prop's doc asks for a
 * token instead.
 */
function asModeToken(value: TagColorValue): ModeToken {
  return typeof value === 'string' ? { light: value, dark: value } : value;
}

function colourStyles(
  theme: Theme,
  variant: TagVariant,
  appearance: TagAppearance,
  colors: TagColors | undefined
): CSSObject {
  const role = roleTokens[variant];
  const outline = appearance === 'outline';

  // `colors` overrides per key rather than wholesale, so a caller can
  // recolour the fill and leave the label on its role.
  const roleInk = outline ? (role.outlineText ?? role.text) : role.text;
  const fill = colors?.bg ? asModeToken(colors.bg) : role.bg;
  const ink = colors?.text ? asModeToken(colors.text) : roleInk;
  const line = colors?.border ? asModeToken(colors.border) : role.border;

  // One `paired` call per selector: two of them spread into the same
  // rule would drop the first one's dark block. See `pairedFocusRing`.
  return {
    // Left out of `paired` when contained, so the literal holds in both
    // schemes rather than only in light.
    borderColor: 'transparent',
    ...paired(theme, {
      backgroundColor: fill,
      color: ink,
      ...(outline ? { borderColor: line } : {}),
    }),
  };
}

interface StyledTagProps {
  neofloVariant: TagVariant;
  neofloAppearance: TagAppearance;
  neofloSize: TagSize;
  neofloColors: TagColors | undefined;
}

const StyledTag = styled(MuiChip, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize' &&
    prop !== 'neofloColors',
})<StyledTagProps>(
  ({ theme, neofloVariant, neofloAppearance, neofloSize, neofloColors }) => ({
    fontFamily: fontFamilies.product.sans,
    fontWeight: fontWeights.medium,
    paddingInline: spacing.component.xxs - TAG_BORDER_WIDTH_PX,
    gap: spacing.component.xxs,
    borderRadius: radius.xs,
    borderWidth: TAG_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    ...sizeStyles[neofloSize],
    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.component.xxs,
      padding: 0,
    },
    '& .MuiChip-icon': {
      width: TAG_ICON_PX,
      height: TAG_ICON_PX,
      margin: 0,
      color: 'inherit',
    },
    ...colourStyles(theme, neofloVariant, neofloAppearance, neofloColors),
  })
);

/**
 * The label text, kept in its own box so a long one still truncates
 * with an ellipsis now that the label slot is a flex row holding the
 * trailing glyph too.
 */
const TagText = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/** The trailing glyph, sized like MUI sizes the leading one. */
const TagEndIcon = styled('span')({
  display: 'inline-flex',
  flexShrink: 0,
  color: 'inherit',
  '& > svg': { width: TAG_ICON_PX, height: TAG_ICON_PX },
});

/**
 * Branded tag: a small coloured label for a status, a category or a
 * count. Wraps MUI `Chip` with the Neoflo API from the Product Design
 * System Figma (node 4648:16784): eight colour roles, `contained` or
 * `outline`, two heights, and an optional 12px glyph on either side.
 *
 * A tag is not a control. It has no hover, pressed, selected or
 * disabled state, and it takes no click or delete handler — reach for
 * `Button`, `ToggleButton` or `Checkbox` when the thing has to be
 * pressed.
 *
 * ## Colouring a status the roles have no colour for
 *
 * Reach for a role first. A status column is read by meaning, and the
 * roles are the vocabulary for it — `information` for in flight,
 * `success` for done, `error` for stuck. A reader cannot tell from a
 * decorative hue which of two statuses is the bad one.
 *
 * When the design genuinely has a colour the roles do not carry,
 * `colors` takes the three it paints, per key. Pass design tokens rather
 * than hexes: a token is a `{ light, dark }` pair and resolves per
 * scheme, where a bare hex is light-mode only by definition and paints
 * the same colour on a near-black page.
 *
 * @example Status tag
 * <Tag variant="success" label="Active" />
 *
 * @example A status in a table cell
 * <Tag variant="information" appearance="outline" label="Extraction" />
 *
 * @example With glyphs
 * <Tag
 *   variant="secondary"
 *   icon={<FilePdfIcon />}
 *   label="invoice.pdf"
 *   endIcon={<LockIcon />}
 * />
 *
 * @example A status the roles have no colour for
 * <Tag
 *   appearance="outline"
 *   label="Extraction"
 *   colors={{
 *     bg: surface.information.subtle,
 *     border: border.information.default,
 *     text: text.information[3],
 *   }}
 * />
 *
 * @see Related: Badge, Button, ToggleButton
 */
export const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  (
    {
      variant = 'primary',
      appearance = 'contained',
      size = 'md',
      colors,
      label,
      endIcon,
      ...rest
    },
    ref
  ) => (
    <StyledTag
      ref={ref}
      neofloVariant={variant}
      neofloAppearance={appearance}
      neofloSize={size}
      neofloColors={colors}
      label={
        endIcon ? (
          <>
            <TagText>{label}</TagText>
            <TagEndIcon aria-hidden>{endIcon}</TagEndIcon>
          </>
        ) : (
          label
        )
      }
      {...rest}
    />
  )
);

Tag.displayName = 'Tag';
