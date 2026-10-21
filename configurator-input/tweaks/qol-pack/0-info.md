# QoL Pack

Quality-of-life patch by Zop (Quad Pharos pick by MGGW). Covers converters, AFUS tuning, point-defense and mini-experimental balance — aimed at smoother lava economy flow.

## 1.5
- **Mini plasma 'Cerberus' alternatives** (`armminivulc` / `corminibuzz` / `legministarfall`): prices raised via the new `mulPrice` helper (metal ×2, energy ×5), and `corminibuzz` is now also added to the Cortex cons build options.
- **Mini plasma range retune**: `corminibuzz` range ×1.3 (was ×1.25); `armminivulc` and `legministarfall` ×1.25. Cross-faction range-balance offsets adjusted to match (Cortex baseline +60, Armada −45, Legion −20 vs the Cortex range).
- **Legion epic defense** (`legdoomt3` railgun, `armagmheat`): default damage explicitly set to **5000**.
- Removed the `armannit3` (Annihilation T3) `unitmidpos`/`unitaimpos` positioning tweak; renamed the "Pulsar vs Pulsar" section to "Pulsar Problems".
- Refactor: extracted a shared `mulPrice(def, mMul, eMul)` helper for metal/energy/buildtime scaling, and switched several `UnitDefs` lookups to a local `uDefs` alias.

## 1.4
- Prior release (converters / AFUS tuning / Quad Pharos pick work).

## 1.1.1
- Initial tracked release.