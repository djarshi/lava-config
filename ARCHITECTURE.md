# Architecture

How `lava-config2` is built and how the Angular app turns structured input files
into a live, data-driven configurator.

## Big picture

There are two stages, and the boundary between them is deliberate:

```
configurator-input/                     src/app/
  categories/   ──┐                       configurator-data/
  tweaks/        ──┼── build script ──►      tweaks.json      ──┐
                  (Node, build-time)      categories.json   ──┤
                                                            ├── Angular app (runtime)
                                                            │   reads JSON, builds dropdowns,
                                                            │   minifies+base64-encodes Lua
                                                            │   client-side, emits the !bset output
                                                            └── public/luamin.js (browser minifier)
```

1. **Build-time** (`scripts/build-configurator-data.mjs`, plain Node ESM, no deps) reads
   `configurator-input/`, validates it, and emits two JSON files into
   `src/app/configurator-data/`. It ships **raw Lua** only.
2. **Runtime** (the Angular app) imports that JSON, renders the configurator from it, and
   does minify + base64 in the browser via `public/luamin.js` — exactly like the old
   `lava-config` encoder pages.

Minifying/base64-encoding at runtime (not build time) is intentional: the same tweak
source can be re-encoded with different options without rebuilding, and the encoded
output matches what the old site produced.

## Build pipeline

`scripts/build-configurator-data.mjs` runs via `npm run build:data` (and automatically
before `start` / `build` / `watch`). It:

- Reads `configurator-input/categories/order` → ordered list of categories with column
  placement (`name:left|right`).
- For each category folder: parses `0-choices.md` (H1 → title, `##` → option, fenced code
  → `effectLines`, `@tweakdefs`/`@tweakunits` → `tweakRefs`) and reads `0-info.md`.
- For each tweak folder: reads `0-authors.json`, `0-info.md`, and every `<name>-<version>.lua`
  (sorted by version; versionless files default to `1.0`). Captures the first `--` comment
  line as `firstComment` and the full source as `lua`.
- **Hard-fails** on any structural problem: missing tweak ref, empty category, invalid
  JSON, duplicate versions, folder not in `order`, bad filename casing/format, folder name
  ≠ base filename, folder name not matching `^[a-z0-9-]+$`.

### Output data shapes

`tweaks.json` → `{ tweaks: Tweak[] }`

```ts
interface Tweak {
  name: string;            // folder name, lowercase
  info: string;            // raw 0-info.md markdown
  authors: { name: string; role: string }[];
  versions: {
    version: string;       // "1.0" | "N.N" | "N.N.N"
    file: string;          // original filename
    firstComment: string;  // first -- line (used as a title fallback)
    lua: string;           // raw Lua source
  }[];
}
```

`categories.json` → `{ categories: Category[] }`

```ts
interface Category {
  name: string;            // folder name
  title: string;           // H1 from 0-choices.md
  column: 'left' | 'right';
  info: string;            // raw 0-info.md
  choices: string;         // raw 0-choices.md (for the ? help dialog)
  options: {
    slug: string;          // seoFriendly(H2 title)
    title: string;
    description: string;   // prose under the H2
    effectLines: string[]; // lines inside the fenced block
    tweakRefs: { kind: 'tweakdefs' | 'tweakunits'; name: string }[];
  }[];
}
```

`resolveJsonModule` is enabled in `tsconfig.json` so components `import` these directly.

## Runtime app architecture

Angular 18, **standalone components**, **signals** for local state, no NgModules.

### Bootstrapping & providers (`app.config.ts`)

```ts
providers: [
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes, withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  })),
]
```

### Routing (`app.routes.ts`)

Lazy `loadComponent` routes — each page is its own chunk, so the initial bundle stays
small (~300 KB). The `?` is the configurator; everything else is code-split:

| Path | Component |
|---|---|
| `/` | redirect → `/configurator` |
| `/configurator` | `ConfiguratorComponent` |
| `/tweaks` | `TweakSearchComponent` (library table) |
| `/tweaks/:name` | `TweakSearchComponent` (detail view, same component, driven by `:name`) |
| `/links` | `LinksComponent` |
| `/about` | `AboutCreditsComponent` |
| `**` | redirect → `/configurator` |

Each route sets a browser-tab `title`. `withInMemoryScrolling` restores scroll position
on back/forward.

### Component map

- **`app.component.ts`** — app shell: header with `routerLink` + `routerLinkActive="active"`
  tabs, a mobile menu (`menuOpen` signal), and `<router-outlet/>`. No tab signal anymore;
  navigation is fully URL-driven.
- **`configurator.component.ts`** — the main page. Fully data-driven: dropdowns are derived
  from `categories.json`, no hardcoded config arrays. Owns the output generation
  (`regenerate()`), the `?` help modal, the used-tweaks listing, and the theme toggle.
- **`tweak-search.component.ts`** — the library + detail page. Reads `:name` from
  `ActivatedRoute.paramMap` (with `takeUntilDestroyed`); when absent shows the table, when
  present shows the detail. Uses the `Title` service to set the tab title per tweak.
- **`lua-viewer.component.ts`** — **shared** standalone component used by both the
  configurator and tweak search. Signal inputs (`open`, `name`, `title`, `lua`), `close`
  output, a computed highlighted-HTML + line-gutter, an Escape host listener, and a
  dependency-free Lua syntax highlighter (regex tokenizer → HTML-safe spans).
- **`links.component.ts`** / **`about-credits.component.ts`** — static-ish content pages.

### Services

- **`LuaCodecService`** (`configurator/lua-codec.service.ts`) — the runtime encoder. See
  the next section.
- **`ThemeService`** (`theme.service.ts`) — `lava-theme` localStorage key, `dark` class on
  `<html>`, `prefers-color-scheme` fallback. Constructor calls `apply()` for robustness.
- **`CreditsService`** (`credits.service.ts`) — loads `public/credits.json` for the
  rotating "thanks" line on the configurator.

## Client-side minify + base64 (`LuaCodecService`)

`public/luamin.js` is a browser bundle of **luaparse + luamin** loaded via
`<script src="luamin.js" defer>` in `index.html`, exposing `window.luamin.minify(code, opts)`.

The bundle is luamin v1.0.4, **patched** to honor the options object (vanilla v1.0.4's
`minify()` takes a single arg and ignores options; the patch adds a `renameVariables`
flag read by `generateIdentifier`). `LuaCodecService.encode(lua)`:

1. `window.luamin.minify(lua, { RenameVariables: false, RenameGlobals: false, SolveMath: false })`
   — whitespace/comment stripping only; **local variable names are preserved**, globals
   and table keys/strings are never touched. (`RenameGlobals` is always off; `SolveMath`
   isn't implemented in this build and we want it off anyway.)
2. Prepend up to 3 leading `--` comment lines from the original source (so the minified
   payload still carries the tweak's title/comments).
3. UTF-8 → **Base64URL** (`+`→`-`, `/`→`_`, strip `=`).
4. **Bare-fragment fallback**: a few tweaks (`airlimit`, `epic-commander`,
   `unlimited-screamers`) are raw `{...}` table fragments, not valid standalone Lua, so
   luamin throws. The `catch` encodes the raw source as-is — matching the old site.
5. Results are **cached per source string**, so each tweak is processed once and the
   output field + the per-tweak "b64" copy button produce byte-identical tokens.

## Output generation (`ConfiguratorComponent.regenerate()`)

Walks the dropdowns in category order. For each selected option's `effectLines`:

- `@tweakdefs <name>` → `!bset tweakdefs[N] <b64>` (defs counter, first = no number)
- `@tweakunits <name>` → `!bset tweakunits[N] <b64>` (separate units counter)
- any other `!...` line → collected into a deduped set

Final output order: **all regular `!` commands first, blank line, then the tweak lines at
the bottom**. Each used tweak also gets its label(s) (`tweakdefs`, `tweakdefs1`,
`tweakunits`, …) shown as badges in the used-tweaks list so you can map a row to its
output line. The 0th of each kind renders without a digit.

## `?` help dialog

The raw `0-choices.md` is shipped in `choices` and rendered to HTML with `marked`. Because
Angular's `DomSanitizer` strips form elements (`<button>`, `<input>`, `<select>`) from
`[innerHTML]`, the collapsible-code toggles are `<a>` elements and clicks are handled via
event delegation on the container. `DOMParser` post-processes the marked output to wrap
each `<pre>` in a collapsible `.lava-code-wrap`.

## Theme persistence (no flash)

`index.html` has an inline boot script that reads `localStorage['lava-theme']` and applies
the `dark` class **before paint**, so there's no flash of the wrong theme on load.
`ThemeService` reads/writes the same key and toggles the class.

## Conventions & pitfalls

- **No config data in TypeScript.** Every category/tweak/option comes from the JSON; do
  not hardcode config arrays in components.
- **`@for ... track` must use a simple field** (e.g. `track t.name`), never `??` or other
  complex expressions. Angular's template compiler desugars `??` into an undeclared
  `tmp_N`; Safari strict mode throws `ReferenceError: assignment to undeclared variable
  tmp_N`, while Chrome/Firefox silently allow it.
- **Dynamic interactive elements in `[innerHTML]` must be `<a>`/`<span>`, not form
  elements** — the sanitizer strips `<button>`/`<input>`/`<select>`.
- **Em-dash (`—`) and template literals in edit operations** have caused tool failures in
  this repo; prefer `write` or a `python3` script for targeted replacements when an edit
  is fiddly.
- Author names are always **lowercase**; tweak folder names match `^[a-z0-9-]+$`; tweak
  filenames are lowercase with the base equal to (or starting with) the folder name and a
  `N.N`/`N.N.N` version suffix.

## File map

```
scripts/
  build-configurator-data.mjs        # build-time parser + validator (Node ESM, no deps)
configurator-input/                  # source of truth (see le-plan.md)
  categories/  tweaks/
src/app/
  app.component.ts                   # shell + nav
  app.config.ts                      # providers (router, zone)
  app.routes.ts                      # lazy loadComponent routes
  configurator-data/
    tweaks.json  categories.json     # build output, imported by the app
  configurator/
    configurator.component.ts        # main page: dropdowns, output, help modal, used tweaks
    lua-codec.service.ts             # runtime minify + base64 (cached, bare-fragment fallback)
  tweak-search/
    tweak-search.component.ts        # library table + detail view (driven by /tweaks/:name)
  lua-viewer/
    lua-viewer.component.ts          # shared standalone Lua viewer + syntax highlighter
  links/  about-credits/             # content pages
  theme.service.ts  credits.service.ts
public/
  luamin.js                          # patched luaparse+luamin browser bundle (window.luamin)
  credits.json  img/  favicon.ico
src/index.html                       # luamin <script defer> + theme boot script
src/styles.css                       # .lava-choices, .lava-code-wrap, .lua-* tokens, .nav-link
```

For the input-file format (how to add a tweak, how to write `0-choices.md`, authors JSON,
multiple versions), see **`le-plan.md`**.