import { Tier, PropulsionType } from "../../types";

export function generateVesselSvg(tier: Tier, propulsion: PropulsionType, isDark: boolean = true): string {
  const strokeColor = isDark ? "#35C6D8" : "#0D1F2D";
  const fillColor = isDark ? "rgba(53, 198, 216, 0.15)" : "rgba(13, 31, 45, 0.1)";

  if (propulsion === "Sail") {
    // 帆船双桅/单桅船型剪影
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
        <!-- 船体 Hull -->
        <path d="M50 10 C58 40 68 85 64 105 C60 114 40 114 36 105 C32 85 42 40 50 10 Z" 
              fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
        <!-- 龙骨中轴线 -->
        <line x1="50" y1="18" x2="50" y2="102" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,3"/>
        <!-- 主桅横桁与白帆主翼 -->
        <path d="M50 45 Q75 52 70 70 Q50 62 50 45 Z" fill="rgba(255,255,255,0.7)" stroke="#EAF4FA" stroke-width="1.2"/>
        <path d="M50 45 Q25 52 30 70 Q50 62 50 45 Z" fill="rgba(255,255,255,0.5)" stroke="#EAF4FA" stroke-width="1.2"/>
        <!-- 前三角帆 -->
        <path d="M50 15 Q62 25 50 42 Z" fill="rgba(255,255,255,0.8)" stroke="#EAF4FA" stroke-width="1"/>
      </svg>
    `;
  }

  // 现代动力货轮 / 科考船 / 破冰船 剪影
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100%" height="100%">
      <!-- 现代化深水船体 -->
      <path d="M50 8 C62 30 70 75 66 108 C64 115 36 115 34 108 C30 75 38 30 50 8 Z" 
            fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- 上层建筑舰桥 Bridge Cockpit -->
      <rect x="40" y="70" width="20" height="18" rx="2" fill="rgba(53, 198, 216, 0.4)" stroke="${strokeColor}" stroke-width="1.5"/>
      <!-- 集装箱堆叠/甲板分区槽位 -->
      <rect x="42" y="32" width="16" height="30" rx="1" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2,2"/>
      <!-- 船艏球鼻艏指示 -->
      <circle cx="50" cy="12" r="3" fill="${strokeColor}"/>
    </svg>
  `;
}
