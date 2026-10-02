# Nukes

Things about nukes... they still can be buggy.

## Just big expensive nuke
One big expensive ICBM. Can't be stopped - if you have like 15-20M metal costs.

```effect
!unit_restrictions_nonukes 1
@tweakdefs one-big-nuke
```

## One nuke / anti-nuke
One Armada nuke each.

```effect
!unit_restrictions_nonukes 0
@tweakdefs one-nuke-arm
```

## Both. Both is good
One big expensive ICBM + One Armada nuke each.

```effect
!unit_restrictions_nonukes 0
@tweakdefs one-nuke-arm
@tweakdefs one-big-nuke
```

## Definitely no nukes
It keeps being buggy if alot of nuke launchers. So off is a safe choice.

```effect
!unit_restrictions_nonukes 1
```

## Nukes allowed 
Are we sure here?
```effect
!unit_restrictions_nonukes 0
```