"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  trendScanSchema,
  type TrendScanInput,
  type TrendScanOutput,
  type TrendItem,
  TREND_PLATFORM_OPTIONS,
  DIFFICULTY_COLORS,
} from "@/lib/validations/trend";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Eye,
  FileText,
  Lock,
} from "lucide-react";
import Link from "next/link";

type TrendResult = TrendScanOutput & { generationId: string };

const NICHE_OPTIONS = [
  "kuliner",
  "fashion",
  "edukasi",
  "beauty",
  "fitness",
  "tech",
  "finance",
  "parenting",
  "travel",
  "lainnya",
];

export default function TrendScannerPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [result, setResult] = useState<TrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const currentPlan = ((session?.user as Record<string, unknown>)?.plan as string) ?? "FREE";
  const isPro = currentPlan === "PRO";

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<TrendScanInput>({
    resolver: zodResolver(trendScanSchema),
    defaultValues: {
      niche: "kuliner",
      platform: "TikTok",
    },
  });

  const onSubmit = async (data: TrendScanInput) => {
    setError(null);
    setResult(null);
    setExpandedIdx(null);

    const res = await fetch("/api/generate/trend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Gagal scan trend. Coba lagi.");
      return;
    }
    setResult(json as TrendResult);
  };

  const goToHookWithTopic = (trend: TrendItem) => {
    const params = new URLSearchParams({ topic: trend.topic, niche: "kuliner" });
    router.push(`/dashboard/hook?${params.toString()}`);
  };

  const goToScriptWithTopic = (trend: TrendItem) => {
    const params = new URLSearchParams({ topic: trend.topic });
    router.push(`/dashboard/script?${params.toString()}`);
  };

  // Upgrade gate untuk non-PRO users
  if (!isPro) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            Trend Scanner
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            10 topik trending Indonesia + hook siap pakai, setiap hari
          </p>
        </div>

        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/10">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <Lock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">Fitur ini khusus untuk plan Pro</p>
                <p className="text-muted-foreground mt-1 max-w-md text-sm">
                  Dapatkan akses ke 10 topik trending Indonesia setiap hari, lengkap dengan hook
                  siap pakai, content angle, dan estimasi views.
                </p>
              </div>
              <div className="grid w-full max-w-sm grid-cols-1 gap-2 text-sm">
                {[
                  "10 trending topik per hari",
                  "Suggested hooks per topik",
                  "Estimasi views & difficulty",
                  "Langsung buat hook/script dari trend",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-left">
                    <Zap className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-2" render={<Link href="/dashboard/billing" />}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade ke Pro — Rp 149.000/bln
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <TrendingUp className="h-6 w-6 text-orange-500" />
          Trend Scanner
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          10 topik paling trending di niche kamu sekarang
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Niche</Label>
                <Select defaultValue="kuliner" onValueChange={(v) => setValue("niche", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n} className="capitalize">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  defaultValue="TikTok"
                  onValueChange={(v) =>
                    setValue("platform", (v ?? "TikTok") as TrendScanInput["platform"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TREND_PLATFORM_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning trend...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Scan 10 Trend Sekarang
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              10 Topik Trending 🔥{" "}
              <span className="text-muted-foreground text-sm font-normal">
                {result.analysisDate}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {result.trends.map((trend, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header row — always visible */}
                  <button
                    type="button"
                    className="hover:bg-muted/40 flex w-full items-start gap-3 p-4 text-left transition-colors"
                    onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  >
                    <span className="text-muted-foreground w-5 shrink-0 pt-0.5 font-mono text-sm">
                      {trend.rank}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{trend.topic}</span>
                        <Badge variant="outline" className="px-1.5 py-0 text-xs">
                          {trend.category}
                        </Badge>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-xs ${
                            DIFFICULTY_COLORS[trend.difficulty] ?? ""
                          }`}
                        >
                          {trend.difficulty}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Eye className="h-3 w-3" />
                        {trend.estimatedViews} views
                      </div>
                    </div>
                    {expandedIdx === idx ? (
                      <ChevronUp className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    )}
                  </button>

                  {/* Expanded content */}
                  {expandedIdx === idx && (
                    <div className="space-y-3 border-t px-4 pt-3 pb-4">
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                          Kenapa Trending
                        </p>
                        <p className="text-sm">{trend.why}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                          Content Angle
                        </p>
                        <p className="text-sm">{trend.contentAngle}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                          Hook Siap Pakai
                        </p>
                        <div className="space-y-1.5">
                          {trend.suggestedHooks.map((hook, hi) => (
                            <div key={hi} className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                              &ldquo;{hook}&rdquo;
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => goToHookWithTopic(trend)}
                        >
                          <Zap className="mr-1.5 h-3.5 w-3.5 text-yellow-500" />
                          Buat Hook
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => goToScriptWithTopic(trend)}
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                          Buat Script
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {result.tip && (
            <p className="text-muted-foreground pt-1 text-center text-xs">💡 {result.tip}</p>
          )}
        </div>
      )}
    </div>
  );
}
