# Lava Config v2 — input file structure

The configurator is fully data-driven. Everything lives under `configurator-input/` — no config data is hardcoded in the app. Two folders: `categories/` (the dropdowns + choices) and `tweaks/` (the Lua packs).

```
configurator-input/
├── categories/
│   ├── order                      # one category per line:  name:left|right
│   ├── base/
│   │   ├── 0-choices.md           # the dropdown options + effects
│   │   └── 0-info.md              # category blurb
│   ├── economy/
│   ├── air/
│   └── ...
└── tweaks/
    ├── lavapack/
    │   ├── 0-info.md              # tweak description (markdown)
    │   ├── 0-authors.json         # author list with roles
    │   ├── lavapack-4.13.lua      # one file per version
    │   ├── lavapack-4.15.lua
    │   └── lavapack-5.1.lua
    ├── one-big-nuke/
    └── ...
```

## Conventions

- Files starting with `0-` are metadata and sort first.
- Author names are always **lowercase** (`djarshi`, `zopmaxima`, `txpera`…).
- Versions use `N.N` or `N.N.N`; a file with no version defaults to `1.0`.
- Tweak refs in choices use the lowercase folder name, no version, no `${}`: `@tweakdefs lavapack`, `@tweakunits lavapack`.

## `0-choices.md`

H1 is the category title, each `##` heading is one dropdown option (its slug is derived from the heading). Fenced code blocks under an option are its effect lines:

```
# Economy

## Standard
```
@tweakdefs lavapack
@tweakunits lavapack
!bset somethingelse 1
```

## Lava pack (no nukes)
```
@tweakdefs lavapack
@tweakunits lavapack
@tweakdefs one-big-nuke
```
```

At build time the whole `0-choices.md` is also kept as raw markdown so the `?` help dialog can render it (code blocks are collapsible). The first `##` option is selected by default.

## `0-authors.json` per tweak

Array of `{name, role}`. Roles are free text but the library uses `developer` for the compact table and shows all roles on the detail page:

Example for lavapack since i write that thing mostly, but suppprt i do also get

```json
[
  { "name": "djarshi", "role": "developer" },
  { "name": "zopmaxima", "role": "supporter" },
  { "name": "txpera", "role": "supporter" }
]
```

## `0-info.md`

Plain markdown description of the tweak. H1 is treated as the title (shown in the header), the rest is rendered as HTML on the detail page.

## Multiple versions

Drop in as many `<name>-<version>.lua` files as you want. The build collects them all, sorted by version. The library table shows the latest version with a `+N` badge for extras; the detail page lists every version (newest first) with a **View Lua** button so you can compare what changed between versions.

## Build

`npm run build:data` (also runs before `start` / `build` / `watch`) reads the whole tree, validates it, and writes `tweaks.json` + `categories.json` into `src/app/configurator-data/`. It **hard-fails** on any structural problem: missing tweak ref, empty category, invalid JSON, duplicate versions, or a folder not listed in `order`. Raw Lua goes into the JSON; minify + base64 happens client-side at runtime (same `luamin` pipeline as the old site).
