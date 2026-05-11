"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Subject Form states
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("TYT");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Topic Form states
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      const subjectArray = Array.isArray(data) ? data : [];
      setSubjects(subjectArray);
      
      // Update selected subject topics if it's open
      if (selectedSubject) {
        const updatedSubject = subjectArray.find((s: any) => s.id === selectedSubject.id);
        if (updatedSubject) setSelectedSubject(updatedSubject);
      }
    } catch (error) {
      toast.error("Dersler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    if (!newSubject) {
      toast.error("Ders adı boş olamaz.");
      return;
    }
    
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubject, category: newCategory }),
      });
      
      if (res.ok) {
        toast.success("Ders başarıyla eklendi.");
        setNewSubject("");
        setIsModalOpen(false);
        fetchSubjects();
      }
    } catch (error) {
      toast.error("Ders eklenirken bir hata oluştu.");
    }
  };

  const handleOpenTopicModal = (subject: any) => {
    setSelectedSubject(subject);
    setIsTopicModalOpen(true);
  };

  const handleAddTopic = async () => {
    if (!newTopic || !selectedSubject) {
      toast.error("Konu adı boş olamaz.");
      return;
    }

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopic, subjectId: selectedSubject.id }),
      });

      if (res.ok) {
        toast.success("Konu başarıyla eklendi.");
        setNewTopic("");
        fetchSubjects();
      } else {
        toast.error("Konu eklenirken bir hata oluştu.");
      }
    } catch (error) {
      toast.error("Konu eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dersler ve Konular</h2>
          <p className="text-muted-foreground">Tüm TYT ve AYT derslerini buradan yönetebilirsin.</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ders Ekle
        </Button>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Ders Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ders Adı</Label>
                <Input 
                  id="name" 
                  placeholder="Örn: Matematik" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={newCategory} onValueChange={(val) => setNewCategory(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TYT">TYT</SelectItem>
                    <SelectItem value="AYT">AYT</SelectItem>
                    <SelectItem value="ORTAK">TYT & AYT Ortak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSubject} className="w-full">Kaydet</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{subject.name}</CardTitle>
                <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {subject.category}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {subject.topics?.length || 0} Konu
                </p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => handleOpenTopicModal(subject)}
                >
                  Konuları Gör / Ekle
                </Button>
              </CardContent>
            </Card>
          ))}
          {subjects.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Henüz ders eklenmemiş. Yukarıdaki butondan ekleyebilirsiniz.
            </div>
          )}
        </div>
      )}

      {/* Topic Modal */}
      <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSubject?.name} Konuları</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/20">
              {selectedSubject?.topics?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">Henüz konu eklenmemiş.</div>
              ) : (
                selectedSubject?.topics?.map((topic: any) => (
                  <div key={topic.id} className="text-sm p-2 border-b last:border-0 hover:bg-muted/50 rounded transition-colors">
                    {topic.name}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-end gap-2 pt-2">
              <div className="space-y-2 flex-1">
                <Label htmlFor="new-topic">Yeni Konu Ekle</Label>
                <Input 
                  id="new-topic" 
                  placeholder="Örn: Elektrik" 
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                />
              </div>
              <Button onClick={handleAddTopic} size="icon" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
