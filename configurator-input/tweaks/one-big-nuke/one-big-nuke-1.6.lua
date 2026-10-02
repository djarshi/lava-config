-- OneBigNuke 1.6
-- Merges Tyleno's cleaned-up factory + shield-penetration fix + clean tooltip
-- with the original 1.5 behavior (antinuke & original-nuke disabling, noNukes
-- mod-option guard, 4-language descriptions).
--
-- Changes vs 1.5:
--   * shield_aoe_penetration moved from the unit customparams to the WEAPONDEF
--     customparams so the Legion big nuke actually penetrates shields.
--   * Tooltip text cleaned up (was typo-laden with stray quotes).
--   * Nil-safe: buildoptions / weapon damage / weapon customparams are
--     initialized before writing.
--   * Refactored the three copy-pasted silo blocks into one createBigNuke factory.
--   * Dropped the unused noNukeDef variable.
--   * Kept: antinuke-disable loop, original-nuke-disable list, noNukes guard,
--     en/fr/de/es localized names + tooltips.

local mods = Spring.GetModOptions()
local noNukes = mods.unit_restrictions_nonukes

local uDefs = UnitDefs
local cps = 'customparams'
local wds = 'weapondefs'

local function addC(conName, newUnit)
    local con = uDefs[conName]
    if not con then return end
    con.buildoptions = con.buildoptions or {}
    if not table.contains(con.buildoptions, newUnit) then
        table.insert(con.buildoptions, newUnit)
    end
end

local function setDesc(def, name, tip)
    if not def then return end
    def[cps] = def[cps] or {}
    local latin = {'en', 'fr', 'de', 'es'}
    for i = 1, #latin do
        if name then
            def[cps]['i18n_' .. latin[i] .. '_humanname'] = name
        end
        if tip then
            def[cps]['i18n_' .. latin[i] .. '_tooltip'] = tip
        end
    end
end

local function mergeToNew(u, newU, obj)
    if uDefs[u] and not uDefs[newU] then
        uDefs[newU] = table.merge(uDefs[u], obj)
    end
    return uDefs[newU]
end

local nukeSettings = {
    health = 5900,
    maxthisunit = 1,
    buildtime = 4785000,
    energycost = 260000000,
    metalcost = 16000000,
}

local title = "Nuclear ICBM Launcher"
local tip = "Very expensive strategic ICBM launcher with an enormous blast radius."

local function createBigNuke(sourceID, newID, iconType, weaponName, builders, shieldPenetration)
    local uDef = mergeToNew(sourceID, newID, nukeSettings)
    if not uDef then return end

    uDef.icontype = iconType

    local wDef = uDef[wds] and uDef[wds][weaponName]
    if wDef then
        wDef.targetable = nil
        wDef.stockpiletime = 30
        wDef.areaofeffect = 3200
        wDef.damage = wDef.damage or {}
        wDef.damage.default = 1000000

        if shieldPenetration then
            wDef[cps] = wDef[cps] or {}
            wDef[cps].shield_aoe_penetration = true
        end
    end

    for _, builder in ipairs(builders) do
        addC(builder, newID)
    end

    setDesc(uDef, title, tip)
end

if (not noNukes) then
    createBigNuke("armsilo", "armsiloexp", "armsilo", "nuclear_missile",
        {"armack", "armaca", "armacv"}, false)
    createBigNuke("corsilo", "corsiloexp", "corsilo", "crblmssl",
        {"corack", "coraca", "coracv"}, false)
    createBigNuke("legsilo", "legsiloexp", "legsilo", "legicbm",
        {"legack", "legaca", "legacv"}, true)
end

-- All antinukes off: any unit with an interceptor weapon is killed.
for id, def in pairs(uDefs) do
    if def[wds] then
        for k, v in pairs(def[wds]) do
            if v.interceptor then
                def.maxthisunit = 0
                def.health = 0
            end
        end
    end
end

-- All original nukes off.
local nukeIDs = {'armsilo', 'corsilo', 'legsilo', 'armseadragon', 'cordesolator'}
for i = 1, #nukeIDs do
    local def = uDefs[nukeIDs[i]]
    if def then
        def.maxthisunit = 0
        def.health = 0
    end
end