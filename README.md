# LogicFlow

个人投研决策档案工具 — 记录决策逻辑、归因事件、产业链关系，并复盘逻辑胜率。

完整项目说明见 **[docs/PROJECT.md](docs/PROJECT.md)**；Portfolio Hub 展示文案见 **[portfolio.md](portfolio.md)**。

## 功能

| Tab | 功能 |
|-----|------|
| **画布** | 活跃/历史决策卡、搜索过滤、创建决策、详情弹窗、平仓操作、置信度更新 |
| **产业链** | 产业链列表、创建产业链、节点管理（上/中/下游） |
| **归因** | 归因事件时间轴、执行/分析模式、点击展开详情、关联决策跳转 |
| **档案** | 逻辑胜率 & 盈利胜率、结构化复盘模板、复盘记录列表 |

数据持久化在浏览器 `localStorage`。首次访问或种子版本升级时自动加载示例数据。

## 实时行情（东方财富）

开发模式下（`npm run dev`）支持拉取 A 股实时行情：

- 创建决策卡：输入代码后失焦或点 **「拉取实时行情」** → 自动填入名称、交易所、行业、ST、现价作入场价
- 持仓决策卡：列表展示 **现价 + 浮动盈亏**
- 平仓操作：自动按现价估算 `actualReturn`

行情经 Vite 代理转发至东方财富 API，交易时段外可能返回收盘价。

## Portfolio Hub 接入

- 根目录 `portfolio.md`（`published: true`）
- Hub 注册：`portfolio-hub/projects.config.ts` → `slug: logic-flow`, `repo: Bovia/logic-flow`
- iframe 演示：Hub 自动附加 `?embed=1`，无登录门槛
- 部署：`vercel.json` + `api/quote.js`（生产行情代理）

## 开发

```bash
npm install
npm run dev      # http://localhost:5173（含行情代理）
npm run build
npm run typecheck
```

## 示例数据（seed v2）

| 类型 | 数量 |
|------|------|
| 决策卡 | 10 张（5 持仓 / 5 已平仓） |
| 归因事件 | 12 条 |
| 产业链 | 3 条 |
| 复盘记录 | 5 条 |

升级种子版本会重置 localStorage 中的示例数据。若你已录入真实数据，升级前请自行备份。

## 项目结构

```
src/
  types/          # 数据模型
  lib/quote.ts    # 东方财富行情
  lib/ticker.ts   # 代码 / 交易所解析
  store/          # React Context
  pages/          # 四个 Tab
  features/       # 业务模块
  data/seed.ts    # 示例数据 + SEED_VERSION
```

## 数据模型

- 项目说明：[`docs/PROJECT.md`](docs/PROJECT.md)
- 类型定义：[`src/types/index.ts`](src/types/index.ts)
- 数据模型：[`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)
- Canvas 文档：[logicflow-data-model](/Users/bovia-pwc/.cursor/projects/Users-bovia-pwc-Desktop-logic-flow/canvases/logicflow-data-model.canvas.tsx)
