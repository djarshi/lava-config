import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { LuaCodecService } from '../configurator/lua-codec.service';
import { LuaViewerComponent } from '../lua-viewer/lua-viewer.component';
import { ReplayApiService, ReplayDetail } from './replay-api.service';
import { TweakMatcherService, TweakMatch } from './tweak-matcher.service';

/**
 * Detail page for a single replay. Decodes every non-empty tweakdefs[N] /
 * tweakunits[N] slot from the replay's gameSettings and classifies each
 * against the configurator's tweak library:
 *
 *   🟢 Library (exact version)  — slot's firstComment matches a shipped version
 *   🟡 Library (version differs) — same tweak name, replay uses another version
 *   🔵 Other / map tweak         — not in our library (BAR built-in / community)
 */

type SlotKind = 'tweakdefs' | 'tweakunits';

interface Slot {
  kind: SlotKind;
  key: string;        // "tweakdefs" | "tweakdefs1" | "tweakunits2" …
  index: number;      // 0 for the unnumbered slot, N otherwise
  b64: string;
  lua: string;        // decoded Lua
  firstComment: string;
  chars: number;
  match: TweakMatch;
}

interface DetailState {
  loading: boolean;
  error: string;
  replay: ReplayDetail | null;
}

@Component({
  selector: 'app-replay-detail',
  standalone: true,
  imports: [RouterLink, LuaViewerComponent],
  template: `
    <section class="lava-panel">
      <a routerLink="/replays" class="lava-btn-ghost mb-4 inline-flex !py-1 !px-2.5 text-xs">
        <i class="bi bi-arrow-left"></i> Back to replays
      </a>

      @if (state().loading) {
        <p class="text-sm text-zinc-500 dark:text-zinc-400"><i class="bi bi-arrow-clockwise"></i> Loading replay…</p>
      }

      @if (state().error) {
        <div class="rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ state().error }}
        </div>
      }

      @if (state().replay; as r) {
        @let summary = slotsSummary();
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-lava-border">
          <div>
            <h2 class="text-xl font-bold text-zinc-900 dark:text-white">{{ r.Map.scriptName }}</h2>
            <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {{ formatDate(r.startTime) }} · {{ formatDuration(r.durationMs) }}
              · {{ totalPlayers(r) }} players
              @if (r.gameEndedNormally) { · finished }
            </p>
            <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              <a class="hover:underline" [href]="'https://www.beyondallreason.info/replays?gameId=' + r.id" target="_blank" rel="noopener">
                <i class="bi bi-box-arrow-up-right"></i> View on beyondallreason.info
              </a>
            </p>
          </div>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="rounded bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
              {{ summary.exact }} library exact
            </span>
            <span class="rounded bg-amber-500/15 px-2 py-1 font-semibold text-amber-600 dark:text-amber-400">
              {{ summary.versionDiff }} version diff
            </span>
            <span class="rounded bg-zinc-500/15 px-2 py-1 font-semibold text-zinc-600 dark:text-zinc-300">
              {{ summary.unknown }} other
            </span>
          </div>
        </div>

        <!-- Teams -->
        <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          @for (t of r.AllyTeams; track $index) {
            <div class="rounded-md border border-zinc-200 p-3 dark:border-lava-border">
              <div class="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Team {{ $index + 1 }}
                @if (t.winningTeam) {
                  <span class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">won 🏆</span>
                }
              </div>
              <div class="flex flex-wrap gap-1.5 text-xs">
                @for (p of t.Players; track p.name) {
                  <span class="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:bg-[#15171a] dark:text-zinc-300">{{ p.name }}</span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Tweak slots -->
        <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
          <i class="bi bi-puzzle text-lava-orange"></i> Tweak slots
          <span class="text-xs font-normal text-zinc-400 dark:text-zinc-500">({{ slots().length }})</span>
        </h3>

        @if (!slots().length) {
          <p class="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-500 dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-400">
            This replay has no tweakdefs/tweakunits — it was played with stock BAR settings.
          </p>
        } @else {
          <ul class="space-y-2">
            @for (s of slots(); track s.key) {
              <li class="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-lava-border dark:bg-[#15171a]">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="inline-flex min-w-[5.5rem] justify-center rounded bg-lava-orange/10 px-2 py-0.5 font-mono text-xs font-semibold text-lava-orange">
                    {{ s.kind }}[{{ s.index }}]
                  </span>
                  @switch (s.match.status) {
                    @case ('exact') {
                      <span class="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        <i class="bi bi-check-circle-fill"></i> library
                      </span>
                    }
                    @case ('version-diff') {
                      <span class="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        <i class="bi bi-arrow-repeat"></i> library · other version
                      </span>
                    }
                    @default {
                      <span class="inline-flex items-center gap-1 rounded bg-zinc-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                        <i class="bi bi-question-circle-fill"></i> other / map tweak
                      </span>
                    }
                  }
                  <span class="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-200" [title]="s.firstComment">
                    {{ s.firstComment || '(no comment)' }}
                  </span>
                  <span class="text-[0.65rem] text-zinc-400 dark:text-zinc-500">{{ s.chars.toLocaleString() }} chars</span>
                  <button type="button" class="lava-btn-ghost px-2 py-0.5 text-xs" (click)="openLua(s)">
                    <i class="bi bi-code-square"></i> Lua
                  </button>
                </div>

                @if (s.match.status !== 'unknown' && s.match.name) {
                  <div class="mt-1.5 flex flex-wrap items-center gap-2 pl-1 text-xs">
                    <a class="font-semibold text-lava-orange hover:underline" [routerLink]="['/tweaks', s.match.name]">
                      <i class="bi bi-box-arrow-up-right"></i> {{ s.match.name }}
                    </a>
                    @if (s.match.status === 'exact') {
                      <span class="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        v{{ s.match.libraryVersion }}
                      </span>
                    } @else {
                      @if (s.match.replayVersion) {
                        <span class="text-zinc-500 dark:text-zinc-400">
                          replay: <span class="font-mono">v{{ s.match.replayVersion }}</span>
                        </span>
                      }
                      @if (s.match.latestLibraryVersion) {
                        <span class="text-zinc-500 dark:text-zinc-400">
                          library latest: <span class="font-mono">v{{ s.match.latestLibraryVersion }}</span>
                        </span>
                      }
                    }
                  </div>
                }
              </li>
            }
          </ul>
        }
      }
    </section>

    <app-lua-viewer
      [open]="viewerOpen()"
      [name]="viewerName()"
      [title]="viewerTitle()"
      [lua]="viewerLua()"
      [beautifyByDefault]="true"
      (close)="closeViewer()" />
  `,
  styles: [],
})
export class ReplayDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly api = inject(ReplayApiService);
  private readonly matcher = inject(TweakMatcherService);
  private readonly codec = inject(LuaCodecService);

  readonly state = signal<DetailState>({ loading: false, error: '', replay: null });

  readonly viewerOpen = signal(false);
  readonly viewerName = signal('');
  readonly viewerTitle = signal('');
  readonly viewerLua = signal('');

  readonly slots = computed<Slot[]>(() => {
    const r = this.state().replay;
    if (!r) return [];
    return this.decodeSlots(r);
  });

  readonly slotsSummary = computed(() => {
    const ss = this.slots();
    let exact = 0, versionDiff = 0, unknown = 0;
    for (const s of ss) {
      if (s.match.status === 'exact') exact++;
      else if (s.match.status === 'version-diff') versionDiff++;
      else unknown++;
    }
    return { exact, versionDiff, unknown };
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(async (pm) => {
      const id = pm.get('gameId');
      if (!id) return;
      this.title.setTitle('Replay — Lava configurator');
      this.state.set({ loading: true, error: '', replay: null });
      try {
        const replay = await this.api.get(id);
        this.state.set({ loading: false, error: '', replay });
        this.title.setTitle(`${replay.Map.scriptName} — Replay — Lava configurator`);
      } catch (e) {
        this.state.set({
          loading: false,
          error: (e as Error).message || 'Failed to load replay.',
          replay: null,
        });
      }
    });
  }

  /** Decode every non-empty tweakdefs/tweakunits slot and match it. */
  private decodeSlots(r: ReplayDetail): Slot[] {
    const gs = r.gameSettings ?? {};
    const slots: Slot[] = [];
    for (const kind of ['tweakdefs', 'tweakunits'] as SlotKind[]) {
      const keys = Object.keys(gs).filter((k) => k === kind || k.startsWith(kind));
      for (const key of keys) {
        const b64 = (gs[key] ?? '').toString();
        if (!b64 || b64.length < 4) continue; // skip empty / placeholder values
        let lua: string;
        try {
          lua = this.codec.decode(b64);
        } catch {
          continue; // not valid base64 — ignore
        }
        if (!lua || !lua.trim()) continue;
        const firstComment = this.firstCommentOf(lua);
        slots.push({
          kind,
          key,
          index: this.slotIndex(key, kind),
          b64,
          lua,
          firstComment,
          chars: new TextEncoder().encode(lua).length,
          match: this.matcher.match(firstComment),
        });
      }
    }
    // tweakdefs first, then tweakunits; each ordered by slot index.
    const order: Record<SlotKind, number> = { tweakdefs: 0, tweakunits: 1 };
    return slots.sort((a, b) =>
      order[a.kind] - order[b.kind] || a.index - b.index,
    );
  }

  private slotIndex(key: string, kind: SlotKind): number {
    if (key === kind) return 0;
    const n = parseInt(key.slice(kind.length), 10);
    return isNaN(n) ? 0 : n;
  }

  private firstCommentOf(lua: string): string {
    for (const raw of lua.split('\n')) {
      const line = raw.replace(/\r$/, '');
      if (line.trim().startsWith('--')) return line.trim();
      if (line.trim() === '') continue;
      // first non-blank, non-comment line means no leading comment
      break;
    }
    return '';
  }

  openLua(s: Slot): void {
    this.viewerName.set(s.key);
    this.viewerTitle.set(s.firstComment || s.key);
    this.viewerLua.set(s.lua);
    this.viewerOpen.set(true);
  }

  closeViewer(): void {
    this.viewerOpen.set(false);
  }

  // ---- formatting ----

  totalPlayers(r: ReplayDetail): number {
    return (r.AllyTeams ?? []).reduce(
      (n, t) => n + (t.Players?.length ?? 0) + (t.AIs?.length ?? 0), 0,
    );
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  formatDuration(ms: number): string {
    if (!ms || ms < 0) return '—';
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  }
}