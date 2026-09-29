/**
 * What the inspector shows for a selection, read off the canvas: the box
 * model, and every value the element renders matched to its Atoms token.
 * The canvas draws the same measurements over the design — padding and
 * margin bands, gaps, size, and red distance lines with Alt held.
 */
import * as React from 'react';
import { boxModel, styleOf, type BoxModel, type Sides } from '../inspector/measure';
import { rows, type Row } from '../inspector/rows';
import { lookupInset, type Match, type Mode } from '../inspector/tokens';
import { index, labelOf } from './model';
import { Button } from './ui';

import type { Handover } from '../shared/schema';

interface Props {
  el: Element | null;
  doc: Handover;
  mode: Mode;
  select(id: string): void;
  toast(message: string, error?: boolean): void;
}

interface Reading {
  box: BoxModel;
  rows: Row[];
  layout: string[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const BADGE: Partial<Record<Match['status'], string>> = { exact: '✓ exact', drift: '⚠ drift' };

function read(el: Element, mode: Mode): Reading {
  const s = styleOf(el);
  const flex = /flex/.test(s.display);
  const grid = /grid/.test(s.display);
  return {
    box: boxModel(el),
    // Studio renders a production build, so token names come from value lookups.
    rows: rows(el, mode, false),
    layout: [
      `display: ${s.display}`,
      flex ? `flex-direction: ${s.flexDirection}` : '',
      flex && s.flexWrap !== 'nowrap' ? `flex-wrap: ${s.flexWrap}` : '',
      grid ? `grid-template-columns: ${s.gridTemplateColumns}` : '',
      flex || grid ? `justify-content: ${s.justifyContent}` : '',
      flex || grid ? `align-items: ${s.alignItems}` : '',
      `width: ${s.width}`,
      `height: ${s.height}`,
    ].filter(Boolean),
  };
}

function BoxDiagram({ box }: { box: BoxModel }) {
  const none: Sides = { top: 0, right: 0, bottom: 0, left: 0 };
  const cell = (value: number, side: 't' | 'r' | 'b' | 'l', spacing: boolean, borderWidth: number) => {
    const v = r2(value);
    const match = spacing ? lookupInset(value, borderWidth) : null;
    const state = v === 0 ? 'zero' : match && match.status !== 'token' ? 'off' : '';
    return (
      <span className={`${side} ${state}`} title={match ? (match.tokens[0] ?? match.note ?? '') : undefined}>
        {v === 0 ? '–' : v}
      </span>
    );
  };
  const ring = (label: string, cls: string, s: Sides, inner: React.ReactNode, spacing = true, borders = none) => (
    <div className={`bm ${cls}`}>
      <span className="lbl">{label}</span>
      {cell(s.top, 't', spacing, borders.top)}
      {cell(s.right, 'r', spacing, borders.right)}
      {cell(s.bottom, 'b', spacing, borders.bottom)}
      {cell(s.left, 'l', spacing, borders.left)}
      {inner}
    </div>
  );
  return (
    <div className="boxmodel">
      {ring(
        'Margin',
        'margin',
        box.margin,
        ring('Border', 'border', box.borderWidth, ring('Padding', 'padding', box.padding, <span className="content">{r2(box.width)} × {r2(box.height)}</span>, true, box.borderWidth), false),
      )}
    </div>
  );
}

function Value({ row }: { row: Row }) {
  const { match, swatch } = row;
  return (
    <div className="v">
      {swatch ? <span className="swatch" style={{ background: swatch, verticalAlign: 'middle', marginRight: 6 }} /> : null}
      <span className="val">{match.value}</span>
      {BADGE[match.status] ? <span className={`badge ${match.status === 'exact' ? 'ok' : 'warn'}`} style={{ marginLeft: 6 }}>{BADGE[match.status]}</span> : null}
      {match.tokens.map((t) => (
        <span key={t} className="tok">{t}</span>
      ))}
      {match.note ? <span className={`note ${match.status}`}>{match.note}</span> : null}
    </div>
  );
}

export function Inspect({ el, doc, mode, select, toast }: Props) {
  const [reading, setReading] = React.useState<Reading | null>(null);
  const [tab, setTab] = React.useState<'tokens' | 'css'>('tokens');

  // Read after the canvas has rendered the latest edit, and again whenever the element resizes.
  React.useEffect(() => {
    if (!el) return;
    const measure = () => {
      if (el.isConnected) setReading(read(el, mode));
    };
    const t = setTimeout(measure, 60);
    const observer = new (el.ownerDocument.defaultView ?? window).ResizeObserver(measure);
    observer.observe(el);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, [el, doc, mode]);

  if (!el) {
    return (
      <div className="section">
        <p className="muted" style={{ marginTop: 0 }}>Select something on the canvas to measure it.</p>
        <Legend />
      </div>
    );
  }

  const marked = el.closest('[data-studio-id]');
  const id = marked?.getAttribute('data-studio-id') ?? null;
  const node = id ? index(doc.tree).get(id)?.node : undefined;
  const owner = node ? labelOf(node) : '';
  const deep = marked !== el;
  const css = reading ? [...reading.layout, ...reading.rows.map((r) => r.css)].map((line) => `${line};`).join('\n') : '';

  return (
    <div>
      <div className="section">
        <div className="node-name">{deep ? `<${el.tagName.toLowerCase()}>` : owner || `<${el.tagName.toLowerCase()}>`}</div>
        <div className="node-kind">
          {deep ? (
            <>
              Inside{' '}
              <button className="crumb" onClick={() => id && select(id)}>
                {owner}
              </button>{' '}
              — the component draws it; change it through {owner}’s props.
            </>
          ) : (
            'Measured on the canvas at this width and mode.'
          )}
        </div>
      </div>
      {reading ? (
        <>
          <div className="section">
            <h3>Layer properties</h3>
            <BoxDiagram box={reading.box} />
          </div>
          <div className="section">
            <div className="seg" style={{ marginBottom: 12 }}>
              <Button className={tab === 'tokens' ? 'on' : ''} onClick={() => setTab('tokens')}>Tokens</Button>
              <Button className={tab === 'css' ? 'on' : ''} onClick={() => setTab('css')}>CSS</Button>
            </div>
            {tab === 'tokens' ? (
              reading.rows.length ? (
                <div className="inspect-rows">
                  {reading.rows.map((row, i) => (
                    <React.Fragment key={`${row.label}${i}`}>
                      <div className="k">{row.label}</div>
                      <Value row={row} />
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0 }}>Nothing styled on this element itself.</p>
              )
            ) : (
              <>
                <pre className="css-block">{css}</pre>
                <Button
                  className="solid"
                  style={{ marginTop: 8 }}
                  onClick={() =>
                    void navigator.clipboard.writeText(css).then(
                      () => toast('Copied the CSS.'),
                      (error: unknown) => toast(`Copy failed: ${error instanceof Error ? error.message : String(error)}`, true),
                    )
                  }
                >
                  Copy CSS
                </Button>
              </>
            )}
          </div>
        </>
      ) : null}
      <div className="section">
        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <>
      <h3>On the canvas</h3>
      <div className="keys">
        <kbd>Click</kbd>
        <span>select a node and see its padding, margin, gaps and size</span>
        <kbd>⌘ + click</kbd>
        <span>measure the exact element inside a component</span>
        <kbd>Alt + hover</kbd>
        <span>distance from the selection to what is under the pointer, with its spacing token</span>
      </div>
      <div className="legend">
        <span className="lg lg-padding" />
        <span>padding</span>
        <span className="lg lg-margin" />
        <span>margin</span>
        <span className="lg lg-gap" />
        <span>gap</span>
        <span className="lg lg-measure" />
        <span>distance</span>
      </div>
    </>
  );
}
