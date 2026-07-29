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

Orange is available in the raw token layer (`colors.orange[*]`) but no component will use it automatically.

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

### 15. TextField — 16px slot padding missing from the spacing scale (added 10 June)
The text-field slot (node 953:1059) uses `Scale/300` = **16px** inline padding (and the selector row label inset uses 16px too), but the semantic spacing scale from the DTCG export (#8) jumps from `sm = 12` straight to `md = 24` — there is no 16px step.

`TextField` currently uses `spacing.component.sm` (12px) so it stays on tokens, which renders 4px tighter than the Figma sheet.

**Confirm:**
- Should the component spacing scale gain a 16px step (and if so, what is its name)?
- Or is 12px acceptable for the field inset?

---

### 16. Avatar — colour, mid-radius, and badge assumptions (added 15 June)
The Avatar component set (node 978:17187) defines four variant axes — `badge` (true/false), `content` (text/icon/img), `size` (large 40 / medium 32 / small 24), and `roundness` (round/mid/sharp). The design even ships Code Connect snippets mapping `roundness` onto MUI Avatar variants (round → circular, mid → rounded, sharp → square), which we followed. Several things were inconsistent or unspecified and were implemented on assumptions:

- **Default fill is `orange/500` (`#fe9934`).** Every text/icon variant in the sheet fills with orange — the same `orange` scale that DESIGNER_QUESTIONS #4 flags as having *no* semantic token and *no* palette-role mapping. Avatar is the first component to consume `colors.orange[*]` directly. We exposed it as the default `color="accent"`. Confirm orange is the intended avatar default (and whether it should finally be promoted to a semantic token).
- **Colour is not a variant axis.** The component only varies on badge/content/size/roundness — colour is a fixed orange fill. But one cell (small / round / text) is rendered in `primary/700` blue, which looks like an instance override rather than a component property. We *assumed* avatars need per-instance colour and added a `color` prop (`accent` default plus `primary`/`secondary`/`success`/`error`/`warning` from the shared semantic surfaces). Confirm whether avatar background should be configurable, fixed orange, or auto-derived from the initials.
- **`mid` radius — file value vs Code Connect.** The Figma file's raw `borderRadius` variable resolves to **4px** for `mid`, but its own Code Connect maps `mid` to MUI `variant="rounded"`, which in our theme uses `theme.shape.borderRadius` = **8px** (`radius.sm`). We followed the Code Connect mapping (8px). Confirm the intended mid-corner radius.
- **Badge colour token mismatch.** The badge variants resolve `surface/success/default = #aee9bd` (a light green ≈ `green/200`) in this file, whereas our repo's `surface.success.default` light value is the saturated `green/600` (`#2fb350`). For a status dot we used our saturated success token, not the file's pale green. Confirm.
- **Inferred text/icon/badge sizing.** Only the medium text variant directly resolved a font (`Sans/B2/Medium`, 14px); we *assumed* large → B1 (16px) and small → Caption (12px) from the section-level variables. Icon content uses a `min-width` placeholder with no resolved glyph size — we assumed 24 / 20 / 16px for lg/md/sm. The badge dot is drawn at 8px on the large image variant; we scaled it 10 / 8 / 6px across sizes and added a white ring (visible in the render but not expressed as a token). Confirm these values.
- **`badge` is a colour-only dot — no presence semantics.** The sheet only shows a single green (success) dot and defines no `online` / `away` / `busy` / `offline` states. Mirroring MUI (whose Avatar "with badge" pattern is just a coloured `Badge` dot, with no status prop), we kept it generic: a `badge` boolean plus a `badgeColor` (`success` / `error` / `warning` / `neutral`, the last three added as a reasonable extension). Presence is left to the consumer as a convention (success = online, warning = away, error = busy, neutral = offline). **Confirm:** is a generic coloured dot the intended model, or does the design system want first-class presence states (e.g. a `status` prop with defined tokens and possibly distinct shapes/rings per state)?

---

### 17. Alert — `filled` style is a tint tier, not MUI's solid fill (added 15 June)
The Alert component set (node 973:3010) is a 4 x 3 matrix: `state` (error / warning / success / info) x `style` (filled / subtle / outline). Per the task brief, Figma was a structural reference only and colours come from our foundation tokens via the theme palette. Notes and assumptions:

- **`filled` reads as a medium tint, not a solid fill.** In the sheet, all three styles keep severity-coloured text and icons; they differ only by background intensity — `filled` is a medium tint (≈ `<scale>/200`) with a border, `subtle` is a lighter tint, `outline` is border-only on a transparent surface. We mapped `filled` / `subtle` / `outline` onto MUI's `filled` / `standard` / `outlined`, so our `filled` renders as MUI's **solid** severity surface with auto-contrast text — heavier than the Figma tint. This keeps us on MUI's variant model and on our tokens. **Confirm:** should `filled` instead be a medium token tint (e.g. `surface.<state>.default` + `border.<state>.default` + coloured text) to match the sheet, rather than a solid fill?
- **Severity → icon mapping.** The sheet shows a `WarningDiamond` for error; we used the Neoflo Phosphor set throughout (error → `WarningDiamond`, warning → `Warning`, success → `CheckCircle`, info → `Info`) at `weight="fill"` to match the filled glyphs in the render. Confirm the icon per state and the weight.
- **Default state/variant.** The sheet implies no default. We defaulted `severity="info"` (neutral) and `variant="subtle"` (the lightest, most common in-app emphasis, = MUI `standard`). Confirm.
- **Close affordance.** The sheet's trailing area shows an optional button plus a Phosphor `X`. We render the close via MUI's `onClose` with the Phosphor `X` as the close icon; a custom `action` (e.g. a Button) replaces the close button, per MUI. Confirm whether a close and an action should be able to coexist.
