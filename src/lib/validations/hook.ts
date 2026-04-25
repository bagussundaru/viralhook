import { z } from "zod";

export const NICHE_OPTIONS = [
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
] as const;

export const TONE_OPTIONS = [
  "gaul",
  "edukatif",
  "kontroversial",
  "POV",
  "storytelling",
  "humor",
  "relatable",
] as const;

export const PLATFORM_OPTIONS = ["TikTok", "Instagram Reels", "YouTube Shorts"] as const;

export const AUDIENCE_OPTIONS = [
  "Gen Z",
  "Millennial",
  "Ibu-ibu",
  "Pelajar",
  "Profesional",
] as const;

export const hookGenerateSchema = z.object({
  topic: z
    .string()
    .min(3, "Topik minimal 3 karakter")
    .max(200, "Topik maksimal 200 karakter")
    .trim(),
  niche: z.enum(NICHE_OPTIONS),
  tone: z.enum(TONE_OPTIONS),
  platform: z.enum(PLATFORM_OPTIONS),
  audience: z.enum(AUDIENCE_OPTIONS),
});

export type HookGenerateInput = z.infer<typeof hookGenerateSchema>;

export const hookItem = z.object({
  text: z.string(),
  framework: z.string(),
  emotion: z.string(),
});

export const hookGenerateOutput = z.object({
  hooks: z.array(hookItem).length(10),
});

export type HookItem = z.infer<typeof hookItem>;
export type HookGenerateOutput = z.infer<typeof hookGenerateOutput>;
