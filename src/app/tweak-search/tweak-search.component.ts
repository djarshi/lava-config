import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { marked } from 'marked';
import { LuaViewerComponent } from '../lua-viewer/lua-viewer.component';
import tweaksData from '../configurator-data/tweaks.json';

interface TweakAuthor {
  name: string;
  role?: string;
}

interface TweakVersion {
  version: string;
  file: string;
  firstComment: string;
  lua: string;
}

interface Tweak {
  name: string;
  authors: TweakAuthor[];
  info: string;
  versions: TweakVersion[];
}

@Component({
  selector: 'app-tweak-search',
  standalone: true,
  imports: [FormsModule, LuaViewerComponent],
  template: `
    <!-- Detail view -->
    @if (selectedTweak(); as t) {
      <section class="lava-panel">
        <button type="button" class="lava-btn-ghost mb-4 !py-1 !px-2.5 text-xs" (click)="back()">
          <i class="bi bi-arrow-left"></i> Back to tweak library
        </button>

        <div class="mb-3 flex items-baseline gap-2">
          <span class="font-mono text-sm text-zinc-500 dark:text-zinc-400">{{ t.name }}</span>
          <span class="text-zinc-300 dark:text-zinc-600">·</span>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white">{{ titleOf(t) }}</h2>
        </div>

        @if (t.authors.length) {
          <div class="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
            <i class="bi bi-people-fill text-zinc-400"></i>
            @for (a of t.authors; track a.name) {
              <span class="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-0.5 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300">
                <i class="bi bi-person-fill"></i>{{ a.name }}
                @if (a.role) { <span class="text-zinc-400 dark:text-zinc-500">· {{ a.role }}</span> }
              </span>
            }
          </div>
        }

        <div class="lava-choices text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
             [innerHTML]="renderInfoBody(t.info)"></div>

        <div class="mt-5 border-t border-zinc-200 pt-3 dark:border-lava-border">
          <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Versions ({{ t.versions.length }})
          </h3>
          <ul class="space-y-1.5">
            @for (v of versionsDesc(); track v.version) {
              <li class="flex flex-wrap items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-lava-border dark:bg-[#15171a]">
                <span class="inline-flex min-w-[3rem] justify-center rounded bg-lava-orange/10 px-2 py-0.5 font-mono text-xs font-semibold text-lava-orange">{{ v.version }}</span>
                @if (isLatest(t, v)) {
                  <span class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">latest</span>
                }
                <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">{{ v.file }}</span>
                <span class="ml-auto text-[0.65rem] text-zinc-400 dark:text-zinc-500">{{ byteSize(v.lua) }} bytes</span>
                <button type="button" class="lava-btn-ghost px-2 py-0.5 text-xs" (click)="openVersionLua(t, v)">
                  <i class="bi bi-code-square"></i> View Lua
                </button>
              </li>
            }
          </ul>
        </div>
      </section>

    <!-- Listing view -->
    } @else {
      <section class="lava-panel">
        <div class="mb-4 flex items-start gap-3 rounded-md border border-lava-orange/30 bg-lava-orange/5 p-3 text-sm text-zinc-700 dark:text-zinc-300">
          <i class="bi bi-info-circle-fill text-lava-orange mt-0.5 flex-shrink-0"></i>
          <p class="m-0 leading-relaxed">
            This library lists the stable, widely-used tweaks. Many more can be found by joining the
            Lavabar or <a class="font-semibold text-lava-orange hover:underline" href="https://discord.gg/beyondallreason" target="_blank" rel="noopener">Beyond All Reason</a>
            Discord communities. Things change a lot, and since this site is a front-end-only SPA, you don't want to download a whole database of every tweak.
          </p>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
            <i class="bi bi-search text-lava-orange"></i> Tweak library
          </h2>
          <div class="relative w-full sm:w-80">
            <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
            <input type="search"
                   class="w-full rounded-md border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-lava-orange focus:outline-none dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-100"
                   placeholder="Search tweaks, authors, descriptions…"
                   [ngModel]="query()" (ngModelChange)="query.set($event)" aria-label="Search tweaks" />
          </div>
        </div>

        <p class="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          Showing {{ filtered().length }} of {{ tweaks.length }} tweaks — click a row for details.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-zinc-300 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-lava-border dark:text-zinc-400">
                <th class="py-2 pr-4">Tweak</th>
                <th class="py-2 pr-4">Developer</th>
                <th class="py-2 pr-4">Description</th>
                <th class="py-2 pr-2 text-right">Version</th>
              </tr>
            </thead>
            <tbody>
              @for (t of filtered(); track t.name) {
                <tr class="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-lava-orange/5 dark:border-lava-border/40 dark:hover:bg-lava-orange/10"
                    (click)="goToDetail(t.name)"
                    (keydown.enter)="goToDetail(t.name)"
                    (keydown.space)="goToDetail(t.name); $event.preventDefault()"
                    tabindex="0">
                  <td class="py-2 pr-4">
                    <div class="font-medium text-zinc-900 dark:text-white">{{ titleOf(t) }}</div>
                    <div class="font-mono text-xs text-zinc-400 dark:text-zinc-500">{{ t.name }}</div>
                  </td>
                  <td class="py-2 pr-4 whitespace-nowrap text-zinc-600 dark:text-zinc-300">{{ developers(t) }}</td>
                  <td class="max-w-md py-2 pr-4">
                    <span class="line-clamp-2 text-zinc-500 dark:text-zinc-400">{{ summary(t.info) }}</span>
                  </td>
                  <td class="py-2 pr-2 text-right whitespace-nowrap">
                    <span class="inline-block rounded bg-lava-orange/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-lava-orange">{{ latestVersion(t) }}</span>
                    @if (t.versions.length > 1) {
                      <span class="ml-1 inline-block rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300" title="{{ t.versions.length - 1 }} more version(s)">+{{ t.versions.length - 1 }}</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No tweaks match “{{ query() }}”.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }

    <!-- Shared Lua source viewer -->
    <app-lua-viewer
      [open]="viewerOpen()"
      [name]="viewerName()"
      [title]="viewerTitle()"
      [lua]="viewerLua()"
      (close)="closeViewer()" />
  `,
  styles: [],
})
export class TweakSearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  private readonly all = tweaksData.tweaks as unknown as Tweak[];

  readonly tweaks: Tweak[] = this.all.map((t) => ({
    name: t.name,
    authors: t.authors ?? [],
    info: t.info ?? '',
    versions: (t.versions ?? []).map((v) => ({
      version: v.version,
      file: v.file,
      firstComment: v.firstComment,
      lua: v.lua ?? '',
    })),
  }));

  /** precomputed lowercase searchable blob per tweak, plus the tweak reference */
  private readonly searchable = this.tweaks.map((t) => ({
    tweak: t,
    blob: (
      t.name + ' ' +
      t.versions.map((v) => v.firstComment + ' ' + v.file).join(' ') + ' ' +
      t.authors.map((a) => a.name + ' ' + (a.role ?? '')).join(' ') + ' ' +
      t.info
    ).toLowerCase(),
  }));

  readonly query = signal('');
  readonly selected = signal<string | null>(null);

  // lua viewer state
  readonly viewerOpen = signal(false);
  readonly viewerName = signal('');
  readonly viewerTitle = signal('');
  readonly viewerLua = signal('');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.tweaks;
    return this.searchable.filter((s) => s.blob.includes(q)).map((s) => s.tweak);
  });

  readonly selectedTweak = computed<Tweak | null>(() => {
    const name = this.selected();
    return name ? this.tweaks.find((t) => t.name === name) ?? null : null;
  });

  /** Versions of the selected tweak, newest first (build stores them ascending). */
  readonly versionsDesc = computed<TweakVersion[]>(() => {
    const t = this.selectedTweak();
    return t ? [...t.versions].reverse() : [];
  });

  constructor() {
    // Drive the detail view from the :name route param so the browser
    // back/forward buttons work naturally.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((pm) => {
      const name = pm.get('name');
      this.selected.set(name);
      const t = name ? this.tweaks.find((x) => x.name === name) : null;
      this.title.setTitle(
        t ? `${this.titleOf(t)} — Lava configurator` : 'Tweak library — Lava configurator',
      );
    });
  }

  goToDetail(name: string): void {
    this.router.navigate(['/tweaks', name]);
  }

  back(): void {
    this.router.navigate(['/tweaks']);
  }

  // ---- Lua viewer ----

  openVersionLua(t: Tweak, v: TweakVersion): void {
    this.viewerName.set(t.name);
    this.viewerTitle.set(`${this.titleOf(t)} — v${v.version}`);
    this.viewerLua.set(v.lua);
    this.viewerOpen.set(true);
  }

  closeViewer(): void {
    this.viewerOpen.set(false);
  }

  // ---- helpers ----

  titleOf(t: Tweak): string {
    const fc = t.versions.at(-1)?.firstComment ?? '';
    return fc.replace(/^--\s*/, '') || t.name;
  }

  isLatest(t: Tweak, v: TweakVersion): boolean {
    return t.versions.at(-1) === v;
  }

  byteSize(lua: string): string {
    return new TextEncoder().encode(lua).length.toLocaleString();
  }

  /** Only developer authors, joined by comma — for the compact listing. */
  developers(t: Tweak): string {
    const devs = t.authors.filter((a) => (a.role ?? '').toLowerCase() === 'developer');
    const list = devs.length ? devs : t.authors;
    return list.map((a) => a.name).join(', ') || '—';
  }

  latestVersion(t: Tweak): string {
    return t.versions.at(-1)?.version ?? '—';
  }

  /** Short plain-text blurb from the info markdown (H1 title stripped, truncated). */
  summary(info: string): string {
    const lines = info.split('\n');
    const body: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (body.length) break;
        continue;
      }
      if (trimmed.startsWith('#')) continue; // skip headings
      body.push(trimmed);
      if (body.join(' ').length > 140) break;
    }
    let s = body.join(' ');
    s = s
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
      .replace(/[`*_#~]/g, '')                 // emphasis / code markers
      .replace(/\s+/g, ' ')
      .trim();
    if (s.length > 120) s = s.slice(0, 117) + '…';
    return s || '(no description)';
  }

  /** Render the info markdown as HTML, dropping a leading "# Title" heading
   *  (the title is already shown in the detail header). */
  renderInfoBody(info: string): string {
    const stripped = info.replace(/^\s*#[^\n]*\n+/, '');
    return marked.parse(stripped) as string;
  }
}