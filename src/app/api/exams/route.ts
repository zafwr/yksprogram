import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// TYT subject definitions: field prefix, label, max questions
export const TYT_SUBJECTS = [
  { key: "turkce",    label: "Türkçe",    max: 40 },
  { key: "tarih",     label: "Tarih",     max: 5  },
  { key: "cografya",  label: "Coğrafya",  max: 5  },
  { key: "din",       label: "Din",       max: 5  },
  { key: "felsefe",   label: "Felsefe",   max: 5  },
  { key: "matematik", label: "Matematik", max: 40 },
  { key: "fizik",     label: "Fizik",     max: 7  },
  { key: "kimya",     label: "Kimya",     max: 7  },
  { key: "biyoloji",  label: "Biyoloji",  max: 6  },
];

export async function GET(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const exams = await prisma.mockExam.findMany({
      where: { userId: sessionUser.user.id },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(exams);
  } catch (error) {
    console.error("GET Exams Error:", error);
    return NextResponse.json({ error: "Denemeler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Build per-subject fields
    const subjectFields: any = {};
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalEmpty = 0;

    for (const subject of TYT_SUBJECTS) {
      const c = parseInt(data[`${subject.key}Correct`]) || 0;
      const w = parseInt(data[`${subject.key}Wrong`])   || 0;
      const e = parseInt(data[`${subject.key}Empty`])   || 0;
      subjectFields[`${subject.key}Correct`] = c;
      subjectFields[`${subject.key}Wrong`]   = w;
      subjectFields[`${subject.key}Empty`]   = e;
      totalCorrect += c;
      totalWrong   += w;
      totalEmpty   += e;
    }

    // If type is not TYT fall back to manual totals
    if (data.type !== "TYT") {
      totalCorrect = parseInt(data.correctCount) || 0;
      totalWrong   = parseInt(data.wrongCount)   || 0;
      totalEmpty   = parseInt(data.emptyCount)   || 0;
    }

    const netScore = totalCorrect - (totalWrong / 4);

    const exam = await prisma.mockExam.create({
      data: {
        userId: sessionUser.user.id,
        title: data.title,
        type:  data.type,
        date:  new Date(data.date),
        correctCount: totalCorrect,
        wrongCount:   totalWrong,
        emptyCount:   totalEmpty,
        netScore,
        ...(data.type === "TYT" ? subjectFields : {}),
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Exam POST error:", error);
    return NextResponse.json({ error: "Deneme eklenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

    // Ensure the exam belongs to the user
    const exam = await prisma.mockExam.findFirst({
      where: { id, userId: sessionUser.user.id }
    });

    if (!exam) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.mockExam.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exam DELETE error:", error);
    return NextResponse.json({ error: "Deneme silinemedi." }, { status: 500 });
  }
}
