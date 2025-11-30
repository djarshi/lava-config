# Maps & Tides

Changes the lava levels during game

## Supreme Isthmus - 10m grace - hovers after 
A 10 minute high and rest of game lower tide which makes a wide front but not open entirely.  
Included also managed height differential of the map with extremebelow.  
Islands have some buildspace for AA/lrpcs if on. This allows for some more tactics, but also annoyances.  
  
```
!map Supreme Isthmus v2.1
!bSet map_lavatiderhythm enabled
!bSet map_lavahighdwell 600
!bSet map_lavalowdwell 10000
!bSet map_waterlevel -100
!bSet map_lavahighlevel 120
!bSet map_lavalowlevel 74
!bSet map_lavatidemode lavastarthigh
!bset debugcommands extremebelow -25 0.125

```

## Supreme Isthmus - 10m grace - slight higher lava 
A 10 minute high and rest of game lower tide which makes a wide front but not open entirely.  
Included also managed height differential of the map with extremebelow.
```
!map Supreme Isthmus v2.1
!bSet map_lavatiderhythm enabled
!bSet map_lavahighdwell 600
!bSet map_lavalowdwell 10000
!bSet map_waterlevel -70
!bSet map_lavahighlevel 90
!bSet map_lavalowlevel 55
!bSet map_lavatidemode lavastarthigh
!bset debugcommands extremebelow -25 0.125

```

## Supreme Isthmus - 7/5 tides
This is a 7 minute high, 5 minute low tide. 7minute middle is closer for t1 units.   
It's enough to cross the middle for 5minutes..
```effect
!map Supreme Isthmus v2.1
!bSet map_lavatiderhythm enabled
!bSet map_lavahighdwell 420
!bSet map_lavalowdwell 300
!bSet map_waterlevel -70
!bSet map_lavahighlevel 90
!bSet map_lavalowlevel 70
!bSet map_lavatidemode lavastarthigh
!bset debugcommands extremebelow -25 0.125
```

## Supreme Isthmus - 5/5 superlowtide
A 15 minute high and rest of game lower tide which makes a wide front but not open entirely
A 7minute high and 5minute lower tide.
```
!map Supreme Isthmus v2.1
!bSet map_lavatiderhythm enabled
!bSet map_lavahighdwell 420
!bSet map_lavalowdwell 300
!bSet map_waterlevel -70
!bSet map_lavahighlevel 90
!bSet map_lavalowlevel 0
!bSet map_lavatidemode lavastarthigh
!bset debugcommands 0
```

## Supreme Isthmus - Front open & Hovers work
Continuous low tide
```
!map Supreme Isthmus v2.1
!bset map_waterislava 1
!bset map_lavatiderhythm enabled
!bset map_lavatidemode lavastarthigh
!bset map_lavahighlevel 1
!bset map_lavahighdwell 1
!bset map_lavalowlevel 0
!bset map_lavalowdwell 3600
!bset debugcommands extremebelow -25 0.125
```

## Pinch point
ok.. settings.. fix ( std norm, low can be -20 -30)
```
!map Supreme Isthmus v2.1
!bset map_waterislava 1
!bset map_lavatiderhythm enabled
!bset map_lavatidemode lavastarthigh
!bset map_lavahighlevel 1
!bset map_lavahighdwell 1
!bset map_lavalowlevel 0
!bset map_lavalowdwell 3600
!bset debugcommands extremebelow -25 0.125
```

## FolsomDamR 2v2 Lava
A simple lava experience if you have a low amount of players. Lava stays high for 10 minutes, and then for 5 minutes the lava of the bottom half completel receeds.
```
!map FolsomDamR 1.17
!bset map_waterislava 1
!bset map_lavatiderhythm enabled
!bset map_lavatidemode lavastarthigh
!bset map_lavahighlevel 70
!bset map_lavahighdwell 600
!bset map_lavalowlevel 0
!bset map_lavalowdwell 300
!bset map_waterlevel -20
```

## PtaQ map - 2 Lava Continents
2 big landmasses seperated by a shallow lava river. Hovers can cross it, and otehr units with enough health. The lava river is not wide, making artillery attacks possible between the islands.
After 10 minutes the lava between the islands lowers, making them one, but the surrounding lava does not receed.
```
!map Why did I let Ptaq talk me into this 1.0
!bset map_waterislava 1
!bset map_lavatiderhythm enabled
!bset map_lavatidemode lavastarthigh
!bset map_lavahighlevel 25
!bset map_lavahighdwell 600
!bset map_lavalowlevel 0
!bset map_lavalowdwell 300
!bset map_waterlevel -30
```

## Adamantium Factory Lava FFA metalmap
Huge amount of metal islands seperated by lava. lava is up for 4 minutes, and then stays low for 5
Whats special about this configuration is that lava is not deep at all and doesnt slow much.
```
!map Adamantium Factory V1
!bset map_waterislava 1
!bset map_lavatiderhythm enabled
!bset map_lavatidemode lavastarthigh
!bset map_lavahighlevel 205
!bset map_lavahighdwell 600
!bset map_lavalowlevel 180
!bset map_lavalowdwell 300
!bset map_waterlevel 0
```
