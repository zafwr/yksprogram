"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PlannerPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString();
      const res = await fetch(`/api/sessions?date=${dateStr}`);
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      toast.error("Oturumlar getirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchSessions(date);
    }
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planlayıcı</h2>
          <p className="text-muted-foreground">Günlük ve haftalık çalışma planını buradan organize et.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Oturum Ekle
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 h-fit">
          <CardHeader>
            <CardTitle>Takvim</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={tr}
              className="rounded-md border mx-auto w-fit"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {date ? format(date, "d MMMM yyyy, EEEE", { locale: tr }) : "Tarih Seçin"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">Yükleniyor...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                <CalendarIcon className="mx-auto h-10 w-10 mb-4 opacity-50" />
                <p>Bu gün için henüz bir planın yok.</p>
                <Button variant="outline" className="mt-4">
                  Hemen Plan Ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex gap-4 p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r pr-4">
                      <span className="font-bold text-lg">
                        {format(new Date(session.startTime), "HH:mm")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(session.endTime), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{session.subject?.name}</h4>
                      <p className="text-sm text-muted-foreground">{session.topic?.name}</p>
                      {session.targetQuestions && (
                        <p className="text-sm mt-2 text-primary">Hedef: {session.targetQuestions} Soru</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {session.status === "COMPLETED" ? (
                        <div className="flex items-center text-green-500 font-medium text-sm">
                          <Check className="mr-1 h-4 w-4" />
                          Tamamlandı
                        </div>
                      ) : (
                        <Button variant="secondary" size="sm">
                          Sonuç Gir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
