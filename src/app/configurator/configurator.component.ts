import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreditsService, CreditItem } from '../credits.service';
import { LuaCodecService } from './lua-codec.service';
import { LuaViewerComponent } from '../lua-viewer/lua-viewer.component';
import { marked } from 'marked';
import categoriesData from '../configurator-data/categories.json';
import tweaksData from '../configurator-data/tweaks.json';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownConfig {
  key: string;
  title: string;
  column: 'left' | 'right';
  options: DropdownOption[];
  selected: string;
}

interface UsedTweakRow {
  name: string;
  title: string;
  labels: string[];
}

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [FormsModule, RouterLink, LuaViewerComponent],
  template: `
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Left column dropdowns -->
      <section class="lava-panel">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Core settings</h2>
        <div class="space-y-2.5">
          @for (cfg of leftDropdowns(); track cfg.key) {
            <div class="flex items-stretch gap-0">
              <label class="inline-flex w-40 flex-shrink-0 items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-lava-border dark:bg-zinc-800 dark:text-zinc-300"
                     [for]="'select-' + cfg.key">{{ cfg.title }}</label>
              <select class="min-w-0 flex-1 border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-lava-orange focus:outline-none dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-100"
                      [id]="'select-' + cfg.key"
                      [(ngModel)]="cfg.selected" (ngModelChange)="regenerate()">
                @for (opt of cfg.options; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
              <button type="button"
                      class="inline-flex items-center justify-center rounded-r-md border border-l-0 border-zinc-300 bg-white px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:border-lava-border dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      (click)="openHelp(cfg)" title="What is this?">
                <i class="bi bi-question-lg"></i>
              </button>
            </div>
          }
        </div>
      </section>

      <!-- Right column dropdowns -->
      <section class="lava-panel">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Units &amp; combat</h2>
        <div class="space-y-2.5">
          @for (cfg of rightDropdowns(); track cfg.key) {
            <div class="flex items-stretch gap-0">
              <label class="inline-flex w-40 flex-shrink-0 items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-lava-border dark:bg-zinc-800 dark:text-zinc-300"
                     [for]="'select-' + cfg.key">{{ cfg.title }}</label>
              <select class="min-w-0 flex-1 border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 focus:border-lava-orange focus:outline-none dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-100"
                      [id]="'select-' + cfg.key"
                      [(ngModel)]="cfg.selected" (ngModelChange)="regenerate()">
                @for (opt of cfg.options; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
              <button type="button"
                      class="inline-flex items-center justify-center rounded-r-md border border-l-0 border-zinc-300 bg-white px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:border-lava-border dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      (click)="openHelp(cfg)" title="What is this?">
                <i class="bi bi-question-lg"></i>
              </button>
            </div>
          }
        </div>
      </section>
    </div>

    <!-- Output -->
    <section class="lava-panel mt-4">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
          <i class="bi bi-terminal text-lava-orange"></i> Output
        </h3>
      </div>
      <div class="mb-2 flex flex-wrap gap-2">
        <button class="lava-btn" (click)="copyOutput()">
          <i class="bi bi-clipboard2-check"></i> Copy
        </button>
        <button class="lava-btn-outline" (click)="downloadOutput()">
          <i class="bi bi-download"></i> Download
        </button>
        <button class="lava-btn-ghost" (click)="resetOutput()">
          <i class="bi bi-arrow-counterclockwise"></i> Reset
        </button>
      </div>
      <textarea class="command-output" rows="12" [(ngModel)]="output" readonly></textarea>

      <!-- Used tweaks listing -->
      @if (usedTweakRows().length) {
        <div class="mt-4">
          <h4 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <i class="bi bi-puzzle-fill text-lava-orange"></i> Used tweaks
          </h4>
          <ul class="space-y-1">
            @for (t of usedTweakRows(); track t.name) {
              <li class="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-lava-border dark:bg-[#15171a]">
                <span class="flex min-w-0 items-baseline gap-2">
                  <span class="font-mono text-xs text-zinc-500 dark:text-zinc-400">{{ t.name }}</span>
                  <span class="text-zinc-300 dark:text-zinc-600">·</span>
                  <span class="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ t.title }}</span>
                </span>
                <span class="flex shrink-0 items-center gap-1.5">
                  @for (label of t.labels; track label) {
                    <span class="font-mono text-[10px] rounded px-1.5 py-0.5 bg-zinc-200/70 text-zinc-600 dark:bg-[#25272a] dark:text-zinc-300" title="Output line: !bset {{ label }}">{{ label }}</span>
                  }
                  <button type="button" class="lava-btn-ghost px-2 py-0.5 text-xs"
                          (click)="openLuaView(t.name)" title="View Lua source">
                    <i class="bi bi-code-square"></i> View
                  </button>
                  <button type="button" class="lava-btn-ghost px-2 py-0.5 text-xs"
                          (click)="copyBase64(t.name)" title="Copy minified base64">
                    <i class="bi bi-clipboard2"></i> b64
                  </button>
                </span>
              </li>
            }
          </ul>
          <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Looking for a specific tweak?
            <a routerLink="/tweaks" class="ml-1 align-baseline font-medium text-lava-orange hover:underline">
              Browse the full tweak library <i class="bi bi-arrow-right"></i>
            </a>
          </p>
        </div>
      }
    </section>

    <!-- What is Lava -->
    <section class="lava-panel mt-4">
      <h3 class="mb-2 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
        <i class="bi bi-info-circle text-lava-orange"></i> So what is Lava?
      </h3>
      <p class="mb-0 text-sm text-zinc-600 dark:text-zinc-400">
        This a playstyle on maps which often have a sort of pinch-point with surrounding sea's.
        This allows for a lot/bit more economy, longer buildup time and more units to throw at eachother without ships.
      </p>
    </section>

    <!-- Other playmodes -->
    <section class="lava-panel mt-4">
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Other non lava playmodes</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <a class="link-card" href="https://docs.google.com/spreadsheets/d/1ozK0eU2OXPlmW29MfRrRFSC17pZocOoTJ5X-xpCZ2dk/edit">
          <div class="mb-1 flex items-center gap-2">
            <i class="bi bi-rocket-takeoff text-2xl text-lava-orange"></i>
            <span class="font-bold text-zinc-900 dark:text-white">Space expansion</span>
          </div>
          <span class="text-sm text-zinc-500 dark:text-zinc-400">More eco and things that fly/hover in air</span>
        </a>
        <a class="link-card" href="https://docs.google.com/spreadsheets/d/1lyjJ8bWipWoxlI7CB3sKUrK8l5ZsSSWG6OQzoXsYuC8">
          <div class="mb-1 flex items-center gap-2">
            <i class="bi bi-flag-fill text-2xl text-lava-orange"></i>
            <span class="font-bold text-zinc-900 dark:text-white">Commander Clash</span>
          </div>
          <span class="text-sm text-zinc-500 dark:text-zinc-400">Commander-evolution T1 spam gamemode</span>
        </a>
        <a class="link-card" href="https://rcorex.github.io/nuttyb-config/">
          <div class="mb-1 flex items-center gap-2">
            <i class="bi bi-gear-wide-connected text-2xl text-lava-orange"></i>
            <span class="font-bold text-zinc-900 dark:text-white">NuttyB</span>
          </div>
          <span class="text-sm text-zinc-500 dark:text-zinc-400">Configurator for NuttyB lobbies</span>
        </a>
      </div>
    </section>

    <!-- Subtle rotating thank-you -->
    <p class="mt-6 text-center text-xs italic text-zinc-500 transition-opacity duration-700 dark:text-zinc-400"
       [class.opacity-0]="thanksFaded()">
      @if (thanksItem(); as t) {
        Thanks to <span class="font-medium text-zinc-700 dark:text-zinc-200">{{ t.name }}</span>
        @if (t.role) { <span class="text-zinc-400 dark:text-zinc-500">· {{ t.role }}</span> }
      } @else {
        &nbsp;
      }
    </p>

    <!-- Help dialog: rendered choices markdown -->
    @if (helpOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
           (click)="closeHelp()">
        <div class="lava-panel flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-lava-border">
            <h3 class="text-base font-semibold text-zinc-900 dark:text-white">{{ helpTitle() }}</h3>
            <button type="button"
                    class="inline-flex items-center justify-center rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                    (click)="closeHelp()" title="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="lava-choices overflow-y-auto px-4 py-3" [innerHTML]="helpHtml()" (click)="onChoicesClick($event)"></div>
        </div>
      </div>
    }

    <!-- Lua source viewer (shared component) -->
    <app-lua-viewer
      [open]="luaOpen()"
      [name]="luaName()"
      [title]="luaTitle()"
      [lua]="luaSource()"
      (close)="closeLuaView()" />
  `,
  styles: [],
})
export class ConfiguratorComponent implements OnInit, OnDestroy {
  private readonly credits = inject(CreditsService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly thanksItem = signal<CreditItem | null>(null);
  readonly thanksFaded = signal(false);

  // help dialog state
  readonly helpOpen = signal(false);
  readonly helpTitle = signal('');
  readonly helpHtml = signal('');

  // used tweaks listing
  readonly usedTweakRows = signal<UsedTweakRow[]>([]);

  // lua viewer state
  readonly luaOpen = signal(false);
  readonly luaName = signal('');
  readonly luaTitle = signal('');
  readonly luaSource = signal('');

  /** category folder name -> raw choices markdown */
  private readonly choicesByCategory = new Map<string, string>(
    categoriesData.categories.map((c) => [c.name, c.choices as string]),
  );
  /** category folder name -> title */
  private readonly titleByCategory = new Map<string, string>(
    categoriesData.categories.map((c) => [c.name, c.title as string]),
  );
  /** category name -> slug -> parsed option (effectLines, tweakRefs, ...) */
  private readonly optionByCategory = new Map<string, Map<string, (typeof categoriesData.categories)[number]['options'][number]>>(
    categoriesData.categories.map((c) => [c.name, new Map(c.options.map((o) => [o.slug, o]))]),
  );
  /** tweak name -> raw lua of its latest version */
  private readonly luaByTweak = new Map<string, string>(
    tweaksData.tweaks.map((t) => [t.name, t.versions[t.versions.length - 1].lua as string]),
  );
  /** tweak name -> first `--` comment header of its latest version */
  private readonly firstCommentByTweak = new Map<string, string>(
    tweaksData.tweaks.map((t) => [t.name, (t.versions[t.versions.length - 1].firstComment as string) ?? t.name]),
  );
  private readonly codec = inject(LuaCodecService);

  configs: DropdownConfig[] = categoriesData.categories.map((c) => ({
    key: c.name,
    title: c.title,
    column: c.column as 'left' | 'right',
    selected: c.options[0]?.slug ?? '',
    options: c.options.map((o) => ({ value: o.slug, label: o.title })),
  }));

  output = '';

  leftDropdowns(): DropdownConfig[] {
    return this.configs.filter((c) => c.column === 'left');
  }

  rightDropdowns(): DropdownConfig[] {
    return this.configs.filter((c) => c.column === 'right');
  }

  constructor() {
    this.regenerate();
  }

  ngOnInit(): void {
    this.credits.load().then(() => this.pickThanks());
    this.intervalId = setInterval(() => this.rotateThanks(), 10000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private pickThanks(): void {
    const items = this.credits.allItems();
    if (items.length === 0) return;
    const current = this.thanksItem();
    let next = items[Math.floor(Math.random() * items.length)];
    // avoid repeating the same one back-to-back if possible
    if (items.length > 1) {
      while (next === current) {
        next = items[Math.floor(Math.random() * items.length)];
      }
    }
    this.thanksItem.set(next);
  }

  private rotateThanks(): void {
    // fade out, swap text while invisible, fade back in
    this.thanksFaded.set(true);
    setTimeout(() => {
      this.pickThanks();
      this.thanksFaded.set(false);
    }, 700);
  }

  regenerate(): void {
    let tweakDefNr = 0;
    let tweakUnitNr = 0;
    const tweakLines: string[] = [];
    const setLines = new Set<string>();
    const used = new Set<string>();
    const usedOrder: string[] = [];
    // tweak name -> output labels it received (e.g. ['tweakdefs','tweakunits1'])
    const labelsByTweak = new Map<string, string[]>();
    const pushLabel = (name: string, label: string): void => {
      const arr = labelsByTweak.get(name);
      if (arr) arr.push(label); else labelsByTweak.set(name, [label]);
    };

    try {
      for (const cfg of this.configs) {
        const opt = this.optionByCategory.get(cfg.key)?.get(cfg.selected);
        if (!opt) continue;
        for (const raw of (opt.effectLines as string[]) ?? []) {
          const line = raw.trim();
          if (!line) continue;
          if (line.startsWith('@tweakdefs ')) {
            const name = line.slice('@tweakdefs '.length).trim();
            const label = `tweakdefs${tweakDefNr === 0 ? '' : tweakDefNr}`;
            tweakLines.push(`!bset ${label} ${this.encodeTweak(name)}`);
            pushLabel(name, label);
            tweakDefNr++;
            if (!used.has(name)) { used.add(name); usedOrder.push(name); }
          } else if (line.startsWith('@tweakunits ')) {
            const name = line.slice('@tweakunits '.length).trim();
            const label = `tweakunits${tweakUnitNr === 0 ? '' : tweakUnitNr}`;
            tweakLines.push(`!bset ${label} ${this.encodeTweak(name)}`);
            pushLabel(name, label);
            tweakUnitNr++;
            if (!used.has(name)) { used.add(name); usedOrder.push(name); }
          } else {
            setLines.add(raw);
          }
        }
      }
      this.output = [...setLines, ...[''], ...tweakLines].join('\n').replace(/(\r?\n){3,}/g, '\n\n').trim();
      this.usedTweakRows.set(usedOrder.map((n) => ({
        name: n,
        title: this.firstCommentByTweak.get(n) ?? n,
        labels: labelsByTweak.get(n) ?? [],
      })));
    } catch (e) {
      this.output = `# error: ${(e as Error).message}`;
      this.usedTweakRows.set([]);
    }
  }

  private encodeTweak(name: string): string {
    const lua = this.luaByTweak.get(name);
    if (!lua) throw new Error(`tweak "${name}" not found in tweaks.json`);
    return this.codec.encode(lua);
  }

  openHelp(cfg: DropdownConfig): void {
    const md = this.choicesByCategory.get(cfg.key);
    if (!md) {
      alert(`${cfg.title}\n\nNo choices info available for "${cfg.key}".`);
      return;
    }
    this.helpTitle.set(this.titleByCategory.get(cfg.key) ?? cfg.title);
    this.helpHtml.set(this.addCollapsible(marked.parse(md) as string));
    this.helpOpen.set(true);
  }

  closeHelp(): void {
    this.helpOpen.set(false);
  }

  /** Wrap each <pre> in a collapsible container with a Show more / Show less toggle. */
  private addCollapsible(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    for (const pre of Array.from(doc.querySelectorAll('pre'))) {
      const wrap = doc.createElement('div');
      wrap.className = 'lava-code-wrap';
      const btn = doc.createElement('a');
      btn.className = 'lava-code-toggle';
      btn.textContent = 'Show more ▾';
      pre.parentNode?.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      wrap.appendChild(btn);
    }
    return doc.body.innerHTML;
  }

  onChoicesClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains('lava-code-toggle')) {
      const wrap = target.parentElement;
      if (!wrap) return;
      const expanded = wrap.classList.toggle('expanded');
      target.textContent = expanded ? 'Show less ▴' : 'Show more ▾';
    }
  }

  // ---- Lua source viewer ----

  openLuaView(name: string): void {
    const lua = this.luaByTweak.get(name);
    if (!lua) return;
    this.luaName.set(name);
    this.luaTitle.set(this.firstCommentByTweak.get(name) ?? name);
    this.luaSource.set(lua);
    this.luaOpen.set(true);
  }

  closeLuaView(): void {
    this.luaOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.helpOpen()) this.closeHelp();
  }

  private async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement('textarea');
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
  }

  async copyOutput(): Promise<void> {
    await this.copyText(this.output);
  }

  async copyBase64(name: string): Promise<void> {
    const lua = this.luaByTweak.get(name);
    if (!lua) return;
    let b64: string;
    try {
      b64 = this.codec.encode(lua);
    } catch (e) {
      alert(`Could not encode "${name}": ${(e as Error).message}`);
      return;
    }
    await this.copyText(b64);
  }

  downloadOutput(): void {
    const blob = new Blob([this.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lava-config.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  resetOutput(): void {
    for (const cfg of this.configs) {
      cfg.selected = cfg.options[0].value;
    }
    this.regenerate();
  }
}