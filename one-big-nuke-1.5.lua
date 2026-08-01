-- OneBigNuke 1.5
local mods = Spring.GetModOptions()
local noNukes = mods.unit_restrictions_nonukes
local noNukeDef = mods.unit_restrictions_noantinuke
local cps = 'customparams'
local bos = 'buildoptions'
local wds = 'weapondefs'
local function addC(conName, newUnit)
    if
        UnitDefs[conName] and UnitDefs[conName].buildoptions and
            not table.contains(UnitDefs[conName].buildoptions, newUnit)
     then
        table.insert(UnitDefs[conName].buildoptions, newUnit)
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

local function addUnitToBO(newUnit, ...)
    local rest = {...}
    for i, v in ipairs(rest) do
        addC(v, newUnit)
    end
end
local function mergeToNew(u, newU, obj)
    if UnitDefs[u] and not UnitDefs[newU] then
        UnitDefs[newU] = table.merge(UnitDefs[u], obj)
    end
    return UnitDefs[newU]
end

local nukeSettings = {
        health = 5900,
        maxthisunit = 1,
        buildtime = 4785000,
        energycost = 260000000,
        metalcost = 16000000,
}

local title = "Nuclear ICBM Launcher"
local tip = "Very expensive but it will do it's job with vigor'. Anti's for this are non existent'"

if ( not noNukes ) then
    if uDefs["armsilo"] then
	    local uDef = mergeToNew("armsilo", "armsiloexp", nukeSettings)
	    uDef.icontype = "armsilo"
	    local wDef = uDef[wds].nuclear_missile
	    wDef.targetable = nil
	    wDef.stockpiletime = 30
	    wDef.areaofeffect = 3200
	    wDef.damage.default = 1000000
	    addUnitToBO("armsiloexp", "armack", "armaca", "armacv")
	    setDesc(uDef, title, tip)
    end

    if uDefs["corsilo"] then
	    local uDef = mergeToNew("corsilo", "corsiloexp", nukeSettings)
	    uDef.icontype = "corsilo"
	    local wDef = uDef[wds].crblmssl
	    wDef.targetable = nil
	    wDef.stockpiletime = 30
	    wDef.areaofeffect = 3200
	    wDef.damage.default = 1000000
	    addUnitToBO("corsiloexp", "corack", "coraca", "coracv")
	    setDesc(uDef, title, tip)
    end

    if uDefs["legsilo"] then
	    local uDef = mergeToNew("legsilo", "legsiloexp", nukeSettings)
	    uDef.icontype = "legsilo"
	    local wDef = uDef[wds].legicbm
	    wDef.targetable = nil
	    wDef.stockpiletime = 30
	    wDef.areaofeffect = 3200
	    wDef.damage.default = 1000000
	    wDef[cps].shield_aoe_penetration = true
	    addUnitToBO("legsiloexp", "legack", "legaca", "legacv")
	    setDesc(uDef, title, tip)
    end
end

-- All AN's off
for id, def in pairs(UnitDefs) do
	if def[wds] then
		for k, v in pairs(def[wds]) do
			if v.interceptor then
                def.maxthisunit = 0
                def.health = 0
			end
		end
	end
end
-- all original nuke's off.
local nukeIDs = {'armsilo','corsilo','legsilo','armseadragon','cordesolator'}
for i = 1, #nukeIDs do
	local def = UnitDefs[nukeIDs[i]]
	if def then
        def.maxthisunit = 0
        def.health = 0
	end
end



