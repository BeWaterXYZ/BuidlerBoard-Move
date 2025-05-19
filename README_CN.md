# Move Buidlerboard

[English](./README.md) | 中文

> 感谢 `Fynn` 参与开发工作，感谢 `Olab` 参与翻译工作。

## 概述

Move BuilderBoard 是一个基于 Aptos Framework 的完全链上的 Hackathon 系统，其愿景是通过 Hackathons 和 Projects 的完全透明，让 Hackathon 生态繁荣。

* dApp: https://buidlerboard.rootmud.xyz/
* 🎥  介绍视频: https://youtu.be/1yXJgPMLiWw
* 📚 Deck: https://drive.google.com/file/d/1GZDbdefXtveXMbsTflgztjnom7XqX_jM/view
* 📜 智能合约: https://explorer.aptoslabs.com/account/0x9e0d5b6616485c40ce93f66e586a73cc433b63d36769554c36a57208b4aa440f/modules/code/buidlerboard/add_project?network=testnet

## 核心观点

「Hackathon Hunter 泛滥」与「 Hackathon 评选不透明」已经成为目前 Hackathons 的核心问题，这些问题进一步导致了目前 Hackathon 活动的公信力下降。

通过 完全链上 的 Buidlerboard，让项目公开透明，让 Hackathon 全程公开透明，解决核心问题，构建去中心化的、健康发展的 Hackathon 生态。

## 核心功能

* Hackathon Hodlers 在链上发起 Hackathon，添加评委账号到 Hackathon
* Buidlers 提交 Projects 到 Buidlerboard，然后将 Projects 提交到链上 Hackathon
* Hackathon Hodlers 披露 Hackathon 结果与项目评价
* 排序算法开发者提交排序算法，dApp 通过加载的排序算法进行排序

## 技术架构

### 前端技术栈

- Next.js 14
- TypeScript
- TailwindCSS

### 后端技术栈

- GitHub API
- Aptos Framework
- Move Smart Contract
- Supabase (PostgreSQL)

## 未来规划

- 更多排序算法支持
- 捐赠功能
- 优化用户体验
