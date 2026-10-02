# Riot Titan

A new shielded riot mech by Zop. Clones the Legion T2 commander chassis onto the Armada Bantha walker, strips its commander-ness, and rebuilds it around an energy-fed shield plus riot/EMP weapons. Unlocked from the Armada T3 strategic labs.

# Current effect

**Riot Titan** (`armbanthx`) — built by copying `legcomt2def` and merging in `armbanth`:
- Identity: name "Riot Titan", tooltip "Heavy-Shielded Riot Mech", icon `armbanth`.
- Commander properties removed: `iscommander = nil`, no player name shown, not a builder (`workertime` / `terraformspeed` = 0, empty `buildoptions`, `cancapture = false`), but `capturable` and `reclaimable`.
- Costs: metal ×1.4, energy ×2.5, buildtime ×1.95. No radar/sonar. `explodeas = mistexploxxl`, `paralyzemultiplier = 0.2` (very hard to stun).

**Shield** (repulsor weapon):
- Force 5, power = 33.3% of base health (rounded to 100), regen 2%/s, regen energy = regen × 5, intercept type 65535 (intercepts everything).

**Arms** (`armbantha_fire` repurposed with `armmav`'s riot gun):
- 4 projectiles, spray 1800, weapon velocity ×1.5, reload ×0.75, range 500, sound `kroggie2xs`. Targets `SURFACE` (excludes VTOL / `GROUNDSCOUT`).

**Shoulder** (`tehlazerofdewm` rebuilt from `armthor`'s `thunder`):
- No friendly collision, burst 15 (0.03333 burstrate), reload 0.5, energy/shot ×2, range = shield radius ×1.4, damage ×0.325 (matched across default / commanders / vtol).

**Backpack EMP** (`empgrenade`):
- 3 projectiles, spray 3600, `commandfire = false`, reload ×1.5, range 500 (matches arms), weapon velocity ×0.5 of arms, 10000 dmg, sound `lasfirerb`. Targets `SURFACE EMPABLE` (excludes VTOL / `GROUNDSCOUT`).

**Build menu**: added to `armshltx` and `armshltxuw` (Armada T3 strategic lab + underwater variant).

## 1.0
- Initial release: the Riot Titan unit with energy-fed shield, riot-gun arms, thunder shoulder laser, and EMP backpack, unlocked from the Armada T3 labs.