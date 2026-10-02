import { Component, HostListener, computed, input, output } from '@angular/core';

/**
 * Reusable modal that shows Lua source with line numbers and syntax
 * highlighting. Used by the configurator's "used tweaks" list and by the
 * tweak-detail page's per-version "View" button.
 */
@Component({
  selector: 'app-lua-viewer',
  standalone: true,
  imports: [],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
           (click)="close.emit()">
        <div class="lava-panel flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden"
             (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-lava-border">
            <h3 class="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white">
              <i class="bi bi-code-square text-lava-orange"></i>
              <span class="font-mono text-sm text-zinc-500 dark:text-zinc-400">{{ name() }}</span>
              <span class="text-zinc-300 dark:text-zinc-600">·</span>
              <span>{{ title() }}</span>
            </h3>
            <button type="button"
                    class="inline-flex items-center justify-center rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
                    (click)="close.emit()" title="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="lua-viewer overflow-auto p-3">
            <div class="lua-view">
              <pre class="lua-gutter" aria-hidden="true">{{ gutter() }}</pre>
              <pre class="lua-code"><code [innerHTML]="html()"></code></pre>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class LuaViewerComponent {
  readonly open = input(false);
  readonly name = input('');
  readonly title = input('');
  readonly lua = input('');
  readonly close = output<void>();

  readonly html = computed(() => this.highlight(this.lua()));
  readonly gutter = computed(() => {
    const n = this.lua().split('\n').length;
    return Array.from({ length: n }, (_, i) => String(i + 1)).join('\n');
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close.emit();
  }

  private static readonly KEYWORDS = new Set([
    'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
    'goto', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then',
    'true', 'until', 'while',
  ]);
  private static readonly BUILTINS = new Set([
    'pairs', 'ipairs', 'next', 'print', 'tostring', 'tonumber', 'type',
    'setmetatable', 'getmetatable', 'select', 'error', 'assert', 'pcall',
    'xpcall', 'require', 'rawget', 'rawset', 'rawequal', 'rawlen', 'unpack',
    'collectgarbage', 'loadstring', 'load', 'dofile', 'getfenv', 'setfenv',
    'self', 'table', 'string', 'math', 'io', 'os', 'coroutine', 'package',
  ]);

  /** Tokenize Lua and wrap tokens in colored <span>s. Output is HTML-safe. */
  private highlight(code: string): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const span = (cls: string, text: string) =>
      '<span class="' + cls + '">' + esc(text) + '</span>';
    const re =
      /(--\[\[[\s\S]*?\]\])|(--[^\n]*)|(\[\[[\s\S]*?\]\])|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|(\s+)|([^\w\s])/g;
    let out = '';
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      if (m[1] !== undefined || m[2] !== undefined) {
        out += span('lua-comment', m[0]);
      } else if (m[3] !== undefined || m[4] !== undefined || m[5] !== undefined) {
        out += span('lua-string', m[0]);
      } else if (m[6] !== undefined) {
        out += span('lua-number', m[0]);
      } else if (m[7] !== undefined) {
        const w = m[7];
        if (LuaViewerComponent.KEYWORDS.has(w)) out += span('lua-keyword', w);
        else if (LuaViewerComponent.BUILTINS.has(w)) out += span('lua-builtin', w);
        else if (/^[A-Z]/.test(w)) out += span('lua-global', w);
        else out += span('lua-name', w);
      } else if (m[8] !== undefined) {
        out += m[8]; // whitespace, already safe
      } else {
        out += span('lua-punct', m[0]);
      }
    }
    return out;
  }
}