# AGENTS.md — 多人 / 多 Agent 文件级所有权与防冲突锁清单

> **强制铁律（Mandatory Rule for All Humans & Coding Agents）**：
> 1. 任何开发者或 AI Agent 在修改任何源码文件前，**必须先检查本文件与 [`/COLLABORATIVE_DEV_PLAN.md`](./COLLABORATIVE_DEV_PLAN.md)**。
> 2. **每个文件在同一时刻只能有一个 `OWNER`（独占写入者）**。当某个工作包（`WP-01` ~ `WP-08`）状态为 `IN_PROGRESS` 时，只有登记的 `OWNER` 可以修改该工作包名下的文件；其他开发者只能读取（`READERS`），严禁修改！
> 3. 开始开发前，请先在下表对应工作包中填入你的名字/Agent ID，并将 `STATUS` 改为 `IN_PROGRESS`。

---

## 一、 工作包认领锁状态总表（Work Package Lock Table）

| 工作包 ID | 工作包名称 | 当前状态 (`STATUS`) | 当前独占负责人 (`OWNER`) | 只读协作者 (`READERS`) | Git 分支 / Worktree |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **WP-00** | **全局公共契约与入口冻结层** (`Protected Contracts`) | `🔒 FROZEN` | `Architecture-Lead` | `ALL` | `main` (仅允许最小追加 PR) |
| **WP-01** | **物理引擎、改装数值与大圆航线** (`Core-Physics- & -Route`) | `✅ DONE` | `Core-Engine-Agent` | `WP-03, WP-06, WP-07, WP-08` | `main` |
| **WP-02** | **动态贸易经济、全球港口与合约** (`Core-Economy- & -Contracts`) | `✅ DONE` | `Core-Engine-Agent` | `WP-03, WP-04, WP-07, WP-08` | `main` |
| **WP-03** | **Zustand 状态切片与本地存档** (`State-Store- & -Persistence`) | `✅ DONE` | `Core-Engine-Agent` | `WP-05, WP-06, WP-07, WP-08` | `main` |
| **WP-04** | **真实气象、水深与动态 AIS 服务** (`RealWorld-Data-Services`) | `✅ DONE` | `Core-Engine-Agent` | `WP-03, WP-05, WP-07` | `main` |
| **WP-05** | **ECDIS 电子海图与战术图层** (`WebGIS- & -DeckGL-Map`) | `✅ DONE` | `Core-Engine-Agent` | `WP-06` | `main` |
| **WP-06** | **程序化美术热替换与舰桥 HUD** (`Bridge-HUD- & -Assets`) | `✅ DONE` | `Core-Engine-Agent` | `WP-07` | `main` |
| **WP-07** | **港口贸易、船厂、AIS 图鉴与弹窗** (`Modals- & -Gameplay-UI`) | `✅ DONE` | `Core-Engine-Agent` | `WP-06` | `main` |
| **WP-08** | **移动端原生桥接与自动化单测** (`Platform- & -QA-Testing`) | `✅ DONE` | `Core-Engine-Agent` | `ALL` | `main` |

---

## 二、 精确到单文件的所有权映射表（File-Level Ownership Registry）

### 🔒 WP-00：全局受控契约与根入口层（禁止单方面重构，新增字段需同步）
```text
src/types/index.ts                 | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/types/economy.ts               | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/types/navigation.ts            | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/types/assets.ts                | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/types/services.ts              | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/i18n/types.ts                  | OWNER: WP-00 (APPEND) | STATUS: DONE
src/i18n/locales/zh.ts             | OWNER: WP-00 (APPEND) | STATUS: DONE
src/i18n/locales/en.ts             | OWNER: WP-00 (APPEND) | STATUS: DONE
src/i18n/index.ts                  | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/store/index.ts                 | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/App.tsx                        | OWNER: WP-00 (FROZEN) | STATUS: DONE
src/main.tsx                       | OWNER: WP-00 (FROZEN) | STATUS: DONE
```

### ⚙️ WP-01：物理引擎、船只改装配置与大圆航线核心
```text
src/config/physics.ts              | OWNER: WP-01 | STATUS: DONE (已补全Flank过热与搁浅常量)
src/config/vessels.ts              | OWNER: WP-01 | STATUS: DONE (12艘船已配置)
src/config/upgrades.ts             | OWNER: WP-01 | STATUS: DONE (已扩充至12项U001~U012)
src/config/captainPerks.ts         | OWNER: WP-01 | STATUS: DONE (已扩充至10项船长专精)
src/core/physics/engine.ts         | OWNER: WP-01 | STATUS: DONE
src/core/physics/fuel.ts           | OWNER: WP-01 | STATUS: DONE
src/core/physics/sail.ts           | OWNER: WP-01 | STATUS: DONE (已导出视风角纯函数)
src/core/physics/windage.ts        | OWNER: WP-01 | STATUS: DONE
src/core/physics/waves.ts          | OWNER: WP-01 | STATUS: DONE
src/core/physics/current.ts        | OWNER: WP-01 | STATUS: DONE
src/core/physics/draft.ts          | OWNER: WP-01 | STATUS: DONE
src/core/physics/grounding.ts      | OWNER: WP-01 | STATUS: DONE (已实现自主脱浅概率公式)
src/core/physics/navigation.ts     | OWNER: WP-01 | STATUS: DONE
src/core/simulation/tick.ts        | OWNER: WP-01 | STATUS: DONE (已接入改装件/技能/船员/RO/过热)
src/core/route/routePlanner.ts     | OWNER: WP-01 | STATUS: DONE (已重构为Turf球面大圆航线)
src/core/route/greatCircle.ts      | OWNER: WP-01 | STATUS: DONE
src/core/route/routeValidation.ts  | OWNER: WP-01 | STATUS: DONE
```

### 💰 WP-02：动态贸易经济、全球港口与特许合约核心
```text
src/config/ports.ts                | OWNER: WP-02 | STATUS: DONE (已扩充至全球8大航区21港)
src/config/commodities.ts          | OWNER: WP-02 | STATUS: DONE (15种商品已配置)
src/config/economy.ts              | OWNER: WP-02 | STATUS: DONE
src/config/gameBalance.ts          | OWNER: WP-02 | STATUS: DONE
src/config/contracts.ts            | OWNER: WP-02 | STATUS: DONE (8项特许航运合约CNT_001~008)
src/core/economy/trade.ts          | OWNER: WP-02 | STATUS: DONE (距离溢价/风浪加成/动态库存)
src/core/economy/supplies.ts       | OWNER: WP-02 | STATUS: DONE
src/core/economy/maintenance.ts    | OWNER: WP-02 | STATUS: DONE (干船坞维修与海上备件抢修)
src/core/economy/crew.ts           | OWNER: WP-02 | STATUS: DONE (船员日薪与脱水断粮Debuff)
src/core/economy/upgrades.ts       | OWNER: WP-02 | STATUS: DONE (改装件槽位与有效载重计算)
```

### 🗄️ WP-03：Zustand 状态切片、本地存档与离线结算
```text
src/store/slices/shipSlice.ts           | OWNER: WP-03 | STATUS: DONE
src/store/slices/navigationSlice.ts     | OWNER: WP-03 | STATUS: DONE
src/store/slices/economySlice.ts        | OWNER: WP-03 | STATUS: DONE
src/store/slices/worldSlice.ts          | OWNER: WP-03 | STATUS: DONE
src/store/slices/uiModalSlice.ts        | OWNER: WP-03 | STATUS: DONE
src/store/persistence/persistConfig.ts  | OWNER: WP-03 | STATUS: DONE
src/store/persistence/offlineSettlement.ts | OWNER: WP-03 | STATUS: DONE
src/store/selectors/shipSelectors.ts    | OWNER: WP-03 | STATUS: DONE
```

### 🌐 WP-04：真实气象、水深采样与动态 AIS 船队服务
```text
src/services/weather/weatherService.ts         | OWNER: WP-04 | STATUS: DONE
src/services/weather/openMeteoClient.ts        | OWNER: WP-04 | STATUS: DONE
src/services/weather/weatherCache.ts           | OWNER: WP-04 | STATUS: DONE
src/services/ais/aisService.ts                 | OWNER: WP-04 | STATUS: DONE
src/services/ais/syntheticVesselGenerator.ts   | OWNER: WP-04 | STATUS: DONE (24艘全球AIS船队)
src/services/ais/deadReckoning.ts              | OWNER: WP-04 | STATUS: DONE
src/services/bathymetry/bathymetryService.ts   | OWNER: WP-04 | STATUS: DONE
src/services/ports/portService.ts              | OWNER: WP-04 | STATUS: DONE
```

### 🗺️ WP-05：ECDIS 电子海图与 Deck.gl 战术图层
```text
src/components/map/ECDISMap.tsx          | OWNER: WP-05 | STATUS: DONE (燃油续航圈/尾迹线/风场流线)
src/components/map/CanvasFallbackMap.tsx | OWNER: WP-05 | STATUS: DONE
src/components/map/webglDetector.ts      | OWNER: WP-05 | STATUS: DONE
src/components/map/RangeRingLayer.ts     | OWNER: WP-05 | STATUS: DONE
src/components/map/WindParticleLayer.ts  | OWNER: WP-05 | STATUS: DONE
```

### 🎛️ WP-06：程序化美术热替换中心与舰桥 HUD
```text
public/assets/assetManifest.json              | OWNER: WP-06 | STATUS: DONE
src/assets/AssetRegistry.ts                   | OWNER: WP-06 | STATUS: DONE
src/assets/procedural/vesselSvg.ts            | OWNER: WP-06 | STATUS: DONE
src/assets/procedural/weatherSvg.ts           | OWNER: WP-06 | STATUS: DONE
src/assets/procedural/compassSvg.ts           | OWNER: WP-06 | STATUS: DONE
src/assets/procedural/cargoSvg.ts             | OWNER: WP-06 | STATUS: DONE
src/components/common/GameAsset.tsx           | OWNER: WP-06 | STATUS: DONE
src/components/hud/BridgeHUD.tsx              | OWNER: WP-06 | STATUS: DONE
src/components/hud/TopNavBar.tsx              | OWNER: WP-06 | STATUS: DONE
src/components/hud/CompassControl.tsx         | OWNER: WP-06 | STATUS: DONE
src/components/hud/EngineTelegraphControl.tsx | OWNER: WP-06 | STATUS: DONE
src/components/hud/QuickActionDock.tsx        | OWNER: WP-06 | STATUS: DONE
src/components/hud/SeaWindowWidget.tsx        | OWNER: WP-06 | STATUS: DONE
src/components/hud/SupplyBarWidget.tsx        | OWNER: WP-06 | STATUS: DONE
```

### 🏪 WP-07：港口贸易、船厂改装、AIS 图鉴与业务弹窗
```text
src/components/modals/PortTradeModal.tsx         | OWNER: WP-07 | STATUS: DONE
src/components/modals/ShipyardModal.tsx          | OWNER: WP-07 | STATUS: DONE
src/components/modals/AISDetailModal.tsx         | OWNER: WP-07 | STATUS: DONE
src/components/modals/MaydayModal.tsx            | OWNER: WP-07 | STATUS: DONE
src/components/modals/JournalModal.tsx           | OWNER: WP-07 | STATUS: DONE
src/components/modals/RoutePlannerModal.tsx      | OWNER: WP-07 | STATUS: DONE
src/components/modals/WebGLTroubleshootModal.tsx | OWNER: WP-07 | STATUS: DONE
```

### 📱 WP-08：移动端原生桥接与自动化测试套件
```text
src/platform/haptics.ts                | OWNER: WP-08 | STATUS: DONE
src/platform/notifications.ts          | OWNER: WP-08 | STATUS: DONE
src/platform/platformAdapter.ts        | OWNER: WP-08 | STATUS: DONE
src/test/physics.test.ts               | OWNER: WP-08 | STATUS: DONE (6项测试已通过)
src/test/economy.test.ts               | OWNER: WP-08 | STATUS: DONE (5项测试已通过)
src/test/route.test.ts                 | OWNER: WP-08 | STATUS: DONE (2项测试已通过)
src/test/storeIntegration.test.ts      | OWNER: WP-08 | STATUS: DONE (3项测试已通过)
```
