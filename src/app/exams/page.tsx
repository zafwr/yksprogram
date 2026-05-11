"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const TYT_SUBJECTS = [
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

const emptySubjectValues = () =>
  Object.fromEntries(
    TYT_SUBJECTS.flatMap(s => [
      [`${s.key}Correct`, ""],
      [`${s.key}Wrong`, ""],
      [`${s.key}Empty`, ""],
    ])
  );

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("TYT");
  const [date, setDate] = useState("");
  const [subjectValues, setSubjectValues] = useState<Record<string, string>>(emptySubjectValues());

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data);
    } catch {
      toast.error("Denemeler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const setSubject = (key: string, value: string) =>
    setSubjectValues(prev => ({ ...prev, [key]: value }));

  const handleAddExam = async () => {
    if (!title || !date) {
      toast.error("Lütfen deneme adı ve tarihini girin.");
      return;
    }

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, date, ...subjectValues }),
      });

      if (res.ok) {
        toast.success("Deneme eklendi!");
        setIsModalOpen(false);
        setTitle(""); setDate(""); setSubjectValues(emptySubjectValues());
        fetchExams();
      } else {
        toast.error("Deneme eklenemedi.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu denemeyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/exams?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deneme silindi."); fetchExams(); }
    } catch { toast.error("Silinemedi."); }
  };

  const getSubjectNet = (exam: any, subj: { key: string }) =>
    (exam[`${subj.key}Correct`] ?? 0) - ((exam[`${subj.key}Wrong`] ?? 0) / 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Denemeler</h2>
          <p className="text-muted-foreground">TYT ve AYT deneme sonuçlarını konu konu takip et.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Deneme Ekle
        </Button>
      </div>

      {/* Add Exam Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deneme Sonucu Gir</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deneme Adı / Yayın</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Örn: Özdebir TYT 3" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Tür</Label>
                  <Select value={type} onValueChange={(val) => setType(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TYT">TYT</SelectItem>
                      <SelectItem value="AYT">AYT</SelectItem>
                      <SelectItem value="YDT">YDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tarih</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Per-subject inputs for TYT */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ders Bazlı Sonuçlar</p>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium">Ders</th>
                      <th className="text-center p-2 font-medium text-green-600">Doğru</th>
                      <th className="text-center p-2 font-medium text-red-600">Yanlış</th>
                      <th className="text-center p-2 font-medium text-yellow-600">Boş</th>
                      <th className="text-right p-2 font-medium text-muted-foreground">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {TYT_SUBJECTS.map(subj => (
                      <tr key={subj.key}>
                        <td className="p-2 font-medium">{subj.label}</td>
                        <td className="p-1">
                          <Input
                            type="number" min="0" max={subj.max}
                            value={subjectValues[`${subj.key}Correct`]}
                            onChange={e => setSubject(`${subj.key}Correct`, e.target.value)}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number" min="0" max={subj.max}
                            value={subjectValues[`${subj.key}Wrong`]}
                            onChange={e => setSubject(`${subj.key}Wrong`, e.target.value)}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="p-1">
                          <Input
                            type="number" min="0" max={subj.max}
                            value={subjectValues[`${subj.key}Empty`]}
                            onChange={e => setSubject(`${subj.key}Empty`, e.target.value)}
                            className="h-8 text-center"
                          />
                        </td>
                        <td className="p-2 text-right text-muted-foreground">{subj.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button onClick={handleAddExam} className="w-full">Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Geçmiş Denemeler</CardTitle>
          <CardDescription>Bir satıra tıklayarak ders bazlı detayları görebilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Yükleniyor...</div>
          ) : exams.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Deneme Adı</TableHead>
                    <TableHead className="text-center">Doğru</TableHead>
                    <TableHead className="text-center">Yanlış</TableHead>
                    <TableHead className="text-center">Boş</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map(exam => (
                    <React.Fragment key={exam.id}>
                      <TableRow
                        key={exam.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedId(expandedId === exam.id ? null : exam.id)}
                      >
                        <TableCell className="font-medium">
                          {format(new Date(exam.date), "dd MMM yyyy", { locale: tr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={exam.type === "TYT" ? "default" : "secondary"}>{exam.type}</Badge>
                        </TableCell>
                        <TableCell>{exam.title}</TableCell>
                        <TableCell className="text-center text-green-600">{exam.correctCount}</TableCell>
                        <TableCell className="text-center text-red-600">{exam.wrongCount}</TableCell>
                        <TableCell className="text-center text-yellow-600">{exam.emptyCount}</TableCell>
                        <TableCell className="text-right font-bold">{exam.netScore.toFixed(2)}</TableCell>
                        <TableCell>
                          {expandedId === exam.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" size="icon"
                            onClick={e => { e.stopPropagation(); handleDelete(exam.id); }}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedId === exam.id && exam.type === "TYT" && (
                        <TableRow key={`${exam.id}-detail`}>
                          <TableCell colSpan={9} className="bg-muted/30 px-6 pb-4 pt-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ders Bazlı Detay</p>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                              {TYT_SUBJECTS.map(subj => {
                                const c = exam[`${subj.key}Correct`] ?? 0;
                                const w = exam[`${subj.key}Wrong`]   ?? 0;
                                const e = exam[`${subj.key}Empty`]   ?? 0;
                                const net = c - w / 4;
                                return (
                                  <div key={subj.key} className="rounded-md border bg-card p-2 text-center">
                                    <p className="text-xs font-semibold">{subj.label}</p>
                                    <p className="text-lg font-bold mt-1">{net.toFixed(2)}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      <span className="text-green-600">{c}D</span> &nbsp;
                                      <span className="text-red-600">{w}Y</span> &nbsp;
                                      <span className="text-yellow-600">{e}B</span>
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Henüz hiç deneme girmemişsiniz. "Yeni Deneme Ekle" butonunu kullanarak başlayabilirsiniz.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
