# 《远洋纪元：真实海域 (The Era of Seafaring: Live Ocean)》

一款基于 **1:1 真实地球地理、实时海洋气象水文与全球 AIS 船队动态模拟** 的硬核拟真航海模拟与跨洋贸易探索游戏（Mobile-First Architecture）。

---

## 📌 核心工程与多人协同文档导航（必读）

在开始开发或修改任何代码前，请务必按顺序阅读以下核心文档：

1. 📋 **[《全量代码完成度审计与多人协同开发总控计划》 (`COLLABORATIVE_DEV_PLAN.md`)](./COLLABORATIVE_DEV_PLAN.md)**
   - **多人协同打卡入口**：包含当前代码库 48 个文件的逐模块完成度审计、已知断链/Bug 清单、**任务认领锁总表 (`T-01` ~ `T-14`)** 与 **8 大并行工作包 (`WP-01` ~ `WP-08`)**。
   - **防冲突原则**：开发前必须先在该文档的任务认领表中登记你的姓名/Agent ID 并将状态改为 `🟡 IN_PROGRESS`！
2. 🔒 **[《文件级所有权与防冲突锁清单》 (`AGENTS.md`)](./AGENTS.md)**
   - 精确到每一个源码文件的 `OWNER / READERS / STATUS` 映射表，确保任意两个开发者或 Coding Agent 绝不同时修改同一个文件。
3. ⚖️ **[《工程核心规范与开发铁律》 (`PROJECT_RULES.md`)](./PROJECT_RULES.md)**
   - 手机竖屏优先（Mobile-First）、全量中英双语国际化（Type-First i18n）、确定性纯函数物理核心、多人认领打卡四大铁律。
4. 📖 **策划与架构基线文档**：
   - [《游戏详细策划案》 (`SEAFARING_GAME_DESIGN_DOC.md`)](./SEAFARING_GAME_DESIGN_DOC.md)
   - [《产品需求与全量数值设计文档 PRD》 (`prd.txt`)](./prd.txt)
   - [《多 Agent 并行开发技术规范与全目录架构文档》 (`dev_doc.txt`)](./dev_doc.txt)
   - [《全量移动端游戏 UI 设计任务书》 (`UI_design.txt`)](./UI_design.txt)

---

## 🚀 快速启动与验收命令

```bash
# 1. 启动开发服务器 (Port 3000)
npm run dev

# 2. 运行核心物理与航海数学纯函数单元测试 (Vitest)
npm run test

# 3. 严格 TypeScript 类型检查与生产构建验证
npm run build
```
