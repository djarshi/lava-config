# Lava Config v2

A data-driven configurator for BAR (Beyond All Reason) "lava" tweaks. Replaces the old
vanilla HTML/JS site (`lava-config`). You pick options from a set of dropdowns and it
produces a block of `!bset tweakdefs / tweakunits` commands (minified, base64-encoded Lua)
to paste into the game.

Everything the configurator shows comes from structured input files under
`configurator-input/` — no config data is hardcoded in the app. A build script turns those
files into JSON; the Angular app reads that JSON and does the minify + base64 encoding in
your browser at runtime.

## Quick start

Prerequisites: Node.js 18+ (tested on Node 22) and npm.

```bash
npm install        # install Angular CLI + deps locally
npm start          # build the data JSON, then serve the app at http://localhost:4200
```

Open <http://localhost:4200>. The configurator is the default route; the **Tweak library**
tab lists every tweak with a detail view per version.

## npm scripts

| Script | What it does |
|---|---|
| `npm start` | `build:data` then `ng serve` (dev server with HMR at :4200) |
| `npm run build` | `build:data` then `ng build` (production build to `dist/`) |
| `npm run watch` | `build:data` then `ng build --watch --configuration development` |
| `npm run build:data` | only run the input → JSON pipeline (`scripts/build-configurator-data.mjs`) |

`build:data` runs automatically before `start` / `build` / `watch`, so you normally don't
invoke it by itself — but it's useful to run it on its own to validate your input files
fast (it hard-fails on any structural problem; see [Validation](#validation) below).

## Project layout

```
configurator-input/          # source of truth — edit these
  categories/                # dropdowns + choices (one folder per category)
  tweaks/                    # Lua packs (one folder per tweak)
  _reference/                # non-tweak Lua from contributors (not scanned by the build)
scripts/
  build-configurator-data.mjs   # input → JSON parser + validator (Node ESM, no deps)
src/app/
  configurator-data/         # build OUTPUT: tweaks.json + categories.json (imported by the app)
  configurator/              # the configurator page + LuaCodecService
  tweak-search/              # the library + detail page
  lua-viewer/                # shared Lua source viewer
  ...                        # app shell, routes, theme service, etc.
public/
  luamin.js                  # patched luaparse+luamin browser bundle
```

- **`configurator-input/`** is what you edit. See `le-plan.md` for the full format.
- **`src/app/configurator-data/*.json`** is generated — don't edit by hand; run the build.
- For how the app is wired (routing, services, the runtime minify pipeline), see
  **`ARCHITECTURE.md`**.

---

## How to add a tweak

A tweak is one folder under `configurator-input/tweaks/`. The folder name is the tweak's
identity — it's what you reference from category choices and what shows in the URL
(`/tweaks/<name>`).

### 1. Create the folder

Folder name rules (the build enforces these):

- lowercase, digits, and hyphens only: `^[a-z0-9-]+$`
- no underscores, no spaces, no uppercase
- make it descriptive and stable — it becomes the permanent tweak id

```bash
mkdir configurator-input/tweaks/my-cool-tweak
```

### 2. Add `0-authors.json`

An array of `{ name, role }`. **Names are always lowercase.** Roles are free text; the
library table shows anyone with role `developer` as the author, and the detail page lists
every role. Common roles: `developer`, `supporter`, `contributor`.

```json
[
  { "name": "djarshi", "role": "developer" },
  { "name": "zopmaxima", "role": "supporter" }
]
```

### 3. Add `0-info.md`

Markdown description of the tweak. The **H1 is the title** (shown in the library table and
the detail header); the rest is rendered as HTML on the detail page. Include a short intro
and, ideally, a "Current effect" list and a `## <version>` changelog section per version.

```markdown
# My Cool Tweak

Does something cool to a unit.

## Current effect
- Reworks the Foo into a T2 unit
- Adds a new Bar

## 1.0
- initial release
```

### 4. Add the Lua file(s)

One `.lua` file per version. Filename rules (enforced):

- all lowercase
- either equal to the folder name (`my-cool-tweak.lua`, version defaults to `1.0`)
  **or** `<folder>-<version>.lua` where version is `N.N` or `N.N.N`
- the base name must equal the folder name or start with `<folder>-`

```bash
# version 1.0 (versionless file is fine for the first version)
configurator-input/tweaks/my-cool-tweak/my-cool-tweak.lua

# a later version
configurator-input/tweaks/my-cool-tweak/my-cool-tweak-1.1.lua
```

The **first `--` comment line** of each Lua file is used as a short title in the UI, so
start the file with a helpful comment:

```lua
-- My Cool Tweak v1.0
local function apply(unitName)
  ...
end
```

### 5. (If it's a bare table fragment) nothing extra needed

A few tweaks (`airlimit`, `epic-commander`, `unlimited-screamers`) are raw `{...}` table
fragments, not valid standalone Lua. The runtime encoder detects the minifier failure and
falls back to base64-encoding the raw source — just drop the file in as usual.

### 6. Wire it into a category

A tweak only appears in the configurator output when a category option references it via
`@tweakdefs` / `@tweakunits` (see [How to manage choices](#how-to-manage-add-choices-in-the-categories)
below). Until then it shows up in the **Tweak library** tab but isn't selectable in the
configurator.

### 7. Build and verify

```bash
npm run build:data     # should finish with "tweaks: N, categories: 9, versions: M"
npm start              # check it appears in the library and (if wired) in the configurator
```

If the build throws, read the message — it tells you exactly which file and which rule
failed (see [Validation](#validation)).

### Reference Lua from contributors

If someone sends you a `.lua` to look at but it isn't a real tweak (wrong filename, not
meant to ship yet, etc.), put it in `configurator-input/_reference/`. That folder is
outside the build's tweak scan, so it won't be validated or emitted — but it lives with
the repo so it's easy to find later.

---

## How to manage / add choices in the categories

Categories are the dropdowns. Each category is one folder under
`configurator-input/categories/`, and its options (the dropdown entries) are defined in
`0-choices.md`.

### 1. Register the category in `order`

`configurator-input/categories/order` is a single line of `name:left` or `name:right`
entries, space-separated, in display order. The `left`/`right` is which column the
dropdown lands in on desktop.

```
base:left economy:left maps-tides:left air:left lrpc:left commanders:right nukes:right special-units:right stealth-units:right
```

To add a new category, add its `name:column` entry here in the position you want it to
appear. A folder that exists but isn't listed here is a build error.

### 2. Create the category folder + `0-choices.md`

```bash
mkdir configurator-input/categories/my-category
```

`0-choices.md` format:

- **`#` H1** = the category title (shown as the dropdown label)
- **`##` H2** = one dropdown option. The option's slug is derived from the heading
  (`seoFriendly(title)`), and the **first `##` option is selected by default**.
- **prose** under the `##` = the option's description
- a **fenced code block** under the `##` = the option's effect lines — these are the lines
  that get emitted into the configurator output when this option is chosen

```markdown
# My Category

## Standard
The default behaviour, no changes.

```
@tweakdefs my-cool-tweak
@tweakunits my-cool-tweak
!bset someotherthing 1
```

## With extra stuff
Enables the cool tweak plus another.

```
@tweakdefs my-cool-tweak
@tweakdefs another-tweak
```
```

### 3. Effect line syntax (inside the fenced block)

| Line | Meaning |
|---|---|
| `@tweakdefs <name>` | include the tweak's **defs** (emitted as `!bset tweakdefs[N] <b64>`) |
| `@tweakunits <name>` | include the tweak's **units** (emitted as `!bset tweakunits[N] <b64>`) |
| `!anything ...` | any other `!` command, passed through verbatim |

`<name>` is the **lowercase tweak folder name** — no version, no `${...}`. If the name
doesn't match an existing tweak folder, the build hard-fails.

The defs counter and units counter are separate and increment across the whole
configurator walk in category order. The first of each kind is emitted with **no number**
(`tweakdefs`, `tweakunits`); subsequent ones get `tweakdefs1`, `tweakunits1`, `tweakdefs2`…
The used-tweaks list shows each tweak's label badge(s) so you can map a row to its output
line.

### 4. Add `0-info.md` (optional but recommended)

A short markdown blurb for the category. Shown in the `?` help dialog.

### 5. The `?` help dialog

The **raw `0-choices.md`** is also shipped in the JSON and rendered as HTML (via `marked`)
in the `?` modal, so users can read the full prose, descriptions, and code blocks. Code
blocks are collapsible. You don't need to do anything extra for this — just write the
markdown readably.

### 6. Build and verify

```bash
npm run build:data
npm start
```

The new category appears as a dropdown in the configured column and position. Its first
option is selected by default; changing it updates the output and the used-tweaks list
live.

---

## Validation

`npm run build:data` **hard-fails** (non-zero exit, a message naming the file and the
rule) on any of:

- a category folder not listed in `order` (or an `order` entry with no folder)
- an empty category (no `##` options in `0-choices.md`)
- an `@tweakdefs` / `@tweakunits` reference to a tweak folder that doesn't exist
- invalid JSON in `0-authors.json`
- duplicate versions within one tweak folder
- a tweak `.lua` filename with uppercase, wrong base name, or a bad version suffix
- a tweak folder name that doesn't match `^[a-z0-9-]+$`
- a `.lua` filename whose base doesn't equal the folder name or start with `<folder>-`

This is intentional — the configurator must never silently ship a broken setup. Fix the
named file and re-run.

## Testing locally

```bash
npm start          # http://localhost:4200
```

Then click through:

- **Configurator** — change dropdowns; the output textarea and the used-tweaks list update
  live. Click `?` on a category for the help dialog. Click **View** on a used tweak to see
  its Lua; click **b64** to copy its minified base64 token. "Browse the full tweak library"
  links to the library.
- **Tweak library** — table of all tweaks; click a row for the detail view (all authors,
  full info, every version newest-first with a **View Lua** button per version). Browser
  back/forward works (real URL routes).
- **Theme** — toggle dark/light; the choice persists across reloads (no flash on reload).
- **Build parity** — the token in the output field and the token copied by a tweak's **b64**
  button are byte-identical (same encoder, same cache).

A production build sanity-check:

```bash
npm run build      # outputs dist/, fails the same way build:data does on bad input
```

## Further reading

- **`le-plan.md`** — the input-file format reference (the source of truth for tweak /
  category authoring).
- **`ARCHITECTURE.md`** — how the Angular app is wired: routing, services, the runtime
  minify + base64 pipeline, and the conventions/pitfalls that shaped it.