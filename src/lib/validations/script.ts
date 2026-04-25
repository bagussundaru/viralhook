import { z } from "zod";

export const CTA_TYPE_OPTIONS = [
  "follow",
  "save",
  "comment",
  "visit link",
  "share",
  "duet",
] as const;

export const scriptGenerateSchema = z.object({
  hook: z.string().min(3, "Hook minimal 3 karakter").max(300),
  topic: z.string().min(3).max(200).trim(),
  niche: z.string().min(1),
  tone: z.string().min(1),
  audience: z.string().min(1),
  duration: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  includeCta: z.boolean(),
  ctaType: z.enum(CTA_TYPE_OPTIONS).optional(),
});

export type ScriptGenerateInput = z.infer<typeof scriptGenerateSchema>;

export const scriptSegment = z.object({
  timing: z.string(),
  segment: z.string(),
  text: z.string(),
  visualCue: z.string().optional(),
});

export const scriptGenerateOutput = z.object({
  script: z.array(scriptSegment).min(1),
  totalDuration: z.string(),
  estimatedWordCount: z.number(),
  bRollSuggestions: z.array(z.string()),
});

export type ScriptSegment = z.infer<typeof scriptSegment>;
export type ScriptGenerateOutput = z.infer<typeof scriptGenerateOutput>;

export const CTA_LABELS: Record<string, string> = {
  follow: "Follow akun",
  save: "Save video",
  comment: "Comment sesuatu",
  "visit link": "Kunjungi link di bio",
  share: "Share ke temen",
  duet: "Duet video ini",
};

export const SEGMENT_COLORS: Record<string, string> = {
  hook: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20",
  setup: "border-blue-400 bg-blue-50 dark:bg-blue-950/20",
  body: "border-green-400 bg-green-50 dark:bg-green-950/20",
  cta: "border-purple-400 bg-purple-50 dark:bg-purple-950/20",
};

export const SEGMENT_LABELS: Record<string, string> = {
  hook: "🎣 Hook",
  setup: "🔧 Setup",
  body: "💡 Body",
  cta: "📢 CTA",
};
