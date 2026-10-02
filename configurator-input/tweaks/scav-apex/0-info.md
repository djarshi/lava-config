# SCAV Apex

An end-game scavenger-tier unit pack by Tyleno. Adds three "Apex" super units by deep-copying existing epic units, rebalancing their stats and weapons, and unlocking the scavenger variants (`*_scav`) from the T3 ganties.

Note: the `*_scav` Apex UnitDefs are created later by BAR in `createScavengerUnitDefs()`, so the tweak inserts the future IDs into the build menus at tweakdefs time (validated only after post-processing).

# Current effect

**Apex Titan** (`armapextitan`, from `armbanth` — Armada)
- A walking epic pulsar with 1.8M health. Metal ~386k, energy ~8.18M, buildtime ~2.86M (all /1.10), speed 36, sight 1500, radar 1800.
- Primary heavy siege beam: range 1150, 21000 dmg (31500 vs shields, 7000 vs commanders), 18000 energy/shot.
- Supporting missile battery: range 1100, 3500 dmg, 6000 energy/shot.
- Close/mid blaster: range 650, 1200 dmg.
- Unlocked from `armshltx` / `armshltxuw` / `armgant` / `armgantuw` as `armapextitan_scav`.

**Apex Juggernaut** (`corapex`, from `corkorg` — Cortex)
- Close-range powerhouse, 1.9M health. Metal ~545k, energy ~10.9M, buildtime ~3.86M, speed 30, turn-in-place.
- Overload Annihilator (fire/laser/rocket): range 560, 14000 dmg (10500 vs shields), 40000 energy/shot, huge 380 AOE.
- Overload Beam: 30000 dmg (22500 vs shields, 15000 vs commanders), 96 AOE.
- Overload Missile Battery: range 1100, 3500 dmg.
- Unlocked from `corgant` / `corgantuw` as `corapex_scav`.

**Apex SOL** (`apexsol`, from `legeheatraymech_old` — Legion)
- Ranged devastator, 1.65M health. Metal ~591k, energy ~10M, buildtime ~4.36M, speed 32, sight 1100, radar 1800. Immune to paralysis.
- SOL Pulsing Laser: range 850, fast 0.2s reload, 800 dmg (320 vs commanders, 0 vs air), 1000 energy/shot.
- Flak AA gun: range 1400, 600 dmg vs air, burst 4.
- Unlocked from `leggant` as `apexsol_scav`.

## 1.2
- Balanced build power to be higher for each unit.
- New unit descriptions.
- Initial Apex Titan, Apex Juggernaut and Apex SOL definitions with rebalanced stats/weapons and T3 gantry unlocks.