import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'lava-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    // Ensure the DOM matches the stored signal, in case the inline boot
    // script in index.html didn't run (idempotent, no flash).
    this.apply(this.theme());
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }

  private apply(theme: Theme): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  private initial(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      /* ignore */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}