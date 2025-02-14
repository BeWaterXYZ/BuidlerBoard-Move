export interface ScoreFactors {
  followers: number;
  totalStars: number;
  publicRepos?: number;
  contributions?: number;
  forks?: number;
  recentActivity?: number;
  pullRequests?: number;
  issuesResolved?: number;
  codeQuality?: number;
  crossChainContrib?: number;
}

export class ScoreCalculator {
  // 开发者评分算法
  static calculateDeveloperScore(factors: ScoreFactors): number {
    const {
      followers,
      totalStars,
      publicRepos,
      contributions,
      recentActivity,
      pullRequests = 0,
      issuesResolved = 0,
      codeQuality = 0,
    } = factors;

    // 全面的评分算法
    const baseScore =
      Math.log10(followers + 1) * 15 + // 社区影响力
      Math.log10(totalStars + 1) * 25 + // 项目受欢迎度
      Math.log10((contributions || 0) + 1) * 20 + // 贡献活跃度
      Math.log10(pullRequests + 1) * 15 + // 代码贡献
      Math.log10(issuesResolved + 1) * 10 + // 问题解决能力
      codeQuality * 10 + // 代码质量
      (recentActivity || 0) * 5; // 近期活跃度

    return Math.min(Math.round(baseScore), 100);
  }

  // 项目评分算法
  static calculateProjectScore(factors: ScoreFactors): number {
    const {
      followers = 0, // 项目关注者
      totalStars,
      forks = 0,
      contributions = 0, // 贡献者数量
      recentActivity = 0,
    } = factors;

    // 基础分数计算
    const baseScore =
      Math.log10(followers + 1) * 15 + // 关注者权重
      Math.log10(totalStars + 1) * 35 + // star 权重
      Math.log10(forks + 1) * 20 + // fork 权重
      Math.log10(contributions + 1) * 20 + // 贡献者权重
      recentActivity * 10; // 最近活跃度权重

    // 归一化到 0-100 分
    return Math.min(Math.round(baseScore), 100);
  }

  // 计算最近活跃度 (0-1)
  static calculateRecentActivity(lastUpdateTime: string): number {
    const now = new Date();
    const lastUpdate = new Date(lastUpdateTime);
    const daysDiff =
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    // 30天内递减
    return Math.max(0, 1 - daysDiff / 30);
  }
}
