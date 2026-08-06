'use client';

import { Skeleton as MuiSkeleton, skeletonClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SkeletonTypeMap } from './Skeleton.types';

/**
 * Loading placeholder. Wraps MUI `Skeleton` and stands in for content
 * that has not arrived yet — a line of text, an avatar, a thumbnail, a
 * card — so the page keeps its shape while data is fetched instead of
 * collapsing and reflowing when it lands.
 *
 * Every MUI prop survives, because there is nothing to rename. `variant`
 * already names shapes rather than Material jargon, `animation` names a
 * behaviour, and `width` / `height` / `children` / `component` / `sx` /
 * `classes` behave exactly as documented for MUI `Skeleton`.
 *
 * ## No Figma source
 *
 * Unlike every other component here, this one has no design to sync
 * against: the Product Design System library contains no skeleton,
 * placeholder, or shimmer component — a search returns only the
 * Phosphor `Spinner` / `SpinnerGap` icons. So the visual values below
 * were not transcribed from a spec, they were checked against this
 * system's palette and kept because they measured well. See
 * DESIGNER_QUESTIONS.md #24.
 *
 * Three of the four values MUI supplies were kept deliberately:
 *
 *   - **The fill is MUI's**, `alpha(palette.text.primary, 0.11)` in
 *     light and `0.13` in dark, which resolves through this system's
 *     own `grey/1100` and `grey/25`. It is translucent, and that is
 *     the point: a skeleton sits on the page surface, inside a card,
 *     or inside a card nested in a card, and a *solid* token cannot
 *     serve all three. `surface.disabled.default` — the obvious
 *     candidate — is `grey/900` in dark, which is exactly
 *     `surface.layers.card3`, so a skeleton inside a `card 3` panel
 *     would be invisible. Compositing keeps the step constant instead:
 *     roughly 25 greyscale levels below whatever is behind it in light
 *     and 30 above it in dark, on every layer in the system.
 *   - **`rounded` uses `theme.shape.borderRadius`**, which this theme
 *     already sets to `radius.sm` (8px), the design system's default
 *     control radius. Nothing to override. A skeleton standing in for
 *     a *card* wants the 24px card radius, which is `sx={{
 *     borderRadius: 3 }}` — see the examples.
 *   - **No ARIA on the root.** MUI documents this component's ARIA as
 *     "None" and the decision is right: a skeleton is decoration, and
 *     the loading *state* belongs on the region being loaded
 *     (`aria-busy`), not on each grey block inside it. Adding
 *     `aria-hidden` here would also empty a live region whose only
 *     child is a skeleton. The container-level pattern is in the
 *     examples and the accessibility notes.
 *
 * ## What this wrapper adds
 *
 * One thing: it honours `prefers-reduced-motion`. This is the first
 * component in the library with an *infinite* animation, and MUI 9's
 * own reduced-motion support is opt-in — `getReducedMotionStyles` reads
 * `theme.motion.reducedMotion`, which this theme does not set, so both
 * the pulse and the wave would otherwise keep running for a user who
 * has asked the OS for less motion. The rules below are the same ones
 * MUI would emit if the theme opted in, written unconditionally so the
 * component stays correct for consumers who bring their own theme.
 * Setting `motion: { reducedMotion: 'system' }` on the theme would fix
 * this globally, for every transition in the library, and is worth
 * doing as its own change.
 *
 * @example A line of text
 * <Skeleton width={180} />
 *
 * @example An avatar, sized from the real thing
 * <Skeleton variant="circular">
 *   <Avatar size="md" />
 * </Skeleton>
 *
 * @example A region that announces itself while loading
 * <Box aria-busy={loading} aria-live="polite">
 *   {loading ? <Skeleton width={180} /> : <Typography>{user.name}</Typography>}
 * </Box>
 *
 * @see Related: Avatar, Alert
 */
const StyledSkeleton = styled(MuiSkeleton)({
  '@media (prefers-reduced-motion: reduce)': {
    // Matches MUI's own reduced-motion styles for this component: the
    // pulse stops, and the wave's sweeping overlay is both stopped and
    // removed. Both selectors carry the variant class, so they outrank
    // MUI's animation rules, which land on the bare root class.
    [`&.${skeletonClasses.pulse}`]: {
      animation: 'none',
    },
    [`&.${skeletonClasses.wave}`]: {
      '&::after': {
        animation: 'none',
        display: 'none',
      },
    },
  },
});

StyledSkeleton.displayName = 'Skeleton';

/**
 * Cast to MUI's own declaration shape rather than left as the styled
 * component's inferred type. `styled()` collapses an
 * `OverridableComponent` down to its default-root props, and measurably
 * drops `component` altogether: without this cast, even `<Skeleton
 * component="div" />` fails with "Property 'component' does not exist",
 * while still rendering a `div` at runtime. Restating the type map
 * keeps the root swappable *and* type-checks the element's own props
 * (`<Skeleton component="li" value={1} />`) — the same fix `MenuItem`
 * uses with `ExtendButtonBase`.
 */
export const Skeleton = StyledSkeleton as OverridableComponent<SkeletonTypeMap>;
