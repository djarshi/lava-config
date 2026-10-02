import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';

interface TabDef {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-40 border-b border-lava-orange/40 bg-white/90 backdrop-blur dark:bg-[#111315]/90"
    >
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <!-- Brand -->
        <a routerLink="/configurator" class="flex flex-shrink-0 items-center gap-2 text-zinc-900 dark:text-white">
          <img class="h-9 w-9 rounded-lg ring-2 ring-lava-orange/40" src="img/bar-logo.png"
               width="36" height="36" alt="Lava configurator logo">
          <span class="text-lg font-bold tracking-wide">
            Lava <span class="text-lava-orange">configurator</span>
          </span>
        </a>

        <!-- Desktop tabs (inline, pushed right) -->
        <nav class="ml-auto hidden items-center gap-1 md:flex">
          @for (t of tabs; track t.path) {
            <a
              class="lava-tabs-link"
              [routerLink]="t.path"
              routerLinkActive="active"
            >
              <i class="bi me-1" [class]="t.icon"></i>{{ t.label }}
            </a>
          }

          <!-- Theme toggle -->
          <button
            class="lava-tabs-link ml-2"
            (click)="theme.toggle()"
            [attr.title]="theme.theme() === 'dark' ? 'Switch to light' : 'Switch to dark'"
          >
            <i class="bi"
               [class.bi-sun-fill]="theme.theme() === 'dark'"
               [class.bi-moon-stars-fill]="theme.theme() === 'light'"></i>
          </button>
        </nav>

        <!-- Mobile hamburger -->
        <button
          class="ml-auto rounded-md p-2 text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/5 md:hidden"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle menu"
        >
          <i class="bi text-xl" [class.bi-list]="!menuOpen()" [class.bi-x-lg]="menuOpen()"></i>
        </button>
      </div>

      <!-- Lavabalance hint strip -->
      @if (lavabalanceHint()) {
        <div class="border-t border-lava-orange/20 bg-lava-orange/5">
          <div class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <i class="bi bi-info-circle-fill text-lava-orange flex-shrink-0"></i>
            <span class="min-w-0">
              Looking for the
              <a class="font-semibold text-lava-orange hover:underline" href="https://lavabalance.fogofwar.dev" target="_blank" rel="noopener">Lavabalance tool &amp; lobby info</a>
              (by huk)? Laid-back mass-army clashes — no sweaty laddering.
            </span>
            <button type="button" class="ml-auto flex-shrink-0 rounded p-1 text-zinc-400 hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-100" (click)="dismissLavabalanceHint()" aria-label="Dismiss hint">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      }

      <!-- Mobile dropdown menu -->
      @if (menuOpen()) {
        <nav class="border-t border-zinc-200 bg-white px-4 py-2 dark:border-lava-border dark:bg-[#111315] md:hidden">
          @for (t of tabs; track t.path) {
            <a
              class="nav-link"
              [routerLink]="t.path"
              routerLinkActive="active"
              (click)="menuOpen.set(false)"
            >
              <i class="bi" [class]="t.icon"></i>{{ t.label }}
            </a>
          }
          <button
            class="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200"
            (click)="theme.toggle()"
          >
            <i class="bi"
               [class.bi-sun-fill]="theme.theme() === 'dark'"
               [class.bi-moon-stars-fill]="theme.theme() === 'light'"></i>
            {{ theme.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}
          </button>
        </nav>
      }
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-outlet />
    </main>
  `,
  styles: [],
})
export class AppComponent {
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);
  readonly lavabalanceHint = signal(true);

  dismissLavabalanceHint(): void {
    this.lavabalanceHint.set(false);
  }

  readonly tabs: TabDef[] = [
    { path: '/configurator', label: 'Configurator', icon: 'bi-sliders2-vertical' },
    { path: '/tweaks', label: 'Tweak search', icon: 'bi-search' },
    { path: '/links', label: 'Links', icon: 'bi-link-45deg' },
    { path: '/about', label: 'About & Credits', icon: 'bi-info-circle' },
  ];
}