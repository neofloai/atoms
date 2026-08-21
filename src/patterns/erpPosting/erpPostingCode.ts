/**
 * The ERP posting pattern, as a page a consumer can paste.
 *
 * Kept in its own file for the same reason `dashboardCode` and
 * `invoiceDashboardCode` are: it is one long string with short metadata
 * around it, and `get_pattern` promises "the full page layout code" rather
 * than an excerpt.
 *
 * What is left to the reader is the record — the header fields, the line
 * items, the tax codes and the rail's items — because those are the
 * application. Everything that is layout, the split between the fields
 * carried in and the fields needed to post, and the rule that decides
 * whether `Proceed` answers, is here.
 *
 * The string carries no backticks and no interpolation on purpose: a bare
 * backtick in it would terminate the literal, and a `${` would be read as a
 * substitution rather than as code. The snippet concatenates with `+` for
 * the same reason.
 */
export const erpPostingCode = `'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  DataGrid,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  NAVBAR_META_ICON_PX,
  Navbar,
  NavbarTitle,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@neofloai/atoms';
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
} from '@neofloai/atoms/icons';
import { fontFamilies, spacing, text } from '@neofloai/atoms/tokens';

import type { GridColDef } from '@neofloai/atoms';

// The rail, the record and the tax codes are the application's. The rail is
// the same workflow strip the extraction and matching screens mount, so it is
// imported rather than redrawn — a second copy would drift from the screens
// either side of this one.
import {
  AppRail,
  WORKFLOW_NAV,
  WORKFLOW_SECONDARY_NAV,
} from './AppRail';
import {
  HEADER_FIELDS,
  HEADER_META,
  LINE_ITEMS,
  VAT_CODES,
  WHT_CODES,
  formatMoney,
  formatVariance,
  isBlocked,
  money,
  simulate,
  variance,
} from './postingRecord';

import type { Finding, LineItem, TaxCode } from './postingRecord';

/** Gap between the trailing actions, as the frame draws it (Scale/250). */
const ACTION_GAP = 1.5;

/** Lines a page holds, and the choices the footer offers. */
const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** How long the two round trips take. Your API decides this, not the screen. */
const SIMULATE_MS = 700;
const POST_MS = 900;

/* ---------------------------------------------------------------- cells */

/**
 * The line number. Mono, and quieter than the description beside it: it is
 * the line's position rather than one of its fields, and it exists so that a
 * finding can say "line 3" and be followed.
 */
function IndexCell({ value }: { value: number }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        fontFamily: fontFamilies.product.mono,
        fontSize: 12,
        color: text.default.placeholder.light,
        ...theme.applyStyles('dark', { color: text.default.placeholder.dark }),
      })}
    >
      {value}
    </Box>
  );
}

/**
 * A money cell: currency mark in caption ink, digits in mono, both pushed
 * right so the decimal points line up down the column. Lined-up decimals are
 * the only reason a reader can compare two figures without reading either.
 */
function AmountCell({ value }: { value: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '2px',
        width: '100%',
        lineHeight: 'normal',
      }}
    >
      <Box
        component="span"
        sx={(theme) => ({
          color: text.default.placeholder.light,
          ...theme.applyStyles('dark', {
            color: text.default.placeholder.dark,
          }),
        })}
      >
        $
      </Box>
      <Box component="span" sx={{ fontFamily: fontFamilies.product.mono }}>
        {value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Box>
    </Box>
  );
}

/**
 * A tax column's header: the label, its required mark, and a caret that sets
 * the code on every line at once.
 *
 * The mark is a plain asterisk. TextField draws its own in the label's ink,
 * and the frame draws both in text/error/4 — but recolouring it here would
 * make this screen's required fields look different from every other
 * screen's. The header matches what TextField does; closing the gap with the
 * frame is TextField's job, not this screen's.
 *
 * The frame draws a caret on these two headers and on none of the others,
 * which is what identifies it as a bulk control rather than a sort menu —
 * Description and Line Total are the sortable columns and they carry none. It
 * earns its place on a ten-line invoice, where every line usually takes the
 * same code and setting it row by row is ten decisions made the same way.
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
    <Box
      component="span"
      sx={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: 0 }}
    >
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
    </Box>
  );
}

/**
 * The one control on a line, and it changes with what the check found.
 *
 * Split is always available: a line covering two cost centres has to become
 * two lines before it can be posted, and that is a property of the accounting
 * rather than of anything being wrong. Fix value replaces it only on a line
 * whose arithmetic the simulate pass rejected — a repair offered on a line
 * with nothing to repair is a control that does nothing when pressed.
 */
function LineActions({
  finding,
  onFix,
  onSplit,
}: {
  finding?: Finding;
  onFix: () => void;
  onSplit: () => void;
}) {
  if (finding && finding.fix !== undefined) {
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
        onClick={onSplit}
      >
        <ScissorsIcon size={16} />
      </IconButton>
    </Tooltip>
  );
}

/**
 * The upload control: the button, and a caret for the other ways a document
 * can arrive.
 *
 * The frame draws these as one split control behind a dashed edge, the border
 * doing double duty as a drop target. Atoms has no dashed appearance and no
 * split button, and faking either means overriding Button's radius and
 * Divider's border style — so this is two stock controls side by side. A
 * dashed drop zone is a Button appearance to add, not a thing to hand-roll
 * per screen.
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
        <MenuItem onClick={() => setAnchorEl(null)}>
          Upload from device
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          Attach from vendor portal
        </MenuItem>
      </Menu>
    </>
  );
}

/* ----------------------------------------------------------------- page */

export default function ErpPostingPage() {
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

  // One timer at a time: Simulate and Proceed cannot both be in flight,
  // because the second is disabled until the first has come back.
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  React.useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * The findings are derived, not stored. Fixing a line has to clear the
   * finding that named it in the same render — a stored list goes stale the
   * moment the record changes under it, and a stale "line 3 is wrong" beside
   * a corrected line 3 is worse than no check at all.
   */
  const findings = checked ? simulate(lines) : [];
  const blocked = isBlocked(findings);
  const gap = variance(lines);

  const findingByLine = new Map<number, Finding>();
  for (const finding of findings) {
    if (finding.lineId !== undefined) {
      findingByLine.set(finding.lineId, finding);
    }
  }

  function runSimulate() {
    // Your accounting check, then the ERP's own dry run. Both answers come
    // back as one list of findings; severity is what decides whether the
    // post is blocked.
    setChecking(true);
    setPosted(false);
    timer.current = setTimeout(() => {
      setChecking(false);
      setChecked(true);
    }, SIMULATE_MS);
  }

  function runPost() {
    // Your ERP call. Nothing here can reach it until a simulate pass came
    // back clean, which is the point of the gate.
    setPosting(true);
    timer.current = setTimeout(() => {
      setPosting(false);
      setPosted(true);
    }, POST_MS);
  }

  function setLineCode(
    id: number,
    field: 'vatCode' | 'whtCode',
    code: string
  ) {
    setLines((previous) =>
      previous.map((line) =>
        line.id === id ? { ...line, [field]: code } : line
      )
    );
  }

  function applyToAll(field: 'vatCode' | 'whtCode', code: string) {
    setLines((previous) =>
      previous.map((line) => ({ ...line, [field]: code }))
    );
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
      renderCell: ({ row }) => <IndexCell value={row.id} />,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1.6,
      minWidth: 180,
    },
    {
      field: 'lineTotal',
      headerName: 'Line Total',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => <AmountCell value={row.lineTotal} />,
    },
    {
      field: 'vatCode',
      headerName: 'VAT Tax Code',
      width: 200,
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
      width: 200,
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
      // No header. The column holds one control per row and the control says
      // what it does; a heading over it would name the column after whichever
      // of the two states happened to be more common.
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
          onSplit={() => {
            // Your split flow. One line becomes two, and both keep the
            // parent's tax codes until someone changes them.
          }}
        />
      ),
    },
  ];

  /* A page header, not an app bar: it spans the whole width and names the
     record, so the hamburger at its leading edge reads as "the navigation"
     rather than as the strip below it. */
  return (
    <Stack sx={{ height: '100vh', overflow: 'hidden' }}>
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

      {/* position: relative is what the overlay's absolute anchors to, so the
          main menu and its backdrop stop at the bar rather than running up
          over it. */}
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
              produced them: they are about the record, and the ones that name
              a line name one further down the page. */}
          {(findings.length > 0 || posted) && (
            <Stack sx={{ gap: 1, px: 3, pt: 2, flexShrink: 0 }}>
              {posted && (
                <Alert severity="success" floating>
                  Posted to the ERP as document 5100004821.
                </Alert>
              )}
              {/* No icon override. Alert draws one glyph for all four
                  severities on purpose — the resynced sheet puts the same
                  filled diamond in every state and changes only the colour —
                  so a per-severity glyph here would undo the component's own
                  decision. */}
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
            {/* Eleven boxes, four across. Two kinds of field: the ones
                extraction and matching established, which are read-only here,
                and the ones the ERP needs that no earlier stage supplies. An
                editable amount would mean the invoice could change after it
                was matched; a locked posting field would mean the post could
                never be completed. */}
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
              {/* Derived, so it is the one field with no entry in the record.
                  A variance you could type into would be a number you had
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
                {/* Inset to the same 8px a TextField label sits at, so this
                    block's label lines up with the ten above it. Position,
                    not restyling — the variant carries the type. */}
                <Typography
                  variant="caption"
                  sx={{ px: spacing.component.xs + 'px' }}
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

          {/* The grid is height: 100%, so it needs a parent with a definite
              height to be 100% of. minHeight: 0 is what makes flex: 1 mean
              "what is left" rather than "at least the rows", which would push
              the footer past the bottom edge. */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid
              size="sm"
              rows={lines as LineItem[]}
              columns={columns}
              rowNoun="line items"
              // The line the check rejected, tinted. The message above names
              // it; this is what makes "line 3" findable without counting.
              rowState={({ row }) =>
                findingByLine.has(row.id) ? 'error' : undefined
              }
              pageSizeOptions={PAGE_SIZE_OPTIONS}
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
`;
