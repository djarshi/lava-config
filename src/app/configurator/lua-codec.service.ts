import { Injectable } from '@angular/core';

/**
 * Minifies Lua source with `luamin` (loaded from public/luamin.js as a global)
 * and Base64URL-encodes the result, exactly like the old encoder-b64.html:
 *   1. luamin.minify(code, { RenameVariables: false, RenameGlobals: false, SolveMath: false })
 *      (the bundled luamin is patched to honor RenameVariables; RenameGlobals is
 *      always off, and SolveMath is not implemented in this luamin build)
 *   2. prepend up to 3 leading `--` comment lines from the original source
 *   3. UTF-8 safe Base64, then URL-safe alphabet (+->-, /->_, strip =)
 *
 * Some tweaks are bare table fragments (e.g. unlimited-screamers, airlimit,
 * epic-commander) that are not valid standalone Lua, so luamin cannot parse
 * them. The old site shipped those as raw base64 without minifying; we do the
 * same by falling back to encoding the source as-is when minify throws.
 *
 * Results are cached per source string so a tweak is only processed once.
 */
declare global {
  interface Window {
    luamin?: { minify: (code: string, opts?: Record<string, boolean>) => string };
  }
}

@Injectable({ providedIn: 'root' })
export class LuaCodecService {
  private readonly cache = new Map<string, string>();

  get ready(): boolean {
    return typeof window !== 'undefined' && !!window.luamin?.minify;
  }

  /** Minify + Base64URL-encode a Lua source string. */
  encode(lua: string): string {
    const cached = this.cache.get(lua);
    if (cached) return cached;

    if (!this.ready) {
      throw new Error('luamin.js is not loaded yet — refresh the page.');
    }

    let payload: string;
    try {
      const minified = window.luamin!.minify(lua, {
        RenameVariables: false,
        RenameGlobals: false,
        SolveMath: false,
      });
      const header = this.firstComments(lua, 3);
      payload = header ? header + '\n' + minified : minified;
    } catch (e) {
      // Not parseable as standalone Lua (bare table fragments). Encode raw.
      payload = lua;
    }

    const b64 = this.toBase64Url(payload);
    this.cache.set(lua, b64);
    return b64;
  }

  /** First up to `max` leading `--` comment lines of the source. */
  private firstComments(lua: string, max: number): string {
    const out: string[] = [];
    for (const line of lua.split('\n')) {
      if (out.length >= max) break;
      if (line.trim().startsWith('--')) out.push(line);
    }
    return out.join('\n');
  }

  private toBase64Url(s: string): string {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}