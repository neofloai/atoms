import { Box } from '@/src/components/Box';
import { Button } from '@/src/components/Button';
import { Divider } from '@/src/components/Divider';
import { Menu } from '@/src/components/Menu';
import { CaretDownIcon } from '@/src/icons/glyphs';
import { radius } from '@/src/tokens';
import { useContext, useState, type ReactNode } from 'react';
import { ChatContext } from '../../react/context';
import { defaultLabels } from '../../react/labels';
import { PickerMenuRows, type RowChildren } from './PickerRows';

export interface ComposerPickerItem {
  /** Unique across the whole picker: `value` is a list of these. */
  id: string;
  label: ReactNode;
  /** A second, quieter line under the label. */
  description?: ReactNode;
  /** A 16px glyph before the label. */
  icon?: ReactNode;
  /** Quiet text on the right, such as a count. */
  trailing?: ReactNode;
  /** What a search matches, when `label` isn't plain text. Defaults to the label. */
  searchText?: string;
  disabled?: boolean;
  /** Left out of the menu. */
  hidden?: boolean;
  /**
   * Makes the item a folder that opens in place, to any depth: its children, or a function that
   * loads them the first time it opens. Ticking a folder stands for everything in it, so its own
   * id goes in `value` and its children's don't.
   */
  children?: RowChildren<ComposerPickerItem>;
}

export interface ComposerPickerGroup {
  id: string;
  /** Heading above the group's items. */
  label?: ReactNode;
  /**
   * Multiple selection only: the heading also selects or clears every item in the group, and says
   * which on its right ("Select all" / "Deselect all").
   */
  selectAll?: boolean;
  items: ComposerPickerItem[];
}

export interface ComposerPickerProps {
  /** What is being picked, e.g. "Tools". The trigger's accessible name and the default summary use it. */
  name: string;
  /** The choices, in groups. */
  groups?: ComposerPickerGroup[];
  /** Shorthand for one group without a heading. */
  items?: ComposerPickerItem[];
  /** The ids of the selected items. */
  value: readonly string[];
  onChange: (value: string[]) => void;
  /** Checkboxes that stay open (default), or a single choice that closes the menu. @default true */
  multiple?: boolean;
  /**
   * The trigger's text. Defaults to `labels.pickerSummary(name, selected, total)` ("All tools",
   * "Tools (2)", "No tools") for multiple selection, and to the chosen item's label for single.
   */
  triggerLabel?: ReactNode;
  /** The heading's action text. @default labels.pickerSelectAll / labels.pickerDeselectAll */
  selectAllLabel?: string;
  deselectAllLabel?: string;
  /**
   * Under a rule at the bottom of the menu, e.g. a "Manage…" `MenuItem` that opens your own dialog.
   * A function receives `close` so it can shut the menu first.
   */
  footer?: ReactNode | ((close: () => void) => ReactNode);
  disabled?: boolean;
  /** The choices are loading: the trigger is disabled and marked busy. */
  loading?: boolean;
  /** @default 260 */
  menuMinWidth?: number;
  /** How deep folders open. @default no limit */
  maxDepth?: number;
}

/**
 * A pill in the composer that opens a menu of choices: workflows, tools, models, data sources, or
 * anything else a turn can be about. Controlled, and it knows nothing about what the items mean.
 * Figma: Composer-scope (the pill) and SourcePicker (the menu).
 * The built-in workflow picker (`ScopePicker`) is one of these; put your own in `ChatComposer`'s
 * `leadingActions` or `extraActions`.
 */
export function ComposerPicker({
  name,
  groups,
  items,
  value,
  onChange,
  multiple = true,
  triggerLabel,
  selectAllLabel,
  deselectAllLabel,
  footer,
  disabled,
  loading,
  menuMinWidth = 260,
  maxDepth,
}: ComposerPickerProps) {
  // Works outside a ChatProvider too (a picker in your own toolbar), with the default strings.
  const labels = useContext(ChatContext)?.labels ?? defaultLabels;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  const sections: ComposerPickerGroup[] = groups ?? (items ? [{ id: '', items }] : []);
  const options = sections.flatMap((g) => g.items);
  const selected = new Set(value);
  const count = options.filter((o) => selected.has(o.id)).length;
  const summary =
    triggerLabel ??
    (multiple ? labels.pickerSummary(name, count, options.length) : (options.find((o) => selected.has(o.id))?.label ?? name));

  const children: ReactNode[] = [
    <PickerMenuRows
      key="rows"
      groups={sections}
      value={value}
      onChange={onChange}
      multiple={multiple}
      close={close}
      labels={labels}
      selectAllLabel={selectAllLabel}
      deselectAllLabel={deselectAllLabel}
      maxDepth={maxDepth}
    />,
  ];
  const footerContent = typeof footer === 'function' ? footer(close) : footer;
  if (footerContent) {
    children.push(<Divider key="footer-rule" sx={{ my: 0.5 }} />);
    children.push(<Box key="footer">{footerContent}</Box>);
  }

  return (
    <>
      <Button
        size="md"
        variant="secondary"
        appearance="outline"
        startIcon={<CaretDownIcon />}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-label={typeof summary === 'string' ? `${name}: ${summary}` : name}
        aria-busy={loading || undefined}
        disabled={disabled || loading || options.length === 0}
        onClick={(e) => setAnchor(e.currentTarget)}
        // Figma's Composer-scope pill is fully round.
        sx={{ flexShrink: 0, borderRadius: `${radius.full}px` }}
      >
        {summary}
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        variant="menu"
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ '& .MuiMenu-paper': { minWidth: menuMinWidth, maxHeight: 420, mt: -1 } }}
      >
        {children}
      </Menu>
    </>
  );
}
