"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { tr } from "date-fns/locale";
import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";

export function WeeklySummary() {
  const [summary, setSummary] = useState({
    totalSolved: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalEmpty: 0,
    topSubject: "—"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(), { weekStartsOn: 1 });
        
        const res = await fetch(`/api/sessions?start=${start.toISOString()}&end=${end.toISOString()}`);
        const sessions = await res.json();

        if (Array.isArray(sessions)) {
          const stats = sessions.reduce((acc, s) => {
            if (s.result) {
              acc.totalSolved += s.result.solvedCount;
              acc.totalCorrect += s.result.correctCount;
              acc.totalWrong += s.result.wrongCount;
              acc.totalEmpty += s.result.emptyCount;
            }
            
            // Track subject counts
            const subName = s.subject?.name || "Diğer";
            acc.subjects[subName] = (acc.subjects[subName] || 0) + 1;

            return acc;
          }, { totalSolved: 0, totalCorrect: 0, totalWrong: 0, totalEmpty: 0, subjects: {} as Record<string, number> });

          let topSub = "—";
          let maxCount = 0;
          for (const [name, count] of Object.entries(stats.subjects)) {
            const numericCount = count as number;
            if (numericCount > maxCount) {
              maxCount = numericCount;
              topSub = name;
            }
          }

          setSummary({
            totalSolved: stats.totalSolved,
            totalCorrect: stats.totalCorrect,
            totalWrong: stats.totalWrong,
            totalEmpty: stats.totalEmpty,
            topSubject: topSub
          });
        }
      } catch (error) {
        console.error("Weekly summary fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  if (loading) return null;

  return (
    <Card className="card-floral bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/50 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-pink-700 dark:text-pink-400">
          <Target className="h-4 w-4" />
          Bu Hafta Neler Yaptım? 🌸
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 dark:text-pink-500 uppercase font-bold">Toplam Soru</span>
            <div className="flex items-center gap-2 mt-1">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span className="text-xl font-black text-slate-700 dark:text-slate-300">{summary.totalSolved}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 dark:text-pink-500 uppercase font-bold">Doğru</span>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xl font-black text-emerald-600">{summary.totalCorrect}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 dark:text-pink-500 uppercase font-bold">Yanlış</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">❌</span>
              <span className="text-xl font-black text-rose-600">{summary.totalWrong}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 dark:text-pink-500 uppercase font-bold">Boş</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">⚪</span>
              <span className="text-xl font-black text-amber-600">{summary.totalEmpty}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 dark:text-pink-500 uppercase font-bold">En Çok Çalışılan</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-4 rounded-full bg-pink-400" />
              <span className="text-lg font-bold text-pink-700 dark:text-pink-300 truncate">{summary.topSubject}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
