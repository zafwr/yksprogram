import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      include: {
        topics: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("GET Subjects Error:", error);
    return NextResponse.json({ error: "Dersler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, category } = await req.json();
    const newSubject = await prisma.subject.create({
      data: {
        name,
        category,
        userId: session.user.id,
      },
    });
    return NextResponse.json(newSubject);
  } catch (error) {
    console.error("POST Subject Error:", error);
    return NextResponse.json({ error: "Ders oluşturulamadı." }, { status: 500 });
  }
}
