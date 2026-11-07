# 《远洋纪元：真实海域（Era of Seafaring: Live Ocean）》全套 AI 提示词工程包

本提示词包专为 **“Web 技术栈 + 跨端打包（React 18 + TypeScript + Vite + Tailwind CSS + MapLibre GL JS + Deck.gl + Zustand + Capacitor）”** 路线量身定制。
为了防止大模型因输出长度限制（Token Limit）而截断或偷懒省略细节，建议将 **提示词一（PRD与数值验证）** 和 **提示词二（多Agent并行开发架构与接口契约）** 分两次发送给 ChatGPT（或在一个对话中分两步执行），**提示词三** 则直接发送给 UI/UX 设计 Agent（如 v0.dev、Claude Artifacts、Cursor UI Agent 或 Figma AI）。

---

## 提示词一：发送给 ChatGPT 生成《全量数值体系与生命周期验证 PRD 文档》

> **使用说明**：复制以下代码块内容发送给 ChatGPT（推荐使用 o1 / GPT-4o / Claude 3.5 Sonnet 等强推理模型），它将为你输出带严密数学公式、T1-T6 完整数值表及 100 小时生命周期验证计算的 PRD。

```markdown
# Role
你是一位拥有 15 年经验的硬核模拟经营/航海游戏主策划（Lead Game Designer）兼高级数值策划（ Senior System & Economy Balance Designer）。

# Context & Product Vision
我们要开发一款基于 **Web 技术栈 + Capacitor 跨端打包（iOS / Android / Desktop）** 的现代拟真航海模拟与贸易探索游戏：《远洋纪元：真实海域（Era of Seafaring: Live Ocean）》。
游戏核心视角采用 **“高拟真现代舰桥数字海图仪（ECDIS）+ 拟物化驾驶仪表盘 + 舷窗海况小视窗”**（参考《HighFleet》的硬核仪表操作感与《Windy》的实时气象流体美学）。

核心玩法循环：
1. **真实地球与海图底座**：1:1 真实海岸线（OSM）、全球真实水深（GEBCO 15弧秒网格）与真实港口数据（NGA World Port Index，含进港最大吃水限制、燃油淡水补给能力）。
2. **实时海洋气象与水文**：接入 Open-Meteo Marine API / NOAA GFS，实时同步真实世界的风速、风向、有效波高（Wave Height）、涌浪周期、表层洋流。
3. **全球实时 AIS 船只伴航**：接入 aisstream.io 实时 AIS 船舶流 + 远洋大圆航线插值 + 客户端运动学航位推算（Dead Reckoning），玩家在海图与雷达上可点选现实中正在航行的货轮、油轮，进行 VHF 无线电联络、伴航借力、遵守 COLREGs 避碰规则或发起 Mayday 求援。
4. **核心生存与成长博弈**：玩家通过规划航线、控制车钟节流阀（非线性油耗）或风帆迎风角，平衡【燃油、淡水、口粮、维修备件】四大消耗品与【贸易货舱载荷/吃水深度】的配比，赚取资金（Credits）与航海经验（Seamanship XP），从 T1 近岸小船逐步解锁至 T6 极地破冰船，最终实现全球自由环航。

# Task
请输出一份**工业级、可直接用于写代码的《产品需求与全量数值设计文档（PRD）》**。严禁使用模糊的概括性语言（如“消耗适量燃油”、“获得一定经验”），**所有机制必须给出精确的数学公式、常量系数、完整配置表格与生命周期验证推导**。

请严格按照以下章节结构输出：

### 第一章：核心物理与航行数学模型（精确到每帧/每秒计算公式）
1. **动力推进与非线性油耗公式**：
   - 定义车钟档位（Stop 0%, Slow 25%, Half 50%, Eco 75%, Full 100%, Flank 115%）对应的功率输出比与航速关系。
   - 给出主机每小时燃油消耗公式（体现 $FuelRate \propto Speed^3$ 的立方关系，加上辅机发电基础恒定油耗）。
   - 给出风帆推进的视风角（Apparent Wind Angle, AWA）推力效率分段函数（0°~35°死区、45°迎风、90°横风、135°侧顺风、180°正顺风的极坐标速度系数 Polar Curve）。
2. **真实环境耦合修正公式**：
   - **风阻与横漂修正（Windage & Leeway）**：风速/风向对船速的增减比。
   - **有效波高失速与船体损伤公式（Wave Resistance & Hull Stress）**：当实时浪高 $H_s$ 超过船只安全抗浪阈值 $H_{safe}$ 时，航速衰减百分比公式，以及每小时船体耐久度（Hull HP）与货物完好度（Cargo Integrity）的扣血公式。
   - **洋流矢量叠加公式**：船只对水速度向量 $\vec{V}_{water}$ 与真实表层洋流向量 $\vec{V}_{current}$ 合成对地速度（SOG / COG）的球面坐标更新公式。
   - **载重吃水与搁浅判定公式**：空船吃水 $D_{light}$、满载吃水 $D_{load}$ 与当前总载重（燃油+淡水+口粮+备件+货物）的线性关系公式；当真实水深 $Bathymetry \le D_{current}$ 时的搁浅物理惩罚与脱浅机制。

### 第二章：T1 ~ T6 全阶船只完整数值配置总表（Markdown 表格）
请设计包含至少 **12 艘代表性船只（覆盖 T1 至 T6，每阶 2 艘，含帆船线与现代机动商船/科考船线）** 的完整静态数值表，列字段必须包含：
- `Vessel_ID`、船只名称、阶级（T1~T6）、推进类型（Sail / Diesel / Hybrid / Nuclear）
- 解锁所需等级（Level）、解锁售价（Credits）
- 空船排水量（t）、最大载重吨（DWT, 吨）、最大货舱容积（TEU 或 $m^3$）
- 空载吃水（m）、满载吃水（m）
- 经济航速（Knots）、最大航速（Knots）、主机额定油耗（kg/h @ Eco Speed）
- 燃油舱上限（t）、淡水舱上限（t）、口粮仓上限（t）、备件仓上限（t）
- 理论经济续航里程（NM）、安全抗风浪上限（蒲氏风级 & 最大安全浪高 m）、标准船员编制（人）
- 自带特种设备槽位数（如是否支持安装 RO 海水淡化机、太阳能板、冰区加强肋骨、深海声呐）

### 第三章：四大补给消耗、船厂改装与海上求援数值表
1. **补给品基础参数表**：燃油（MGO/HFO）、淡水、基础干粮、生鲜补给、维修备件的单位重量、基准港口单价、每日/每小时人均或每千瓦消耗率、耗尽后的 Debuff 阶梯状态机（如淡水耗尽后第 1/6/12/24 小时的惩罚）。
2. **船厂模块化改装表（至少 10 项核心升级件）**：含 RO 反渗透海水淡化装置（每小时耗油/耗电产水量）、副油箱扩建、防污底漆、船首侧推器、冰区装甲、风力助推转子帆的具体数值加成、占用载重与改装造价。
3. **Mayday 海上求援与拖轮费用公式**：向附近 20 海里内真实 AIS 船只求援的成功率与接济量公式；呼叫港口远洋拖轮（Salvage Tug）的起步价 + 每海里拖带费公式。

### 第四章：经济系统、动态港口贸易与航海经验（XP）体系
1. **商品与特许合约数值表**：设计 15 种具有真实地理产销特征的贸易商品（如集装箱百货、波斯湾原油、智利冷链海鲜、澳洲铁矿石、精密海事仪器等），给出基础买入价、跨区域距离溢价系数、恶劣天气风险溢价乘数（当航线途经大风浪区时的运价加成公式）。
2. **航海经验（Seamanship XP）获取与升级曲线**：
   - 给出每航行 1 海里基础 XP、新港口首访开拓 XP、大风浪（蒲氏 7 级+）安全航行加成 XP、收集真实世界 AIS 知名船只图鉴（Ship Spotting）XP 的具体数值。
   - 给出 `Level 1` 到 `Level 50` 的升级经验分段函数公式及关键等级解锁的船长技能（Captain Perks）数值表。

### 第五章：可验证的游戏生命周期计算与经济平衡推导（核心必写）
请用严谨的数学验算过程，一步步推演玩家从 **第 0 小时（开局）到第 100 小时（终局全球环航）** 的完整成长曲线（假设提供 1x 实时挂机与最高 60x 巡航加速两种节奏参考）：
1. **新手期（T1, 0~5 小时，近岸湾区 100~300 NM 航线）**：
   - 开局初始资金、第一趟 120 海里航程的燃油/淡水采购成本、货物装载吨位、航行耗时、毛利润、扣除补给与折旧后的**单趟净利润（Net Profit）**。
   - 精确计算玩家需要跑多少趟（约多少海里、多少小时）可以攒够资金与 XP 解锁 **T2 船只**。
2. **成长期（T2~T3, 5~25 小时，区域跨海 500~2,500 NM 航线）**：
   - 引入海水淡化机与支线集装箱船后的单趟收支模型、回本周期（ROI 趟数）及升级 T4 的时间节点验证。
3. **远洋期（T4~T5, 25~70 小时，跨大洋 4,000~12,000 NM 航线）**：
   - 跨太平洋/苏伊士运河航线的通行费、重油成本、大宗贸易单趟净利与船队资产膨胀控制（Sink 回收机制：船员薪资、船坞大修、保险费）。
4. **终局期（T6, 70~100+ 小时，极地航道与 21,600 NM 全球不间断环航）**：
   - 汇总输出一张 **《T1~T6 全生命周期核心指标演进验证表》**（包含：阶段、目标船只售价、单海里平均净收益、单趟平均时长、晋级所需航行总海里数、晋级所需总趟数、预计累计游戏时长），证明经济系统既不会在前期卡死破产，也不会在后期恶性通货膨胀。
```

---

## 提示词二：发送给 ChatGPT 生成《多 Agent 并行开发架构、目录规范与美术热替换技术文档》

> **使用说明**：在 ChatGPT 完成上述 PRD 后（或新建一个专门的架构对话），发送以下提示词。它会强制输出**细化到每一个文件路径、TypeScript Interface 定义、多 Agent 零冲突并行分工边界，以及程序化 SVG/Canvas 占位图与一键替换美术资源的 Asset Registry 机制**，让低参数 Coding 模型也能照着填空写出无 Bug 代码。

```markdown
# Role
你是一位精通现代前端工程化、WebGIS（MapLibre + Deck.gl）、状态驱动游戏架构与多 AI Agent 协同软件工程的首席系统架构师（Principal Software Architect）。

# Context & Tech Stack Constraints
我们要将《远洋纪元：真实海域（Era of Seafaring: Live Ocean）》落地为一个可运行在浏览器并可通过 **Capacitor** 一键打包为 **iOS / Android / Desktop** 原生应用的项目。
为了确保**较低参数的代码生成模型（Small/Medium Coding LLMs）**以及**多个并行工作的职能开发 Agent** 能够零幻觉、零冲突地同时编写代码，技术栈严格锁定为：
- **构建与框架**：Vite + React 18 + TypeScript (Strict Mode)
- **样式与 UI**：Tailwind CSS + Lucide React (基础辅助图标) + 自定义可热替换美术资产层
- **核心状态管理**：Zustand + Immer + Persist Middleware（本地存档与离线挂机时间戳结算）
- **海图与空间渲染**：`maplibre-gl`（底图、等深线、港口点位）+ `@deck.gl/core` & `@deck.gl/layers`（万级 AIS 船只高效渲染、航线、风场粒子图层）+ `turf`（大圆航线与球面几何计算）
- **跨端原生能力**：`@capacitor/core`、`@capacitor/haptics`（海浪/车钟震动反馈）、`@capacitor/local-notifications`（远洋后台航行到港/台风预警推送）

# Core Architectural Requirements（三大铁律）
1. **多 Agent 绝对解耦（Zero-Conflict Parallelism）**：
   所有模块必须围绕唯一真相源 `src/types/` 下的 TypeScript 接口契约（Data Contracts）和 `src/store/` 状态切片（Slices）进行通信。任何两个开发 Agent 绝不允许同时修改同一个文件。
2. **低参数模型防呆设计（Small-Model Proofing）**：
   每个文件职责单一（单文件代码量控制在 250 行以内）；所有物理/经济计算拆分为纯函数（Pure Functions，给定固定输入必得固定输出，无副作用）；明确禁止任何隐式 `any` 类型。
3. **美术资源热替换架构（Hot-Swappable Procedural-to-Art Asset Pipeline）**：
   游戏初期全部采用 **程序化绘制（纯代码 SVG / HTML5 Canvas 绘图）** 生成所有船只俯视/侧视剪影、仪表盘表盘、天气图标、港口标志、货物图标与海况背景。
   **必须设计一套统一的 `<GameAsset />` 与 `AssetRegistry` 机制**：通过唯一的 `assetId` 加载资源。默认执行程序化 SVG/Canvas 渲染函数；一旦开发者将同名 PNG/WebP/SVG 美术图片放入 `/public/assets/override/` 目录或修改 `assetManifest.json` 映射表，系统无需修改任何业务组件代码即可自动切换为真实美术资源！

# Task
请输出一份**《多 Agent 并行开发技术规范与全目录文件级架构文档》**，严格包含以下五个部分：

### 第一部分：精确到每一个文件的完整目录树（Directory Tree）
请用树状结构列出 `src/` 与 `public/` 下的每一个目录和文件（不少于 40 个核心文件），并在每个文件名后用一句话精准注释其唯一职责。必须包含：
- `src/types/`（全局接口契约层）
- `src/config/`（T1-T6 船只配置表、港口 WPI 数据表、商品表、升级件表）
- `src/assets/`（AssetRegistry 美术热替换中心 + Procedural 程序化 SVG/Canvas 生成器库）
- `src/core/`（纯函数游戏引擎：航行物理、油耗补给计算、搁浅判定、AIS 航位推算 DR、大圆航线规划、离线挂机时间差结算）
- `src/services/`（外部真实数据适配器：Open-Meteo 气象拉取与缓存、aisstream.io WebSocket/模拟混合流、水深采样服务）
- `src/store/`（Zustand 分模块状态切片：ShipSlice, NavigationSlice, EconomySlice, WorldSlice, UIModalSlice）
- `src/components/map/`（MapLibre 海图容器 + Deck.gl 玩家船只层、AIS 船队层、风场流线层、燃油可达圈 RangeRing 层）
- `src/components/hud/`（舰桥驾驶台 HUD：拟物车钟推杆、罗盘与风向仪、四大补给仪表条、舷窗实时海况动态小视窗、VHF 无线电面板）
- `src/components/modals/`（港口贸易大厅、船厂买船与改装车间、AIS 船只详情与图鉴收集册、世界探索日志）
- `src/platform/`（Capacitor iOS/Android 震动反馈与后台通知封装）

### 第二部分：全局核心 TypeScript 接口契约（`src/types/index.ts` 完整代码）
请直接写出可直接复制运行的完整 TypeScript 类型定义代码，必须涵盖：
1. `VesselSpec`（船只静态配置）与 `PlayerVesselState`（玩家当前船只动态状态：经纬度、航速 SOG、航向 COG、车钟档位、四大补给当前余量、货舱明细、改装件列表、船体耐久）。
2. `MarineWeatherCell`（实时气象水文数据结构：风速、风向、阵风、有效波高、涌浪周期、洋流速度与方向、气压）。
3. `AISVesselTarget`（真实 AIS 船只数据结构：MMSI、IMO、船名、船型枚举、坐标、SOG、COG、吃水、目的港、ETA、数据源标识 `REAL_LIVE | SYNTHETIC_OCEAN | HISTORICAL`、是否已收入图鉴）。
4. `PortInfo`（港口数据结构：UN/LOCODE、名称、坐标、最大允许吃水、油水补给单价、产销商品列表）。
5. `AssetKey` 与 `AssetConfig`（美术资源注册与覆写接口）。

### 第三部分：程序化图形与美术资源一键替换系统设计（附完整核心代码）
请详细写出 `src/assets/AssetRegistry.ts` 和 `src/components/common/GameAsset.tsx` 的完整实现代码与使用规范：
1. 展示如何通过 `assetManifest.json` 控制 `mode: "procedural" | "image"`。
2. 写出至少 3 个代表性的程序化 SVG 生成器纯函数代码模板（例如：根据船型枚举 `Cargo | Tanker | Sailboat | Icebreaker` 动态绘制带航向箭头的精细 SVG 船只图标；动态绘制带波浪起伏的舷窗海况 Canvas/SVG 组件）。
3. 说明美术人员接手后，如何仅通过往 `/public/assets/override/vessels/tier1_sloop.png` 丢入图片文件，就实现游戏内图标、海图光标与船厂立绘的自动无缝替换。

### 第四部分：6 个职能 Coding Agent 的并行分工任务书（Agent Work Packages）
请将整个项目拆分为 **6 个互不依赖、可同时开工的职能 Agent 任务包**。对每个 Agent，明确列出：
- **Agent 角色名称与职责边界**
- **只允许读写的专属文件列表（Owned Files）**
- **依赖的只读接口文件（Read-Only Dependencies）**
- **每个文件必须暴露的精确函数签名（Function Signatures，含入参类型与返回值类型）**
- **发给该低参数 Agent 的专属 System Prompt 模板（指导它严格按接口写代码）**

6 个 Agent 划分如下：
- **Agent 1 (`Core-Physics-Engine`)**：负责所有纯函数物理计算、油耗/补给扣减、风浪修正、搁浅判定、大圆航线测算与离线时间差结算（`src/core/*` + `src/config/*`）。
- **Agent 2 (`RealWorld-Data-Services`)**：负责 Open-Meteo 实时天气 API 接入、aisstream.io WebSocket 接入与远洋模拟船只生成器、運動学航位推算（Dead Reckoning）算法（`src/services/*`）。
- **Agent 3 (`State- & -GameLoop-Controller`)**：负责 Zustand 状态切片组装、60FPS 主循环 `requestAnimationFrame` 调度器、1x~60x 时间加速控制器与本地持久化存档（`src/store/*`）。
- **Agent 4 (`WebGIS- & -DeckGL-Map`)**：负责 MapLibre 海图底图初始化、Deck.gl 四大自定义图层（玩家船只、万级 AIS 船只图标层、燃油可达半径圈、航路规划线与风场粒子）（`src/components/map/*`）。
- **Agent 5 (`Bridge-HUD- & -Procedural-Assets`)**：负责程序化 SVG/Canvas 美术资产库、车钟推杆、风帆罗盘、补给仪表、VHF 无线电弹窗与舷窗动态海况小视窗（`src/assets/*` + `src/components/hud/*`）。
- **Agent 6 (`Port-Economy- & -Capacitor-Shell`)**：负责港口贸易大厅、船厂购买与改装 UI、AIS 集邮图鉴面板，以及 Capacitor iOS/移动端安全区适配与震动反馈封装（`src/components/modals/*` + `src/platform/*`）。

### 第五部分：集成联调与验收标准（Integration & Verification Checklist）
给出分步集成顺序（Step 1 ~ Step 4）以及每个 Agent 产出的单元测试/冒烟测试断言（Assertions），确保拼装后一次编译通过。
```

---

## 提示词三：发送给 UI 设计 Agent 的高还原度界面生成提示词

> **使用说明**：这份提示词专门用于发给 **UI 设计 Agent**（如 **v0.dev、Claude 3.5 Sonnet Artifacts、Cursor 前端 Agent、Google Stitch 或 Figma AI**）。它能将我们讨论的“现代深海电子海图 + 拟物化舰桥仪表盘 + 舷窗实况小视图 + 实时 AIS 船只雷达”的构想，直接转化为高颜值的交互式界面原型。

```markdown
# Role
你是一位顶尖的游戏 UI/UX 艺术总监兼高级前端视觉工程师，擅长打造兼具 **“现代高精度数字海图科技感（ECDIS / 战术沙盘）”** 与 **“硬核航海机械仪表质感（Tactile Nautical Instruments）”** 的沉浸式游戏界面（美学风格参考：《HighFleet》的机械仪表交互 + 《Windy》的海洋气象流场视觉 + 《In Other Waters》的极简深海遥测界面 + 现代豪华远洋游艇 Glass Bridge 玻璃舰桥系统）。

# Design Target
请为拟真航海模拟游戏 **《远洋纪元：真实海域（Era of Seafaring: Live Ocean）》** 设计并实现一套响应式（完美兼容 iPad 横屏、iPhone 横/竖屏安全区及 Desktop 全屏）的 **主舰桥驾驶与海图指挥界面（Main Bridge & ECDIS Command UI）**。

# Visual Style & Color Palette（视觉规范与色彩体系）
1. **整体色调（Deep Ocean Night-Ops Theme）**：
   - 海图深水基底：`#060D17` ~ `#0B192C`（深邃午夜海蓝）
   - 浅滩与等深线高亮：`#112D4E` ~ `#1E4D6B`（带半透明等深线网格与经纬度刻度线）
   - 仪表盘金属面板背景：`#0F172A` 配合 `backdrop-blur-md` 毛玻璃、细微金属拉丝质感与 `1px solid rgba(56, 189, 248, 0.2)` 战术描边
   - 主高亮色（航电青 / 雷达绿）：`#00F0FF`（Cyan，代表玩家本船、主航线与正常状态）、`#10B981`（Emerald，代表经济巡航与安全补给）
   - 警示色：`#F59E0B`（Amber 琥珀黄，代表真实 AIS 商船、低补给预警、中浪区）、`#EF4444`（Crimson 警报红，代表碰撞预警、台风风圈、燃油/淡水耗尽危机）
2. **字体与排版**：
   - 所有经纬度、航速（SOG）、航向（COG）、水深、MMSI 编号、剩余续航必须使用等宽数字字体（`font-mono` / `JetBrains Mono` / `tabular-nums`），确保实时跳动时绝不抖动。
3. **美术图标解耦规范**：
   - 所有船只剪影、气象符号、表盘指针、补给图标均封装为独立 `<GameAsset id="..." />` SVG 组件，支持高对比度矢量发光效果（Drop-shadow glow）。

# Layout & Core UI Modules（五大核心界面区域）

请在一个完整页面中构建以下 5 个紧密咬合的交互视图模块：

### 1. 中央全屏底座：2.5D 交互式实时数字海图视窗（占屏幕 100% 底层，带战术网格）
- **背景与海图要素**：绘制带有经纬度网格线、深浅水等深线色块（Bathymetry Contours）、动态流动的半透明海风流线粒子（Wind Particles）和洋流箭头。
- **玩家本船标识（Center Vessel）**：位于海图中心，带船首向延长虚线（Heading Line）、真实对地航迹线（Track Trail）以及两个极其关键的同心战术圆环：
  1. **绿色虚线大圈（Fuel Range Ring）**：标注 `MAX RANGE: 1,420 NM (Eco 12.5 kts)`，随车钟档位实时缩放！
  2. **青色雷达扫描圈（AIS Radar Ring）**：标注 `VHF/AIS RANGE: 24 NM`。
- **周围真实世界 AIS 船只光标（Live AIS Traffic）**：在海图上渲染 6~8 艘不同朝向的真实船只矢量三角图标（区分集装箱船、油轮、散货船、帆船配色），鼠标悬停或点击某艘船时，浮现精致的战术气泡框：
  - 显示：`EVER GIVEN (MMSI: 353136000)` | 船型：`ULCV Container` | 航速：`18.4 kts` | 航向：`242°` | 吃水：`15.2m` | 目的港：`NLRTM (Rotterdam)` | 按钮：`[VHF 呼叫]`、`[加入船只图鉴]`、`[伴航跟随]`。

### 2. 顶部战术状态栏（Top Telemetry & Environment Bar）
悬浮于顶部的紧凑长条仪表，分为三组：
- **左侧（时空与定位）**：当前真实世界 UTC 时间、游戏时间倍速切换胶囊按钮（`1x LIVE` | `10x` | `60x` | `AUTO-CRUISE`）、当前经纬度坐标（`22°15'42"N, 114°10'18"E`）、当前海域名称（如 `South China Sea - Luzon Strait`）。
- **中部（实时海洋气象 HUD）**：
  - 实时风速/风向徽章（带旋转风向箭头：`ENE 24.5 kts / Beaufort 6`）
  - 有效波高与涌浪周期（`Wave: 3.2m @ 9s`）
  - 表层洋流（`Current: +1.8 kts NE`）
  - **实时海底水深 vs 本船当前吃水对比表**（`Depth: 42.5m | Draft: 8.4m [SAFE]`，当水深接近吃水时闪烁红光）。
- **右侧（船长资产与等级）**：当前资金 `₡ 248,500`、船长等级 `Lv.14 远洋大副 (XP: 6,420 / 8,000)`、快捷入口按钮：`[港口贸易]`、`[船厂改装]`、`[AIS 集邮册 (42/500)]`。

### 3. 左下角：舰桥舷窗实况小视窗与船体状态（Bridge Porthole & Vessel Status Card）
一个极具沉浸感的 **“动态舰桥舷窗画中画（Picture-in-Picture Bridge View）”**：
- 用多层动态 SVG/Canvas 绘制出当前海域的实时视觉切片：天空昼夜渐变色、移动的云层或雨丝、随实时波高（`3.2m`）上下起伏的 3 层海浪波纹，以及本船在水面随浪横摇（Roll: `±6.5°`）的剪影。
- 舷窗下方紧贴 **船体与载荷配平条**：
  - 船体耐久度（Hull HP: `94%`）
  - 载重吨位分配堆叠进度条（直观显示：`燃油 180t [25%]` + `淡水/口粮 40t [6%]` + `贸易货物 450t [62%]` + `剩余可用载重 50t [7%]`）。

### 4. 右下角：拟物化推进控制台（Tactile Propulsion & Sail Control Console）
這是玩家最核心的驾驶操作区，必须具备极强的机械操控反馈感：
- **双罗盘复合仪（Dual Heading & Wind Rose）**：外圈为 360° 航向罗盘，内圈显示真实来风角（True Wind）与视风角（Apparent Wind），若当前船只带风帆，高亮显示绿色“最佳受风扇区”与红色“逆风死区”。
- **机械车钟推杆（Engine Order Telegraph Slider）**：可上下推拉或点击切换的档位槽：
  - `FLANK (115% - 警告高磨损)`
  - `FULL (100% - 18.0 kts | 420 kg/h)`
  - `ECO CRUISE (75% - 13.5 kts | 165 kg/h) [推荐绿色高亮]`
  - `HALF (50% - 9.0 kts | 55 kg/h)`
  - `SLOW (25% - 4.5 kts | 18 kg/h)`
  - `STOP (0% - 辅机待机 5 kg/h)`
  - 当玩家拖动车钟档位时，海图上的 **绿色燃油最大可达半径圈（Range Ring）** 和旁边的 **预计剩余航行时间（Endurance Time）** 必须实时动态变化！

### 5. 底部中央：四大生存补给遥测仪表盘（Consumables & Life Support Dock）
并排展示四个带实时消耗速率（Burn Rate）和预计耗尽倒计时的精致进度仪表：
1. **燃油（FUEL）**：`182.4 / 250 t` (`-165 kg/h` | 剩余 `46h 05m` / `622 NM`)
2. **淡水（FRESH WATER）**：`18.5 / 25 t` (`-45 L/h` | 按钮开关：`[RO 海水淡化机: ON +60 L/h]`)
3. **口粮与士气（PROVISIONS & MORALE）**：`12.0 / 15 t` (`船员 12人 | 士气 92% 高昂`)
4. **维修备件（SPARE PARTS）**：`45 / 50 箱` (`[海上抢修]` 按钮 + 红色带防护盖的 `[SOS MAYDAY 求援]` 按钮)

# Deliverable Output
请使用 **React + Tailwind CSS + Lucide Icons + 内联动态 SVG** 编写一个**单文件可完全交互的完整原型组件**。
要求：
1. 我可以在界面上实际点击切换车钟档位（Stop ~ Flank），看到航速、每小时油耗和海图上的最大续航半径圈（Range Ring）实时联动缩放！
2. 我可以点击海图上的真实 AIS 船只图标，弹出该船的真实 AIS 详情卡并点击“收集图鉴”或“VHF 通话”。
3. 我可以切换顶部按钮打开【船厂 T1~T6 船只解锁树与模块化改装弹窗】以及【港口大宗商品贸易与补给采购配平弹窗】。
```

---

## 附：推荐执行工作流（How to Execute）

1. **第一步（定数值与 PRD）**：将 **提示词一** 发送给 ChatGPT，拿到完整的数学公式与 T1~T6 数值表，保存为项目的 `PRD.md`。
2. **第二步（生成高保真可交互 UI 原型）**：将 **提示词三** 发送给 Claude Artifacts、v0.dev 或 ChatGPT Canvas，它会直接渲染出带动态海图、车钟联动续航圈、舷窗海浪和 AIS 弹窗的 React 界面，你可以直观体验并微调布局。
3. **第三步（生成多 Agent 工程脚手架与分工代码）**：将 **提示词二**（连同第一步确认的数值参数）发给 ChatGPT，让它先生成 `src/types/index.ts`（全局接口契约）和 `src/assets/AssetRegistry.ts`（美术热替换层），然后你就可以开 6 个窗口（或在本地用 Claude Code / Cursor / Gemini）让 6 个低参数 Agent 按各自的任务包同时生成代码。
