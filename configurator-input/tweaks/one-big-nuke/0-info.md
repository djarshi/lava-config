# One Big Nuke

Nuke rebalance towards a "one big nuke" style: replaces the stock nuke silos and antinukes with a single very expensive experimental ICBM launcher per faction. Originally started by Zopmaxima. Multiple versions preserved (1.3, 1.4, 1.5, 1.6, 1.7).

# Current effect
- Adds `armsiloexp` / `corsiloexp` / `legsiloexp` — experimental ICBM launchers merged from the stock silos with heavy stats (5900 hp, 16M metal, 260M energy, ~4.79M buildtime, max 1 per player).
- Nuke missile: 1,000,000 damage, 3200 AOE, 30s stockpile time, not targetable (antinukes can't intercept it anyway since all antinukes are killed).
- Legion nuke penetrates shields (`shield_aoe_penetration` on the weapondef).
- Buildable from each faction's T2 cons (ack / aca / acv).
- All antinukes disabled (any unit with an `interceptor` weapon is removed from all build menus via `rmvID`).
- All original nukes disabled (`armsilo`, `corsilo`, `legsilo`, `armseadragon`, `cordesolator`).
- Respects the host's `unit_restrictions_nonukes` mod option (big nukes are not created when nonukes is on).
- Localized names + tooltips in en / fr / de / es.

## 1.7
 - Cleaned up and merged with the leaner "another" draft style.
 - Disabling original nukes and antinukes now uses LavaPack's `rmvID` pattern (removes the unit from every builder's build options) instead of zeroing `health` / `maxthisunit`.
 - Kept the `noNukes` mod-option guard, the antinuke-disable loop, the original-nuke-disable list, the 4-language `setDesc` localization, and the `cps` / `wds` indirection from 1.6.

## 1.6
 - Fix: Legion big nuke `shield_aoe_penetration` is now set on the **weapondef** customparams (was on the unit customparams in 1.5, where it had no effect) — the Legion nuke now actually penetrates shields.
 - Cleaned up the tooltip text (1.5 had stray quotes / apostrophe typos).
 - Nil-safety: `buildoptions`, weapon `damage` and weapon `customparams` are initialized before writing.
 - Refactored the three copy-pasted silo blocks into a single `createBigNuke` factory.
 - Dropped the unused `noNukeDef` variable.
 - Contributions from Tyleno (cleaned-up source the merge was based on).
 - Kept the antinuke-disable loop, the original-nuke-disable list, the `noNukes` mod-option guard, and the 4-language descriptions from 1.5.