import { Component, inject, signal } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';

/**
 * Shows a small "A new version is available — reload" toast when the service
 * worker detects a new app version has been downloaded. Clicking Reload
 * activates the new version and reloads the page so every visitor picks up
 * deploys without a manual hard refresh.
 *
 * The service worker is only enabled in production builds, so this is a no-op
 * during local development.
 */
@Component({
  selector: 'app-update-toast',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="fixed bottom-4 right-4 z-[60] flex max-w-xs items-center gap-3 rounded-lg
                  border border-lava-orange/40 bg-white px-4 py-3 text-sm shadow-lg
                  dark:bg-[#15171a] dark:text-zinc-100">
        <i class="bi bi-arrow-repeat text-lg text-lava-orange"></i>
        <div class="flex-1">
          <div class="font-semibold">A new version is available</div>
          <div class="text-xs text-zinc-500 dark:text-zinc-400">Reload to get the latest.</div>
        </div>
        <button type="button" class="lava-btn-ghost px-2.5 py-1 text-xs" (click)="reload()">
          <i class="bi bi-arrow-clockwise"></i> Reload
        </button>
        <button type="button" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Dismiss" (click)="dismiss()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    }
  `,
  styles: [],
})
export class UpdateToastComponent {
  private readonly swUpdate = inject(SwUpdate);

  readonly visible = signal(false);
  private dismissedVersion: string | null = null;

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((evt: VersionEvent) => {
        if (evt.type === 'VERSION_READY') {
          // evt.latestVersion.hash or .appData identifies the new version.
          const id = evt.latestVersion?.hash ?? 'new';
          if (id !== this.dismissedVersion) {
            this.visible.set(true);
          }
        }
      });
    }
  }

  reload(): void {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }

  dismiss(): void {
    this.visible.set(false);
  }
}