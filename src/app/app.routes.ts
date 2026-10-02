import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'configurator', pathMatch: 'full' },
  {
    path: 'configurator',
    title: 'Lava configurator',
    loadComponent: () => import('./configurator/configurator.component').then((m) => m.ConfiguratorComponent),
  },
  {
    path: 'tweaks',
    title: 'Tweak library — Lava configurator',
    loadComponent: () => import('./tweak-search/tweak-search.component').then((m) => m.TweakSearchComponent),
  },
  {
    path: 'tweaks/:name',
    title: 'Tweak details — Lava configurator',
    loadComponent: () => import('./tweak-search/tweak-search.component').then((m) => m.TweakSearchComponent),
  },
  {
    path: 'links',
    title: 'Links — Lava configurator',
    loadComponent: () => import('./links/links.component').then((m) => m.LinksComponent),
  },
  {
    path: 'about',
    title: 'About & Credits — Lava configurator',
    loadComponent: () => import('./about-credits/about-credits.component').then((m) => m.AboutCreditsComponent),
  },
  { path: '**', redirectTo: 'configurator' },
];