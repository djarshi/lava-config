-- OneBigNuke 1.3
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
    local armNuke = mergeToNew( "armsilo", "armsiloexp", nukeSettings )
    armNuke.weapondefs.nuclear_missile.stockpiletime = 30
    armNuke.weapondefs.nuclear_missile.areaofeffect = 3200
    armNuke.weapondefs.nuclear_missile.damage= { commanders = 2500, default = 1000000, }
    addUnitToBO("armsiloexp", "armack", "armaca", "armacv")
    setDesc(armNuke, title, tip)

    local corNuke = mergeToNew( "corsilo", "corsiloexp", nukeSettings )
    corNuke.weapondefs.crblmssl.stockpiletime = 30
    corNuke.weapondefs.crblmssl.areaofeffect = 3200
    corNuke.weapondefs.crblmssl.damage = { commanders = 2500, default = 1000000, }				
    addUnitToBO("corsiloexp", "corack", "coraca", "coracv")
    setDesc(corNuke, title, tip)

    if (UnitDefs["legsilo"]) then
        local legNuke = mergeToNew( "legsilo", "legsiloexp", nukeSettings )
        legNuke.weapondefs.legicbm.stockpiletime = 30
        legNuke.weapondefs.legicbm.areaofeffect = 3200
        legNuke.weapondefs.legicbm.damage= { commanders = 2500, default = 1000000, }				
        addUnitToBO("legsiloexp", "legack", "legaca", "legacv")
        setDesc(legNuke, title, tip)
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



