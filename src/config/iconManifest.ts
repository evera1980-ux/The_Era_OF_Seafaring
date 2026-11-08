export type IconCategory =
  | "commodities"
  | "vessels"
  | "upgrades"
  | "perks"
  | "weather"
  | "hazards"
  | "hud";

export interface IconResolutionSpec {
  tier: "Master" | "@3x" | "@2x" | "@1x";
  sizePx: 512 | 192 | 128 | 64;
  usage: string;
}

export interface IconManifestItem {
  id: string;
  /** 对应游戏配置表中的实体 ID，如 C001 / V001 / U001 / PERK_EFFICIENT_ENGINE / HUD_FUEL */
  entityId: string;
  /** 对应 AssetRegistry 的 AssetKey（如有） */
  assetKey?: string;
  category: IconCategory;
  nameZh: string;
  nameEn: string;
  fileName: string;
  /** public/ 下的静态访问路径 */
  publicPath: string;
  /** AI 主体描述词（不含通用后缀） */
  subjectPrompt: string;
  /** 拼接通用风格后缀后的完整正向 Prompt */
  fullPrompt: string;
  /** 负向提示词 */
  negativePrompt: string;
  /** 是否为用户自定义新增或修改项 */
  isCustom?: boolean;
}

export const GLOBAL_ICON_STYLE = {
  resolutions: [
    {
      tier: "Master",
      sizePx: 512,
      usage: "AI 平台直接出图尺寸，高精度源文件保存于原画库",
    },
    {
      tier: "@3x",
      sizePx: 192,
      usage: "iPhone 15/16 Pro Super Retina OLED、船厂/货品详情特写弹窗",
    },
    {
      tier: "@2x",
      sizePx: 128,
      usage: "标准移动端 Retina 屏幕、底部功能抽屉卡片",
    },
    {
      tier: "@1x",
      sizePx: 64,
      usage: "HUD 顶部物流条、微型仪表角标、表格列表项",
    },
  ] as IconResolutionSpec[],
  palette: {
    background: "transparent",
    primaryCyan: "#35C6D8",
    secondaryAmber: "#F59E0B",
    titaniumSlate: "#1E293B",
  },
  universalSuffix:
    ", modern nautical game UI icon, isometric 3D perspective, transparent background, isolated 3D object on alpha channel, PNG cutout, no background box, glowing marine cyan (#35C6D8) and maritime amber accents, brushed titanium and industrial matte finish, clean crisp edges, 8k render, octane render style, unreal engine 5 game asset, high contrast, clean vector silhouette, --v 6.0 --style raw --s 150",
  negativePrompt:
    "black background, dark background, solid background, square frame, border box, text, typography, watermark, signature, blurry, low resolution, noisy, photorealistic human face, complex cluttered photo background, chibi cartoon, child drawing, oversaturated rainbow colors",
};

export interface RawIconEntry {
  id: string;
  entityId: string;
  assetKey?: string;
  category: IconCategory;
  nameZh: string;
  nameEn: string;
  fileName: string;
  subjectPrompt: string;
  isCustom?: boolean;
}

export function buildIconManifestItem(entry: RawIconEntry): IconManifestItem {
  const cleanFile = entry.fileName.endsWith(".png")
    ? entry.fileName
    : `${entry.fileName}.png`;
  return {
    ...entry,
    fileName: cleanFile,
    publicPath: `/assets/icons/${entry.category}/${cleanFile}`,
    fullPrompt: `${entry.subjectPrompt}${GLOBAL_ICON_STYLE.universalSuffix}`,
    negativePrompt: GLOBAL_ICON_STYLE.negativePrompt,
  };
}

export const RAW_ICON_ENTRIES: RawIconEntry[] = [
  // ==================== 1. 贸易商品图标 (Commodities C001 ~ C015, 15个) ====================
  {
    id: "comm_c001",
    entityId: "C001",
    assetKey: "cargo.container",
    category: "commodities",
    nameZh: "集装箱百货",
    nameEn: "Standard Containers",
    fileName: "c001_container.png",
    subjectPrompt:
      "Stack of three precision ISO intermodal shipping containers, cyan and dark cobalt steel, twist-lock corners, subtle digital logistics barcode holographic label",
  },
  {
    id: "comm_c002",
    entityId: "C002",
    assetKey: "cargo.oil",
    category: "commodities",
    nameZh: "波斯湾原油",
    nameEn: "Crude Oil",
    fileName: "c002_crude_oil.png",
    subjectPrompt:
      "A heavy industrial dark steel barrel with a viscous black crude oil droplet splashing upward, golden-amber warning hazard stripe, high-gloss hydrocarbon reflection",
  },
  {
    id: "comm_c003",
    entityId: "C003",
    assetKey: "cargo.ore",
    category: "commodities",
    nameZh: "澳洲铁矿石",
    nameEn: "Iron Ore",
    fileName: "c003_iron_ore.png",
    subjectPrompt:
      "Dense raw haematite iron ore chunks with reddish-brown metallic crust, crystalline facets, glowing mineral scan grid lines",
  },
  {
    id: "comm_c004",
    entityId: "C004",
    category: "commodities",
    nameZh: "智利冷链海鲜",
    nameEn: "Cold-Chain Seafood",
    fileName: "c004_cold_seafood.png",
    subjectPrompt:
      "A high-tech temperature-controlled cryogenic refrigerated cargo crate frosted with ice crystals, containing a premium silver deep-sea salmon silhouette, faint cyan sub-zero vapor",
  },
  {
    id: "comm_c005",
    entityId: "C005",
    category: "commodities",
    nameZh: "精密海事仪器",
    nameEn: "Maritime Electronics",
    fileName: "c005_marine_instruments.png",
    subjectPrompt:
      "Precision marine navigation gyroscope and electronic ECDIS circuit board encased in hardened shockproof glass casing, glowing neon cyan fiber optic traces",
  },
  {
    id: "comm_c006",
    entityId: "C006",
    category: "commodities",
    nameZh: "东南亚橡胶",
    nameEn: "Natural Rubber",
    fileName: "c006_rubber.png",
    subjectPrompt:
      "Stacked ribbed smoked rubber sheets and a pristine latex coil bound with industrial strapping, matte polymer finish",
  },
  {
    id: "comm_c007",
    entityId: "C007",
    category: "commodities",
    nameZh: "巴西大豆",
    nameEn: "Soybeans",
    fileName: "c007_soybean.png",
    subjectPrompt:
      "A burlap cargo sack bursting with golden-amber agricultural soybeans, agricultural inspection seal stamp, crisp grain texture",
  },
  {
    id: "comm_c008",
    entityId: "C008",
    category: "commodities",
    nameZh: "液化天然气 LNG",
    nameEn: "Liquefied Natural Gas",
    fileName: "c008_lng.png",
    subjectPrompt:
      "A spherical cryogenic Moss-type insulated pressure vessel tank, cold frost coating, glowing pale turquoise clean gas flame aura, pressure gauges",
  },
  {
    id: "comm_c009",
    entityId: "C009",
    category: "commodities",
    nameZh: "重型工程机械",
    nameEn: "Heavy Machinery",
    fileName: "c009_machinery.png",
    subjectPrompt:
      "Industrial yellow and titanium hydraulic excavator arm and massive marine diesel turbine gear assembly bolted onto a steel flat-rack pallet",
  },
  {
    id: "comm_c010",
    entityId: "C010",
    assetKey: "cargo.grain",
    category: "commodities",
    nameZh: "北美优质谷物",
    nameEn: "Premium Grain",
    fileName: "c010_grain.png",
    subjectPrompt:
      "Golden wheat ears tied with a nautical rope beside an open bulk grain hopper pouring luminous golden kernels",
  },
  {
    id: "comm_c011",
    entityId: "C011",
    category: "commodities",
    nameZh: "轻工纺织品",
    nameEn: "Textiles & Apparel",
    fileName: "c011_textiles.png",
    subjectPrompt:
      "Neatly rolled bolts of luxury marine-blue silk and woven technical fabric stacked in a moisture-proof export pallet, metallic thread sheen",
  },
  {
    id: "comm_c012",
    entityId: "C012",
    category: "commodities",
    nameZh: "动力煤炭",
    nameEn: "Thermal Coal",
    fileName: "c012_coal.png",
    subjectPrompt:
      "Heap of glossy black anthracite coal briquettes with subtle glowing ember fissures at the core, heavy bulk industrial aesthetic",
  },
  {
    id: "comm_c013",
    entityId: "C013",
    category: "commodities",
    nameZh: "智利精炼铜锭",
    nameEn: "Refined Copper Ingots",
    fileName: "c013_copper.png",
    subjectPrompt:
      "Cross-stacked pure electrolytic copper ingots with warm rose-gold metallic specular reflection, stamped purity hallmark",
  },
  {
    id: "comm_c014",
    entityId: "C014",
    category: "commodities",
    nameZh: "新能源整车",
    nameEn: "Electric Vehicles",
    fileName: "c014_automobiles.png",
    subjectPrompt:
      "An aerodynamic futuristic electric sports SUV secured with wheel lashing straps on a Ro-Ro car carrier deck plate, glowing cyan LED headlights",
  },
  {
    id: "comm_c015",
    entityId: "C015",
    category: "commodities",
    nameZh: "哥伦比亚咖啡豆",
    nameEn: "Arabica Coffee Beans",
    fileName: "c015_coffee.png",
    subjectPrompt:
      "A vintage wooden export barrel and jute bag overflowing with dark roasted Arabica coffee beans, warm aromatic golden steam",
  },

  // ==================== 2. 船只图鉴图标 (Vessels V001 ~ V012, 12个) ====================
  {
    id: "vessel_v001",
    entityId: "V001",
    assetKey: "vessel.tier1.cutter",
    category: "vessels",
    nameZh: "近岸训练单桅帆船",
    nameEn: "Coastal Training Cutter",
    fileName: "v001_cutter.png",
    subjectPrompt:
      "A nimble single-masted coastal training cutter sailboat, crisp white Kevlar mainsail and jib catching the wind, cyan waterline stripe",
  },
  {
    id: "vessel_v002",
    entityId: "V002",
    assetKey: "vessel.tier1.barge",
    category: "vessels",
    nameZh: "内河与海湾机动驳船",
    nameEn: "Harbor Motor Barge",
    fileName: "v002_harbor_trader.png",
    subjectPrompt:
      "A compact steel-hull coastal utility motor barge, rear wheelhouse, forward cargo hold loaded with small crates, exhaust stack",
  },
  {
    id: "vessel_v003",
    entityId: "V003",
    assetKey: "vessel.tier2.sloop",
    category: "vessels",
    nameZh: "远洋双桅纵帆船",
    nameEn: "Ocean Schooner",
    fileName: "v003_ocean_sloop.png",
    subjectPrompt:
      "A sleek twin-masted ocean schooner with aerodynamic carbon-fiber sails and auxiliary diesel-electric pod, cutting through dark blue swell",
  },
  {
    id: "vessel_v004",
    entityId: "V004",
    assetKey: "vessel.tier2.coastalFeeder",
    category: "vessels",
    nameZh: "支线集装箱船 (120 TEU)",
    nameEn: "Coastal Feeder 120",
    fileName: "v004_feeder_120.png",
    subjectPrompt:
      "A regional feeder container ship carrying brightly stacked cyan and amber ISO containers, onboard deck crane, bridge superstructure aft",
  },
  {
    id: "vessel_v005",
    entityId: "V005",
    assetKey: "vessel.tier3.windClipper",
    category: "vessels",
    nameZh: "现代翼帆快船",
    nameEn: "Modern Wing-Sail Clipper",
    fileName: "v005_wind_clipper.png",
    subjectPrompt:
      "A high-tech wind-assisted cargo clipper featuring three rigid telescopic wing sails with glowing cyan aerodynamic trim sensors",
  },
  {
    id: "vessel_v006",
    entityId: "V006",
    assetKey: "vessel.tier3.research",
    category: "vessels",
    nameZh: "综合海洋科考船",
    nameEn: "Oceanographic Research Vessel",
    fileName: "v006_research_vessel.png",
    subjectPrompt:
      "An advanced oceanographic survey vessel painted in high-visibility marine cyan and white, A-frame stern crane, sonar dome, radar radomes",
  },
  {
    id: "vessel_v007",
    entityId: "V007",
    assetKey: "vessel.tier4.panamax",
    category: "vessels",
    nameZh: "巴拿马型远洋货轮",
    nameEn: "Panamax Container Liner",
    fileName: "v007_panamax_trader.png",
    subjectPrompt:
      "A long Panamax deep-sea container ship with multi-tier container bays, bulbous bow, glowing navigation bridge lights",
  },
  {
    id: "vessel_v008",
    entityId: "V008",
    assetKey: "vessel.tier4.oceanExplorer",
    category: "vessels",
    nameZh: "重型远洋多用途工程船",
    nameEn: "Heavy Ocean Explorer",
    fileName: "v008_ocean_explorer.png",
    subjectPrompt:
      "A rugged offshore multi-purpose heavy-lift explorer vessel with helipad on bow, twin heavy cranes, dynamic positioning thrusters",
  },
  {
    id: "vessel_v009",
    entityId: "V009",
    assetKey: "vessel.tier5.capesize",
    category: "vessels",
    nameZh: "好望角型散货巨轮",
    nameEn: "Capesize Bulk Carrier",
    fileName: "v009_cape_bulk.png",
    subjectPrompt:
      "A colossal Capesize dry bulk carrier with nine massive red-and-slate cargo hatch covers, wide beam, powerful stern wake",
  },
  {
    id: "vessel_v010",
    entityId: "V010",
    assetKey: "vessel.tier5.polarResearch",
    category: "vessels",
    nameZh: "极地破冰科考船",
    nameEn: "Polar Ice-Class Research Ship",
    fileName: "v010_arctic_research.png",
    subjectPrompt:
      "An ice-strengthened polar expedition ship with reinforced spoon-shaped icebreaker bow crushing floating sea ice floes, searchlights glowing",
  },
  {
    id: "vessel_v011",
    entityId: "V011",
    assetKey: "vessel.tier6.nuclearIcebreaker",
    category: "vessels",
    nameZh: "核动力破冰旗舰",
    nameEn: "Nuclear Icebreaker Flagship",
    fileName: "v011_nuclear_icebreaker.png",
    subjectPrompt:
      "A legendary nuclear-powered Arctic icebreaker, dark hull with shark-jaw motif and glowing cyan Cherenkov reactor core accent, shattering thick pack ice",
  },
  {
    id: "vessel_v012",
    entityId: "V012",
    assetKey: "vessel.tier6.globalExpedition",
    category: "vessels",
    nameZh: "全球零碳传奇旗舰 (ULCV)",
    nameEn: "Global Zero-Carbon Flagship",
    fileName: "v012_global_expedition.png",
    subjectPrompt:
      "A futuristic 24,000 TEU ultra-large flagship vessel combining Flettner rotor sails, solar arrays, and streamlined wave-piercing bow",
  },

  // ==================== 3. 船厂工程改装件图标 (Upgrades U001 ~ U012, 12个) ====================
  {
    id: "upg_u001",
    entityId: "U001",
    category: "upgrades",
    nameZh: "反渗透海水淡化机 Mk.I",
    nameEn: "RO Watermaker Mk.I",
    fileName: "u001_ro_plant.png",
    subjectPrompt:
      "Compact marine reverse-osmosis desalination unit with dual high-pressure cyan membrane tubes, stainless steel manifold, pure water droplet indicator",
  },
  {
    id: "upg_u002",
    entityId: "U002",
    category: "upgrades",
    nameZh: "工业级双联反渗透阵列 Mk.II",
    nameEn: "Dual RO Desalination Array Mk.II",
    fileName: "u002_ro_plant_xl.png",
    subjectPrompt:
      "Heavy industrial quad-cylinder reverse-osmosis desalination matrix with digital salinity HUD screen, glowing neon cyan water purification pipes",
  },
  {
    id: "upg_u003",
    entityId: "U003",
    category: "upgrades",
    nameZh: "副燃油深舱扩容模块",
    nameEn: "Auxiliary Deep Bunker Tank",
    fileName: "u003_bunker_tank.png",
    subjectPrompt:
      "Reinforced double-hull marine fuel bunker tank module with glowing amber fuel level sight glass, brass high-flow valves",
  },
  {
    id: "upg_u004",
    entityId: "U004",
    category: "upgrades",
    nameZh: "纳米硅酮防污底漆",
    nameEn: "Nano-Silicone Anti-Fouling Coat",
    fileName: "u004_anti_fouling.png",
    subjectPrompt:
      "A cross-section of a ship hull keel coated in shimmering hydrophobic nano-cyan polymer, deflecting water streamlines with zero friction",
  },
  {
    id: "upg_u005",
    entityId: "U005",
    category: "upgrades",
    nameZh: "碳纤维高张力竞速帆装",
    nameEn: "Carbon-Fiber Racing Rig",
    fileName: "u005_carbon_sails.png",
    subjectPrompt:
      "Woven black carbon-fiber wing sail profile with glowing cyan wind-tunnel laminar flow streamlines and hydraulic boom",
  },
  {
    id: "upg_u006",
    entityId: "U006",
    category: "upgrades",
    nameZh: "高强度钛合金抗冰肋骨",
    nameEn: "Polar Ice-Class Hull Ribs",
    fileName: "u006_polar_ribs.png",
    subjectPrompt:
      "Heavy interlocking brushed titanium ship hull framing ribs and reinforced bow stem armor plate, frost-resistant glowing seams",
  },
  {
    id: "upg_u007",
    entityId: "U007",
    category: "upgrades",
    nameZh: "弗莱特纳旋翼助航帆",
    nameEn: "Flettner Rotor Sail",
    fileName: "u007_rotor_sail.png",
    subjectPrompt:
      "A vertical spinning Flettner rotor sail cylinder on a ship deck surrounded by glowing cyan Magnus-effect vortex wind rings",
  },
  {
    id: "upg_u008",
    entityId: "U008",
    category: "upgrades",
    nameZh: "相控阵前视避碰声呐",
    nameEn: "Forward Phased-Array Sonar",
    fileName: "u008_forward_sonar.png",
    subjectPrompt:
      "A bulbous bow transducer dome emitting concentric 3D cyan bathymetric sonar scan waves detecting underwater reefs",
  },
  {
    id: "upg_u009",
    entityId: "U009",
    category: "upgrades",
    nameZh: "集装箱自动锁扣绑扎桥",
    nameEn: "Auto Twist-Lock Lashing Bridge",
    fileName: "u009_lashing_bridge.png",
    subjectPrompt:
      "Heavy-duty steel container lashing bridge with automated hydraulic twist-locks and glowing amber tension lock indicators",
  },
  {
    id: "upg_u010",
    entityId: "U010",
    category: "upgrades",
    nameZh: "主动式陀螺减摇鳍系统",
    nameEn: "Active Fin Stabilizer System",
    fileName: "u010_fin_stabilizer.png",
    subjectPrompt:
      "Retractable hydrodynamic underwater ship stabilizer fin with internal spinning gyroscopic horizon ring, glowing cyan balance aura",
  },
  {
    id: "upg_u011",
    entityId: "U011",
    category: "upgrades",
    nameZh: "高压共轨重油净化分离机",
    nameEn: "Common-Rail Fuel Purifier",
    fileName: "u011_fuel_purifier.png",
    subjectPrompt:
      "A duplex marine heavy fuel centrifuge clarifier and stainless steel filter unit, pressure gauges, glowing pure diesel flow output",
  },
  {
    id: "upg_u012",
    entityId: "U012",
    category: "upgrades",
    nameZh: "智能温控冷链货舱",
    nameEn: "Active Reefer Hold",
    fileName: "u012_active_reefer.png",
    subjectPrompt:
      "Insulated reefer cargo hold with digital cryogenic temperature readout showing -25C, frosty ceiling ventilation chillers",
  },

  // ==================== 4. 船长专精特权图标 (Captain Perks, 10个) ====================
  {
    id: "perk_engine",
    entityId: "PERK_EFFICIENT_ENGINE",
    category: "perks",
    nameZh: "轮机精通",
    nameEn: "Efficient Engine",
    fileName: "perk_efficient_engine.png",
    subjectPrompt:
      "A glowing gold marine engine piston and fuel injector, clean green efficiency leaf aura, precision tuning wrench",
  },
  {
    id: "perk_weather",
    entityId: "PERK_WEATHER_READER",
    category: "perks",
    nameZh: "海洋气象学家",
    nameEn: "Weather Reader",
    fileName: "perk_weather_reader.png",
    subjectPrompt:
      "Vintage marine aneroid barometer layered with a glowing digital holographic satellite cyclone map, brass compass rose",
  },
  {
    id: "perk_cargo",
    entityId: "PERK_CARGO_MASTER",
    category: "perks",
    nameZh: "精明大副 (积载大师)",
    nameEn: "Cargo Master",
    fileName: "perk_cargo_master.png",
    subjectPrompt:
      "A crane hoist hook lifting perfectly secured cargo containers with balanced center-of-gravity crosshairs and stability meters",
  },
  {
    id: "perk_sos",
    entityId: "PERK_EMERGENCY_CAPTAIN",
    category: "perks",
    nameZh: "海事搜救专家",
    nameEn: "Emergency Captain",
    fileName: "perk_emergency_captain.png",
    subjectPrompt:
      "A high-visibility SOLAS orange lifebuoy ring with flashing emergency locator beacon and searchlight beam cutting through darkness",
  },
  {
    id: "perk_nav",
    entityId: "PERK_OCEAN_NAVIGATOR",
    category: "perks",
    nameZh: "大洋领航员",
    nameEn: "Ocean Navigator",
    fileName: "perk_ocean_navigator.png",
    subjectPrompt:
      "An antique brass sextant projecting a glowing celestial star constellation and Great Circle navigation arc across a dark globe",
  },
  {
    id: "perk_fleet",
    entityId: "PERK_FLEET_MANAGER",
    category: "perks",
    nameZh: "远洋船队总管",
    nameEn: "Fleet Manager",
    fileName: "perk_fleet_manager.png",
    subjectPrompt:
      "A tactical digital fleet command dashboard showing multiple vessel radar blips connected by logistics trade routes worldwide",
  },
  {
    id: "perk_polar",
    entityId: "PERK_POLAR_SPECIALIST",
    category: "perks",
    nameZh: "极地破冰先驱",
    nameEn: "Polar Specialist",
    fileName: "perk_polar_specialist.png",
    subjectPrompt:
      "An ice axe crossed with a nautical compass encased in frozen polar ice crystal, aurora borealis green and cyan lighting",
  },
  {
    id: "perk_trade",
    entityId: "PERK_TRADE_NEGOTIATOR",
    category: "perks",
    nameZh: "远洋谈判专家",
    nameEn: "Trade Negotiator",
    fileName: "perk_trade_negotiator.png",
    subjectPrompt:
      "A golden maritime seal stamp, signed charter party shipping contract document, glowing gold coins and quill",
  },
  {
    id: "perk_master",
    entityId: "PERK_MASTER_MARINER",
    category: "perks",
    nameZh: "传奇船长",
    nameEn: "Master Mariner",
    fileName: "perk_master_mariner.png",
    subjectPrompt:
      "An ornate gold master mariner's anchor badge with four gold captain's epaulette stripes, laurel wreath of prestige",
  },
  {
    id: "perk_explorer",
    entityId: "PERK_GLOBAL_EXPLORER",
    category: "perks",
    nameZh: "环球远征统帅",
    nameEn: "Global Explorer",
    fileName: "perk_global_explorer.png",
    subjectPrompt:
      "A gleaming titanium globe encircled by a golden orbital shipping ring and compass star crest, sovereign maritime medal",
  },

  // ==================== 5. 气象、海况与险情警报图标 (Weather & Hazards, 9个) ====================
  {
    id: "weather_clear",
    entityId: "WEATHER_CLEAR",
    assetKey: "weather.clear",
    category: "weather",
    nameZh: "晴好海况",
    nameEn: "Clear Seas",
    fileName: "weather_clear.png",
    subjectPrompt:
      "A golden morning sun rising above a calm dark blue mirror ocean horizon, gentle ripples, crystal clear visibility",
  },
  {
    id: "weather_gale",
    entityId: "WEATHER_GALE",
    assetKey: "weather.cloudy",
    category: "weather",
    nameZh: "强风大浪 (蒲氏7~8级)",
    nameEn: "Gale Swell",
    fileName: "weather_gale.png",
    subjectPrompt:
      "Vigorous ocean swell with curling whitecap wave crests whipped by howling wind streaks, dark cumulus clouds",
  },
  {
    id: "weather_storm",
    entityId: "WEATHER_STORM",
    assetKey: "weather.storm",
    category: "weather",
    nameZh: "狂暴风暴 (蒲氏9~11级)",
    nameEn: "Violent Storm",
    fileName: "weather_storm.png",
    subjectPrompt:
      "Towering 10-meter ocean storm surge waves with crashing foam, violent lightning bolt piercing pitch black storm clouds",
  },
  {
    id: "weather_typhoon",
    entityId: "WEATHER_TYPHOON",
    category: "weather",
    nameZh: "台风/热带气旋",
    nameEn: "Typhoon Vortex",
    fileName: "weather_typhoon.png",
    subjectPrompt:
      "A massive spiral satellite typhoon hurricane vortex eye, swirling deep cyan and violet storm bands, atmospheric pressure barbs",
  },
  {
    id: "weather_fog",
    entityId: "WEATHER_FOG",
    assetKey: "weather.snow",
    category: "weather",
    nameZh: "海面浓雾",
    nameEn: "Dense Sea Fog",
    fileName: "weather_fog.png",
    subjectPrompt:
      "A maritime lighthouse beacon beam cutting faintly through dense rolling ghostly white sea fog banks, eerie stillness",
  },
  {
    id: "hazard_shallow",
    entityId: "HAZARD_SHALLOW",
    category: "hazards",
    nameZh: "浅水搁浅警报",
    nameEn: "Shallow Grounding Alert",
    fileName: "hazard_shallow.png",
    subjectPrompt:
      "A ship keel dangerously grinding against a jagged underwater coral reef seabed, flashing red warning depth danger mark",
  },
  {
    id: "hazard_overheat",
    entityId: "HAZARD_OVERHEAT",
    category: "hazards",
    nameZh: "主机过热警告",
    nameEn: "Engine Overheat Alert",
    fileName: "hazard_overheat.png",
    subjectPrompt:
      "A glowing red-hot smoking marine engine piston cylinder with orange heat steam escaping, flashing industrial warning triangle",
  },
  {
    id: "hazard_collision",
    entityId: "HAZARD_COLLISION",
    category: "hazards",
    nameZh: "碰撞危险 (CPA)",
    nameEn: "CPA Collision Danger",
    fileName: "hazard_collision.png",
    subjectPrompt:
      "Tactical marine radar screen showing two converging ship vectors on a collision course with a flashing red danger crosshair ring",
  },
  {
    id: "hazard_mayday",
    entityId: "HAZARD_MAYDAY",
    category: "hazards",
    nameZh: "MAYDAY 遇险求救",
    nameEn: "Mayday Distress Signal",
    fileName: "hazard_mayday.png",
    subjectPrompt:
      "A glowing red emergency distress flare rocketing into the night sky over stormy waves, radiating SOS radio signal waves",
  },

  // ==================== 6. 舰桥仪表、顶栏、Dock与电子海图全量UI图标 (HUD & UI, 22个) ====================
  {
    id: "hud_fuel",
    entityId: "HUD_FUEL",
    category: "hud",
    nameZh: "船燃储备 (HFO)",
    nameEn: "Marine Fuel Bunker",
    fileName: "hud_fuel.png",
    subjectPrompt:
      "A futuristic digital fuel gauge dial with glowing amber fuel droplets and high-precision percentage readout",
  },
  {
    id: "hud_water",
    entityId: "HUD_WATER",
    category: "hud",
    nameZh: "船上淡水储备",
    nameEn: "Potable Water Reserve",
    fileName: "hud_fresh_water.png",
    subjectPrompt:
      "A cylindrical water tank gauge filled with pure cyan glowing mineral water, ripple resonance waves, moisture droplets",
  },
  {
    id: "hud_food",
    entityId: "HUD_FOOD",
    category: "hud",
    nameZh: "船员伙食口粮",
    nameEn: "Crew Rations",
    fileName: "hud_food.png",
    subjectPrompt:
      "A military-grade marine emergency food crate with airtight vacuum packs and wheat emblem, green nourishment icon",
  },
  {
    id: "hud_parts",
    entityId: "HUD_PARTS",
    category: "hud",
    nameZh: "抢修备件箱",
    nameEn: "Damage Control Spare Parts",
    fileName: "hud_parts.png",
    subjectPrompt:
      "A heavy-duty waterproof yellow Pelican tool chest open, displaying titanium wrenches, engine gaskets, electronic fuses",
  },
  {
    id: "hud_telegraph",
    entityId: "HUD_TELEGRAPH",
    assetKey: "hud.engineTelegraph",
    category: "hud",
    nameZh: "车钟控制柄",
    nameEn: "Engine Order Telegraph",
    fileName: "hud_telegraph.png",
    subjectPrompt:
      "A gleaming brass antique-meets-modern ship's engine order telegraph handle set to 'FULL AHEAD', illuminated internal dial",
  },
  {
    id: "hud_compass",
    entityId: "HUD_COMPASS",
    assetKey: "hud.compass",
    category: "hud",
    nameZh: "陀螺罗经罗盘",
    nameEn: "Gyrocompass Rose",
    fileName: "hud_compass.png",
    subjectPrompt:
      "A precision military marine gyrocompass card inside a gimbaled brass ring, illuminated 360-degree markings",
  },
  {
    id: "hud_hull",
    entityId: "HUD_HULL",
    category: "hud",
    nameZh: "船体结构装甲护盾",
    nameEn: "Hull Integrity Shield",
    fileName: "hud_hull_shield.png",
    subjectPrompt:
      "A heavy riveted titanium naval armor shield with glowing emerald structural integrity grid lines and reinforced keel emblem",
  },
  {
    id: "hud_crew",
    entityId: "HUD_CREW",
    category: "hud",
    nameZh: "船员班组状态",
    nameEn: "Bridge Crew & Seafarers",
    fileName: "hud_crew_team.png",
    subjectPrompt:
      "3D isometric naval officer cap badge with crossed binoculars and glowing cyan vital heartbeat telemetry ring",
  },
  {
    id: "hud_cargo_box",
    entityId: "HUD_CARGO_BOX",
    category: "hud",
    nameZh: "货舱配载箱标",
    nameEn: "Cargo Hold Payload",
    fileName: "hud_cargo_payload.png",
    subjectPrompt:
      "An armored isometric maritime cargo crate with glowing cyan weight tonnage scale and digital manifest lock",
  },
  {
    id: "hud_route_nav",
    entityId: "HUD_ROUTE_NAV",
    category: "hud",
    nameZh: "大圆航线自动引航",
    nameEn: "Autopilot & Route Planner",
    fileName: "hud_route_nav.png",
    subjectPrompt:
      "A glowing cyan 3D navigation directional arrowhead hovering over a curved Great Circle orbital trajectory grid",
  },
  {
    id: "hud_port_trade",
    entityId: "HUD_PORT_TRADE",
    category: "hud",
    nameZh: "港口现货贸易中心",
    nameEn: "Port Trade Exchange",
    fileName: "hud_port_trade.png",
    subjectPrompt:
      "A gantry port crane hook lifting a golden-trimmed container above a glowing harbor pier exchange terminal",
  },
  {
    id: "hud_shipyard",
    entityId: "HUD_SHIPYARD",
    category: "hud",
    nameZh: "干船坞与舰船改装",
    nameEn: "Drydock & Shipyard",
    fileName: "hud_shipyard.png",
    subjectPrompt:
      "Crossed heavy titanium marine spanner wrench and brass ship propeller with glowing cyan engineering blueprint grid",
  },
  {
    id: "hud_ais_radar",
    entityId: "HUD_AIS_RADAR",
    category: "hud",
    nameZh: "AIS 船舶雷达与VHF",
    nameEn: "AIS Radar & VHF Transceiver",
    fileName: "hud_ais_radar.png",
    subjectPrompt:
      "A rotating marine X-band radar scanner dome emitting glowing cyan radar sweep rings and amber AIS target blips",
  },
  {
    id: "hud_journal",
    entityId: "HUD_JOURNAL",
    category: "hud",
    nameZh: "航海日志与海事档案",
    nameEn: "Captain's Logbook & Archives",
    fileName: "hud_journal_log.png",
    subjectPrompt:
      "A leather-and-titanium bound Captain's Logbook embossed with a glowing golden compass rose and holographic bookmark",
  },
  {
    id: "hud_credits",
    entityId: "HUD_CREDITS",
    category: "hud",
    nameZh: "海事信用金币 (CR)",
    nameEn: "Maritime Credits Coin",
    fileName: "hud_credits_coin.png",
    subjectPrompt:
      "Stacked gleaming 24k gold maritime sovereign coins embossed with a ship anchor and glowing amber aura",
  },
  {
    id: "hud_xp_badge",
    entityId: "HUD_XP_BADGE",
    category: "hud",
    nameZh: "航海资历勋章 (SXP)",
    nameEn: "Seafaring XP Star Medal",
    fileName: "hud_xp_badge.png",
    subjectPrompt:
      "A prestigious emerald-and-gold nautical star medal suspended from a navy ribbon with glowing cyan experience chevron",
  },
  {
    id: "hud_license",
    entityId: "HUD_LICENSE",
    category: "hud",
    nameZh: "航运特许资质徽章",
    nameEn: "Maritime License Crest",
    fileName: "hud_license_crest.png",
    subjectPrompt:
      "An official gold-and-cyan IMO Master Mariner license crest shield with crossed anchors and holographic certification seal",
  },
  {
    id: "hud_map_globe",
    entityId: "HUD_MAP_GLOBE",
    category: "hud",
    nameZh: "电子海图图层切换",
    nameEn: "ECDIS Chart Globe",
    fileName: "hud_map_globe.png",
    subjectPrompt:
      "A 3D holographic dark-navy nautical globe with glowing cyan latitude-longitude meridians and satellite orbital ring",
  },
  {
    id: "hud_waves",
    entityId: "HUD_WAVES",
    assetKey: "hud.seaWindow",
    category: "hud",
    nameZh: "有效波高与涌浪监测",
    nameEn: "Wave & Swell Telemetry",
    fileName: "hud_waves_swell.png",
    subjectPrompt:
      "Stylized 3D glowing cyan ocean wave crests with digital wave-height measurement laser lines and wind anemometer",
  },
  {
    id: "hud_depth_anchor",
    entityId: "HUD_DEPTH_ANCHOR",
    category: "hud",
    nameZh: "水深测深与重型海锚",
    nameEn: "Bathymetry & Heavy Anchor",
    fileName: "hud_depth_anchor.png",
    subjectPrompt:
      "A forged titanium Admiralty ship anchor descending into glowing cyan sonar depth contour rings",
  },
  {
    id: "hud_ship_marker",
    entityId: "HUD_SHIP_MARKER",
    category: "hud",
    nameZh: "电子海图本船战术船标",
    nameEn: "ECDIS Own-Ship Tactical Marker",
    fileName: "hud_ship_marker.png",
    subjectPrompt:
      "Top-down tactical ECDIS own-ship navigation chevron arrow in glowing neon cyan with white heading vector line and radar ring",
  },
  {
    id: "hud_ais_marker",
    entityId: "HUD_AIS_MARKER",
    category: "hud",
    nameZh: "电子海图AIS目标船标",
    nameEn: "ECDIS AIS Target Marker",
    fileName: "hud_ais_marker.png",
    subjectPrompt:
      "Top-down tactical ECDIS AIS vessel target triangle in glowing maritime amber-gold with course vector line and transponder pulse",
  },
];

export const ICON_MANIFEST: IconManifestItem[] = RAW_ICON_ENTRIES.map(
  buildIconManifestItem
);

export const ICON_BY_ID: Record<string, IconManifestItem> = Object.fromEntries(
  ICON_MANIFEST.map((item) => [item.id, item])
);

export const ICON_BY_ENTITY_ID: Record<string, IconManifestItem> = Object.fromEntries(
  ICON_MANIFEST.map((item) => [item.entityId, item])
);

export const ICON_BY_ASSET_KEY: Record<string, IconManifestItem> = Object.fromEntries(
  ICON_MANIFEST.filter((item) => Boolean(item.assetKey)).map((item) => [
    item.assetKey!,
    item,
  ])
);
