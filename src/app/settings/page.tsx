"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleBackup = () => {
    // Trigger download via direct link
    const a = document.createElement("a");
    a.href = "/api/backup";
    a.download = "";
    a.click();
    toast.success("Yedek indirme başlatıldı!");
  };

  const handleReset = async () => {
    if (confirmText !== "SİL") {
      toast.error("Lütfen 'SİL' yazarak onaylayın.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        toast.success("Tüm veriler başarıyla sıfırlandı.");
        setIsResetModalOpen(false);
        setConfirmText("");
      } else {
        toast.error("Sıfırlama başarısız oldu.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground">Veri yönetimi ve uygulama ayarları.</p>
      </div>

      {/* Backup */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <ShieldCheck className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <CardTitle>Veri Yedekleme</CardTitle>
            <CardDescription>Tüm verilerini (dersler, konular, çalışmalar, denemeler) JSON dosyası olarak indir.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackup} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Yedeği İndir
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Dosyayı güvenli bir yerde saklayın. Yedek dosyaları JSON formatındadır.
          </p>
        </CardContent>
      </Card>

      {/* Reset */}
      <Card className="border-destructive/40">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
            <CardDescription>Bu işlemler geri alınamaz. Dikkatli olun.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => { setIsResetModalOpen(true); setConfirmText(""); }}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Tüm Verileri Sıfırla
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Dersler, konular, çalışma geçmişi ve deneme sonuçlarının tamamı silinir.
          </p>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tüm Verileri Sıfırla
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Bu işlem <strong className="text-foreground">tüm ders, konu, çalışma ve deneme verilerini</strong> kalıcı olarak siler.
              Bu işlem <strong className="text-red-500">geri alınamaz</strong>.
            </p>
            <p className="text-sm">
              Devam etmek için aşağıya <strong className="font-mono bg-muted px-1 rounded">SİL</strong> yazın:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="SİL"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsResetModalOpen(false)}>İptal</Button>
              <Button
                variant="destructive"
                disabled={confirmText !== "SİL" || isResetting}
                onClick={handleReset}
              >
                {isResetting ? "Siliniyor..." : "Evet, Sıfırla"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
