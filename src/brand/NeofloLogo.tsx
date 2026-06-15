'use client';

import * as React from 'react';
import Box from '@mui/material/Box';

import { fontFamilies, fontWeights } from '@/src/tokens';

export type NeofloLogoVariant = 'mark' | 'full';

export interface NeofloLogoProps {
  /** `mark` renders the icon only; `full` adds the neoflo wordmark. @default 'mark' */
  variant?: NeofloLogoVariant;
  /** Height of the icon mark in px; the wordmark scales from it. @default 24 */
  size?: number;
  /** Accessible label for the logo. @default 'Neoflo' */
  title?: string;
}

/**
 * The Neoflo brand mark, traced from the Product Design System Figma
 * (node 2080:23676). A single `Union` path at a 32x32 viewBox.
 */
const MARK_PATH =
  'M18.2629 13.5504C18.332 13.6374 18.4114 13.716 18.4993 13.7844C19.6383 14.67 21.2216 13.4748 20.6595 12.1537L17.9008 5.66977C17.548 4.84067 17.7377 3.88274 18.3804 3.24663L21.0063 0.64805C21.8795 -0.216016 23.2951 -0.216017 24.1683 0.64805L30.449 6.86349C31.2312 7.63754 31.3238 8.86125 30.6669 9.74198L27.2981 14.2586C25.6235 16.5039 26.0549 19.6597 28.2723 21.3839L31.1455 23.6182C32.1995 24.4377 32.2929 25.9845 31.3451 26.9225L27.0042 31.2182C26.0564 32.1562 24.4934 32.0637 23.6652 31.0208L13.7263 18.5037C13.6584 18.4182 13.5804 18.341 13.494 18.2739C12.375 17.4039 10.8197 18.5781 11.3719 19.8759L14.132 26.3628C14.4848 27.1919 14.2952 28.1499 13.6524 28.786L11.0594 31.352C10.1863 32.216 8.77063 32.216 7.89749 31.352L1.61603 25.1358C0.834169 24.3621 0.741252 23.139 1.39743 22.2582L4.71144 17.8102C6.38438 15.5648 5.95218 12.4103 3.73544 10.6868L0.854577 8.44698C-0.199478 7.62746 -0.292956 6.0806 0.654891 5.14261L4.99554 0.847088C5.94339 -0.0909086 7.50651 0.00160266 8.33463 1.04471L18.2629 13.5504Z';

/**
 * Neoflo brand logo. Monochrome and inheriting `currentColor`, so it
 * renders dark on light surfaces and light on dark surfaces from a
 * single source — no separate light/dark assets needed. Source:
 * Product Design System Figma (node 2080:23676).
 *
 * Set the colour by setting `color` on an ancestor (or via `sx`/CSS);
 * the mark follows `currentColor`.
 *
 * @example
 * <NeofloLogo />                          // icon mark, 24px
 * <NeofloLogo variant="full" size={28} /> // mark + wordmark
 */
export function NeofloLogo({
  variant = 'mark',
  size = 24,
  title = 'Neoflo',
}: NeofloLogoProps) {
  const isFull = variant === 'full';

  // In the full lockup the visible wordmark already announces "neoflo",
  // so the mark is decorative; standalone it carries the label.
  const mark = (
    <Box
      component="svg"
      viewBox="0 0 32 32"
      {...(isFull
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': title })}
      sx={{
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
        color: 'inherit',
      }}
    >
      <path d={MARK_PATH} fill="currentColor" />
    </Box>
  );

  if (!isFull) return mark;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${size * 0.25}px`,
        color: 'inherit',
      }}
    >
      {mark}
      <Box
        component="span"
        sx={{
          fontFamily: fontFamilies.marketing.sans,
          fontWeight: fontWeights.medium,
          fontSize: size * 1.125,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'currentColor',
        }}
      >
        neoflo
      </Box>
    </Box>
  );
}

NeofloLogo.displayName = 'NeofloLogo';
