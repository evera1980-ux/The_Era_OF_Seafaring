import { ICON_BY_ID, ICON_BY_ENTITY_ID, ICON_BY_ASSET_KEY } from "../../config/iconManifest";

/**
 * 为全部 64 枚海事图标生成统一视觉规范的高精度等轴测 3D 风格 SVG 源文件 (512x512)
 * 视觉规范：
 * - 深板岩海军蓝底色 (#0A1128) + 拉丝钛金属内嵌边框 + 等轴测科技网格
 * - 海洋青 (#35C6D8) 与海事琥珀金 (#F59E0B) 双色霓虹辉光
 * - 每个 ID 拥有独立定制的立体剪影与高光细节
 */
export function generateHighPrecisionIconSvg(idOrEntityOrKey: string): string {
  const item =
    ICON_BY_ID[idOrEntityOrKey] ||
    ICON_BY_ENTITY_ID[idOrEntityOrKey] ||
    ICON_BY_ASSET_KEY[idOrEntityOrKey];

  const iconId = item?.id || idOrEntityOrKey;
  const category = item?.category || "commodities";

  const accentMap: Record<string, { primary: string; secondary: string; glow: string }> = {
    commodities: { primary: "#35C6D8", secondary: "#F59E0B", glow: "#0EA5E9" },
    vessels: { primary: "#38BDF8", secondary: "#F97316", glow: "#0284C7" },
    upgrades: { primary: "#2DD4BF", secondary: "#38BDF8", glow: "#14B8A6" },
    perks: { primary: "#FBBF24", secondary: "#35C6D8", glow: "#D97706" },
    weather: { primary: "#60A5FA", secondary: "#FBBF24", glow: "#3B82F6" },
    hazards: { primary: "#F87171", secondary: "#FBBF24", glow: "#EF4444" },
    hud: { primary: "#35C6D8", secondary: "#10B981", glow: "#06B6D4" },
  };

  const palette = accentMap[category] || accentMap.commodities;
  const subjectArt = renderSubjectGraphic(iconId, palette.primary, palette.secondary);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" style="background:transparent">
  <defs>
    <filter id="dropGlow_${iconId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.55"/>
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${palette.primary}" flood-opacity="0.28"/>
    </filter>
    <linearGradient id="bezel_${iconId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#334155" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${palette.secondary}" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="cyanGrad_${iconId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#67E8F9"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="amberGrad_${iconId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="steelGrad_${iconId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="50%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>

  <!-- 核心主体等轴测 3D 图形（透明背景，放大至饱满比例并附带立体阴影辉光） -->
  <g filter="url(#dropGlow_${iconId})" transform="translate(256, 256) scale(1.36) translate(-256, -256)">
    ${subjectArt}
  </g>
</svg>`;
}

export function generateHighPrecisionIconDataUri(idOrEntityOrKey: string): string {
  const svg = generateHighPrecisionIconSvg(idOrEntityOrKey);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderSubjectGraphic(iconId: string, cyan: string, amber: string): string {
  switch (iconId) {
    // ==================== 1. 贸易商品 C001 ~ C015 ====================
    case "comm_c001": // 集装箱百货
      return `
      <g>
        <!-- 底层深蓝集装箱 -->
        <polygon points="128,310 256,370 384,310 256,250" fill="#1E3A8A" stroke="${cyan}" stroke-width="3"/>
        <polygon points="128,310 256,370 256,426 128,366" fill="#172554" stroke="${cyan}" stroke-width="3"/>
        <polygon points="384,310 256,370 256,426 384,366" fill="#1E40AF" stroke="${cyan}" stroke-width="3"/>
        <!-- 中层青色集装箱 -->
        <polygon points="128,244 256,304 384,244 256,184" fill="#0284C7" stroke="#67E8F9" stroke-width="3"/>
        <polygon points="128,244 256,304 256,360 128,300" fill="#0369A1" stroke="#67E8F9" stroke-width="3"/>
        <polygon points="384,244 256,304 256,360 384,300" fill="#0EA5E9" stroke="#67E8F9" stroke-width="3"/>
        <!-- 顶层琥珀高光集装箱 -->
        <polygon points="128,178 256,238 384,178 256,118" fill="#38BDF8" stroke="#CFFAFE" stroke-width="3.5"/>
        <polygon points="128,178 256,238 256,294 128,234" fill="#0284C7" stroke="#CFFAFE" stroke-width="3"/>
        <polygon points="384,178 256,238 256,294 384,234" fill="#06B6D4" stroke="#CFFAFE" stroke-width="3"/>
        <!-- 全息条码与角件 -->
        <rect x="285" y="215" width="52" height="24" rx="4" transform="skewY(-25)" fill="#0A1128" fill-opacity="0.75" stroke="${amber}" stroke-width="2"/>
        <line x1="295" y1="220" x2="295" y2="235" transform="skewY(-25)" stroke="#67E8F9" stroke-width="3"/>
        <line x1="307" y1="220" x2="307" y2="235" transform="skewY(-25)" stroke="${amber}" stroke-width="3"/>
        <line x1="319" y1="220" x2="319" y2="235" transform="skewY(-25)" stroke="#67E8F9" stroke-width="3"/>
      </g>`;

    case "comm_c002": // 波斯湾原油
      return `
      <g>
        <ellipse cx="256" cy="390" rx="92" ry="34" fill="#0F172A" stroke="${amber}" stroke-width="4"/>
        <path d="M164,190 L164,390 A92,34 0 0,0 348,390 L348,190 Z" fill="#1E293B" stroke="${cyan}" stroke-width="4"/>
        <!-- 琥珀色警示腰带 -->
        <path d="M164,265 L164,320 A92,34 0 0,0 348,320 L348,265 A92,34 0 0,1 164,265 Z" fill="${amber}" fill-opacity="0.88" stroke="#FDE68A" stroke-width="2"/>
        <ellipse cx="256" cy="190" rx="92" ry="34" fill="#334155" stroke="#67E8F9" stroke-width="4"/>
        <!-- 飞溅黑金原油液滴 -->
        <path d="M276,182 C265,120 315,86 334,118 C352,148 310,176 286,188 Z" fill="#090D16" stroke="${cyan}" stroke-width="3.5"/>
        <circle cx="315" cy="126" r="8" fill="#E0F2FE"/>
      </g>`;

    case "comm_c003": // 澳洲铁矿石
      return `
      <g>
        <polygon points="126,336 196,210 278,190 388,312 316,396 168,392" fill="#7C2D12" stroke="#F97316" stroke-width="4"/>
        <polygon points="196,210 278,190 296,288 214,316" fill="#9A3412" stroke="#FDBA74" stroke-width="3"/>
        <polygon points="278,190 388,312 316,396 296,288" fill="#431407" stroke="${amber}" stroke-width="3"/>
        <polygon points="126,336 214,316 316,396 168,392" fill="#B45309" stroke="#FDE68A" stroke-width="3"/>
        <!-- 矿物扫描线 -->
        <polyline points="156,306 238,256 336,296" fill="none" stroke="${cyan}" stroke-width="3" stroke-dasharray="6 4"/>
        <circle cx="238" cy="256" r="7" fill="#67E8F9"/>
      </g>`;

    case "comm_c004": // 智利冷链海鲜
      return `
      <g>
        <polygon points="132,290 256,354 380,290 256,226" fill="#083344" stroke="#67E8F9" stroke-width="3.5"/>
        <polygon points="132,290 256,354 256,418 132,354" fill="#0E7490" stroke="#67E8F9" stroke-width="3.5"/>
        <polygon points="380,290 256,354 256,418 380,354" fill="#155E75" stroke="#67E8F9" stroke-width="3.5"/>
        <!-- 银色深海鲑鱼剪影与冰晶 -->
        <path d="M172,226 C220,176 296,176 346,218 C312,248 230,256 172,226 Z" fill="#E0F2FE" stroke="#38BDF8" stroke-width="3"/>
        <polygon points="336,218 372,192 364,238" fill="#7DD3FC" stroke="#38BDF8" stroke-width="2.5"/>
        <!-- 冰晶雪花符号 -->
        <path d="M256,122 L256,174 M230,148 L282,148 M238,130 L274,166 M274,130 L238,166" stroke="#A5F3FC" stroke-width="4" stroke-linecap="round"/>
      </g>`;

    case "comm_c005": // 精密海事仪器
      return `
      <g>
        <rect x="136" y="136" width="240" height="240" rx="28" fill="#0F172A" stroke="${cyan}" stroke-width="4"/>
        <circle cx="256" cy="256" r="84" fill="none" stroke="${amber}" stroke-width="5"/>
        <circle cx="256" cy="256" r="52" fill="#083344" stroke="#67E8F9" stroke-width="3"/>
        <!-- 光纤电路与陀螺仪轴线 -->
        <path d="M136,256 L172,256 M340,256 L376,256 M256,136 L256,172 M256,340 L256,376" stroke="#67E8F9" stroke-width="4"/>
        <polygon points="256,192 274,256 256,320 238,256" fill="${amber}"/>
        <circle cx="256" cy="256" r="12" fill="#E0F2FE"/>
      </g>`;

    case "comm_c006": // 东南亚橡胶
      return `
      <g>
        <ellipse cx="256" cy="340" rx="108" ry="44" fill="#334155" stroke="${amber}" stroke-width="3.5"/>
        <ellipse cx="256" cy="292" rx="108" ry="44" fill="#475569" stroke="${amber}" stroke-width="3.5"/>
        <ellipse cx="256" cy="244" rx="108" ry="44" fill="#64748B" stroke="${cyan}" stroke-width="3.5"/>
        <ellipse cx="256" cy="244" rx="46" ry="18" fill="#0A1128" stroke="#67E8F9" stroke-width="3"/>
        <!-- 捆扎钢带 -->
        <path d="M196,212 L196,372 M316,212 L316,372" stroke="${amber}" stroke-width="6"/>
      </g>`;

    case "comm_c007": // 巴西大豆
      return `
      <g>
        <path d="M168,200 C142,272 148,382 192,404 L320,404 C364,382 370,272 344,200 L296,164 L216,164 Z" fill="#92400E" stroke="#F59E0B" stroke-width="4"/>
        <ellipse cx="256" cy="186" rx="68" ry="26" fill="#FEF3C7" stroke="${amber}" stroke-width="3"/>
        <!-- 饱满金黄大豆颗粒 -->
        <circle cx="232" cy="182" r="14" fill="#FBBF24"/>
        <circle cx="262" cy="176" r="15" fill="#F59E0B"/>
        <circle cx="284" cy="188" r="13" fill="#FBBF24"/>
        <circle cx="248" cy="196" r="13" fill="#D97706"/>
        <circle cx="256" cy="306" r="38" fill="none" stroke="#FDE68A" stroke-width="3" stroke-dasharray="6 4"/>
      </g>`;

    case "comm_c008": // 液化天然气 LNG
      return `
      <g>
        <ellipse cx="256" cy="366" rx="116" ry="38" fill="#1E293B" stroke="${cyan}" stroke-width="4"/>
        <circle cx="256" cy="252" r="102" fill="#083344" stroke="#67E8F9" stroke-width="5"/>
        <ellipse cx="256" cy="252" rx="102" ry="34" fill="none" stroke="${cyan}" stroke-width="3" stroke-dasharray="8 6"/>
        <!-- 洁净蓝青LNG火焰徽记 -->
        <path d="M256,168 C292,216 300,258 256,304 C212,258 220,216 256,168 Z" fill="#22D3EE" stroke="#CFFAFE" stroke-width="3"/>
        <path d="M256,212 C274,238 278,262 256,288 C234,262 238,238 256,212 Z" fill="#ECFEFF"/>
      </g>`;

    case "comm_c009": // 欧洲工业机械
      return `
      <g>
        <circle cx="222" cy="232" r="78" fill="#334155" stroke="${cyan}" stroke-width="6"/>
        <circle cx="222" cy="232" r="34" fill="#0A1128" stroke="${amber}" stroke-width="5"/>
        <circle cx="318" cy="322" r="56" fill="#475569" stroke="${amber}" stroke-width="5"/>
        <circle cx="318" cy="322" r="22" fill="#0A1128" stroke="#67E8F9" stroke-width="4"/>
        <!-- 齿轮齿冠 -->
        <path d="M222,138 L222,154 M222,310 L222,326 M128,232 L144,232 M300,232 L316,232" stroke="#67E8F9" stroke-width="14" stroke-linecap="round"/>
      </g>`;

    case "comm_c010": // 北美谷物
      return `
      <g>
        <polygon points="140,336 372,336 336,412 176,412" fill="#1E293B" stroke="${cyan}" stroke-width="3.5"/>
        <!-- 金色麦穗束 -->
        <path d="M256,336 L256,136 M256,280 L204,172 M256,280 L308,172" stroke="#FBBF24" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="256" cy="156" rx="14" ry="28" fill="#FDE68A" stroke="#D97706" stroke-width="2"/>
        <ellipse cx="212" cy="182" rx="13" ry="25" transform="rotate(-24 212 182)" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
        <ellipse cx="300" cy="182" rx="13" ry="25" transform="rotate(24 300 182)" fill="#FBBF24" stroke="#D97706" stroke-width="2"/>
      </g>`;

    case "comm_c011": // 印度纺织品
      return `
      <g>
        <polygon points="128,360 256,412 384,360 256,308" fill="#78350F" stroke="${amber}" stroke-width="3"/>
        <!-- 彩色丝绸与棉布卷筒 -->
        <rect x="162" y="242" width="188" height="44" rx="22" fill="#0284C7" stroke="#67E8F9" stroke-width="3"/>
        <rect x="176" y="192" width="160" height="44" rx="22" fill="#D97706" stroke="#FDE68A" stroke-width="3"/>
        <rect x="194" y="142" width="124" height="44" rx="22" fill="#0D9488" stroke="#99F6E4" stroke-width="3"/>
      </g>`;

    case "comm_c012": // 澳洲煤炭
      return `
      <g>
        <polygon points="136,296 376,296 342,404 170,404" fill="#1E293B" stroke="${cyan}" stroke-width="4"/>
        <!-- 黑亮无烟煤晶块 -->
        <polygon points="164,296 206,204 268,186 346,296" fill="#090D16" stroke="#64748B" stroke-width="3.5"/>
        <polygon points="216,296 268,186 322,226 346,296" fill="#111827" stroke="${amber}" stroke-width="3"/>
        <circle cx="204" cy="416" r="18" fill="#334155" stroke="${amber}" stroke-width="4"/>
        <circle cx="308" cy="416" r="18" fill="#334155" stroke="${amber}" stroke-width="4"/>
      </g>`;

    case "comm_c013": // 非洲铜矿
      return `
      <g>
        <!-- 电解铜板叠层 -->
        <polygon points="134,326 256,386 378,326 256,266" fill="#9A3412" stroke="#FDBA74" stroke-width="3"/>
        <polygon points="134,282 256,342 378,282 256,222" fill="#C2410C" stroke="#FED7AA" stroke-width="3"/>
        <polygon points="134,238 256,298 378,238 256,178" fill="#EA580C" stroke="#FFEDD5" stroke-width="3.5"/>
        <text x="256" y="252" text-anchor="middle" fill="#FFF7ED" font-family="monospace" font-weight="bold" font-size="38">Cu</text>
      </g>`;

    case "comm_c014": // 日本精密汽车
      return `
      <g>
        <!-- Ro-Ro 滚装船固定甲板与流线型轿跑 -->
        <polygon points="116,348 256,408 396,348 256,288" fill="#1E293B" stroke="${cyan}" stroke-width="3"/>
        <path d="M148,308 L184,238 L306,238 L364,296 L364,332 L148,332 Z" fill="#0284C7" stroke="#E0F2FE" stroke-width="3.5"/>
        <polygon points="194,248 294,248 328,288 172,288" fill="#083344" stroke="#67E8F9" stroke-width="2"/>
        <circle cx="196" cy="332" r="24" fill="#090D16" stroke="${amber}" stroke-width="5"/>
        <circle cx="318" cy="332" r="24" fill="#090D16" stroke="${amber}" stroke-width="5"/>
      </g>`;

    case "comm_c015": // 南美咖啡
      return `
      <g>
        <ellipse cx="256" cy="264" rx="88" ry="112" transform="rotate(-18 256 264)" fill="#451A03" stroke="#F59E0B" stroke-width="5"/>
        <path d="M216,164 C244,232 268,296 296,364" fill="none" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
      </g>`;

    // ==================== 2. 船只图标 V001 ~ V012 ====================
    case "vessel_v001": // 沿海巡逻艇
    case "vessel_v002": // 港口驳船
    case "vessel_v004": // 支线集装箱船
    case "vessel_v006": // 海洋科考船
    case "vessel_v007": // 巴拿马型货轮
    case "vessel_v008": // 深远洋勘探船
    case "vessel_v009": // 好望角型散货船
    case "vessel_v010": // 极地考察船
    case "vessel_v011": // 核动力破冰船
    case "vessel_v012": // 环球远征母舰
      return renderMotorVesselIcon(iconId, cyan, amber);

    case "vessel_v003": // 单桅远洋纵帆船
    case "vessel_v005": // 多桅飞剪帆船
      return renderSailVesselIcon(iconId, cyan, amber);

    // ==================== 3. 船厂改装模块 U001 ~ U012 ====================
    case "upg_u001":
    case "upg_u002": // RO反渗透淡水机
      return `
      <g>
        <rect x="148" y="152" width="64" height="208" rx="32" fill="#0E7490" stroke="#67E8F9" stroke-width="4"/>
        <rect x="296" y="152" width="64" height="208" rx="32" fill="#0E7490" stroke="#67E8F9" stroke-width="4"/>
        <!-- 中央纯净淡水滴 -->
        <path d="M256,168 C294,228 304,274 256,318 C208,274 218,228 256,168 Z" fill="#38BDF8" stroke="#E0F2FE" stroke-width="4"/>
        <path d="M180,360 L332,360" stroke="${amber}" stroke-width="8" stroke-linecap="round"/>
      </g>`;

    case "upg_u003": // 远洋副油箱扩建
      return `
      <g>
        <rect x="132" y="184" width="248" height="156" rx="42" fill="#1E293B" stroke="${amber}" stroke-width="5"/>
        <rect x="168" y="214" width="32" height="96" rx="8" fill="#0A1128" stroke="#FDE68A" stroke-width="2.5"/>
        <rect x="172" y="246" width="24" height="60" rx="4" fill="#F59E0B"/>
        <path d="M256,220 C282,256 288,284 256,312 C224,284 230,256 256,220 Z" fill="${amber}" stroke="#FEF3C7" stroke-width="3"/>
      </g>`;

    case "upg_u004": // 有机硅防污底漆
      return `
      <g>
        <path d="M132,196 L380,196 L336,356 L176,356 Z" fill="#991B1B" stroke="#F87171" stroke-width="4"/>
        <!-- 流体层流减阻光束 -->
        <path d="M116,256 Q256,220 396,256" fill="none" stroke="#67E8F9" stroke-width="6" stroke-linecap="round"/>
        <path d="M126,298 Q256,262 386,298" fill="none" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
        <path d="M142,338 Q256,304 370,338" fill="none" stroke="${amber}" stroke-width="4" stroke-linecap="round"/>
      </g>`;

    case "upg_u005": // 大功率船首侧推器
      return `
      <g>
        <circle cx="256" cy="256" r="98" fill="#0F172A" stroke="${cyan}" stroke-width="6"/>
        <circle cx="256" cy="256" r="24" fill="${amber}"/>
        <ellipse cx="256" cy="196" rx="22" ry="44" fill="#F59E0B"/>
        <ellipse cx="204" cy="286" rx="22" ry="44" transform="rotate(-120 204 286)" fill="#F59E0B"/>
        <ellipse cx="308" cy="286" rx="22" ry="44" transform="rotate(120 308 286)" fill="#F59E0B"/>
        <path d="M88,256 L142,256 M370,256 L424,256" stroke="#67E8F9" stroke-width="8" stroke-linecap="round"/>
      </g>`;

    case "upg_u006": // 极地冰区加强肋骨
      return `
      <g>
        <polygon points="256,120 376,176 352,336 256,404 160,336 136,176" fill="#1E293B" stroke="#67E8F9" stroke-width="5"/>
        <path d="M256,136 L256,388 M152,216 L360,216 M164,292 L348,292" stroke="${amber}" stroke-width="7"/>
      </g>`;

    case "upg_u007": // Flettner转子帆系统
      return `
      <g>
        <ellipse cx="256" cy="376" rx="76" ry="26" fill="#334155" stroke="${cyan}" stroke-width="4"/>
        <rect x="208" y="136" width="96" height="240" rx="16" fill="#E2E8F0" stroke="#38BDF8" stroke-width="4"/>
        <ellipse cx="256" cy="136" rx="64" ry="22" fill="#F8FAFC" stroke="${amber}" stroke-width="4"/>
        <!-- 马格努斯旋流 -->
        <path d="M116,216 C186,176 326,256 396,216" fill="none" stroke="#67E8F9" stroke-width="5" stroke-linecap="round"/>
        <path d="M116,288 C186,248 326,328 396,288" fill="none" stroke="${amber}" stroke-width="5" stroke-linecap="round"/>
      </g>`;

    case "upg_u008": // 甲板太阳能阵列
      return `
      <g>
        <polygon points="116,288 256,364 396,288 256,212" fill="#0284C7" stroke="#67E8F9" stroke-width="4"/>
        <line x1="186" y1="250" x2="326" y2="326" stroke="#E0F2FE" stroke-width="2.5"/>
        <line x1="326" y1="250" x2="186" y2="326" stroke="#E0F2FE" stroke-width="2.5"/>
        <circle cx="256" cy="144" r="34" fill="#FBBF24" stroke="#FEF3C7" stroke-width="4"/>
      </g>`;

    case "upg_u009": // 前视多波束深海声呐
      return `
      <g>
        <circle cx="256" cy="156" r="28" fill="#38BDF8" stroke="#E0F2FE" stroke-width="4"/>
        <path d="M196,226 A96,96 0 0,0 316,226" fill="none" stroke="#67E8F9" stroke-width="5" stroke-linecap="round"/>
        <path d="M156,282 A148,148 0 0,0 356,282" fill="none" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
        <path d="M116,342 A204,204 0 0,0 396,342" fill="none" stroke="${amber}" stroke-width="5" stroke-linecap="round"/>
      </g>`;

    case "upg_u010": // AI气象寻优自动引航
      return `
      <g>
        <circle cx="256" cy="256" r="96" fill="none" stroke="#67E8F9" stroke-width="6"/>
        <circle cx="256" cy="256" r="36" fill="#083344" stroke="${amber}" stroke-width="5"/>
        <path d="M256,124 L256,388 M124,256 L388,256 M162,162 L350,350 M350,162 L162,350" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
      </g>`;

    case "upg_u011": // 双联高压燃油精滤器
      return `
      <g>
        <rect x="156" y="164" width="76" height="184" rx="20" fill="#334155" stroke="${amber}" stroke-width="4"/>
        <rect x="280" y="164" width="76" height="184" rx="20" fill="#334155" stroke="${cyan}" stroke-width="4"/>
        <path d="M194,142 L318,142 M194,370 L318,370" stroke="#67E8F9" stroke-width="8" stroke-linecap="round"/>
        <circle cx="256" cy="256" r="28" fill="#0F172A" stroke="#FDE68A" stroke-width="4"/>
      </g>`;

    case "upg_u012": // 智能温控冷链货舱
      return `
      <g>
        <rect x="136" y="148" width="240" height="216" rx="28" fill="#083344" stroke="#67E8F9" stroke-width="5"/>
        <path d="M256,184 L256,328 M184,256 L328,256 M204,204 L308,308 M308,204 L204,308" stroke="#CFFAFE" stroke-width="6" stroke-linecap="round"/>
      </g>`;

    // ==================== 4. 船长专精特权 Perks ====================
    default:
      if (iconId.startsWith("perk_")) {
        return renderPerkBadgeIcon(iconId, cyan, amber);
      }
      if (iconId.startsWith("weather_") || iconId.startsWith("hazard_")) {
        return renderWeatherHazardIcon(iconId, cyan, amber);
      }
      return renderHudLogisticsIcon(iconId, cyan, amber);
  }
}

function renderMotorVesselIcon(iconId: string, cyan: string, amber: string): string {
  const isIcebreaker = iconId === "vessel_v010" || iconId === "vessel_v011";
  const isMega = iconId === "vessel_v009" || iconId === "vessel_v012";
  const hullColor = isIcebreaker ? "#DC2626" : isMega ? "#0284C7" : "#1E3A8A";
  return `
  <g>
    <!-- 海面尾迹波纹 -->
    <path d="M96,356 Q256,392 416,356" fill="none" stroke="${cyan}" stroke-width="4" stroke-dasharray="10 6"/>
    <!-- 船体等轴测轮廓 -->
    <polygon points="104,296 364,296 416,244 336,348 128,348" fill="${hullColor}" stroke="#E0F2FE" stroke-width="4"/>
    <!-- 上层建筑舰桥 -->
    <polygon points="142,296 142,212 224,212 238,296" fill="#E2E8F0" stroke="${cyan}" stroke-width="3.5"/>
    <rect x="156" y="226" width="54" height="16" rx="4" fill="#0284C7"/>
    <!-- 甲板货舱/反应堆/雷达球 -->
    <rect x="252" y="248" width="44" height="48" rx="6" fill="${amber}" stroke="#FEF3C7" stroke-width="2.5"/>
    <rect x="304" y="256" width="42" height="40" rx="6" fill="#0EA5E9" stroke="#E0F2FE" stroke-width="2.5"/>
    <line x1="184" y1="156" x2="184" y2="212" stroke="#67E8F9" stroke-width="4"/>
    <circle cx="184" cy="152" r="8" fill="${amber}"/>
  </g>`;
}

function renderSailVesselIcon(iconId: string, cyan: string, amber: string): string {
  const multiMast = iconId === "vessel_v005";
  return `
  <g>
    <polygon points="116,328 386,328 412,288 346,364 148,364" fill="#0F172A" stroke="${cyan}" stroke-width="4"/>
    <polygon points="244,124 244,312 148,296" fill="#F8FAFC" stroke="#67E8F9" stroke-width="3.5"/>
    <polygon points="258,144 358,304 258,312" fill="#E0F2FE" stroke="${amber}" stroke-width="3.5"/>
    ${
      multiMast
        ? `<polygon points="332,168 396,296 332,304" fill="#BAE6FD" stroke="#67E8F9" stroke-width="3"/>`
        : ""
    }
  </g>`;
}

function renderPerkBadgeIcon(iconId: string, cyan: string, amber: string): string {
  switch (iconId) {
    case "perk_cargo": // 精明大副 (积载大师)
      return `
      <g>
        <!-- 起重吊钩与平衡集装箱 -->
        <line x1="256" y1="88" x2="256" y2="158" stroke="#94A3B8" stroke-width="10"/>
        <path d="M236,158 C236,192 276,192 276,170" fill="none" stroke="${amber}" stroke-width="10" stroke-linecap="round"/>
        <line x1="256" y1="184" x2="164" y2="256" stroke="#67E8F9" stroke-width="4" stroke-dasharray="6 4"/>
        <line x1="256" y1="184" x2="348" y2="256" stroke="#67E8F9" stroke-width="4" stroke-dasharray="6 4"/>
        <polygon points="136,286 256,342 376,286 256,230" fill="#0284C7" stroke="#E0F2FE" stroke-width="4"/>
        <polygon points="136,286 256,342 256,406 136,350" fill="#0369A1" stroke="#67E8F9" stroke-width="3.5"/>
        <polygon points="376,286 256,342 256,406 376,350" fill="#0EA5E9" stroke="#67E8F9" stroke-width="3.5"/>
        <!-- 重心十字准星 -->
        <circle cx="256" cy="316" r="28" fill="#0284C7" fill-opacity="0.35" stroke="${amber}" stroke-width="4"/>
        <path d="M220,316 L292,316 M256,280 L256,352" stroke="#FDE68A" stroke-width="3"/>
      </g>`;

    case "perk_sos": // 海事搜救专家
      return `
      <g>
        <!-- SOLAS 高亮橙色救生圈与信标光束 -->
        <polygon points="256,256 380,104 428,156" fill="#38BDF8" fill-opacity="0.32"/>
        <path d="M256,156 A112,112 0 1,0 256,380 A112,112 0 1,0 256,156 Z M256,212 A56,56 0 1,1 256,324 A56,56 0 1,1 256,212 Z" fill="#EA580C" fill-rule="evenodd" stroke="#FED7AA" stroke-width="6"/>
        <!-- 反光白条 -->
        <rect x="238" y="156" width="36" height="54" fill="#F8FAFC"/>
        <rect x="238" y="326" width="36" height="54" fill="#F8FAFC"/>
        <rect x="144" y="250" width="54" height="36" fill="#F8FAFC"/>
        <rect x="314" y="250" width="54" height="36" fill="#F8FAFC"/>
        <circle cx="256" cy="126" r="16" fill="#EF4444" stroke="#FEF08A" stroke-width="4"/>
      </g>`;

    case "perk_nav": // 大洋领航员 (六分仪与大圆航线)
      return `
      <g>
        <circle cx="256" cy="272" r="110" fill="#0284C7" fill-opacity="0.18" stroke="${cyan}" stroke-width="4"/>
        <path d="M156,296 Q256,192 356,248" fill="none" stroke="#67E8F9" stroke-width="5" stroke-dasharray="8 6"/>
        <!-- 黄铜六分仪立体框架 -->
        <path d="M168,332 A128,128 0 0,0 344,332" fill="none" stroke="${amber}" stroke-width="14" stroke-linecap="round"/>
        <line x1="256" y1="156" x2="176" y2="336" stroke="#FDE68A" stroke-width="8"/>
        <line x1="256" y1="156" x2="336" y2="336" stroke="#FDE68A" stroke-width="8"/>
        <line x1="256" y1="156" x2="292" y2="354" stroke="#F59E0B" stroke-width="6"/>
        <circle cx="256" cy="156" r="16" fill="#FEF3C7" stroke="#B45309" stroke-width="4"/>
      </g>`;

    case "perk_fleet": // 远洋船队总管 (全球雷达调度台)
      return `
      <g>
        <circle cx="256" cy="256" r="124" fill="#14B8A6" fill-opacity="0.18" stroke="#2DD4BF" stroke-width="5"/>
        <circle cx="256" cy="256" r="82" fill="none" stroke="#14B8A6" stroke-width="2.5" stroke-dasharray="8 6"/>
        <circle cx="256" cy="256" r="42" fill="none" stroke="#14B8A6" stroke-width="2.5"/>
        <!-- 航线网络与3艘船队光点 -->
        <polyline points="178,296 256,216 338,268" fill="none" stroke="${amber}" stroke-width="4" stroke-dasharray="6 4"/>
        <polygon points="178,280 192,306 164,306" fill="#67E8F9"/>
        <polygon points="256,200 270,226 242,226" fill="#FBBF24"/>
        <polygon points="338,252 352,278 324,278" fill="#67E8F9"/>
      </g>`;

    case "perk_polar": // 极地破冰先驱 (冰晶与破冰镐罗盘)
      return `
      <g>
        <polygon points="256,104 356,176 332,356 256,408 180,356 156,176" fill="#0284C7" fill-opacity="0.28" stroke="#67E8F9" stroke-width="5"/>
        <polygon points="256,128 328,188 308,336 256,378 204,336 184,188" fill="#0E7490" fill-opacity="0.45" stroke="#CFFAFE" stroke-width="3"/>
        <line x1="176" y1="336" x2="336" y2="176" stroke="${amber}" stroke-width="10" stroke-linecap="round"/>
        <path d="M296,156 Q348,156 356,208" fill="none" stroke="#E2E8F0" stroke-width="10" stroke-linecap="round"/>
        <circle cx="256" cy="256" r="42" fill="#0369A1" stroke="#22D3EE" stroke-width="5"/>
        <polygon points="256,222 268,256 256,290 244,256" fill="#FBBF24"/>
      </g>`;

    case "perk_trade": // 远洋谈判专家 (海事火漆印章与租船契约)
      return `
      <g>
        <rect x="148" y="128" width="196" height="256" rx="18" fill="#FEF3C7" stroke="${amber}" stroke-width="5"/>
        <line x1="178" y1="176" x2="314" y2="176" stroke="#92400E" stroke-width="6" stroke-linecap="round"/>
        <line x1="178" y1="212" x2="314" y2="212" stroke="#B45309" stroke-width="5" stroke-linecap="round"/>
        <line x1="178" y1="248" x2="274" y2="248" stroke="#B45309" stroke-width="5" stroke-linecap="round"/>
        <!-- 金色海事印章与金币 -->
        <circle cx="316" cy="324" r="54" fill="#D97706" stroke="#FEF08A" stroke-width="5"/>
        <circle cx="316" cy="324" r="36" fill="#B45309" stroke="#FDE68A" stroke-width="2.5" stroke-dasharray="6 4"/>
        <text x="316" y="336" text-anchor="middle" fill="#FEF08A" font-family="monospace" font-weight="bold" font-size="34">CR</text>
      </g>`;

    default: // perk_master 传奇船长 (金锚肩章与月桂冠)
      return `
      <g>
        <polygon points="256,96 302,182 396,196 328,262 344,356 256,312 168,356 184,262 116,196 210,182" fill="#B45309" stroke="#FEF08A" stroke-width="5"/>
        <circle cx="256" cy="248" r="72" fill="#0369A1" stroke="#38BDF8" stroke-width="5"/>
        <path d="M256,192 L256,298 M222,220 L290,220 M210,268 A46,46 0 0,0 302,268" fill="none" stroke="#FBBF24" stroke-width="8" stroke-linecap="round"/>
        <circle cx="256" cy="184" r="10" fill="#FEF08A"/>
      </g>`;
  }
}

function renderWeatherHazardIcon(iconId: string, cyan: string, amber: string): string {
  const isHazard = iconId.startsWith("hazard_");
  if (isHazard) {
    return `
    <g>
      <polygon points="256,120 400,372 112,372" fill="#DC2626" fill-opacity="0.85" stroke="#FCA5A5" stroke-width="6" stroke-linejoin="round"/>
      <line x1="256" y1="196" x2="256" y2="292" stroke="#FEF08A" stroke-width="14" stroke-linecap="round"/>
      <circle cx="256" cy="334" r="9" fill="#FEF08A"/>
    </g>`;
  }
  // weather_clear 晴好海况 (金日朝阳与镜面海平线)
  return `
  <g>
    <circle cx="256" cy="216" r="68" fill="url(#amberGrad_${iconId})" stroke="#FEF3C7" stroke-width="5"/>
    <path d="M256,116 L256,134 M256,298 L256,316 M156,216 L174,216 M338,216 L356,216 M184,144 L198,158 M314,274 L328,288 M328,144 L314,158 M198,274 L184,288" stroke="#FDE68A" stroke-width="6" stroke-linecap="round"/>
    <path d="M104,316 Q180,292 256,316 T408,316" fill="none" stroke="#38BDF8" stroke-width="10" stroke-linecap="round"/>
    <path d="M132,356 Q194,334 256,356 T380,356" fill="none" stroke="#67E8F9" stroke-width="8" stroke-linecap="round"/>
    <path d="M176,392 Q216,378 256,392 T336,392" fill="none" stroke="${amber}" stroke-width="6" stroke-linecap="round"/>
  </g>`;
}

function renderHudLogisticsIcon(iconId: string, cyan: string, amber: string): string {
  switch (iconId) {
    case "hud_hull": // 船体结构装甲护盾
      return `
      <g>
        <path d="M256,104 L388,154 L372,286 C360,348 312,392 256,416 C200,392 152,348 140,286 L124,154 Z" fill="#059669" fill-opacity="0.35" stroke="#34D399" stroke-width="6"/>
        <path d="M256,128 L360,168 L346,278 C336,328 298,364 256,386 C214,364 176,328 166,278 L152,168 Z" fill="#10B981" fill-opacity="0.25" stroke="${cyan}" stroke-width="3.5"/>
        <line x1="256" y1="136" x2="256" y2="380" stroke="#6EE7B7" stroke-width="4" stroke-dasharray="8 6"/>
        <line x1="168" y1="236" x2="344" y2="236" stroke="#6EE7B7" stroke-width="4" stroke-dasharray="8 6"/>
        <polygon points="256,184 292,236 256,312 220,236" fill="#10B981" stroke="#ECFDF5" stroke-width="3"/>
      </g>`;

    case "hud_crew": // 船员班组状态 (海事军官帽徽与生命心率环)
      return `
      <g>
        <circle cx="256" cy="256" r="118" fill="#0284C7" fill-opacity="0.2" stroke="${cyan}" stroke-width="5"/>
        <!-- 大檐船长帽与金锚徽 -->
        <ellipse cx="256" cy="212" rx="92" ry="44" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
        <path d="M176,222 L336,222 L322,262 L190,262 Z" fill="#1E3A8A" stroke="${amber}" stroke-width="4"/>
        <path d="M188,262 Q256,288 324,262" fill="#0284C7" stroke="#38BDF8" stroke-width="4"/>
        <circle cx="256" cy="242" r="16" fill="${amber}" stroke="#FEF08A" stroke-width="3"/>
        <!-- 心电健康脉冲波形 -->
        <polyline points="154,324 208,324 224,294 244,354 266,308 282,334 296,324 358,324" fill="none" stroke="#34D399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`;

    case "hud_cargo_box": // 货舱配载箱标
      return `
      <g>
        <polygon points="256,118 384,182 256,246 128,182" fill="#0284C7" stroke="#BAE6FD" stroke-width="4.5"/>
        <polygon points="128,182 256,246 256,388 128,324" fill="#0369A1" stroke="${cyan}" stroke-width="4"/>
        <polygon points="384,182 256,246 256,388 384,324" fill="#075985" stroke="${cyan}" stroke-width="4"/>
        <line x1="192" y1="214" x2="192" y2="356" stroke="#38BDF8" stroke-width="4" stroke-dasharray="10 6"/>
        <line x1="320" y1="214" x2="320" y2="356" stroke="#38BDF8" stroke-width="4" stroke-dasharray="10 6"/>
        <rect x="218" y="266" width="76" height="44" rx="8" fill="#0369A1" stroke="${amber}" stroke-width="3.5"/>
        <text x="256" y="295" text-anchor="middle" fill="#FDE68A" font-family="monospace" font-weight="bold" font-size="22">DWT</text>
      </g>`;

    case "hud_route_nav": // 大圆航线自动引航
      return `
      <g>
        <circle cx="256" cy="264" r="118" fill="#0284C7" fill-opacity="0.18" stroke="#38BDF8" stroke-width="4"/>
        <ellipse cx="256" cy="264" rx="112" ry="52" fill="none" stroke="#67E8F9" stroke-width="3.5" stroke-dasharray="8 6" transform="rotate(-24 256 264)"/>
        <!-- 3D 发光引航罗盘飞梭 -->
        <polygon points="256,96 348,356 256,304 164,356" fill="${cyan}" stroke="#F0F9FF" stroke-width="5" stroke-linejoin="round"/>
        <polygon points="256,96 348,356 256,304" fill="#06B6D4"/>
        <circle cx="256" cy="248" r="16" fill="${amber}" stroke="#FEF3C7" stroke-width="3"/>
      </g>`;

    case "hud_port_trade": // 港口现货贸易中心 (龙门吊与黄金货箱)
      return `
      <g>
        <!-- 港口龙门吊钢架 -->
        <path d="M136,384 L164,132 L348,132 L376,384" fill="none" stroke="#94A3B8" stroke-width="12" stroke-linejoin="round"/>
        <line x1="120" y1="158" x2="392" y2="158" stroke="${cyan}" stroke-width="10" stroke-linecap="round"/>
        <line x1="256" y1="158" x2="256" y2="232" stroke="#FDE68A" stroke-width="5"/>
        <!-- 吊装中的黄金贸易集装箱 -->
        <rect x="172" y="232" width="168" height="104" rx="12" fill="#D97706" stroke="#FEF08A" stroke-width="5"/>
        <line x1="214" y1="248" x2="214" y2="320" stroke="#FDE68A" stroke-width="4"/>
        <line x1="256" y1="248" x2="256" y2="320" stroke="#FDE68A" stroke-width="4"/>
        <line x1="298" y1="248" x2="298" y2="320" stroke="#FDE68A" stroke-width="4"/>
        <path d="M108,384 L404,384" stroke="#38BDF8" stroke-width="8" stroke-linecap="round"/>
      </g>`;

    case "hud_shipyard": // 干船坞与舰船改装 (钛金扳手与螺旋桨)
      return `
      <g>
        <circle cx="256" cy="256" r="112" fill="#0284C7" fill-opacity="0.16" stroke="#38BDF8" stroke-width="4" stroke-dasharray="10 6"/>
        <!-- 螺旋桨三叶翼 -->
        <path d="M256,256 C230,176 282,176 256,122 C292,168 292,216 256,256 Z" fill="${amber}" stroke="#FEF08A" stroke-width="3"/>
        <path d="M256,256 C328,286 308,332 368,328 C316,348 276,316 256,256 Z" fill="${amber}" stroke="#FEF08A" stroke-width="3"/>
        <path d="M256,256 C196,312 164,268 144,324 C188,336 228,308 256,256 Z" fill="${amber}" stroke="#FEF08A" stroke-width="3"/>
        <!-- 交叉重型扳手 -->
        <line x1="156" y1="356" x2="356" y2="156" stroke="#E2E8F0" stroke-width="22" stroke-linecap="round"/>
        <circle cx="356" cy="156" r="28" fill="none" stroke="#E2E8F0" stroke-width="12"/>
        <circle cx="256" cy="256" r="24" fill="#0284C7" stroke="#BAE6FD" stroke-width="4"/>
      </g>`;

    case "hud_ais_radar": // AIS 船舶雷达与VHF
      return `
      <g>
        <circle cx="256" cy="256" r="126" fill="#10B981" fill-opacity="0.18" stroke="#10B981" stroke-width="6"/>
        <circle cx="256" cy="256" r="86" fill="none" stroke="#34D399" stroke-width="3" stroke-dasharray="8 6"/>
        <circle cx="256" cy="256" r="44" fill="none" stroke="#34D399" stroke-width="3"/>
        <line x1="130" y1="256" x2="382" y2="256" stroke="#10B981" stroke-width="2.5"/>
        <line x1="256" y1="130" x2="256" y2="382" stroke="#10B981" stroke-width="2.5"/>
        <!-- 雷达扫描扇面 -->
        <path d="M256,256 L346,166 A126,126 0 0,1 382,256 Z" fill="#34D399" fill-opacity="0.45"/>
        <line x1="256" y1="256" x2="346" y2="166" stroke="#6EE7B7" stroke-width="5"/>
        <!-- AIS 船标光点 -->
        <polygon points="312,208 326,232 298,232" fill="${amber}" stroke="#FEF08A" stroke-width="2"/>
        <polygon points="196,296 210,320 182,320" fill="${cyan}" stroke="#E0F2FE" stroke-width="2"/>
        <circle cx="256" cy="256" r="10" fill="#ECFDF5"/>
      </g>`;

    case "hud_journal": // 航海日志与海事档案
      return `
      <g>
        <rect x="144" y="112" width="224" height="288" rx="22" fill="#0369A1" stroke="${cyan}" stroke-width="6"/>
        <rect x="164" y="112" width="26" height="288" fill="#0284C7" stroke="#38BDF8" stroke-width="3"/>
        <!-- 封面黄金罗盘徽章 -->
        <circle cx="276" cy="236" r="56" fill="#075985" stroke="${amber}" stroke-width="5"/>
        <polygon points="276,184 290,222 328,236 290,250 276,288 262,250 224,236 262,222" fill="${amber}" stroke="#FEF3C7" stroke-width="2"/>
        <line x1="224" y1="328" x2="328" y2="328" stroke="#67E8F9" stroke-width="6" stroke-linecap="round"/>
        <line x1="244" y1="354" x2="308" y2="354" stroke="#BAE6FD" stroke-width="4" stroke-linecap="round"/>
      </g>`;

    case "hud_credits": // 海事信用金币 (CR)
      return `
      <g>
        <ellipse cx="236" cy="316" rx="92" ry="38" fill="#92400E" stroke="#FDE68A" stroke-width="4"/>
        <ellipse cx="236" cy="282" rx="92" ry="38" fill="#B45309" stroke="#FDE68A" stroke-width="4"/>
        <circle cx="268" cy="228" r="96" fill="url(#amberGrad_${iconId})" stroke="#FEF08A" stroke-width="6"/>
        <circle cx="268" cy="228" r="74" fill="#B45309" stroke="#FDE68A" stroke-width="3" stroke-dasharray="10 6"/>
        <text x="268" y="250" text-anchor="middle" fill="#FEF9C3" font-family="monospace" font-weight="bold" font-size="64">CR</text>
      </g>`;

    case "hud_xp_badge": // 航海资历勋章 (SXP)
      return `
      <g>
        <polygon points="216,104 296,104 282,196 230,196" fill="#0284C7" stroke="#BAE6FD" stroke-width="4"/>
        <polygon points="256,148 286,216 360,224 304,274 320,348 256,310 192,348 208,274 152,224 226,216" fill="#10B981" stroke="#A7F3D0" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="256" cy="258" r="42" fill="#059669" stroke="#FEF08A" stroke-width="4"/>
        <text x="256" y="270" text-anchor="middle" fill="#ECFDF5" font-family="monospace" font-weight="bold" font-size="32">XP</text>
      </g>`;

    case "hud_license": // 航运特许资质徽章
      return `
      <g>
        <polygon points="256,96 384,148 360,296 256,408 152,296 128,148" fill="#0284C7" fill-opacity="0.45" stroke="${amber}" stroke-width="6"/>
        <polygon points="256,122 356,164 336,282 256,374 176,282 156,164" fill="#0369A1" fill-opacity="0.65" stroke="${cyan}" stroke-width="4"/>
        <!-- 四道船长金杠与星章 -->
        <polygon points="256,154 270,186 304,190 278,212 286,246 256,228 226,246 234,212 208,190 242,186" fill="${amber}" stroke="#FEF9C3" stroke-width="2.5"/>
        <rect x="196" y="268" width="120" height="12" rx="4" fill="#FBBF24"/>
        <rect x="206" y="290" width="100" height="12" rx="4" fill="#FBBF24"/>
        <rect x="218" y="312" width="76" height="12" rx="4" fill="#38BDF8"/>
      </g>`;

    case "hud_map_globe": // 电子海图图层切换
      return `
      <g>
        <circle cx="256" cy="256" r="118" fill="#0284C7" fill-opacity="0.22" stroke="${cyan}" stroke-width="6"/>
        <ellipse cx="256" cy="256" rx="58" ry="118" fill="none" stroke="#38BDF8" stroke-width="3.5"/>
        <ellipse cx="256" cy="256" rx="118" ry="48" fill="none" stroke="#38BDF8" stroke-width="3.5"/>
        <line x1="138" y1="256" x2="374" y2="256" stroke="#67E8F9" stroke-width="3"/>
        <line x1="256" y1="138" x2="256" y2="374" stroke="#67E8F9" stroke-width="3"/>
        <!-- 卫星轨道环 -->
        <ellipse cx="256" cy="256" rx="146" ry="44" fill="none" stroke="${amber}" stroke-width="4" stroke-dasharray="10 6" transform="rotate(-28 256 256)"/>
        <circle cx="372" cy="194" r="12" fill="#FEF08A" stroke="${amber}" stroke-width="3"/>
      </g>`;

    case "hud_waves": // 有效波高与涌浪监测
      return `
      <g>
        <circle cx="256" cy="256" r="118" fill="#0284C7" fill-opacity="0.18" stroke="${cyan}" stroke-width="5"/>
        <path d="M142,238 Q196,178 256,238 T370,238" fill="none" stroke="#67E8F9" stroke-width="12" stroke-linecap="round"/>
        <path d="M142,292 Q196,232 256,292 T370,292" fill="none" stroke="#0EA5E9" stroke-width="12" stroke-linecap="round"/>
        <path d="M164,342 Q210,298 256,342 T348,342" fill="none" stroke="${amber}" stroke-width="8" stroke-linecap="round"/>
        <line x1="256" y1="146" x2="256" y2="216" stroke="#FDE68A" stroke-width="4" stroke-dasharray="6 4"/>
      </g>`;

    case "hud_depth_anchor": // 水深测深与重型海锚
      return `
      <g>
        <ellipse cx="256" cy="364" rx="108" ry="28" fill="none" stroke="#22D3EE" stroke-width="3.5" stroke-dasharray="8 6"/>
        <circle cx="256" cy="144" r="24" fill="none" stroke="${amber}" stroke-width="10"/>
        <line x1="256" y1="168" x2="256" y2="348" stroke="#E2E8F0" stroke-width="14" stroke-linecap="round"/>
        <line x1="192" y1="212" x2="320" y2="212" stroke="${cyan}" stroke-width="12" stroke-linecap="round"/>
        <path d="M162,276 A98,98 0 0,0 350,276" fill="none" stroke="#CBD5E1" stroke-width="14" stroke-linecap="round"/>
        <polygon points="154,262 184,282 152,296" fill="${amber}"/>
        <polygon points="358,262 328,282 360,296" fill="${amber}"/>
      </g>`;

    case "hud_ship_marker": // 电子海图本船战术船标
      return `
      <g>
        <circle cx="256" cy="256" r="122" fill="#0284C7" fill-opacity="0.22" stroke="${cyan}" stroke-width="5" stroke-dasharray="12 8"/>
        <line x1="256" y1="256" x2="256" y2="76" stroke="#67E8F9" stroke-width="8" stroke-dasharray="10 6"/>
        <polygon points="256,104 344,358 256,306 168,358" fill="${cyan}" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
        <circle cx="256" cy="256" r="20" fill="#FFFFFF" stroke="#0284C7" stroke-width="5"/>
      </g>`;

    case "hud_ais_marker": // 电子海图AIS目标船标
      return `
      <g>
        <circle cx="256" cy="256" r="118" fill="#D97706" fill-opacity="0.22" stroke="${amber}" stroke-width="5" stroke-dasharray="10 6"/>
        <line x1="256" y1="256" x2="256" y2="84" stroke="#FDE68A" stroke-width="7" stroke-dasharray="8 6"/>
        <polygon points="256,112 338,352 256,304 174,352" fill="${amber}" stroke="#FEF9C3" stroke-width="7" stroke-linejoin="round"/>
        <circle cx="256" cy="256" r="18" fill="#FEF08A" stroke="#B45309" stroke-width="4"/>
      </g>`;

    default:
      return `
      <g>
        <circle cx="256" cy="256" r="118" fill="#0284C7" fill-opacity="0.2" stroke="${cyan}" stroke-width="6"/>
        <circle cx="256" cy="256" r="88" fill="none" stroke="${amber}" stroke-width="4" stroke-dasharray="12 8"/>
        <polygon points="256,152 280,256 256,360 232,256" fill="${amber}" stroke="#FEF3C7" stroke-width="2"/>
        <circle cx="256" cy="256" r="16" fill="#E0F2FE"/>
      </g>`;
  }
}
