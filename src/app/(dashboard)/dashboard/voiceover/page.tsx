"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  voiceoverGenerateSchema,
  type VoiceoverGenerateInput,
  type VoiceoverGenerateOutput,
  type VoiceoverSegment,
  VOICEOVER_SPEED_OPTIONS,
  VOICEOVER_STYLE_OPTIONS,
  PACE_COLORS,
  PACE_LABELS,
  SPEED_RATES,
} from "@/lib/validations/voiceover";
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
import {
  Mic,
  Loader2,
  Sparkles,
  Play,
  Square,
  Copy,
  CheckCheck,
  Download,
  Zap,
  Lock,
  Clock,
} from "lucide-react";
import Link from "next/link";

type VoiceoverResult = VoiceoverGenerateOutput & { generationId: string };

const STYLE_LABELS: Record<string, string> = {
  natural: "Natural",
  energik: "Energik",
  formal: "Formal",
};

const SPEED_LABELS: Record<string, string> = {
  lambat: "Lambat (0.8×)",
  normal: "Normal (1.0×)",
  cepat: "Cepat (1.25×)",
};

export default function VoiceoverPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<VoiceoverResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentPlan = ((session?.user as Record<string, unknown>)?.plan as string) ?? "FREE";
  const isPro = currentPlan === "PRO";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VoiceoverGenerateInput>({
    resolver: zodResolver(voiceoverGenerateSchema),
    defaultValues: { speed: "normal", style: "natural" },
  });

  const speed = watch("speed");

  const onSubmit = async (data: VoiceoverGenerateInput) => {
    setError(null);
    setResult(null);
    stopPlayback();

    const res = await fetch("/api/generate/voiceover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Gagal generate. Coba lagi.");
      return;
    }
    setResult(json as VoiceoverResult);
  };

  const startPlayback = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) {
        setError("Browser kamu tidak mendukung text-to-speech.");
        return;
      }
      stopPlayback();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = SPEED_RATES[speed] ?? 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    },
    [speed]
  );

  const stopPlayback = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const copyScript = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    if (!result) return;
    const blob = new Blob([result.fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voiceover-script.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upgrade gate
  if (!isPro) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Mic className="h-6 w-6 text-pink-500" />
            Voice-Over Export
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Optimasi script untuk dibacakan + preview browser TTS
          </p>
        </div>

        <Card className="border-pink-200 bg-pink-50/50 dark:border-pink-900/50 dark:bg-pink-950/10">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-pink-100 p-3 dark:bg-pink-900/30">
                <Lock className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">Fitur ini khusus untuk plan Pro</p>
                <p className="text-muted-foreground mt-1 max-w-md text-sm">
                  Optimasi script kamu untuk dibaca natural sebagai voice-over, lengkap dengan pace
                  markers dan preview browser.
                </p>
              </div>
              <div className="grid w-full max-w-sm grid-cols-1 gap-2 text-sm">
                {[
                  "AI optimasi script untuk TTS",
                  "Pace marker per segmen (lambat/normal/cepat)",
                  "Preview browser text-to-speech",
                  "Download script sebagai .txt",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-left">
                    <Zap className="h-3.5 w-3.5 shrink-0 text-pink-500" />
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
          <Mic className="h-6 w-6 text-pink-500" />
          Voice-Over Export
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Script → voice-over ready dengan pace markers + preview TTS
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="script">
                Script <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="script"
                placeholder="Paste script dari Script Generator atau tulis sendiri..."
                rows={6}
                {...register("script")}
              />
              {errors.script && <p className="text-destructive text-xs">{errors.script.message}</p>}
              <p className="text-muted-foreground text-xs">
                💡 Copy hasil Script Generator untuk hasil terbaik
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kecepatan Bicara</Label>
                <Select
                  defaultValue="normal"
                  onValueChange={(v) =>
                    setValue("speed", (v ?? "normal") as VoiceoverGenerateInput["speed"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICEOVER_SPEED_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SPEED_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gaya Bicara</Label>
                <Select
                  defaultValue="natural"
                  onValueChange={(v) =>
                    setValue("style", (v ?? "natural") as VoiceoverGenerateInput["style"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICEOVER_STYLE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STYLE_LABELS[s]}
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
                  Mengoptimasi script...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Optimize untuk Voice-Over
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          {/* Meta + actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4" />
                {result.estimatedDuration}
              </div>
              <Badge variant="outline" className="text-xs">
                {result.segments.length} segmen
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (isPlaying ? stopPlayback() : startPlayback(result.fullText))}
              >
                {isPlaying ? (
                  <>
                    <Square className="mr-1.5 h-3.5 w-3.5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    Preview TTS
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={copyScript}>
                {copied ? (
                  <CheckCheck className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadScript}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download .txt
              </Button>
            </div>
          </div>

          {/* Segments */}
          <div className="space-y-2">
            {result.segments.map((seg: VoiceoverSegment, idx: number) => (
              <div
                key={idx}
                className={`rounded-r-lg border-l-4 px-4 py-3 ${
                  PACE_COLORS[seg.pace] ?? "border-l-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`flex-1 text-sm leading-relaxed ${
                      seg.emphasis ? "font-semibold" : ""
                    }`}
                  >
                    {seg.text}
                    {seg.pauseAfter && (
                      <span className="text-muted-foreground/60 ml-2 text-xs">[jeda]</span>
                    )}
                  </p>
                  <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-xs font-normal">
                    {PACE_LABELS[seg.pace] ?? seg.pace}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Speaking tips */}
          {result.speakingTips?.length > 0 && (
            <Card>
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mic className="h-4 w-4 text-pink-500" />
                  Tips Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-1.5">
                  {result.speakingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground/50 shrink-0 pt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <div className="text-muted-foreground flex flex-wrap gap-3 pt-1 text-xs">
            <span>Warna segmen:</span>
            <span className="border-l-2 border-blue-400 pl-2">🐢 Lambat</span>
            <span className="border-border border-l-2 pl-2">▶ Normal</span>
            <span className="border-l-2 border-orange-400 pl-2">⚡ Cepat</span>
            <span className="font-semibold">Bold</span>
            <span>= emphasis</span>
            <span>[jeda] = beri jeda setelah kalimat</span>
          </div>
        </div>
      )}
    </div>
  );
}
