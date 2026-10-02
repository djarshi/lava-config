# T3 Air Rework

An end-game air overhaul by Tyleno. Adds a dedicated **T3 Aircraft Gantry** for each faction (cloned from the T2 air plant, buildable from the T2 con-planes) and reworks a roster of T4/experimental aircraft into named apex units with rebalanced stats and weapons. The gantries also let any faction build all three con-planes (cross-faction T2 air construction).

# Current effect

**T3 Aircraft Gantry (new building, one per faction)**
- `armapt3` (Armada), `corapt3` (Cortex), `legapt3` (Legion) — cloned from `armap`/`corap`/`legap`. 8500 metal, 60000 energy, 72400 buildtime, 11100 hp, 600 BP, mobile builder (can't reclaim), footprint 18x12 / 16x12.
- Tagged `unitgroup="buildert3"`, `techlevel=3`, `restrictions_inclusion="_noair_"`.
- Buildable from the T2 con-planes (`armaca` / `coraca` / `legaca`).
- Build menus:
  - **Armada**: con-planes + Hornet, Apex Flying Epoch, Grand Liche.
  - **Cortex**: con-planes + Epic Dragon, Black Hydra, Drone Carrier.
  - **Legion**: con-planes + Legion Rocket Siege Gunship, Apex Tyrannus.
- All three con-planes are guaranteed present in every gantry's build menu.

**Reworked aircraft**

- **Hornet** (`armblade`, heavy assault gunship) — 15000 hp, speed 160, hover-attack; weapons bumped to >=390 range, <=0.45 reload, >=125 dmg.
- **Apex Flying Epoch** (`armfepocht4`) — 125000 metal, 150000 hp, speed 36, radar 2700, cruise alt 180. Ferret missiles (range 1000, 2250 vs air), flak (range 850), heavy plasma (range 2450, 850 dmg + 850 vs air).
- **Grand Liche** (`armlichet4`, triple-salvo nuclear missile carrier) — 18000 metal, 23000 hp, speed 200. Nuclear missile repurposed into a tracking MissileLauncher: range 1050, burst 3, 15s reload, 800 AOE, 15000 dmg (3500 vs commanders, 2500 vs air).
- **Black Hydra** (`corfblackhyt4`, apex aerial battle fortress) — 145000 metal, 170000 hp, speed 42, cruise alt 180. "Death Star Superlaser" beam (range 1400, 30000 dmg), heavy laser (1500 dmg), ferret missiles (750 vs air). Camerashake zeroed on all weapons.
- **Epic Dragon** (`corcrwt4`) — 75000 metal, 65000 hp, speed 105. Krow laser battery (12-round burst, 1500/2500 dmg), edragon missiles (225 vs air), kmaw gun (100 dmg).
- **Laser Drone** (`cordrone`) — 4000 hp; heat-ray weapon (range 650, 225 dmg).
- **Drone Carrier** (`cordronecarryair`) — 30000 metal, 70000 hp, speed 40. Spawns up to 10 Laser Drones (5 starting), engagement range 1300, control radius 1100, spawn rate 6.
- **Legion Rocket Siege Gunship** (`legmost3`) — 15000 metal, 18000 hp, speed 130. Heavy rocket (range 1050, 6-round burst, 500 dmg).
- **Apex Tyrannus** (`legfortt4`) — 100000 metal, 200000 hp, speed 30, radar 2200, cruise alt 180. Triple plasma (range 1400, 1600 dmg), semiauto (range 900, fast 0.1 reload), AA missiles (range 1400, 300 vs air).

## 0.6
- Initial release: three T3 Aircraft Gantries, cross-faction con-plane access, and the nine aircraft reworks (Hornet, Apex Flying Epoch, Grand Liche, Black Hydra, Epic Dragon, Laser Drone, Drone Carrier, Legion Rocket Siege Gunship, Apex Tyrannus).