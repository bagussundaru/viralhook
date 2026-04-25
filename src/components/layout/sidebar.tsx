"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Zap,
  FileText,
  Hash,
  TrendingUp,
  Mic,
  CreditCard,
  User,
  History,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/dashboard/hook", label: "Hook Generator", icon: Zap },
  { href: "/dashboard/script", label: "Script Generator", icon: FileText },
  { href: "/dashboard/caption", label: "Caption & Hashtag", icon: Hash },
  { href: "/dashboard/trends", label: "Trend Scanner", icon: TrendingUp, badge: "Pro" },
  { href: "/dashboard/voiceover", label: "Voice-Over Export", icon: Mic, badge: "Pro" },
  { href: "/dashboard/riwayat", label: "Riwayat", icon: History },
];

const accountItems = [
  { href: "/dashboard/billing", label: "Langganan", icon: CreditCard },
  { href: "/dashboard/profil", label: "Profil", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-muted/20 hidden min-h-screen w-64 shrink-0 flex-col border-r md:flex">
      <div className="border-b p-4">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="text-primary h-5 w-5" />
          <span className="font-bold">ViralHook.id</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className="text-muted-foreground px-3 py-2 text-xs font-medium tracking-wider uppercase">
          Fitur
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="px-1 py-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-muted-foreground px-3 py-2 text-xs font-medium tracking-wider uppercase">
            Akun
          </p>
          {accountItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
