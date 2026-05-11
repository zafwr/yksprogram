import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyTimetable } from "@/components/planner/WeeklyTimetable";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Haftalık Ders Programı</CardTitle>
            <CardDescription>Boş bir saate tıklayarak yeni çalışma ekleyebilir, mevcut çalışmalara tıklayarak sonuçlarınızı (doğru/yanlış) girebilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyTimetable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
