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
    totalTime: 0, // in minutes
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
            }
            
            // Calculate time in minutes
            const duration = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60);
            acc.totalTime += duration;

            // Track subject counts
            const subName = s.subject?.name || "Diğer";
            acc.subjects[subName] = (acc.subjects[subName] || 0) + 1;

            return acc;
          }, { totalSolved: 0, totalCorrect: 0, totalTime: 0, subjects: {} as Record<string, number> });

          let topSub = "—";
          let maxCount = 0;
          for (const [name, count] of Object.entries(stats.subjects)) {
            if (count > maxCount) {
              maxCount = count;
              topSub = name;
            }
          }

          setSummary({
            totalSolved: stats.totalSolved,
            totalCorrect: stats.totalCorrect,
            totalTime: Math.round(stats.totalTime),
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
    <Card className="card-floral bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-pink-700">
          <Target className="h-4 w-4" />
          Bu Hafta Neler Yaptım? 🌸
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 uppercase font-bold">Toplam Soru</span>
            <div className="flex items-center gap-2 mt-1">
              <BookOpen className="h-4 w-4 text-pink-500" />
              <span className="text-xl font-black text-pink-700">{summary.totalSolved}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 uppercase font-bold">Doğru Sayısı</span>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xl font-black text-emerald-700">{summary.totalCorrect}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 uppercase font-bold">Çalışma Süresi</span>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xl font-black text-blue-700">
                {summary.totalTime > 60 
                  ? `${Math.floor(summary.totalTime / 60)}sa ${summary.totalTime % 60}dk` 
                  : `${summary.totalTime}dk`}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-pink-400 uppercase font-bold">En Çok Çalışılan</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-4 rounded-full bg-amber-400" />
              <span className="text-lg font-bold text-slate-700 truncate">{summary.topSubject}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
