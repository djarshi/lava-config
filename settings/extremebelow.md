# T3 in lava

This manages the height differential of the map. So we can steer how high units come out of the lava. 
This in turn allows them to move faster in lava.

## T3 is 90% of normal speed in lava
Yes we like a bit more speed. Lava is already a close off so more eco can occur. 
This setting reduces the chance of it becoming an all air ending situation.
```effect
!bset debugcommands extremebelow -25 0.125
```
An attempt was made at a setting change request. To the bar developers. It was declined. A workaround exists, the extremebelow setting.  
*Credits:* Thanks to ZopMaxima for figuring this one out


## T3 very slow in lava (gamedefault)
Game default which we didnt like.
```
!tide repeat
```
