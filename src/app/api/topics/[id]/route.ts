import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Find topic and ensure it belongs to user via subject
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: { subject: true }
    });

    if (!topic || topic.subject.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.topic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Topic Error:", error);
    return NextResponse.json({ error: "Konu silinemedi." }, { status: 500 });
  }
}
