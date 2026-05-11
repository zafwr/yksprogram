import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { sessionId, solvedCount, correctCount, wrongCount, emptyCount } = data;

    // Calculate net score
    const netScore = correctCount - (wrongCount / 4);

    const result = await prisma.$transaction(async (tx) => {
      // Create result
      const studyResult = await tx.studyResult.create({
        data: {
          sessionId,
          solvedCount,
          correctCount,
          wrongCount,
          emptyCount,
          netScore,
        },
      });

      // Update session status
      await tx.studySession.update({
        where: { id: sessionId },
        data: { status: "COMPLETED" },
      });

      return studyResult;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Sonuç kaydedilemedi." }, { status: 500 });
  }
}
