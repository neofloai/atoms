# Designer Questions

Open questions for the design team. Once resolved, update the relevant token/theme files and delete the item from this list.

> **Note:** Since this doc was first written, the designer shipped a Figma DTCG token export (`light.tokens.json` + `dark.tokens.json`). It supersedes the earlier PDFs and answered several items below. Resolved questions are marked **RESOLVED** with a brief note; unresolved ones are still pending.

---

## Colors & Palette

### 1. `primary/600` value conflict — SUPERSEDED (see #20)
Historical entry from an early PDF-based hand-off; `primary/600` is now `#343eb3` in `src/tokens/colors.ts` (not the `#014ce1` this entry originally referenced), confirmed against the live Figma variables export. `#20` re-confirms `palette.primary` role assignment against the live "UI to MUI Mapping" board.

---

### 2. Primary button resting color — SUPERSEDED (see #20)
This entry previously claimed `surface.primary.default.light = primary/600`; the live token export actually has `surface.primary.default.light = primary/500` (`#4961dc`) — already correct in `src/tokens/surface.ts` and what Button/Chip render today. `theme.palette.primary.main` (a separate, MUI-only mapping) had drifted to `primary/600` instead of matching — fixed in `#20`.

---

### 3. `secondary` palette role
The Mapping PDF maps `secondary` to the grey scale: `light = grey/25`, `main = grey/100`, `dark = grey/300`.

These are very light neutrals. A secondary button or chip will render almost white.

**Confirm:** Is this intentional? Or should `secondary` map to a more saturated accent color?

---

### 4. `orange` scale — now has a consumer, but only light-mode + one tier is confirmed (updated 29 July, node 3156:83830)
Superseded by the Chip resync below (#19): the Chip small-tag component set now uses both `orange` and `purple` as first-class colour roles, so they are no longer unused. `surface.orange.default`, `surface.purple.default`, `text.orange.caption`, `text.purple.caption`, and `text.primary.accent` were added to `src/tokens/surface.ts` / `text.ts` with only the single tier the small tag consumes — light mode confirmed against the live node, dark mode set equal to light as a placeholder.

**Confirm:**
- Dark-mode values for all five of the above.
- Whether `orange`/`purple` need the rest of the ladder (`defaultHover`, `defaultPressed`, `subtle*`) — nothing in `src/` consumes those tiers yet.
- Whether `orange`/`purple` should ever get a `size="md"` pill treatment (see #19), or stay `size="sm"`-only.

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

### 17. Alert — `variant` (filled/subtle/outline) removed, didn't exist in the design (added 15 June; resynced + corrected 29 July, node 973:3010)
The Alert component set (node 973:3010) was originally read as a 4 x 3 matrix: `state` (error / warning / success / info) x `style` (filled / subtle / outline). Per the task brief at the time, Figma was treated as a structural reference only, and the 3-way `style` axis was an engineering addition on top of it.

- **`variant` didn't exist in the design — REMOVED (29 July).** The 29 July resync re-read the live sheet directly (`get_metadata` on the full frame): it is actually a 2 x 4 matrix — `float` (True / False) x `state` — with **no `style` axis at all**. Per direct instruction, the invented `filled`/`subtle`/`outline` `variant` prop (and `AlertVariant` type) were removed from the component, its types, exports, examples, and docs showcase. Alert now models only what the sheet literally shows: `severity` (`state`) and `floating` (`float`). This resolves the "is `filled` a tint or a solid fill" question by removing `filled` rather than answering it.
- **`float` is the sheet's real second axis — implemented as `floating` (29 July).** `float=True` swaps in a tinted (`surface.<state>.default`), bordered (`border.<state>.default`), rounded (`theme.shape.borderRadius`) surface with **no icon**, vs. `float=False`'s plain tinted surface with an icon (today's default look). This reads as "Alert used as a toast" rather than another inline emphasis level, so it's an independent `floating` boolean, intended to pair with MUI's `Snackbar`. Every colour it uses (error/success/information) matched our existing tokens exactly; `warning` did not (see below).
- **Found and fixed a real `surface.warning` bug (29 July).** Cross-checking the sheet's `surface/warning/default` (`yellow/200`) and `surface/warning/subtle` (`yellow/75`) against our tokens showed both one rung too light (`yellow/100` and `yellow/50`). `error` and `success` matched exactly in the same check, so this was isolated to `warning`. Fixed in `src/tokens/surface.ts` (light mode only); `defaultHover`/`defaultPressed`/`subtleHover`/`subtlePressed` were shifted the same one rung to preserve the ladder's shape (matching the confirmed `error`/`success` pattern) but were not independently confirmed against a Figma interaction state — this affects every existing consumer of `surface.warning.*` (Avatar's warning role/badge, Button/IconButton's warning appearance), not just Alert.
- **Severity → icon mapping — RESOLVED as no change (29 July).** Re-inspecting the raw SVG fills behind each state's icon showed all four (error/warning/success/info) render the exact same path data (Phosphor's `WarningDiamond` glyph), just recoloured per state — a reused Figma instance, not a real per-severity icon design. Kept the existing Neoflo Phosphor set (error → `WarningDiamond`, warning → `Warning`, success → `CheckCircle`, info → `Info`) at `weight="fill"`, unchanged from 15 June.
- **Default state.** The sheet implies no default. We default `severity="info"` (neutral) and `floating={false}` (the plain inline look, = the sheet's `float=False`). Confirm.
- **Close affordance.** The sheet's trailing area shows an optional button plus a Phosphor `X`. We render the close via MUI's `onClose` with the Phosphor `X` as the close icon; a custom `action` (e.g. a Button) replaces the close button, per MUI. Confirm whether a close and an action should be able to coexist.

---

### 19. Chip — colour model, size, and a second component under one `size` axis (added 29 July, nodes 986:18006 + 3156:83830)
The Chip component set (node 977:17709) turned out to contain two visually distinct components, not one component at two sizes:

- **`contained` colour model was wrong for every role.** The prior implementation reused Button's `actionStyles` role table, so `primary` `contained` rendered a saturated fill with a white label (Button's actual behaviour). The 36px pill sheet (node 986:18006) shows **every** role — including `primary` — using a pale/subtle fill with its own accent colour as the label; `secondary`/`success`/`error`/`warning` already happened to match (they reuse Button's own pale-fill treatment), so only `primary` was visibly broken. Fixed with a Chip-only role table in `Chip.tsx` instead of extending the shared one.
- **Size was wrong.** The prior sm/md (32px/40px, text-only) didn't match either real Figma size. The pill (node 986:18006) is a single 36px size with a 20px leading icon (`Sans/B1/Medium`, 8px/12px padding, 8px corner radius — not the pill/stadium radius previously used). Confirmed the corner radius is `radius.sm` (8px), not `radius.xl`.
- **A second, unrelated 20px component exists** (node 3156:83830): a flat, non-interactive tag with eight colour roles (`grey`/`primary`/`yellow`/`purple`/`green`/`orange`/`red`/`blue`, i.e. `secondary`/`primary`/`warning`/`purple`/`success`/`orange`/`error`/`information`), no `contained`/`outline` axis, and no hover/pressed/focus states drawn. Per direct instruction, this was mapped onto Chip's existing `size` prop (`size="sm"`) rather than a new component, extending `ChipVariant` with `information`/`orange`/`purple` (new — see #4) even though those three have no pill (`size="md"`) equivalent yet.
- **A ninth "info" swatch on the same sheet** (PO-number + amount, fixed `FilePdf` icon, `grey/125` background) was read as a one-off usage example rather than a tenth colour role — its background doesn't fit the sheet's own naming pattern for the other eight, and its two-tone text content is specific to that one example. Not implemented as a variant; consumers can still compose it via `label`.

**Confirm:**
- Whether `information`/`orange`/`purple` should eventually get their own `size="md"` pill treatment, or stay `size="sm"`-only as implemented.
- The dark-mode values noted in #4.
- Whether the "info" PO/amount swatch should become a first-class variant if that composite pattern recurs elsewhere.

---

### 20. MUI `theme.palette` — `.main`/`.dark` formula was wrong (added 30 July, node 3342:3325)
The Figma "UI to MUI Mapping" swatch board (node 3342:3325) spells out `palette.<role>.light/main/dark` literally for `primary`/`secondary`/`error`/`warning`/`info`/`success`, each with a token name and hex. Cross-checking it against `src/theme/palette.ts` found the `lightPalette`'s `.main`/`.dark` formula was wrong for every role except `secondary`:

- **Formula was `.light`→400, `.main`→600, `.dark`→800; corrected to `.light`→400, `.main`→500, `.dark`→600.** Confirmed exactly for `primary`, `error`, `warning`, `success` — all four swatch boards reference `scale/400` / `scale/500` / `scale/600` by name. `.light` already matched; only `.main`/`.dark` were two rungs too deep. This is a real, user-visible fix: `palette.primary.main` (what raw/unwrapped MUI components default to) was `#343eb3` and is now `#4961dc` — which also happens to match `surface.primary.default` (what Button/Chip already render), so the fix makes `theme.palette` consistent with the rest of the system instead of one rung darker.
- **`secondary` swaps from a plain grey ladder to `surface.layers.*`.** The board names `surface/layers/page` / `surface/layers/card-1` / `surface/layers/card-2` (`grey/50` / `grey/75` / `grey/100`), not the previous `grey/25` / `grey/100` / `grey/300` guess.
- **`info`'s three swatches are raw hex, not wired to a variable** — `#03a9f4` / `#0288d1` / `#01579b`, which is MUI's own stock default info-blue, unlike every other row. Read as a leftover default in the Figma file (every other row explicitly references a named scale variable; this one doesn't) rather than an intentional colour choice, since adopting it verbatim would put `theme.palette.info` on a visibly different hue than `surface.information` / `text.information` / Alert / Chip everywhere else. **Confirmed with direct instruction:** kept on our own `blue` scale, continuing the same light/main/dark formula (`blue/400` / `blue/500` / `blue/600`).
- **`darkPalette`'s `warning`/`info`/`success` updated to match.** That palette's own header comment states these three roles intentionally "keep the same shade family as light mode" — since light mode's formula changed, these three were updated in lockstep to preserve that stated invariant (dark's `primary`/`error`, which intentionally diverge from light, were left untouched).
- Also corrected stale brand copy in `src/brand/branding.ts` that called `primary/600` (`#343eb3`) "the single brand accent" — the accent Button/Chip actually render is `primary/500` (`#4961dc`); `600` is one rung darker (the `.dark` shade). Updated the orange callout too: it previously referenced Avatar (superseded by #16) — orange (and now purple) are consumed by Chip's `size="sm"` tag variant instead (#19).

**Confirm:** whether `info`'s raw-hex swatches in the Figma board should be updated to reference the `blue` scale directly, so the board matches what's actually implemented.

---

### 21. `/branding` colour section rebuilt — hand-picked swatches had drifted (added 30 July)
Follow-on from #20. The `/branding` page carried a hand-curated grid of 11 literal swatches (7 "brand" + 4 "neutral") predating the palette work. Auditing it against the theme found most of it was either wrong or dead:

- **3 of the 4 "neutral" swatches were off by a rung or two.** "Ink" showed `grey/1200` where `palette.text.primary` is `grey/1100`; "Body" showed `grey/800` vs `text.secondary` = `grey/700`; "Border" showed `grey/300` vs `divider` = `grey/200`. Only "Surface" (`grey/100` = `background.default`) matched. Nobody had touched these since they were written, which is exactly the failure mode of hand-maintained hex in docs.
- **The 5 "brand"/status swatches duplicated the palette's `.main` column** now that the `theme.palette` table exists, so they were a second, hand-maintained copy of derived data.
- **"Accent orange" `#fe9934` (orange/500) and "Accent purple" `#815eff` (purple/500) referenced shades used nowhere in the codebase.** The only consumers of either scale are `surface.orange.default` (`orange/100`) + `text.orange.caption` (`orange/600`) and `surface.purple.default` (`purple/75`) + `text.purple.caption` (`purple/400`), all via Chip's `size="sm"` tag variant (#19, #4). Avatar's old `orange/500` fill was already superseded by #16. So the page was advertising two colours the system does not use, and `branding.ts` repeated both hexes in prose.

**Resolved by construction, not by patching values:** the curated grid is gone. `/branding` now shows (a) the one genuine brand decision — `primary/500` as the accent, plus the full `grey` ramp rendered from `colors.grey`, and (b) a `theme.palette` table covering all six roles × `.light`/`.main`/`.dark` **plus** `background.default/paper`, `text.primary/secondary/disabled`, and `divider`, each in both colour schemes — every value read live from `src/theme/palette.ts`. Orange and purple were dropped from `/branding` entirely (they are component tag tints, not brand colours) and remain documented on `/tokens` under Surface/Text and on the Chip page. Division of labour is now: `/tokens` = exhaustive derived reference; `/branding` = brand narrative + the palette contract a blank project writes against. No hand-maintained hex remains on either page.

**Confirm:** orange and purple currently have exactly one confirmed tier each and `dark` mirrors `light` as a placeholder (#4). If they are meant to be reusable accents rather than Chip-only tints, they need a full tier set and real dark values — otherwise they stay scoped to Chip.
