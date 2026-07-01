---
title: LogicFlow 投研决策档案
description: 记录决策逻辑、归因事件与产业链关系，支持实时行情、结构化复盘与逻辑胜率追踪
published: true
tags:
  - React
  - TypeScript
  - Vite
  - 投研
demoUrl: https://logic-flow.vercel.app
githubUrl: https://github.com/Bovia/logic-flow
date: 2026-07
devices:
  - mobile
  - desktop
---

## 为什么做这个

投研决策往往散落在聊天记录、Excel 和脑子里，缺少一个能把「研究 → 决策 → 记录 → 复盘」串起来的轻量工具。LogicFlow 把决策卡、归因时间轴、产业链映射和档案统计放在同一个移动端工作台里。

## 它解决了什么

- **画布**：活跃/历史决策卡、搜索、创建与平仓（含逻辑失效原因）
- **产业链**：上中下游节点与关联标的
- **归因**：事件时间轴、点击展开详情、关联决策跳转
- **档案**：逻辑胜率 & 盈利胜率、四步复盘模板、复盘记录列表
- **行情**：创建决策时拉取东方财富实时报价，持仓展示浮动盈亏

## 一个值得说的技术决定

业务数据（thesis、归因、复盘）走 `localStorage`，类型契约集中在 `src/types`；行情走独立 `quote` 层，开发用 Vite 代理、生产用 Vercel Serverless 转发东方财富 API，投研结论与市场事实解耦，后续换 Tushare 只需改 quote 适配器。

## 结果

已部署 Vercel，Hub iframe 通过 `?embed=1` 直接体验。种子数据含 10 张决策卡、12 条归因、3 条产业链，适合演示完整投研闭环。