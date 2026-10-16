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

interface MapsPageResponse {
  totalResults: number;
  page: number;
  limit: number;
  data: (MapSummary & Record<string, unknown>)[];
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

export interface MapSummary {
  /** The value the replays list `maps=` filter expects, e.g. "Supreme Isthmus v2.1". */
  scriptName: string;
  /** Display name without version, e.g. "Supreme Isthmus". */
  name: string;
  version?: string;
}

@Injectable({ providedIn: 'root' })
export class ReplayApiService {
  private readonly base = 'https://api.bar-rts.com/replays';
  private readonly mapsBase = 'https://api.bar-rts.com/maps';
  private readonly maxAttempts = 4;
  /** Cache of already-fetched detail responses, so the list-page lava scan
   *  and the detail page don't double-fetch the same replay. */
  private readonly detailCache = new Map<string, ReplayDetail>();
  /** Cached full map list (loaded once, reused across revisits). */
  private mapsCache: MapSummary[] | null = null;

  /** Fetch every map (paginating /maps) once and cache it. The /maps endpoint
   *  ignores filter params, so we page through the whole list client-side. */
  async getAllMaps(): Promise<MapSummary[]> {
    if (this.mapsCache) return this.mapsCache;
    const out: MapSummary[] = [];
    const seen = new Set<string>();
    let page = 1;
    const limit = 100;
    // Hard cap as a safety net (638 maps at the time of writing).
    for (let guard = 0; guard < 20; guard++) {
      const res = await this.fetchWithRetry<MapsPageResponse>(
        `${this.mapsBase}?page=${page}&limit=${limit}`,
      );
      for (const m of res.data ?? []) {
        if (m.scriptName && !seen.has(m.scriptName)) {
          seen.add(m.scriptName);
          out.push({ scriptName: m.scriptName, name: m.name, version: m.version });
        }
      }
      if ((res.data?.length ?? 0) < limit) break;
      page++;
    }
    out.sort((a, b) => a.scriptName.localeCompare(b.scriptName));
    this.mapsCache = out;
    return out;
  }

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