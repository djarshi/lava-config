# Commando Pack

A commando-bot overhaul by ZopMaxima. Reworks the Cortex commando (`cormando` / `cormandot4`) and adds two new faction variants cloned from it: a **combat** line for Armada and a **utility** line for Legion. Each variant gets its own model, name, build menu, cloaking, weapons and lab.

Note: unit names must contain `cormando` for the `unit_commando_watch.lua` gadget to drive them.

# Current effect

**Cortex (reworked)**
- `cormando` — decluttered (build distance 200, no energy make/storage), cloak rank 2, corpse from `corfast`.
- `cormandot4` — decluttered, cloak rank 3, corpse from `corshiva`, large generic explosion on death/self-destruct.

**Armada — Vandal** (`acormando`, combat commando, from T2 lab `armalab`)
- Cloned from `cormando`, remodeled to `LEGCOMOFF`. HP x1.5, speed 50, cloak rank 3, price x2.5 metal / x1.5 energy.
- Can manual-fire, resurrect and restore. Build menu: eyes, ferret, pb, drag, claw, atlas, hvytrans, amex.
- Left: rapid-fire machine gun (range 380, burst 3, overpenetrating). Right: high-explosive missile launcher as dgun.

**Armada — Epic Vandal** (`acormandot4`, heavy combat commando, from T3 gantry `armshltx` / `armshltxuw`)
- Cloned from `cormandot4`, remodeled to `LEGCOMT2COM`. HP x2, speed 30, cloak rank 4.
- Left: dual rapid-fire MG (range 420, overpen, x3 damage). Shoulder: burst-fire gauss cannon as stockpiled dgun (60 metal/shot, stockpile limit 6).

**Legion — Saboteur** (`lcormando`, utility commando, from T2 lab `legalab`)
- Cloned from `cormando`, remodeled to `LEGCOM`. HP x0.75, speed 50, cloak rank 1 (cheap), price x0.75 metal / x3 energy.
- Radar 1250, can manual-fire and capture. Build menu: eyes, rad, jam, rl, cib, lts, scout.
- Left: incendiary machine gun (range 300, area burn on hit). Right: shieldbreaker grenade as stockpiled dgun (5000 energy/shot, double damage vs shields, water weapon).

**Legion — Epic Saboteur** (`lcormandot4`, refined utility commando, from T3 gantry `leggant` / `leggantuw`)
- Cloned from `cormandot4`, remodeled to `LEGCOM`. HP x0.75, speed 55, cloak rank 2. Radar 1800, can manual-fire and capture.
- Left: heavy incendiary autocannon (beam laser, burst 6, area burn 60 dmg / 4s, range 300). Right: shieldbreaker burst (25000 energy/shot). Shoulder: Juno beam (anti-radar/jammer, NOTAIR only).

**Juno targeting**
- Ground scouts, light air scouts and radar/jammer units are tagged with the `JUNOTARGET` category so the Legion Juno beam can prioritize them.

## 1.2
- Initial release of the four faction commando variants (Vandal, Epic Vandal, Saboteur, Epic Saboteur) plus the Cortex reworks and the Juno-target pass.