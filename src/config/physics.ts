import { EngineTelegraph } from "../types";

export interface TelegraphConfig {
  powerRatio: number;
  speedRatio: number;
}

export const TELEGRAPH_SETTINGS: Record<EngineTelegraph, TelegraphConfig> = {
  STOP: { powerRatio: 0.0, speedRatio: 0.0 },
  SLOW: { powerRatio: 0.25, speedRatio: 0.630 },
  HALF: { powerRatio: 0.50, speedRatio: 0.794 },
  ECO:  { powerRatio: 0.75, speedRatio: 0.909 },
  FULL: { powerRatio: 1.00, speedRatio: 1.000 },
  FLANK:{ powerRatio: 1.15, speedRatio: 1.047 },
};

export const PHYSICS_CONSTANTS = {
  // 海水与燃油密度
  SEAWATER_DENSITY_T_M3: 1.025,
  DIESEL_DENSITY_T_M3: 0.850,
  
  // 地球与导航转换
  EARTH_RADIUS_METERS: 6371000,
  METERS_PER_NAUTICAL_MILE: 1852,
  
  // 帆船极坐标 Polar Curve 效率分段插值节点
  SAIL_POLAR_CURVE: [
    { awaDeg: 0, efficiency: 0.0 },     // 死区 (No-Go)
    { awaDeg: 35, efficiency: 0.0 },    // 死区边缘
    { awaDeg: 45, efficiency: 0.65 },   // 迎风航行 Close-hauled
    { awaDeg: 90, efficiency: 1.00 },   // 横风航行 Beam Reach
    { awaDeg: 135, efficiency: 1.15 },  // 侧顺风 Broad Reach (最佳)
    { awaDeg: 180, efficiency: 0.85 },  // 正顺风 Running
  ],

  // 风阻与横漂 Leeway
  LEEWAY_MAX_DEG: 15.0, // 最大风压横漂角
  
  // 波浪失速与耐久磨损常数
  WAVE_SPEED_LOSS_COEFF: 0.08, // 超出阈值每米浪高衰减 8%
  WAVE_HULL_DAMAGE_RATE: 25.0, // 超出阈值每米浪高每小时损伤 HP
  WAVE_CARGO_DAMAGE_RATE: 0.02, // 超出阈值每米浪高每小时货物完好度损耗 2%

  // 基础仿真时间步长 (秒)
  PHYSICS_STEP_SECONDS: 1.0,
};
