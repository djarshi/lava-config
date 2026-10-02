-- Lava T3 Scav Architect V8 OverCommander
-- Use with: scavunitsforplayers = 0
--
-- Keeps V7's working build-menu separation and swaps the Architect body
-- to the working OverCommander chassis/shield chain used in the private setup.

local U = UnitDefs or {}

local function deepcopy(orig, seen)
    if type(orig) ~= "table" then return orig end
    if seen and seen[orig] then return seen[orig] end
    local s = seen or {}
    local copy = {}
    s[orig] = copy
    for k,v in next, orig, nil do
        copy[deepcopy(k,s)] = deepcopy(v,s)
    end
    return setmetatable(copy, deepcopy(getmetatable(orig),s))
end

local function addBO(builder, unit)
    local b = U[builder]
    if not b or not U[unit] then
        return
    end

    b.buildoptions = b.buildoptions or {}

    for _,x in ipairs(b.buildoptions) do
        if x == unit then
            return
        end
    end

    b.buildoptions[#b.buildoptions + 1] = unit
end

local function removeBO(builder, removeSet)
    local b = U[builder]
    if not b or not b.buildoptions then
        return
    end

    for i = #b.buildoptions, 1, -1 do
        if removeSet[b.buildoptions[i]] then
            table.remove(b.buildoptions, i)
        end
    end
end

local function isScavBuilding(d)
    local cp = d and d.customparams
    local f = cp and cp.subfolder

    if type(f) ~= "string" then
        return false
    end

    f = string.lower(string.gsub(f, "\\", "/"))

    return f == "scavengers/buildings"
        or string.find(f, "scavengers/buildings/", 1, true) == 1
end

-- =========================================================
-- REMOVE LAVAPACK T3 ECO/BUILDPOWER FROM NORMAL T2 LAND CONS
-- =========================================================

local armRemove = {
    afuslegendary = true,
    t3mmex = true,
    armageot3 = true,
    armnanotct3 = true,
}

local corRemove = {
    afuslegendary = true,
    t3mmex = true,
    corageot3 = true,
    cornanotct3 = true,
}

local legRemove = {
    afuslegendary = true,
    t3mmex = true,
    legageot3 = true,
    legnanotct3 = true,
}

for _,builder in ipairs({"armaca","armack","armacv"}) do
    removeBO(builder, armRemove)
end

for _,builder in ipairs({"coraca","corack","coracv"}) do
    removeBO(builder, corRemove)
end

for _,builder in ipairs({"legaca","legack","legacv"}) do
    removeBO(builder, legRemove)
end

-- =========================================================
-- COLLECT ALL SCAVENGER BUILDINGS
-- =========================================================

local scavBuildings = {}

for id,d in pairs(U) do
    if isScavBuilding(d) then
        scavBuildings[#scavBuildings + 1] = id
    end
end

table.sort(scavBuildings)

-- =========================================================
-- OVERCOMMANDER DONORS
-- =========================================================

local boss = U["armcomboss"]
local donor = U["legcomt2def"]

-- =========================================================
-- CREATE DEDICATED T3 ARCHITECTS
-- =========================================================

local function make(id, geo, nano, afus, converter, defense, displayName)
    if not boss or not donor or U[id] then
        return
    end

    local n = deepcopy(donor)

    -- Working OverCommander chassis / animation chain.
    n.objectname = boss.objectname
    n.script = boss.script
    n.buildpic = boss.buildpic
    n.collisionvolumetype = boss.collisionvolumetype
    n.collisionvolumescales = boss.collisionvolumescales
    n.collisionvolumeoffsets = boss.collisionvolumeoffsets
    n.footprintx = boss.footprintx
    n.footprintz = boss.footprintz
    n.movementclass = boss.movementclass
    n.turninplace = boss.turninplace
    n.turninplaceanglelimit = boss.turninplaceanglelimit
    n.turninplacespeedlimit = boss.turninplacespeedlimit
    n.maxacc = boss.maxacc or n.maxacc
    n.maxdec = boss.maxdec or n.maxdec
    n.turnrate = boss.turnrate or n.turnrate
    n.mass = boss.mass or 500000

    n.name = displayName
    n.description = "OverCommander-class T3 Architect"

    n.health = 60000
    n.metalcost = 25000
    n.energycost = 750000
    n.buildtime = 300000

    n.workertime = 3000
    n.builddistance = 500
    n.terraformspeed = 3000

    n.speed = 30
    n.maxvelocity = 30

    n.energymake = 0
    n.metalmake = 0
    n.energyupkeep = 0
    n.metalupkeep = 0
    n.energystorage = 0
    n.metalstorage = 0

    n.builder = true
    n.canassist = true
    n.canrepair = true
    n.canreclaim = true
    n.canrestore = true
    n.canguard = true
    n.canpatrol = true
    n.canfight = true
    n.canmove = true
    n.canrepeat = true

    n.canattack = false
    n.canresurrect = false
    n.cancapture = false
    n.cancloak = false
    n.canmanualfire = false
    n.showplayername = false
    n.reclaimable = true

    -- Keep only the donor repulsor shield weapon slot.
    local shieldSlot = nil
    if n.weapons then
        for _,w in ipairs(n.weapons) do
            if w and type(w.def) == "string" and string.lower(w.def) == "repulsor" then
                shieldSlot = deepcopy(w)
                break
            end
        end
    end

    n.weapons = shieldSlot and {shieldSlot} or {}

    if n.weapondefs and n.weapondefs.repulsor then
        n.weapondefs.repulsor = deepcopy(n.weapondefs.repulsor)
        n.weapondefs.repulsor.range = 350

        if n.weapondefs.repulsor.shield then
            local sh = n.weapondefs.repulsor.shield
            sh.force = 5
            sh.power = 20000
            sh.powerregen = 400
            sh.powerregenenergy = 2000
            sh.intercepttype = 65535
            sh.radius = 350
        end
    end

    n.buildoptions = {}

    local menu = {
        "t3mmex",
        geo,
        nano,
        afus,
        "afuslegendary",
        converter,
        defense,
    }

    for _,x in ipairs(menu) do
        if x and U[x] then
            n.buildoptions[#n.buildoptions + 1] = x
        end
    end

    for _,x in ipairs(scavBuildings) do
        n.buildoptions[#n.buildoptions + 1] = x
    end

    n.customparams = deepcopy(n.customparams or {})
    n.customparams.i18n_en_humanname = displayName
    n.customparams.i18n_en_tooltip =
        "OverCommander-class builder for Lava T3 economy, faction Epic structures, and all Scavenger buildings."
    n.customparams.techlevel = 3
    n.customparams.unitgroup = "builder"

    -- Strip commander classification/nameplate inherited from legcomt2def.
    n.showplayername = false
    n.customparams.iscommander = nil

    U[id] = n
end

make(
    "armlavat3con",
    "armageot3",
    "armnanotct3",
    "armafust3",
    "armmmkrt3",
    "armannit3",
    "Armada T3 Architect"
)

make(
    "corlavat3con",
    "corageot3",
    "cornanotct3",
    "corafust3",
    "cormmkrt3",
    "cordoomt3",
    "Cortex T3 Architect"
)

make(
    "leglavat3con",
    "legageot3",
    "legnanotct3",
    "legafust3",
    "legadveconvt3",
    nil,
    "Legion T3 Architect"
)

addBO("armshltx", "armlavat3con")
addBO("corgant",   "corlavat3con")
addBO("leggant",   "leglavat3con")

-- =========================================================
-- RESTORE SCAV PACK T3 GANTRY / T3 AIR LAB GAMEPLAY CONTENT
--
-- scavunitsforplayers stays OFF so the normal T2 constructors do
-- not get the Scav/Epic economy clutter back.  We selectively
-- restore only the Scav Pack's experimental ground-gantry units
-- and the faction T3 aircraft lab.
-- =========================================================

local function addList(builder, units)
    for _,unit in ipairs(units) do
        addBO(builder, unit)
    end
end

-- Armada Scav/experimental units restored to the T3 ground gantry.
addList("armshltx", {
    "armassimilator",
    "armlunchbox",
    "armmeatball",
    "armpwt4",
    "armsptkt4",
})

-- Cortex T3 Gantry list from scavenger_units_for_players.lua.
addList("corgant", {
    "corkarganetht4",
    "corgolt4",
    "corakt4",
    "corthermite",
    "cormandot4",
})

-- Legion Scav/experimental units restored to the T3 ground gantry.
addList("leggant", {
    "leggobt3",
    "legpede",
    "legsrailt4",
})

-- Restore the Scav Pack experimental aircraft lab to the faction's
-- normal T2 land constructors, without restoring the other Scav/Epic
-- constructor additions.
for _,b in ipairs({"armaca","armack","armacv"}) do
    addBO(b, "armapt3")
end

for _,b in ipairs({"coraca","corack","coracv"}) do
    addBO(b, "corapt3")
end

for _,b in ipairs({"legaca","legack","legacv"}) do
    addBO(b, "legapt3")
end
