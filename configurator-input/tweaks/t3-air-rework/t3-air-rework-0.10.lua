-- T3 Air Rework v0.10 (Tyleno)
-- Fixed T3 Arm Air Lab (Songi) + various experimental air unit buffs (Tyleno)

local U = UnitDefs

----------------------------------------------------------------------
-- Armada T3 Aircraft Plant → use Cortex model + script
----------------------------------------------------------------------
do
	local u = U.armapt3
	local source = U.corapt3

	if u and source then
		u.objectname = source.objectname or "Units/CORAPT3.s3o"
		u.script     = source.script     or "Units/CORAPT3.cob"

		if source.collisionvolumeoffsets then
			u.collisionvolumeoffsets = source.collisionvolumeoffsets
		end
		if source.collisionvolumescales then
			u.collisionvolumescales = source.collisionvolumescales
		end
		if source.collisionvolumetype then
			u.collisionvolumetype = source.collisionvolumetype
		end
	end
end

----------------------------------------------------------------------
-- Apex Flying Epoch
----------------------------------------------------------------------
do
	local u = U.armfepocht4
	if u then
		u.name           = "Apex Flying Epoch"
		u.metalcost      = 125000
		u.energycost     = 2500000
		u.buildtime      = 1000000
		u.health         = 150000
		u.speed          = 36
		u.radardistance  = 2700
		u.cruisealtitude = 180

		local w = u.weapondefs or {}

		local x = w.ferret_missile
		if x then
			x.range      = 1000
			x.reloadtime = 1.4
			x.damage     = x.damage or {}
			x.damage.vtol = 2250
		end

		x = w.flak
		if x then
			x.range      = 850
			x.reloadtime = 0.53333
			x.damage     = x.damage or {}
			x.damage.vtol = 250
		end

		x = w.heavyplasma
		if x then
			x.range          = 2450
			x.reloadtime     = 3
			x.areaofeffect   = 128
			x.accuracy       = 150
			x.sprayangle     = 150
			x.weaponvelocity = 850
			x.damage         = x.damage or {}
			x.damage.default = 850
			x.damage.vtol    = 850
		end
	end
end

----------------------------------------------------------------------
-- Grand Liche
----------------------------------------------------------------------
do
	local u = U.armlichet4
	if u then
		u.name        = "Grand Liche"
		u.description = "Triple Salvo Nuclear Missile Carrier"
		u.metalcost   = 45000
		u.energycost  = 700000
		u.health      = 19000
		u.speed       = 180

		u.customparams = u.customparams or {}
		u.customparams.i18n_en_humanname = "Grand Liche"
		u.customparams.i18n_en_tooltip   = "Front Line Obliterator"

		local w = u.weapondefs and u.weapondefs.nuclear_missile
		if w then
			w.weapontype         = "MissileLauncher"
			w.range              = 850
			w.burst              = 3
			w.burstrate          = 0.25
			w.reloadtime         = 15
			w.areaofeffect       = 800
			w.craterareaofeffect = 800
			w.tracks             = true
			w.turnrate           = 12000
			w.flighttime         = 8
			w.startvelocity      = 400
			w.weaponacceleration = 300
			w.weaponvelocity     = 1200
			w.weapontimer        = 8
			w.tolerance          = 12000
			w.burnblow           = true
			w.collideenemy       = true
			w.collidefeature     = true
			w.collidefriendly    = false
			w.avoidfriendly      = false
			w.avoidfeature       = false
			w.noselfdamage       = true

			w.damage = w.damage or {}
			w.damage.default    = 15000
			w.damage.commanders = 3500
			w.damage.vtol       = 2500
		end

		u.weapons = {
			{badtargetcategory = "VTOL", def = "NUCLEAR_MISSILE", onlytargetcategory = "SURFACE"}
		}
	end
end

----------------------------------------------------------------------
-- Black Hydra
----------------------------------------------------------------------
do
	local u = U.corfblackhyt4
	if u then
		u.name           = "Black Hydra"
		u.description    = "Apex Midrange Aerial Battle Fortress"
		u.metalcost      = 145000
		u.energycost     = 1000000
		u.buildtime      = 1000000
		u.health         = 170000
		u.speed          = 42
		u.cruisealtitude = 180

		u.customparams = u.customparams or {}
		u.customparams.i18n_en_humanname = "Black Hydra"
		u.customparams.i18n_en_tooltip   = "Apex aerial battle fortress armed with a devastating midrange superlaser."

		if u.weapondefs then
			for _, _w in pairs(u.weapondefs) do
				_w.camerashake = 0
			end
		end

		local w = u.weapondefs or {}

		local x = w.heavyplasma
		if x then
			x.name               = "Death Star Superlaser"
			x.weapontype         = "BeamLaser"
			x.largebeamlaser     = true
			x.beamtime           = 1.5
			x.beamttl            = 2
			x.corethickness      = 0.65
			x.thickness          = 30
			x.texture3           = "largebeam"
			x.tilelength         = 120
			x.scrollspeed        = 4
			x.beamdecay          = 0.05
			x.laserflaresize     = 14
			x.rgbcolor           = "0.1 1.0 0.2"
			x.rgbcolor2          = "0.6 1.0 0.5"
			x.range              = 1400
			x.reloadtime         = 6
			x.weaponvelocity     = 1200
			x.tolerance          = 10000
			x.areaofeffect       = 64
			x.craterareaofeffect = 0
			x.craterboost        = 0
			x.cratermult         = 0
			x.explosiongenerator = ""
			x.cylindertargeting  = 1
			x.edgeeffectiveness  = 0.15
			x.energypershot      = 0
			x.firestarter        = 100
			x.impactonly         = 1
			x.impulsefactor      = 0
			x.noselfdamage       = true
			x.turret             = true

			x.damage = x.damage or {}
			x.damage.commanders = 3000
			x.damage.default    = 30000
			x.damage.subs       = 3000
			x.damage.vtol       = 1500
		end

		x = w.heavylaser
		if x then
			x.reloadtime = 0.75
			x.damage = x.damage or {}
			x.damage.default = 1500
			x.damage.vtol    = 150
		end

		x = w.ferret_missile
		if x then
			x.reloadtime = 1
			x.damage = x.damage or {}
			x.damage.vtol = 750
		end
	end
end

----------------------------------------------------------------------
-- Epic Dragon
----------------------------------------------------------------------
do
	local u = U.corcrwt4
	if u then
		u.name       = "Epic Dragon"
		u.metalcost  = 75000
		u.energycost = 450000
		u.buildtime  = 450000
		u.health     = 65000
		u.speed      = 105

		local w = u.weapondefs or {}

		local x = w.kmaw
		if x then
			x.range        = 500
			x.burst        = 12
			x.burstrate    = 0.03333
			x.reloadtime   = 0.4
			x.areaofeffect = 128
			x.damage       = x.damage or {}
			x.damage.default = 100
			x.damage.subs    = 25
		end

		x = w.edragon_missile
		if x then
			x.range      = 840
			x.reloadtime = 0.4
			x.damage     = x.damage or {}
			x.damage.bombers  = 225
			x.damage.fighters = 225
			x.damage.vtol     = 225
		end

		x = w.krowbosslaser
		if x then
			x.range      = 500
			x.reloadtime = 1.5
			x.damage     = x.damage or {}
			x.damage.default = 1500
		end

		x = w.krowbosslaser2
		if x then
			x.range      = 500
			x.reloadtime = 2.5
			x.damage     = x.damage or {}
			x.damage.default = 2500
		end
	end
end

----------------------------------------------------------------------
-- Laser Drone
----------------------------------------------------------------------
do
	local d = U.cordrone
	if d then
		d.name   = "Laser Drone"
		d.health = 400

		local w = d.weapondefs and d.weapondefs.heat_ray
		if w then
			w.range      = 650
			w.reloadtime = 0.9
			w.damage     = w.damage or {}
			w.damage.default = 225
			w.damage.vtol    = 25
		end
	end
end

----------------------------------------------------------------------
-- Drone Carrier
----------------------------------------------------------------------
do
	local u = U.cordronecarryair
	if u then
		u.name       = "Drone Carrier"
		u.metalcost  = 30000
		u.energycost = 500000
		u.buildtime  = 300000
		u.health     = 70000
		u.speed      = 40

		local w = u.weapondefs and u.weapondefs.plasma
		if w then
			w.customparams = w.customparams or {}
			local c = w.customparams
			c.carried_unit       = "cordrone"
			c.engagementrange    = "1300"
			c.spawnrate          = "6"
			c.maxunits           = "10"
			c.startingdronecount = "5"
			c.controlradius      = "1100"
		end
	end
end

----------------------------------------------------------------------
-- Legion Rocket Siege Gunship
----------------------------------------------------------------------
do
	local u = U.legmost3
	if u then
		u.name       = "Legion Rocket Siege Gunship"
		u.metalcost  = 15000
		u.energycost = 180000
		u.buildtime  = 150000
		u.health     = 18000
		u.speed      = 130

		local w = u.weapondefs and u.weapondefs.exp_heavyrocket
		if w then
			w.range          = 1050
			w.reloadtime     = 5
			w.burst          = 6
			w.burstrate      = 0.2
			w.areaofeffect   = 128
			w.weaponvelocity = 800
			w.damage         = w.damage or {}
			w.damage.default = 500
		end
	end
end

----------------------------------------------------------------------
-- Apex Tyrannus
----------------------------------------------------------------------
do
	local u = U.legfortt4
	if u then
		u.name           = "Apex Tyrannus"
		u.metalcost      = 100000
		u.energycost     = 2500000
		u.buildtime      = 1000000
		u.health         = 200000
		u.speed          = 30
		u.radardistance  = 2200
		u.sightdistance  = 1400
		u.cruisealtitude = 180

		local w = u.weapondefs or {}

		local x = w.plasma
		if x then
			x.range          = 1400
			x.reloadtime     = 2
			x.projectiles    = 3
			x.weaponvelocity = 850
			x.areaofeffect   = 160
			x.damage         = x.damage or {}
			x.damage.default = 1600
			x.damage.vtol    = 450
		end

		x = w.semiauto
		if x then
			x.range      = 900
			x.reloadtime = 0.1
			x.damage     = x.damage or {}
			x.damage.default = 80
			x.damage.vtol    = 120
		end

		x = w.aa_missiles
		if x then
			x.range          = 1400
			x.reloadtime     = 0.5
			x.weaponvelocity = 1400
			x.damage         = x.damage or {}
			x.damage.vtol    = 300
		end
	end
end
