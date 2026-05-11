"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FlowerConfetti } from "@/components/flower-confetti";

import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Öğrenci";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="border-b bg-background h-16 flex items-center px-6 shrink-0 justify-between">
      <div className="flex-1">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          Hoşgeldin, {userName.split(" ")[0]} 👋 
          <span className="text-sm font-medium text-pink-500 hidden md:inline-block ml-2 opacity-80 italic">
            Seninle çok gurur duyuyorum 🌸
          </span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <FlowerConfetti />
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <Avatar className="h-9 w-9 border">
          <AvatarImage src="" alt={userName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
