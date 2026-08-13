'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';

import { border, fontWeights, spacing, text, typography } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { NavbarTitleProps } from './Navbar.types';

/**
 * Gap between the title and the line of context under it — `Scale/100`.
 *
 * The two lines' own leadings do the rest: 28 for the title, 16 for the
 * meta row, which with this 4px puts the pair at exactly 48 — the height
 * a `md` bar reserves between its 12px insets.
 */
const TITLE_GAP_PX = spacing.component.xxs;

/** Space either side of a meta separator — `Scale/250`. */
const META_SEPARATOR_GAP_PX = spacing.component.sm;

/**
 * Gap between a meta item's glyph and its label.
 *
 * The frame draws a 14px glyph 6px clear of its label. The house small
 * glyph is 16, and 16 + 4 lands the label on the same 20px offset the
 * frame does — so the item measures identically while using the system's
 * icon size and a spacing token rather than the frame's two odd numbers.
 */
const META_ICON_GAP_PX = spacing.component.xxs;

/** Glyph size in the meta row — the house small glyph. */
export const NAVBAR_META_ICON_PX = 16;

const TitleRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: TITLE_GAP_PX,
  minWidth: 0,
});

const TitleLine = styled('h1')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.fontFamily,
  fontSize: typography.headings.h5.size,
  fontWeight: fontWeights.medium,
  lineHeight: `${typography.headings.h5.leading}px`,
  letterSpacing: `${typography.headings.h5.letterSpacing}em`,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...paired(theme, { color: text.default.heading }),
}));

const MetaRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  fontFamily: theme.typography.fontFamily,
  fontSize: typography.body.b2.size,
  fontWeight: fontWeights.medium,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${typography.body.b2.letterSpacing}em`,
  // One muted ink for the row, glyphs included — the icons inherit it
  // through `currentColor`, which is how a Phosphor icon takes its colour.
  ...paired(theme, { color: text.default.caption }),
}));

const MetaItem = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: META_ICON_GAP_PX,
  minWidth: 0,
  whiteSpace: 'nowrap',
  '& svg': { flexShrink: 0 },
});

/**
 * The rule between two meta items — `border/default/1`, which is the token
 * the frame binds and the one `Divider` draws.
 *
 * Drawn here rather than delegated to MUI's `Divider`, which paints
 * `palette.divider`: in dark mode that resolves to a shade of the panel it
 * would sit on, which is the whole reason this library wraps `Divider` at
 * all. Wrapping the house `Divider` instead would work, but a vertical
 * `Divider` brings a `role="separator"` and a height calculation for what
 * is one border on a stretched box.
 *
 * Stretches to the row's 16px leading rather than pinning a height, so the
 * rule cannot come loose from the type it divides.
 */
const MetaSeparator = styled('span')(({ theme }) => ({
  alignSelf: 'stretch',
  marginInline: META_SEPARATOR_GAP_PX,
  borderLeftWidth: 1,
  borderLeftStyle: 'solid',
  ...paired(theme, { borderColor: border.default.default }),
}));

/**
 * The title block for a `md` navbar — a page title with an optional line
 * of context under it.
 *
 * The one part of a page header that is geometry rather than composition,
 * which is why it is a component: the `h5` title, the 4px gap, and a meta
 * row whose items are 16px glyphs 4px clear of a `b2` label, separated by
 * 12px and a vertical rule. Assembling that by hand at every call site is
 * how two page headers drift apart — the same reason `DialogTitle` exists
 * rather than a stack of `Typography`.
 *
 * The whole block is one flex column that centres itself, so it can sit
 * directly in the bar's row beside a toggle and a group of actions.
 *
 * ## What it does not own
 *
 * The actions. Those are `Button`s the caller puts in the bar after this
 * block, because their roles are decisions about the page rather than
 * about the header — a destructive action is `variant="error"`, a
 * confirmation is `contained`, and no header can know which it has.
 *
 * @example A record header
 * <Navbar size="md">
 *   <IconButton variant="secondary" appearance="text" size="sm" aria-label="Open navigation">
 *     <ListIcon />
 *   </IconButton>
 *   <NavbarTitle
 *     meta={[
 *       { icon: <TicketIcon size={16} />, label: '#345' },
 *       { icon: <UserIcon size={16} />, label: 'Nike Sales' },
 *       { icon: <CalendarBlankIcon size={16} />, label: '05 Jun 2025' },
 *     ]}
 *   >
 *     Matching
 *   </NavbarTitle>
 *   <Box sx={{ flex: 1 }} />
 *   <Button variant="error" appearance="outline" size="sm">Reject</Button>
 *   <Button size="sm" endIcon={<ArrowRightIcon size={16} />}>Validate</Button>
 * </Navbar>
 *
 * @example Title only
 * <Navbar size="md">
 *   <NavbarTitle>Vendor details</NavbarTitle>
 * </Navbar>
 *
 * @see Related: Navbar, Drawer, Button, IconButton
 */
export const NavbarTitle = React.forwardRef<HTMLDivElement, NavbarTitleProps>(
  ({ meta, children, ...rest }, ref) => (
    <TitleRoot ref={ref} {...rest}>
      <TitleLine>{children}</TitleLine>
      {meta && meta.length > 0 && (
        <MetaRow>
          {meta.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <MetaSeparator aria-hidden />}
              <MetaItem>
                {item.icon}
                {item.label}
              </MetaItem>
            </React.Fragment>
          ))}
        </MetaRow>
      )}
    </TitleRoot>
  )
);

NavbarTitle.displayName = 'NavbarTitle';
