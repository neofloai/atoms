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

### 7. Typography scale — PARTIALLY RESOLVED
The Figma file (queried via MCP) confirms the structure:

| Confirmed in Figma | Status |
|---|---|
| Font family — Product: **Plus Jakarta Sans** + **Instrument Serif** | Wired into `next/font` and the MUI theme (replacing Geist Sans). |
| Font family — Marketing: **Clash Grotesk** | Not yet self-hosted (Fontshare, not on Google Fonts). Falls back to Plus Jakarta Sans. |
| Font weights: Regular (400), Medium (500), Bold (700) | In `src/tokens/typography.ts`. |
| Slots: `H1, H2, H3, H4, B1, B2, caption` (each with `size` + `leading`) | Structure in place; mapped to MUI `h1`-`h4`, `body1/body2`, `caption`. |

**Still pending — numerical values.** The size/leading values live in a Figma "responsive" variable collection that the MCP can only resolve when a frame is selected in the desktop app. Current sizes in `src/tokens/typography.ts` are placeholders.

**Provide either:**
- A) The resolved px values per slot (one set, or per breakpoint if responsive), OR
- B) Select a frame in Figma using these typography variables so the MCP can pull resolved values.

Also still pending: `subtitle1 / subtitle2 / button / overline` are not defined in Figma — currently using MUI defaults.

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

### 10. Elevation / shadow scale — PARTIALLY RESOLVED
The Figma file confirms three semantic shadow levels (effect styles):

| Token | Intended usage (per Figma description) |
|---|---|
| `elevation.small` | Buttons, input focus, slight elevation. |
| `elevation.medium` | Dropdowns, tooltips, floating elements. |
| `elevation.large` | Modals, dialogs, popovers. |

The names are wired into `src/tokens/elevation.ts` and mapped across MUI's 25 shadow slots (`elevation=1` → small, `2-8` → medium, `9-24` → large).

| Level | Status |
|---|---|
| `elevation.large` | **Confirmed** from Figma node 953:3035 — `0px 4px 8px rgba(22,22,20,0.16), 0px 8px 16px rgba(22,22,20,0.08)`. |
| `elevation.small` | Placeholder. Designer please share the small shadow effect spec (or select a button/input frame and ping me). |
| `elevation.medium` | Placeholder. Same — select a dropdown/tooltip/menu and ping me. |

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
