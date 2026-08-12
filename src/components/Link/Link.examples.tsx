import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Link`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * No `figmaUrl`: the Product Design System has no link component, style,
 * or colour variable — only the Phosphor chain icon that shares the name.
 * See `Link.tsx` and DESIGNER_QUESTIONS.md #39.
 */
export const data: ComponentExamplesData = {
  name: 'Link',
  category: 'Navigation',
  tagline:
    'Text that navigates. An anchor with the system’s ink on it — underlined by default, because colour alone is not a signal.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The link text. Make it name the destination: it is what someone scanning a list of links reads, with none of the sentence around it.',
    },
    {
      name: 'href',
      type: 'string',
      default: '—',
      description:
        'Where it goes. Passed straight to the underlying element, so relative paths, absolute URLs, `mailto:`, `tel:`, and fragments all behave as the browser defines them. Omit it only with `component="button"`.',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'information' | 'inherit'",
      default: "'primary'",
      description:
        'Colour role. Each paints the role’s `text/<role>/body` rung and dims one rung to `caption` on hover, matching what an `outline` Button does with its label. `secondary` is the neutral link that reads as body text; `inherit` takes the colour of the copy around it, which is what a link inside an `Alert` or a caption wants.',
    },
    {
      name: 'underline',
      type: "'always' | 'hover' | 'none'",
      default: "'always'",
      description:
        'When the line is drawn, at the thickness the typeface specifies. With `always` the line sits at 40% of the link’s ink and firms up to full strength on hover, which is the component’s clearest affordance. Keep it inside a run of text; `hover` and `none` are for links already marked as links by their position — a nav item, a footer column, a title in a card.',
    },
    {
      name: 'variant',
      type: "'inherit' | 'body1' | 'body2' | 'caption' | 'h1'…'h6' | 'subtitle1' | 'subtitle2' | 'overline' | 'button'",
      default: "'inherit'",
      description:
        'The typography rung, inherited from `Typography` — not the colour role, which is `color`. The default takes the size of whatever the link sits in, which is right for inline text; set it when the link is standing on its own.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'a'",
      description:
        'Element rendered at the root, fully type-checked. `component={NextLink}` for in-app navigation; `component="button"` for a control that looks like a link but has nowhere to go.',
    },
    {
      name: 'target',
      type: 'string',
      default: '—',
      description:
        '`"_blank"` opens a new tab. Say so in the link text — a new tab moves the user without warning and disables the back button. Modern browsers imply `rel="noopener"` here; `rel="noreferrer"` is still worth adding for older ones.',
    },
    {
      name: 'align / noWrap / gutterBottom',
      type: 'TypographyOwnProps',
      default: '—',
      description:
        '`Typography`’s layout props, inherited unchanged. `noWrap` is the useful one: it truncates a long URL with an ellipsis instead of wrapping it across three lines.',
    },
    {
      name: 'classes / TypographyClasses',
      type: 'Partial<LinkClasses> / Partial<TypographyClasses>',
      default: '—',
      description:
        'MUI’s two class hooks, both intact — `.MuiLink-underlineAlways`, `.Mui-focusVisible`, and the rest are exactly as MUI documents them, because this wrapper adds no class of its own.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme>',
      default: '—',
      description:
        'One-off styling, and it genuinely wins: the wrapper’s own colour and underline go through `sx` too, and are merged *before* yours, so `sx={{ color: "text.primary" }}` overrides them rather than losing to them.',
    },
  ],
  examples: [
    {
      title: 'Inside a sentence',
      description:
        'The default case. `variant="inherit"` takes the paragraph’s size, and the underline is what marks it as a link.',
      code: `<Typography variant="body1">
  Usage resets on the first of each month. See the{' '}
  <Link href="/billing">billing settings</Link> for the current plan.
</Typography>`,
    },
    {
      title: 'Client-side navigation',
      description:
        'Hand the root to the router. Nothing else changes, and the router types `href` for you.',
      code: `import NextLink from 'next/link';

<Link component={NextLink} href="/settings/team">
  Team settings
</Link>`,
    },
    {
      title: 'A new tab, named as one',
      description:
        'The parenthetical is not noise — it is the only warning a screen-reader user gets before focus lands somewhere else.',
      code: `<Link href="https://status.neoflo.ai" target="_blank" rel="noreferrer">
  Status page (opens in a new tab)
</Link>`,
    },
    {
      title: 'Colour roles',
      description:
        'Each role rests on its `body` rung and dims to `caption` on hover, so a link matches an `outline` Button of the same role.',
      code: `<Link href="/pricing">Compare plans</Link>
<Link href="/changelog" color="secondary">What’s new</Link>
<Link href="/incidents/2431" color="error">View the incident</Link>`,
    },
    {
      title: 'Inheriting the colour around it',
      description:
        '`color="inherit"` keeps the link the colour of its copy, and the underline follows. Use it inside an `Alert`, a caption, or anything on a coloured surface.',
      code: `<Alert severity="warning">
  Your card expires this month.{' '}
  <Link href="/billing/payment" color="inherit">Update it now</Link>
</Alert>`,
    },
    {
      title: 'Underlined on hover only',
      description:
        'For links whose position already says they are links. Keep `always` anywhere the link sits inside prose.',
      code: `<Stack direction="row" spacing={3}>
  <Link href="/docs" underline="hover" color="secondary">Docs</Link>
  <Link href="/support" underline="hover" color="secondary">Support</Link>
  <Link href="/status" underline="hover" color="secondary">Status</Link>
</Stack>`,
    },
    {
      title: 'No href, so not an anchor',
      description:
        'A control that reads as a link but does something instead of going somewhere. `component="button"` gets a real button — keyboard, Space, and all — and `type="button"` keeps it from submitting a form it happens to sit in.',
      code: `<Link component="button" type="button" onClick={resendCode}>
  Resend the code
</Link>`,
    },
    {
      title: 'Standing on its own',
      description:
        'Set `variant` when the link is not inside a paragraph to take its size from.',
      code: `<Link href="/reports/q3" variant="body2">
  Q3 revenue report
</Link>`,
    },
    {
      title: 'A long URL that must not wrap',
      code: `<Link
  href={endpoint}
  variant="body2"
  noWrap
  sx={{ display: 'block', maxWidth: 320 }}
>
  {endpoint}
</Link>`,
    },
  ],
  dos: [
    'Keep the default `underline="always"` for any link inside a run of text — colour alone is not a distinguishing signal',
    'Write the destination into the link text (`billing settings`, `Q3 revenue report`), since links are read out of context',
    'Use `component={NextLink}` for in-app navigation so the app does not do a full page load',
    'Use `color="inherit"` for a link inside already-coloured copy — an `Alert` message, a caption, a heading',
    'Say in the link text when a link opens a new tab',
    'Use `component="button"` with `type="button"` when there is nothing to navigate to',
    'Reach for `Button` (or `Button appearance="text"`) when the thing is an action rather than a destination',
  ],
  donts: [
    'Don’t write "click here", "read more", or "this link" — none of them name a destination',
    'Don’t use `color="warning"` for a link on a light page: its hover rung measures 3.60:1, under the 4.5:1 that body text needs',
    'Don’t use `href="#"` with an `onClick` — that is a button wearing an anchor, and it breaks middle-click, copy-link, and the status bar',
    'Don’t nest a link inside a `Button`, a `MenuItem`, or another link — one interactive element per target',
    'Don’t remove the focus outline; if it clashes with a tight layout, adjust the offset with `sx` instead',
    'Don’t use a link for a destructive action — `color="error"` colours a link *to* something, it does not make one safe to delete with',
  ],
  relatedComponents: ['Button', 'Alert', 'MenuItem', 'Divider', 'Card'],
};
