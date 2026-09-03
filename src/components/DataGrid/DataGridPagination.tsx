'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
  gridPageCountSelector,
  gridPaginationModelSelector,
  gridPaginationRowCountSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';

import { text } from '@/src/tokens';
import {
  CaretDoubleLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from '@/src/icons/glyphs';

import { paired } from '../_shared/actionStyles';
import { IconButton } from '../IconButton';
import {
  DATA_GRID_FOOTER_CONTROL_GAP_PX,
  DATA_GRID_FOOTER_LABEL_GAP_PX,
  dataGridCaptionType,
} from './dataGridTokens';
import { useDataGridContext } from './DataGridContext';

const Strip = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: DATA_GRID_FOOTER_LABEL_GAP_PX,
});

const Count = styled('span')(({ theme }) => ({
  ...dataGridCaptionType,
  ...paired(theme, { color: text.default.caption }),
  whiteSpace: 'nowrap',
}));

const Controls = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: DATA_GRID_FOOTER_CONTROL_GAP_PX,
});

/** An unknown total, which server-side pagination reports as -1. */
function isUnknown(rowCount: number | undefined): boolean {
  return rowCount == null || rowCount < 0;
}

/**
 * The pagination strip under the rows: how much of the set is on screen,
 * then the controls that move through it.
 *
 * Replaces MUI's footer pagination, which is `TablePagination` — a
 * rows-per-page `Select`, a count, and two bare arrows. The design
 * (`table-footer-navigation`, 3206:122298) has no rows-per-page control
 * at all and three filled 32px buttons, so this is written rather than
 * restyled. `pageSizeOptions` still works; nothing in the footer offers
 * it, so a caller who wants a page-size control puts one in their own
 * toolbar.
 *
 * ## What the three states are
 *
 * Figma draws `first`, `middle` and `last`, and the difference between
 * them is which controls exist rather than which are greyed:
 *
 *   - **first** — two buttons. Previous is present and disabled; the
 *     jump-to-start is *absent*, because there is nothing to jump to.
 *   - **middle** — three, all live.
 *   - **last** — three, with next disabled.
 *
 * So the jump-to-start appears once you have left the first page and
 * disappears when you return, which is why it is rendered conditionally
 * while the two arrows are only disabled. There is no jump-to-end; the
 * design does not draw one, and with a server-side count there may not be
 * an end to jump to.
 *
 * ## The label
 *
 * `1–20 of 278 transactions`, with the noun coming from the grid's
 * `rowNoun`. An en dash, as drawn. Two cases the design has no variant
 * for: an empty set reads `0 transactions`, and an unknown total — server
 * pagination reporting `rowCount: -1` — drops the total and reads
 * `1–20`, rather than inventing copy for a number nobody has.
 */
export function DataGridPagination(): React.JSX.Element {
  const apiRef = useGridApiContext();
  const { rowNoun } = useDataGridContext();

  const { page, pageSize } = useGridSelector(
    apiRef,
    gridPaginationModelSelector
  );
  const rowCount = useGridSelector(apiRef, gridPaginationRowCountSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const unknownTotal = isUnknown(rowCount);
  const noun = rowNoun ? ` ${rowNoun}` : '';

  const from = page * pageSize + 1;
  const to = unknownTotal
    ? (page + 1) * pageSize
    : Math.min(rowCount, (page + 1) * pageSize);

  let label: string;
  if (!unknownTotal && rowCount === 0) {
    label = `0${noun}`;
  } else if (unknownTotal) {
    label = `${from}–${to}`;
  } else {
    label = `${from}–${to} of ${rowCount}${noun}`;
  }

  const atStart = page === 0;
  const atEnd = !unknownTotal && page >= pageCount - 1;

  return (
    <Strip>
      <Count>{label}</Count>
      <Controls>
        {!atStart && (
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Go to first page"
            onClick={() => {
              apiRef.current.setPage(0);
            }}
          >
            <CaretDoubleLeftIcon />
          </IconButton>
        )}
        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Go to previous page"
          disabled={atStart}
          onClick={() => {
            apiRef.current.setPage(page - 1);
          }}
        >
          <CaretLeftIcon />
        </IconButton>
        <IconButton
          variant="secondary"
          size="sm"
          aria-label="Go to next page"
          disabled={atEnd}
          onClick={() => {
            apiRef.current.setPage(page + 1);
          }}
        >
          <CaretRightIcon />
        </IconButton>
      </Controls>
    </Strip>
  );
}

DataGridPagination.displayName = 'DataGridPagination';
