import { generateBadgeSVG } from '@/utils/badge-generator';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const badgeType = parseInt(params.type);
    const name = getBadgeName(badgeType);
    
    const svg = generateBadgeSVG(badgeType, name);
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Error generating badge:', error);
    return NextResponse.json(
      { error: 'Failed to generate badge' },
      { status: 500 }
    );
  }
}

function getBadgeName(type: number): string {
  switch (type) {
    case 1: return 'Star Contributor';
    case 2: return 'Active Developer';
    case 3: return 'Community Leader';
    case 4: return 'Code Master';
    default: return 'Unknown Badge';
  }
} 