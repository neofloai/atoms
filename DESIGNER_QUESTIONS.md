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

---

### 22. `primary/500` — the brand accent has drifted by one value in Figma (added 5 August, node 3342:3325)
Re-reading the same "UI to MUI Mapping" swatch board that resolved #20 now returns **`primary/500` = `#4949dc`**, where `src/tokens/colors.ts` has **`#4961dc`**. Nothing else moved: `primary/400` (`#5f6aea`) and `primary/600` (`#343eb3`) still match, and so do every 400/500/600 rung of `grey`, `blue`, `red`, `yellow`, `green`, `orange`, and `purple`. The same value also arrives independently through `text/primary/3` and `icon/primary/3` on the new `menu-item` sheet (node 3204:121756), so it is not a one-off misread of the board.

This is a single raw value, but it is **the** brand accent, so it is the widest-reach change in the file:

- `surface.primary.default` (light) — the `Button variant="primary" appearance="contained"` fill, and Chip's
- `text.primary.accent` / `icon` equivalents — Chip's `size="sm"` tag label, and now `MenuItem variant="action"`
- `theme.palette.primary.main` — what every unwrapped MUI component defaults to
- `/branding`, which presents `primary/500` as "the one genuine brand decision"

**Not changed here.** Repointing the raw scale on one node reading would move the accent everywhere at once, which is a brand decision rather than a component fix. `MenuItem variant="action"` references `text.primary.accent` so it inherits whichever value the scale settles on.

**Confirm:** whether `#4949dc` is the intended new value for `primary/500` (in which case `src/tokens/colors.ts` is a one-line change and the accent shifts system-wide), or whether the Figma variable drifted by accident and `#4961dc` stands.

---

### 23. `menu-item` hover is invisible on the `menu` surface it ships inside (added 5 August, nodes 3204:121756 + 3228:62331)
The `menu-item` component set tints its `hover` variant with `surface/layers/card 2` (`#f5f5f3`). The `menu` panel that contains those items (node 3228:62331, `float=True`) is filled with **the same token**. So inside a menu, hover has exactly zero contrast against its own background.

The two sheets are each internally consistent — the item sheet is drawn against the page surface, where a `card 2` tint reads fine. It looks like the item was composed into the panel without re-checking the state colours against the new backdrop, and the composed panel is what ships.

**Implemented as `surface/layers/card 3`** — one rung up the same ladder, which preserves the rule the design is following (hover is one layer above whatever surface the row sits on) with the smallest possible deviation. It reads in both schemes: light `#eeeeec` on `#f5f5f3`, dark `grey/900` on `grey/950`. Light mode is a genuinely subtle step (7 greyscale levels), which is defensible for a transient state but is worth a look.

Two more states are absent from the sheet and were decided in code:

- **Keyboard focus is not drawn at all.** Arrow-key navigation is how a menu is meant to be operated, so the focused row cannot be left unstyled; it borrows hover's tint. The 3px focus ring the action controls use would be clipped by the panel's 4px inset.
- **Disabled is not drawn.** Uses `text.disabled.default` rather than MUI's 38% opacity fade, matching every other disabled control in the system.

**Confirm:**
- The hover tint for a row *inside a menu* — `card 3` as implemented, something stronger, or a re-spec of the panel surface so the sheet's `card 2` hover works as drawn.
- Whether the focused row should have its own treatment rather than sharing hover's, given both can be true at once.
- A disabled row's colour.

---

### 24. Skeleton — there is no loading placeholder anywhere in the design library (added 6 August)
`Skeleton` shipped without a Figma source. Searching the Product Design System for *skeleton*, *placeholder*, *shimmer*, *loading state*, and *empty content* returns only the Phosphor `Spinner` / `SpinnerGap` icons — there is no component, and no variable group for one. It is the only component in the library with no Figma link on its docs page, and the page says so.

So the following were decided in code, against this system's palette rather than against a spec. They are all cheap to change:

- **The fill is translucent, not a token.** MUI tints the placeholder with 11% of `palette.text.primary` in light and 13% in dark, which resolves through our own `grey/1100` and `grey/25`. Kept deliberately, because a skeleton appears on the page surface, inside a card, and inside a card nested in a card, and no single solid grey covers all three. `surface.disabled.default` — the obvious candidate — is `grey/900` in dark, which is *exactly* `surface.layers.card3`, so a placeholder inside a `card 3` panel would be invisible; the same collision class as #23. Compositing holds a roughly constant step instead (~25 greyscale levels in light, ~30 in dark) on every layer. If the system wants a named skeleton colour, it needs to be specified per layer, or as an alpha over an ink token rather than a flat swatch.
- **`rounded` is 8px.** MUI's `rounded` variant uses `theme.shape.borderRadius`, which is already `radius.sm`, the design system's control default — nothing to override. A skeleton standing in for a **card** wants the 24px card radius and has to say so (`sx={{ borderRadius: 3 }}`). Worth knowing whether a card-shaped placeholder is common enough to deserve a shorter route.
- **Animation.** Two are offered because MUI offers two: `pulse` (the default, an opacity fade) and `wave` (a highlight sweeping across). A design system would normally pick one. No preference has been expressed, so both stand.
- **No ARIA on the placeholder.** Matches MUI, whose documented ARIA for this component is "None". The loading state goes on the region (`aria-busy`), not on each grey block.

**Two system-level gaps this surfaced, neither specific to Skeleton:**

- **`palette.action.*` is still MUI stock.** `action.hover` is `rgba(0,0,0,0.04)` light / `rgba(255,255,255,0.08)` dark — the only part of the palette not mapped to tokens. It is what MUI draws the `wave` sweep from: measured on the docs page, the sweep moves the placeholder **9 greyscale levels in light against 16 in dark**, so the light-mode wave is a little over half as strong. `action.*` also backs hover overlays and ripples on any unwrapped MUI component. Left alone here rather than patched with an invented highlight value.
- **`prefers-reduced-motion` is not honoured anywhere.** MUI 9 gates its own reduced-motion styles behind `theme.motion.reducedMotion`, which `src/theme/index.ts` does not set, so every transition in the library currently ignores the OS setting. Skeleton is the first component with an *infinite* animation, so it handles this itself — but `motion: { reducedMotion: 'system' }` on the theme is a one-line fix covering everything, and should be its own change rather than a side effect of adding a component.

**Confirm:**
- Whether a skeleton should be drawn in Figma at all, or whether this stays engineering-owned.
- If it is drawn: the fill (and whether it is specified per surface layer, since one flat grey cannot work on all four), and whether `pulse` or `wave` is the house animation.
- Whether to set `motion: { reducedMotion: 'system' }` on the theme, which would make every transition in the library respect the OS preference. **Now done — see #25.**

---

### 25. Motion — the design library specifies none, so all five transitions ship with MUI's timings (added 9 August)
`Fade`, `Grow`, `Zoom`, `Slide`, and `Collapse` shipped without a Figma source. Searching the Product Design System for *duration*, *easing*, *transition*, *motion*, and *animation* returns no variable group and no component sheet that draws one — no component in the library documents how it enters or leaves. This is a wider gap than #24: `Skeleton` was one missing component, this is a missing dimension of the system.

The five are **re-exports rather than wrappers**, taking the same carve-out as `Box`, `Stack`, `Grid`, and `Container` (recorded in `src/index.ts`). A transition renders no DOM of its own — it clones its child and animates the child's `style` — so there is no colour, type, border, or state to brand, and the whole API is a boolean, a duration, and a CSS timing function. Wrapping would also make them *less* themed: timing defaults resolve from `theme.transitions` at render time, so baking numbers into a wrapper would replace a themeable default with a fixed one.

Consequently everything below is MUI's Material scale, left in place rather than mapped to anything:

- **Durations.** `enteringScreen` 225ms and `leavingScreen` 195ms drive `Fade`, `Zoom`, and `Slide`; `standard` 300ms is `Collapse`'s default; `Grow` and `Collapse` also accept `timeout="auto"`, which derives the duration from the child's measured size.
- **Easings.** The four Material curves — `easeInOut`, `easeOut`, `easeIn`, `sharp`. `Slide` is the only one with asymmetric defaults (`easeOut` in, `sharp` out).

**No motion tokens were invented.** Adding `src/tokens/motion.ts` with plausible durations was deliberately not done: every other token in this system traces back to the designer's Figma export, and one invented in code would be indistinguishable from the ones that are not. The docs page reads the numbers live from `theme.transitions` and says on the page that they are MUI's, rather than laundering them into looking like Neoflo values.

**`motion: { reducedMotion: 'system' }` is now set** in `src/theme/index.ts`, resolving the open item at the end of #24. MUI 9 defaults this to `'never'`, so until now every transition in the library ignored the OS preference. This change reaches past the new components: `Menu`'s open animation and any MUI internal built on these transitions now complete instantly for a user who has asked for less motion. The state change is unaffected; only the tween is dropped. Individual transitions can opt out with `disablePrefersReducedMotion`. `Skeleton` keeps its own hand-written reduced-motion rules on top of this so it stays correct for consumers who bring their own theme.

**Confirm:**
- Whether motion should be specified in Figma at all, or stays engineering-owned like `Skeleton`. If it is specified, `theme.transitions` is the single place it lands and nothing else changes.
- If it is specified: the house durations and curves, and in particular whether entering and leaving should be asymmetric across the board (only `Slide` is today, because Material says so).
- Whether the system wants an opinion on *which* transition a given kind of surface uses — a menu grows, a sheet slides, a disclosure collapses — or whether that stays a per-usage decision. Today `Menu` is the only component that picks one on the consumer's behalf.

---

### 26. Divider — no separator exists in the design library, and `palette.divider` is broken in dark mode (added 9 August)
`Divider` shipped without a Figma source. Searching the Product Design System for *divider*, *separator*, *rule*, and *line* returns component sets for arithmetic (`MathOperations`, `Calculator`, `Minus`) and nothing else — there is no component and no variable named for one. Same situation as #24 and #25, and the docs page says so on its face.

Unlike the motion primitives in #25, this one is a **wrapper, not a re-export**. A divider renders a real border with a colour a designer could redline, which is exactly the line the carve-out in `src/index.ts` draws.

**The one visual decision — and it fixes a live defect.**

MUI paints the rule from `palette.divider`. In dark mode `src/theme/palette.ts` sets that to `grey/1000`, which is *the same value* as `surface.layers.card1`. Measured contrast, hairline against surface:

| surface | `palette.divider` (light / dark) | `border.default.default` (light / dark) |
|---|---|---|
| `layers.page` | 1.25 / 1.07 | 1.61 / 1.86 |
| `layers.card1` | 1.22 / **1.00** | 1.57 / 1.74 |
| `layers.card2` | 1.16 / 1.05 | 1.50 / 1.66 |
| `layers.card3` | 1.09 / 1.15 | 1.41 / 1.51 |
| `background.paper` | 1.26 / 1.04 | 1.62 / 1.82 |

**1.00:1 on dark `card 1` means the rule does not render at all.** On `card 2` and `background.paper` it is *darker* than what it sits on, so it reads as a smudge rather than a line. This is not new — `Menu` already hand-patches it for dividers inside a menu panel (see #23's neighbourhood), and the menu docs page carries a note explaining why.

So the component draws from **`border.default.default`** instead — the system's own neutral border token, the same one a `secondary` `outline` Button uses. It is lighter than every dark layer and darker than every light one, so one token holds everywhere. The cost: a light-mode rule moves `grey/200` → `grey/300`, one rung stronger than MUI's default. That was chosen over keeping two values that each work in one colour scheme.

None of these reach the 3:1 of WCAG 1.4.11, and none needs to — that threshold covers controls and graphics required to understand content, and a separator is neither. The bar is "visible on every layer", which `palette.divider` was failing outright.

**The fix is deliberately local.** Correcting `palette.divider` in `src/theme/palette.ts` would fix `<MenuItem divider />`, MUI's own components, and this docs site in one move — but it would restyle every existing surface, so it belongs in its own change rather than riding along with a new component.

**`variant` keeps Material's indents.** `inset` is a hardcoded `margin-left: 72px` — the width of a Material list avatar plus its gutter — and `middle` is `theme.spacing(2)`, 16px, a number that is **not on the Neoflo spacing scale at all** (4, 8, 12, 24, 48, 64, 96). Both were left on MUI's numbers rather than quietly re-pointed, for the same reason no motion tokens were invented in #25: a value chosen in code would be indistinguishable from one that came from Figma. The docs tell consumers to prefer `fullWidth` and control the inset from the parent's padding.

**Confirm:**
- The dark-mode `palette.divider` value. `grey/1000` is invisible on `card 1` and wrong-direction on `card 2` — this is a token bug independent of this component, and fixing it centrally would let the wrapper drop its override entirely.
- Whether `grey/300` is the right light-mode hairline, or whether it now reads too heavy against `grey/200`.
- The inset scale, if `inset` / `middle` are worth keeping: what a divider indents *to* in this system, given 72px and 16px are both off the scale.
- Whether a divider should be drawn in Figma at all, or stays engineering-owned like `Skeleton` and motion.
