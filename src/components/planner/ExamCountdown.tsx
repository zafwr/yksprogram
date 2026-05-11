"use client"

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays } from "date-fns";

export function ExamCountdown() {
  const [daysLeftTYT, setDaysLeftTYT] = useState(0);
  const [daysLeftAYT, setDaysLeftAYT] = useState(0);

  useEffect(() => {
    const tytDate = new Date("2026-06-20T10:15:00");
    const aytDate = new Date("2026-06-21T10:15:00");
    const now = new Date();

    setDaysLeftTYT(differenceInDays(tytDate, now));
    setDaysLeftAYT(differenceInDays(aytDate, now));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="card-floral bg-gradient-to-br from-pink-500/5 to-transparent border-pink-200">
        <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-1">TYT Sayaç</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-pink-700">{daysLeftTYT}</span>
            <span className="text-sm font-medium text-pink-500">gün</span>
          </div>
        </CardContent>
      </Card>
      <Card className="card-floral bg-gradient-to-br from-rose-500/5 to-transparent border-rose-200">
        <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">AYT Sayaç</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-rose-700">{daysLeftAYT}</span>
            <span className="text-sm font-medium text-rose-500">gün</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
