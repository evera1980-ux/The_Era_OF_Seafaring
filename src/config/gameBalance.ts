import { makeCredits } from "../types";

export const GAME_BALANCE = {
  // 新手初始配置 (PRD 5.1.1)
  INITIAL_CREDITS: makeCredits(25000),
  INITIAL_LEVEL: 1,
  INITIAL_XP: 0,
  INITIAL_VESSEL_ID: "V001", // Coastal Cutter 初始船
  INITIAL_PORT_ID: "CNSHA", // 舟山群岛开局
  
  // 离线结算上限 (最大允许离线仿真 24 游戏小时)
  MAX_OFFLINE_SIMULATION_HOURS: 24,

  // 经验值算法常量: Level XP = BASE_XP * (Level ^ XP_EXPONENT)
  BASE_XP: 1000,
  XP_EXPONENT: 1.6,

  // 航海里程 XP: 1 NM = 2.5 XP
  XP_PER_NAUTICAL_MILE: 2.5,
  // 贸易利润 XP: 100 CR 利润 = 1 XP
  XP_PER_PROFIT_CREDITS: 0.01,
};
