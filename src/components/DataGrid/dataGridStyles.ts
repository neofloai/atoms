import { checkboxClasses, paperClasses } from '@mui/material';
import { gridClasses as c } from '@mui/x-data-grid';

import {
  border,
  elevation,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  TABLE_CELL_PADDING_INLINE_PX,
  TABLE_SORT_ICON_PX,
  TABLE_SORT_TINT_HEIGHT_PX,
  TABLE_SORT_TINT_PADDING_PX,
  TABLE_SORT_TINT_RADIUS_PX,
} from '../Table/tableTokens';
import {
  DATA_GRID_CHECKBOX_HALO_PADDING_PX,
  DATA_GRID_EDGE_INSET_CALC,
  DATA_GRID_FOOTER_HEIGHT_PX,
  dataGridCaptionType,
  dataGridCellType,
} from './dataGridTokens';

import type { CSSObject, Theme } from '@mui/material/styles';

/**
 * The classes `rowState` puts on a row. Internal: callers reach them
 * through the prop rather than by name, so they can be renamed freely.
 */
export const DATA_GRID_ROW_STATE_CLASS = {
  error: 'NeofloDataGrid-row--error',
  success: 'NeofloDataGrid-row--success',
  disabled: 'NeofloDataGrid-row--disabled',
} as const;

/**
 * Everything the wrapper repaints on MUI X's grid.
 *
 * ## Why these rules win, and why they are not `&&`
 *
 * `styled(DataGrid)` cannot merge with the grid's own `styled()` the way a
 * wrapper merges with an MUI Material component — the grid is a
 * `memo(forwardRef)`, not an emotion component. What happens instead is
 * one step further in: the wrapper's class is handed down as `className`
 * to the grid's root, which *is* an emotion component, and emotion
 * inlines any class it recognises **after** its own styles. So these
 * declarations land last inside a single merged class and win at equal
 * specificity, with no `&&` needed.
 *
 * That matters in both directions. `&&` would also outrank a consumer's
 * `sx`, which is one class, and the whole point of an escape hatch is
 * that it works. So the rules here stay at one class and `sx` keeps the
 * last word — the lesson `Drawer` paid for.
 *
 * ## Why the design is not set as `--DataGrid-t-*` variables
 *
 * It should be. MUI X v9 draws the entire grid from a set of theme
 * variables, and setting `--DataGrid-t-color-border-base` once would
 * recolour every hairline in it, including in parts that have not
 * rendered yet.
 *
 * They cannot be reached from here. The grid emits those variables as a
 * raw `<style>` tag — one class, no `@layer` — while every emotion style
 * in MUI v9 is written inside `@layer mui`, and an unlayered declaration
 * beats a layered one no matter how specific the layered one is. The only
 * ways past it are `!important` on each variable, which would then also
 * refuse a consumer's `sx`, or overriding the properties the variables
 * feed. This does the latter: it is more rules, but they behave like
 * ordinary CSS.
 *
 * Two variables *are* set below, and they are the two the grid declares
 * through emotion rather than through that style tag — so they arrive by
 * the normal route and can be overwritten normally.
 */
export function dataGridStyles(theme: Theme): CSSObject {
  const inset = DATA_GRID_EDGE_INSET_CALC;

  return {
    // One `paired()` call for everything mode-aware on this element, not
    // two: each call emits its dark half under the same nested selector
    // key, so a second one at the same level silently replaces the first.
    //
    // `--DataGrid-rowBorderColor` is the hairline every rule and cell
    // border in the grid reads, so the design's `border/layers/card 1`
    // reaches all of them from here.
    ...paired(theme, {
      '--DataGrid-rowBorderColor': border.layers.card1,
      color: text.default.body,
    }),

    // A header label is told from its data by colour, not by weight.
    '--unstable_DataGrid-headWeight': fontWeights.regular,

    // ── A stack of bands, not a card ──────────────────────────────
    // The same call the table makes: no outer border, no radius, no fill
    // of its own, so a grid takes the colour of whatever it is dropped
    // onto and the edge around it belongs to a `Card`.
    border: 'none',
    borderRadius: 0,
    backgroundColor: 'transparent',

    // No `min-height` floor here, deliberately. MUI's grid is
    // `height: 100%`, and a floor looks like a kindness for the parent
    // that has no height of its own — but `height: 100%` of a 128px
    // parent is 128px, and a 320px floor beats it. Every container
    // shorter than the floor got a grid hanging out of the bottom of it,
    // rendering rows it had no room for. A grid takes the height it is
    // given; `autoHeight` is the answer for a parent that gives none.

    // ── Cells ─────────────────────────────────────────────────────
    // No leading here: the grid centres a cell's single line by setting
    // `line-height` to the row height, so the design's 20 is enforced by
    // the row instead. See `dataGridCellType`.
    [`& .${c.cell}`]: {
      ...dataGridCellType,
      ...paired(theme, { color: text.default.body }),
      paddingInline: TABLE_CELL_PADDING_INLINE_PX,
    },

    // Every row ends with an empty filler cell, and it carries the `cell`
    // class — so the padding above gave a zero-width element 16px of
    // width, the rows came out 16 wider than the columns the grid had
    // measured, and each one lost 16px off its right edge to a scroll it
    // did not know it had.
    [`& .${c.cellEmpty}`]: { padding: 0 },

    // A selection column reads from its inset edge rather than from the
    // middle of a 50px box, so the control is pulled back onto that edge
    // by the padding it keeps — see `DATA_GRID_CHECKBOX_HALO_PADDING_PX`
    // for why it is 4 rather than MUI's 9 or the 0 this started at.
    //
    // The control is reached by its own class rather than as a direct
    // child: in a body cell it is one, but a header cell wraps it in the
    // draggable and title containers, so `> *` would reach one and leave
    // the other alone.
    //
    // Where the column's own padding is settled is the edge inset at the
    // end of this object, not here.
    [`& .${c.columnHeaderCheckbox} .${checkboxClasses.root},
      & .${c.cellCheckbox} .${checkboxClasses.root}`]: {
      padding: DATA_GRID_CHECKBOX_HALO_PADDING_PX,
      marginInlineStart: -DATA_GRID_CHECKBOX_HALO_PADDING_PX,
    },

    // And nothing in that column clips. A grid cell hides its overflow so
    // a long label ends in an ellipsis, but the halo is 32 in a 26px gap
    // by design — hidden here would slice the ring off at both sides,
    // which is the bracket again in a rounder shape. Scoped to the
    // selection column, so every other cell keeps its ellipsis.
    [`& .${c.columnHeaderCheckbox}, & .${c.cellCheckbox},
      & .${c.columnHeaderCheckbox} .${c.columnHeaderDraggableContainer},
      & .${c.columnHeaderCheckbox} .${c.columnHeaderTitleContainer},
      & .${c.columnHeaderCheckbox} .${c.columnHeaderTitleContainerContent}`]: {
      overflow: 'visible',
    },

    // ── Hairlines ─────────────────────────────────────────────────
    // The grid draws the rule as a `border-top` per cell with the first
    // row's set to transparent, which comes out identical to the table's
    // bottom-per-row — except at the end, where the last row has no line
    // under it. The design's table ends on a rule.
    [`& .${c['row--lastVisible']} .${c.cell}`]: {
      borderBottom: '1px solid var(--rowBorderColor)',
    },
    // The design draws no vertical rules, and the grid draws one between
    // every pair of headers. They are also the handle a column is resized
    // by, so they are hidden rather than removed: nothing at rest, and
    // there as soon as the pointer is on the header it belongs to.
    [`& .${c.columnSeparator}`]: {
      opacity: 0,
      ...paired(theme, { color: border.layers.card1 }),
    },
    [`& .${c.columnHeader}:hover .${c.columnSeparator},
      & .${c['columnSeparator--resizing']}`]: { opacity: 1 },
    // The last column's separator has nothing on the other side of it, and
    // it is centred on the boundary — so it hangs 5px past the last column
    // and makes the grid think it has something to scroll to.
    [`& .${c['columnHeader--last']} .${c.columnSeparator}`]: {
      display: 'none',
    },

    // ── Rows ──────────────────────────────────────────────────────
    // Hover and selection are the same fill, which is what the design
    // draws; MUI blends both from `primary.main` at a few per cent, and
    // tells them apart by depth. Here the pair of primary hairlines does
    // that instead. Both lines are `border-top`s on separate elements —
    // the row's own and the next row's — so unlike the table there is no
    // collapsed border tie to lose, and a selected *first* row gets its
    // upper line too.
    [`& .${c.row}:hover, & .${c.row}.Mui-selected, & .${c.row}.Mui-selected:hover`]:
      paired(theme, { backgroundColor: surface.layers.card1 }),
    [`& .${c.row}.Mui-selected, & .${c.row}.Mui-selected + .${c.row}`]: paired(
      theme,
      { '--rowBorderColor': border.primary.defaultHover }
    ),

    // ── Row states, read off the row's own data ───────────────────
    [`& .${DATA_GRID_ROW_STATE_CLASS.error}`]: {
      ...paired(theme, { backgroundColor: surface.error.subtle }),
      '&:hover': paired(theme, { backgroundColor: surface.error.subtleHover }),
    },
    [`& .${DATA_GRID_ROW_STATE_CLASS.success}`]: {
      ...paired(theme, { backgroundColor: surface.success.subtle }),
      '&:hover': paired(theme, {
        backgroundColor: surface.success.subtleHover,
      }),
    },
    [`& .${DATA_GRID_ROW_STATE_CLASS.disabled}`]: {
      ...paired(theme, { '--rowBorderColor': border.disabled.default }),
      [`& .${c.cell}`]: paired(theme, { color: text.disabled.default }),
    },

    // ── The header strip ──────────────────────────────────────────
    // Filled, because the header is always pinned over a scrolling body
    // and a transparent one would have rows moving through it. It takes
    // the card surface, on the assumption a grid sits on a card; a grid
    // somewhere else says so with `sx`.
    [`& .${c.columnHeaders}, & .${c.columnHeader}`]: paired(theme, {
      backgroundColor: surface.layers.card1,
    }),
    [`& .${c.columnHeader}`]: {
      ...dataGridCaptionType,
      ...paired(theme, { color: text.default.placeholder }),
      paddingInline: TABLE_CELL_PADDING_INLINE_PX,
    },
    // MUI leaves the label at `line-height: normal`, which is close to 16
    // for 12px DM Sans but not equal to it.
    [`& .${c.columnHeaderTitle}`]: {
      lineHeight: dataGridCaptionType.lineHeight,
    },

    // The tint behind a sortable column's label while the pointer is on
    // it. `flex: 0 1 auto` is what makes it hug the label instead of
    // filling the cell — MUI gives the container `flex: 1` — and the auto
    // margin holds it against the side the column reads from.
    [`& .${c['columnHeader--sortable']} .${c.columnHeaderTitleContainer}`]: {
      flex: '0 1 auto',
      gap: TABLE_SORT_TINT_PADDING_PX,
      minHeight: TABLE_SORT_TINT_HEIGHT_PX,
      paddingInline: TABLE_SORT_TINT_PADDING_PX,
      borderRadius: TABLE_SORT_TINT_RADIUS_PX,
      marginInlineEnd: 'auto',
    },
    [`& .${c['columnHeader--alignRight']} .${c.columnHeaderTitleContainer}`]: {
      marginInlineEnd: 0,
      marginInlineStart: 'auto',
    },
    [`& .${c['columnHeader--alignCenter']} .${c.columnHeaderTitleContainer}`]: {
      marginInline: 'auto',
    },
    [`& .${c['columnHeader--sortable']}:hover .${c.columnHeaderTitleContainer}`]:
      paired(theme, { backgroundColor: surface.default.default }),

    // The glyphs inside that tint are the design's 16px ones with no
    // chrome of their own: the tint is the affordance, so a second hover
    // fill behind the arrow would read as a control inside a control.
    [`& .${c.sortButton}, & .${c.menuIconButton}`]: {
      padding: 0,
      borderRadius: TABLE_SORT_TINT_RADIUS_PX,
      color: 'inherit',
      '&:hover': { backgroundColor: 'transparent' },
    },
    [`& .${c.sortIcon}, & .${c.menuIcon} svg`]: {
      width: TABLE_SORT_ICON_PX,
      height: TABLE_SORT_ICON_PX,
      fontSize: TABLE_SORT_ICON_PX,
    },

    // The ring a focused cell draws, on the design's focus border rather
    // than on `primary.main` at half opacity.
    [`& .${c.cell}:focus, & .${c.cell}:focus-within,
      & .${c.columnHeader}:focus, & .${c.columnHeader}:focus-within`]: paired(
      theme,
      { outlineColor: border.primary.focus }
    ),

    // ── The footer band ───────────────────────────────────────────
    // No border of its own: the last row's hairline is already there, and
    // two rules a pixel apart read as one thick one.
    [`& .${c.footerContainer}`]: {
      minHeight: DATA_GRID_FOOTER_HEIGHT_PX,
      height: DATA_GRID_FOOTER_HEIGHT_PX,
      border: 'none',
      paddingInline: inset,
    },
    [`& .${c.selectedRowCount}, & .${c.rowCount}`]: {
      ...dataGridCaptionType,
      ...paired(theme, { color: text.default.caption }),
      margin: 0,
    },

    // ── Overlays ──────────────────────────────────────────────────
    [`& .${c.overlay}`]: {
      ...dataGridCaptionType,
      ...paired(theme, { color: text.default.caption }),
      backgroundColor: 'transparent',
    },

    // ── The edge inset ────────────────────────────────────────────
    // The row's 16px, spent on the two columns that touch the edge
    // exactly as the table spends it. `[aria-colindex='1']` picks up the
    // first header and the first cell in one selector, including a
    // selection column, which the design also insets. The last cell is
    // found through the empty filler cell the grid always renders after
    // it, since `:last-child` would match that filler instead.
    //
    // Last on purpose. These are one class deep, the same as the cell and
    // header rules above that set `padding-inline` on both sides, and at
    // equal specificity the later rule wins — placed any earlier, the
    // header's shorthand would quietly undo the inset.
    // `data-colindex` alongside it for the loading state: a skeleton cell
    // carries that attribute rather than the aria one, and without it the
    // bars would sit 8 from the edge and then step to 24 when the rows
    // arrive.
    [`& [aria-colindex='1'], & [data-colindex='0']`]: {
      paddingInlineStart: inset,
    },
    [`& .${c['columnHeader--last']}`]: { paddingInlineEnd: inset },
    [`& .${c.cell}:has(+ .${c.cellEmpty})`]: { paddingInlineEnd: inset },

    // And the selection column gives its trailing 8 back, last of all.
    // A grid column is a hard width with `overflow: hidden` behind it, so
    // 24 of inset plus a 24px control plus 8 is 56 in the 50px box the
    // grid reserves — six pixels of checkbox sliced off its right edge,
    // which reads as a bracket rather than a square. A table cell would
    // simply have grown.
    //
    // It has to be here, below the header rule, which sets the
    // `padding-inline` shorthand on every header at the same specificity
    // and would otherwise put the 8 straight back. And it has to be the
    // column's only entry in this object: a second one under the same key
    // would look later but is not — a repeated key keeps the position of
    // the first and only replaces its value, which is how the header sat
    // clipped while the body cell was fine.
    [`& .${c.columnHeaderCheckbox}, & .${c.cellCheckbox}`]: {
      justifyContent: 'flex-start',
      paddingInlineEnd: 0,
    },

    // The grid marks that header `align: center`, which would split the
    // two pixels the control does not use and leave the header's box a
    // pixel to the right of every box under it. It reads from the inset
    // like the column it heads.
    [`& .${c.columnHeaderCheckbox} .${c.columnHeaderTitleContainer}`]: {
      justifyContent: 'flex-start',
      marginInline: 0,
    },
  };
}

/**
 * The panel a column menu opens in, which is the house `Menu`'s panel:
 * `card 2` on a `card 2` hairline, 16px corners, a 4px inset around the
 * rows, `Shadow/medium`.
 *
 * Restated here rather than imported from `Menu` because the two arrive
 * by different routes. A menu opens in a portal at the end of `<body>`,
 * so no selector rooted at the grid can reach it — MUI X's own channel is
 * `slotProps.basePopper`, and what that popper holds is a plain MUI
 * `Paper`. The values are the ones `Menu.tsx` documents; the Figma panel
 * they both come from is 132 × 116 for three 36px rows, which is
 * `4 + 3 × 36 + 4`.
 *
 * Every length here is a string, and has to be: this object is an `sx`
 * rather than a `styled()`, and `sx` runs its own transforms over bare
 * numbers — `borderRadius: 16` means sixteen *times* the theme's radius,
 * and `padding: 4` four times its spacing unit. A 128px corner on a 32px
 * inset is how that reads on screen.
 */
export function dataGridMenuPanelStyles(theme: Theme): CSSObject {
  return {
    [`& .${paperClasses.root}`]: {
      borderRadius: `${radius.lg}px`,
      padding: `${spacing.component.xxs}px`,
      borderWidth: '1px',
      borderStyle: 'solid',
      boxShadow: elevation.medium,
      // MUI tints an elevated `Paper` in dark mode with an overlay
      // gradient keyed off the elevation, which would double-tint a
      // surface token that already carries its own dark value.
      backgroundImage: 'none',
      ...paired(theme, {
        backgroundColor: surface.layers.card2,
        borderColor: border.layers.card2,
      }),
    },
    // Figma's inset is on the panel and the rows sit flush against each
    // other, so MUI's own list padding goes.
    [`& .${c.menuList}`]: { padding: 0 },
  };
}
