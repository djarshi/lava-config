# Description
Hi, i'm Djarshi a player in the game Beyond all Reason.

Around 2024 I've started writing tweaks in Beyond All Reason since we've played alot of lava. I like the economy aspect of the game. I sometimes like tower defense games. But for this I liked the chokepoint.
Scaling up and hammering epic weapons to eachother. This led to a collection of tweaks that help support economy, slow down some early-game enders

After a while we did separate out some tweaks. This tweak is often used in conjunction with QoL which is made by ZopMaxima. As of v5.2 it also carries contributions from txpera, Tyleno, Songi, Inimitable_Wolf and oldmanyoung.

# Current effect
- Changes epic converter size to footprint of an AFUS.
- Adds Epic Metal extractor (costly to keep functioning tho -500 E/s)
- Adds Epic Geothermal powerplant with shield. (Stargate Atlantis style)
- Adds Epic construction turret 3000BP and a slight reduced 2000 reclaim.
- Adds Legendary AFUS (MAX 1 per player)
- Adds Legendary Energy Converter (converts 30,000 energy into 750 metal/s, limit 5, cloaked/stealthed, built from all T2 cons)
- Adds Roomba (epic battlefield vacuum, 4000 BP, speed 290, built from T3 air plants)
- EMP silo stockpile limited to 5 (armemp / cortrem / legperdition)
- Behemoths x2.5 price, legion mech x1.5
- Pawn launcher & unit cannons are removed.
- Disables sea lab functions if LAVA
- T2 air of other races in experimental aircraft plant

## 5.2
 - New unit: Legendary Energy Converter (`legendaryenergyconverter`, cloned from `legadveconv`) — converts 30,000 energy into 750 metal/s, limit 5, cloaked + stealthed (sonar stealth too), 10k hp, radar 2500, built from all three factions' T2 cons (aca/ack/acv) via `addC`.
 - New unit: Roomba (`armfify_t3resbot`, cloned from `armfify`) — epic battlefield vacuum, 4000 BP, speed 290, 250 hp, vtol armor, built from the T3 air plants (`armapt3` / `corapt3` / `legapt3`).
 - EMP stockpile limit: `armemp`, `cortrem` and `legperdition` now capped at `stockpilelimit = "5"`.
 - Contributions from: txpera, Tyleno, Songi, Inimitable_Wolf, oldmanyoung.
 - Note: the build-option calls for the new units use `addC(builder, unit)` directly (matching the per-builder signature) rather than `addU2BO`.

## 5.1
 - New: setDesc helper — writes i18n_<lang>_humanname/_tooltip across en/fr/de/es.
 - New: T3 Advanced Fusion reactors (armafust3/corafust3/legafust3) are now scaled from their T2 fusion via mulAfus:
     - hp x1.5, energymake x10, buildtime = T2 x 10 x 0.75, cost x8, custom explosion.
     - Arm T3 fusion gets energystorage x 1.5 and stealth = true (faction flavor).
     - All three get localized tooltips showing their energy output.
 - Safer access — previously unconditional lines that would crash if a unitdef was nil are now guarded:
     - armbotrail disable → if uDefs["armbotrail"] then
     - armvulc / corbuzz x10 → each wrapped in if uDefs[...] then
 - Shipyards are now only disabled on lava maps — the armsy/armasy/etc. zeroing block moved inside if noSea then. On normal maps shipyards survive.
 - Removed the corjugg x2.5 and legeheatraymech / legeheatraymech_old x1.5 cost tweaks (gone entirely).
 - cheapermake neutralized — multiplier changed from 0.9 to 1 (no actual discount anymore; the loop is kept but is a no-op) and made nil-safe (energymake or 0).
 - Adds a mulConv function for shrinking converter footprints (collision volumes, yardmap, feature dead/heap), but it's defined and never called — dead code in this version; the old table.merge footprint-6 fix is still what runs.

## 4.15
 - Refactor: renames addUnitToBO → addU2BO, consistently uses the uDefs alias.
 - Adds helpers: round10, allBOs (every unit with buildoptions), rmvBOArr/rmvID — the tweak can now remove buildoptions, not just add them.
 - Epic Construction Turret gets reclaimspeed = 2000 (new — faster reclaim).
 - New: cheapermake — every unit that produces energy gets -10% metal/energy cost (* 0.9).
 - New: lava/no-sea handling (if noSea then, where noSea = mods.map_waterislava):
     - Syncs armuwgeo minwaterdepth from coruwgeo.
     - Sets maxwaterdepth on all metal extractors / geothermals.
     - On hover-tide maps: strips buildoptions from eco units, forces waterline=0/minwaterdepth=1 on the rest, tags enabled_on_no_sea_maps.
     - Disables submerge + zeroes maxwaterdepth for cruise-altitude (air) units.
 - Keeps the v4.13 cost multipliers (corjugg x2.5, heatray mechs x1.5, Berthas x10) and the unconditional shipyard/botrail disable.

## 4.13
 - Defines the four new T3 units (nanotct3, ageot3, afuslegendary, t3mmex) and wires them into all three factions' T2 cons.
 - Legendary Fusion (afuslegendary) is scaled off the normal armafus (x30 cost, x50 energy, x10 hp, maxthisunit=1).
 - Cost tweaks: corjugg x2.5, legeheatraymech / legeheatraymech_old x1.5, Bertha/Vulcan/Starfall (armvulc/corbuzz/legstarfall) x10.
 - Disables armbotrail (health=0) and all shipyards (armsy, armasy, corsy, corasy, legsy, legasy) unconditionally.
 - Converter size fix for armmmkrt3/cormmkrt3/legadveconvt3 (footprint 6x6).