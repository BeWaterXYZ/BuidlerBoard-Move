# Move Buidlerboard

* [实现一个 On-Chain-Buidlerboard | Day 0x01](https://mp.weixin.qq.com/s/q0aBE4kOB5wLPBottwKC6Q)
* [编写 3 页版本的 Hackathon Deck | Day 0x02](https://mp.weixin.qq.com/s/RSIenqRDlj2SS-cSv6qwCg)

English | [中文](./README.md)

> Special thanks to `Fynn` for development contributions and `Olab` for translation work.

## 0x01 Overview

Move BuilderBoard is a fully on-chain Hackathon system built on the Aptos Framework. Its vision is to foster a thriving Hackathon ecosystem through complete transparency of Hackathons and Projects.

* dApp: https://buidlerboard.rootmud.xyz/
* 🎥 Introduction Video: https://youtu.be/1yXJgPMLiWw
* 📚 Deck:  [Deck](./Deck_250718.pdf)
* 📜 Smart Contract: https://explorer.aptoslabs.com/account/0x9e0d5b6616485c40ce93f66e586a73cc433b63d36769554c36a57208b4aa440f/modules/code/buidlerboard/add_project?network=testnet

## 0x02 Project Highlights and Innovations

### Core Idea

The issues of "Hackathon Hunter Proliferation" and "Lack of Transparency in Hackathon Judging" have become the central problems of current hackathons. These problems have further led to a decline in the credibility of hackathon events.

By introducing a fully on-chain Buidlerboard, we bring transparency to projects and hackathons, solving core issues and building a decentralized, healthy hackathon ecosystem.

### Core Features

* Hackathon Holders launch hackathons on-chain and add judge accounts to the hackathon.
* Buidlers submit projects to Buidlerboard and then to the on-chain hackathon.
* Hackathon Holders disclose hackathon results and project evaluations.
* Sorting algorithm developers can submit sorting algorithms. The dApp ranks projects using the loaded algorithms.
  * **Example 1:** Sort by number of stars
  * **Example 2:** Sort by the balance of the project creator's address

## 0x03 Technical Architecture

### Frontend Stack

- Next.js 14
- TypeScript
- TailwindCSS

### Backend Stack

- GitHub API
- Aptos Framework
- Move Smart Contract
- Supabase (PostgreSQL)

## 0x04 Installation and Running Guide

```
$ git clone git@github.com:BeWaterXYZ/BuidlerBoard-Move.git
$ cd dapp
$ yarn
$ cp .env.local.example .env.local
$ yarn dev
```

Then visit: `https://localhost:3000`.

## 0x05 Roadmap

- Support for more sorting algorithms

- Support donations in more tokens

- Commenting on hackathons

- Support for multi-chain wallet login