"use client";

import { useState, useEffect } from "react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const TIME_SLOTS = [
  "08:30 - 09:20", "09:30 - 10:20", "10:30 - 11:20", "11:30 - 12:20", 
  "12:30 - 13:20", "13:30 - 14:20", "14:30 - 15:20", "15:30 - 16:20", 
  "16:30 - 17:20", "17:30 - 18:20", "18:30 - 19:20", "19:30 - 20:20", 
  "20:30 - 21:20"
];

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export function WeeklyTimetable() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ dayIndex: number, timeIndex: number } | null>(null);
  
  // Form state
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [targetQuestions, setTargetQuestions] = useState("20");

  // Result state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [correctCount, setCorrectCount] = useState("");
  const [wrongCount, setWrongCount] = useState("");
  const [emptyCount, setEmptyCount] = useState("");

  // Get current week dates
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);

      const subRes = await fetch('/api/subjects');
      const subData = await subRes.json();
      setSubjects(Array.isArray(subData) ? subData : []);
    } catch (e) {
      console.error(e);
      setSessions([]);
      setSubjects([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCellClick = (dayIndex: number, timeIndex: number) => {
    setSelectedCell({ dayIndex, timeIndex });
    setIsModalOpen(true);
  };

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
    if (session.result) {
      setCorrectCount(session.result.correctCount.toString());
      setWrongCount(session.result.wrongCount.toString());
      setEmptyCount(session.result.emptyCount.toString());
    } else {
      setCorrectCount("");
      setWrongCount("");
      setEmptyCount("");
    }
    setIsResultModalOpen(true);
  };

  const handleAddSession = async () => {
    if (!selectedCell || !selectedSubject || !selectedTopic) {
      toast.error("Lütfen ders ve konu seçin.");
      return;
    }

    const { dayIndex, timeIndex } = selectedCell;
    const targetDate = weekDates[dayIndex];
    
    // Parse time
    const timeStr = TIME_SLOTS[timeIndex];
    const [startHour, startMin] = timeStr.split(" - ")[0].split(":");
    const [endHour, endMin] = timeStr.split(" - ")[1].split(":");

    const startTime = new Date(targetDate);
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0);

    const endTime = new Date(targetDate);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubject,
          topicId: selectedTopic,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          targetQuestions: parseInt(targetQuestions),
        }),
      });

      if (res.ok) {
        toast.success("Çalışma eklendi!");
        setIsModalOpen(false);
        fetchData();
        
        // Reset form
        setSelectedSubject("");
        setSelectedTopic("");
        setTargetQuestions("20");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    }
  };

  const handleSaveResult = async () => {
    if (!selectedSession) return;
    
    try {
      const res = await fetch(`/api/sessions/${selectedSession.id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctCount: parseInt(correctCount) || 0,
          wrongCount: parseInt(wrongCount) || 0,
          emptyCount: parseInt(emptyCount) || 0,
        }),
      });

      if (res.ok) {
        toast.success("Sonuçlar kaydedildi!");
        setIsResultModalOpen(false);
        fetchData(); // Refresh data to show results
      } else {
        toast.error("Sonuç kaydedilemedi.");
      }
    } catch (error) {
      toast.error("Bir hata oluştu.");
    }
  };

  // Find session for a cell
  const getSessionForCell = (dayIndex: number, timeIndex: number) => {
    const targetDate = weekDates[dayIndex];
    const timeStr = TIME_SLOTS[timeIndex];
    const [startHour, startMin] = timeStr.split(" - ")[0].split(":");
    
    if (!Array.isArray(sessions)) return null;

    return sessions.find(session => {
      const sessionDate = new Date(session.startTime);
      return isSameDay(sessionDate, targetDate) && 
             sessionDate.getHours() === parseInt(startHour) && 
             sessionDate.getMinutes() === parseInt(startMin);
    });
  };

  const selectedSubjectData = Array.isArray(subjects) ? subjects.find(s => s.id === selectedSubject) : null;

  return (
    <div className="w-full overflow-x-auto rounded-xl border bg-card">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b bg-muted/50">
          <div className="p-3 text-center text-sm font-semibold border-r">Saatler</div>
          {weekDates.map((date, i) => (
            <div key={i} className="p-3 text-center text-sm font-semibold border-r last:border-r-0">
              {DAYS[i]}
              <div className="text-xs font-normal text-muted-foreground">
                {format(date, "dd MMM", { locale: tr })}
              </div>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="divide-y divide-border">
          {TIME_SLOTS.map((timeSlot, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8">
              {/* Time Column */}
              <div className="p-3 text-center text-xs font-medium border-r flex items-center justify-center bg-muted/20">
                {timeSlot}
              </div>

              {/* Day Columns */}
              {DAYS.map((_, dayIndex) => {
                const session = getSessionForCell(dayIndex, timeIndex);
                
                return (
                  <div 
                    key={dayIndex} 
                    onClick={() => session ? handleSessionClick(session) : handleCellClick(dayIndex, timeIndex)}
                    className={`border-r last:border-r-0 min-h-[80px] p-1.5 transition-colors group relative ${
                      session ? "cursor-pointer hover:bg-muted/50" : "cursor-pointer hover:bg-muted/50"
                    }`}
                  >
                    {session ? (
                      <div className="h-full w-full rounded-md bg-red-500/90 text-white p-2 flex flex-col justify-center text-center shadow-sm relative">
                        {session.result && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 border border-white" title="Sonuç girildi" />
                        )}
                        <span className="text-xs font-bold truncate">{session.subject?.name}</span>
                        <span className="text-[10px] opacity-90 truncate">{session.topic?.name}</span>
                        {session.targetQuestions && (
                          <span className="text-[10px] mt-1 opacity-80">{session.targetQuestions} Soru Hedefi</span>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Çalışma Ekle ({selectedCell ? `${DAYS[selectedCell.dayIndex]} ${TIME_SLOTS[selectedCell.timeIndex]}` : ''})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ders</Label>
              <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ders seçin" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSubject && (
              <div className="space-y-2">
                <Label>Konu</Label>
                <Select value={selectedTopic} onValueChange={(val) => setSelectedTopic(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Konu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSubjectData?.topics?.length > 0 ? (
                      selectedSubjectData.topics.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">Önce derse konu eklemelisiniz.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Hedef Soru Sayısı</Label>
              <Input 
                type="number" 
                value={targetQuestions} 
                onChange={(e) => setTargetQuestions(e.target.value)} 
              />
            </div>

            <Button onClick={handleAddSession} className="w-full">Ekle</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Entry Modal */}
      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çalışma Sonucu Gir</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">{selectedSession.subject?.name}</span> - {selectedSession.topic?.name}
                <br/>
                Hedeflenen: {selectedSession.targetQuestions} Soru
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Doğru</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={correctCount} 
                    onChange={(e) => setCorrectCount(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yanlış</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={wrongCount} 
                    onChange={(e) => setWrongCount(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Boş</Label>
                  <Input 
                    type="number" 
                    min="0"
                    value={emptyCount} 
                    onChange={(e) => setEmptyCount(e.target.value)} 
                  />
                </div>
              </div>

              <Button onClick={handleSaveResult} className="w-full mt-4">Kaydet</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
