# Move Buidlerboard

* [实现一个 On-Chain-Buidlerboard | Day 0x01](https://mp.weixin.qq.com/s/q0aBE4kOB5wLPBottwKC6Q)
* [编写 3 页版本的 Hackathon Deck | Day 0x02](https://mp.weixin.qq.com/s/RSIenqRDlj2SS-cSv6qwCg)

English | [中文](./README_CN.md)

> Special thanks to `Fynn` for development contributions and `Olab` for translation work.

## Overview

Move BuilderBoard is a fully on-chain Hackathon system built on the Aptos Framework. Its vision is to foster a thriving Hackathon ecosystem through complete transparency of Hackathons and Projects.

* dApp: https://buidlerboard.rootmud.xyz/
* 🎥 Introduction Video: https://youtu.be/1yXJgPMLiWw
* 📚 Deck: https://drive.google.com/file/d/1GZDbdefXtveXMbsTflgztjnom7XqX_jM/view
* 📜 Smart Contract: https://explorer.aptoslabs.com/account/0x9e0d5b6616485c40ce93f66e586a73cc433b63d36769554c36a57208b4aa440f/modules/code/buidlerboard/add_project?network=testnet

## Core Concept

The proliferation of "Hackathon Hunters" and the lack of transparency in Hackathon judging have become core issues in current Hackathons, leading to a decline in the credibility of Hackathon events.

Through a fully on-chain Buidlerboard, we aim to make projects and Hackathons completely transparent, addressing these core issues and building a decentralized, healthy Hackathon ecosystem.

## Core Features

* Hackathon Holders can initiate Hackathons on-chain and add judge accounts to the Hackathon
* Builders can submit Projects to the Buidlerboard and then submit them to on-chain Hackathons
* Hackathon Holders disclose Hackathon results and project evaluations
* Ranking algorithm developers can submit sorting algorithms, and the dApp ranks projects using the loaded algorithms
  * **Example 1:** Sorted by star count
  * **Example 2:** Sorted by the project publisher’s address balance

## Technical Architecture

### Frontend Stack

- Next.js 14
- TypeScript
- TailwindCSS

### Backend Stack

- GitHub API
- Aptos Framework
- Move Smart Contract
- Supabase (PostgreSQL)

## Future Plans

- Support for more ranking algorithms
- Donation functionality
- User experience optimization