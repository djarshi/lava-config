# Nukes

Things about nukes... they still can be buggy.

## Just big expensive nuke
One big expensive ICBM. Can't be stopped - if you have like 15-20M metal costs.

```effect
!unit_restrictions_nonukes 1
@tweakdefs ${ONE_BIG_NUKE}
```

## One nuke / anti-nuke
One Armada nuke each.

```effect
!unit_restrictions_nonukes 0
@tweakdefs ${ONE_NUKE_ARM}
```

## Both. Both is good
One big expensive ICBM + One Armada nuke each.

```effect
!unit_restrictions_nonukes 0
@tweakdefs ${ONE_NUKE_ARM}
@tweakdefs ${ONE_BIG_NUKE}
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

