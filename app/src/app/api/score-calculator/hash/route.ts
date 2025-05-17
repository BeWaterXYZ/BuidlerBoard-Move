import { ScoreCalculator } from "@/utils/score-calculator";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hash = ScoreCalculator.getCalculatorHash();
    
    return NextResponse.json({
      success: true,
      data: {
        hash,
        timestamp: Date.now(),
        description: "This hash represents the current scoring algorithm weights. It can be verified against the on-chain stored hash to ensure scoring consistency."
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate calculator hash",
      },
      { status: 500 }
    );
  }
} 