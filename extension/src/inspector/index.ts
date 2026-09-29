/**
 * Atoms Inspector entry. Injected into the page's main world on every
 * toolbar click: the first injection starts the inspector, the next one
 * finds it on `window` and shuts it down.
 */
import { registerMarks } from './drift';
import { Overlay } from './overlay';
import { Panel, type ModeSetting } from './panel';
import { atomsAncestors, hasReact, hostRoot } from './react';
import { css } from './styles';
import type { Mode } from './tokens';

interface Instance {
  stop(): void;
}

declare global {
  interface Window {
    __atomsInspector?: Instance;
  }
}

/**
 * The Atoms theme sets `colorSchemeSelector: 'data'`, which marks the
 * root `data-dark` / `data-light`. The other spellings cover apps that
 * wire the scheme differently.
 */
function detectMode(): Mode {
  const root = document.documentElement;
  if (
    root.hasAttribute('data-dark') ||
    root.getAttribute('data-mui-color-scheme') === 'dark' ||
    root.dataset.theme === 'dark' ||
    root.classList.contains('dark')
  ) {
    return 'dark';
  }
  return 'light';
}

function start(): Instance {
  const host = document.createElement('atoms-inspector');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
  document.documentElement.appendChild(host);

  // Development builds of Atoms declare each colour's token as a CSS
  // custom property; register them non-inheriting before reading any.
  const marked = registerMarks();
  let modeSetting: ModeSetting = 'auto';
  const state = {
    hover: null as Element | null,
    hoverName: '',
    selected: null as Element | null,
    selectedName: '',
    measuring: false,
    deep: false,
  };
  let lastTarget: Element | null = null;

  const overlay = new Overlay(shadow);
  const panel = new Panel(
    shadow,
    {
      select: (el) => select(el, true),
      close: () => instance.stop(),
      setMode: (m) => {
        modeSetting = m;
      },
      mode: () => (modeSetting === 'auto' ? detectMode() : modeSetting),
      // Transparent, not removed: the pointer stays over the panel, so nothing on the page hovers for the shot.
      setHidden: (hidden) => {
        host.style.opacity = hidden ? '0' : '';
      },
    },
    hasReact(),
    marked,
  );

  /** Plain pointing lands on the enclosing Atoms component; deep pointing on the element itself. */
  function resolve(el: Element, deep: boolean): { el: Element; name: string } {
    const components = atomsAncestors(el);
    if (!deep) {
      for (const component of components) {
        const root = hostRoot(component);
        if (root && root.contains(el)) return { el: root, name: component.name };
      }
    }
    const own = components.find((c) => hostRoot(c) === el);
    return { el, name: own ? own.name : el.tagName.toLowerCase() };
  }

  function select(el: Element, exact = false) {
    // Lazily rendered components can bring new `--atoms-*` names with them.
    registerMarks();
    const target = exact ? { el, name: resolve(el, true).name } : resolve(el, state.deep);
    state.selected = target.el;
    state.selectedName = target.name;
    panel.show(target.el);
  }

  const inPanel = (event: Event) => event.composedPath().includes(host);
  const targetOf = (event: Event) => {
    const first = event.composedPath()[0];
    return first instanceof Element ? first : null;
  };

  function refreshHover() {
    if (!lastTarget) {
      state.hover = null;
      return;
    }
    const target = resolve(lastTarget, state.deep);
    state.hover = target.el;
    state.hoverName = target.name;
  }

  const onMove = (event: PointerEvent) => {
    state.measuring = event.altKey;
    state.deep = event.metaKey || event.ctrlKey;
    lastTarget = inPanel(event) ? null : targetOf(event);
    refreshHover();
  };

  const block = (event: Event) => {
    if (inPanel(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onClick = (event: MouseEvent) => {
    if (inPanel(event)) return;
    block(event);
    const target = targetOf(event);
    if (!target) return;
    state.deep = event.metaKey || event.ctrlKey;
    select(target);
  };

  const onKey = (event: KeyboardEvent) => {
    state.measuring = event.altKey;
    state.deep = event.metaKey || event.ctrlKey;
    refreshHover();
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.stopImmediatePropagation();
      state.selected = null;
      panel.show(null);
    }
  };

  const onLeave = () => {
    lastTarget = null;
    state.hover = null;
  };

  const blocked = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'dblclick', 'auxclick', 'contextmenu'] as const;
  window.addEventListener('pointermove', onMove, true);
  window.addEventListener('click', onClick, true);
  for (const type of blocked) window.addEventListener(type, block, true);
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKey, true);
  document.documentElement.addEventListener('pointerleave', onLeave);

  // Redraw every frame: the page scrolls, animates and re-renders under the marks.
  let frame = requestAnimationFrame(function loop() {
    if (state.selected && !state.selected.isConnected) {
      state.selected = null;
      panel.show(null);
    }
    overlay.draw(state);
    frame = requestAnimationFrame(loop);
  });

  const instance: Instance = {
    stop() {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('click', onClick, true);
      for (const type of blocked) window.removeEventListener(type, block, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      host.remove();
      delete window.__atomsInspector;
    },
  };
  return instance;
}

if (window.__atomsInspector) window.__atomsInspector.stop();
else window.__atomsInspector = start();
