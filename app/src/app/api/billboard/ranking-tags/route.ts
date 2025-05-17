import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 获取所有生态系统和领域标签
    const { data: repositories, error } = await supabase
      .from('repositories')
      .select('ecosystem, sector')
      .not('ecosystem', 'is', null)
      .not('sector', 'is', null);

    if (error) throw error;
    // 提取唯一的标签
    const ecosystems = Array.from(new Set(repositories.map(r => r.ecosystem)));
    const sectors = Array.from(new Set(repositories.map(r => r.sector)));

    return NextResponse.json({
      code: 0,
      msg: 'success',
      data: {
        ecosystems,
        sectors
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { code: 500, msg: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 