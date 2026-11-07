# 《The_Era_OF_Seafaring》 工程核心规范与开发铁律 (PROJECT RULES)

> **版本**：1.1.0 · 2026-11-07  
> **核心战略定位**：**本项目主要基于手机开发，所有 UI 与交互必须优先考虑手机屏幕布局（Mobile-First Architecture）**。所有后续修改代码、增加功能、修复 Bug 的开发 Agent 必须 100% 严格遵守！

---

## 核心铁律一：手机屏幕优先设计规范 (Mobile-First Layout Priority)

> **原则**：任何功能与界面，必须首先在 **iPhone 15 / 16（393 × 852 px）及 Android（360 ~ 430 px 宽）** 的真机竖屏下达到完美体验！桌面端体验作为兼顾扩展。

1. **大拇指操作区原则（Thumb Zone Focus）**：
   - 驾驶操控（车钟档位、操舵盘、大圆航线引航按钮、核心海事功能 Dock 栏）必须收束在**屏幕下半部大拇指触手可及的区域**；
   - 避免在海图左右两侧悬浮过多宽面板造成视野遮挡；海图必须保持 85% 以上的可视沉浸面积。

2. **安全区严密适配（Safe Area Insets）**：
   - 顶部必须加上 `.pt-safe`，严防遮挡灵动岛与前置摄像头；
   - 底部必须加上 `.pb-safe`，严防遮挡 iOS 底部 Home Indicator 小白条与 Android 虚拟导航条。

3. **弹窗全部采用移动端底部抽屉（Mobile Bottom Sheet）**：
   - 港口贸易、船厂改装、航线规划等弹窗，手机端必须统一贴底自适应（`rounded-t-2xl`, 最大高度 `92dvh`），支持纵向平滑滚动，禁止出现横向溢出。

4. **单手触控优化**：
   - 按钮点击区域必须 $\ge 40 \times 40\text{ px}$；海图右侧提供浮动大号【居中本船】与【缩放】触控按钮。

---

## 核心铁律二：全量多语言国际化规范 (Mandatory Multi-Language i18n)

> **原则**：任何修改或增加功能，**必须保持中英双语（中文 / English）**，严禁在 JSX/TSX 中散落硬编码文本！

1. **类型先行（Type-First Contract）**：
   - 任何新增文本字段，必须首先在 [`src/i18n/types.ts`](file:///Users/ev/Projects/The_Era_OF_Seafaring/src/i18n/types.ts) 的 `TranslationDictionary` 中增加对应的强类型定义；
   - TypeScript 编译器会在英文或中文缺少该 Key 时直接阻断构建。

2. **双语同步落地**：
   - 中文词典：[`src/i18n/locales/zh.ts`](file:///Users/ev/Projects/The_Era_OF_Seafaring/src/i18n/locales/zh.ts)
   - 英文词典：[`src/i18n/locales/en.ts`](file:///Users/ev/Projects/The_Era_OF_Seafaring/src/i18n/locales/en.ts)

3. **组件调用规范**：
   - 组件内一律使用 `const { t, language } = useTranslation()`。

---

## 核心铁律三：确定性纯函数物理核心 (Pure Function Physics Core)

1. 船舶动力学、油耗立方计算、风帆极坐标效率、波浪失速损耗、洋流合成与大圆航线必须保持为 `src/core/physics/` 下的无副作用纯函数；
2. 任何物理公式修改必须通过 `npm run test` 中的 Vitest 单元测试验收。
