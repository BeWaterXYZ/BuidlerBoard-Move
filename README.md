# Builder Board

[English](./README_EN.md) | 中文

## 概述

BuilderBoard 是一个基于 Movement 区块链的开发者贡献追踪和激励平台。它通过智能合约记录开发者和项目的贡献数据，实现社区激励和成就认证。

## 目录

- [核心功能](#核心功能)
  - [开发者评分系统](#开发者评分系统)
  - [项目评分系统](#项目评分系统)
  - [成就徽章系统](#成就徽章系统)
  - [社区背书机制](#社区背书机制)
- [技术架构](#技术架构)
- [创新点](#创新点)
- [应用场景](#应用场景)
- [未来规划](#未来规划)

## 核心功能

### 开发者评分系统

平台通过以下方式追踪和评估开发者贡献:

- GitHub 活动数据追踪(stars、followers 等)
- 综合贡献分数计算
- 链上评分数据记录

#### 评分维度及权重

| 维度 | 权重 | 计算方式 | 说明 |
|------|------|----------|------|
| 社区影响力 | 15分 | [`Math.log10(followers + 1) * 15`](./src/utils/score-calculator.ts) | 基于followers数量 |
| 项目受欢迎度 | 25分 | [`Math.log10(totalStars + 1) * 25`](./src/utils/score-calculator.ts) | 基于获得的stars总数 |
| 贡献活跃度 | 20分 | [`Math.log10(contributions + 1) * 20`](./src/utils/score-calculator.ts) | 基于贡献次数 |
| 代码贡献 | 15分 | [`Math.log10(pullRequests + 1) * 15`](./src/utils/score-calculator.ts) | 基于PR数量 |
| 问题解决能力 | 10分 | [`Math.log10(issuesResolved + 1) * 10`](./src/utils/score-calculator.ts) | 基于已解决issues数量 |
| 代码质量 | 10分 | [`codeQuality * 10`](./src/utils/score-calculator.ts) | 基于代码审查评分 |
| 近期活跃度 | 5分 | [`recentActivity * 5`](./src/utils/score-calculator.ts) | 基于最近30天活动 |

### 项目评分系统

项目评分采用多维度评估方法:

| 维度 | 权重 | 计算方式 | 说明 |
|------|------|----------|------|
| 关注者影响力 | 15分 | [`Math.log10(followers + 1) * 15`](./src/utils/score-calculator.ts) | 项目关注度 |
| Star影响力 | 35分 | [`Math.log10(totalStars + 1) * 35`](./src/utils/score-calculator.ts) | 最高权重指标 |
| 分叉活跃度 | 20分 | [`Math.log10(forks + 1) * 20`](./src/utils/score-calculator.ts) | 项目复用价值 |
| 贡献者规模 | 20分 | [`Math.log10(contributions + 1) * 20`](./src/utils/score-calculator.ts) | 社区活跃度 |
| 近期活跃度 | 10分 | [`recentActivity * 10`](./src/utils/score-calculator.ts) | 时间衰减计算 |

### 成就徽章系统

- 8种不同类型的徽章
- NFT形式发放
- 基于贡献度自动授予

### 社区背书机制

- 开发者互相背书
- 项目社区认可
- 信誉积分累积

## 技术架构

### 前端技术栈

- Next.js 14
- TypeScript
- TailwindCSS
- i18n 国际化

### 后端技术栈

- Supabase (PostgreSQL)
- GitHub API
- Movement 区块链
- Move 智能合约

## 创新点

- 链上声誉系统
  - 通过智能合约记录开发者贡献
  - 社区互信机制
  - 成就证明
- 多维度评估
  - 代码贡献
  - 社区影响力
  - 项目价值
- 激励机制
  - NFT徽章激励
  - 社区背书
  - 声誉积累

## 应用场景

- 开发者招聘
- 项目评估
- 社区治理
- 人才发现

## 未来规划

- 更多生态集成
- DAO治理机制
- 更丰富的激励模式
- 跨链互操作
