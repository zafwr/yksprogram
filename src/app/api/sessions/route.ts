import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDateStr = searchParams.get("start");
    const endDateStr = searchParams.get("end");
    const dateStr = searchParams.get("date");
    
    let whereClause: any = { userId: sessionUser.user.id };

    if (startDateStr && endDateStr) {
      whereClause.startTime = {
        gte: new Date(startDateStr),
        lte: new Date(endDateStr),
      };
    } else if (dateStr) {
      const date = new Date(dateStr);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      whereClause.startTime = {
        gte: date,
        lt: nextDay,
      };
    }

    const sessions = await prisma.studySession.findMany({
      where: whereClause,
      include: {
        subject: true,
        topic: true,
        result: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("GET Sessions Error:", error);
    return NextResponse.json({ error: "Oturumlar getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    const newSession = await prisma.studySession.create({
      data: {
        ...data,
        userId: sessionUser.user.id,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      },
      include: {
        subject: true,
        topic: true,
      }
    });
    return NextResponse.json(newSession);
  } catch (error) {
    console.error("POST Session Error:", error);
    return NextResponse.json({ error: "Oturum oluşturulamadı." }, { status: 500 });
  }
}
