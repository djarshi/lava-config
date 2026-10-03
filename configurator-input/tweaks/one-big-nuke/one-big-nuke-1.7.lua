-- OneBigNuke 1.7
-- Cleaned-up merge of 1.6 with the leaner style of the "another" draft.
--
-- Retained from 1.6:
--   * noNukes mod-option guard around the big-nuke creation.
--   * Antinuke disable (any unit with an interceptor weapon is removed from
--     all build menus) and original-nuke disable (stock silos + seadragon +
--     desolator removed from all build menus).
--   * 4-language (en/fr/de/es) localized names + tooltips via setDesc.
--   * cps/wds string indirection.
--   * createBigNuke factory for the three faction silos.
--
-- Changed vs 1.6:
--   * Disabling original nukes and antinukes now uses the same rmvID pattern as
--     LavaPack (removes the unit from every builder's build options) instead of
--     zeroing health / maxthisunit.
--   * rmvBO is nil-safe on buildoptions (guarded lookup).

local mods = Spring.GetModOptions()
local noNukes = mods.unit_restrictions_nonukes

local uDefs = UnitDefs or {}
local cps = 'customparams'
local wds = 'weapondefs'

-- Every builder (units with buildoptions), used by rmvID to strip a unit from
-- all build menus.
local allBOs = {}
for id, def in pairs(uDefs) do
    if def and def.buildoptions then
        table.insert(allBOs, id)
    end
end

local function addC(conName, newUnit)
    local con = uDefs[conName]
    if con and con.buildoptions and not table.contains(con.buildoptions, newUnit) then
        table.insert(con.buildoptions, newUnit)
    end
end

local function rmvBO(conID, id)
    local cDef = uDefs[conID]
    if cDef and cDef.buildoptions then
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

-- All antinukes off: remove any unit with an interceptor weapon from build menus.
for id, def in pairs(uDefs) do
    if def[wds] then
        for _, v in pairs(def[wds]) do
            if v.interceptor then
                rmvID(id)
                break
            end
        end
    end
end

-- All original nukes off: remove the stock silos + seadragon + desolator.
local nukeIDs = {'armsilo', 'corsilo', 'legsilo', 'armseadragon', 'cordesolator'}
for i = 1, #nukeIDs do
    rmvID(nukeIDs[i])
end