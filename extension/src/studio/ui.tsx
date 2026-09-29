/**
 * Studio's own controls, drawn from Atoms tokens in their dark values —
 * the chrome stays dark like the inspector so the canvas reads the same
 * in either mode.
 */
import * as React from 'react';
import { border, fontFamilies, radius, surface, text } from '../../../src/tokens';
import { mark } from '../inspector/styles';
import { colorOptions, type ColorOption, type ScaleOption, type TypeOption } from './tokens';

import type { ColorTokenCategory } from '../../../src/tokens/paths';

export const ui = {
  page: surface.layers.page.dark,
  card: surface.layers.card1.dark,
  raised: surface.layers.card2.dark,
  line: border.layers.card1.dark,
  lineStrong: border.default.default.dark,
  heading: text.default.heading.dark,
  body: text.default.b1.dark,
  subtle: text.default.b3.dark,
  accent: surface.primary.default.dark,
  onAccent: text.default['heading on-color'].dark,
  token: text.primary[2].dark,
  ok: text.success[2].dark,
  warn: text.warning[2].dark,
  off: text.error[2].dark,
};

export const css = /* css */ `
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body { background: ${ui.page}; color: ${ui.body}; font: 400 12px/16px ${fontFamilies.product.sans}; -webkit-font-smoothing: antialiased; }
button, input, select, textarea { font: inherit; color: inherit; }
a { color: ${ui.token}; }
.btn { all: unset; box-sizing: border-box; cursor: pointer; padding: 5px 10px; border-radius: ${radius.xs}px; font-weight: 500; font-size: 12px; line-height: 16px; color: ${ui.body}; white-space: nowrap; }
.btn:hover { background: ${ui.raised}; color: ${ui.heading}; }
.btn.on { background: ${ui.raised}; color: ${ui.heading}; }
.btn.solid { background: ${ui.card}; }
.btn.solid:hover { background: ${ui.raised}; }
.btn.primary { background: ${ui.accent}; color: ${ui.onAccent}; }
.btn.primary:hover { filter: brightness(1.1); background: ${ui.accent}; color: ${ui.onAccent}; }
.btn.danger:hover { color: ${ui.off}; }
.btn.icon { padding: 5px 7px; }
.btn[disabled], .btn.disabled { opacity: 0.4; pointer-events: none; }
.seg { display: inline-flex; background: ${ui.card}; border-radius: ${radius.sm}px; padding: 2px; gap: 2px; }
.input, .select, .textarea {
  all: unset; box-sizing: border-box; width: 100%; padding: 6px 8px; border-radius: ${radius.xs}px;
  background: ${ui.card}; color: ${ui.heading}; outline: 1px solid ${ui.line}; font-size: 12px; line-height: 16px;
}
.input:focus, .select:focus, .textarea:focus { outline-color: ${ui.accent}; }
.select { appearance: auto; cursor: pointer; }
.textarea { white-space: pre-wrap; min-height: 56px; resize: vertical; font-family: inherit; }
.textarea.mono, .input.mono { font-family: ${fontFamilies.product.mono}; font-size: 11px; }
.muted { color: ${ui.subtle}; }
.warn { color: ${ui.warn}; }
.ok { color: ${ui.ok}; }
.off { color: ${ui.off}; }
.mono { font-family: ${fontFamilies.product.mono}; }
h1 { margin: 0; color: ${ui.heading}; font-size: 20px; line-height: 28px; font-weight: 600; }
h2 { margin: 0; color: ${ui.heading}; font-size: 14px; line-height: 20px; font-weight: 600; }
h3 { margin: 0 0 10px; color: ${ui.subtle}; font: 500 10px/12px ${fontFamilies.product.sans}; text-transform: uppercase; letter-spacing: 0.06em; }

/* ---------- editor layout */
.editor { display: grid; grid-template-rows: 48px 1fr; height: 100vh; }
.topbar { display: flex; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid ${ui.line}; min-width: 0; }
.topbar .title { all: unset; color: ${ui.heading}; font-weight: 600; font-size: 13px; min-width: 60px; max-width: 360px; field-sizing: content; padding: 4px 6px; border-radius: ${radius.xs}px; }
.topbar .title:hover, .topbar .title:focus { background: ${ui.card}; }
.topbar .spacer { flex: 1; }
.topbar .sep { width: 1px; height: 20px; background: ${ui.line}; }
.status { color: ${ui.subtle}; font-size: 11px; min-width: 56px; }
.workspace { display: grid; grid-template-columns: 260px 1fr 320px; min-height: 0; }
.side { border-right: 1px solid ${ui.line}; display: flex; flex-direction: column; min-height: 0; }
.side.right { border-right: 0; border-left: 1px solid ${ui.line}; }
.tabs { display: flex; gap: 2px; padding: 8px; border-bottom: 1px solid ${ui.line}; }
.pane { flex: 1; overflow: auto; }
.section { padding: 14px 14px; border-bottom: 1px solid ${ui.line}; }
.stage { position: relative; overflow: hidden; background: ${surface.layers.card3?.dark ?? ui.card}; min-height: 0; touch-action: none; }
.stage-inner { position: absolute; left: 0; top: 0; padding: 32px; will-change: transform; }
.stage.panning { cursor: grab; }
.stage.panning.grabbing { cursor: grabbing; }
.stage.panning .canvas-iframe { pointer-events: none; }
.seg.zoom { align-items: center; }
.seg.zoom .select { all: unset; box-sizing: border-box; appearance: auto; cursor: pointer; padding: 3px 4px; min-width: 84px; font-size: 12px; color: ${ui.heading}; text-align: center; }
.canvas-frame { position: relative; box-shadow: 0 0 0 1px ${ui.line}, 0 12px 40px rgba(0,0,0,0.35); background: #fff; }
.canvas-scale { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.canvas-iframe { border: 0; display: block; background: transparent; }
.canvas-overlay { position: absolute; inset: 0; pointer-events: none; }
.ov-drop, .ov-note, .compare-image { position: absolute; }
.ov-drop { background: ${ui.accent}; box-shadow: 0 0 0 1px ${ui.onAccent}; }
/* The inspector's canvas marks, drawn over the zoomed canvas at their own size. */
.measure-layer { position: absolute; inset: 0; pointer-events: none; }
.measure-layer .layer { position: absolute; inset: 0; }
.measure-layer .box, .measure-layer .line, .measure-layer .guide, .measure-layer .tag { position: absolute; pointer-events: none; }
.measure-layer .outline-hover { outline: 1px dashed ${mark.hover}; }
.measure-layer .outline-select { outline: 2px solid ${mark.select}; }
.measure-layer .band-padding { background: repeating-linear-gradient(135deg, ${mark.padding}66 0 1px, transparent 1px 6px); }
.measure-layer .band-margin { background: ${mark.margin}33; }
.measure-layer .band-gap { background: repeating-linear-gradient(135deg, ${mark.gap}88 0 1px, transparent 1px 6px); outline: 1px solid ${mark.gap}88; }
.measure-layer .line { background: ${mark.measure}; }
.measure-layer .guide { border: 0 dashed ${mark.measure}; }
.measure-layer .tag { white-space: nowrap; font: 500 11px/16px ${fontFamilies.product.sans}; color: ${mark.onMark}; padding: 1px 6px; border-radius: ${radius.xs}px; }
.measure-layer .tag-select { background: ${mark.select}; }
.measure-layer .tag-hover { background: ${mark.hover}; }
.measure-layer .tag-measure { background: ${mark.measure}; }
.measure-layer .tag-gap { background: ${mark.gap}; }
.measure-layer .tag-padding { background: ${mark.padding}; }
/* Resize handles on the selection, outside the zoom like the marks. */
.resize-layer { position: absolute; pointer-events: none; }
.resize-handle { position: absolute; pointer-events: auto; background: #fff; border: 1.5px solid ${mark.select}; border-radius: 2px; box-sizing: border-box; }
.resize-handle.rh-x { right: -4px; top: 50%; width: 8px; height: 16px; margin-top: -8px; cursor: ew-resize; }
.resize-handle.rh-y { bottom: -4px; left: 50%; width: 16px; height: 8px; margin-left: -8px; cursor: ns-resize; }
.resize-handle.rh-xy { right: -5px; bottom: -5px; width: 10px; height: 10px; cursor: nwse-resize; }
.stage.panning .resize-handle { pointer-events: none; }
.ov-note { width: 16px; height: 16px; border-radius: 8px; background: ${ui.warn}; color: #1a1a1a; font: 600 10px/16px ${fontFamilies.product.sans}; text-align: center; }
.side-by-side { display: flex; gap: 24px; align-items: flex-start; }
.side-by-side .shot { box-shadow: 0 0 0 1px ${ui.line}; display: block; }
.label-above { color: ${ui.subtle}; font-size: 11px; margin-bottom: 6px; }

/* ---------- layers */
.tree { padding: 6px 0; }
.tree-row { display: flex; align-items: center; gap: 4px; height: 24px; padding-right: 8px; cursor: pointer; color: ${ui.body}; white-space: nowrap; }
.tree-row:hover { background: ${ui.card}; }
.tree-row.sel { background: ${ui.raised}; color: ${ui.heading}; }
.tree-row.drop-in { outline: 1px solid ${ui.accent}; outline-offset: -1px; }
.tree-row.drop-before { box-shadow: inset 0 2px 0 ${ui.accent}; }
.tree-row.drop-after { box-shadow: inset 0 -2px 0 ${ui.accent}; }
.tree-row .caret { width: 14px; text-align: center; color: ${ui.subtle}; flex-shrink: 0; }
.tree-row .kind { width: 16px; text-align: center; font-size: 10px; color: ${ui.subtle}; flex-shrink: 0; }
.tree-row .kind.component { color: ${ui.token}; }
.tree-row .name { overflow: hidden; text-overflow: ellipsis; }
.tree-row .tag { margin-left: 4px; padding: 0 5px; border-radius: 8px; background: ${ui.card}; color: ${ui.subtle}; font-size: 10px; }
.tree-row .dot { width: 6px; height: 6px; border-radius: 3px; margin-left: auto; flex-shrink: 0; }
.tree-row .dot.dot-dev { background: ${ui.warn}; }
.tree-row .dot.dot-note { background: ${ui.token}; }

/* ---------- property panel */
.crumbs { display: flex; flex-wrap: wrap; gap: 2px; margin-bottom: 10px; }
.crumb { all: unset; cursor: pointer; font-size: 11px; color: ${ui.subtle}; padding: 1px 6px; border-radius: 8px; background: ${ui.card}; }
.crumb:hover { color: ${ui.heading}; }
.node-name { color: ${ui.heading}; font-size: 15px; line-height: 22px; font-weight: 600; }
.node-kind { color: ${ui.subtle}; margin: 2px 0 10px; }
.actions { display: flex; flex-wrap: wrap; gap: 4px; }
.row { display: grid; grid-template-columns: 96px 1fr auto; gap: 8px; align-items: center; margin-bottom: 6px; }
.row > label { color: ${ui.subtle}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row .reset { all: unset; cursor: pointer; color: ${ui.subtle}; width: 16px; text-align: center; }
.row .reset:hover { color: ${ui.heading}; }
.row.wide { grid-template-columns: 1fr; }
.toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.hint { color: ${ui.subtle}; font-size: 11px; line-height: 16px; margin: 6px 0 0; }
.badge { display: inline-block; padding: 0 6px; border-radius: 8px; font-size: 10px; line-height: 16px; }
.badge.warn { color: ${ui.warn}; outline: 1px solid ${ui.warn}; }
.badge.ok { color: ${ui.ok}; outline: 1px solid ${ui.ok}; }
.badge.token { color: ${ui.token}; outline: 1px solid ${ui.token}; }

/* ---------- token picker */
.picker { position: relative; }
.picker-button { all: unset; box-sizing: border-box; width: 100%; display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 5px 8px; border-radius: ${radius.xs}px; background: ${ui.card}; outline: 1px solid ${ui.line}; min-height: 28px; }
.picker-button:hover { outline-color: ${ui.lineStrong}; }
.picker-button .val { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${fontFamilies.product.mono}; font-size: 11px; color: ${ui.heading}; }
.picker-button .val.off { color: ${ui.off}; }
.picker-pop { position: absolute; z-index: 50; right: 0; top: calc(100% + 4px); width: 280px; max-height: 360px; display: flex; flex-direction: column; background: ${ui.raised}; border-radius: ${radius.sm}px; box-shadow: 0 0 0 1px ${ui.lineStrong}, 0 12px 32px rgba(0,0,0,0.5); }
.picker-pop .input { margin: 8px; width: auto; }
.picker-list { overflow: auto; padding: 0 4px 6px; }
.picker-group { color: ${ui.subtle}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; padding: 8px 6px 4px; }
.picker-item { all: unset; box-sizing: border-box; width: 100%; display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: ${radius.xs}px; cursor: pointer; }
.picker-item:hover, .picker-item.on { background: ${ui.card}; }
.picker-item .p { font-family: ${fontFamilies.product.mono}; font-size: 11px; color: ${ui.heading}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.swatch { width: 14px; height: 14px; border-radius: 3px; flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15); overflow: hidden; display: inline-flex; }
.swatch > i { flex: 1; }

/* ---------- palette */
.palette { padding: 8px; }
.palette-group { margin-bottom: 12px; }
.palette-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.palette-item { all: unset; cursor: grab; padding: 6px 8px; border-radius: ${radius.xs}px; background: ${ui.card}; color: ${ui.heading}; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.palette-item:hover { background: ${ui.raised}; }
.style-group { margin-bottom: 10px; }
.icon-prop { display: flex; flex-direction: column; gap: 4px; }
.icon-prop-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; }
.icon-cell { all: unset; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 34px; border-radius: ${radius.xs}px; color: ${ui.heading}; }
.icon-cell:hover { background: ${ui.card}; }

/* ---------- deviations */
.dev { padding: 10px 14px; border-bottom: 1px solid ${ui.line}; }
.dev.done { opacity: 0.55; }
.dev-head { display: flex; gap: 6px; align-items: baseline; }
.dev-kind { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: ${ui.warn}; }
.dev-prop { font-family: ${fontFamilies.product.mono}; font-size: 11px; color: ${ui.heading}; word-break: break-word; }
.dev-note { color: ${ui.subtle}; font-size: 11px; margin: 4px 0 6px; line-height: 16px; }

/* ---------- home */
.home { max-width: 1120px; margin: 0 auto; padding: 32px 24px 64px; }
.home-head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.home-lede { color: ${ui.subtle}; margin: 0 0 24px; max-width: 640px; line-height: 18px; }
.project { margin-bottom: 32px; }
.project-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.project-name { all: unset; color: ${ui.heading}; font-size: 14px; font-weight: 600; padding: 2px 6px; border-radius: ${radius.xs}px; }
.project-name:hover, .project-name:focus { background: ${ui.card}; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.card { background: ${ui.card}; border-radius: ${radius.md}px; overflow: hidden; cursor: pointer; box-shadow: 0 0 0 1px ${ui.line}; display: flex; flex-direction: column; }
.card:hover { box-shadow: 0 0 0 1px ${ui.lineStrong}; }
.card .thumb { height: 140px; background: ${ui.raised} center top / cover no-repeat; }
.card .meta { padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
.card .meta strong { color: ${ui.heading}; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card .card-actions { display: flex; gap: 2px; padding: 0 8px 8px; }
.empty { padding: 48px 24px; text-align: center; color: ${ui.subtle}; border: 1px dashed ${ui.lineStrong}; border-radius: ${radius.md}px; line-height: 20px; }
.drop-zone { outline: 2px dashed ${ui.accent}; outline-offset: 6px; border-radius: ${radius.md}px; }
.toast { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); background: ${ui.raised}; color: ${ui.heading}; padding: 8px 14px; border-radius: ${radius.sm}px; box-shadow: 0 0 0 1px ${ui.lineStrong}, 0 8px 24px rgba(0,0,0,0.4); z-index: 100; }
.toast.error { color: ${ui.off}; }
kbd { font: 500 10px/14px ${fontFamilies.product.mono}; border: 1px solid ${ui.lineStrong}; border-radius: ${radius.xs}px; padding: 0 4px; color: ${ui.heading}; justify-self: start; white-space: nowrap; }
.keys { display: grid; grid-template-columns: max-content 1fr; gap: 6px 10px; align-items: baseline; }

/* ---------- inspect */
.inspect-rows { display: grid; grid-template-columns: 88px 1fr; gap: 8px 12px; }
.inspect-rows .k { color: ${ui.subtle}; }
.inspect-rows .v { color: ${ui.heading}; word-break: break-word; }
.v .val { font-family: ${fontFamilies.product.mono}; color: ${ui.body}; }
.v .tok { font-family: ${fontFamilies.product.mono}; color: ${ui.token}; display: block; margin-top: 2px; }
.v .note { display: block; margin-top: 2px; font-size: 11px; color: ${ui.subtle}; }
.v .note.warn, .v .note.drift { color: ${ui.warn}; }
.v .note.off { color: ${ui.off}; }
.boxmodel { background: ${ui.card}; border-radius: ${radius.md}px; padding: 12px; font-family: ${fontFamilies.product.mono}; font-size: 11px; }
.bm { position: relative; border: 1px dashed ${ui.lineStrong}; border-radius: ${radius.sm}px; padding: 20px 28px; text-align: center; }
.bm > .lbl { position: absolute; top: 3px; left: 8px; color: ${ui.subtle}; font-family: ${fontFamilies.product.sans}; font-size: 10px; }
.bm.border { border-style: solid; }
.bm.padding { background: ${ui.raised}; border-color: ${mark.select}; }
.bm .t, .bm .b, .bm .l, .bm .r { position: absolute; color: ${ui.body}; }
.bm .t { top: 3px; left: 0; right: 0; }
.bm .b { bottom: 3px; left: 0; right: 0; }
.bm .l { left: 8px; top: 50%; transform: translateY(-50%); }
.bm .r { right: 8px; top: 50%; transform: translateY(-50%); }
.bm .off { color: ${ui.off}; }
.bm .zero { color: ${ui.subtle}; }
.bm .content { display: inline-block; border: 1px dashed ${ui.lineStrong}; padding: 4px 10px; color: ${ui.heading}; border-radius: 2px; }
.css-block { margin: 0; padding: 12px; background: ${ui.card}; border-radius: ${radius.sm}px; font: 400 11px/18px ${fontFamilies.product.mono}; color: ${ui.body}; white-space: pre-wrap; word-break: break-word; }
.legend { display: grid; grid-template-columns: 14px 1fr 14px 1fr; gap: 6px 8px; align-items: center; margin-top: 12px; color: ${ui.subtle}; }
.lg { width: 14px; height: 10px; border-radius: 2px; }
.lg-padding { background: repeating-linear-gradient(135deg, ${mark.padding} 0 1px, transparent 1px 4px); outline: 1px solid ${mark.padding}; outline-offset: -1px; }
.lg-margin { background: ${mark.margin}66; }
.lg-gap { background: repeating-linear-gradient(135deg, ${mark.gap} 0 1px, transparent 1px 4px); outline: 1px solid ${mark.gap}; outline-offset: -1px; }
.lg-measure { height: 2px; background: ${mark.measure}; }
`;

export function Button({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`btn ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Row({ label, title, children, onReset }: { label: string; title?: string; children: React.ReactNode; onReset?: () => void }) {
  return (
    <div className="row">
      <label title={title ?? label}>{label}</label>
      <div>{children}</div>
      {onReset ? (
        <button type="button" className="reset" title="Reset to the default" onClick={onReset}>
          ×
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}

/** A text field that commits on blur or Enter, so typing makes one undo step. */
export function CommitInput({ value, onCommit, multiline, placeholder, mono, autoFocus }: { value: string; onCommit(v: string): void; multiline?: boolean; placeholder?: string; mono?: boolean; autoFocus?: boolean }) {
  const [draft, setDraft] = React.useState(value);
  // A new value from outside (undo, another selection) replaces the draft.
  const [seen, setSeen] = React.useState(value);
  if (value !== seen) {
    setSeen(value);
    setDraft(value);
  }
  const commit = () => draft !== value && onCommit(draft);
  const common = {
    value: draft,
    placeholder,
    autoFocus,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        commit();
      }
      if (e.key === 'Escape') setDraft(value);
    },
  };
  return multiline ? <textarea className={`textarea${mono ? ' mono' : ''}`} {...common} /> : <input className={`input${mono ? ' mono' : ''}`} {...common} />;
}

// ---------------------------------------------------------------- token picker

export function Swatch({ light, dark }: { light: string; dark?: string }) {
  return (
    <span className="swatch" title={dark ? `light ${light} · dark ${dark}` : light}>
      <i style={{ background: light }} />
      {dark ? <i style={{ background: dark }} /> : null}
    </span>
  );
}

type PickerOption = { path: string; label: string; group: string; swatch?: { light: string; dark?: string } };

function usePopover() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return { open, setOpen, ref };
}

export function Picker({ value, display, off, options, onPick, placeholder = 'Pick a token' }: { value?: string; display?: string; off?: boolean; options: PickerOption[]; onPick(path: string): void; placeholder?: string }) {
  const { open, setOpen, ref } = usePopover();
  const [query, setQuery] = React.useState('');
  const current = options.find((o) => o.path === value);
  const shown = options.filter((o) => !query || o.path.toLowerCase().includes(query.toLowerCase()) || o.label.toLowerCase().includes(query.toLowerCase()));
  const groups = [...new Set(shown.map((o) => o.group))];
  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-button" onClick={() => setOpen(!open)} title={value ?? display ?? ''}>
        {current?.swatch ? <Swatch {...current.swatch} /> : null}
        <span className={`val${off ? ' off' : ''}`}>{value ?? display ?? placeholder}</span>
      </button>
      {open ? (
        <div className="picker-pop">
          <input className="input" autoFocus placeholder="Search tokens" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Escape') setOpen(false); if (e.key === 'Enter' && shown[0]) { onPick(shown[0].path); setOpen(false); } }} />
          <div className="picker-list">
            {groups.map((g) => (
              <React.Fragment key={g}>
                <div className="picker-group">{g}</div>
                {shown.filter((o) => o.group === g).map((o) => (
                  <button
                    type="button"
                    key={o.path}
                    className={`picker-item${o.path === value ? ' on' : ''}`}
                    onClick={() => {
                      onPick(o.path);
                      setOpen(false);
                    }}
                  >
                    {o.swatch ? <Swatch {...o.swatch} /> : null}
                    <span className="p">{o.label}</span>
                  </button>
                ))}
              </React.Fragment>
            ))}
            {!shown.length ? <div className="picker-group">No match</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function colorPickerOptions(categories: ColorTokenCategory[]): PickerOption[] {
  return colorOptions
    .filter((c: ColorOption) => categories.includes(c.category))
    .map((c) => ({ path: c.path, label: c.path, group: c.path.split(/[.[]/).slice(0, 2).join('.'), swatch: { light: c.token.light, dark: c.token.dark } }));
}

export function scalePickerOptions(options: ScaleOption[], group: (o: ScaleOption) => string = (o) => o.path.split('.').slice(0, -1).join('.')): PickerOption[] {
  return options.map((o) => ({ path: o.path, label: `${o.path.split('.').pop()} — ${o.label}`, group: group(o) }));
}

export function typePickerOptions(options: TypeOption[]): PickerOption[] {
  return options.map((o) => ({ path: o.path, label: `${o.path.replace('typography.', '')} · ${o.size}/${o.leading}`, group: o.path.split('.')[1] }));
}

export function Toast({ message, error, onDone }: { message: string; error?: boolean; onDone(): void }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return <div className={`toast${error ? ' error' : ''}`}>{message}</div>;
}
