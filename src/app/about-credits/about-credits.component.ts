import { Component, OnInit, inject } from '@angular/core';
import { CreditsService } from '../credits.service';

@Component({
  selector: 'app-about-credits',
  standalone: true,
  imports: [],
  template: `
    <section class="lava-panel mb-4">
      <h1 class="mb-3 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
        <i class="bi bi-info-circle text-lava-orange"></i> About
      </h1>
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        A lot of people have spent effort into making tweaks for Beyond All Reason.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Hi, I'm Djarshi, a player in the game Beyond All Reason.<br/>
        I started joining these Lava lobbies around 2023. I liked the scaling aspect of BAR and in LAVA this was utilized more.
        In 2024 here and there I saw 'tweaks', so I started asking around. This led me to combine OPMan's tweak of disabling sea
        with removing the pesky pawnlauncher... and then ragnarok, calamity, starfall.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Removing the pawn launcher allowed extra T3 air units to be enabled since this implicitly also brought the dreaded pawnlauncher.
        Later BAR got expanded with disabling options. During that time Engiman was active and txpera was also looking for 'a better afus',
        which led to the creation of the Engi AFUS — these things were all added by using tweakunits.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        After some more time things shifted to using tweakdefs, which allowed a little more lua-programming in it.
        By then someone on the BAR dev team added the scavenger units (big afus) — a very cool addition but it rendered the engiman afus a bit obsolete.
      </p>
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Why stop there? Lava tides, epic mex, epic geo, legendary engi afus, Zop Sky Ops, removing that 'f**' epic commando
        (fun in normal games... but not in lava at minute 30).
      </p>
      <p class="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Eco wise there were at least 3 versions of 'enhancing' the economy being used: ZopMaxima's eco pack, Djarshi lavapack, Engi eco,
        and more I encountered but not all remembered. ZopMaxima went on making this in a more unit-based approach and in the end there was a QoL pack.
        In between I discovered NuttyB, also a very nice play mode — I recommend searching for 'nuttyb' lobbies.
      </p>
      <p class="mt-3 mb-0 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        Options, options and more options... All these things make this a bit complex — let's see if we can make this a bit easier.
        <br/><br/>
        And THUS... this configurator is born.
      </p>
    </section>

    @for (section of credits.sections(); track section.heading) {
      <section class="lava-panel mb-4 last:mb-0">
        <h2 class="mb-1 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
          @if (section.heading === 'Credits') {
            <i class="bi bi-people-fill text-lava-orange"></i>
          } @else {
            <i class="bi bi-globe2 text-lava-orange"></i>
          }
          {{ section.heading }}
        </h2>
        @if (section.intro) {
          <p class="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{{ section.intro }}</p>
        }
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          @for (c of section.items; track c.name) {
            <div class="lava-panel h-full">
              <div class="text-xs font-semibold uppercase tracking-wider text-lava-orange">{{ c.role }}</div>
              <div class="mt-0.5 font-bold text-zinc-900 dark:text-white">{{ c.name }}</div>
              <div class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {{ c.why }}
                @if (c.link) {
                  <a [href]="c.link" target="_blank" rel="noopener" class="ms-1 text-lava-orange hover:underline">
                    link <i class="bi bi-box-arrow-up-right"></i>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [],
})
export class AboutCreditsComponent implements OnInit {
  readonly credits = inject(CreditsService);

  ngOnInit(): void {
    this.credits.load();
  }
}