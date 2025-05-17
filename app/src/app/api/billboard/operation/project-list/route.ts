import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { BuilderboardProject } from '@/services/leaderboard';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const ecosystem = searchParams.get('ecosystem');
    const sector = searchParams.get('sector');

    console.log('Request params:', { limit, ecosystem, sector });

    // 检查数据库连接
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('repositories')
      .select('count')
      .limit(1)
      .single();

    if (connectionError) {
      console.error('Database connection error:', connectionError);
      return NextResponse.json(
        {
          code: 500,
          msg: 'Database connection error',
          error: connectionError.message,
          details: connectionError
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

    console.log('Building query with filters:', { ecosystem, sector });

    if (ecosystem && ecosystem !== '') {
      query = query.eq('ecosystem', ecosystem);
    }
    if (sector && sector !== '') {
      query = query.eq('sector', sector);
    }

    query = query.limit(limit);

    const { data: projects, error: queryError } = await query;
    
    if (queryError) {
      console.error('Query error:', queryError);
      return NextResponse.json(
        {
          code: 500,
          msg: 'Query failed',
          error: queryError.message,
          details: queryError
        },
        { status: 500 }
      );
    }

    if (!projects) {
      return NextResponse.json({
        code: 0,
        msg: 'success',
        data: [],
      });
    }

    console.log(`Found ${projects.length} projects`);

    const formattedProjects = projects.map(project => ({
      repoName: project.reponame,
      name: project.name,
      description: project.description || '',
      languages: project.languages || [],
      stargazers_count: project.stargazers_count || 0,
      forks_count: project.forks_count || 0,
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
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        code: 500,
        msg: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
} 