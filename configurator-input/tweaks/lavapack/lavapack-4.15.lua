-- LavaPack (Djarshi) v4.15
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

uDefs["corjugg"].metalcost = uDefs["corjugg"].metalcost * 2.5
if (uDefs["legeheatraymech"]) then
    uDefs["legeheatraymech"].metalcost = uDefs["legeheatraymech"].metalcost * 1.5
end
if (uDefs["legeheatraymech_old"]) then
    uDefs["legeheatraymech_old"].metalcost = uDefs["legeheatraymech_old"].metalcost * 1.5
end

uDefs["armbotrail"].health = 0
uDefs["armbotrail"].maxthisunit = 0

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

uDefs["armvulc"].metalcost = uDefs["armvulc"].metalcost * 10
uDefs["corbuzz"].metalcost = uDefs["corbuzz"].metalcost * 10
if (uDefs["legstarfall"]) then
    uDefs["legstarfall"].metalcost = uDefs["legstarfall"].metalcost * 10
end
for _, unit in ipairs({"armsy","armasy","corsy","corasy", "legsy","legasy"}) do
    if ( uDefs[unit] ) then
        uDefs[unit].health = 0
        uDefs[unit].maxthisunit = 0
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
  if ( unitDef.energymake > 0 ) then
     unitDef.metalcost = (unitDef.metalcost or 0) * 0.9
     unitDef.energycost = (unitDef.energycost or 0) * 0.9
  end
end
-- mex/geo fix underwater
if noSea then
	local mwd = 'minwaterdepth'
	local uwRef = uDefs['coruwgeo']
	uDefs['armuwgeo'][mwd] = uwRef[mwd]
	for id, def in pairs(uDefs) do
		if def['customparams'].metal_extractor or def['customparams'].geothermal then
			def.maxwaterdepth = uwRef.maxwaterdepth
		end
        local min = def[mwd]
        if hasHoverTide and min then
            local isEco = def.energymake or def.metalmake or def[cps].unitgroup == 'energy' or def[cps].unitgroup == 'metal'
            if isEco or def.buildoptions or def.waterline == nil then
                rmvID(id)
            else
                def.waterline = 0
                def[mwd] = 1
                def[cps] = def[cps] or {}
                def[cps].enabled_on_no_sea_maps = true
            end
        elseif min and min > 0 then
            rmvID(id)
        end
        if def.cruisealtitude then
            if def.cansubmerge then
                def.cansubmerge = false
            end
            if def.maxwaterdepth then
                def.maxwaterdepth = 0
            end
        end
    end
end
