/**
 * The docked panel: component and props, pattern region, `sx`, the
 * states a component declares, the box model, and the Tokens / CSS /
 * Atoms tabs for whatever is selected on the canvas.
 *
 * On a development build every colour an Atoms component paints carries
 * the token it declared, so rows read `exact` or `drift` rather than a
 * best guess by value. Without those marks (production build, older
 * Atoms, not Atoms at all) rows fall back to matching by value.
 */
import { ATOMS_VERSION, compareVersionStrings } from '../../../src/release/version';
import { declaredStates, declaredVariable, declaredVersion, flattenSx, pageVersions, type SxEntry } from './drift';
import { copyImage, copyText, download, openInStudio, openStudioHome, screenshot } from './capture';
import { buildHandover, fileName, type Handover, type HandoverScope } from './handover';
import { boxModel } from './measure';
import { atomsAncestors, hostRoot, readProps, toJsx, type AtomsComponent } from './react';
import { rows, scanDrift, VISUAL_KEY, type DriftHit, type Row } from './rows';
import { lookupInset, resolveDeclared, type Match, type Mode } from './tokens';
import { zip } from '../shared/zip';

type Tab = 'tokens' | 'css' | 'atoms';
export type ModeSetting = 'auto' | Mode;

export interface PanelHost {
  select(el: Element): void;
  close(): void;
  setMode(mode: ModeSetting): void;
  mode(): Mode;
  /** Makes the inspector transparent for a screenshot, and back. */
  setHidden(hidden: boolean): void;
}

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') el.className = value;
    else el.setAttribute(key, value);
  }
  for (const child of children) if (child) el.append(child);
  return el;
}

function button(label: string, onClick: () => void, cls = 'btn', title = '') {
  const el = h('button', { class: cls, type: 'button', ...(title ? { title } : {}) }, label);
  el.addEventListener('click', onClick);
  return el;
}

const BADGE: Partial<Record<Match['status'], string>> = { exact: '✓ exact', drift: '⚠ drift' };

/** A value cell: swatch, value, token path(s), and a note when it is not a clean match. */
function matchCell(match: Match, swatch?: string) {
  return h(
    'div',
    { class: 'v' },
    swatch ? h('span', { class: 'swatch', style: `background:${swatch}` }) : null,
    h('span', { class: 'val' }, match.value),
    BADGE[match.status] ? h('span', { class: `badge ${match.status}` }, BADGE[match.status]) : null,
    ...match.tokens.map((t) => h('span', { class: 'tok' }, t)),
    match.note ? h('span', { class: `note ${match.status}` }, match.note) : null,
  );
}

// ---------------------------------------------------------------- panel

const MARK_LABELS: Record<string, string> = {
  'background-color': 'Background',
  'background-image': 'Background image',
  color: 'Text',
  'border-color': 'Border',
  'border-top-color': 'Border top',
  'border-right-color': 'Border right',
  'border-bottom-color': 'Border bottom',
  'border-left-color': 'Border left',
  'outline-color': 'Outline',
  fill: 'Fill',
  stroke: 'Stroke',
  'focus-ring': 'Focus ring',
  'gradient-from': 'Gradient top',
  'gradient-to': 'Gradient bottom',
};

export class Panel {
  private readonly root: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private readonly foot: HTMLDivElement;
  private tab: Tab = 'tokens';
  private selected: Element | null = null;
  private dock: 'left' | 'right' = 'right';
  private modeSetting: ModeSetting = 'auto';
  private drift: DriftHit[] | null = null;
  private stopWatching: (() => void) | null = null;
  private helpOpen = false;
  /** Why the Studio button could not open Studio, shown until the next render. */
  private studioError: string | null = null;
  private helpButton: HTMLButtonElement | null = null;
  private exportOpen = false;
  private exportButton: HTMLButtonElement | null = null;
  private exportScope: 'selection' | 'screen' = 'screen';
  private exportName = '';
  private nameEdited = false;
  private exportStatus: { text: string; error?: boolean } | null = null;
  private exportBusy = false;
  private thumb: string | null = null;
  private summaryKey = '';
  private summary: Handover | null = null;
  private summaryTarget: Element | null = null;

  constructor(
    shadow: ShadowRoot,
    private readonly host: PanelHost,
    private readonly react: boolean,
    private readonly marked: boolean,
  ) {
    this.body = h('div', { class: 'body' });
    this.foot = h('div', { class: 'foot' });
    this.root = h('div', { class: 'panel right' }, this.header(), this.body, this.foot);
    shadow.appendChild(this.root);
    this.render();
  }

  show(el: Element | null) {
    this.selected = el;
    // Picking an area while exporting sets what to export; otherwise a pick closes help.
    if (this.exportOpen) {
      this.exportScope = el ? 'selection' : 'screen';
      this.exportStatus = null;
    } else if (el) this.setHelp(false);
    this.watch(el);
    this.render();
  }

  /**
   * Hover, press, focus and their transitions change what the selected
   * element declares and renders; re-read it when they settle so the rows
   * never compare a mark from one state with a value from another.
   */
  private watch(el: Element | null) {
    this.stopWatching?.();
    this.stopWatching = null;
    if (!el) return;
    let queued = 0;
    const again = () => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(() => this.selected === el && this.render());
    };
    const events = ['transitionend', 'transitioncancel', 'mouseenter', 'mouseleave', 'focus', 'blur'];
    for (const type of events) el.addEventListener(type, again);
    const classes = new MutationObserver(again);
    classes.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    this.stopWatching = () => {
      cancelAnimationFrame(queued);
      for (const type of events) el.removeEventListener(type, again);
      classes.disconnect();
    };
  }

  private header() {
    const modes: ModeSetting[] = ['auto', 'light', 'dark'];
    const seg = h('div', { class: 'seg' });
    const tips: Record<ModeSetting, string> = {
      auto: "Follow the page's own light/dark setting",
      light: 'Compare against each token\'s light value',
      dark: 'Compare against each token\'s dark value',
    };
    const paintModes = () => {
      seg.replaceChildren(
        ...modes.map((m) =>
          button(m === 'auto' ? 'Auto' : m === 'light' ? 'Light' : 'Dark', () => {
            this.modeSetting = m;
            this.host.setMode(m);
            paintModes();
            if (this.drift) this.drift = scanDrift(this.host.mode());
            this.render();
          }, `btn${this.modeSetting === m ? ' on' : ''}`, tips[m]),
        ),
      );
    };
    paintModes();
    this.helpButton = button('?', () => this.setHelp(!this.helpOpen), 'btn icon', 'Help — features, shortcuts and what the results mean');
    this.exportButton = button('Export', () => this.setExport(!this.exportOpen), 'btn', 'Export the screen or the selection for a developer — JSON for Claude with the Atoms MCP, and an image');
    return h(
      'div',
      { class: 'head' },
      h(
        'div',
        { class: 'head-row' },
        h('strong', {}, 'Atoms Inspector'),
        button('Scan', () => {
          this.drift = scanDrift(this.host.mode());
          this.setHelp(false);
          this.render();
        }, 'btn', 'Scan the page — list every colour that drifted from the token its component declared'),
        this.exportButton,
        button('Studio', () => {
          openStudioHome().catch((error: unknown) => {
            this.studioError = error instanceof Error ? error.message : String(error);
            this.render();
          });
        }, 'btn', 'Open Atoms Studio — every design you have exported, to edit and hand over'),
        this.helpButton,
        button(this.dock === 'right' ? '⇤' : '⇥', () => {
          this.dock = this.dock === 'right' ? 'left' : 'right';
          this.root.className = `panel ${this.dock}`;
        }, 'btn icon', 'Move the panel to the other side of the page'),
        button('✕', () => this.host.close(), 'btn icon', 'Turn the inspector off (or click the toolbar icon again)'),
      ),
      h('div', { class: 'head-row mode' }, h('span', { class: 'mode-label' }, 'Match tokens for'), seg),
    );
  }

  private setHelp(open: boolean) {
    if (this.helpOpen === open) return;
    this.helpOpen = open;
    this.helpButton?.classList.toggle('on', open);
    if (open) this.setExport(false);
    this.render();
  }

  private setExport(open: boolean) {
    if (this.exportOpen === open) return;
    this.exportOpen = open;
    this.exportButton?.classList.toggle('on', open);
    if (open) {
      this.setHelp(false);
      this.exportScope = this.selected?.isConnected ? 'selection' : 'screen';
      this.exportStatus = null;
    }
    this.render();
  }

  private versionsKey = '';
  private versions: string[] = [];

  /** The releases marked on the page, re-read only when its stylesheets change. */
  private pageVersions(): string[] {
    let rules = 0;
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        rules += sheet.cssRules.length;
      } catch {
        // cross-origin
      }
    }
    const key = `${document.styleSheets.length}:${rules}`;
    if (key !== this.versionsKey) {
      this.versionsKey = key;
      this.versions = pageVersions();
    }
    return this.versions;
  }

  /** A warning when the page was built with a different Atoms release than the inspector's tokens. */
  private versionBanner() {
    const versions = this.pageVersions();
    const others = versions.filter((v) => v !== ATOMS_VERSION);
    if (!others.length) return null;
    const list = (vs: string[]) => vs.map((v) => `Atoms ${v}`).join(' and ');
    let title: string;
    let advice: string;
    if (versions.length > 1) {
      title = `This page mixes ${list(versions)}.`;
      advice = `More than one copy of Atoms is installed. ${
        versions.includes(ATOMS_VERSION)
          ? `Only parts drawn by ${ATOMS_VERSION} are checked against the right tokens — the rest can show false drift.`
          : `None matches the inspector's ${ATOMS_VERSION}, so any part can show false drift.`
      } Dedupe the app's install (npm ls @neofloai/atoms).`;
    } else {
      const order = compareVersionStrings(others[0], ATOMS_VERSION);
      title = `This page uses Atoms ${others[0]}; the inspector has ${ATOMS_VERSION} tokens.`;
      advice =
        order === null
          ? 'Tokens that differ between them show as drift.'
          : order > 0
            ? 'The page is newer. Tokens added or changed since show as drift or "not a token" — install the latest inspector zip.'
            : `The page is older. Tokens changed since ${others[0]} show as drift — upgrade the app's Atoms, or use an inspector built for ${others[0]}.`;
    }
    return h('div', { class: 'section version-warn' }, h('div', { class: 'version-title' }, `⚠ ${title}`), h('div', {}, advice));
  }

  private render() {
    const mode = this.host.mode();
    const versions = this.pageVersions();
    const page = !versions.length ? 'no marks' : versions.join(' + ');
    const synced = versions.length === 1 && versions[0] === ATOMS_VERSION;
    this.foot.replaceChildren(
      h(
        'span',
        { title: synced ? 'The page and the inspector use the same Atoms release' : versions.length ? 'The page and the inspector use different Atoms releases' : 'No Atoms version marks on this page — a production build, or a release from before the marks' },
        `Inspector ${ATOMS_VERSION} · page ${page}${synced ? ' ✓' : versions.length ? ' ⚠' : ''}`,
      ),
      h('span', {}, `Matching ${mode}${this.modeSetting === 'auto' ? ' (auto)' : ''}`),
    );

    if (this.helpOpen) {
      this.body.replaceChildren(this.helpView());
      return;
    }
    if (this.exportOpen) {
      this.body.replaceChildren(...[this.versionBanner(), this.exportView()].filter((s): s is HTMLDivElement => !!s));
      return;
    }

    const notice = this.studioError ? h('div', { class: 'section version-warn' }, h('div', { class: 'version-title' }, 'Could not open Atoms Studio'), h('div', {}, this.studioError)) : null;
    this.studioError = null;
    const sections: (HTMLElement | null)[] = [notice, this.versionBanner(), this.driftSection()];
    const el = this.selected;
    if (!el || !el.isConnected) {
      sections.push(this.emptyState());
    } else {
      const ancestors = atomsAncestors(el);
      const own = ancestors.find((c) => hostRoot(c) === el) ?? null;
      const atoms = !!declaredVersion(el) || (!!own && !own.primitive);
      const list = rows(el, mode, atoms);
      sections.push(
        this.identity(el, own, ancestors),
        own ? this.props(own) : null,
        own ? this.sxSection(own) : null,
        this.statesSection(el, mode),
        this.boxSection(el),
        this.tabs(el, own, list),
      );
    }
    this.body.replaceChildren(...sections.filter((s): s is HTMLElement => !!s));
  }

  private emptyState() {
    const help = button('Open help', () => this.setHelp(true), 'btn copy on');
    return h(
      'div',
      { class: 'empty' },
      h('div', { class: 'empty-title' }, 'Click anything on the page to inspect it.'),
      h(
        'div',
        { class: 'keys compact' },
        h('kbd', {}, 'Click'), h('span', {}, 'select an Atoms component'),
        h('kbd', {}, '⌘ / Ctrl + click'), h('span', {}, 'select the exact element inside it'),
        h('kbd', {}, 'Alt + hover'), h('span', {}, 'measure from the selection'),
        h('kbd', {}, 'Esc'), h('span', {}, 'clear the selection'),
      ),
      h('div', {}, h('strong', {}, 'Scan'), ' checks the whole page and lists every colour that drifted from its token.'),
      h('div', {}, h('strong', {}, 'Export'), ' saves the screen or a selected area as JSON and an image, for a developer to rebuild with Claude.'),
      help,
      this.marked
        ? null
        : h('div', { class: 'flag' }, 'No development marks on this page — it is a production build, or its Atoms predates them. Token names are best-guess matches by value, and drift cannot be detected.'),
      this.react ? null : h('div', { class: 'flag' }, 'No React found on this page — spacing and tokens still work, component names do not.'),
    );
  }

  // ---------------------------------------------------------------- export

  /** What the selection is called in the export: its region, its component, or its tag. */
  private selectionLabel(el: Element): string {
    const region = el.getAttribute('data-atoms-region');
    if (region) return `${region} region`;
    const own = atomsAncestors(el).find((c) => hostRoot(c) === el);
    return own ? own.name : `<${el.tagName.toLowerCase()}>`;
  }

  private scope(): HandoverScope {
    const el = this.selected;
    return this.exportScope === 'selection' && el?.isConnected ? { kind: 'selection', el, label: this.selectionLabel(el) } : { kind: 'screen' };
  }

  /** A name from the pattern and region, the component, or the page title. */
  private defaultName(scope: HandoverScope): string {
    const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const pageEl = document.querySelector('[data-atoms-pattern]');
    const page = slug(pageEl?.getAttribute('data-atoms-pattern') ?? (document.title.split(/[|–—·-]/)[0] || location.pathname.split('/').filter(Boolean).pop() || 'screen'));
    if (scope.kind === 'screen') return page || 'screen';
    const region = scope.el.getAttribute('data-atoms-region');
    const pattern = scope.el.closest('[data-atoms-pattern]')?.getAttribute('data-atoms-pattern');
    if (region && pattern) return `${slug(pattern)}-${slug(region)}`;
    return [page, slug(this.selectionLabel(scope.el))].filter(Boolean).join('-');
  }

  private build(withImage?: string): Handover {
    const scope = this.scope();
    const name = this.exportName.trim() || this.defaultName(scope);
    const handover = buildHandover(scope, name, this.host.mode(), this.marked);
    if (withImage) handover.image = withImage;
    return handover;
  }

  private async run(label: string, action: (file: string) => Promise<string>) {
    if (this.exportBusy) return;
    this.exportBusy = true;
    this.exportStatus = { text: `${label}…` };
    this.render();
    try {
      const file = fileName(this.exportName || this.defaultName(this.scope()));
      this.exportStatus = { text: await action(file) };
    } catch (error) {
      this.exportStatus = { text: error instanceof Error ? error.message : String(error), error: true };
    } finally {
      this.exportBusy = false;
      this.render();
    }
  }

  private showThumb(blob: Blob) {
    if (this.thumb) URL.revokeObjectURL(this.thumb);
    this.thumb = URL.createObjectURL(blob);
  }

  private shot() {
    const scope = this.scope();
    return screenshot(scope.kind === 'selection' ? scope.el : null, (hidden) => this.host.setHidden(hidden)).then((shot) => {
      this.showThumb(shot.blob);
      return shot;
    });
  }

  private exportView() {
    const scope = this.scope();
    const hasSelection = !!this.selected?.isConnected;
    if (!this.nameEdited) this.exportName = this.defaultName(scope);

    // The counts are rebuilt only when what is exported changes.
    const key = `${scope.kind}:${scope.kind === 'selection' ? this.selectionLabel(scope.el) : ''}:${this.host.mode()}`;
    const target = scope.kind === 'selection' ? scope.el : null;
    if (key !== this.summaryKey || this.summaryTarget !== target) {
      this.summaryKey = key;
      this.summaryTarget = target;
      try {
        this.summary = this.build();
      } catch {
        this.summary = null;
      }
    }
    const s = this.summary;
    const count = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
    const total = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

    const seg = h(
      'div',
      { class: 'seg scope' },
      button(hasSelection ? `Selection · ${this.selectionLabel(this.selected!)}` : 'Selection', () => {
        if (!hasSelection) return;
        this.exportScope = 'selection';
        this.exportStatus = null;
        this.render();
      }, `btn${scope.kind === 'selection' ? ' on' : ''}${hasSelection ? '' : ' disabled'}`, hasSelection ? 'Export the selected area' : 'Click something on the page first'),
      button('Whole screen', () => {
        this.exportScope = 'screen';
        this.exportStatus = null;
        this.render();
      }, `btn${scope.kind === 'screen' ? ' on' : ''}`, 'Export everything on the page'),
    );

    const regions = [...document.querySelectorAll('[data-atoms-region]')].filter((el) => el.getClientRects().length);
    const regionPicker = regions.length
      ? h(
          'div',
          { class: 'field' },
          h('label', {}, 'Or pick a pattern region'),
          h(
            'div',
            { class: 'crumbs' },
            ...regions.map((el) =>
              button(el.getAttribute('data-atoms-region') ?? '', () => this.host.select(el), `crumb${scope.kind === 'selection' && scope.el === el ? ' here' : ''}`),
            ),
          ),
        )
      : null;

    const input = h('input', { class: 'name-input', type: 'text', spellcheck: 'false', value: this.exportName, placeholder: this.defaultName(scope) });
    input.addEventListener('input', () => {
      this.exportName = input.value;
      this.nameEdited = input.value.trim() !== '';
    });
    // Keys typed into the name belong to the field, not to the page's shortcuts.
    input.addEventListener('keydown', (event) => event.stopPropagation());
    const reset = this.nameEdited
      ? button('Reset', () => {
          this.nameEdited = false;
          this.render();
        }, 'btn', 'Go back to the suggested name')
      : null;

    const busy = this.exportBusy ? ' disabled' : '';
    const kb = (text: string) => `${Math.max(1, Math.round(new Blob([text]).size / 1024))} KB`;

    const copyJson = button('Copy JSON', () => {
      const text = JSON.stringify(this.build(), null, 2);
      void this.run('Copying', async () => {
        await copyText(text);
        return `Copied the JSON (${kb(text)}). Paste it into Claude with the Atoms MCP connected.`;
      });
    }, `btn action${busy}`, 'Copy the handover JSON to the clipboard');

    const downloadJson = button('Download JSON', () =>
      void this.run('Saving', async (file) => {
        const text = JSON.stringify(this.build(), null, 2);
        download(new Blob([text], { type: 'application/json' }), `${file}.atoms.json`);
        return `Saved ${file}.atoms.json (${kb(text)}).`;
      }), `btn action${busy}`, 'Save the handover JSON as a file');

    const copyPng = button('Copy image', () => {
      const shot = this.shot();
      void this.run('Taking the screenshot', async () => {
        await copyImage(shot.then((x) => x.blob));
        const { cropped } = await shot;
        return `Copied the image.${cropped ? ' Only the part on screen was captured.' : ''}`;
      });
    }, `btn action${busy}`, 'Copy a screenshot of the area to the clipboard');

    const downloadPng = button('Download image', () =>
      void this.run('Taking the screenshot', async (file) => {
        const { blob, cropped } = await this.shot();
        download(blob, `${file}.png`);
        return `Saved ${file}.png.${cropped ? ' Only the part on screen was captured.' : ''}`;
      }), `btn action${busy}`, 'Save a screenshot of the area as a PNG');

    const studio = button('Edit in Atoms Studio', () =>
      void this.run('Opening Atoms Studio', async () => {
        let image: Blob | null = null;
        let cropped = false;
        let box: { x: number; y: number; w: number; h: number } | null = null;
        try {
          ({ blob: image, cropped, box } = await this.shot());
        } catch {
          // Studio still opens without a screenshot; compare is just unavailable.
        }
        await openInStudio(this.build(), image, box, location.host || 'Designs');
        return `Opened in Atoms Studio, in the ${location.host || 'Designs'} project.${cropped ? ' The screenshot covers only the part on screen.' : ''}`;
      }), `btn primary${busy}`, 'Rebuild this in Atoms Studio to edit it — props, tokens, layout — before handing it over');

    const both = button('Download JSON + image (.zip)', () =>
      void this.run('Packing', async (file) => {
        const { blob, cropped } = await this.shot();
        const text = JSON.stringify(this.build(`${file}.png`), null, 2);
        download(await zip([{ name: `${file}.atoms.json`, data: text }, { name: `${file}.png`, data: blob }]), `${file}.zip`);
        return `Saved ${file}.zip with ${file}.atoms.json and ${file}.png.${cropped ? ' Only the part on screen was captured.' : ''}`;
      }), `btn action wide${busy}`, 'One file to share: the JSON and the screenshot together');

    return h(
      'div',
      { class: 'section export' },
      h('h3', {}, 'Export for a developer'),
      h('p', { class: 'lede' }, 'The developer pastes the JSON into Claude with the Atoms MCP connected, and Claude rebuilds this with Atoms through build_from_json. The image shows what it should look like.'),
      h('div', { class: 'field' }, h('label', {}, 'What to export'), seg),
      hasSelection ? null : h('div', { class: 'hint' }, 'To export part of the page, click it first. Use the breadcrumb to widen the selection.'),
      regionPicker,
      h('div', { class: 'field' }, h('label', {}, 'Name'), h('div', { class: 'name-row' }, input, reset)),
      s
        ? h(
            'div',
            { class: 'summary' },
            h('span', {}, count(total(s.summary.components), 'component')),
            h('span', {}, count(total(s.summary.layouts), 'layout')),
            h('span', {}, count(s.summary.icons.length, 'icon')),
            h('span', {}, count(s.summary.tokens.length, 'token')),
            h('span', { class: s.deviations.length ? 'warn' : '' }, count(s.deviations.length, 'deviation')),
            s.pattern ? h('span', {}, `pattern ${s.pattern.name}`) : null,
          )
        : null,
      s && !s.atoms.marked ? h('div', { class: 'flag' }, 'No development marks on this page — token names in the export are best guesses by value.') : null,
      h('div', { class: 'field' }, h('label', {}, 'JSON'), h('div', { class: 'actions' }, copyJson, downloadJson)),
      h('div', { class: 'field' }, h('label', {}, 'Image'), h('div', { class: 'actions' }, copyPng, downloadPng)),
      both,
      studio,
      this.exportStatus ? h('div', { class: `status${this.exportStatus.error ? ' error' : ''}` }, this.exportStatus.text) : null,
      this.thumb ? h('img', { class: 'thumb', src: this.thumb, alt: 'Last screenshot' }) : null,
      h('div', { class: 'hint' }, 'Everything in the area goes in, including its text and sample data. Check it before you share. Images cover what is on screen; scroll first for a long page.'),
    );
  }

  /** Everything the inspector does, in the order someone meets it. */
  private helpView() {
    const section = (title: string, ...children: (Node | string | null)[]) =>
      h('div', { class: 'section help' }, h('h3', {}, title), ...children);
    const p = (...children: (Node | string)[]) => h('p', {}, ...children);
    const keys = (...pairs: [string, string][]) =>
      h('div', { class: 'keys' }, ...pairs.flatMap(([k, v]) => [h('kbd', {}, k), h('span', {}, v)]));
    const legend = (...items: [Node, string][]) =>
      h('div', { class: 'keys legend' }, ...items.flatMap(([mark, text]) => [mark, h('span', {}, text)]));
    const badge = (status: 'exact' | 'drift', text: string) => h('span', { class: `badge ${status}` }, text);
    const note = (cls: string, text: string) => h('span', { class: `note ${cls} sample` }, text);
    const swatch = (cls: string) => h('span', { class: `canvas-swatch ${cls}` });

    return h(
      'div',
      {},
      section(
        'What it is',
        p('Figma-style inspect for a running app. Select any element to see its Atoms component, props, spacing, and the design token behind every colour, space, radius and type size.'),
        p('Works best on a ', h('strong', {}, 'development build'), ' (', h('code', {}, 'npm run dev'), '). There, every Atoms colour declares its exact token, so the inspector can tell when something drifted from it.'),
      ),
      section(
        'Shortcuts',
        keys(
          ['Alt + Shift + I', 'turn the inspector on or off (or click its toolbar icon)'],
          ['Hover', 'outline an element, labelled with its component'],
          ['Click', 'select the whole Atoms component'],
          ['⌘ / Ctrl + click', 'select the exact element inside a component'],
          ['Alt + hover', 'with something selected: red distance lines to the hovered element'],
          ['Esc', 'clear the selection'],
        ),
        p('While the inspector is on, clicks go to it, not the page. Turn it off to use the app again.'),
      ),
      section(
        'Reading a selection',
        keys(
          ['Header', 'component name, its pattern and region (invoice-dashboard › toolbar), and a breadcrumb — click a crumb to select that parent'],
          ['Props', 'the props the caller wrote'],
          ['Overrides', 'every sx and style property; visual ones are marked "override"'],
          ['States', 'the tokens for rest, hover, pressed, focus, selected and disabled — no need to hover or click'],
          ['Layer', 'the box model: margin, border, padding, size'],
          ['Tokens tab', 'each value with its token'],
          ['CSS tab', 'computed CSS with tokens as comments — copyable'],
          ['Atoms tab', 'a JSX snippet of the component — copyable'],
        ),
      ),
      section(
        'What the results mean',
        legend(
          [badge('exact', '✓ exact'), 'the component declared this token and it rendered exactly as declared'],
          [badge('drift', '⚠ drift'), 'it declared one token but something else rendered; the note gives the intended value and the cause — sx, style prop, outside CSS, wrong mode, or another Atoms version'],
          [note('warn', 'yellow note'), 'a real token, but the wrong kind for this property (e.g. a text token used as a border)'],
          [note('off', 'red note'), 'no token has this value; the nearest one is suggested'],
        ),
      ),
      section(
        'Scan',
        p('One click checks every Atoms element on the page and lists each colour that drifted from its declared token, with the cause. Identical drifts are grouped (×5).'),
        p('Click an entry to select that element; click again to step to the next one. Use it before handing a screen over, or when reviewing one, to see every place it left the design system.'),
        p('It checks colours only, and only what is on screen now — open a dialog or tab first to include it.'),
      ),
      section(
        'Export',
        p('Hands a screen to a developer. Pick ', h('strong', {}, 'Whole screen'), ', or click an area (or a pattern region) to export just that, and give it a name.'),
        p(h('strong', {}, 'JSON'), ' lists every Atoms component with the props it was given, the layout with its spacing tokens, icons, text, and every deviation from the library. The developer pastes it into Claude with the Atoms MCP connected, and the MCP\'s build_from_json tool turns it into React code built from Atoms.'),
        p(h('strong', {}, 'Image'), ' is a screenshot of the same area, without the inspector in it. ', h('strong', {}, 'Download JSON + image'), ' puts both in one .zip to share.'),
        p('Everything in the area goes in, including its text and sample data, so check it before sharing. Images cover what is on screen.'),
      ),
      section(
        'Atoms Studio',
        p(h('strong', {}, 'Edit in Atoms Studio'), ' (in Export) rebuilds the area with the real Atoms library in a new tab, where you can change it before handing it over: pick props from each component\'s own options, change spacing, colour, radius and type through token pickers, drag things to rearrange them, insert components and icons, fix or accept deviations, and leave notes for the developer. Selections there are measured as they are here — padding, gaps, size, and Alt + hover distances.'),
        p('On a component there you can also change its height, width, padding, font size, icon size, colours and border — on the whole component, or on the part you ⌘-click — and drag the handles on the canvas to resize anything. These reach the developer as deviations.'),
        p('Studio keeps projects in this browser. To open it any time, click ', h('strong', {}, 'Studio'), ' at the top of this panel, or right-click the toolbar icon and choose ', h('strong', {}, 'Open Atoms Studio'), '.'),
      ),
      section(
        'Match tokens for',
        p('Every colour token has a light and a dark value. ', h('strong', {}, 'Auto'), " follows the page's own setting (the data-dark attribute on <html>). Pick Light or Dark when a page sets its mode some other way — a drift note saying \"matches the dark value\" means the mode is set wrong."),
      ),
      section(
        'On the canvas',
        legend(
          [swatch('select'), 'selected element, with its size below'],
          [swatch('hover'), 'hovered element'],
          [swatch('padding'), 'padding, with values'],
          [swatch('gap'), 'gap between children of a flex or grid — "Auto" when they are spread by space-between'],
          [swatch('measure'), 'distance to the hovered element (Alt), labelled with its spacing token'],
        ),
      ),
      section(
        'Good to know',
        p('In Chrome DevTools, the same marks are visible in the Styles pane: type ', h('code', {}, '--atoms'), ' in its Filter box.'),
        p('Production builds carry no marks. There, token names are best-guess matches by value, and drift cannot be checked.'),
        p(`Tokens come from Atoms ${ATOMS_VERSION}. Rebuild the extension after a token sync.`),
        p('The footer shows the Atoms release the page was built with. When it differs from the inspector\'s, a warning at the top of the panel says which side is behind — values that changed between the two releases show as drift, not as real overrides.'),
      ),
    );
  }

  private driftSection() {
    if (!this.drift) return null;
    // Identical drifts on repeated elements (every row's toggle) group into
    // one entry; clicking it steps through them.
    const groups = new Map<string, DriftHit[]>();
    for (const hit of this.drift) {
      const key = `${hit.name}|${hit.row}|${hit.note}`;
      groups.set(key, [...(groups.get(key) ?? []), hit]);
    }
    const total = this.drift.length;
    return h(
      'div',
      { class: 'section' },
      h('h3', {}, total ? `${total} drift${total === 1 ? '' : 's'} on this page` : 'No drift on this page'),
      ...[...groups.values()].map((hits) => {
        let next = 0;
        const item = button('', () => {
          this.host.select(hits[next % hits.length].el);
          next += 1;
        }, 'drift-item');
        const [first] = hits;
        item.append(
          h('span', { class: 'drift-name' }, `${first.name} · ${first.row}${hits.length > 1 ? `  ×${hits.length}` : ''}`),
          h('span', { class: 'note drift' }, first.note),
        );
        return item;
      }),
      button('Clear', () => {
        this.drift = null;
        this.render();
      }, 'btn copy'),
    );
  }

  private identity(el: Element, own: AtomsComponent | null, ancestors: AtomsComponent[]) {
    const tag = el.tagName.toLowerCase();
    // Outer layout primitives (page shells, docs chrome) are noise; keep
    // the two nearest the first component, and everything inside it.
    const outer = [...ancestors].reverse();
    const firstComponent = outer.findIndex((c) => !c.primitive);
    const cut = firstComponent < 0 ? Math.max(0, outer.length - 3) : Math.max(0, firstComponent - 2);
    const crumbs = outer.slice(cut);
    const region = el.closest('[data-atoms-region]');
    const version = declaredVersion(el);
    const inside = ancestors.find((c) => !c.primitive);
    return h(
      'div',
      { class: 'section' },
      h('div', { class: 'name' }, own ? own.name : `<${tag}>`),
      h(
        'div',
        { class: 'kind' },
        own
          ? h('span', { class: 'atoms' }, own.primitive ? 'Atoms layout primitive' : 'Atoms component')
          : inside
            ? `element inside ${inside.name}`
            : 'not an Atoms component',
        own ? ` · <${tag}>` : '',
      ),
      region
        ? h(
            'div',
            { class: 'region' },
            h('span', { class: 'k' }, 'Pattern '),
            `${region.getAttribute('data-atoms-pattern')} › ${region.getAttribute('data-atoms-region')}`,
          )
        : null,
      // One release on the page is covered by the banner; with several, say which drew this element.
      version && version !== ATOMS_VERSION && this.pageVersions().length > 1
        ? h('div', { class: 'flag' }, `Drawn by Atoms ${version}; the inspector's tokens are ${ATOMS_VERSION}. Values that changed between them show as drift.`)
        : null,
      crumbs.length
        ? h(
            'div',
            { class: 'crumbs' },
            ...crumbs.map((c) => {
              const root = hostRoot(c);
              return button(c.name, () => root && this.host.select(root), `crumb${c === own ? ' here' : ''}${c.primitive ? ' primitive' : ''}`);
            }),
          )
        : null,
    );
  }

  private props(own: AtomsComponent) {
    const props = readProps(own).filter(([key]) => key !== 'sx' && !key.startsWith('data-atoms-'));
    return h(
      'div',
      { class: 'section' },
      h('h3', {}, 'Props'),
      props.length
        ? h(
            'div',
            { class: 'rows' },
            ...props.flatMap(([key, value]) => [
              h('div', { class: 'k' }, key),
              h('div', { class: `v ${value.kind === 'string' ? 'prop-string' : value.kind === 'other' ? 'prop-other' : ''}` }, value.kind === 'string' ? `"${value.text}"` : value.text),
            ]),
          )
        : h('div', { class: 'kind' }, 'Defaults only'),
    );
  }

  /**
   * Each property the caller's `sx` / `style` writes. Visual properties
   * (colour, padding, radius, type, border, shadow) replace what the
   * component decided and are flagged; placing it (width, flex, margin,
   * position) is the caller's job and reads as neutral.
   */
  private sxSection(own: AtomsComponent) {
    const sx = own.fiber.memoizedProps?.sx;
    const style = own.fiber.memoizedProps?.style as Record<string, unknown> | undefined;
    const entries: SxEntry[] = [
      ...flattenSx(sx),
      ...(style && typeof style === 'object'
        ? Object.entries(style).map(([key, value]) => ({ selector: 'style', key, value: String(value) }))
        : []),
    ];
    if (!entries.length) return null;
    const visual = (e: SxEntry) => !!e.selector && e.selector !== 'style' ? true : VISUAL_KEY.test(e.key);
    const overriding = own.primitive ? 0 : entries.filter(visual).length;
    return h(
      'div',
      { class: 'section' },
      h('h3', {}, own.primitive ? 'sx' : 'Overrides'),
      overriding
        ? h('div', { class: 'flag first' }, `${overriding} ${overriding === 1 ? 'property replaces' : 'properties replace'} ${own.name}'s own styling.`)
        : null,
      h(
        'div',
        { class: 'rows' },
        ...entries.flatMap((e) => [
          h('div', { class: 'k' }, e.selector && e.selector !== 'style' ? e.selector : e.selector === 'style' ? 'style' : 'sx'),
          h(
            'div',
            { class: 'v' },
            h('span', { class: 'val' }, `${e.key}: ${e.value}`),
            !own.primitive && visual(e) ? h('span', { class: 'badge drift' }, 'override') : null,
          ),
        ]),
      ),
    );
  }

  /** The tokens each interaction state declares, read from the component's own rules. */
  private statesSection(el: Element, mode: Mode) {
    const states = declaredStates(el);
    if (!states.length) return null;
    return h(
      'div',
      { class: 'section' },
      h('h3', {}, 'States'),
      ...states.map(({ state, marks }) =>
        h(
          'div',
          { class: 'state' },
          h('div', { class: 'state-name' }, state),
          h(
            'div',
            { class: 'rows' },
            ...[...marks.entries()].flatMap(([property, name]) => {
              const d = resolveDeclared(name, mode);
              return [
                h('div', { class: 'k' }, MARK_LABELS[property] ?? property),
                h(
                  'div',
                  { class: 'v' },
                  d.expected ? h('span', { class: 'swatch', style: `background:${d.expected}` }) : null,
                  h('span', { class: 'tok inline' }, d.raw ? 'raw colour from the caller' : d.label),
                  d.unknown ? h('span', { class: 'note drift' }, `not a token in Atoms ${ATOMS_VERSION}`) : null,
                ),
              ];
            }),
          ),
        ),
      ),
    );
  }

  private boxSection(el: Element) {
    const bm = boxModel(el);
    const cell = (value: number, cls: string, spacing: boolean, borderWidth: number) => {
      const r = Math.round(value * 100) / 100;
      const match = spacing ? lookupInset(value, borderWidth) : null;
      const state = r === 0 ? 'zero' : match && match.status !== 'token' ? 'off' : '';
      const span = h('span', { class: `${cls} ${state}` }, r === 0 ? '–' : String(r));
      if (match) span.title = match.tokens[0] ?? match.note ?? '';
      return span;
    };
    const none = { top: 0, right: 0, bottom: 0, left: 0 };
    const ring = (label: string, cls: string, s: typeof bm.padding, inner: Node, spacing = true, borders = none) =>
      h(
        'div',
        { class: `bm ${cls}` },
        h('span', { class: 'lbl' }, label),
        cell(s.top, 't', spacing, borders.top),
        cell(s.right, 'r', spacing, borders.right),
        cell(s.bottom, 'b', spacing, borders.bottom),
        cell(s.left, 'l', spacing, borders.left),
        inner,
      );
    const size = h('span', { class: 'content' }, `${Math.round(bm.width * 100) / 100} × ${Math.round(bm.height * 100) / 100}`);
    return h(
      'div',
      { class: 'section' },
      h('h3', {}, 'Layer properties'),
      h(
        'div',
        { class: 'boxmodel' },
        ring('Margin', 'margin', bm.margin, ring('Border', 'border', bm.borderWidth, ring('Padding', 'padding', bm.padding, size, true, bm.borderWidth), false)),
      ),
    );
  }

  private tabs(el: Element, own: AtomsComponent | null, list: Row[]) {
    const wrap = h('div', { class: 'section' });
    const paint = () => {
      const bar = h(
        'div',
        { class: 'tabs seg' },
        ...(['tokens', 'css', 'atoms'] as Tab[]).map((t) =>
          button(t === 'tokens' ? 'Tokens' : t === 'css' ? 'CSS' : 'Atoms', () => {
            this.tab = t;
            paint();
          }, `btn${this.tab === t ? ' on' : ''}`),
        ),
      );
      wrap.replaceChildren(bar, this.tabBody(el, own, list));
    };
    paint();
    return wrap;
  }

  private tabBody(el: Element, own: AtomsComponent | null, list: Row[]) {
    if (this.tab === 'tokens') {
      if (!list.length) return h('div', { class: 'kind' }, 'Nothing styled on this element itself.');
      return h('div', { class: 'rows' }, ...list.flatMap((r) => [h('div', { class: 'k' }, r.label), matchCell(r.match, r.swatch)]));
    }

    if (this.tab === 'css') {
      const s = getComputedStyle(el);
      const layout = [
        `display: ${s.display}`,
        /flex/.test(s.display) ? `flex-direction: ${s.flexDirection}` : '',
        /flex|grid/.test(s.display) ? `justify-content: ${s.justifyContent}` : '',
        /flex|grid/.test(s.display) ? `align-items: ${s.alignItems}` : '',
        `width: ${s.width}`,
        `height: ${s.height}`,
      ].filter(Boolean);
      const pre = h('pre', {});
      const lines: Node[] = [];
      for (const line of layout) lines.push(document.createTextNode(`${line};\n`));
      for (const r of list) {
        lines.push(document.createTextNode(`${r.css};`));
        const variable = declaredVariable(el, r.property);
        const comment = [r.match.tokens[0] ?? r.match.note, variable ? `declared ${variable}` : ''].filter(Boolean).join(' · ');
        const clean = r.match.status === 'token' || r.match.status === 'exact';
        if (comment) lines.push(h('span', { class: `c ${clean ? '' : 'off'}` }, ` /* ${comment} */`));
        lines.push(document.createTextNode('\n'));
      }
      pre.append(...lines);
      return h('div', {}, pre, this.copyButton(() => pre.textContent ?? ''));
    }

    if (!own) {
      const nearest = atomsAncestors(el)[0];
      return h(
        'div',
        { class: 'kind' },
        nearest ? `This element is part of ${nearest.name}. Select the component to get its snippet.` : 'Not an Atoms component — nothing to paste.',
      );
    }
    const code = `import { ${own.name} } from '@neofloai/atoms';\n\n${toJsx(own)}`;
    return h('div', {}, h('pre', {}, code), this.copyButton(() => code));
  }

  private copyButton(read: () => string) {
    const el = button('Copy', () => {
      navigator.clipboard.writeText(read()).then(
        () => {
          el.textContent = 'Copied';
          setTimeout(() => (el.textContent = 'Copy'), 1200);
        },
        () => (el.textContent = 'Copy blocked by the page'),
      );
    }, 'btn copy on');
    return el;
  }
}
