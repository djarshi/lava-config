-- LavaPack (Djarshi) v5.2
-- Contributions from: txpera, Tyleno, Songi, Inimitable_Wolf, oldmanyoung
local mods = Spring.GetModOptions()
local noSea = mods.map_waterislava
local uDefs = UnitDefs or {}
local races = {"arm", "cor", "leg"}
local cps = 'customparams'
local allBOs = {}

for id, def in pairs(uDefs) do
	if def and def.buildoptions then
		table.insert(allBOs, id)
	end
end
local function setDesc(def, name, tip)
	local latin = {'en','fr','de','es'}
	if def then
		for i = 1, #latin do
			if name then
				def[cps]['i18n_'..latin[i]..'_humanname'] = name
			end
			if tip then
				def[cps]['i18n_'..latin[i]..'_tooltip'] = tip
			end
		end
	end
end
local function round10(n)
	return math.floor(n * 0.1) * 10
end
local function addC(conName, newUnit)
    if
        uDefs[conName] and uDefs[conName].buildoptions and
            not table.contains(uDefs[conName].buildoptions, newUnit)
     then
        table.insert(uDefs[conName].buildoptions, newUnit)
    end
end
local function addU2BO(newUnit, ...)
    local rest = {...}
    for i, v in ipairs(rest) do
        addC(v, newUnit)
    end
end
local function mergeToNew(u, newU, obj)
    if uDefs[u] and not uDefs[newU] then
        uDefs[newU] = table.merge(uDefs[u], obj)
    end
    return uDefs[newU]
end
local function rmvBO(conID, id)
	local cDef = UnitDefs[conID]
	local uDef = UnitDefs[id]
	if cDef and uDef then
		for k, v in pairs(cDef.buildoptions) do
			if v == id then
				table.remove(cDef.buildoptions, k)
				break
			end
		end
	end
end
local function rmvBOArr(conIDs, id)
	for i = 1, #conIDs do
		rmvBO(conIDs[i], id)
	end
end
local function rmvID(id)
	rmvBOArr(allBOs, id)
end
local ym =
    "h cbbybjyybc bjbjjbbjjb yjbjbjjbbb ybjjjbjjjy jbjbjjjbjb bjbjjjbjbj yjjjbjjjby bbbjjbjbjy bjjbbjjbjb cbyyjbybbc"
uDefs["armageo"].yardmap = ym
uDefs["corageo"].yardmap = ym
uDefs["armuwageo"].yardmap = ym
uDefs["coruwageo"].yardmap = ym
if (uDefs["legageo"]) then
    uDefs["legageo"].yardmap = ym
end
for l, m in pairs({"arm", "cor", "leg"}) do
    local n, o, p = m == "arm", m == "cor", m == "leg"
    mergeToNew(
        m .. "nanotct2",
        m .. "nanotct3",
        {
            icontype = "armrespawn",
            metalcost = 3360,
            energycost = 51200,
            builddistance = 625,
            buildtime = 88000,
            collisionvolumescales = "61 128 61",
            footprintx = 6,
            footprintz = 6,
            health = 8800,
            mass = 37200,
            sightdistance = 625,
            workertime = 3000,
            reclaimspeed = 2000,
            canrepeat = true,
            objectname = p and "Units/legnanotcbase.s3o" or o and "Units/CORRESPAWN.s3o" or "Units/ARMRESPAWN.s3o",
            customparams = {
                i18n_en_humanname = "Epic Construction Turret",
                i18n_en_tooltip = "Even more build power!"
            }
        }
    )
    mergeToNew(
        m .. "ageo",
        m .. "ageot3",
        {
            icontype = "armageo",
            buildtime = 88000,
            collisionvolumeoffsets = "0 0 0",
            collisionvolumescales = "61 128 61",
            energycost = 270000,
            energymake = 12500,
            energystorage = 120000,
            footprintx = 7,
            footprintz = 7,
            health = 7120,
            idleautoheal = 33,
            idletime = 1800,
            maxacc = 0,
            maxdec = 0,
            maxslope = 15,
            maxwaterdepth = 5,
            metalcost = 16000,
            objectname = "Units/mission_command_tower.s3o",
            buildpic = "scavengers/mission_command_tower.dds",
            script = "mission_command_tower.cob",
            seismicsignature = 0,
            selfdestructas = "advgeo",
            -- extended from 'ym' of other geo's
            yardmap = "h oooooooooooooo oooooooooooooo oocbgybsyybcoo oobsbssbbssboo ooysbsbssbbgoo ooybsssbsssyoo oosbsbsssbsboo oobsbsssbsbsoo ooysssbsssbyoo oogbbssbsbsyoo oobssbbssbsboo oocbyysbygbcoo oooooooooooooo oooooooooooooo",
            sightdistance = 345,
            customparams = {
                i18n_en_humanname = "Epic Geothermal Powerplant",
                i18n_en_tooltip = "Produces 10x T2 Geothermal + has plasma deflector. (tweaked by Djarshi & txpera)",
                shield_color_mult = 0.99,
                shield_power = 3250,
                shield_radius = 750
            },
            weapondefs = {
                repulsor = {
                    avoidfeature = false,
                    craterareaofeffect = 0,
                    craterboost = 0,
                    cratermult = 0,
                    edgeeffectiveness = 0.15,
                    name = "PlasmaRepulsor",
                    soundhitwet = "sizzle",
                    weapontype = "Shield",
                    shield = {
                        alpha = 0.17,
                        armortype = "shields",
                        energyupkeep = 0,
                        force = 2.5,
                        intercepttype = 1,
                        power = 6700,
                        powerregen = 69,
                        powerregenenergy = 562.5,
                        radius = 750,
                        repulser = true,
                        smart = true,
                        startingpower = 1100,
                        visiblerepulse = true,
                        badcolor = {
                            [1] = 1,
                            [2] = 0.2,
                            [3] = 0.2,
                            [4] = 0.2
                        },
                        goodcolor = {
                            [1] = 0.2,
                            [2] = 1,
                            [3] = 0.2,
                            [4] = 0.17
                        }
                    }
                }
            },
            weapons = {
                [1] = {
                    def = "REPULSOR",
                    onlytargetcategory = "NOTSUB"
                }
            }
        }
    )
    for l, q in pairs({m .. "nanotc", m .. "nanotct2"}) do
        if uDefs[q] then
            uDefs[q].canrepeat = true
        end
    end
    local AFU = m .. "afust3"
    if uDefs[AFU] then
        uDefs[AFU].explodeas = "customfusionexplo"
        uDefs[AFU].selfdestructas = "advancedFusionExplosionSelfd"
    end
end
local newAfus =
    mergeToNew(
    "lootboxplatinum",
    "afuslegendary",
    {
        icontype = "lootboxplatinum",
        buildpic = "other/resourcecheat.dds",
        buildtime = 120000,
        metalmake = 0,
        footprintx = 4,
        footprintz = 4,
        yardmap = "yooy oooo oooo yooy",
        explodeas = "ScavComBossExplo",
        reclaimable = true,
        customparams = {
            i18n_en_humanname = "Legendary Fusion Reactor",
            i18n_en_tooltip = "Makes 50x of AFUS, Transportable, Unique (Very Hazardous)",
            shield_color_mult = 0.99,
            shield_power = 56000,
            shield_radius = 1250,
            fall_damage_multiplier = 15
        },
        weapondefs = {
            repulsor = {
                avoidfeature = false,
                craterareaofeffect = 0,
                craterboost = 0,
                cratermult = 0,
                edgeeffectiveness = 0.15,
                name = "PlasmaRepulsor",
                soundhitwet = "sizzle",
                weapontype = "Shield",
                shield = {
                    alpha = 0.25,
                    armortype = "shields",
                    energyupkeep = 0,
                    force = 2.5,
                    intercepttype = 1,
                    power = 56000,
                    powerregen = 1300,
                    powerregenenergy = 100000,
                    radius = 1250,
                    repulser = true,
                    smart = true,
                    startingpower = 1,
                    visiblerepulse = true,
                    badcolor = {
                        [1] = 1,
                        [2] = 0.1,
                        [3] = 0.1,
                        [4] = 0.1
                    },
                    goodcolor = {
                        [1] = 0.1,
                        [2] = 1,
                        [3] = 0.1,
                        [4] = 0.1
                    }
                }
            }
        },
        weapons = {
            [1] = {
                def = "REPULSOR",
                onlytargetcategory = "NOTSUB"
            }
        }
    }
)
local normAfus = uDefs["armafus"]
if (normAfus) then
    newAfus.metalcost = normAfus.metalcost * 30
    newAfus.energycost = normAfus.energycost * 30
    newAfus.energymake = normAfus.energymake * 50
    newAfus.energystorage = normAfus.energystorage * 50
    newAfus.health = normAfus.health * 10
    newAfus.maxthisunit = 1
end

local function mulAfus(t2, t3, hpMul, scale, costScale)
	if t2 and t3 then
		t3.health = t2.health * hpMul
		t3.buildtime = t2.buildtime * scale * 0.75
		t3.metalcost = t2.metalcost * costScale
		t3.energycost = t2.energycost * costScale
		t3.energymake = t2.energymake * scale
		t3.explodeas = 'advancedFusionExplosionSelfd'
	end
end


do
    --Afus faction attributes.
    local hpMul = 1.5
    local scale = 10
    local costScale = 8
    local aT3Def = uDefs['armafust3']
    local cT3Def = uDefs['corafust3']
    local lT3Def = uDefs['legafust3']
    mulAfus(uDefs['armafus'], aT3Def, hpMul, scale, costScale)
    mulAfus(uDefs['corafus'], cT3Def, hpMul, scale, costScale)
    mulAfus(uDefs['legafus'], lT3Def, hpMul, scale, costScale)
    --Arm
    aT3Def.energystorage = aT3Def.energystorage * hpMul
    aT3Def.stealth = true
    --Leg
    if hasLegion then
        setDesc(lT3Def, nil, 'Produces '..lT3Def.energymake..' Energy (Hazardous)')
    end
    setDesc(aT3Def, nil, 'Produces '..aT3Def.energymake..' Energy (Hazardous)')
    setDesc(cT3Def, nil, 'Produces '..cT3Def.energymake..' Energy (Hazardous)')
end

addU2BO("afuslegendary", "armack", "armaca", "armacv")
addU2BO("afuslegendary", "corack", "coraca", "coracv")
addU2BO("afuslegendary", "legack", "legaca", "legacv")
local newT3Mex =
    mergeToNew(
    "armmoho",
    "t3mmex",
    {
        icontype = "armmoho",
        health = 6200,
        metalstorage = 2000,
        buildpic = "scavengers/scavsafeareabeacon.DDS",
        buildtime = 30000,
        reclaimable = true,
        objectname = "scavs/scavsafeareabeacon.s3o",
        script = "Units/ARMEYES.cob",
        energycost = 24300,
        metalcost = 1920,
        energyupkeep = 500,
        explodeas = "geo",
        extractsmetal = 0.016,
        onoffable = true,
        yardmap = "h oooooooo osssssso osssssso ossoosso ossoosso osssssso osssssso oooooooo",
        customparams = {
            i18n_en_humanname = "Epic Metal Extractor",
            i18n_en_tooltip = "Metal Extraction / Storage (upkeep 500 energy/s)"
        }
    }
)

addU2BO("t3mmex", "armack", "armaca", "armacv")
addU2BO("t3mmex", "corack", "coraca", "coracv")
addU2BO("t3mmex", "legack", "legaca", "legacv")

if ( uDefs["armbotrail"] ) then
  uDefs["armbotrail"].health = 0
  uDefs["armbotrail"].maxthisunit = 0
end

addU2BO("armnanotct3", "armack", "armaca", "armacv")
addU2BO("armageot3", "armack", "armaca", "armacv")
addU2BO("cornanotct3", "corack", "coraca", "coracv")
addU2BO("corageot3", "corack", "coraca", "coracv")
addU2BO("legnanotct3", "legack", "legaca", "legacv")
addU2BO("legageot3", "legack", "legaca", "legacv")

-- cross faction conplane builds.
addU2BO( "armaca", "legapt3", "corapt3" )
addU2BO( "coraca", "armapt3", "legapt3" )
addU2BO( "legaca", "corapt3", "armapt3" )

if ( uDefs["armvulc"] ) then
    uDefs["armvulc"].metalcost = uDefs["armvulc"].metalcost * 10
end
if ( uDefs["corbuzz"] ) then
    uDefs["corbuzz"].metalcost = uDefs["corbuzz"].metalcost * 10
end
if (uDefs["legstarfall"]) then
    uDefs["legstarfall"].metalcost = uDefs["legstarfall"].metalcost * 10
end
if noSea then
    for _, unit in ipairs({"armsy","armasy","corsy","corasy", "legsy","legasy"}) do
        if ( uDefs[unit] ) then
            uDefs[unit].health = 0
            uDefs[unit].maxthisunit = 0
        end
    end
end
--Smaller converters.
local function mulConv(def)
	local x = 6
	local yard = 'oooooo oooooo oooooo oooooo oooooo oooooo'
	local cvo = 'collisionvolumeoffsets'
	local cvs = 'collisionvolumescales'
	if def then
		local foot = def.footprintx
		if foot > x then
			if def[cvo] then
				def[cvo] = '0 0 0'
			end
			if def[cvs] then
				def[cvs] = '90 45 90'
			end
			def.footprintx = x
			def.footprintz = x
			def.yardmap = yard
			if def[fds] then
				local d = def[fds].dead
				if d then
					d[cvo] = '0 0 0'
					d[cvs] = '90 45 90'
					d.footprintx = x
					d.footprintz = x
				end
				local h = def[fds].heap
				if h then
					h.footprintx = x
					h.footprintz = x
				end
			end
		end
	end
end

-- converter size fix
for l, m in pairs({"armmmkrt3", "cormmkrt3", "legadveconvt3"}) do
    if (uDefs[m]) then
        uDefs[m] = table.merge(uDefs[m], {footprintx = 6, footprintz = 6})
    end
end
-- cheapermake
for name, unitDef in pairs(uDefs) do
  if ( (unitDef.energymake or 0) > 0 ) then
     unitDef.metalcost = (unitDef.metalcost or 0) * 1
     unitDef.energycost = (unitDef.energycost or 0) * 1
  end
end


local newID = "legendaryenergyconverter"
uDefs[newID] = table.copy(uDefs["legadveconv"] or {})
local def = uDefs[newID]
table.mergeInPlace(def, uDefs["legadveconv"] or {}, true)
def.customparams = def.customparams or {}
local afus =
    uDefs["legafus"] or
    uDefs["corafus"] or
    uDefs["armafus"]
if afus then
    def.footprintx = afus.footprintx
    def.footprintz = afus.footprintz
    def.yardmap = afus.yardmap
end
def.objectname = "Units/LEGRAMPART.s3o"
def.script = "Units/legrampart.cob"
def.buildpic = "legrampart.DDS"
def.icontype = "legadveconvt3"
def.metalcost = 51200
def.energycost = 1248000
def.buildtime = 300000
def.health = 10000
def.mass = 75000
def.customparams.energyconv_capacity = 30000
def.customparams.energyconv_efficiency = 0.025
def.metalstorage = 17500
def.sightdistance = 1250
def.radardistance = 2500
def.sonardistance = 500
def.seismicsdistance = 1500
def.sonarstealth = true
def.stealth = true
def.cancloak = true
def.cloakcost = 7500
def.mincloakdistance = 50
def.decloakonfire = false
def.ic = true
def.icradius = 2000
def.unitrestricted = "5"
def.autorepair = true
def.autoheal = 50
def.idletime = 0
def.idleautoheal = 50
setDesc(
    def,
    "Legendary Energy Converter",
    "Converts 30,000 energy into 750 metal per second - Limit 5"
)
addC("armaca", newID)
addC("coraca", newID)
addC("legaca", newID)
addC("armack", newID)
addC("corack", newID)
addC("legack", newID)
addC("armacv", newID)
addC("coracv", newID)
addC("legacv", newID)

--- EMP max 5
for _, unitName in ipairs({
    "armemp",
    "cortrem",
    "legperdition",
}) do
    local ud = uDefs[unitName]

    if ud and ud.weapondefs then
        for _, wd in pairs(ud.weapondefs) do
            wd.customparams = wd.customparams or {}
            wd.customparams.stockpilelimit = "5"
        end
    end
end

-- roomba
local roombaID = "armfify_t3resbot"
local roombaSource = uDefs["armfify"]

if roombaSource then
    local roomba = table.copy(roombaSource)

    uDefs[roombaID] = roomba

    setDesc(
        roomba,
        "Roomba",
        "Epic Battlefield Vacuum"
    )

    -- Use the stock ARM Firefly strategic/minimap icon.
    roomba.icontype = "armfify"

    roomba.metalcost = 1200
    roomba.energycost = 25000
    roomba.buildtime = 45000
    roomba.speed = 290
    roomba.health = 250
    roomba.workertime = 4000

    roomba.customparams = roomba.customparams or {}
    roomba.customparams.armordef = "vtol"

    addC("armapt3", roombaID)
    addC("corapt3", roombaID)
    addC("legapt3", roombaID)
end
