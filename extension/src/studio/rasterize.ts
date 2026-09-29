/**
 * A PNG of the canvas, drawn without a screenshot: Chrome only lets an
 * extension photograph its own page with an all-sites permission, which
 * Studio does not ask for. The canvas document is serialised into an SVG
 * `foreignObject` with every stylesheet rule and font inlined, and the
 * browser paints that into a canvas — the whole design, not just the part
 * on screen.
 */

const fonts = new Map<string, Promise<string>>();

async function dataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/** Every rule the canvas uses, with `url(...)` in font faces swapped for inline data. */
async function inlineStyles(doc: Document): Promise<string> {
  const parts: string[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      let text = rule.cssText;
      if (text.startsWith('@font-face')) {
        const urls = [...text.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]);
        for (const u of urls) {
          const absolute = new URL(u, sheet.href ?? location.href).href;
          if (!fonts.has(absolute)) fonts.set(absolute, dataUrl(absolute).catch(() => absolute));
          text = text.split(u).join(await fonts.get(absolute)!);
        }
      }
      parts.push(text);
    }
  }
  return parts.join('\n');
}

/** Images from the page's own server, inlined where the browser lets Studio read them. */
async function inlineImages(root: Element) {
  await Promise.all(
    Array.from(root.querySelectorAll('img')).map(async (img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return;
      try {
        img.setAttribute('src', await dataUrl(src));
      } catch {
        img.removeAttribute('src');
      }
    }),
  );
}

export async function rasterize(doc: Document, width: number, height: number, scale = 2): Promise<Blob> {
  const css = await inlineStyles(doc);
  const html = doc.documentElement.cloneNode(true) as HTMLElement;
  for (const node of Array.from(html.querySelectorAll('script, link, style'))) node.remove();
  await inlineImages(html);
  const head = html.querySelector('head') ?? html.insertBefore(doc.createElement('head'), html.firstChild);
  const style = doc.createElement('style');
  style.textContent = css;
  head.appendChild(style);
  html.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const markup = new XMLSerializer().serializeToString(html);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject x="0" y="0" width="100%" height="100%">${markup}</foreignObject></svg>`;

  const image = new Image();
  image.decoding = 'sync';
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('the design could not be drawn'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('could not encode the image');
  return blob;
}
