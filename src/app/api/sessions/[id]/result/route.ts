import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const { correctCount, wrongCount, emptyCount } = await req.json();

    const solvedCount = correctCount + wrongCount + emptyCount;
    const netScore = correctCount - (wrongCount / 4);

    // Update session status to COMPLETED
    await prisma.studySession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" },
    });

    // Upsert StudyResult
    const result = await prisma.studyResult.upsert({
      where: { sessionId },
      update: {
        solvedCount,
        correctCount,
        wrongCount,
        emptyCount,
        netScore,
      },
      create: {
        sessionId,
        solvedCount,
        correctCount,
        wrongCount,
        emptyCount,
        netScore,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Result save error:", error);
    return NextResponse.json({ error: "Sonuç kaydedilemedi." }, { status: 500 });
  }
}
