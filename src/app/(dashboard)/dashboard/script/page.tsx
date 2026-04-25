"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  scriptGenerateSchema,
  type ScriptGenerateInput,
  type ScriptGenerateOutput,
  type ScriptSegment,
  CTA_TYPE_OPTIONS,
  CTA_LABELS,
  SEGMENT_COLORS,
  SEGMENT_LABELS,
} from "@/lib/validations/script";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Copy, CheckCheck, Sparkles, Clock, BookOpen, Film } from "lucide-react";

type ScriptResult = ScriptGenerateOutput & { generationId: string };

export default function ScriptGeneratorPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSeg, setCopiedSeg] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScriptGenerateInput>({
    resolver: zodResolver(scriptGenerateSchema),
    defaultValues: {
      duration: 30,
      includeCta: true,
      ctaType: "follow",
      niche: "kuliner",
      tone: "gaul",
      audience: "Gen Z",
    },
  });

  // Pre-fill form dari query params (dikirim dari hook page)
  useEffect(() => {
    const hook = searchParams.get("hook");
    const topic = searchParams.get("topic");
    const niche = searchParams.get("niche");
    const tone = searchParams.get("tone");
    const audience = searchParams.get("audience");
    if (hook) setValue("hook", hook);
    if (topic) setValue("topic", topic);
    if (niche) setValue("niche", niche);
    if (tone) setValue("tone", tone);
    if (audience) setValue("audience", audience as ScriptGenerateInput["audience"]);
  }, [searchParams, setValue]);

  const includeCta = watch("includeCta");

  const onSubmit = async (data: ScriptGenerateInput) => {
    setError(null);
    setResult(null);

    const res = await fetch("/api/generate/script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Gagal generate. Coba lagi.");
      return;
    }
    setResult(json as ScriptResult);
  };

  const copySegment = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedSeg(idx);
    setTimeout(() => setCopiedSeg(null), 2000);
  };

  const copyAll = async () => {
    if (!result) return;
    const full = result.script.map((s) => `[${s.timing}] ${s.text}`).join("\n\n");
    await navigator.clipboard.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyTeleprompter = async () => {
    if (!result) return;
    const text = result.script.map((s) => s.text).join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="h-6 w-6 text-blue-500" />
          Script Generator
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Dari hook pilihan kamu → script lengkap dengan timing per detik
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Hook */}
            <div className="space-y-2">
              <Label htmlFor="hook">
                Hook Video <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="hook"
                placeholder="Paste hook yang mau kamu pakai. Contoh: Lu pernah nggak bayar listrik mahal padahal AC jarang nyala?"
                rows={2}
                {...register("hook")}
              />
              {errors.hook && <p className="text-destructive text-xs">{errors.hook.message}</p>}
              <p className="text-muted-foreground text-xs">
                💡 Copy dari hasil Hook Generator, atau tulis sendiri
              </p>
            </div>

            {/* Topik */}
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topik Video <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic"
                placeholder="Contoh: Tips hemat listrik rumah tangga"
                {...register("topic")}
              />
              {errors.topic && <p className="text-destructive text-xs">{errors.topic.message}</p>}
            </div>

            {/* Row: Niche + Tone + Audience */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Niche</Label>
                <Select defaultValue="kuliner" onValueChange={(v) => setValue("niche", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
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
                    ].map((n) => (
                      <SelectItem key={n} value={n} className="capitalize">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select defaultValue="gaul" onValueChange={(v) => setValue("tone", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "gaul",
                      "edukatif",
                      "kontroversial",
                      "POV",
                      "storytelling",
                      "humor",
                      "relatable",
                    ].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Audiens</Label>
                <Select defaultValue="Gen Z" onValueChange={(v) => setValue("audience", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Gen Z", "Millennial", "Ibu-ibu", "Pelajar", "Profesional"].map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Durasi */}
            <div className="space-y-2">
              <Label>Durasi Video</Label>
              <div className="flex gap-2">
                {([15, 30, 60] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue("duration", d)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                      watch("duration") === d
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Sertakan CTA di akhir video?</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Call-to-action mendorong engagement
                </p>
              </div>
              <Switch checked={includeCta} onCheckedChange={(v) => setValue("includeCta", v)} />
            </div>

            {includeCta && (
              <div className="space-y-2">
                <Label>Tipe CTA</Label>
                <Select
                  defaultValue="follow"
                  onValueChange={(v) => setValue("ctaType", v as ScriptGenerateInput["ctaType"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CTA_TYPE_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CTA_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menulis script...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Script
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hasil */}
      {result && (
        <div className="space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4" />
              {result.totalDuration}
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <BookOpen className="h-4 w-4" />~{result.estimatedWordCount} kata
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Film className="h-4 w-4" />
              {result.script.length} segmen
            </div>
          </div>

          <Tabs defaultValue="segments">
            <div className="mb-3 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="segments">Per Segmen</TabsTrigger>
                <TabsTrigger value="teleprompter">Teleprompter</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAll}>
                  {copiedAll ? (
                    <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Copy dengan Timing
                </Button>
              </div>
            </div>

            {/* View: Per Segmen */}
            <TabsContent value="segments" className="mt-0 space-y-3">
              {result.script.map((seg: ScriptSegment, idx: number) => (
                <Card
                  key={idx}
                  className={`border-l-4 ${SEGMENT_COLORS[seg.segment] ?? "border-l-border"}`}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-[80px] shrink-0 text-right">
                        <Badge variant="outline" className="font-mono text-xs">
                          {seg.timing}
                        </Badge>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {SEGMENT_LABELS[seg.segment] ?? seg.segment}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-relaxed">{seg.text}</p>
                        {seg.visualCue && (
                          <p className="text-muted-foreground mt-1.5 text-xs italic">
                            🎬 {seg.visualCue}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground shrink-0"
                        onClick={() => copySegment(seg.text, idx)}
                        title="Copy teks segmen ini"
                      >
                        {copiedSeg === idx ? (
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* View: Teleprompter */}
            <TabsContent value="teleprompter" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Mode Baca Teleprompter</CardTitle>
                    <Button variant="outline" size="sm" onClick={copyTeleprompter}>
                      {copiedAll ? (
                        <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Copy Semua
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 space-y-4 rounded-lg p-6 font-mono text-base leading-loose">
                    {result.script.map((seg: ScriptSegment, idx: number) => (
                      <p
                        key={idx}
                        className={`${
                          seg.segment === "hook"
                            ? "font-semibold text-yellow-600 dark:text-yellow-400"
                            : seg.segment === "cta"
                              ? "text-purple-600 dark:text-purple-400"
                              : ""
                        }`}
                      >
                        {seg.text}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* B-Roll Suggestions */}
          {result.bRollSuggestions?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Film className="text-muted-foreground h-4 w-4" />
                  Saran B-Roll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.bRollSuggestions.map((s: string, i: number) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/50 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
