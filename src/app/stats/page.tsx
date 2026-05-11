"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Search } from "lucide-react";
import {
  Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Legend, Line, LineChart,
} from "recharts";

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#14b8a6", "#a855f7", "#f97316", "#06b6d4", "#ec4899",
];

const TYT_SUBJECTS = [
  { key: "turkce",    label: "Türkçe" },
  { key: "tarih",     label: "Tarih" },
  { key: "cografya",  label: "Coğrafya" },
  { key: "din",       label: "Din" },
  { key: "felsefe",   label: "Felsefe" },
  { key: "matematik", label: "Matematik" },
  { key: "fizik",     label: "Fizik" },
  { key: "kimya",     label: "Kimya" },
  { key: "biyoloji",  label: "Biyoloji" },
];

// ─── Shared Tooltip ──────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 shadow-2xl p-3 text-sm min-w-[160px]">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: e.color }} />
            {e.name}
          </span>
          <span className="font-semibold text-white">
            {e.name.includes("Oranı") ? `%${e.value}` : e.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const DarkPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 shadow-2xl p-3 text-sm">
      <p className="font-bold" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
      <p className="text-zinc-400 mt-0.5">Soru: <span className="font-semibold text-white">{payload[0].value}</span></p>
    </div>
  );
};

interface TopicStat {
  topicId: string; topicName: string; subjectName: string;
  solvedCount: number; correctCount: number; wrongCount: number; emptyCount: number; netScore: number;
}

// ═══════════════════════════════════════════════════════════════════
// Study Stats Tab (General)
// ═══════════════════════════════════════════════════════════════════
function StudyStats({ stats }: { stats: TopicStat[] }) {
  const totalSolved  = stats.reduce((a, c) => a + c.solvedCount, 0);
  const totalCorrect = stats.reduce((a, c) => a + c.correctCount, 0);
  const totalWrong   = stats.reduce((a, c) => a + c.wrongCount, 0);
  const totalEmpty   = stats.reduce((a, c) => a + c.emptyCount, 0);
  const averageRate  = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  const subjectMap = new Map<string, { name: string; solved: number; correct: number; wrong: number; empty: number }>();
  stats.forEach(s => {
    if (!subjectMap.has(s.subjectName)) subjectMap.set(s.subjectName, { name: s.subjectName, solved: 0, correct: 0, wrong: 0, empty: 0 });
    const m = subjectMap.get(s.subjectName)!;
    m.solved += s.solvedCount; m.correct += s.correctCount; m.wrong += s.wrongCount; m.empty += s.emptyCount;
  });
  const subjectList = Array.from(subjectMap.values());

  const barRate = subjectList.map((s, i) => ({ 
    name: s.name, 
    "Başarı Oranı": Math.round((s.correct / s.solved) * 100), 
    fill: COLORS[i % COLORS.length] 
  }));
  const pie = subjectList.map((s, i) => ({ name: s.name, value: s.solved, fill: COLORS[i % COLORS.length] }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {[
          { label: "Toplam Soru",  value: totalSolved,           color: "#e2e8f0" },
          { label: "Doğru",        value: totalCorrect,          color: "#22c55e" },
          { label: "Yanlış",       value: totalWrong,            color: "#ef4444" },
          { label: "Boş",          value: totalEmpty,            color: "#f59e0b" },
          { label: "Başarı Oranı", value: `%${averageRate}`,     color: "#818cf8" },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: c.color }}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ders Bazlı Başarı Oranı (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barRate} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="Başarı Oranı" radius={[4, 4, 0, 0]}>
                  {barRate.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soru Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<DarkPieTooltip />} />
                <Legend iconType="circle" iconSize={10} formatter={v => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Topic Analysis Tab
// ═══════════════════════════════════════════════════════════════════
function TopicAnalysis({ stats }: { stats: TopicStat[] }) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const subjectNames = Array.from(new Set(stats.map(s => s.subjectName)));

  const statsWithRate = stats.map(s => ({
    ...s,
    successRate: s.solvedCount > 0 ? Math.round((s.correctCount / s.solvedCount) * 100) : 0
  }));

  const filteredStats = statsWithRate
    .filter(s => selectedSubject === "all" || s.subjectName === selectedSubject)
    .filter(s => s.topicName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.successRate - b.successRate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="space-y-1.5 flex-1 max-w-sm">
          <label className="text-sm font-medium">Konu Ara</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Konu adı yazın..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5 w-[200px]">
          <label className="text-sm font-medium">Ders Filtrele</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Ders Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Dersler</SelectItem>
              {subjectNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStats.map((s, i) => (
          <Card key={s.topicId} className={cn(
            "border-l-4 transition-all hover:shadow-md",
            s.successRate < 50 ? "border-l-destructive" : s.successRate < 80 ? "border-l-warning" : "border-l-success"
          )}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] uppercase">{s.subjectName}</Badge>
                  <h4 className="font-bold leading-none">{s.topicName}</h4>
                </div>
                <span className={cn(
                  "text-lg font-black",
                  s.successRate < 50 ? "text-destructive" : s.successRate < 80 ? "text-orange-500" : "text-green-500"
                )}>
                  %{s.successRate}
                </span>
              </div>
              <div className="space-y-2 mt-4">
                <Progress value={s.successRate} className="h-2" />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{s.correctCount} Doğru / {s.solvedCount} Soru</span>
                  <span>{s.wrongCount} Yanlış</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStats.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground">Aradığınız kriterlere uygun konu bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Exam Stats Tab
// ═══════════════════════════════════════════════════════════════════
function ExamStats() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exams")
      .then(r => r.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-16 text-muted-foreground">Yükleniyor…</div>;
  if (!exams.length) return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="font-medium text-lg">Henüz deneme yok.</p>
    </div>
  );

  const tytExams = exams.filter(e => e.type === "TYT").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const avgNet = tytExams.length > 0 ? tytExams.reduce((a, b) => a + b.netScore, 0) / tytExams.length : 0;
  const bestExam = tytExams.length > 0 ? tytExams.reduce((a, b) => (a.netScore > b.netScore ? a : b), tytExams[0]) : null;

  const lineData = tytExams.map(e => ({
    name: format(new Date(e.date), "dd MMM", { locale: tr }),
    Net: Number(e.netScore.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground uppercase">Deneme</p><p className="text-3xl font-bold">{tytExams.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground uppercase">Ortalama Net</p><p className="text-3xl font-bold text-indigo-500">{avgNet.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4"><p className="text-xs text-muted-foreground uppercase">En İyi Net</p><p className="text-3xl font-bold text-green-500">{bestExam?.netScore.toFixed(2) || "0"}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Net Gelişimi</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" fontSize={12} tick={{ fill: "#94a3b8" }} />
              <YAxis fontSize={12} tick={{ fill: "#94a3b8" }} />
              <Tooltip content={<DarkTooltip />} />
              <Line type="monotone" dataKey="Net" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Utils
// ═══════════════════════════════════════════════════════════════════
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════
export default function StatsPage() {
  const [tab, setTab] = useState<"genel" | "konu" | "deneme">("genel");
  const [stats, setStats] = useState<TopicStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(data => setStats(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setStats([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-muted-foreground">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performans Merkezi</h2>
        <p className="text-muted-foreground">Başarı oranlarını ve gelişimini buradan takip et.</p>
      </div>

      <div className="flex gap-1 w-fit rounded-lg bg-muted p-1">
        {[
          { id: "genel", label: "Genel Bakış" },
          { id: "konu", label: "Konu Analizi" },
          { id: "deneme", label: "Deneme Takibi" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "genel" && <StudyStats stats={stats} />}
      {tab === "konu" && <TopicAnalysis stats={stats} />}
      {tab === "deneme" && <ExamStats />}
    </div>
  );
}
