import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import type { Developer } from '@/types/supabase';

export async function GET(request: Request) {
  try {
    // 获取 URL 参数
    const { searchParams } = new URL(request.url);
    const login = searchParams.get('login');

    if (!login) {
      return NextResponse.json(
        { error: 'Missing login parameter' },
        { status: 400 }
      );
    }

    // 从数据库获取开发者信息
    const { data: developer, error } = await supabaseAdmin
      .from('developers')
      .select(`
        id,
        login,
        html_url,
        avatar_url,
        bio,
        total_stars,
        followers,
        popular_repo,
        created_at,
        updated_at
      `)
      .eq('login', login)
      .single();

    if (error) {
      console.error('Error fetching developer:', error);
      console.error('Query parameter:', { login });
      console.error('Full error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch developer data', details: error },
        { status: 500 }
      );
    }

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    // 转换数据以匹配 Developer 接口
    const formattedDeveloper: Developer = {
      ...developer,
      badges: [], // 暂时返回空数组，后续从合约中获取
      endorsements: [] // 暂时返回空数组，后续从合约中获取
    };

    return NextResponse.json(formattedDeveloper);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    console.error('Full error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 