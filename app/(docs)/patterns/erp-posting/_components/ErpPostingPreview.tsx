'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { Alert } from '@/src/components/Alert';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { DataGrid } from '@/src/components/DataGrid';
import { Divider } from '@/src/components/Divider';
import { IconButton } from '@/src/components/IconButton';
import { Menu } from '@/src/components/Menu';
import { MenuItem } from '@/src/components/MenuItem';
import {
  NAVBAR_META_ICON_PX,
  Navbar,
  NavbarTitle,
} from '@/src/components/Navbar';
import { Select } from '@/src/components/Select';
import { TextField } from '@/src/components/TextField';
import { Tooltip } from '@/src/components/Tooltip';
import { Typography } from '@/src/components/Typography';
import { spacing } from '@/src/tokens';
import {
  ArrowRightIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  FilePdfIcon,
  ListIcon,
  ScissorsIcon,
  TicketIcon,
  UploadSimpleIcon,
  WrenchIcon,
} from '@/src/icons';

// The workflow rail and the main menu behind the hamburger, both from the
// shell the Drawer page already shows. Imported rather than redrawn: this is
// the same strip the extraction and matching screens mount, and a second copy
// would drift from them.
import {
  AppRail,
  WORKFLOW_NAV,
  WORKFLOW_SECONDARY_NAV,
} from '../../../components/drawer/_components/AppRail';
import {
  Currency,
  Digits,
  HEADER_FIELDS,
  HEADER_META,
  Index,
  LINE_ITEMS,
  Money,
  VAT_CODES,
  WHT_CODES,
  formatMoney,
  formatVariance,
  isBlocked,
  money,
  simulate,
  variance,
} from './postingRecord';

import type { GridColDef } from '@mui/x-data-grid';
import type { Finding, LineItem, TaxCode } from './postingRecord';

/** Tall enough for the whole form, a page of lines, and two findings. */
const FRAME_HEIGHT_PX = 900;

/**
 * Lines a page holds here, against the ten the pasteable snippet shows.
 *
 * A docs column is not a 1440px page: the form above is three rows of fields
 * whatever the viewport, so the grid is what gives up the height. Five is
 * enough to read the shape of a row and — with ten line items — puts a second
 * page under the pagination the frame draws, which one page of ten would not.
 */
const PAGE_SIZE = 5;

/** Gap between the trailing actions, as `PageHeaderBar` sets it. */
const ACTION_GAP = 1.5;

/** How long the two round trips pretend to take. */
const SIMULATE_MS = 700;
const POST_MS = 900;

/**
 * The required mark on a column header, where there is no `FormLabel` to set
 * it for us.
 *
 * Plain, deliberately. `TextField` draws the asterisk in the label's own ink,
 * and the frame draws it in `text/error/4` — but recolouring it here would
 * mean this screen's required fields looked different from every other
 * screen's, and eleven local overrides is the wrong place to fix one
 * component's decision. So the header matches what `TextField` does rather
 * than what the frame does, and the gap belongs to `TextField`.
 */
const HeaderCell = styled('span')({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  minWidth: 0,
});

/**
 * The upload control: the button, and a caret for the other ways a document
 * can arrive.
 *
 * The frame draws these as one split control behind a dashed edge — the
 * border doing double duty as a drop target. Atoms has no dashed `appearance`
 * and no split button, and faking either means overriding `Button`'s radius
 * and `Divider`'s border style, so this is two stock controls side by side
 * instead. A dashed drop zone is a `Button` appearance to add, not a thing to
 * hand-roll per screen.
 */
function UploadFiles() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <>
      <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
        <Button
          variant="secondary"
          appearance="outline"
          size="sm"
          startIcon={<UploadSimpleIcon />}
        >
          Upload Files
        </Button>
        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label="Other ways to add a document"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <CaretDownIcon />
        </IconButton>
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Upload from device</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          Attach from vendor portal
        </MenuItem>
      </Menu>
    </>
  );
}

UploadFiles.displayName = 'UploadFiles';

/**
 * A tax column's header: the label, its required mark, and a caret that sets
 * the code on every line at once.
 *
 * The frame draws a caret on these two headers and on none of the others,
 * which is what identifies it as a bulk control rather than a sort menu —
 * `Description` and `Line Total` are the sortable columns and they carry no
 * caret. It earns its place on a ten-line invoice, where every line usually
 * takes the same code and setting it row by row is ten decisions to make the
 * same way.
 */
function TaxHeader({
  label,
  options,
  onApplyAll,
}: {
  label: string;
  options: readonly TaxCode[];
  onApplyAll: (value: string) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  return (
    <HeaderCell>
      {label}*
      <Tooltip title={'Set ' + label + ' on every line'}>
        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label={'Set ' + label + ' on every line'}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <CaretDownIcon size={14} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => setAnchorEl(null)}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              onApplyAll(option.value);
              setAnchorEl(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </HeaderCell>
  );
}

TaxHeader.displayName = 'TaxHeader';

/**
 * The one control on a line, and it changes with what the check found.
 *
 * `Split` is always available: a line that covers two cost centres has to
 * become two lines before it can be posted, and that is a property of the
 * accounting rather than of anything being wrong. `Fix value` replaces it
 * only on a line whose arithmetic the simulate pass rejected, because a
 * repair offered on a line with nothing to repair is a control that does
 * nothing when pressed.
 */
function LineActions({
  finding,
  onFix,
}: {
  finding?: Finding;
  onFix: () => void;
}) {
  if (finding?.fix !== undefined) {
    return (
      <Tooltip title={'Set the line total to ' + formatMoney(finding.fix)}>
        <Button
          variant="error"
          appearance="outline"
          size="sm"
          startIcon={<WrenchIcon size={14} />}
          onClick={onFix}
        >
          Fix value
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Split this line">
      <IconButton
        variant="secondary"
        appearance="text"
        size="sm"
        aria-label="Split this line"
      >
        <ScissorsIcon size={16} />
      </IconButton>
    </Tooltip>
  );
}

LineActions.displayName = 'LineActions';

/**
 * The ERP posting screen: the last stage of the invoice processing workflow.
 *
 * ## Two kinds of field, one form
 *
 * The three amounts and the PO number came out of extraction and matching and
 * are read-only here — required, and still not this screen's to change, because
 * editing an amount at the point of posting would mean editing the invoice.
 * Everything else is what the ERP needs and no earlier stage supplies, which
 * is the reason this screen exists rather than the post going by itself.
 *
 * ## Simulate is the screen's whole argument
 *
 * `Proceed` starts disabled and stays disabled until a simulate pass comes
 * back clean. That is not a nag: the check multiplies every line out, compares
 * the total against what the invoice claims, and reports what the ERP would
 * say — so the only way to know the post will land is to have asked. A screen
 * that let you post first would be a screen that discovered the error in the
 * accounting system, where it costs a reversal.
 *
 * ## The findings are one list
 *
 * An error blocks and an advisory does not, but they arrive together because
 * the user asked one question. Severity is a property of each finding rather
 * than of a panel it sits in.
 */
export function ErpPostingPreview(): React.JSX.Element {
  const [navOpen, setNavOpen] = React.useState(false);
  const [belowBar, setBelowBar] = React.useState<HTMLElement | null>(null);

  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(HEADER_FIELDS.map((field) => [field.key, field.value]))
  );
  const [lines, setLines] = React.useState<readonly LineItem[]>(LINE_ITEMS);

  const [checking, setChecking] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [posting, setPosting] = React.useState(false);
  const [posted, setPosted] = React.useState(false);

  // One timer at a time — Simulate and Proceed cannot both be in flight,
  // since the second is disabled until the first has come back.
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  React.useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * The findings are derived, not stored. Fixing a line has to clear the
   * finding that named it in the same render — a stored list would go stale
   * the moment the record changed under it, and a stale "line 3 is wrong"
   * next to a corrected line 3 is worse than no check at all.
   */
  const findings = checked ? simulate(lines) : [];
  const blocked = isBlocked(findings);
  const gap = variance(lines);

  const findingByLine = new Map<number, Finding>();
  for (const finding of findings) {
    if (finding.lineId !== undefined) findingByLine.set(finding.lineId, finding);
  }

  function runSimulate() {
    setChecking(true);
    setPosted(false);
    timer.current = setTimeout(() => {
      setChecking(false);
      setChecked(true);
    }, SIMULATE_MS);
  }

  function runPost() {
    setPosting(true);
    timer.current = setTimeout(() => {
      setPosting(false);
      setPosted(true);
    }, POST_MS);
  }

  function setLineCode(id: number, field: 'vatCode' | 'whtCode', code: string) {
    setLines((previous) =>
      previous.map((line) => (line.id === id ? { ...line, [field]: code } : line))
    );
  }

  function applyToAll(field: 'vatCode' | 'whtCode', code: string) {
    setLines((previous) => previous.map((line) => ({ ...line, [field]: code })));
  }

  function fixLine(id: number) {
    setLines((previous) =>
      previous.map((line) =>
        line.id === id
          ? { ...line, lineTotal: money(line.quantity * line.unitPrice) }
          : line
      )
    );
  }

  const columns: GridColDef<LineItem>[] = [
    {
      field: 'id',
      headerName: '#',
      width: 56,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => <Index>{row.id}</Index>,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.6,
      minWidth: 150,
    },
    {
      field: 'lineTotal',
      headerName: 'Line Total',
      width: 118,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Money>
          <Currency>$</Currency>
          <Digits>
            {row.lineTotal.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Digits>
        </Money>
      ),
    },
    {
      field: 'vatCode',
      headerName: 'VAT Tax Code',
      width: 148,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <TaxHeader
          label="VAT Tax Code"
          options={VAT_CODES}
          onApplyAll={(code) => applyToAll('vatCode', code)}
        />
      ),
      renderCell: ({ row }) => (
        <Select
          value={row.vatCode}
          onChange={(event) =>
            setLineCode(row.id, 'vatCode', event.target.value)
          }
          aria-label={'VAT tax code for line ' + row.id}
          fullWidth
        >
          {VAT_CODES.map((code) => (
            <MenuItem key={code.value} value={code.value}>
              {code.label}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: 'whtCode',
      headerName: 'WHT Tax Code',
      width: 148,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <TaxHeader
          label="WHT Tax Code"
          options={WHT_CODES}
          onApplyAll={(code) => applyToAll('whtCode', code)}
        />
      ),
      renderCell: ({ row }) => (
        <Select
          value={row.whtCode}
          onChange={(event) =>
            setLineCode(row.id, 'whtCode', event.target.value)
          }
          aria-label={'WHT tax code for line ' + row.id}
          fullWidth
        >
          {WHT_CODES.map((code) => (
            <MenuItem key={code.value} value={code.value}>
              {code.label}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 122,
      sortable: false,
      filterable: false,
      align: 'center',
      renderCell: ({ row }) => (
        <LineActions
          finding={findingByLine.get(row.id)}
          onFix={() => fixLine(row.id)}
        />
      ),
    },
  ];

  return (
    <Stack
      sx={{
        height: FRAME_HEIGHT_PX,
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* A page header, not an app bar: it spans the whole width and names the
          record, so the hamburger at its leading edge reads as "the
          navigation" rather than as the strip below it. */}
      <Navbar size="md">
        <IconButton
          variant="secondary"
          appearance="text"
          size="sm"
          aria-label="Open navigation"
          onClick={() => setNavOpen((previous) => !previous)}
        >
          <ListIcon />
        </IconButton>

        <NavbarTitle
          meta={[
            {
              icon: <TicketIcon size={NAVBAR_META_ICON_PX} />,
              label: HEADER_META.ticket,
            },
            {
              // A building rather than a person: the meta line names the
              // vendor, and a vendor is a company.
              icon: <BuildingsIcon size={NAVBAR_META_ICON_PX} />,
              label: HEADER_META.vendor,
            },
            {
              icon: <CalendarBlankIcon size={NAVBAR_META_ICON_PX} />,
              label: HEADER_META.date,
            },
          ]}
          sx={{ ml: 3 }}
        >
          ERP Posting
        </NavbarTitle>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" sx={{ gap: ACTION_GAP, flexShrink: 0 }}>
          <Button variant="error" appearance="contained" size="sm">
            Reject
          </Button>
          <Button
            variant="secondary"
            appearance="outline"
            size="sm"
            loading={checking}
            onClick={runSimulate}
          >
            Simulate
          </Button>
          {/* Disabled until a clean pass. The label never changes and the
              button never moves — the only thing the check alters is whether
              it answers. */}
          <Tooltip
            title={
              posted
                ? 'Already posted'
                : !checked
                  ? 'Run Simulate first'
                  : blocked
                    ? 'Clear the errors below first'
                    : ''
            }
          >
            <Button
              size="sm"
              endIcon={<ArrowRightIcon size={NAVBAR_META_ICON_PX} />}
              disabled={!checked || blocked || posted}
              loading={posting}
              onClick={runPost}
            >
              Proceed
            </Button>
          </Tooltip>
        </Stack>
      </Navbar>

      <Box
        ref={setBelowBar}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* The workflow strip: sections of this record, not destinations in
            the app. No brand block and no user footer — the header above owns
            the top of the screen, and the account menu belongs to the main
            menu the hamburger brings back. */}
        <AppRail
          collapsed
          showBrand={false}
          showUser={false}
          nav={WORKFLOW_NAV}
          secondaryNav={WORKFLOW_SECONDARY_NAV}
        />

        <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {/* Findings sit above the form rather than beside the button that
              produced them: they are about the record, and two of the three
              name a specific line further down the page. */}
          {(findings.length > 0 || posted) && (
            <Stack
              sx={{
                gap: 1,
                px: 3,
                pt: 2,
                flexShrink: 0,
              }}
            >
              {posted && (
                <Alert severity="success" floating>
                  Posted to the ERP as document 5100004821.
                </Alert>
              )}
              {/* No `icon` override. `Alert` draws one glyph for all four
                  severities on purpose — the resynced sheet (973:3010) puts
                  the same filled diamond in every state and changes only the
                  colour — so passing a per-severity glyph here would undo
                  the component's own decision. */}
              {findings.map((finding) => (
                <Alert
                  key={finding.id}
                  severity={finding.severity === 'error' ? 'error' : 'info'}
                  floating
                >
                  {finding.message}
                </Alert>
              ))}
            </Stack>
          )}

          <Box sx={{ px: 3, py: 2.5, flexShrink: 0 }}>
            <Grid container spacing={2.5}>
              {HEADER_FIELDS.map((field) => (
                <Grid key={field.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <TextField
                    label={field.label}
                    required={field.required}
                    disabled={field.origin === 'carried'}
                    value={values[field.key] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [field.key]: event.target.value,
                      }))
                    }
                    fullWidth
                  />
                </Grid>
              ))}
              {/* Derived, so it is the one field with no entry in the record:
                  a variance you could type into would be a number you had
                  agreed with rather than one the accounting agreed with. */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <TextField
                  label="Variance"
                  disabled
                  value={formatVariance(gap)}
                  fullWidth
                  status={checked && gap !== 0 ? 'error' : undefined}
                  helperText={
                    checked && gap !== 0
                      ? 'The lines do not add up to the invoice total'
                      : undefined
                  }
                />
              </Grid>
            </Grid>

            <Stack
              direction="row"
              sx={{ gap: 2, alignItems: 'flex-end', mt: 2 }}
            >
              <Stack sx={{ gap: 0.5 }}>
                {/* Inset to the same 8px a `TextField` label sits at, so this
                    block's label lines up with the ten above it. Position,
                    not restyling — the variant carries the type. */}
                <Typography
                  variant="caption"
                  sx={{ px: `${spacing.component.xs}px` }}
                >
                  Documents (1)
                </Typography>
                <UploadFiles />
              </Stack>
              <Chip
                size="sm"
                variant="secondary"
                icon={<FilePdfIcon />}
                label="Invoice-A.pdf"
              />
            </Stack>
          </Box>

          <Divider />

          {/* The grid is `height: 100%`, so it needs a parent with a definite
              height to be 100% of. `minHeight: 0` is what makes `flex: 1`
              mean "what is left" rather than "at least the rows". */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              size="sm"
              rows={lines as LineItem[]}
              columns={columns}
              rowNoun="line items"
              // The row the check rejected, tinted. The message above names
              // it; this is what makes "line 3" findable without counting.
              rowState={({ row }) =>
                findingByLine.has(row.id) ? 'error' : undefined
              }
              pageSizeOptions={[PAGE_SIZE, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: PAGE_SIZE } },
              }}
              disableColumnMenu
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>

        {/* The main menu, floated back in over a record that stays put. The
            way out of the workflow to everything else. */}
        <AppRail
          overlay
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onNavigate={() => setNavOpen(false)}
          defaultActive="dashboard"
          container={belowBar}
        />
      </Box>
    </Stack>
  );
}

ErpPostingPreview.displayName = 'ErpPostingPreview';
