# Sky Ops

Air rebalance by Zop. Recategorises air units into ATA / ATS / utility buckets, adds cruise orbit behaviour, reworks long-range anti-air (LRAA) reliability, and adjusts air combat + pricing on lava (no-sea) maps.

# Current effect

**Air categorization** — each low-cruise air unit (`cruisealtitude < 1000`, collected into an `allAir` bucket) is sorted into:
- `AIR_ATA` — primary target category `VTOL` (anti-air).
- `AIR_ATS` — anti-surface (non-VTOL targets) or transport carriers.
- `AIR_UTIL` — everything else (utility).

Categorization runs after weapon setup so weapon target categories are authoritative.

**Air price & energy tax** (`tweakAirPrice`) — for armed `allAir` units and T2+ transports:
- Metal cost scaled by `airMCMul = 2`, capped at `airMCCutoff = 12500` (cheaper units get a bigger multiplier).
- Energy cost × `airECMul = 1`; buildtime averaged from the metal/energy multipliers.
- Non-energy-making air units get `onoffable = false` and an energy upkeep (`airDrainMMul = 0.001`, `airDrainEMul = 0.01`).

**Paratroopers / transport flood damage** (`tweakAirTrans`) — transportable units (excluding `cantbetransported`) get a flood-damage multiplier derived from mass: `0.25 → 0.5` scaling with `mass / 750`. Amphibious movement classes (`ATANK`, `ABOT`, `VBOT`, `COMM`, `EPIC`) get a reduced `water_*` flood multiplier (×0.25). Hover units use a flat `0.125`.

**Seaplanes** (`tweakSeaPlane`) — seaplane handling on lava (no-sea) maps.

**LRAA reliability rework** (`tweakScreamers`-adjacent) — long-range anti-air weapons overhauled:
- Reload ×0.5, vtol damage ×0.25, split into two weapons with distinct `proximitypriority` (1 / -1) for better targeting.
- Overpenetration moved to customparams with `overpenetrate_falloff`; `noExplode`, `projectiles = 2`, `sprayangle = 1080`, burst 4 → 2, range ×1.1 (was ×1.25), vtol damage ×0.125.
- Generic screamer vtol damage ×1.5 (was ×2).

## 1.4.5
- Commander paratrooper gating reworked onto the commander evolution system: the base commander (`evocomlvl = 1`) evolves into the paratrooper variant (`armcompt` / `corcompt` / `legcompt`, `evocomlvl = 2`) after the evolution timer — the first lava tide, or 10 min by default (`evocomleveluptime`). The variant retains the `armordef = 'commanders'` armour class. This replaces the earlier flat `paratrooper = true` flag and the 1.4.2 slow-transport (`comm_trans_slow`) gate.
- Epic Dragon (`corcrwt4`) now explicitly handled in the air-price section ("Snowflake price includes Epic Dragon"): health ×1.5, speed ×0.675, and the air-price tax applied (metal ×2, energy ×1, buildtime ×1.5) on top of the T3-air-rework's static values.
- Formatting pass: semicolons dropped, `UnitDefs` aliased to a local `uDefs`, section comments added/renamed. No other balance changes.

## 1.4.2
- Interim version with the slow-transport commander gate (`comm_trans_slow`) and the Epic Dragon pricing override still in place.

## 1.4.0
- Fixed error Black Hydra AA, all following weapons will apply properly again.
- Commanders are no longer paratroopers unless slow transport is enabled in advanced options.
- Removed Epic Tyrannus drones. (Ineffective and buggy, with every update.)
- Added broadside targeting to Epic Tyrannus. (The flagship vs flagship weapons that can be seen between Arm / Cor.)

## 1.3.2
- Air price/energy tax now also applies to T2+ transports (`techlevel > 1`); removed the separate halved `mcMul` for transports.
- `cantbetransported` units are excluded from the paratrooper flood-damage pass.
- Minor comment cleanup.

## 1.3.0
- Major rework. Removed the torpedo buff pass.
- Precompute the `allAir` bucket (low-cruise units) once up front instead of re-scanning.
- Transport cost scaling halved (`mcMul = 1 + (mcMul-1)*0.5`); cost pass gated on having weapons.
- Rewrote transport flood-damage to be mass-based (0.25 → 0.5) with an amphibious water-damage reduction (×0.25); replaced the old flat `0.35` and `cantbetransported = false` behaviour.
- Added an AA drone escort (`legheavydroneaa`) for the Legion carrier.
- LRAA reliability overhaul: faster reload (×0.5), split proximity-priority weapons, overpenetration with falloff, reduced AA damage (×0.125 / ×0.25), burst 4 → 2, range ×1.1 (was ×1.25).
- Recategorization moved after weapon setup; ATS detection now includes transport capacity.
- Fixed `cwID2`/`cWID2` weapon-id typo.

## 1.0.0
- Initial release: air ATA/ATS/utility categorization, cruise orbit behaviour, torpedo buffs to fight T3, air cost/energy tax, transport flood-damage, and LRAA tweaks.