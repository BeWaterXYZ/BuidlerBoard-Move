import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
});

export async function POST(request: Request) {
  try {
    const { owner, repo } = await request.json();

    // 获取仓库信息
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });

    // 获取贡献者信息
    const { data: contributors } = await octokit.repos.listContributors({
      owner,
      repo,
    });

    // 获取语言信息
    const { data: languages } = await octokit.repos.listLanguages({
      owner,
      repo,
    });

    // 保存到数据库
    const { data, error } = await supabase
      .from('repositories')
      .upsert({
        id: repoData.id,
        repoName: repoData.full_name,
        name: repoData.name,
        description: repoData.description,
        languages: Object.keys(languages),
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
        topics: repoData.topics || [],
        ecosystem: null,
        sector: null,
        updated_at: repoData.updated_at,
        score: 0,
        blockchain_tx: null,
        badges: [],
        endorsements: []
      })
      .select()
      .single();

    if (error) throw error;

    // 保存贡献者信息
    if (contributors.length > 0) {
      const contributorsData = contributors.map(c => ({
        repository_id: repoData.id,
        login: c.login,
        avatar_url: c.avatar_url,
      }));

      const { error: contribError } = await supabase
        .from('repository_contributors')
        .upsert(contributorsData);

      if (contribError) throw contribError;
    }

    return NextResponse.json({
      code: 0,
      msg: 'success',
      data
    });
  } catch (error) {
    console.error('Error importing project:', error);
    return NextResponse.json(
      { code: 500, msg: 'Failed to import project' },
      { status: 500 }
    );
  }
} 