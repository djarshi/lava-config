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


