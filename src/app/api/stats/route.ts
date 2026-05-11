import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all study results for the user's sessions
    const results = await prisma.studyResult.findMany({
      where: {
        session: {
          userId: sessionUser.user.id
        }
      },
      include: {
        session: {
          include: {
            subject: true,
            topic: true
          }
        }
      }
    });

    // Aggregate by topic
    const topicStatsMap = new Map();

    results.forEach(result => {
      const topicId = result.session.topicId;
      if (!topicStatsMap.has(topicId)) {
        topicStatsMap.set(topicId, {
          topicId: topicId,
          topicName: result.session.topic.name,
          subjectName: result.session.subject.name,
          solvedCount: 0,
          correctCount: 0,
          wrongCount: 0,
          emptyCount: 0,
          netScore: 0,
        });
      }

      const stat = topicStatsMap.get(topicId);
      stat.solvedCount += result.solvedCount;
      stat.correctCount += result.correctCount;
      stat.wrongCount += result.wrongCount;
      stat.emptyCount += result.emptyCount;
      stat.netScore += result.netScore;
    });

    const aggregatedStats = Array.from(topicStatsMap.values());

    // Sort by subjectName then topicName
    aggregatedStats.sort((a, b) => {
      if (a.subjectName !== b.subjectName) {
        return a.subjectName.localeCompare(b.subjectName);
      }
      return a.topicName.localeCompare(b.topicName);
    });

    return NextResponse.json(aggregatedStats);
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "İstatistikler getirilemedi." }, { status: 500 });
  }
}
