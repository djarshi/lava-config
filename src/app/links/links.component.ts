import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface LinkItem {
  title: string;
  description: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="lava-panel mb-4">
      <h1 class="mb-2 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
        <i class="bi bi-link-45deg text-lava-orange"></i> Links
      </h1>
      <p class="mb-0 text-sm text-zinc-600 dark:text-zinc-400">
        A lot of people have spent effort into making tweaks for Beyond All Reason.
        First of all thanks to the team of
        <a class="text-lava-orange hover:underline" href="https://www.beyondallreason.info/" target="_blank" rel="noopener">Beyond All Reason</a>
        for an amazing game.
      </p>
    </div>

    @for (group of groups; track group.heading) {
      <section class="mb-6">
        <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{{ group.heading }}</h2>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          @for (link of group.items; track link.url) {
            @if (link.url.startsWith('/')) {
              <a [routerLink]="link.url" class="link-card flex items-start gap-3">
                <i class="bi flex-shrink-0 text-3xl" [class]="link.icon" style="color: var(--tw-lava, #ff6b35)"></i>
                <div class="min-w-0 flex-1">
                  <div class="mb-0.5 font-bold text-zinc-900 dark:text-white">{{ link.title }}</div>
                  <div class="text-sm text-zinc-500 dark:text-zinc-400">{{ link.description }}</div>
                </div>
                <i class="bi bi-arrow-right flex-shrink-0 text-zinc-400"></i>
              </a>
            } @else {
              <a [href]="link.url" target="_blank" rel="noopener" class="link-card flex items-start gap-3">
                <i class="bi flex-shrink-0 text-3xl" [class]="link.icon" style="color: var(--tw-lava, #ff6b35)"></i>
                <div class="min-w-0 flex-1">
                  <div class="mb-0.5 font-bold text-zinc-900 dark:text-white">{{ link.title }}</div>
                  <div class="text-sm text-zinc-500 dark:text-zinc-400">{{ link.description }}</div>
                </div>
                <i class="bi bi-box-arrow-up-right flex-shrink-0 text-zinc-400"></i>
              </a>
            }
          }
        </div>
      </section>
    }
  `,
  styles: [],
})
export class LinksComponent {
  groups: { heading: string; items: LinkItem[] }[] = [
    {
      heading: 'Widgets',
      items: [
        {
          title: 'Reclaim Selected Widget',
          description: 'Adds a button to reclaim selected units with nearby nano turrets. Good for clearing wind turbines.',
          url: 'https://github.com/manshanko/bar-widgets/blob/main/cmd_reclaim_selected.lua',
          icon: 'bi-ui-radios text-lava-orange',
        },
      ],
    },
    {
      heading: 'Other playmodes & configs',
      items: [
        {
          title: 'Lavabalance',
          description: 'Lavabalance tool & lobby info by huk. Laid-back mass-army clashes — no sweaty laddering. Especially check out the replays function, amazing!',
          url: 'https://lavabalance.fogofwar.dev',
          icon: 'bi-bar-chart-steps text-lava-orange',
        },
        {
          title: 'Space expansion',
          description: 'More eco and things that fly/hover in air',
          url: 'https://docs.google.com/spreadsheets/d/1ozK0eU2OXPlmW29MfRrRFSC17pZocOoTJ5X-xpCZ2dk',
          icon: 'bi-rocket-takeoff text-lava-orange',
        },
        {
          title: 'NuttyB Configurator',
          description: 'Useful if you want to play NuttyB lobbies',
          url: 'https://rcorex.github.io/nuttyb-config/',
          icon: 'bi-gear-wide-connected text-lava-orange',
        },
        {
          title: 'Commander Clash',
          description: 'A gamemode focused on T1 spam where commanders become the strongest unit. T2 factories are disabled and the commander evolves every 5 minutes; at minute 20 it can build T2 defense and eco.',
          url: 'https://docs.google.com/spreadsheets/d/1lyjJ8bWipWoxlI7CB3sKUrK8l5ZsSSWG6OQzoXsYuC8',
          icon: 'bi-flag-fill text-lava-orange',
        },
        {
          title: 'NuttyB Configurator Github',
          description: 'The source code that inspired me to make this configurator. Similar ideas... still a little different.',
          url: 'https://github.com/rcorex/nuttyb-config',
          icon: 'bi-github text-lava-orange',
        },
        {
          title: 'All the units (units.json)',
          description: 'This lists all the units in the game which can be (mis)used to change things.',
          url: 'https://github.com/beyond-all-reason/Beyond-All-Reason/blob/master/language/en/units.json',
          icon: 'bi-list-columns-reverse text-lava-orange',
        },
        {
          title: 'Beyond All Reason source code',
          description: 'The sources of Beyond All Reason on github',
          url: 'https://github.com/beyond-all-reason/Beyond-All-Reason',
          icon: 'bi-file-earmark-code text-lava-orange',
        },
      ],
    },
    {
      heading: 'How to / Tools',
      items: [
        {
          title: 'Tweakoptions guides',
          description: 'A nice explanation on how to do things with tweaks',
          url: 'https://gist.github.com/badosu/f2617db52e7486a7769366642d354a01',
          icon: 'bi-book text-lava-orange',
        },
        {
          title: 'Base64 coder / beautifier',
          description: 'Encode / decode Base64URL and minify / beautify Lua in your browser. Minify uses the same settings as the configurator.',
          url: '/encoder',
          icon: 'bi-file-binary text-lava-orange',
        },
      ],
    },
  ];
}