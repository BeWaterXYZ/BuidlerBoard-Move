import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { supabaseAdmin } from '@/lib/supabase-admin';


const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('body', body);

    // 解析 GitHub URL
    const { repoUrl } = body;
    
    if (!repoUrl) {
      return NextResponse.json(
        { 
          code: 400, 
          msg: 'Missing required parameter', 
          details: { 
            repoUrl: 'Repository URL is required'
          }
        },
        { status: 400 }
      );
    }

    // 解析 URL 获取 owner 和 repo
    try {
      const urlParts = new URL(repoUrl).pathname.split('/').filter(Boolean);
      if (urlParts.length < 2) {
        return NextResponse.json(
          { 
            code: 400, 
            msg: 'Invalid GitHub repository URL',
            details: { 
              repoUrl: 'URL must be in format: https://github.com/owner/repo'
            }
          },
          { status: 400 }
        );
      }
      
      const [owner, repo] = urlParts;
      console.log('Parsed repository:', { owner, repo });

      // 获取仓库信息
      const repoResponse = await octokit.repos.get({
        owner,
        repo,
      }).catch(error => {
        console.error('GitHub API error:', error);
        if (error.status === 404) {
          return { error: 'Repository not found' };
        }
        return { error: error.message };
      });

      if ('error' in repoResponse) {
        return NextResponse.json(
          { 
            code: 404, 
            msg: 'Repository not found',
            error: repoResponse.error 
          },
          { status: 404 }
        );
      }

      const { data: repoData } = repoResponse;

      // 获取贡献者信息
      const { data: contributors = [] } = await octokit.repos.listContributors({
        owner,
        repo,
      }).catch(() => ({ data: [] }));

      // 获取语言信息
      const { data: languages = {} } = await octokit.repos.listLanguages({
        owner,
        repo,
      }).catch(() => ({ data: {} }));

      console.log('Saving to database:', repoData.full_name);

      // 保存到数据库
      const { data, error } = await supabaseAdmin
        .from('repositories')
        .upsert({
          id: repoData.id,
          reponame: repoData.full_name,
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

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // 保存贡献者信息
      if (contributors.length > 0) {
        const contributorsData = contributors.map(c => ({
          repository_id: repoData.id,
          login: c.login,
          avatar_url: c.avatar_url,
        }));

        const { error: contribError } = await supabaseAdmin
          .from('repository_contributors')
          .upsert(contributorsData);

        if (contribError) {
          console.error('Error saving contributors:', contribError);
          throw contribError;
        }
      }

      return NextResponse.json({
        code: 0,
        msg: 'success',
        data
      });
    } catch (error) {
      console.error('Error parsing repository URL:', error);
      return NextResponse.json(
        { 
          code: 400, 
          msg: 'Failed to parse repository URL',
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error importing project:', error);
    return NextResponse.json(
      { 
        code: 500, 
        msg: 'Failed to import project',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
} 