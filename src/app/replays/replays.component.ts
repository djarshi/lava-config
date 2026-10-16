import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReplayApiService, ReplayListItem } from './replay-api.service';

/**
 * Replays selector page. Lists recent games from the BAR replays API, with the
 * map preselected to a Supreme Isthmus version (the lava-config home map).
 * Clicking a row opens /replays/:gameId where the tweakdefs/tweakunits are
 * decoded and matched against the tweak library.
 */

/** Known Supreme Isthmus scriptNames offered in the dropdown. */
const SUPREME_ISTHMUS_VERSIONS = [
  'Supreme Isthmus v2.1',
  'Supreme Isthmus v2',
  'Supreme Isthmus',
];

interface LoadState {
  loading: boolean;
  error: string;
  items: ReplayListItem[];
}

@Component({
  selector: 'app-replays',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="lava-panel">
      <h2 class="mb-1 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
        <i class="bi bi-camera-reels text-lava-orange"></i> Replays
      </h2>
      <p class="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Recent games from the
        <a class="text-lava-orange hover:underline" href="https://bar-rts.com/replays" target="_blank" rel="noopener">BAR replays API</a>.
        Pick one to decode its <code class="font-mono">tweakdefs</code>/<code class="font-mono">tweakunits</code>
        and see which match tweaks in our library — and which are map / community tweaks we don't ship.
      </p>

      <!-- Filters -->
      <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Map</label>
          <select class="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 focus:border-lava-orange focus:outline-none dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-100"
                  [ngModel]="mapFilter()" (ngModelChange)="mapFilter.set($event)">
            @for (m of mapOptions; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Player</label>
          <input type="text"
                 class="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-lava-orange focus:outline-none dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-100"
                 placeholder="(optional) e.g. djarshi"
                 [ngModel]="playerFilter()" (ngModelChange)="playerFilter.set($event)" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Per page</label>
          <select class="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 focus:border-lava-orange focus:outline-none dark:border-lava-border dark:bg-[#15171a] dark:text-zinc-100"
                  [ngModel]="limit()" (ngModelChange)="limit.set(+$event)">
            @for (n of limitOptions; track n) {
              <option [value]="n">{{ n }}</option>
            }
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button type="button" class="lava-btn w-full" (click)="load(1)" [disabled]="state().loading">
            <i class="bi" [class.bi-arrow-clockwise]="state().loading" [class.bi-search]="!state().loading"></i>
            {{ state().loading ? 'Loading…' : 'Search' }}
          </button>
        </div>
      </div>

      <div class="mb-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <label class="inline-flex items-center gap-1.5">
          <input type="checkbox" class="accent-lava-orange" [ngModel]="endedOnly()" (ngModelChange)="endedOnly.set($event)" />
          Only finished games
        </label>
        <span class="ml-auto">{{ state().items.length }} result{{ state().items.length === 1 ? '' : 's' }}</span>
      </div>

      @if (state().error) {
        <div class="mb-4 rounded-md border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ state().error }}
        </div>
      }

      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-zinc-300 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-lava-border dark:text-zinc-400">
              <th class="py-2 pr-4">Date</th>
              <th class="py-2 pr-4">Map</th>
              <th class="py-2 pr-4">Players</th>
              <th class="py-2 pr-4 text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            @for (r of state().items; track r.id) {
              <tr class="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-lava-orange/5 dark:border-lava-border/40 dark:hover:bg-lava-orange/10"
                  (click)="open(r.id)" (keydown.enter)="open(r.id)" tabindex="0">
                <td class="whitespace-nowrap py-2 pr-4 text-zinc-700 dark:text-zinc-300">{{ formatDate(r.startTime) }}</td>
                <td class="py-2 pr-4 text-zinc-600 dark:text-zinc-300">{{ r.Map.scriptName }}</td>
                <td class="py-2 pr-4">
                  <span class="text-zinc-600 dark:text-zinc-300">{{ teamLabel(r, 0) }}</span>
                  <span class="mx-1 text-zinc-400 dark:text-zinc-500">vs</span>
                  <span class="text-zinc-600 dark:text-zinc-300">{{ teamLabel(r, 1) }}</span>
                  @if (winnerIndex(r) >= 0) {
                    <span class="ml-1.5 inline-block rounded bg-emerald-500/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
                      {{ winnerIndex(r) === 0 ? 'Team 1' : 'Team 2' }} won
                    </span>
                  }
                </td>
                <td class="whitespace-nowrap py-2 pr-4 text-right text-zinc-500 dark:text-zinc-400">{{ formatDuration(r.durationMs) }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  @if (state().loading) { Loading replays… } @else { No replays found. Try a different filter. }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (state().items.length && !state().loading) {
        <div class="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <button type="button" class="lava-btn-ghost !py-1 !px-2.5" (click)="load(page() - 1)" [disabled]="page() <= 1">
            <i class="bi bi-chevron-left"></i> Prev
          </button>
          <span>Page {{ page() }}</span>
          <button type="button" class="lava-btn-ghost !py-1 !px-2.5" (click)="load(page() + 1)" [disabled]="state().items.length < limit()">
            Next <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      }
    </section>
  `,
  styles: [],
})
export class ReplaysComponent {
  private readonly api = inject(ReplayApiService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly mapOptions = SUPREME_ISTHMUS_VERSIONS;
  readonly limitOptions = [10, 25, 50];

  readonly mapFilter = signal('Supreme Isthmus v2.1');
  readonly playerFilter = signal('');
  readonly limit = signal(25);
  readonly endedOnly = signal(true);
  readonly page = signal(1);

  readonly state = signal<LoadState>({ loading: false, error: '', items: [] });

  constructor() {
    this.title.setTitle('Replays — Lava configurator');
    // Initial load with the preselected Supreme Isthmus map.
    this.load(1);
  }

  async load(page: number): Promise<void> {
    if (page < 1) return;
    this.page.set(page);
    this.state.set({ loading: true, error: '', items: [] });
    try {
      const res = await this.api.list({
        map: this.mapFilter(),
        players: this.playerFilter().trim() || undefined,
        page,
        limit: this.limit(),
        endedNormally: this.endedOnly(),
      });
      this.state.set({ loading: false, error: '', items: res.data ?? [] });
    } catch (e) {
      this.state.set({
        loading: false,
        error: (e as Error).message || 'Failed to load replays.',
        items: [],
      });
    }
  }

  open(id: string): void {
    this.router.navigate(['/replays', id]);
  }

  // ---- formatting helpers ----

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
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  }

  teamLabel(r: ReplayListItem, idx: number): string {
    const team = r.AllyTeams?.[idx];
    if (!team) return '—';
    const n = (team.Players?.length ?? 0) + (team.AIs?.length ?? 0);
    return `${n}p` + (team.winningTeam ? ' 🏆' : '');
  }

  winnerIndex(r: ReplayListItem): number {
    return r.AllyTeams?.findIndex((t) => t.winningTeam) ?? -1;
  }
}