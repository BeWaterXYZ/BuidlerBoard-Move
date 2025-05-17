import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import type { Repository } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    // 获取 URL 参数
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const name = searchParams.get('name');

    if (!owner || !name) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 从数据库获取项目信息
    const { data: project, error } = await supabaseAdmin
      .from('repositories')
      .select(`
        id,
        reponame,
        name,
        description,
        languages,
        stargazers_count,
        forks_count,
        topics,
        updated_at,
        contributors:repository_contributors(
          login,
          avatar_url
        ),
        blockchain_tx,
        score
      `)
      .eq('reponame', `${owner}/${name}`)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      console.error('Query parameters:', { owner, name });
      console.error('Full error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch project data', details: error },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // 转换数据以匹配 Repository 接口
    const formattedProject: Repository = {
      ...project,
      contributors: project.contributors?.map(contributor => ({
        ...contributor,
        html_url: `https://github.com/${contributor.login}`,
        total_stars: 0,
        followers: 0,
        bio: null,
        popular_repo: {
          html_url: '',
          name: '',
          description: null,
          languages: []
        }
      })) || [],
      badges: [], // 暂时返回空数组，后续从合约中获取
      endorsements: [], // 暂时返回空数组，后续从合约中获取
    };

    return NextResponse.json(formattedProject);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.error('Full error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 