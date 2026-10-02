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

    let payload: string;
    try {
      payload = this.minify(lua);
    } catch (e) {
      // Not parseable as standalone Lua (bare table fragments). Encode raw.
      payload = lua;
    }

    const b64 = this.toBase64Url(payload);
    this.cache.set(lua, b64);
    return b64;
  }

  /**
   * Minify Lua with the same settings used to build the site's bset payloads:
   * luamin.minify(code, { RenameVariables: false, RenameGlobals: false,
   * SolveMath: false }) and prepend up to 3 leading `--` comment lines.
   * Throws if luamin can't parse the source (e.g. bare table fragments).
   */
  minify(lua: string): string {
    if (!this.ready) {
      throw new Error('luamin.js is not loaded yet — refresh the page.');
    }
    const minified = window.luamin!.minify(lua, {
      RenameVariables: false,
      RenameGlobals: false,
      SolveMath: false,
    });
    const header = this.firstComments(lua, 3);
    return header ? header + '\n' + minified : minified;
  }

  /** Base64URL-decode back to the original Lua source string. */
  decode(b64url: string): string {
    let base64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
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