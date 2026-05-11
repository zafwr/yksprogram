"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Focus } from "lucide-react";

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          setIsActive(false);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(() => {}); // Play sound if browser allows
          
          // Switch mode
          if (mode === "work") {
            setMode("break");
            setMinutes(5);
          } else {
            setMode("work");
            setMinutes(25);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "work") {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  const switchMode = (newMode: "work" | "break") => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode === "work" ? 25 : 5);
    setSeconds(0);
  };

  return (
    <Card className="card-floral bg-gradient-to-br from-pink-500/10 to-transparent border-pink-200 mb-6 overflow-hidden">
      <CardContent className="pt-6 pb-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex gap-2 mb-2">
            <Button 
              variant={mode === "work" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => switchMode("work")}
              className={mode === "work" ? "bg-pink-500 hover:bg-pink-600" : "text-pink-600"}
            >
              <Focus className="h-4 w-4 mr-1" /> Odaklan
            </Button>
            <Button 
              variant={mode === "break" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => switchMode("break")}
              className={mode === "break" ? "bg-emerald-500 hover:bg-emerald-600" : "text-emerald-600"}
            >
              <Coffee className="h-4 w-4 mr-1" /> Mola
            </Button>
          </div>
          <p className="text-xs font-bold text-pink-400 uppercase tracking-[0.2em]">
            {mode === "work" ? "Çalışma Zamanı 🌸" : "Dinlenme Vakti 🌷"}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-6xl font-black text-pink-600 tabular-nums tracking-tighter">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            size="lg" 
            onClick={toggleTimer} 
            className={`w-16 h-16 rounded-full shadow-lg ${isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-pink-500 hover:bg-pink-600"}`}
          >
            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={resetTimer}
            className="w-16 h-16 rounded-full border-pink-200 text-pink-500 hover:bg-pink-50"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
