"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Settings, GraduationCap, ClipboardList, LogOut, LayoutDashboard, CalendarDays, BookOpen, BarChart3 } from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Planlayıcı", href: "/planner", icon: CalendarDays },
  { name: "Dersler", href: "/subjects", icon: BookOpen },
  { name: "Denemeler", href: "/exams", icon: ClipboardList },
  { name: "İstatistikler", href: "/stats", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-pink-600">
          <span className="text-3xl">🌸</span>
          <span>Nimiyks</span>
        </Link>
      </div>
      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 mt-auto border-t space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
            pathname === "/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Ayarlar
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center w-full gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
