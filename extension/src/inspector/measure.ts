/**
 * Geometry for the canvas: an element's box model, the distances between
 * two elements, and the gaps a flex or grid container leaves between its
 * children. All rects are viewport coordinates.
 */
export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BoxModel {
  border: Rect;
  margin: Sides;
  borderWidth: Sides;
  padding: Sides;
  width: number;
  height: number;
}

const n = (value: string) => parseFloat(value) || 0;

/** Computed style from the element's own window — Studio measures inside its canvas iframe. */
export const styleOf = (el: Element) => (el.ownerDocument.defaultView ?? window).getComputedStyle(el);

function sides(style: CSSStyleDeclaration, prefix: string, suffix = ''): Sides {
  return {
    top: n(style.getPropertyValue(`${prefix}-top${suffix}`)),
    right: n(style.getPropertyValue(`${prefix}-right${suffix}`)),
    bottom: n(style.getPropertyValue(`${prefix}-bottom${suffix}`)),
    left: n(style.getPropertyValue(`${prefix}-left${suffix}`)),
  };
}

export function toRect(r: DOMRect): Rect {
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

export function boxModel(el: Element): BoxModel {
  const style = styleOf(el);
  const border = toRect(el.getBoundingClientRect());
  return {
    border,
    margin: sides(style, 'margin'),
    borderWidth: sides(style, 'border', '-width'),
    padding: sides(style, 'padding'),
    width: border.right - border.left,
    height: border.bottom - border.top,
  };
}

export function inset(r: Rect, s: Sides): Rect {
  return { left: r.left + s.left, top: r.top + s.top, right: r.right - s.right, bottom: r.bottom - s.bottom };
}

export function outset(r: Rect, s: Sides): Rect {
  return { left: r.left - s.left, top: r.top - s.top, right: r.right + s.right, bottom: r.bottom + s.bottom };
}

// ---------------------------------------------------------------- distances

export interface Distance {
  /** The measured segment. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  value: number;
  /** Dashed guides from the segment's end to the box it measures to. */
  guides: [number, number, number, number][];
}

const contains = (outer: Rect, inner: Rect) =>
  inner.left >= outer.left - 0.5 &&
  inner.right <= outer.right + 0.5 &&
  inner.top >= outer.top - 0.5 &&
  inner.bottom <= outer.bottom + 0.5;

/**
 * Figma's Alt-hover: nested boxes get the four inner distances, separate
 * boxes get the gap on each axis they are apart on. Overlapping boxes
 * that are not nested get nothing — there is no single distance to read.
 */
export function distances(a: Rect, b: Rect): Distance[] {
  if (contains(b, a) || contains(a, b)) {
    const [inner, outer] = contains(b, a) ? [a, b] : [b, a];
    const cx = (inner.left + inner.right) / 2;
    const cy = (inner.top + inner.bottom) / 2;
    return [
      { x1: cx, y1: outer.top, x2: cx, y2: inner.top, value: inner.top - outer.top, guides: [] },
      { x1: inner.right, y1: cy, x2: outer.right, y2: cy, value: outer.right - inner.right, guides: [] },
      { x1: cx, y1: inner.bottom, x2: cx, y2: outer.bottom, value: outer.bottom - inner.bottom, guides: [] },
      { x1: outer.left, y1: cy, x2: inner.left, y2: cy, value: inner.left - outer.left, guides: [] },
    ].filter((d) => d.value > 0.5);
  }

  const out: Distance[] = [];
  const overlapY = Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
  const overlapX = Math.min(a.right, b.right) > Math.max(a.left, b.left);

  const [leftBox, rightBox] = a.right <= b.left ? [a, b] : b.right <= a.left ? [b, a] : [null, null];
  if (leftBox && rightBox) {
    const y = overlapY
      ? (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2
      : (a.top + a.bottom) / 2;
    const guides: Distance['guides'] = [];
    for (const box of [leftBox, rightBox]) {
      const x = box === leftBox ? box.right : box.left;
      if (y < box.top) guides.push([x, y, x, box.top]);
      if (y > box.bottom) guides.push([x, box.bottom, x, y]);
    }
    out.push({ x1: leftBox.right, y1: y, x2: rightBox.left, y2: y, value: rightBox.left - leftBox.right, guides });
  }

  const [topBox, bottomBox] = a.bottom <= b.top ? [a, b] : b.bottom <= a.top ? [b, a] : [null, null];
  if (topBox && bottomBox) {
    const x = overlapX
      ? (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2
      : (a.left + a.right) / 2;
    const guides: Distance['guides'] = [];
    for (const box of [topBox, bottomBox]) {
      const y = box === topBox ? box.bottom : box.top;
      if (x < box.left) guides.push([x, y, box.left, y]);
      if (x > box.right) guides.push([box.right, y, x, y]);
    }
    out.push({ x1: x, y1: topBox.bottom, x2: x, y2: bottomBox.top, value: bottomBox.top - topBox.bottom, guides });
  }
  return out;
}

// ---------------------------------------------------------------- gaps

export interface GapBand {
  rect: Rect;
  value: number;
  /** `justify-content: space-*` spreads the children; Figma calls that Auto. */
  auto: boolean;
}

/** The space between consecutive in-flow children of a flex or grid container. */
export function gapBands(el: Element): GapBand[] {
  const style = styleOf(el);
  if (!/flex|grid/.test(style.display)) return [];
  const spread = /space-(between|around|evenly)/.test(style.justifyContent);
  const column = style.display.includes('flex') && style.flexDirection.startsWith('column');
  const content = inset(inset(toRect(el.getBoundingClientRect()), sides(style, 'border', '-width')), sides(style, 'padding'));

  const children = [...el.children].filter((child) => {
    const s = styleOf(child);
    return s.display !== 'none' && s.position !== 'absolute' && s.position !== 'fixed';
  });
  const rects = children.map((child) => toRect(child.getBoundingClientRect())).filter((r) => r.right > r.left || r.bottom > r.top);

  const bands: GapBand[] = [];
  for (let i = 0; i + 1 < rects.length; i += 1) {
    const [p, q] = [rects[i], rects[i + 1]];
    const sameRow = Math.min(p.bottom, q.bottom) > Math.max(p.top, q.top);
    const sameColumn = Math.min(p.right, q.right) > Math.max(p.left, q.left);
    if (sameRow && q.left - p.right > 0.5) {
      bands.push({
        rect: { left: p.right, right: q.left, top: content.top, bottom: content.bottom },
        value: q.left - p.right,
        auto: spread && !column,
      });
    } else if (sameColumn && q.top - p.bottom > 0.5) {
      bands.push({
        rect: { left: content.left, right: content.right, top: p.bottom, bottom: q.top },
        value: q.top - p.bottom,
        auto: spread && column,
      });
    }
  }
  return bands;
}
