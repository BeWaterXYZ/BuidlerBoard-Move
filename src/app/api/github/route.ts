import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Developer, Repository } from '@/types/supabase';
import { Octokit } from '@octokit/rest';
import { ScoreCalculator } from '@/utils/score-calculator';
import { BlockchainService } from '@/services/blockchain';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
const blockchainService = new BlockchainService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '100');
  const ecosystem = searchParams.get('ecosystem');
  const sector = searchParams.get('sector');

  try {
    let query;
    
    switch (type) {
      case 'developer-list':
        query = supabase
          .from('developers')
          .select('*')
          .order('followers', { ascending: false })
          .limit(limit);

        // 添加生态系统和领域过滤
        if (ecosystem) {
          query = query.eq('ecosystem', ecosystem);
        }
        if (sector) {
          query = query.eq('sector', sector);
        }

        const { data: developers, error: devError } = await query;
        if (devError) throw devError;

        return NextResponse.json({ 
          data: developers as Developer[] 
        });

      case 'project-list':
        query = supabase
          .from('repositories')
          .select(`
            *,
            contributors:repository_contributors(login, avatar_url)
          `)
          .order('stargazers_count', { ascending: false })
          .limit(limit);

        if (ecosystem) {
          query = query.eq('ecosystem', ecosystem);
        }
        if (sector) {
          query = query.eq('sector', sector);
        }

        const { data: projects, error: projError } = await query;
        if (projError) throw projError;

        return NextResponse.json({ 
          data: projects as Repository[] 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();
    
    // 获取仓库数据
    const repoData = await fetchGitHubRepoData(repoUrl);
    
    // 计算项目分数
    const projectScore = ScoreCalculator.calculateProjectScore({
      followers: 0, // 需要从 API 获取
      totalStars: repoData.stargazers_count,
      forks: repoData.forks_count,
      contributions: repoData.contributors.length,
      recentActivity: ScoreCalculator.calculateRecentActivity(repoData.updated_at)
    });

    // 上传到区块链
    const txHash = await blockchainService.uploadProjectData(repoData, projectScore);

    // 保存到 Supabase，添加分数和交易哈希
    const { error } = await supabase
      .from('repositories')
      .upsert({
        ...repoData,
        score: projectScore,
        blockchain_tx: txHash
      });

    if (error) throw error;

    // 处理贡献者数据
    for (const contributor of repoData.contributors) {
      const developerScore = ScoreCalculator.calculateDeveloperScore({
        followers: contributor.followers,
        totalStars: contributor.total_stars,
        contributions: 1,
        recentActivity: ScoreCalculator.calculateRecentActivity(new Date().toISOString())
      });

      // 上传开发者数据到区块链
      const devTxHash = await blockchainService.uploadDeveloperData(
        {
          ...contributor,
          id: parseInt(contributor.login.replace(/\D/g, '') || '0'), // 从 login 生成一个数字 ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Developer,
        developerScore
      );

      // 保存开发者数据到 Supabase
      await supabase
        .from('developers')
        .upsert({
          ...contributor,
          id: parseInt(contributor.login.replace(/\D/g, '') || '0'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          score: developerScore,
          blockchain_tx: devTxHash
        });
    }

    return NextResponse.json({ 
      data: {
        ...repoData,
        score: projectScore,
        blockchain_tx: txHash
      },
      success: true 
    });
  } catch (error) {
    console.error('Error importing project:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

async function fetchGitHubUserData(username: string): Promise<Developer> {
  try {
    // 获取用户基本信息
    const { data: userData } = await octokit.users.getByUsername({
      username,
    });

    // 获取用户的仓库列表
    const { data: repos } = await octokit.repos.listForUser({
      username,
      sort: 'updated', 
      direction: 'desc',
      per_page: 100,
    });

    // 按 stars 手动排序
    const sortedRepos = [...repos].sort((a, b) => 
      (b.stargazers_count || 0) - (a.stargazers_count || 0)
    );

    // 计算总 star 数
    const totalStars = sortedRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

    // 获取最受欢迎的仓库（star 数最多的）
    const popularRepo = sortedRepos[0];
    
    // 获取最受欢迎仓库的语言统计
    const { data: languagesData } = await octokit.repos.listLanguages({
      owner: username,
      repo: popularRepo.name,
    });

    // 计算语言百分比
    const totalBytes = Object.values(languagesData).reduce((a, b) => a + b, 0);
    const languages = Object.entries(languagesData).map(([name, bytes]) => ({
      name,
      percentage: Number(((bytes / totalBytes) * 100).toFixed(2)),
    }));

    const developer: Developer = {
      id: userData.id,
      html_url: userData.html_url,
      avatar_url: userData.avatar_url,
      login: userData.login,
      total_stars: totalStars,
      followers: userData.followers,
      bio: userData.bio,
      popular_repo: {
        html_url: popularRepo.html_url,
        name: popularRepo.name,
        description: popularRepo.description,
        languages,
      },
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    return developer;
  } catch (error) {
    console.error('Error fetching GitHub user data:', error);
    throw new Error('Failed to fetch developer data from GitHub');
  }
}

async function fetchGitHubRepoData(repoUrl: string): Promise<Repository> {
  // 从 URL 提取 owner 和 repo
  const urlParts = repoUrl.split('/');
  const owner = urlParts[urlParts.length - 2];
  const repo = urlParts[urlParts.length - 1];

  try {
    // 获取仓库信息
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    // 获取仓库语言信息
    const { data: languagesData } = await octokit.repos.listLanguages({
      owner,
      repo,
    });

    // 获取贡献者信息（前5名）并同时获取每个贡献者的详细信息
    const { data: contributorsData } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 5,
    });

    // 并行获取所有贡献者的详细信息
    const contributorsPromises = contributorsData
      .filter((contributor): contributor is { 
        login: string; 
        avatar_url: string;
        type: string;
        contributions: number;
      } => {
        return Boolean(contributor?.login && contributor?.avatar_url);
      })
      .map(async (contributor) => {
        const developerData = await fetchGitHubUserData(contributor.login);
        return {
          login: developerData.login,
          avatar_url: developerData.avatar_url,
          html_url: developerData.html_url,
          total_stars: developerData.total_stars,
          followers: developerData.followers,
          bio: developerData.bio,
          popular_repo: developerData.popular_repo,
        };
      });

    const contributors = await Promise.all(contributorsPromises);

    // 转换语言数据为字符串数组
    const languages = Object.keys(languagesData);

    // 构造返回数据
    const repository: Repository = {
      id: repoData.id,
      repoName: repoData.full_name,
      name: repoData.name,
      description: repoData.description,
      languages,
      stargazers_count: repoData.stargazers_count,
      forks_count: repoData.forks_count,
      topics: repoData.topics || [],
      updated_at: repoData.updated_at,
      contributors,
    };

    return repository;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw new Error('Failed to fetch repository data from GitHub');
  }
} 