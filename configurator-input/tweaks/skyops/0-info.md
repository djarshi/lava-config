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
- Legion carrier gains an AA drone escort: spawns `legheavydroneaa` (a half-health, AA-only `legheavydrone` clone) via a drone-controller weapon; up to 4 drones, engagement range half the weapon range.
- Generic screamer vtol damage ×1.5 (was ×2).

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