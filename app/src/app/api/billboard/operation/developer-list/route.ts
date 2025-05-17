import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { BuilderboardDeveloper } from '@/services/leaderboard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const ecosystem = searchParams.get('ecosystem');
  const sector = searchParams.get('sector');

  try {
    // 先检查表是否存在
    const { error: checkError } = await supabaseAdmin
      .from('developers')
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

    const { data: developers, error } = await supabaseAdmin
      .from('developers')
      .select(`
        id,
        login,
        html_url,
        avatar_url,
        bio,
        followers,
        total_stars,
        popular_repo,
        created_at,
        updated_at
      `)
      .order('score', { ascending: false })
      .limit(limit);

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

    return NextResponse.json({
      code: 0,
      msg: 'success',
      data: developers,
    });
  } catch (error) {
    console.error('Error fetching developers:', error);
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