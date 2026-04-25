"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  hookGenerateSchema,
  type HookGenerateInput,
  type HookItem,
  NICHE_OPTIONS,
  TONE_OPTIONS,
  PLATFORM_OPTIONS,
  AUDIENCE_OPTIONS,
} from "@/lib/validations/hook";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, Copy, Star, RefreshCw, CheckCheck, Sparkles, FileText } from "lucide-react";

type HookResult = HookItem & { id: string; favorited: boolean };

// Simpan form values ke sessionStorage supaya script page bisa pakai
function saveFormToSession(data: HookGenerateInput) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("hook_form_values", JSON.stringify(data));
  }
}

const NICHE_LABELS: Record<string, string> = {
  kuliner: "Kuliner 🍜",
  fashion: "Fashion 👗",
  edukasi: "Edukasi 📚",
  beauty: "Beauty 💄",
  fitness: "Fitness 💪",
  tech: "Tech 💻",
  finance: "Finance 💰",
  parenting: "Parenting 👶",
  travel: "Travel ✈️",
  lainnya: "Lainnya",
};

const TONE_LABELS: Record<string, string> = {
  gaul: "Gaul / Santai",
  edukatif: "Edukatif",
  kontroversial: "Kontroversial",
  POV: "POV",
  storytelling: "Storytelling",
  humor: "Humor",
  relatable: "Relatable",
};

export default function HookGeneratorPage() {
  const router = useRouter();
  const [hooks, setHooks] = useState<HookResult[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HookGenerateInput>({
    resolver: zodResolver(hookGenerateSchema),
    defaultValues: {
      niche: "kuliner",
      tone: "gaul",
      platform: "TikTok",
      audience: "Gen Z",
    },
  });

  const onSubmit = async (data: HookGenerateInput) => {
    setError(null);
    setHooks([]);

    const res = await fetch("/api/generate/hook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Gagal generate. Coba lagi.");
      return;
    }

    setGenerationId(json.generationId);
    setHooks(
      (json.hooks as HookItem[]).map((h, i) => ({
        ...h,
        id: `${json.generationId}-${i}`,
        favorited: false,
      }))
    );
    saveFormToSession(data);
  };

  const copyHook = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = async (idx: number) => {
    if (!generationId) return;
    const updated = [...hooks];
    updated[idx] = { ...updated[idx], favorited: !updated[idx].favorited };
    setHooks(updated);

    await fetch(`/api/generations/${generationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorited: updated[idx].favorited }),
    });
  };

  const regenerateOne = async (idx: number) => {
    const formValues = watch();
    setRegeneratingIdx(idx);

    const res = await fetch("/api/generate/hook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
    });

    if (res.ok) {
      const json = await res.json();
      const newHook = json.hooks?.[0] as HookItem | undefined;
      if (newHook) {
        const updated = [...hooks];
        updated[idx] = { ...newHook, id: `regen-${Date.now()}-${idx}`, favorited: false };
        setHooks(updated);
      }
    }
    setRegeneratingIdx(null);
  };

  const emotionColor: Record<string, string> = {
    penasaran: "bg-blue-100 text-blue-700",
    kaget: "bg-orange-100 text-orange-700",
    FOMO: "bg-red-100 text-red-700",
    validasi: "bg-green-100 text-green-700",
    kontroversi: "bg-purple-100 text-purple-700",
    empati: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Zap className="h-6 w-6 text-yellow-500" />
          Hook Generator
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Isi detail video kamu → dapat 10 hook viral siap pakai
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Topik */}
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topik Video <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="topic"
                placeholder="Contoh: Tips hemat listrik di rumah, Review kopi susu kekinian, Cara investasi reksa dana buat pemula..."
                rows={3}
                {...register("topic")}
              />
              {errors.topic && <p className="text-destructive text-xs">{errors.topic.message}</p>}
            </div>

            {/* Row: Niche + Tone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Niche</Label>
                <Select
                  defaultValue="kuliner"
                  onValueChange={(v) => setValue("niche", v as HookGenerateInput["niche"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n}>
                        {NICHE_LABELS[n]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone / Gaya</Label>
                <Select
                  defaultValue="gaul"
                  onValueChange={(v) => setValue("tone", v as HookGenerateInput["tone"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TONE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Platform + Audience */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  defaultValue="TikTok"
                  onValueChange={(v) => setValue("platform", v as HookGenerateInput["platform"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audiens</Label>
                <Select
                  defaultValue="Gen Z"
                  onValueChange={(v) => setValue("audience", v as HookGenerateInput["audience"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih audiens" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
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
                  Generating hook viral...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate 10 Hook Sekarang
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hasil */}
      {hooks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">10 Hook Viral untuk Kamu 🔥</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allText = hooks.map((h, i) => `${i + 1}. ${h.text}`).join("\n");
                navigator.clipboard.writeText(allText);
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Semua
            </Button>
          </div>

          <div className="space-y-2">
            {hooks.map((hook, idx) => (
              <Card
                key={hook.id}
                className={`transition-all ${hook.favorited ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/10" : ""}`}
              >
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground w-5 shrink-0 pt-0.5 font-mono text-sm">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed font-medium">{hook.text}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="px-1.5 py-0 text-xs">
                          {hook.framework}
                        </Badge>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-xs ${
                            emotionColor[hook.emotion] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {hook.emotion}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {/* Favorite */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toggleFavorite(idx)}
                        className={hook.favorited ? "text-yellow-500" : "text-muted-foreground"}
                        title={hook.favorited ? "Hapus dari favorit" : "Tambah ke favorit"}
                      >
                        <Star className={`h-4 w-4 ${hook.favorited ? "fill-current" : ""}`} />
                      </Button>
                      {/* Regenerate satu hook */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => regenerateOne(idx)}
                        disabled={regeneratingIdx === idx}
                        className="text-muted-foreground"
                        title="Generate ulang hook ini"
                      >
                        {regeneratingIdx === idx ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      {/* Copy */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyHook(hook.text, hook.id)}
                        className="text-muted-foreground"
                        title="Copy hook"
                      >
                        {copiedId === hook.id ? (
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {/* Buat Script */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-blue-500"
                        title="Buat script dari hook ini"
                        onClick={() => {
                          const formVals = watch();
                          const params = new URLSearchParams({
                            hook: hook.text,
                            topic: formVals.topic ?? "",
                            niche: formVals.niche ?? "kuliner",
                            tone: formVals.tone ?? "gaul",
                            audience: formVals.audience ?? "Gen Z",
                          });
                          router.push(`/dashboard/script?${params.toString()}`);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-muted-foreground pt-2 text-center text-xs">
            ⭐ Klik bintang untuk simpan favorit · 🔄 Klik refresh untuk generate ulang satu hook ·
            📋 Klik copy untuk salin
          </p>
        </div>
      )}
    </div>
  );
}
