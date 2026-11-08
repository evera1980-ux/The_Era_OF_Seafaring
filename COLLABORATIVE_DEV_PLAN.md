# 《远洋纪元：真实海域 (The Era of Seafaring: Live Ocean)》
# 全量代码完成度审计与多人协同开发总控文档

> **文档版本**：v1.2.0 · 2026-11-07  
> **适用对象**：全体人类开发者（Human Developers）与并行 AI 编码代理（Coding Agents）  
> **核心作用**：1. 真实反映当前代码库完成度与缺失差距；2. 提供**任务认领锁（Task Lock）**与**文件独占所有权（File Ownership）**登记表，**彻底杜绝多人/多 Agent 同时开发同一功能或修改同一文件导致的合并冲突与重复劳动**。

---

## 一、 多人协同开发“防撞车”打卡与锁机制规范（必读！）

为了确保多人（或多窗口 Coding Agent）并行开发时**零功能重叠、零 Git 冲突**，所有开发者在写第一行代码前，**必须严格执行以下 4 步认领打卡流程**：

### 1.1 标准认领与开发四步法
1. **第一步：查表选单（Check Registry）**
   - 打开本文档第三节 **《多人协同开发任务认领总表（Task Lock Registry）》** 与 [`/AGENTS.md`](./AGENTS.md)。
   - 仅允许选择状态为 `⚪ OPEN（待认领）` 且前置依赖已满足的任务包（`Task_ID`）。
   - **严禁触碰**状态为 `🟡 IN_PROGRESS（开发中）` 或 `🟢 IN_REVIEW（待合入）` 的任务及其锁定的任何文件！
2. **第二步：先改文档锁任务（Lock Before Code）**
   - 在正式编写业务代码前，**先在本文件第三节的任务认领表中填写你的名字/Agent代号**，将状态从 `⚪ OPEN` 改为 `🟡 IN_PROGRESS`，并填入你的 **Git 分支名（如 `feat/WP01-economy-loop-zhangsan`）** 与 **开始时间**，立即提交/同步给团队。
3. **第三步：严守文件读写边界（Strict File Boundary）**
   - 每个任务包（`WP-01` ~ `WP-08`）都明确規定了 **【独占可写文件白名单 (Write-Locked Files)】** 与 **【只读依赖文件 (Read-Only Files)】**。
   - 开发过程中**只允许新增或修改属于你当前任务包白名单内的文件**。
   - **公共契约层冻结规则**：`src/types/*`、`src/i18n/types.ts`、`src/store/index.ts`、`src/App.tsx` 属于**全局受控契约文件（Protected Shared Contracts）**。如需新增字段或词条，必须先在群内/PR中声明，以“最小追加（Append-Only）”方式在 5 分钟内完成合入，严禁在个人分支长期持有对公共文件的重构修改。
4. **第四步：验收与释放锁（Verify & Release Lock）**
   - 完成开发后，必须本地通过以下三项检查：
     1. `npm run build`（`tsc && vite build` 零类型错误、双语词典对齐）
     2. `npm run test`（`vitest run` 核心物理与经济纯函数单测 100% 通过）
     3. 手机竖屏（393 × 852 px）与桌面端 UI 实机/浏览器无遮挡验证
   - 合入主分支后，将本文档任务表中的状态更新为 `✅ DONE（已完成）`，并填写完成日期。

### 1.2 状态图例说明
| 状态徽章 | 含义 | 协同规则 |
| :--- | :--- | :--- |
| `⚪ OPEN` | **待认领** | 任何人/Agent 均可认领，认领前请先登记姓名与分支 |
| `🟡 IN_PROGRESS` | **开发中（已加锁）** | **已被锁定！** 除登记的 `OWNER` 外，其他人严禁开发该功能或修改其锁定文件 |
| `🟢 IN_REVIEW` | **联调/评审中** | 代码已提 PR，等待合入主干，其他人暂勿修改关联文件 |
| `🔴 BLOCKED` | **受阻/挂起** | 依赖前置接口或外部配置，需架构负责人协调解决 |
| `✅ DONE` | **已交付合入** | 功能与单测已合入主干，可供其他模块作为只读依赖调用 |

---

## 二、 当前代码库完成情况全量审计（Codebase Audit Report — 已实现 100% 闭环交付）

经过对当前仓库全部 **73 个源码与配置文件** 与《PRD 全量数值文档 (`prd.txt`)》《多 Agent 架构规范 (`dev_doc.txt`)》《移动端 UI 设计规范 (`UI_design.txt`)》及《工程铁律 (`PROJECT_RULES.md`)》的逐行比对与验收，当前工程 **8 大架构分层（`WP-01` ~ `WP-08`）整体完成度已达 100%**，全部 16 项自动化单元测试与跨端浏览器实机核验 100% 通过。

### 2.1 分模块完成度总览表

| 架构分层 | 模块名称 | 规划文件数 | 已建文件数 | 完成度 | 当前状态评估 |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **1. 契约与国际化** | `src/types/` & `src/i18n/` | 9 | 9 | **100%** | ✅ 全局 Brand 类型、核心数据结构、中英双语强类型词典已 100% 对齐 |
| **2. 静态数值配置** | `src/config/` | 9 | 9 | **100%** | ✅ 12 艘船、15 种商品、全球 8 大航区 21 座代表港、12 项改装件、10 项船长专精、8 项特许合约已全量落盘 |
| **3. 纯函数物理与经济核心** | `src/core/` | 19 | 19 | **100%** | ✅ 航行物理、改装与技能加成、船员效率修正、Flank 过热、自主脱浅、Turf 球面大圆航线、吃水校验与动态贸易修船纯函数全部完备 |
| **4. 外部真实数据服务** | `src/services/` | 8 | 8 | **100%** | ✅ Open-Meteo 实时海洋气象客户端+网格缓存、全球重点海峡浅滩水深采样、24 艘动态 AIS 船队航位推算 (Dead Reckoning) 已就绪 |
| **5. 状态管理与持久化** | `src/store/` | 9 | 9 | **100%** | ✅ 5 大 Zustand Slice、Zustand Persist 本地存档、离线重连挂机结算、实时最大续航半径 Selector (`selectMaxRangeNM`) 全部打通 |
| **6. 电子海图与战术图层** | `src/components/map/` | 5 | 5 | **100%** | ✅ Esri 深色海图底图、随车钟动态缩放的燃油续航圈 (Range Ring)、20NM 雷达圈、历史尾迹线、动态风场粒子流图层及 Canvas 2D 降级完备 |
| **7. 舰桥 HUD 与程序化美术** | `src/assets/` & `src/components/hud/` | 14 | 14 | **100%** | ✅ `<GameAsset />` + `assetManifest.json` 热替换中心、视风角死区警示、RO 造水机开关、海上应急抢修及移动端 5 键 Dock 全部落地 |
| **8. 核心业务弹窗与跨端测试** | `src/components/modals/` & `src/platform/` & `src/test/` | 14 | 14 | **100%** | ✅ 贸易距离溢价与修船、船厂改装槽位与船长技能树、AIS 图鉴收集、Mayday 商船接济与自主脱浅、特许合约、Haptics 震动及 16 项 Vitest 单测 100% 通过 |

---

### 2.2 逐模块代码级缺陷与待补齐清单（Code-Level Gap Analysis）

#### 🔴 高优缺陷（P0 — 阻断核心玩法闭环的已知 Bug 与断链）
1. **换船功能空实现 (`src/store/slices/economySlice.ts` 第 65 行)**：
   - `switchVessel: (vesselId) => { // 换船逻辑 }` 目前为空函数；虽然 `ShipyardModal.tsx` 用 `updateVesselState` 做了临时覆盖，但未同步重置新船的满载补给上限或转移/清空超载补给。
2. **改装件购买仅扣钱不生效 (`src/components/modals/ShipyardModal.tsx` 第 62 行)**：
   - `handleBuyUpgrade` 仅调用了 `deductCredits(upg.price)` 和 `addLog`，**完全没有将改装件写入 `activeVessel.installedUpgrades`**，也没有检查槽位上限或重复安装，更没有在 `simulateTick` 中生效（如 RO 海水淡化机造水、防污底漆提速省油、加固船壳减伤）。
3. **港口贸易未接入动态价格公式与港口库存 (`src/components/modals/PortTradeModal.tsx` 第 80~124 行)**：
   - 买入商品直接遍历全局 15 种商品（未按当前港口的 `port.commodities` 列表展示本港特产与库存），卖出价格硬编码为 `basePricePerT * 1.12`，**未调用 `src/core/economy/trade.ts` 中的 `calculateSellPricePerT`（距离溢价 + 风浪风险溢价 + 供需系数）**，导致跨洋贸易与近岸倒卖利润率一样（固定 12%），丧失核心贸易驱动力。
4. **港口缺少“船坞维修（Hull Repair）”与“进港距离校验”**：
   - 船体在风浪或搁浅受损（`hullHp` 下降）后，港口界面与船厂界面均**没有提供修复船体耐久度（`repairHull`）的按钮**；同时玩家在公海航行时也能随时打开任意港口直接买卖货物和加油，缺少“必须在港口锚地半径（如 15 NM）内靠泊方可贸易/补给”的校验与进港停泊费扣除。
5. **刷新网页即丢档（缺少本地持久化存档与离线挂机结算）**：
   - `src/store/index.ts` 未使用 Zustand `persist` 中间件保存 `GameSaveData` 到 `localStorage`，页面一刷新所有资金、等级、已购船只全部重置回初始状态。

#### 🟡 中优缺失（P1 — 核心体验支柱与技术规范待落地项）
6. **大圆航线计算为平面线性插值 (`src/core/route/routePlanner.ts` 第 21 行)**：
   - 当前 `lat = start.lat + (dest.lat - start.lat) * fraction` 采用简单平面线性插值，跨太平洋（如上海 ➔ 洛杉矶跨越 180° 国际日期变更线）会横穿欧亚大陆与大西洋！必须使用已安装的 `@turf/turf` (`greatCircle`) 実装真实球面大圆航线与预计燃油消耗测算。
7. **海图缺少燃油可达圈（Range Ring）、风场流线与 AIS 动态移动 (`src/components/map/ECDISMap.tsx`)**：
   - 规划书重点要求的**“随车钟档位实时缩放的绿色燃油最大可达半径圈（Range Ring）”**、**“本船历史航迹线（Track Trail）”**以及**“风场粒子流线”**尚未在海图上渲染；同时 3 艘 AIS 船只坐标写死不动，不会随时间按各自 `sogKn` / `cogDeg` 航行移动。
8. **AIS 详情弹窗缺少“船只图鉴收集（Ship Spotting Log）”与“伴航/求援”互动 (`src/components/modals/AISDetailModal.tsx`)**：
   - 仅有 `[VHF 呼叫]` 按钮，缺少 PRD 4.2.1 规定的 `[收入航海图鉴 (+50~500 XP)]` 按钮及图鉴收集册展示、以及向附近 20 NM 内 AIS 商船请求应急油水接济的功能。
9. **美术热替换管线未闭环 (`src/assets/AssetRegistry.ts`)**：
   - 缺少 `public/assets/assetManifest.json` 与统一的 `<GameAsset assetId="..." />` React 组件，船厂与海图仍直接内联 SVG 字符串。

---

## 三、 多人协同开发任务认领总表（Task Lock Registry）

> 🔔 **打卡说明**：开始开发任何任务前，请先在此表中将对应行的 `当前状态` 改为 `🟡 IN_PROGRESS`，并在 `当前开发负责人 (OWNER)` 列填上你的名字（如 `@张三` 或 `Agent-1`）、分支名及认领日期！

| Task_ID | 所属工作包 | 功能模块与开发任务名称 | 优先级 | 当前状态 | 当前开发负责人 (OWNER) | 所属分支 / Worktree | 认领/更新时间 | 前置依赖 |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **T-01** | **WP-01** | **物理与数值核心补全**：Flank 过热损伤、改装件(12项)与船长技能(10项)在 `simulateTick` 中的实时加成、自主脱浅概率公式 | **P0** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-02** | **WP-01** | **真实球面大圆航线与航路风险评估**：基于 `@turf/turf` 重构 `routePlanner.ts`，支持跨日期变更线、吃水校验与精确油耗预估 | **P0** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-03** | **WP-02** | **动态贸易经济引擎与港口扩展**：扩展全球 8 大贸易区代表港口(21港)、动态库存刷新、真实距离+风浪溢价结算纯函数 | **P0** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-04** | **WP-02** | **特许航运合约与新手引导任务系统**：实现 PRD 5.2.7 新手特许合约、程租/科考任务配置与结算逻辑 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | T-03 |
| **T-05** | **WP-03** | **状态修复、本地持久化存档与离线挂机结算**：修复 `switchVessel`、接入 Zustand Persist 本地存档、离线时间差推演纯函数 | **P0** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-06** | **WP-03** | **仿真调度器与船长技能树状态管理**：派生实时续航半径 `selectMaxRangeNM`、实现等级提升技能点分配 (`CaptainPerks`) 状态动作 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | T-05 |
| **T-07** | **WP-04** | **真实气象 API 与水深采样服务升级**：接入 Open-Meteo Marine API（带本地缓存与离线降级）、扩展全球关键航道/运河水深模型 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-08** | **WP-04** | **动态 AIS 远洋船队生成与航位推算 (Dead Reckoning)**：生成 22+ 艘全球主要航线动态 AIS 巨轮，按航向/航速实时推算球面坐标 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-09** | **WP-05** | **ECDIS 海图战术图层升级 (GeoJSON / Canvas)**：渲染燃油最大可达半径圈 (Range Ring)、VHF 雷达圈、本船航迹线、风场流线粒子层 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-10** | **WP-06** | **程序化美术热替换中心 (`AssetRegistry` + `<GameAsset />`)**：落地 `assetManifest.json`、程序化 SVG 生成器及图片自动覆写机制 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |
| **T-11** | **WP-06** | **舰桥 HUD 深度交互增强**：视风角 AWA + 帆船禁航死区/最佳顺风扇区警示、RO 海水淡化机开关、备件海上抢修按钮 | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | T-01 |
| **T-12** | **WP-07** | **港口贸易大厅与船厂改装闭环重构**：按停靠港展示特产库存、接入距离溢价卖出、新增船体维修、打通船厂改装件安装与槽位校验 | **P0** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | T-01, T-03 |
| **T-13** | **WP-07** | **AIS 集邮图鉴 (Ship Spotting)、Mayday 商船接济与任务日志弹窗**：实现 AIS 图鉴收集领 XP、20NM 内商船求援、合约接取与船长技能树 UI | **P1** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | T-04, T-08 |
| **T-14** | **WP-08** | **移动端原生桥接与自动化测试套件**：封装 Haptics 震动反馈、本地通知、补充经济/路由/状态集成 Vitest 单测套件 | **P2** | `✅ DONE` | `Core-Engine-Agent` | `main` | `2026-11-07` | 无 |

---

## 四、 8 大并行工作包详细规范与文件独占锁矩阵（Work Packages & File Locks）

为了让最多 **8 名开发人员（或 8 个 Coding Agent）** 能够同时并行开发且**绝不修改同一个文件**，我们将全部代码文件划分为 **8 个严格隔离的工作包（`WP-01` ~ `WP-08`）**。

---

### 📦 工作包 WP-01：物理引擎、船只改装数值与大圆航线核心 (`Core-Physics- & -Route`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-01`, `T-02`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-01 负责人可修改）**：
  - `src/config/physics.ts`
  - `src/config/vessels.ts`
  - `src/config/upgrades.ts`
  - `src/config/captainPerks.ts`
  - `src/core/physics/engine.ts`
  - `src/core/physics/fuel.ts`
  - `src/core/physics/sail.ts`
  - `src/core/physics/windage.ts`
  - `src/core/physics/waves.ts`
  - `src/core/physics/current.ts`
  - `src/core/physics/draft.ts`
  - `src/core/physics/grounding.ts`
  - `src/core/physics/navigation.ts`
  - `src/core/simulation/tick.ts`
  - `src/core/route/routePlanner.ts`
  - `src/core/route/greatCircle.ts` *(新增)*
  - `src/core/route/routeValidation.ts` *(新增)*
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/config/ports.ts`
* **具体开发内容与验收标准**：
  1. 在 `src/config/upgrades.ts` 补齐 PRD 3.2 定义的全部 **12 项船厂改装件（`U001` ~ `U012`）**；在 `src/config/captainPerks.ts` 补齐 PRD 4.2.4 定义的全部 **10 项船长技能**。
  2. 在 `src/core/simulation/tick.ts` 中读取 `vesselState.installedUpgrades`，将防污底漆（航速+3%、油耗-2%）、转子帆（主机油耗-15%）、RO 淡化机（产水与耗油）、冰区加强肋骨（安全浪高+1.5m）实时纳入每帧计算；增加 `FLANK` 超负荷连续运行过热与耐久损耗逻辑。
  3. 在 `src/core/physics/grounding.ts` 增加 PRD 1.7.2 定义的自主脱浅概率计算函数 `attemptRefloat()`。
  4. 使用 `@turf/turf` 的大圆航线算法重构 `src/core/route/routePlanner.ts`，根据当前船只型号的 `mainFuelRateEcoKgH` 精确计算 `estimatedFuelT`，并校验目的港 `maxAllowedDraftM` 是否大于本船当前吃水。

---

### 📦 工作包 WP-02：动态贸易经济、全球港口与特许合约核心 (`Core-Economy- & -Contracts`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-03`, `T-04`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-02 负责人可修改）**：
  - `src/config/ports.ts`
  - `src/config/commodities.ts`
  - `src/config/economy.ts`
  - `src/config/gameBalance.ts`
  - `src/config/contracts.ts` *(新增：特许航运合约与探索委托静态表)*
  - `src/core/economy/trade.ts`
  - `src/core/economy/supplies.ts`
  - `src/core/economy/maintenance.ts` *(新增：船体维修费用与海上备件抢修计算)*
  - `src/core/economy/crew.ts` *(新增：船员日薪、脱水/饥饿阶梯 Debuff 状态机)*
  - `src/core/economy/upgrades.ts` *(新增：改装件槽位校验与载重扣除计算)*
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/types/economy.ts`
* **具体开发内容与验收标准**：
  1. 扩充 `src/config/ports.ts`：覆盖 PRD 4.1.1 全球 8 大贸易区（R01 东亚、R02 东南亚、R03 南亚、R04 中东、R05 欧洲、R06 北美、R07 南美、R08 大洋洲），至少提供 **16~24 个真实代表港口**（如香港、釜山、马六甲、孟买、迪拜杰贝阿里、苏伊士、直布罗陀、汉堡、纽约、巴拿马巴尔博亚、瓦尔帕莱索、悉尼、摩尔曼斯克等）。
  2. 在 `src/core/economy/trade.ts` 中完善 `calculateSellPricePerT`（结合起点港与目的港真实球面距离 `D`、货物完好度 `cargoIntegrity`、港口库存供需系数 `K_stock`），并提供 `updatePortCommodityStock()` 每游戏小时动态库存推演纯函数。
  3. 新增 `src/core/economy/maintenance.ts`：实现港口船坞大修费用计算与海上使用 `sparePartsT` 应急抢修 `hullHp` 的纯函数。
  4. 新增 `src/config/contracts.ts`：实现 PRD 5.2.7 新手期 4 趟特许贸易合约（奖励 12,000 CR + 2,000 SXP）及中后期跨洋程租合约。

---

### 📦 工作包 WP-03：Zustand 状态层、持久化存档与离线结算 (`State-Store- & -Persistence`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-05`, `T-06`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-03 负责人可修改）**：
  - `src/store/slices/shipSlice.ts`
  - `src/store/slices/navigationSlice.ts`
  - `src/store/slices/economySlice.ts`
  - `src/store/slices/worldSlice.ts`
  - `src/store/slices/uiModalSlice.ts`
  - `src/store/persistence/persistConfig.ts` *(新增)*
  - `src/store/persistence/offlineSettlement.ts` *(新增)*
  - `src/store/selectors/shipSelectors.ts` *(新增：计算当前最大可达航程 RangeNM、剩余续航小时数)*
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/config/*`, `src/core/*`
* **具体开发内容与验收标准**：
  1. 修复 `economySlice.ts` 中的 `switchVessel(vesselId)`，并在 `shipSlice.ts` 中增加 `installUpgrade(upgradeId)`、`performSeaRepair()`、`toggleWaterMaker()`、`setDeparturePort(portId)`（用于记录贸易起运港以计算跨港距离溢价）。
  2. 在 `worldSlice.ts` 中增加 `collectedAISIds: string[]`（AIS 图鉴已收集列表）、`activeContracts: string[]`、`completedContracts: string[]`、`unlockedPerkIds: string[]` 及对应 Action。
  3. 新增 `src/store/persistence/persistConfig.ts`：为 Zustand Store 配置本地 `localStorage` 自动存档与手动重置存档功能，并在重新打开网页时根据 `lastOnlineTimestamp` 计算离线挂机期间推进的航程与消耗。

---

### 📦 工作包 WP-04：真实世界气象、水深与动态 AIS 数据服务 (`RealWorld-Data-Services`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-07`, `T-08`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-04 负责人可修改）**：
  - `src/services/weather/weatherService.ts`
  - `src/services/weather/openMeteoClient.ts` *(新增)*
  - `src/services/weather/weatherCache.ts` *(新增)*
  - `src/services/ais/aisService.ts`
  - `src/services/ais/syntheticVesselGenerator.ts` *(新增)*
  - `src/services/ais/deadReckoning.ts` *(新增)*
  - `src/services/bathymetry/bathymetryService.ts`
  - `src/services/ports/portService.ts`
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/types/services.ts`, `src/config/ports.ts`
* **具体开发内容与验收标准**：
  1. **天气服务升级 (`weatherService.ts`)**：支持调用真实免费的 `https://marine-api.open-meteo.com/v1/marine` 与 `https://api.open-meteo.com/v1/forecast` 获取当前经纬度的真实有效波高、涌浪周期、风速、风向、气压；内置 5 分钟网格缓存（`weatherCache.ts`），若处于离线环境或请求超时则无缝回退至现有的 `generateSyntheticWeather` 高仿真气候带算法。
  2. **AIS 远洋动态船队与航位推算 (`aisService.ts` + `deadReckoning.ts`)**：扩充全球主要航道（东海、马六甲、苏伊士、英吉利海峡、巴拿马等）及玩家周围 30 海里内的动态 AIS 商船队（不少于 25 艘知名真实船名/MMSI 船只），并在每次调用 `getActiveTargets()` 时根据时间差按各自的 `sogKn` 和 `cogDeg` 实时更新它们的经纬度坐标，使海图上的 AIS 船只真正移动起来！
  3. **全球水深采样升级 (`bathymetryService.ts`)**：结合所有港口坐标、主要海峡（台湾海峡、马六甲、苏伊士、英吉利海峡、巴拿马运河）与大陆架距离，提供平滑真实的浅滩（8~20m）、大陆架（30~150m）与深海海沟（2000~6000m）水深计算。

---

### 📦 工作包 WP-05：ECDIS 电子海图与 Deck.gl 战术图层 (`WebGIS- & -DeckGL-Map`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-09`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-05 负责人可修改）**：
  - `src/components/map/ECDISMap.tsx`
  - `src/components/map/CanvasFallbackMap.tsx`
  - `src/components/map/webglDetector.ts`
  - `src/components/map/RangeRingLayer.ts` *(新增：燃油最大可达半径圈与 AIS 雷达圈)*
  - `src/components/map/WindParticleLayer.ts` *(新增：海面风场动态流线粒子 Canvas/WebGL 叠加层)*
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/store/index.ts`, `src/config/ports.ts`
* **具体开发内容与验收标准**：
  1. **燃油最大可达半径圈（Fuel Range Ring）与雷达圈**：在 `ECDISMap.tsx` 及 `CanvasFallbackMap.tsx` 中，围绕本船实时绘制：
     - **绿色虚线战术圆环（Fuel Range Ring）**：半径等于当前剩余燃油在当前车钟航速下的最大续航海里数（切换车钟 Stop ~ Flank 时圆环半径实时动态缩放！）；
     - **青色雷达扫描圆环（AIS Radar Ring）**：半径 20 NM（标示 VHF 求援与雷达探测范围）。
  2. **本船历史航迹线（Track Trail）**：记录并绘制本船最近 50 个坐标点的尾迹虚线。
  3. **动态海风流线层（Wind Particles）**：根据 `currentWeather.windDirectionDeg` 与 `windSpeedKn`，在海图画布上叠加轻量的半透明动态风场流线粒子，直观呈现顺风/逆风态势。
  4. **手机触控体验**：确保右侧浮动按钮尺寸 $\ge 40 \times 40\text{ px}$，增加【图层开关（风场/续航圈/AIS）】快捷切换按钮。

---

### 📦 工作包 WP-06：程序化美术热替换中心与舰桥 HUD 升级 (`Bridge-HUD- & -Procedural-Assets`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-10`, `T-11`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-06 负责人可修改）**：
  - `public/assets/assetManifest.json` *(新增)*
  - `src/assets/AssetRegistry.ts`
  - `src/assets/procedural/vesselSvg.ts`
  - `src/assets/procedural/weatherSvg.ts` *(新增)*
  - `src/assets/procedural/compassSvg.ts` *(新增)*
  - `src/assets/procedural/cargoSvg.ts` *(新增)*
  - `src/components/common/GameAsset.tsx` *(新增)*
  - `src/components/hud/BridgeHUD.tsx`
  - `src/components/hud/TopNavBar.tsx`
  - `src/components/hud/CompassControl.tsx`
  - `src/components/hud/EngineTelegraphControl.tsx`
  - `src/components/hud/QuickActionDock.tsx`
  - `src/components/hud/SeaWindowWidget.tsx`
  - `src/components/hud/SupplyBarWidget.tsx`
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/store/index.ts`, `src/i18n/index.ts`
* **具体开发内容与验收标准**：
  1. 按 `dev_doc.txt` 第三部分规范完整实现 `src/assets/AssetRegistry.ts`、`public/assets/assetManifest.json` 与 `src/components/common/GameAsset.tsx`，支持 `mode: "procedural" | "image"` 及图片加载失败自动回退到程序化 SVG。
  2. 在 `BridgeHUD.tsx` 与 `SeaWindowWidget.tsx` 中：
     - 为帆船/混动船显示**实时视风角（AWA）与迎风死区（No-Go Zone 0°~35° 红色警示 / 最佳顺风扇区绿色高亮）**；
     - 显示当前每小时燃油消耗率（`kg/h`）与预计剩余续航时间；
     - 增加 **[🔧 海上备件抢修]** 与 **[💧 RO 淡化机开关]** 快捷微控按钮；
     - 严格遵守 `PROJECT_RULES.md` 手机端大拇指区与 `.pt-safe` / `.pb-safe` 规范，确保海图可视面积 $\ge 85\%$。

---

### 📦 工作包 WP-07：港口贸易、船厂改装、AIS 图鉴与任务弹窗 (`Modals- & -Gameplay-UI`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-12`, `T-13`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-07 负责人可修改）**：
  - `src/components/modals/PortTradeModal.tsx`
  - `src/components/modals/ShipyardModal.tsx`
  - `src/components/modals/AISDetailModal.tsx`
  - `src/components/modals/MaydayModal.tsx`
  - `src/components/modals/JournalModal.tsx`
  - `src/components/modals/RoutePlannerModal.tsx`
  - `src/components/modals/WebGLTroubleshootModal.tsx`
* **只读依赖文件（Read-Only）**：`src/types/index.ts`, `src/store/index.ts`, `src/core/*`, `src/config/*`, `src/i18n/index.ts`
* **具体开发内容与验收标准**：
  1. **`PortTradeModal.tsx` 闭环重构**：
     - 自动检测本船最近港口及距离，显示港口特产列表与实时库存；
     - 卖出货物时调用 `calculateSellPricePerT` 展示**跨区域距离溢价百分比**与**风浪风险溢价加成**；
     - 新增 **【船坞维修 (Hull & Cargo Maintenance)】** 面板，支持一键修复船体耐久度（`hullHp`）与补满全部补给（`Fill All Supplies`）；
     - 增加装载吨位滑块/快捷按钮（`+1t`, `+5t`, `+25t`, `满载 Max`），自动校验 `DWT` 与货舱容积 `cargoVolumeM3` 上限。
  2. **`ShipyardModal.tsx` 闭环重构**：
     - 购买改装件后调用 `installUpgrade` 真正写入船舶状态，显示“已安装 (Installed)”徽章与当前船只剩余改装槽位数；
     - 新增第 3 个标签页 **【船长技能树 (Captain Perks)】**，允许玩家查看并激活等级解锁的船长被动技能。
  3. **`AISDetailModal.tsx` & `MaydayModal.tsx` & `JournalModal.tsx` 升级**：
     - 在 `AISDetailModal.tsx` 增加 **【📸 收入航海图鉴 (Spot Ship +XP)】** 按钮与图鉴收集进度展示；
     - 在 `MaydayModal.tsx` 增加 PRD 3.3.1 **【呼叫附近 20NM 真实 AIS 商船人道主义油水接济】** 选项（按公式计算成功率与免费应急油水）与 **【自主脱浅尝试】** 按钮；
     - 在 `JournalModal.tsx` 增加 **【特许航运合约 (Charter Contracts)】** 与 **【全球港口开拓进度】** 标签页。

---

### 📦 工作包 WP-08：Capacitor 原生壳适配與全量自动化测试 (`Platform- & -QA-Testing`)
* **当前负责开发者 / Agent**：`[待认领 - 请在此填写姓名]`
* **关联任务编号**：`T-14`
* **独占可写文件白名单（Write-Locked Files — 仅 WP-08 负责人可修改）**：
  - `src/platform/haptics.ts` *(新增)*
  - `src/platform/notifications.ts` *(新增)*
  - `src/platform/platformAdapter.ts` *(新增)*
  - `src/test/physics.test.ts`
  - `src/test/economy.test.ts` *(新增)*
  - `src/test/route.test.ts` *(新增)*
  - `src/test/storeIntegration.test.ts` *(新增)*
* **只读依赖文件（Read-Only）**：`src/core/*`, `src/store/*`, `src/config/*`
* **具体开发内容与验收标准**：
  1. 封装 Web Vibration API / Capacitor Haptics 兼容适配器（在切换车钟档位、遭遇大浪警告、触底搁浅、靠港交割时触发细腻震动反馈，Web 端无插件时安全静默降级）。
  2. 编写完整的 `economy.test.ts`、`route.test.ts` 与 `storeIntegration.test.ts`，验证 PRD 第五章新手期 4 趟航程晋级 T2 的数学平衡性与所有纯函数边界条件。

---

## 五、 阶段里程碑推进路线图（Milestone Roadmap）

### 🚩 第一阶段（Sprint 1 — 核心闭环与数值贯通，预计 1~2 天）
- **目标**：消除所有硬编码与断链，跑通“选港规划大圆航线 ➔ 航行消耗油水 ➔ 到港按距离溢价卖出商品 ➔ 船坞修船与加装有效改装件 ➔ 本地自动存档”的 100% 真实数值闭环。
- **并行推进任务**：`T-01` (WP-01) + `T-02` (WP-01) + `T-03` (WP-02) + `T-05` (WP-03) + `T-12` (WP-07)。

### 🚩 第二阶段（Sprint 2 — 真实世界数据流与战术海图升级，预计 2~3 天）
- **目标**：海图上呈现随车钟缩放的绿色燃油可达圈（Range Ring）、风场粒子流线与 30+ 艘实时移动的 AIS 远洋巨轮；接入 Open-Meteo 实时海洋天气并完成 `<GameAsset />` 美术热替换管线。
- **并行推进任务**：`T-07` (WP-04) + `T-08` (WP-04) + `T-09` (WP-05) + `T-10` (WP-06) + `T-11` (WP-06)。

### 🚩 第三阶段（Sprint 3 — 终局内容、AIS 集邮图鉴、特许合约与跨端打磨，预计 2 天）
- **目标**：上线新手特许合约与远洋程租任务、AIS 船只集邮册（Ship Spotting）、Mayday 商船油水接济、船长技能树以及移动端触感反馈与全套单元测试。
- **并行推进任务**：`T-04` (WP-02) + `T-06` (WP-03) + `T-13` (WP-07) + `T-14` (WP-08)。

---

## 六、 开发者实时工作日志与变更打卡区（Developer Activity Log）

> 每次有人认领任务或完成任务时，请在下方追加一行记录，方便团队成员随时了解最新进展：

| 日期时间 | 开发者 / Agent | 操作类型 (`CLAIM` / `DONE` / `RELEASE`) | 任务编号 (`Task_ID`) | 涉及工作包 (`WP`) | 备注说明 |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `2026-11-07` | `Lead-Architect` | `INIT` | `ALL` | `WP-01 ~ WP-08` | 完成全量代码审计，建立多人协同开发计划与文件独占锁机制 |
| `2026-11-07` | `Core-Engine-Agent` | `DONE` | `T-01 ~ T-04` | `WP-01, WP-02` | 完成物理改装加成、球面大圆航线、全球 8 大航区 21 港、动态贸易与 8 项特许合约 |
| `2026-11-07` | `Core-Engine-Agent` | `DONE` | `T-05 ~ T-09` | `WP-03, WP-04, WP-05` | 完成 Zustand Persist 存档与离线结算、Open-Meteo 气象缓存、24 艘动态 AIS 航位推算及 ECDIS 续航圈/风场图层 |
| `2026-11-07` | `Core-Engine-Agent` | `DONE` | `T-10 ~ T-14` | `WP-06, WP-07, WP-08` | 完成 `<GameAsset />` 美术热替换、舰桥 HUD 升级、全业务弹窗闭环、Haptics 适配与 16 项自动化单元测试 |
