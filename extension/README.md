# Atoms Inspector

A Chrome extension that inspects a running page the way Figma's Dev Mode inspects a frame: Atoms component names and props, the box model, distances between elements, flex/grid gaps, and the Atoms token behind every colour, space, radius, type size and shadow.

It reads tokens and component names from this repo at build time. None of it is part of the `@neofloai/atoms` package.

**Built for development builds.** In `next dev` / `vite dev`, every colour an Atoms component paints also declares the token it came from (a CSS custom property, stripped from production builds). That lets the inspector:

- name tokens **exactly**, even when two tokens share a hex
- flag **drift** when something else rendered, and name the cause

A production build still gets measurements and best-guess token matches by value, but no drift checks.

## Build

```sh
npm run build:extension   # one build into extension/dist
npm run dev:extension     # rebuild on save; reload the extension after each change
npm run pack:extension    # build and zip into extension/release/atoms-inspector-<version>.zip
```

After a token sync or a component change, rebuild. The new names are picked up automatically.

## Share a release

1. Bump `version` in `extension/manifest.json`.
2. Run `npm run pack:extension`.
3. Share the zip from `extension/release/`.

## Install (designers)

**First time**

1. Unzip to a fixed folder, e.g. `~/Atoms Inspector/`.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked**, select that folder, then pin the extension.

**Each update**

1. Unzip the new version over the same folder, replacing the files.
2. On `chrome://extensions`, click the reload icon on Atoms Inspector.
3. Refresh any tab the inspector was open on.

## Use

| Action | Result |
| --- | --- |
| Click the toolbar icon, or <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> | Turn the inspector on or off for this tab |
| Hover | Outline, labelled with the Atoms component name |
| Click | Select the whole Atoms component |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd>-click | Select the exact element inside a component |
| Hold <kbd>Alt</kbd> and hover | Measure from the selection to the hovered element |
| <kbd>Esc</kbd> | Clear the selection |

Click **?** in the panel header for the built-in help: every feature, the shortcuts, and what each result means.

The panel shows:

- **Header:** the component, its pattern and region (e.g. `invoice-dashboard › toolbar`), and a breadcrumb that includes layout primitives (`Stack`, `Box`, `Grid`, `Container`).
- **Props:** the props the caller wrote.
- **Overrides:** every `sx` and `style` property on the component.
- **States:** the tokens for rest, hover, pressed, focus, selected, checked and disabled, read from the component's CSS. You don't have to put the element into a state to see it.
- **Layer properties:** the box model.
- **Three tabs:**

  - **Tokens:** every value with its token.
  - **CSS:** computed values, with each token and any theme variable (`var(--mui-…)`) as a comment.
  - **Atoms:** a JSX snippet to paste.

**Scan** (in the header) lists every drifted colour on the page. Click an entry to select it.

What each result means:

| Result | Meaning |
| --- | --- |
| **✓ exact** | The component declared this token, and it rendered as declared. |
| **⚠ drift** | The component declared one token and something else rendered. The note names the intended value and the cause: `style prop`, `sx on Button — bgcolor: …`, `outside CSS — .toolbar button {…} in globals.css`, the wrong mode, a different Atoms version, or a theme override. Padding, radius and type set by `sx`, `style` or outside CSS are flagged the same way. |
| Yellow note | A token, but the wrong kind for the property, e.g. a text token used as a border. |
| Red note | No token carries the value. The nearest token is suggested. |

**Export** (in the header) hands a screen to a developer:

1. Choose **Whole screen**, or click an area first (or pick a pattern region) to export just that.
2. Name it. The name suggested comes from the pattern and region, e.g. `invoice-dashboard-toolbar`.
3. **Copy JSON** or **Download JSON** saves `<name>.atoms.json`. **Copy image** or **Download image** saves `<name>.png`, a screenshot of the same area without the inspector in it. **Download JSON + image** puts both in `<name>.zip`.

The developer pastes the JSON into Claude with the Atoms MCP connected, and Claude calls the MCP's `build_from_json` tool with it. That returns a React file built from Atoms — components with the props the design passed, layouts with their tokens, lists as sample data — plus the components to look up, the handlers to wire, and the gaps: restyles of a component are left out of the code and listed, never copied as `sx`. The file also says how to build from it by hand (`readme`), and holds:

| Field | What it holds |
| --- | --- |
| `atoms`, `source`, `scope` | The Atoms release, page, viewport, mode and the exported area |
| `pattern` | The pattern and its regions, when the page marks them |
| `summary` | Every component, layout primitive, icon and token used |
| `tree` | Components with the props they were given, layout primitives with gaps and padding as tokens, plain elements with their styles matched to tokens, icons and text. Three or more siblings of the same shape become one `repeat`: a short list keeps every item, a long one its first twelve |
| `deviations` | Every `sx` or `style` restyling a component, every off-token value, and every colour drift, grouped |

The export includes the area's text and sample data, so check it before sharing. Images cover what is on screen. The JSON covers the whole area, on screen or not.

## Atoms Studio

**Edit in Atoms Studio** (in Export) rebuilds the exported area with the real Atoms library, in a full-page editor. **Studio** at the top of the inspector opens every saved design; so does right-clicking the toolbar icon → **Open Atoms Studio**.

- **Projects:** captures are filed under a project named after the site. Rename, duplicate, move or delete screens. Drop an `.atoms.json` or a handover zip on the page to import it.
- **Canvas:** the design renders in an iframe with the Atoms theme, so it responds to the canvas width (1440 down to 390) and switches between light and dark.
  - Click to select. Drag to move within a layout or into another; a line shows where it will land.
  - Drag the handles on the selection's right edge, bottom edge or corner to resize it (<kbd>Shift</kbd> snaps to 4px). A component's new size is an override, a layout's or element's is its own width and height, and an icon's is its `size` prop.
  - Pinch the trackpad to zoom at the pointer (or <kbd>⌘</kbd> + scroll), and scroll with two fingers to pan. Hold <kbd>Space</kbd> and drag, or drag with the middle button, to move the canvas. Clicking the empty stage clears the selection.
  - A selection is measured as in the inspector: padding and margin bands with their values, gaps between children, and the size. Hold <kbd>Alt</kbd> and hover to see red distance lines to another element, labelled with the spacing token. <kbd>⌘</kbd>-click measures the exact element inside a component.
  - **Compare** lays the captured screenshot over the rebuild (Overlay, Difference) or beside it.
- **Layers:** the whole tree, collapsible and draggable. **Insert** adds any Atoms component, a Stack or Box, or any of the 1,500 icons — click to add it after the selection, or drag it onto the canvas to drop it where the line shows.
- **Design panel:**
  - **Components:** props appear as controls generated from their documented types (`variant` is a dropdown of its real options). Components can be swapped, keeping shared props. Icons passed as props (`startIcon`) have their own glyph, size and weight pickers.
  - **Component style:** width, height, icon size, side and top-and-bottom padding, font size, weight, text colour, fill, border colour and width, radius and shadow. Each row shows what the canvas draws now. Spacing, type, colour, radius and shadow come from token pickers; sizes are pixels, since Atoms has no size scale. <kbd>⌘</kbd>-click a part of a component (a TextField's input) to style just that part. Every change here is an override and goes to the developer as a deviation — prefer a prop where one exists.
  - **Layouts and plain elements:** gap, padding, margin, colour, border, radius, shadow and type are each a token picker, with swatches for colours.
  - Text is edited in place (double-click), and any node can carry a note for the developer.
- **Inspect:** the selection's box model and every value it renders matched to its token, the same readout the inspector gives on a live page, plus its CSS to copy.
- **Deviations:** every `sx`, `style`, off-token value and drift. Snap a value to its nearest token, remove an override, or accept it as a library gap with a reason.
- **Hand over:**
  - The JSON (with an `edited` list of every change), a prompt for Claude, and a PNG of the edited design.
  - One zip with the JSON, the original screenshot and the edited one.
  - Saved versions can be restored.
- **Keys:**

  | Key | Action |
  | --- | --- |
  | <kbd>⌘Z</kbd> / <kbd>⇧⌘Z</kbd> | Undo / redo |
  | <kbd>⌘D</kbd> | Duplicate |
  | <kbd>⌫</kbd> | Delete |
  | <kbd>⌘C</kbd> / <kbd>⌘V</kbd> | Copy / paste |
  | <kbd>⌥↑</kbd> / <kbd>⌥↓</kbd> | Reorder |
  | <kbd>Esc</kbd> | Select the parent |
  | <kbd>Enter</kbd> | Edit text |
  | <kbd>Alt</kbd> + hover | Measure from the selection |
  | Pinch, or <kbd>⌘</kbd> + scroll | Zoom at the pointer |
  | <kbd>⌘+</kbd> / <kbd>⌘−</kbd> / <kbd>⌘0</kbd> / <kbd>⇧1</kbd> | Zoom in / out / 100% / fit |
  | <kbd>Space</kbd> + drag | Pan |
  | <kbd>⌘</kbd> + click | Select the exact element inside a component |

Everything is saved in this browser's IndexedDB as you work. Uninstalling the extension deletes it, so export the zips you want to keep.

Studio renders what the file carries. Callbacks and state are not re-run. A data grid's cells show what its cell renderers drew at capture, and plain markup the design wrote itself is rebuilt from its captured styles.

**Version check:** the footer shows the inspector's Atoms release and the page's, e.g. `Inspector 2.1.0 · page 2.1.0 ✓`. The page's release is read from its dev marks. When the two differ, a warning at the top of the panel says whether the page is newer or older, or runs two copies of Atoms, and what to update. Values that changed between the two releases show as drift, so treat drift under that warning with care. A page with no marks shows `page no marks`.

**Mode:** Auto reads the page's `data-dark` attribute. Switch to Light or Dark when a page marks its colour scheme some other way.

## Limits

- Component names need React. On other pages, measurements and token lookups still work.
- Exact names and drift need a development build of an Atoms release with marks. Without marks, two tokens that share a value are both listed.
- Colours a caller passes as bare strings (e.g. `colors={{ bg: '#f1edfc' }}` on Chip) show as "raw colour". Pass the token object instead to get an exact name.
- `sx` written as a function is read by calling it with a stand-in theme, so its keys are exact but theme-derived values show as `theme(…)`. Responsive `sx` is checked at the current width only.
- Tokens come from this repo's current release. A prototype built on an older Atoms release may show a few values as off-system.
- The panel covers part of the page. Use the dock button to move it to the other side.
