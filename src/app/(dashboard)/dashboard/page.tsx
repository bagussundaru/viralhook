import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Generation } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, FileText, Hash, TrendingUp, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/masuk");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usageToday = await prisma.usageLog.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: today },
    },
  });

  const recentGenerations = await prisma.generation.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const plan = ((session.user as Record<string, unknown>).plan as string) ?? "FREE";
  const isFreePlan = plan === "FREE";
  const dailyLimit = 5;
  const remaining = isFreePlan ? Math.max(0, dailyLimit - usageToday) : null;

  const features = [
    {
      href: "/dashboard/hook",
      icon: Zap,
      title: "Hook Generator",
      desc: "Generate 10 hook viral untuk TikTok & Reels",
      color: "text-yellow-500",
    },
    {
      href: "/dashboard/script",
      icon: FileText,
      title: "Script Generator",
      desc: "Buat script video 15/30/60 detik siap rekam",
      color: "text-blue-500",
    },
    {
      href: "/dashboard/caption",
      icon: Hash,
      title: "Caption & Hashtag",
      desc: "Caption + 30 hashtag terstruktur siap posting",
      color: "text-green-500",
    },
    {
      href: "/dashboard/trends",
      icon: TrendingUp,
      title: "Trend Scanner",
      desc: "Pantau trend TikTok Indonesia harian",
      color: "text-purple-500",
      isPro: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Selamat datang, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Siap bikin konten viral hari ini?</p>
      </div>

      {/* Quota bar untuk free user */}
      {isFreePlan && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Kuota Harian (Plan Gratis)</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {remaining}/{dailyLimit} generate tersisa hari ini
                </p>
              </div>
              <Button size="sm" render={<Link href="/pricing" />}>
                Upgrade Plan
              </Button>
            </div>
            <div className="mt-3 h-2 rounded-full bg-orange-200 dark:bg-orange-800">
              <div
                className="h-2 rounded-full bg-orange-500 transition-all"
                style={{ width: `${((dailyLimit - (remaining ?? 0)) / dailyLimit) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.href} className="group transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`h-5 w-5 ${f.color}`} />
                  {f.title}
                  {f.isPro && (
                    <Badge variant="secondary" className="text-xs">
                      Pro
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <p className="text-muted-foreground text-sm">{f.desc}</p>
                <Button variant="ghost" size="icon-sm" render={<Link href={f.href} />}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Riwayat terbaru */}
      {recentGenerations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generate Terbaru</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/riwayat" />}>
                Lihat semua
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentGenerations.map((g: Generation) => {
                const input = g.input as Record<string, string>;
                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between border-b py-2 last:border-0"
                  >
                    <div>
                      <Badge variant="outline" className="mr-2 text-xs capitalize">
                        {g.type}
                      </Badge>
                      <span className="text-sm">{input.topic ?? "—"}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {new Date(g.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
