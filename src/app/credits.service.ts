import { Injectable, computed, signal } from '@angular/core';

export interface CreditItem {
  role: string;
  name: string;
  why: string;
  link?: string;
}

export interface CreditSection {
  heading: string;
  intro?: string;
  items: CreditItem[];
}

interface CreditsFile {
  sections: CreditSection[];
}

@Injectable({ providedIn: 'root' })
export class CreditsService {
  private readonly _sections = signal<CreditSection[]>([]);
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  /** All credit sections, in display order. */
  readonly sections = this._sections.asReadonly();

  /** Every credit flattened into a single list (for random pickers, etc.). */
  readonly allItems = computed<CreditItem[]>(() =>
    this._sections().flatMap((s) => s.items),
  );

  /** Load the JSON once; subsequent calls return the same promise. */
  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const res = await fetch('credits.json');
        if (!res.ok) throw new Error(`credits.json: ${res.status}`);
        const data = (await res.json()) as CreditsFile;
        this._sections.set(data.sections ?? []);
      } catch (err) {
        console.error('Failed to load credits:', err);
      } finally {
        this.loaded = true;
      }
    })();

    return this.loadingPromise;
  }
}