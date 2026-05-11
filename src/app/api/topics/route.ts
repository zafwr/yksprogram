import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, subjectId } = await req.json();

    // Verify subject ownership
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, userId: session.user.id }
    });

    if (!subject) {
      return NextResponse.json({ error: "Unauthorized subject" }, { status: 403 });
    }

    const newTopic = await prisma.topic.create({
      data: {
        name,
        subjectId,
      },
    });
    return NextResponse.json(newTopic);
  } catch (error) {
    console.error("POST Topic Error:", error);
    return NextResponse.json({ error: "Konu oluşturulamadı." }, { status: 500 });
  }
}
