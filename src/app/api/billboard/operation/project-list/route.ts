import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { BuilderboardProject } from '@/services/leaderboard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const ecosystem = searchParams.get('ecosystem');
  const sector = searchParams.get('sector');

  try {
    // 先检查表是否存在
    const { error: checkError } = await supabaseAdmin
      .from('repositories')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { 
          code: 500, 
          msg: 'Database connection error',
          error: checkError.message 
        },
        { status: 500 }
      );
    }

    let query = supabaseAdmin
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
        ecosystem,
        sector,
        updated_at,
        contributors:repository_contributors(
          login,
          avatar_url
        )
      `)
      .order('score', { ascending: false });

    if (ecosystem) {
      query = query.eq('ecosystem', ecosystem);
    }
    if (sector) {
      query = query.eq('sector', sector);
    }

    query = query.limit(limit);

    const { data: projects, error } = await query;
    
    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        { 
          code: 500, 
          msg: 'Query failed',
          error: error.message 
        },
        { status: 500 }
      );
    }

    // 格式化返回数据以匹配 BuilderboardProject 接口
    const formattedProjects = projects?.map(project => ({
      repoName: project.reponame,
      name: project.name,
      description: project.description || '',
      languages: project.languages || [],
      stargazers_count: project.stargazers_count,
      forks_count: project.forks_count,
      topics: project.topics || [],
      updated_at: project.updated_at,
      contributors: project.contributors || []
    }));

    return NextResponse.json({
      code: 0,
      msg: 'success',
      data: formattedProjects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { 
        code: 500, 
        msg: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 