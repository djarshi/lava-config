import { Injectable } from '@angular/core';

/**
 * Thin client for the public BAR replays API at https://api.bar-rts.com/replays.
 *
 * The API is undocumented and a bit flaky (it sometimes drops connections), so
 * every call is retried a few times. No auth, plain JSON, CORS-friendly.
 *
 * List endpoint:  GET /replays?maps=<scriptName>&players=<name>&page=N&limit=N&endedNormally=true
 * Detail endpoint: GET /replays/:gameId
 *
 * `totalResults` always comes back as -1, so pagination has to stop on a short
 * page rather than relying on a total.
 */

export interface ReplayPlayer {
  name: string;
}

export interface ReplayAllyTeam {
  winningTeam: boolean;
  Players: ReplayPlayer[];
  AIs: { name?: string; aiType?: string }[];
}

export interface ReplayMap {
  fileName: string;
  scriptName: string;
}

export interface ReplayListItem {
  id: string;
  startTime: string;
  durationMs: number;
  Map: ReplayMap;
  AllyTeams: ReplayAllyTeam[];
}

export interface ReplayListResponse {
  totalResults: number;
  page: number;
  limit: number;
  data: ReplayListItem[];
}

export interface ReplayDetail extends ReplayListItem {
  fileName: string;
  engineVersion: string;
  gameVersion: string;
  fullDurationMs: number;
  hostSettings: Record<string, string>;
  gameSettings: Record<string, string>;
  mapSettings: Record<string, string>;
  spadsSettings: Record<string, string>;
  gameEndedNormally: boolean;
  hasBots: boolean;
  preset?: string;
  reported?: boolean;
  awards?: unknown;
  Spectators: ReplayPlayer[];
}

export interface ListOptions {
  /** Full Map.scriptName, e.g. "Supreme Isthmus v2.1". */
  map?: string;
  /** Player name (case-insensitive substring). */
  players?: string;
  page?: number;
  limit?: number;
  endedNormally?: boolean;
  hasBots?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReplayApiService {
  private readonly base = 'https://api.bar-rts.com/replays';
  private readonly maxAttempts = 4;
  /** Cache of already-fetched detail responses, so the list-page lava scan
   *  and the detail page don't double-fetch the same replay. */
  private readonly detailCache = new Map<string, ReplayDetail>();

  async list(opts: ListOptions = {}): Promise<ReplayListResponse> {
    const params = new URLSearchParams();
    if (opts.map) params.set('maps', opts.map);
    if (opts.players) params.set('players', opts.players);
    if (opts.page) params.set('page', String(opts.page));
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.endedNormally) params.set('endedNormally', 'true');
    if (opts.hasBots !== undefined) params.set('hasBots', String(opts.hasBots));
    return this.fetchWithRetry<ReplayListResponse>(`${this.base}?${params.toString()}`);
  }

  async get(id: string): Promise<ReplayDetail> {
    const cached = this.detailCache.get(id);
    if (cached) return cached;
    const detail = await this.fetchWithRetry<ReplayDetail>(`${this.base}/${id}`);
    this.detailCache.set(id, detail);
    return detail;
  }

  /** Was this replay's detail already fetched (and cached)? */
  hasDetail(id: string): boolean {
    return this.detailCache.has(id);
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return (await res.json()) as T;
      } catch (err) {
        lastErr = err;
        // Exponential-ish backoff: 0.4s, 0.8s, 1.6s …
        await new Promise((r) => setTimeout(r, 400 * 2 ** (attempt - 1)));
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error('Failed to fetch replay data from api.bar-rts.com');
  }
}