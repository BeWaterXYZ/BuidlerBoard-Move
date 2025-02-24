# Builder Board

English | [中文](./README.md)

## Overview

BuilderBoard is a developer contribution tracking and incentive platform based on the Movement blockchain. It records developer and project contribution data through smart contracts to implement community incentives and achievement certification.

## Table of Contents

- [Core Features](#core-features)
  - [Developer Rating System](#developer-rating-system)
  - [Project Rating System](#project-rating-system)
  - [Achievement Badge System](#achievement-badge-system)
  - [Community Endorsement](#community-endorsement)
- [Technical Architecture](#technical-architecture)
- [Innovations](#innovations)
- [Use Cases](#use-cases)
- [Future Plans](#future-plans)

## Core Features

### Developer Rating System

The platform tracks and evaluates developer contributions through:

- GitHub activity data tracking (stars, followers, etc.)
- Comprehensive contribution score calculation
- On-chain rating data recording

#### Rating Dimensions and Weights

| Dimension | Weight | Calculation | Description |
|-----------|--------|-------------|-------------|
| Community Impact | 15pts | [`Math.log10(followers + 1) * 15`](./src/utils/score-calculator.ts) | Based on followers count |
| Project Popularity | 25pts | [`Math.log10(totalStars + 1) * 25`](./src/utils/score-calculator.ts) | Based on total stars received |
| Contribution Activity | 20pts | [`Math.log10(contributions + 1) * 20`](./src/utils/score-calculator.ts) | Based on contribution count |
| Code Contribution | 15pts | [`Math.log10(pullRequests + 1) * 15`](./src/utils/score-calculator.ts) | Based on PR count |
| Problem Solving | 10pts | [`Math.log10(issuesResolved + 1) * 10`](./src/utils/score-calculator.ts) | Based on resolved issues |
| Code Quality | 10pts | [`codeQuality * 10`](./src/utils/score-calculator.ts) | Based on code review score |
| Recent Activity | 5pts | [`recentActivity * 5`](./src/utils/score-calculator.ts) | Based on 30-day activity |

### Project Rating System

Project rating uses a multi-dimensional evaluation approach:

| Dimension | Weight | Calculation | Description |
|-----------|--------|-------------|-------------|
| Follower Impact | 15pts | [`Math.log10(followers + 1) * 15`](./src/utils/score-calculator.ts) | Project following |
| Star Impact | 35pts | [`Math.log10(totalStars + 1) * 35`](./src/utils/score-calculator.ts) | Highest weight indicator |
| Fork Activity | 20pts | [`Math.log10(forks + 1) * 20`](./src/utils/score-calculator.ts) | Project reuse value |
| Contributor Scale | 20pts | [`Math.log10(contributions + 1) * 20`](./src/utils/score-calculator.ts) | Community activity |
| Recent Activity | 10pts | [`recentActivity * 10`](./src/utils/score-calculator.ts) | Time decay calculation |

### Achievement Badge System

- 8 different types of badges
- NFTs [manually issued](./move/sources/github_score.move)
- Based on developer contribution assessment

### Community Endorsement

- [Developer mutual endorsement](./move/sources/github_score.move)
- Project community recognition

## Technical Architecture

### Frontend Stack

- Next.js 14
- TypeScript
- TailwindCSS
- i18n internationalization

### Backend Stack

- Supabase (PostgreSQL)
- GitHub API
- Movement Blockchain
- Move Smart Contracts

## Innovations

- On-chain Reputation System
  - Developer contributions recorded via smart contracts
  - Community trust mechanism
  - Achievement proof
- Algorithm Transparency Verification
  - Scoring algorithm hash stored on-chain
  - Real-time hash verification API
  - Ensures algorithm fairness and consistency
- Multi-dimensional Evaluation
  - Code contributions
  - Community impact
  - Project value
- Incentive Mechanism
  - NFT badge incentives
  - Community endorsement
  - Reputation accumulation

## Use Cases

- Developer recruitment
- Project evaluation
- Community governance
- Talent discovery

## Future Plans

- More ecosystem integrations
  - MoveDID integration
  - Automatic NFT badge issuance
  - More on-chain identity verification
- DAO governance mechanism
- Enhanced incentive models
- Cross-chain interoperability 