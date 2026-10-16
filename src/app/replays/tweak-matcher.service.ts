import { Injectable } from '@angular/core';
import tweaksData from '../configurator-data/tweaks.json';

/**
 * Matches a replay's tweakdefs/tweakunits slot (identified by the first `--`
 * comment line of the decoded Lua) against the configurator's tweak library.
 *
 * The build script already captures each library version's `firstComment`, so
 * we can match a replay slot to a library tweak without running luamin:
 *
 *   1. exact  — the firstComment matches a library version's firstComment
 *               verbatim → same tweak, same version.
 *   2. version-diff — the firstComment normalizes to the same "name key" as a
 *               library tweak, but the version differs → same tweak, replay
 *               uses a version we don't ship (often a newer one).
 *   3. unknown — no name-key match → a BAR built-in / community / map tweak
 *               that isn't in our library.
 *
 * Name-key normalization: strip the leading `--`, drop parenthesised groups
 * (authors / inline versions), drop version tokens, lowercase, collapse
 * whitespace. e.g. "--Lava Sky Ops 1.4.5 (Zop)" → "lava sky ops".
 */

export type MatchStatus = 'exact' | 'version-diff' | 'unknown';

export interface TweakMatch {
  status: MatchStatus;
  /** Library tweak folder name (e.g. "skyops"), if matched. */
  name?: string;
  /** Library version that matched exactly, if any. */
  libraryVersion?: string;
  /** Version string extracted from the replay's firstComment. */
  replayVersion?: string;
  /** Latest library version (handy when status is version-diff). */
  latestLibraryVersion?: string;
}

interface LibVersion {
  version: string;
  firstComment: string;
}
interface LibTweak {
  name: string;
  versions: LibVersion[];
}

interface NameKeyEntry {
  name: string;
  versions: LibVersion[];
}

@Injectable({ providedIn: 'root' })
export class TweakMatcherService {
  private readonly tweaks: LibTweak[] = (tweaksData.tweaks as unknown as LibTweak[]).map((t) => ({
    name: t.name,
    versions: (t.versions ?? []).map((v) => ({ version: v.version, firstComment: v.firstComment ?? '' })),
  }));

  /** firstComment (raw) → library tweak + version, for exact matching. */
  private readonly byFirstComment = new Map<string, { name: string; version: string }>();
  /** normalized name key → library tweak versions, for fuzzy matching. */
  private readonly byNameKey = new Map<string, NameKeyEntry>();

  constructor() {
    for (const t of this.tweaks) {
      for (const v of t.versions) {
        const fc = (v.firstComment ?? '').trim();
        if (fc) this.byFirstComment.set(fc, { name: t.name, version: v.version });
      }
    }
    for (const t of this.tweaks) {
      // Use the newest version's firstComment to derive the canonical name key.
      const newest = t.versions.at(-1);
      if (!newest) continue;
      const key = this.nameKey(newest.firstComment);
      if (!key) continue;
      if (!this.byNameKey.has(key)) this.byNameKey.set(key, { name: t.name, versions: t.versions });
    }
  }

  /** Match a decoded slot's firstComment against the library. */
  match(firstComment: string): TweakMatch {
    const fc = (firstComment ?? '').trim();
    if (!fc) return { status: 'unknown' };

    const exact = this.byFirstComment.get(fc);
    if (exact) {
      return {
        status: 'exact',
        name: exact.name,
        libraryVersion: exact.version,
        replayVersion: this.extractVersion(fc) ?? exact.version,
        latestLibraryVersion: this.latestVersion(exact.name),
      };
    }

    const key = this.nameKey(fc);
    if (key) {
      const entry = this.byNameKey.get(key);
      if (entry) {
        const replayVer = this.extractVersion(fc);
        const latest = this.latestVersion(entry.name);
        return {
          status: 'version-diff',
          name: entry.name,
          replayVersion: replayVer ?? undefined,
          latestLibraryVersion: latest,
        };
      }
    }
    return { status: 'unknown', replayVersion: this.extractVersion(fc) ?? undefined };
  }

  /** All known library tweak names (for quick lookups / badges). */
  libraryNames(): string[] {
    return this.tweaks.map((t) => t.name);
  }

  private latestVersion(name: string): string | undefined {
    return this.tweaks.find((t) => t.name === name)?.versions.at(-1)?.version;
  }

  /** Extract the version token, preferring explicit `vN.N` then dotted `N.N`.
   *  Avoids grabbing bare integers like the "3" in "T3 Air Rework". */
  private extractVersion(fc: string): string | null {
    const v = fc.match(/v(\d+(?:\.\d+){0,2})/i);
    if (v) return v[1];
    const d = fc.match(/\b(\d+\.\d+(?:\.\d+)?)/);
    if (d) return d[1];
    return null;
  }

  /** Normalize a firstComment to a stable "name key". */
  private nameKey(fc: string): string {
    let s = (fc ?? '').replace(/^--+/, ' ');
    s = s.replace(/\([^)]*\)/g, ' '); // drop "(Zop)", "(Tyleno v1.3)", "(Djarshi)"
    s = s.replace(/v?\d+(?:\.\d+){0,2}/gi, ' '); // drop version tokens
    s = s.replace(/[^a-z0-9]+/gi, ' ').toLowerCase().trim();
    return s.replace(/\s+/g, ' ');
  }
}