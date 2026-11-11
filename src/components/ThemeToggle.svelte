<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '@/utils/i18n';
  type Theme = 'light' | 'dark';
  let theme: Theme = 'light';
  let transitionSequence = 0;
  let activeTransition: ViewTransition | null = null;
  let activeAnimation: Animation | null = null;

  function savedTheme(): Theme | null {
    try {
      const saved = localStorage.getItem('theme');
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch {
      return null;
    }
  }

  function initialTheme(): Theme {
    return savedTheme() || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function executeThemeChange(newTheme: Theme) {
    theme = newTheme;
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(newTheme);
    html.setAttribute('data-theme', newTheme);
  }

  function applyTheme(newTheme: Theme, event?: MouseEvent) {
    const sequence = ++transitionSequence;
    activeTransition?.skipTransition();
    activeAnimation?.cancel();
    activeAnimation = null;
    const html = document.documentElement;
    html.classList.remove('theme-transitioning');
    if (!document.startViewTransition || !event || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      activeTransition = null;
      executeThemeChange(newTheme);
      return;
    }
    html.classList.add('theme-transitioning');
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
    const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    try {
      let circleAnimation: Animation | null = null;
      const transition = document.startViewTransition(() => { if (sequence === transitionSequence) executeThemeChange(newTheme); });
      activeTransition = transition;
      void transition.ready.then(() => {
        if (sequence !== transitionSequence) return;
        const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
        circleAnimation = html.animate({ clipPath: newTheme === 'dark' ? [...clipPath].reverse() : clipPath }, {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: newTheme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)',
          fill: 'both'
        });
        activeAnimation = circleAnimation;
      }).catch(() => { /* A skipped transition still applies the theme. */ });
      void transition.finished.catch(() => {}).finally(() => {
        // Filled pseudo-element animations survive their snapshot tree unless cancelled.
        // Release only this transition's animation; a newer one may already be running.
        circleAnimation?.cancel();
        if (sequence === transitionSequence) {
          html.classList.remove('theme-transitioning');
          activeTransition = null;
          activeAnimation = null;
        }
      });
    } catch {
      html.classList.remove('theme-transitioning');
      executeThemeChange(newTheme);
    }
  }

  onMount(() => {
    const current = document.documentElement.getAttribute('data-theme');
    executeThemeChange(current === 'dark' || current === 'light' ? current : initialTheme());
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light');
    };
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'theme' || event.key === null) applyTheme(initialTheme());
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      ++transitionSequence;
      activeTransition?.skipTransition();
      activeAnimation?.cancel();
      activeAnimation = null;
      document.documentElement.classList.remove('theme-transitioning');
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  });

  function toggleTheme(event: MouseEvent) {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    theme = newTheme;
    try { localStorage.setItem('theme', newTheme); } catch { /* Theme switching works without storage. */ }
    applyTheme(newTheme, event);
  }
</script>

<button
  type="button"
  class="theme-toggle-container"
  on:click={toggleTheme}
  aria-label={t('common.theme.label', { current: t(`common.theme.${theme}`), target: t(`common.theme.${theme === 'dark' ? 'light' : 'dark'}`) })}
  aria-pressed={theme === "dark"}
>
  <svg class="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">
    {#if theme === 'dark'}
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    {:else}
      <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
    {/if}
  </svg>
</button>

<style>
  .theme-toggle-container {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
    border-radius: 50%;
  }

  .theme-toggle-container:hover {
    color: var(--primary-color);
    background: var(--color-theme-mix-10);
  }


  .theme-toggle-container:focus-visible {
    outline: 2px solid var(--theme-color);
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* View Transitions for Theme Toggle */
  :global(.theme-transitioning),
  :global(.theme-transitioning *) {
    transition: none !important;
  }
  :global(.theme-transitioning::view-transition-group(root)),
  :global(.theme-transitioning::view-transition-image-pair(root)),
  :global(.theme-transitioning::view-transition-old(root)),
  :global(.theme-transitioning::view-transition-new(root)) {
    animation: none !important;
    mix-blend-mode: normal !important;
  }

  :global(.theme-transitioning::view-transition-old(root)),
  :global(.theme-transitioning::view-transition-new(root)) {
    opacity: 1 !important;
    display: block !important;
  }
  :global(.theme-transitioning::view-transition-old(root)) {
    z-index: 1;
  }
  :global(.theme-transitioning::view-transition-new(root)) {
    z-index: 9999;
  }
  :global(.theme-transitioning[data-theme="dark"]::view-transition-old(root)) {
    z-index: 9999;
  }
  :global(.theme-transitioning[data-theme="dark"]::view-transition-new(root)) {
    z-index: 1;
  }
</style>
