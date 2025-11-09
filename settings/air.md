# Air
Changes to air units

## Sky Operations
More expensive stuff. Air units drop their trasnsports as paratroopers as well as AA is improved.

```effect
!bSet unit_restrictions_noair 0
@tweakdefs ${SKYOPS}
@tweakdefs ${UNLIMITED_SCREAMERS}
```

## Paratroopers
No fall damage for dying transports. AA is improved though.

```effect
!bSet unit_restrictions_noair 0
@tweakdefs ${PARATROOPERS} 
@tweakdefs ${UNLIMITED_SCREAMERS}
```

## Normal air - burning CPU
If your CPU can take endgame ¯\\(ツ)/¯
```effect
!bSet unit_restrictions_noair 0
```

## Reduced air / airlimit

This is meant to change the way air is played in lava games. Disables T3 air, and limits every other air unit to 10 per player, except for bombers, dragons, liches,.. those are 1 per player only.

- T3 air disabled
- Air units are 10 per player.
- Bombers and heavy air is 1 per player.

Great when used along lootboxes, which result in interesting early to mid game air fights. Still allows for air play at the cost of higher APM, but does not block the sun. Air attacks are possible, yet require coordination and can be thwarted by porcing behind AA.  
Great when lootboxes is on, Then you need a minimal air..  
Also great if you want to reduce some spam and SkyOps is not enough.

**Credits:** `slupka`  

```
@tweakunits ${AIRLIMIT}
```

## Air Off
In case you like long games.
Turning on special unit 'EngiBoss' and or riot titan is highly recommended in this case.
```
!bSet unit_restrictions_noair 1
```
