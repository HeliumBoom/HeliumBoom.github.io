type Theme = "light" | "dark";
let sequence = 0;
let activeTransition: ViewTransition | null = null;
let activeAnimation: Animation | null = null;
let activeOriginProbe: HTMLElement | null = null;
let requestedTheme: Theme | null = null;

function savedTheme(): Theme | null {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : null;
  } catch { return null; }
}
function getInitialTheme(): Theme {
  return savedTheme() || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
export function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
function commitTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.setAttribute("data-theme", theme);
  window.dispatchEvent(new Event("kanade:theme"));
}

export function cancelThemeTransition() {
  ++sequence;
  activeTransition?.skipTransition();
  activeAnimation?.cancel();
  activeOriginProbe?.remove();
  activeTransition = null;
  activeAnimation = null;
  activeOriginProbe = null;
  requestedTheme = null;
  document.documentElement.classList.remove("theme-transitioning");
}

/** Preserve Pudding's circular reveal, with explicit cleanup of filled snapshots. */
export function applyTheme(theme: Theme, event?: MouseEvent) {
  cancelThemeTransition();
  const currentSequence = sequence;
  requestedTheme = theme;
  const html = document.documentElement;
  if (!document.startViewTransition || !event || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    commitTheme(theme);
    requestedTheme = null;
    return;
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const keyboard = event.detail === 0 && !(event as PointerEvent).pointerType;
  const clientX = keyboard ? rect.left + rect.width / 2 : event.clientX;
  const clientY = keyboard ? rect.top + rect.height / 2 : event.clientY;
  html.classList.add("theme-transitioning");
  let circle: Animation | null = null;
  let originProbe: HTMLElement | null = null;
  try {
    // A fixed, transparent pixel lets the browser map viewport (0, 0) into
    // snapshot coordinates, including mobile browser chrome and viewport offsets.
    originProbe = document.createElement("span");
    originProbe.setAttribute("aria-hidden", "true");
    originProbe.setAttribute("data-theme-origin", "");
    originProbe.style.cssText = "position: fixed; left: 0; top: 0; width: 1px; height: 1px; pointer-events: none; view-transition-name: theme-origin;";
    document.body.append(originProbe);
    activeOriginProbe = originProbe;
    const transition = document.startViewTransition(() => {
      if (currentSequence === sequence) commitTheme(theme);
    });
    activeTransition = transition;
    void transition.ready.then(() => {
      if (currentSequence !== sequence) return;
      // Read after capture: clientX/Y and snapshot pixels have different origins
      // on mobile. Do not guess an address-bar height or add page scroll offsets.
      const origin = new DOMMatrix(window.getComputedStyle(html, "::view-transition-group(theme-origin)").transform);
      const rootStyle = window.getComputedStyle(html, "::view-transition-group(root)");
      const root = new DOMMatrix(rootStyle.transform);
      const x = clientX + origin.e - root.e;
      const y = clientY + origin.f - root.f;
      const width = parseFloat(rootStyle.width) || window.innerWidth;
      const height = parseFloat(rootStyle.height) || window.innerHeight;
      const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
      circle = html.animate({ clipPath: theme === "dark" ? [...clipPath].reverse() : clipPath }, {
        duration: 500, easing: "ease-in-out", fill: "both",
        pseudoElement: theme === "dark" ? "::view-transition-old(root)" : "::view-transition-new(root)",
      });
      activeAnimation = circle;
    }).catch(() => { /* Skipped transitions still commit the latest theme. */ });
    void transition.finished.catch(() => {}).finally(() => {
      // An older completion must never cancel a newer circle.
      circle?.cancel();
      originProbe?.remove();
      if (currentSequence === sequence) {
        activeTransition = null;
        activeAnimation = null;
        activeOriginProbe = null;
        requestedTheme = null;
        html.classList.remove("theme-transitioning");
      }
    });
  } catch {
    originProbe?.remove();
    activeOriginProbe = null;
    html.classList.remove("theme-transitioning");
    activeTransition = null;
    requestedTheme = null;
    commitTheme(theme);
  }
}

export function initTheme(): Theme {
  const theme = getInitialTheme();
  applyTheme(theme);
  return theme;
}
export function toggleTheme(event?: MouseEvent): Theme {
  const theme = (requestedTheme || getCurrentTheme()) === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", theme); } catch { /* Switching works without storage. */ }
  applyTheme(theme, event);
  return theme;
}

export function watchTheme(onChange: (theme: Theme) => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => onChange(getCurrentTheme());
  const storage = (event: StorageEvent) => {
    if (event.key === "theme" || event.key === null) applyTheme(getInitialTheme());
  };
  const system = () => { if (!savedTheme()) applyTheme(getInitialTheme()); };
  window.addEventListener("kanade:theme", sync);
  window.addEventListener("storage", storage);
  media.addEventListener("change", system);
  return () => {
    window.removeEventListener("kanade:theme", sync);
    window.removeEventListener("storage", storage);
    media.removeEventListener("change", system);
    cancelThemeTransition();
  };
}
