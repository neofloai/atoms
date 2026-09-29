/**
 * Inspector chrome, painted from Atoms tokens. The panel always uses the
 * dark values so it reads the same over a light or a dark page; the
 * canvas marks use saturated ramp steps so they stand out from any UI.
 * All of it lives in a shadow root, so none of it reaches the page.
 */
import { border, colors, fontFamilies, radius, surface, text } from '../../../src/tokens';

export const mark = {
  select: colors.primary[500],
  hover: colors.primary[300],
  measure: colors.red[500],
  padding: colors.purple[300],
  margin: colors.orange[300],
  gap: colors.purple[400],
  onMark: colors.grey[25],
};

const ui = {
  page: surface.layers.page.dark,
  card: surface.layers.card1.dark,
  raised: surface.layers.card2.dark,
  line: border.layers.card1.dark,
  lineStrong: border.default.default.dark,
  heading: text.default.heading.dark,
  body: text.default.b1.dark,
  subtle: text.default.b3.dark,
  accent: surface.primary.default.dark,
  token: text.primary[2].dark,
  ok: text.success[2].dark,
  warn: text.warning[2].dark,
  off: text.error[2].dark,
};

const PANEL_WIDTH = 340;

export const css = /* css */ `
:host { all: initial; }
* { box-sizing: border-box; }

.layer { position: fixed; inset: 0; pointer-events: none; z-index: 2147483646; }
.box { position: fixed; pointer-events: none; }
.outline-hover { outline: 1px dashed ${mark.hover}; }
.outline-select { outline: 2px solid ${mark.select}; }
.band-padding { background: repeating-linear-gradient(135deg, ${mark.padding}66 0 1px, transparent 1px 6px); }
.band-margin { background: ${mark.margin}33; }
.band-gap { background: repeating-linear-gradient(135deg, ${mark.gap}88 0 1px, transparent 1px 6px); outline: 1px solid ${mark.gap}88; }
.line { position: fixed; background: ${mark.measure}; pointer-events: none; }
.guide { position: fixed; pointer-events: none; border: 0 dashed ${mark.measure}; }
.tag {
  position: fixed; pointer-events: none; white-space: nowrap;
  font: 500 11px/16px ${fontFamilies.product.sans}; color: ${mark.onMark};
  padding: 1px 6px; border-radius: ${radius.xs}px;
}
.tag-select { background: ${mark.select}; }
.tag-hover { background: ${mark.hover}; }
.tag-measure { background: ${mark.measure}; }
.tag-gap { background: ${mark.gap}; }
.tag-padding { background: ${mark.padding}; }

.panel {
  position: fixed; top: 0; bottom: 0; width: ${PANEL_WIDTH}px; z-index: 2147483647;
  display: flex; flex-direction: column; pointer-events: auto;
  background: ${ui.page}; color: ${ui.body}; border-left: 1px solid ${ui.line};
  font: 400 12px/16px ${fontFamilies.product.sans};
  -webkit-font-smoothing: antialiased;
}
.panel.left { left: 0; border-left: 0; border-right: 1px solid ${ui.line}; }
.panel.right { right: 0; }
.head { padding: 12px 12px 12px 16px; border-bottom: 1px solid ${ui.line}; }
.head-row { display: flex; align-items: center; gap: 4px; }
.head-row.mode { margin-top: 8px; gap: 8px; }
.head strong { color: ${ui.heading}; font-size: 13px; font-weight: 600; flex: 1; white-space: nowrap; }
.mode-label { color: ${ui.subtle}; font-size: 11px; flex: 1; }
.btn.icon { min-width: 24px; text-align: center; }
.btn {
  all: unset; cursor: pointer; color: ${ui.body}; padding: 4px 8px; border-radius: ${radius.xs}px;
  font: 500 11px/16px ${fontFamilies.product.sans};
}
.btn:hover { background: ${ui.raised}; color: ${ui.heading}; }
.btn.on { background: ${ui.raised}; color: ${ui.heading}; }
.seg { display: flex; background: ${ui.card}; border-radius: ${radius.sm}px; padding: 2px; }
.body { flex: 1; overflow: auto; }
.section { padding: 16px; border-bottom: 1px solid ${ui.line}; }
.section h3 {
  margin: 0 0 12px; color: ${ui.subtle}; font: 500 10px/12px ${fontFamilies.product.sans};
  text-transform: uppercase; letter-spacing: 0.06em;
}
.empty { padding: 24px 16px; color: ${ui.subtle}; line-height: 20px; display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.empty-title { color: ${ui.heading}; font-size: 13px; }
.keys { display: grid; grid-template-columns: max-content 1fr; gap: 8px 12px; align-items: baseline; color: ${ui.body}; line-height: 16px; }
.keys.compact { width: 100%; }
.keys kbd, .help kbd {
  font: 500 10px/14px ${fontFamilies.product.mono}; color: ${ui.heading}; white-space: nowrap;
  border: 1px solid ${ui.lineStrong}; border-radius: ${radius.xs}px; padding: 1px 6px; justify-self: start;
}
.legend { align-items: start; }
.help p { margin: 0 0 8px; color: ${ui.body}; line-height: 18px; }
.help p:last-child { margin-bottom: 0; }
.help strong { color: ${ui.heading}; font-weight: 600; }
.help code, .empty code { font-family: ${fontFamilies.product.mono}; color: ${ui.token}; font-size: 11px; }
.help .keys { margin-bottom: 8px; }
.help .keys:last-child { margin-bottom: 0; }
.note.sample { margin: 0; font-size: 11px; white-space: nowrap; }
.note.sample.warn { color: ${ui.warn}; }
.note.sample.off { color: ${ui.off}; }
.canvas-swatch { width: 28px; height: 14px; border-radius: 2px; margin-top: 1px; }
.canvas-swatch.select { outline: 2px solid ${mark.select}; outline-offset: -2px; }
.canvas-swatch.hover { outline: 1px dashed ${mark.hover}; outline-offset: -1px; }
.canvas-swatch.padding { background: repeating-linear-gradient(135deg, ${mark.padding} 0 1px, transparent 1px 4px); }
.canvas-swatch.gap { background: repeating-linear-gradient(135deg, ${mark.gap} 0 1px, transparent 1px 4px); outline: 1px solid ${mark.gap}; outline-offset: -1px; }
.canvas-swatch.measure { height: 2px; margin-top: 7px; background: ${mark.measure}; }
.empty kbd {
  font: 500 10px/14px ${fontFamilies.product.mono}; color: ${ui.body};
  border: 1px solid ${ui.lineStrong}; border-radius: ${radius.xs}px; padding: 0 4px;
}
.name { color: ${ui.heading}; font-size: 16px; line-height: 24px; font-weight: 600; }
.kind { color: ${ui.subtle}; margin-top: 2px; }
.kind .atoms { color: ${ui.token}; }
.crumbs { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
.crumb {
  all: unset; cursor: pointer; color: ${ui.body}; background: ${ui.card};
  padding: 2px 8px; border-radius: ${radius.full}px; font-size: 11px;
}
.crumb:hover { color: ${ui.heading}; background: ${ui.raised}; }
.crumb.here { color: ${ui.heading}; outline: 1px solid ${ui.accent}; }
.crumb.primitive { color: ${ui.subtle}; }

.rows { display: grid; grid-template-columns: 96px 1fr; gap: 8px 12px; }
.rows .k { color: ${ui.subtle}; }
.rows .v { color: ${ui.heading}; word-break: break-word; }
.v .val { font-family: ${fontFamilies.product.mono}; color: ${ui.body}; }
.v .tok { font-family: ${fontFamilies.product.mono}; color: ${ui.token}; display: block; margin-top: 2px; }
.v .note { display: block; margin-top: 2px; font-size: 11px; }
.v .note.warn, .note.drift { color: ${ui.warn}; }
.v .note.off { color: ${ui.off}; }
.badge {
  display: inline-block; margin-left: 6px; padding: 0 6px; border-radius: ${radius.full}px;
  font: 500 10px/16px ${fontFamilies.product.sans}; vertical-align: 1px;
}
.badge.exact { color: ${ui.ok}; outline: 1px solid ${ui.ok}; }
.badge.drift { color: ${ui.warn}; outline: 1px solid ${ui.warn}; }
.v .tok.inline { display: inline; margin: 0; }
.region { margin-top: 8px; color: ${ui.heading}; font-family: ${fontFamilies.product.mono}; font-size: 11px; }
.region .k { color: ${ui.subtle}; font-family: ${fontFamilies.product.sans}; }
.state { margin-bottom: 12px; }
.state:last-child { margin-bottom: 0; }
.state-name {
  display: inline-block; margin-bottom: 8px; padding: 1px 8px; border-radius: ${radius.full}px;
  background: ${ui.card}; color: ${ui.heading}; font-size: 11px;
}
.drift-item {
  all: unset; cursor: pointer; display: block; padding: 8px; margin: 0 -8px; border-radius: ${radius.sm}px;
}
.drift-item:hover { background: ${ui.card}; }
.drift-name { display: block; color: ${ui.heading}; }
.drift-item .note { display: block; margin-top: 2px; font-size: 11px; font-family: ${fontFamilies.product.mono}; }
.v .swatch {
  display: inline-block; width: 10px; height: 10px; border-radius: 2px; vertical-align: -1px;
  margin-right: 6px; outline: 1px solid ${ui.lineStrong};
}
.prop-string { color: ${ui.ok}; }
.prop-other { color: ${ui.subtle}; }
.flag { margin-top: 8px; color: ${ui.warn}; font-size: 11px; }
.flag.first { margin: 0 0 12px; }
.version-warn { background: ${ui.card}; border-left: 3px solid ${ui.warn}; color: ${ui.body}; font-size: 11px; line-height: 16px; }
.version-title { color: ${ui.warn}; font-weight: 600; margin-bottom: 4px; }
.export .lede { margin: 0 0 16px; color: ${ui.body}; line-height: 18px; }
.export .field { margin-bottom: 12px; }
.export .field > label { display: block; margin-bottom: 6px; color: ${ui.subtle}; font-size: 11px; }
.export .seg.scope { display: flex; }
.export .seg.scope .btn { flex: 1; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn.disabled { opacity: 0.4; cursor: default; }
.export .hint { margin: 0 0 12px; color: ${ui.subtle}; font-size: 11px; line-height: 16px; }
.export .hint:last-child { margin: 12px 0 0; }
.name-row { display: flex; gap: 4px; align-items: center; }
.name-input {
  all: unset; flex: 1; min-width: 0; padding: 6px 8px; border-radius: ${radius.sm}px;
  background: ${ui.card}; color: ${ui.heading}; outline: 1px solid ${ui.lineStrong};
  font: 400 12px/16px ${fontFamilies.product.mono};
}
.name-input:focus { outline-color: ${ui.accent}; }
.summary { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 0 0 12px; color: ${ui.body}; font-size: 11px; }
.summary .warn { color: ${ui.warn}; }
.export .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.btn.action { background: ${ui.card}; text-align: center; padding: 6px 8px; }
.btn.action:hover { background: ${ui.raised}; }
.btn.action.wide { display: block; box-sizing: border-box; width: 100%; margin-top: 4px; }
.btn.primary {
  display: block; box-sizing: border-box; width: 100%; margin-top: 4px; padding: 8px; text-align: center;
  background: ${ui.accent}; color: ${text.default['heading on-color'].dark};
}
.btn.primary:hover { background: ${ui.accent}; color: ${text.default['heading on-color'].dark}; filter: brightness(1.1); }
.export .status { margin-top: 12px; color: ${ui.ok}; font-size: 11px; line-height: 16px; }
.export .status.error { color: ${ui.off}; }
.thumb { display: block; margin-top: 12px; max-width: 100%; max-height: 200px; border-radius: ${radius.sm}px; outline: 1px solid ${ui.line}; }

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
.content { display: inline-block; border: 1px dashed ${ui.lineStrong}; padding: 4px 10px; color: ${ui.heading}; border-radius: 2px; }

.tabs { display: flex; gap: 4px; margin-bottom: 12px; }
pre {
  margin: 0; padding: 12px; background: ${ui.card}; border-radius: ${radius.sm}px;
  font: 400 11px/18px ${fontFamilies.product.mono}; color: ${ui.body};
  white-space: pre-wrap; word-break: break-word;
}
pre .c { color: ${ui.subtle}; }
pre .c.off { color: ${ui.off}; }
.copy { margin-top: 8px; }
.foot { padding: 8px 16px; border-top: 1px solid ${ui.line}; color: ${ui.subtle}; font-size: 11px; display: flex; justify-content: space-between; }
`;
