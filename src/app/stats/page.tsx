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
  CartesianGrid, PieChart, Pie, Legend, Line, LineChart, Area, AreaChart
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Toplam Soru",  value: totalSolved,           color: "text-slate-600 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800/50", icon: "📚" },
          { label: "Doğru",        value: totalCorrect,          color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "✅" },
          { label: "Yanlış",       value: totalWrong,            color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30", icon: "❌" },
          { label: "Boş",          value: totalEmpty,            color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", icon: "⚪" },
          { label: "Başarı Oranı", value: `%${averageRate}`,     color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-900/30", icon: "⭐" },
        ].map(c => (
          <Card key={c.label} className="border-none shadow-sm overflow-hidden card-floral">
            <CardContent className="p-0">
              <div className={cn("px-4 py-6 flex flex-col items-center justify-center text-center transition-colors", c.bg)}>
                <span className="text-2xl mb-2">{c.icon}</span>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{c.label}</p>
                <p className={cn("text-3xl font-black mt-1", c.color)}>{c.value}</p>
              </div>
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
          <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val || "")}>
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
            "border-none shadow-sm card-floral group transition-all hover:scale-[1.02]",
            s.successRate < 50 
              ? "bg-rose-100/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900" 
              : s.successRate < 80 
                ? "bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900" 
                : "bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900"
          )}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-white/80 dark:bg-slate-900/80 text-[10px] uppercase font-bold border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400">{s.subjectName}</Badge>
                  <h4 className="font-bold text-lg leading-tight mt-1">{s.topicName}</h4>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-2 shadow-sm",
                  s.successRate < 50 ? "text-rose-700 border-rose-300 bg-rose-200" : 
                  s.successRate < 80 ? "text-amber-700 border-amber-300 bg-amber-200" : 
                  "text-emerald-700 border-emerald-300 bg-emerald-200"
                )}>
                  %{s.successRate}
                </div>
              </div>

              <div className="space-y-3">
                <Progress value={s.successRate} className="h-2 bg-white/50 dark:bg-slate-800/50" />
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-pink-200/50 dark:border-pink-800/30">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Soru</span>
                      <span className="text-sm font-bold">{s.solvedCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Doğru</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{s.correctCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Yanlış</span>
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400">{s.wrongCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Boş</span>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{s.emptyCount}</span>
                    </div>
                  </div>
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

  const subjects = [
    { key: "turkce", label: "Türkçe", color: "#f43f5e" },
    { key: "matematik", label: "Matematik", color: "#3b82f6" },
    { key: "fizik", label: "Fizik", color: "#10b981" },
    { key: "kimya", label: "Kimya", color: "#f59e0b" },
    { key: "biyoloji", label: "Biyoloji", color: "#8b5cf6" },
    { key: "tarih", label: "Tarih", color: "#64748b" },
    { key: "cografya", label: "Coğrafya", color: "#0ea5e9" },
    { key: "felsefe", label: "Felsefe", color: "#d946ef" },
    { key: "din", label: "Din Kültürü", color: "#84cc16" },
  ];

  const getSubjectNetData = (subjectKey: string) => {
    return tytExams.map(e => {
      const correct = e[`${subjectKey}Correct`] || 0;
      const wrong = e[`${subjectKey}Wrong`] || 0;
      const net = correct - (wrong * 0.25);
      return {
        name: format(new Date(e.date), "dd MMM", { locale: tr }),
        net: Number(net.toFixed(2)),
      };
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
          <CardContent className="pt-6 pb-4 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Toplam Deneme</p>
            <p className="text-4xl font-bold">{tytExams.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6 pb-4 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Ortalama Net</p>
            <p className="text-4xl font-bold text-blue-500">{avgNet.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardContent className="pt-6 pb-4 text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">En İyi Net</p>
            <p className="text-4xl font-bold text-emerald-500">{bestExam?.netScore.toFixed(2) || "0"}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-muted/20 shadow-none overflow-hidden">
        <CardHeader className="bg-muted/40 border-b border-white/5">
          <CardTitle className="text-lg">Genel Net Gelişimi</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" fontSize={11} tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area 
                type="monotone" 
                dataKey="Net" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorNet)" 
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="pt-4">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
          Ders Bazlı Net Analizi
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const data = getSubjectNetData(s.key);
            const subAvg = data.length > 0 ? data.reduce((a, b) => a + b.net, 0) / data.length : 0;
            
            return (
              <Card key={s.key} className="overflow-hidden border-none bg-muted/10 shadow-none hover:bg-muted/20 transition-colors">
                <CardHeader className="py-4 px-5 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold">{s.label}</CardTitle>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Ortalama: {subAvg.toFixed(2)}</p>
                  </div>
                  <div className="text-lg font-bold" style={{ color: s.color }}>
                    {data[data.length - 1]?.net || 0}
                  </div>
                </CardHeader>
                <CardContent className="h-[120px] p-0 px-1 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <Tooltip content={<DarkTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="net" 
                        stroke={s.color} 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: s.color }} 
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        label={{ position: 'top', fill: s.color, fontSize: 10, fontWeight: 'bold' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
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
