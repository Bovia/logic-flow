# Portfolio Hub 子项目约定

本仓库会被 [portfolio-hub](https://github.com/Bovia/portfolio-hub) 聚合展示。

## portfolio.md

- 根目录维护 `portfolio.md`，字段见 Hub：`portfolio-hub/docs/portfolio-contract.md`
- 建议写 `published: true`；开发中改为 `false`

## 演示模式

- Hub iframe 会附加 `?embed=1`
- 本项目无登录门槛，embed 直接进入主界面
- 详见 Hub：`docs/guest-demo-mode.md`

## 数据模型

- 类型契约：`src/types/index.ts`
- 项目说明：`docs/PROJECT.md`
- 数据模型：`docs/DATA_MODEL.md`
