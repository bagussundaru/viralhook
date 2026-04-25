import { z } from "zod";

export const VOICEOVER_SPEED_OPTIONS = ["lambat", "normal", "cepat"] as const;
export const VOICEOVER_STYLE_OPTIONS = ["natural", "energik", "formal"] as const;
export const VOICEOVER_PACE_OPTIONS = ["lambat", "normal", "cepat"] as const;

export const voiceoverGenerateSchema = z.object({
  script: z.string().min(10, "Script minimal 10 karakter").max(3000),
  speed: z.enum(VOICEOVER_SPEED_OPTIONS),
  style: z.enum(VOICEOVER_STYLE_OPTIONS),
});

export type VoiceoverGenerateInput = z.infer<typeof voiceoverGenerateSchema>;

export const voiceoverSegment = z.object({
  text: z.string(),
  pace: z.enum(VOICEOVER_PACE_OPTIONS),
  pauseAfter: z.boolean(),
  emphasis: z.boolean(),
});

export const voiceoverGenerateOutput = z.object({
  segments: z.array(voiceoverSegment).min(1),
  fullText: z.string(),
  estimatedDuration: z.string(),
  speakingTips: z.array(z.string()),
});

export type VoiceoverSegment = z.infer<typeof voiceoverSegment>;
export type VoiceoverGenerateOutput = z.infer<typeof voiceoverGenerateOutput>;

export const PACE_COLORS: Record<string, string> = {
  lambat: "border-l-blue-400 bg-blue-50/50 dark:bg-blue-950/20",
  normal: "border-l-border",
  cepat: "border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/20",
};

export const PACE_LABELS: Record<string, string> = {
  lambat: "🐢 Lambat",
  normal: "▶ Normal",
  cepat: "⚡ Cepat",
};

export const SPEED_RATES: Record<string, number> = {
  lambat: 0.8,
  normal: 1.0,
  cepat: 1.25,
};
