import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Export all data as JSON
export async function GET() {
  try {
    const [users, subjects, topics, sessions, results, exams] = await Promise.all([
      prisma.user.findMany(),
      prisma.subject.findMany(),
      prisma.topic.findMany(),
      prisma.studySession.findMany({ include: { result: true } }),
      prisma.studyResult.findMany(),
      prisma.mockExam.findMany(),
    ]);

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: { users, subjects, topics, sessions, results, exams },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="yks-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Yedek alınamadı." }, { status: 500 });
  }
}
