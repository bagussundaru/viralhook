"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  captionGenerateSchema,
  type CaptionGenerateInput,
  type CaptionGenerateOutput,
  type CaptionItem,
  CAPTION_PLATFORM_OPTIONS,
  CAPTION_STYLE_LABELS,
  CAPTION_STYLE_DESC,
} from "@/lib/validations/caption";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { Hash, Loader2, Copy, CheckCheck, Sparkles, Lightbulb } from "lucide-react";

type CaptionResult = CaptionGenerateOutput & { generationId: string };

const STYLE_COLORS: Record<string, string> = {
  singkat: "border-l-yellow-400",
  medium: "border-l-blue-400",
  storytelling: "border-l-green-400",
};

const HASHTAG_SET_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  niche: {
    label: "Niche",
    desc: "10–12 tag spesifik, kompetisi sedang",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  mix: {
    label: "Mix",
    desc: "20–22 tag campuran niche + medium",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  viral: {
    label: "Viral",
    desc: "25–28 tag populer Indonesia",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
};

export default function CaptionGeneratorPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null);
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CaptionGenerateInput>({
    resolver: zodResolver(captionGenerateSchema),
    defaultValues: {
      platform: "TikTok",
      niche: "kuliner",
      tone: "gaul",
      audience: "Gen Z",
    },
  });

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
    if (audience) setValue("audience", audience as CaptionGenerateInput["audience"]);
  }, [searchParams, setValue]);

  const onSubmit = async (data: CaptionGenerateInput) => {
    setError(null);
    setResult(null);

    const res = await fetch("/api/generate/caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Gagal generate. Coba lagi.");
      return;
    }
    setResult(json as CaptionResult);
  };

  const copyCaption = async (text: string, style: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCaption(style);
    setTimeout(() => setCopiedCaption(null), 2000);
  };

  const copyHashtags = async (tags: string[], key: string) => {
    await navigator.clipboard.writeText(tags.join(" "));
    setCopiedHashtag(key);
    setTimeout(() => setCopiedHashtag(null), 2000);
  };

  const copyCaptionWithHashtags = async (caption: CaptionItem, hashtagSet: string[]) => {
    const text = `${caption.text}\n\n${hashtagSet.join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopiedCaption(`${caption.style}-full`);
    setTimeout(() => setCopiedCaption(null), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Hash className="h-6 w-6 text-purple-500" />
          Caption & Hashtag Generator
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          3 variasi caption siap post + 3 set hashtag untuk TikTok & Instagram
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Topik */}
            <div className="space-y-2">
              <Label htmlFor="topic">
                Topik Konten <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic"
                placeholder="Contoh: Tips hemat listrik rumah tangga"
                {...register("topic")}
              />
              {errors.topic && <p className="text-destructive text-xs">{errors.topic.message}</p>}
            </div>

            {/* Hook (opsional) */}
            <div className="space-y-2">
              <Label htmlFor="hook">
                Hook Video <span className="text-muted-foreground font-normal">(opsional)</span>
              </Label>
              <Textarea
                id="hook"
                placeholder="Tempel hook video kamu agar caption lebih nyambung..."
                rows={2}
                {...register("hook")}
              />
              <p className="text-muted-foreground text-xs">
                💡 Copy dari Hook Generator untuk hasil yang lebih konsisten
              </p>
            </div>

            {/* Row: Niche + Tone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <Label>Tone / Gaya</Label>
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
            </div>

            {/* Row: Platform + Audience */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  defaultValue="TikTok"
                  onValueChange={(v) =>
                    setValue("platform", (v ?? "TikTok") as CaptionGenerateInput["platform"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPTION_PLATFORM_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audiens</Label>
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

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menulis caption...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Caption & Hashtag
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hasil */}
      {result && (
        <div className="space-y-5">
          {/* Captions */}
          <div>
            <h2 className="mb-3 font-semibold">3 Variasi Caption</h2>
            <div className="space-y-3">
              {result.captions.map((caption) => (
                <Card
                  key={caption.style}
                  className={`border-l-4 ${STYLE_COLORS[caption.style] ?? "border-l-border"}`}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          {CAPTION_STYLE_LABELS[caption.style] ?? caption.style}
                        </span>
                        <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal">
                          {caption.charCount} karakter
                        </Badge>
                        <span className="text-muted-foreground hidden text-xs sm:inline">
                          {CAPTION_STYLE_DESC[caption.style]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground h-7 px-2 text-xs"
                          onClick={() => copyCaptionWithHashtags(caption, result.hashtags.mix)}
                          title="Copy caption + hashtag mix"
                        >
                          {copiedCaption === `${caption.style}-full` ? (
                            <CheckCheck className="mr-1 h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="mr-1 h-3.5 w-3.5" />
                          )}
                          + Hashtag
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground h-7 w-7"
                          onClick={() => copyCaption(caption.text, caption.style)}
                          title="Copy caption saja"
                        >
                          {copiedCaption === caption.style ? (
                            <CheckCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{caption.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Hashtag sets */}
          <div>
            <h2 className="mb-3 font-semibold">Set Hashtag</h2>
            <div className="space-y-3">
              {(["niche", "mix", "viral"] as const).map((key) => {
                const tags = result.hashtags[key];
                const meta = HASHTAG_SET_LABELS[key];
                return (
                  <Card key={key}>
                    <CardContent className="pt-4 pb-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-muted-foreground text-xs">{meta.desc}</span>
                          <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal">
                            {tags.length} tag
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground h-7 w-7"
                          onClick={() => copyHashtags(tags, key)}
                          title={`Copy hashtag ${meta.label}`}
                        >
                          {copiedHashtag === key ? (
                            <CheckCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Tip */}
          {result.tip && (
            <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/10">
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Tips Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm">{result.tip}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
