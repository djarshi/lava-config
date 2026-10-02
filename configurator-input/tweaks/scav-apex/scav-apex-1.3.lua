--SCAV Apex (Tyleno v1.3)
--Balanced BP to be higher for each unit
--New Unit descriptions
--Reduced health in 1.3 of units

local function deepcopy(orig, seen)
    if type(orig) ~= "table" then return orig end
    if seen and seen[orig] then return seen[orig] end
    local s = seen or {}
    local copy = {}
    s[orig] = copy
    for k,v in pairs(orig) do
        copy[deepcopy(k,s)] = deepcopy(v,s)
    end
    return copy
end

local function removeBOEverywhere(unitID)
    for _,def in pairs(UnitDefs) do
        if def.buildoptions then
            for i = #def.buildoptions, 1, -1 do
                if def.buildoptions[i] == unitID then
                    table.remove(def.buildoptions, i)
                end
            end
        end
    end
end

local function addBO(builderID, unitID)
    local b = UnitDefs[builderID]
    if not b then return end
    -- Important for V18:
    -- the *_scav Apex UnitDefs do not exist yet while tweakdefs is executing.
    -- BAR creates them later in createScavengerUnitDefs().
    -- We intentionally allow a future UnitDef ID into the build menu here;
    -- unitdefs.lua validates buildoptions only after post-processing is complete.
    b.buildoptions = b.buildoptions or {}
    for _,id in ipairs(b.buildoptions) do
        if id == unitID then return end
    end
    table.insert(b.buildoptions, unitID)
end

if UnitDefs["armbanth"] then
    local u = deepcopy(UnitDefs["armbanth"])

    u.name = "Apex Titan"
    u.description = "This is the End Game"

    u.metalcost = 425000 / 1.10
    u.energycost = 9000000 / 1.10
    u.buildtime = 3150000 / 1.10
    u.health = 850000 / 1.20
    u.mass = 10000000

    u.speed = 32
    u.turnrate = 150
    u.sightdistance = 1500
    u.radardistance = 1800

    u.customparams = u.customparams or {}
    u.customparams.i18n_en_humanname = "Apex Titan"
u.customparams.i18n_en_tooltip = "A walking epic pulsar, with 1.8M health!"
    u.customparams.techlevel = 3
    u.customparams.unitgroup = "weapon"

    if u.weapondefs then
        -- Identify Titan's strongest stock weapon as the heavy siege beam.
        local primaryName = nil
        local primaryDamage = -1

        for name,w in pairs(u.weapondefs) do
            local d = w.damage and w.damage.default or 0
            if d > primaryDamage then
                primaryDamage = d
                primaryName = name
            end
        end

        for name,w in pairs(u.weapondefs) do
            local wt = string.lower(w.weapontype or "")
            local wn = string.lower(w.name or "")
            w.camerashake = 0

            if name == primaryName then
                -- Heavy siege beam
                w.range = 1150
                w.reloadtime = 3
                w.energypershot = 18000
                w.areaofeffect = 90
                w.edgeeffectiveness = 0.50
                w.weaponvelocity = 900
                w.damage = w.damage or {}
                w.damage.default = 21000
                w.damage.shields = 31500
                w.damage.commanders = 7000
                if w.damage.vtol ~= nil then w.damage.vtol = 2500 end

            elseif string.find(wt,"missile",1,true)
                or string.find(wt,"starburst",1,true)
                or string.find(wn,"rocket",1,true)
                or string.find(wn,"missile",1,true) then

                -- Supporting missile battery
                w.range = 1100
                w.reloadtime = 4
                w.energypershot = 6000
                w.areaofeffect = 160
                w.edgeeffectiveness = 0.35
                w.damage = w.damage or {}
                w.damage.default = 3500
                w.damage.shields = 3500
                if w.damage.vtol ~= nil then w.damage.vtol = 1200 end

            else
                -- Close/mid-range impulsion blaster
                w.range = 650
                w.reloadtime = 1.2
                w.energypershot = 2500
                w.areaofeffect = 96
                w.edgeeffectiveness = 0.40
                w.damage = w.damage or {}
                w.damage.default = 1200
                w.damage.shields = 1200
                if w.damage.vtol ~= nil then w.damage.vtol = 300 end
            end
        end
    end

    u.icontype = "armbanth"
    UnitDefs["armapextitan"] = u

    for _,b in ipairs({
        "armshltx",
        "armshltxuw",
        "armgant",
        "armgantuw",
    }) do
        addBO(b, "armapextitan_scav")
    end
end

if UnitDefs["corkorg"] then
    local u = deepcopy(UnitDefs["corkorg"])

    u.name = "Apex Juggernaut"
    u.description = "The Father of all Juggernauts"
    u.buildpic = "CORKORG.DDS"

    u.metalcost = 600000 / 1.10
    u.energycost = 12000000 / 1.10
    u.buildtime = 4250000 / 1.10
    u.health = 1150000 / 1.20
    u.mass = 10000000

    u.speed = 27
    u.turnrate = 150
    u.turninplace = true
    u.turninplaceanglelimit = 90
    u.turninplacespeedlimit = 1.0

    u.customparams = u.customparams or {}
    u.customparams.i18n_en_humanname = "Apex Juggernaut"
u.customparams.i18n_en_tooltip = "Unparalleled and Devastating Close-range firepower"
    u.customparams.techlevel = 3
    u.customparams.unitgroup = "weapon"

    if u.weapondefs then
        local combat = {
            "corkorg_fire",
            "corkorg_laser",
            "corkorg_rocket",
        }

        for _,name in ipairs(combat) do
            local w = u.weapondefs[name]
            if w then
                w.name = "Overload Annihilator"
                w.range = 560
                w.reloadtime = 8
                w.energypershot = 40000
                w.areaofeffect = 380
                w.edgeeffectiveness = 0.65
                w.impulsefactor = 2
                w.accuracy = 400
                w.damage = {
                    default = 14000,
                    commanders = 4500,
                    shields = 10500,
                    subs = 2000,
                    vtol = 500,
                }
            end
        end

        local laser = u.weapondefs.corkorg_laser
        if laser then
            laser.name = "Overload Beam"
            laser.reloadtime = 6
            laser.areaofeffect = 96
            laser.accuracy = 64
            laser.sprayangle = 64
            laser.damage = laser.damage or {}
            laser.damage.default = 30000
            laser.damage.commanders = 15000
            laser.damage.shields = 22500
            laser.damage.subs = 6000
            laser.damage.vtol = 2500
        end

        local rocket = u.weapondefs.corkorg_rocket
        if rocket then
            rocket.name = "Overload Missile Battery"
            rocket.range = 1100
            rocket.reloadtime = 4
            rocket.energypershot = 6000
            rocket.areaofeffect = 160
            rocket.edgeeffectiveness = 0.35
            rocket.damage = rocket.damage or {}
            rocket.damage.default = 3500
            rocket.damage.commanders = 1800
            rocket.damage.shields = 3500
            rocket.damage.subs = 500
            if rocket.damage.vtol ~= nil then
                rocket.damage.vtol = 1200
            end
        end
    end

    u.icontype = "corkorg"
    UnitDefs["corapex"] = u

    addBO("corgant", "corapex_scav")
    addBO("corgantuw", "corapex_scav")
end

if UnitDefs["legeheatraymech_old"] then
    local u = deepcopy(UnitDefs["legeheatraymech_old"])
    UnitDefs["apexsol"] = u

    u.name = "Apex SOL"
    u.description = "The Unstoppable World Devourer"
    u.buildpic = u.buildpic or "LEGEHEATRAYMECH.DDS"

    u.metalcost = 650000 / 1.10
    u.energycost = 11000000 / 1.10
    u.buildtime = 4800000 / 1.10
    u.health = 950000 / 1.20
    u.mass = 10000000

    u.speed = 29
    u.turnrate = 250
    u.maxacc = 0.12
    u.maxdec = 0.50

    u.sightdistance = 1100
    u.radardistance = 1800

    u.customparams = u.customparams or {}
    u.customparams.i18n_en_humanname = "Apex SOL"
u.customparams.i18n_en_tooltip = "Devastation and Ruin to all who face the Apex Sol"
    u.customparams.techlevel = 3
    u.customparams.subfolder = "Legion/T3"
    u.customparams.unitgroup = "weapon"
    u.customparams.paralyzemultiplier = 0
    u.customparams.maxrange = "850"

    if u.weapondefs then
        local w = u.weapondefs.heatray1
        if w then
            w.name = "SOL Pulsing Laser"
            w.weapontype = "LaserCannon"
            w.range = 850
            w.reloadtime = 0.20
            w.energypershot = 1000
            w.areaofeffect = 90
            w.edgeeffectiveness = 0.45
            w.weaponvelocity = 1250
            w.duration = 0.12
            w.falloffrate = 0
            w.intensity = 0.5
            w.size = 2.5
            w.thickness = 2.5
            w.rgbcolor = "1 0.45 0.05"
            w.rgbcolor2 = "1 0.9 0.25"
            w.explosiongenerator = "custom:laserhit-medium-yellow"
            w.beamtime = nil
            w.beamttl = nil
            w.corethickness = nil
            w.laserflaresize = nil

            w.damage = w.damage or {}
            w.damage.default = 800
            w.damage.commanders = 320
            w.damage.vtol = 0
        end

        local aa = u.weapondefs.legflak_gun
        if aa then
            aa.range = 1400
            aa.reloadtime = 0.8
            aa.burst = 4
            aa.burstrate = 0.08
            aa.areaofeffect = 180
            aa.edgeeffectiveness = 1
            aa.accuracy = 500
            aa.sprayangle = 150
            aa.weaponvelocity = 1800
            aa.damage = aa.damage or {}
            aa.damage.vtol = 600
        end
    end

    u.icontype = "legeheatraymech_old"

    -- The normal stock legeheatraymech_old remains untouched.
    -- BAR later generates apexsol_scav from this hidden source template.
    addBO("leggant", "apexsol_scav")
end
