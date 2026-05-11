import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: Reset all user data
export async function POST() {
  try {
    // Delete in dependency order
    await prisma.studyResult.deleteMany();
    await prisma.studySession.deleteMany();
    await prisma.mockExam.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();

    return NextResponse.json({ success: true, message: "Tüm veriler silindi." });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Sıfırlama başarısız." }, { status: 500 });
  }
}
