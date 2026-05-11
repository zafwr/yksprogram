import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Check ownership
    const session = await prisma.studySession.findUnique({
      where: { id },
    });

    if (!session || session.userId !== sessionUser.user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.studySession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Session Error:", error);
    return NextResponse.json({ error: "Oturum silinemedi." }, { status: 500 });
  }
}
