import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { LuaCodecService } from '../configurator/lua-codec.service';
import { beautifyLua } from './lua-beautify';

@Component({
  selector: 'app-encoder',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="lava-panel">
      <h2 class="mb-1 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
        <i class="bi bi-file-binary text-lava-orange"></i> Lua encoder
      </h2>
      <p class="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Encode / decode Base64URL and minify / beautify Lua. Minify uses the
        same settings the configurator uses to build its <code class="font-mono">!bset</code> payloads
        (<code class="font-mono">RenameVariables: false</code>, comments preserved).
      </p>

      @if (status()) {
        <div class="mb-4 rounded-md border px-3 py-2 text-sm"
             [class.border-emerald-400]="statusType() === 'ok'"
             [class.bg-emerald-50]="statusType() === 'ok'"
             [class.text-emerald-700]="statusType() === 'ok'"
             [class.border-red-400]="statusType() === 'error'"
             [class.bg-red-50]="statusType() === 'error'"
             [class.text-red-700]="statusType() === 'error'">
          {{ status() }}
        </div>
      }

      <!-- 1. Base64URL input -> decode -->
      <div class="mb-5">
        <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          1. Paste Base64URL to decode (optional)
        </label>
        <textarea class="command-output" rows="4" spellcheck="false"
                  placeholder="Paste a Base64URL string here…"
                  [ngModel]="b64In()" (ngModelChange)="b64In.set($event); clearStatus()"></textarea>
        <div class="mt-2 flex items-center gap-2">
          <button type="button" class="lava-btn" (click)="decode()" [disabled]="!b64In().trim()">
            <i class="bi bi-box-arrow-in-down"></i> Decode to Lua
          </button>
          <button type="button" class="lava-btn-ghost" (click)="copy(b64In(), 'b64In')" [disabled]="!b64In().trim()">
            <i class="bi bi-clipboard2"></i> Copy
          </button>
          @if (copiedField() === 'b64In') {
            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Copied!</span>
          }
          <span class="ml-auto text-[0.65rem] text-zinc-400 dark:text-zinc-500">{{ charCount(b64In()) }}</span>
        </div>
      </div>

      <!-- 2. Lua input -> minify / beautify -->
      <div class="mb-5">
        <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          2. Lua source
        </label>
        <textarea class="command-output" rows="8" spellcheck="false"
                  placeholder="-- Your Lua appears here after decoding, or paste it directly."
                  [ngModel]="luaIn()" (ngModelChange)="luaIn.set($event); clearStatus()"></textarea>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" class="lava-btn" (click)="minify()" [disabled]="!luaIn().trim()">
            <i class="bi bi-compress"></i> Minify
          </button>
          <button type="button" class="lava-btn-outline" (click)="beautify()" [disabled]="!luaIn().trim()">
            <i class="bi bi-braces"></i> Beautify
          </button>
          <button type="button" class="lava-btn-ghost" (click)="copy(luaIn(), 'luaIn')" [disabled]="!luaIn().trim()">
            <i class="bi bi-clipboard2"></i> Copy
          </button>
          @if (copiedField() === 'luaIn') {
            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Copied!</span>
          }
          <span class="ml-auto text-[0.65rem] text-zinc-400 dark:text-zinc-500">{{ charCount(luaIn()) }}</span>
        </div>
      </div>

      <!-- 3. Minified / beautified output -> encode -->
      <div class="mb-5">
        <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          3. Result (minified / beautified)
        </label>
        <textarea class="command-output" rows="8" spellcheck="false"
                  [ngModel]="luaOut()" (ngModelChange)="luaOut.set($event); clearStatus()"></textarea>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" class="lava-btn" (click)="encode()" [disabled]="!luaOut().trim()">
            <i class="bi bi-box-arrow-up"></i> Encode to Base64URL
          </button>
          <button type="button" class="lava-btn-ghost" (click)="copy(luaOut(), 'luaOut')" [disabled]="!luaOut().trim()">
            <i class="bi bi-clipboard2"></i> Copy
          </button>
          @if (copiedField() === 'luaOut') {
            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Copied!</span>
          }
          <span class="ml-auto text-[0.65rem] text-zinc-400 dark:text-zinc-500">{{ charCount(luaOut()) }}</span>
        </div>
      </div>

      <!-- 4. Final Base64URL -->
      <div>
        <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          4. Base64URL result
        </label>
        <textarea class="command-output" rows="4" spellcheck="false" readonly
                  [ngModel]="b64Out()"></textarea>
        <div class="mt-2 flex items-center gap-2">
          <button type="button" class="lava-btn-ghost" (click)="copy(b64Out(), 'b64Out')" [disabled]="!b64Out().trim()">
            <i class="bi bi-clipboard2"></i> Copy
          </button>
          @if (copiedField() === 'b64Out') {
            <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Copied!</span>
          }
          <span class="ml-auto text-[0.65rem] text-zinc-400 dark:text-zinc-500">{{ charCount(b64Out()) }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [],
})
export class EncoderComponent {
  private readonly codec = inject(LuaCodecService);
  private readonly title = inject(Title);

  readonly b64In = signal('');
  readonly luaIn = signal('');
  readonly luaOut = signal('');
  readonly b64Out = signal('');

  readonly status = signal('');
  readonly statusType = signal<'ok' | 'error'>('ok');
  readonly copiedField = signal<string | null>(null);
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.title.setTitle('Lua encoder — Lava configurator');
  }

  clearStatus(): void {
    if (this.status()) this.status.set('');
  }

  decode(): void {
    const s = this.b64In().trim();
    if (!s) return;
    try {
      this.luaIn.set(this.codec.decode(s));
      this.status.set('Decoded Base64URL to Lua.');
      this.statusType.set('ok');
    } catch (e) {
      this.status.set(`Decoding error: ${(e as Error).message}`);
      this.statusType.set('error');
    }
  }

  minify(): void {
    const s = this.luaIn();
    if (!s.trim()) return;
    try {
      this.luaOut.set(this.codec.minify(s));
      this.b64Out.set('');
      this.status.set('Minified with the configurator settings.');
      this.statusType.set('ok');
    } catch (e) {
      this.status.set(`Minify error: ${(e as Error).message}`);
      this.statusType.set('error');
    }
  }

  beautify(): void {
    const s = this.luaIn();
    if (!s.trim()) return;
    try {
      this.luaOut.set(beautifyLua(s));
      this.b64Out.set('');
      this.status.set('Beautified Lua (re-indented).');
      this.statusType.set('ok');
    } catch (e) {
      this.status.set(`Beautify error: ${(e as Error).message}`);
      this.statusType.set('error');
    }
  }

  encode(): void {
    const s = this.luaOut();
    if (!s.trim()) return;
    try {
      this.b64Out.set(this.codec.encode(s));
      this.status.set('Encoded Lua to Base64URL.');
      this.statusType.set('ok');
    } catch (e) {
      this.status.set(`Encoding error: ${(e as Error).message}`);
      this.statusType.set('error');
    }
  }

  async copy(text: string, field: string): Promise<void> {
    if (!text) return;
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
    this.copiedField.set(field);
    if (this.copyTimer) clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => {
      if (this.copiedField() === field) this.copiedField.set(null);
      this.copyTimer = null;
    }, 2000);
  }

  charCount(s: string): string {
    return s ? `${s.length} chars` : '';
  }
}