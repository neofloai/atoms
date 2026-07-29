# Designer Questions

Open questions for the design team. Once resolved, update the relevant token/theme files and delete the item from this list.

> **Note:** Since this doc was first written, the designer shipped a Figma DTCG token export (`light.tokens.json` + `dark.tokens.json`). It supersedes the earlier PDFs and answered several items below. Resolved questions are marked **RESOLVED** with a brief note; unresolved ones are still pending.

---

## Colors & Palette

### 1. `primary/600` value conflict — RESOLVED
The Figma DTCG export confirms `primary/600 = #014ce1`. Tokens are already on this value.

---

### 2. Primary button resting color — RESOLVED
The Figma DTCG export's `surface.primary.default.light` is `primary/600` (`#014ce1`), which matches the MUI Mapping PDF. The original "Colors PDF" snippet showing `primary/500` is now superseded. Tokens keep `primary.main = primary/600`.

---

### 3. `secondary` palette role
The Mapping PDF maps `secondary` to the grey scale: `light = grey/25`, `main = grey/100`, `dark = grey/300`.

These are very light neutrals. A secondary button or chip will render almost white.

**Confirm:** Is this intentional? Or should `secondary` map to a more saturated accent color?

---

### 4. `orange` scale — no palette role, no semantic usage
The Colors PDF includes a full `orange` scale but it is **not referenced by any semantic token in the Figma DTCG export** (`surface`, `border`, `text`, `icon` all skip it) and it is not mapped to any MUI palette role.

Orange is available in the raw token layer (`colors.orange[*]`) but no component will use it automatically. Avatar was briefly the one direct consumer (its `accent` default) but the 29 July resync (node 981:16471, see #16) replaced that with a subtle primary tint, so `orange` is currently unused anywhere in `src/`.

**Confirm:**
- Is `orange` intended as a standalone token only (used by specific components directly)?
- Or should it replace one of the existing palette roles? If so, which one?

---

## Dark Mode

### 5. Dark mode MUI palette mapping — RESOLVED (derived)
The Figma DTCG export provides full `{ light, dark }` values for every semantic token, which makes the dark-mode mapping derivable. The current `darkPalette` in `src/theme/palette.ts` uses the designer's shift pattern:

- `primary` and `error` shift *lighter* in dark mode (resting on `primary/400` and `red/300` per the surface tokens).
- `warning`, `info`, `success` keep the same shade family across modes.
- `background` / `text` / `divider` are pulled directly from the matching semantic tokens.

If the design team wants explicit per-role `light / main / dark` slots (as a sibling document to the original Mapping PDF), provide them and we'll override.

---

### 6. Dark mode toggle strategy
Currently using **`'system'` default mode** with a 3-way toggle (System / Light / Dark) in the docs top bar, persisted to `localStorage`. New visitors follow their OS preference; the user can override.

**Confirm:** Is this the right default for the production npm package as well, or should consumers be forced into one mode?

---

## Missing Tokens

### 7. Typography scale — RESOLVED (2026-07-29 token sync)
Resolved by a full `styles.textStyles` + primitive font export:

| Confirmed in Figma | Status |
|---|---|
| Font family — Product: **DM Sans** (replaces Plus Jakarta Sans) + **Instrument Serif** | Self-hosted via `@fontsource`, wired into `src/theme/fonts.ts` and the MUI theme. |
| Font family — Marketing: **Clash Grotesk** | Still not self-hosted (Fontshare, not on Google Fonts). Fallback updated to DM Sans (was Plus Jakarta Sans, now retired). |
| Font family — Mono: **Space Mono** | Declared in Figma; exposed as `fontFamilies.product.mono` but not self-hosted — no component consumes it yet. |
| Font weights: Regular (400), Medium (500), SemiBold (600) | DM Sans has no Bold cut; `fontWeights.bold` was replaced with `fontWeights.semibold` in `src/tokens/typography.ts`. |
| Slots: `D1, H1-H6, B1-B3` (each `size` + `leading` + `letterSpacing`, Medium/Regular cuts) | Real values in `src/tokens/typography.ts`, no longer placeholders. `H5`/`H6` were previously computed fallbacks off `H4` — now real Figma values. `caption` maps to `Sans/B3`. |

Still pending: `subtitle1 / subtitle2 / button / overline` are not defined in Figma — currently using MUI defaults. `D1` (display) has no MUI variant mapping yet — available as a raw token only.

---

### 8. Spacing scale — RESOLVED
The Figma DTCG export provides a t-shirt-sized scale (`none, xxs, xs, sm, md, lg, xl, xxl` → `0, 4, 8, 12, 24, 48, 64, 96` px). Now in `src/tokens/spacing.ts` and rendered on `/tokens`.

Sub-question still pending: should we override MUI's default `theme.spacing()` to map to this named scale (so `<Box p="md">` works), or keep `spacing` as a standalone import?

---

### 9. Border radius scale — RESOLVED (engineer convenience layer)
Confirmed by the design team: Figma does not define a semantic radius layer. Designers apply corner radius directly using the shared `Scale/*` primitive set (the same one that backs spacing/gap/stroke).

We added an engineer-side convenience layer in `src/tokens/radius.ts` (`none, xs, sm, md, lg, xl, full`) using the same numeric ladder as `spacing` so the two stay in lockstep with Figma's `Scale/*`. `theme.shape.borderRadius` is set to `radius.sm` (8px) as the global default. Confirmed in Figma (node 953:3035): card corner radius = 24px → `radius.xl`.

Heads-up: this is an *engineering* abstraction. If the designer later names semantic radius tokens in Figma, we will switch `src/tokens/radius.ts` to source from those values.

---

### 10. Elevation / shadow scale — RESOLVED (2026-07-29 token sync)
The Figma `styles.effectStyles` export confirms all three semantic shadow levels (each two stacked drop shadows):

| Token | Intended usage (per Figma description) | Value |
|---|---|---|
| `elevation.small` | Buttons, input focus, slight elevation. | `0px 1px 2px rgba(22,22,20,0.08), 0px 2px 4px rgba(22,22,20,0.04)` |
| `elevation.medium` | Dropdowns, tooltips, floating elements. | `0px 2px 4px rgba(22,22,20,0.08), 0px 4px 8px rgba(22,22,20,0.04)` |
| `elevation.large` | Modals, dialogs, popovers. | `0px 2px 8px rgba(22,22,20,0.08), 0px 16px 16px rgba(22,22,20,0.04)` |

Note the `large` value changed from the previous node-953:3035-derived spec (`0px 4px 8px rgba(...,0.16), 0px 8px 16px rgba(...,0.08)`) — the fresh export supersedes it.

The names are wired into `src/tokens/elevation.ts` and mapped across MUI's 25 shadow slots (`elevation=1` → small, `2-8` → medium, `9-24` → large).

---

### 11. `contrastText` on palette roles
MUI auto-calculates `contrastText` (the label color on a filled button) using WCAG luminance against `main`.

For some roles this may not match the designer's intent — e.g. `warning.main = yellow/600 (#e5ae2f)` will auto-pick black text, which is technically correct but the designer may want something specific.

**Confirm:** Is auto-computed `contrastText` acceptable for all 6 palette roles, or are there specific overrides?

---

## Surface / Border / Text → Theme Integration

### 12. Wiring semantic tokens into MUI's theme
Currently `surface`, `border`, and `text` tokens are plain TypeScript exports. Components can import them directly but they don't participate in MUI's automatic light/dark switching via the `sx` prop or `styled()`.

To enable syntax like `sx={{ bgcolor: 'surface.primary.default' }}` with auto mode switching, the tokens need to be registered as custom CSS variables in the MUI theme. This requires module augmentation and a moderate amount of theme setup.

**Confirm:** Should this be done now (before any components are built), or deferred until the first component that needs it?

---

## Components

### 13. Button — width behaviour across sizes (added 10 June)
The Button component set (node 983:17180) defines per-size **heights** (48 / 40 / 32px) and **vertical** padding, but the **horizontal** padding is the same 12px (`Scale/250`) for all three sizes. Every symbol in the Figma sheet is drawn at a fixed 165px width with both a start and end icon, so the buttons *look* uniformly wide on the artboard — but as implemented, button width is content-driven: a large button with a short label ("Large") renders narrower than a medium button with a longer label ("Medium").

**Confirm:**
- Is content-driven width with a uniform 12px horizontal padding the intended behaviour?
- Or should horizontal padding scale with size (e.g. sm 12px / md 16px / lg 20px)?
- Or should each size define a `minWidth` (the 165px in the sheet suggests one may exist)?

---

### 14. Selector (checkbox / radio) — states and colours (added 10 June)
The selector component set (node 2080:23677) only defines `checkbox` / `selected` / `active` axes. Several things are unclear:

- **No interaction states.** Button and TextField define hovered / focused / pressed variants; the selector set has none. What should hover and focus-visible look like? (Currently using MUI's default hover halo and focus ring.)
- **Checked colour is success green.** The selected checkbox fills with `#2A9F47` (`border/success/default` / `icon.success.heading` light value) rather than the primary blue used elsewhere for active states. Intentional?
- **Unchecked active vs disabled are identical.** The unchecked icon in the *active* state is `#BCB8B0` — the same grey as every *disabled* icon. An unchecked enabled checkbox and an unchecked disabled checkbox differ only by label colour. Intentional?
- **Selected radio is grey.** `checkbox=False, selected=True, active=True` renders the RadioButton glyph in flat `#BCB8B0` grey, while the equivalent checkbox is green. A design reference shared on 10 June shows the intended selected state instead: a **dark outer ring with a primary-blue filled dot**. Confirm the exact tokens — we assumed `icon.default.heading` for the ring and `surface.primary.default` for the dot.
- **Dark mode.** The sheet only resolves light values. We assumed the token pairs `icon.default.placeholder` (unchecked), `icon.success.heading` (checked), `icon.disabled.default` (disabled) — confirm.

**Interim implementation (10 June):** the Phosphor `Square` / `CheckSquare` glyphs from the sheet are in. Until the rest is answered, interaction behaviour stays MUI default and colours are token-only — unchecked `icon.default.placeholder`, checked/indeterminate `surface.primary.default` (primary, *not* the sheet's success green), disabled `icon.disabled.default`. Will be revisited per the answers above.

**Interim implementation — Radio (10 June):** unselected uses the Phosphor `RadioButton` outline (concentric rings, `icon.default.placeholder`); selected follows the 10 June reference — Phosphor `Circle` ring in `icon.default.heading` plus a 12px filled dot in `surface.primary.default` (no single Phosphor glyph is two-tone, so the selected glyph is composed from two circles); disabled collapses both to `icon.disabled.default`. `RadioGroup` is a behaviour-only passthrough of MUI's.

---

### 15. TextField — 16px slot padding missing from the spacing scale — RESOLVED (2026-07-29, node 3179:106156 re-sync)
The original node 953:1059 measurement (`Scale/300` = 16px inline padding) turned out to be stale. The fresh TextField export (node 3179:106156) uses `Scale/200` = **8px** uniformly for the field inset and the icon/text gap — already named `spacing.component.xs`. `TextField` now uses that token directly; no scale gap remains.

---

### 18. Select — "filled" state's clear (X) icon not wired up (added 29 July)
The Select component set (node 3179:107344) defines a `filled` variant that swaps the caret for an `X` icon, implying a hover-to-clear affordance once a value is selected. `TextField`'s own `filled` state (node 3179:106156) only applies a background/border tint automatically and leaves any clear button as an opt-in `endAdornment` the consumer wires up themselves — no automatic clear-on-hover behaviour.

For consistency with that precedent, `Select`'s `filled` state (tracked via a `data-has-value` attribute, mirroring `TextField`'s `data-filled`) only applies the same automatic background/border tint (`surface.layers.card1` + `border.layers.card2`). It does not swap the caret for a clear button. Confirm whether Select should get a `clearable` prop (hover-reveal `X`, replacing the caret) to match the Figma state literally, or whether the TextField precedent (manual, opt-in) is the intended pattern here too.

Also note: the sheet's `skeleton` variant (three placeholder bars) was not implemented — no other component in this library has a loading-skeleton state yet, so this was treated as out of scope pending a shared pattern.

---

### 16. Avatar — colour, mid-radius, and badge assumptions — PARTIALLY RESOLVED (29 July, node 981:16471 sync)
The Avatar component set was resynced against an updated sheet (node 981:16471), which defines the same four variant axes — `badge` (true/false), `content` (text/icon/img), `size` (large 40 / medium 32 / small 24), and `roundness` (round/mid/sharp) — and re-confirmed the Code Connect mapping (round → circular, mid → rounded, sharp → square). This resolved most of the original assumptions below:

- **Default fill — RESOLVED, and it changed.** The updated sheet fills every text/icon variant with a subtle primary tint (`surface/primary/subtle` `#f3f4fb` + `text or icon /primary/4` `#5f6aea`, i.e. `primary/50` bg + `primary/400` fg) — not the `orange/500` the older sheet (978:17187) showed. `color="accent"` now maps to this confirmed combo; `primary/400` was also missing from `text.primary.onColorHover` / `icon.primary.onColorHover` (which resolved to `primary/500`) and has been corrected (light mode only — dark unconfirmed). `orange` (DESIGNER_QUESTIONS #4) is no longer consumed by any component.
- **Colour is still not a variant axis — unchanged, still open.** The new sheet is consistently the one subtle-primary fill with no per-instance override (the stray blue cell in the old sheet doesn't reappear here). The `color` prop (`accent` default plus `primary`/`secondary`/`success`/`error`/`warning`) remains a convenience beyond the literal spec, not something the file models. Still confirm whether that's wanted, or avatars should be a fixed single colour.
- **`mid` radius — unchanged, still open.** The new sheet's raw `borderRadius` variable is still **4px**, and its Code Connect still maps `mid` → MUI `variant="rounded"` (`theme.shape.borderRadius` = 8px). Per the design-to-code skill's hint priority, Code Connect outranks the raw value, so we kept `rounded` (8px). This is a repo-wide `theme.shape.borderRadius` question, not Avatar-specific — still confirm.
- **Badge colour token — RESOLVED, already matched.** The new sheet's badge fill resolves to `#cbe1d7`, which is exactly our repo's current `surface.success.default` light value (`green/75`) — the mismatch flagged against the old sheet (`green/600` at the time) no longer exists; a token sync since 15 June already corrected `surface.success` to the pale value. No change needed.
- **Text/icon/badge sizing — RESOLVED.** The new sheet directly resolves: large text → `Sans/H6` (16px, not B1 — B1 itself shrank to 13px in the #7 typography resync), medium text → `Sans/B1` (13px, not B2), small text → `Sans/B3`/Caption (10px, unchanged). Icon glyphs resolve to 24px at `lg` and a flat **16px at both `md` and `sm`** (previously assumed 24/20/16). The badge dot resolves to a flat **8px at every avatar size** (previously assumed to scale 10/8/6). The ring colour around the dot varies by instance in the file (white on photo avatars, two different purples on text/icon avatars) in a way that reads as inconsistent/unintentional rather than a rule; we kept the existing single "ring matches the page/paper background" treatment rather than chase per-instance colours.
- **`badge` is a colour-only dot — no presence semantics — unchanged, still open.** The new sheet still only shows a single green (success) dot with no `online`/`away`/`busy`/`offline` states. **Confirm:** is a generic `badge` boolean + `badgeColor` convenience the intended model, or does the design system want first-class presence states?

---

### 17. Alert — `filled` style is a tint tier, not MUI's solid fill (added 15 June)
The Alert component set (node 973:3010) is a 4 x 3 matrix: `state` (error / warning / success / info) x `style` (filled / subtle / outline). Per the task brief, Figma was a structural reference only and colours come from our foundation tokens via the theme palette. Notes and assumptions:

- **`filled` reads as a medium tint, not a solid fill.** In the sheet, all three styles keep severity-coloured text and icons; they differ only by background intensity — `filled` is a medium tint (≈ `<scale>/200`) with a border, `subtle` is a lighter tint, `outline` is border-only on a transparent surface. We mapped `filled` / `subtle` / `outline` onto MUI's `filled` / `standard` / `outlined`, so our `filled` renders as MUI's **solid** severity surface with auto-contrast text — heavier than the Figma tint. This keeps us on MUI's variant model and on our tokens. **Confirm:** should `filled` instead be a medium token tint (e.g. `surface.<state>.default` + `border.<state>.default` + coloured text) to match the sheet, rather than a solid fill?
- **Severity → icon mapping.** The sheet shows a `WarningDiamond` for error; we used the Neoflo Phosphor set throughout (error → `WarningDiamond`, warning → `Warning`, success → `CheckCircle`, info → `Info`) at `weight="fill"` to match the filled glyphs in the render. Confirm the icon per state and the weight.
- **Default state/variant.** The sheet implies no default. We defaulted `severity="info"` (neutral) and `variant="subtle"` (the lightest, most common in-app emphasis, = MUI `standard`). Confirm.
- **Close affordance.** The sheet's trailing area shows an optional button plus a Phosphor `X`. We render the close via MUI's `onClose` with the Phosphor `X` as the close icon; a custom `action` (e.g. a Button) replaces the close button, per MUI. Confirm whether a close and an action should be able to coexist.
