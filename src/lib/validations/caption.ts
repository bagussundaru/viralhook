import { z } from "zod";

export const CAPTION_PLATFORM_OPTIONS = ["TikTok", "Instagram", "YouTube Shorts"] as const;
export const CAPTION_STYLE_OPTIONS = ["singkat", "medium", "storytelling"] as const;

export const captionGenerateSchema = z.object({
  topic: z.string().min(3, "Topik minimal 3 karakter").max(200).trim(),
  niche: z.string().min(1),
  tone: z.string().min(1),
  platform: z.enum(CAPTION_PLATFORM_OPTIONS),
  audience: z.string().min(1),
  hook: z.string().max(300).optional(),
});

export type CaptionGenerateInput = z.infer<typeof captionGenerateSchema>;

export const captionItem = z.object({
  style: z.enum(CAPTION_STYLE_OPTIONS),
  text: z.string(),
  charCount: z.number(),
});

export const captionGenerateOutput = z.object({
  captions: z.array(captionItem).min(1),
  hashtags: z.object({
    niche: z.array(z.string()),
    mix: z.array(z.string()),
    viral: z.array(z.string()),
  }),
  tip: z.string().optional(),
});

export type CaptionItem = z.infer<typeof captionItem>;
export type CaptionGenerateOutput = z.infer<typeof captionGenerateOutput>;

export const CAPTION_STYLE_LABELS: Record<string, string> = {
  singkat: "Singkat",
  medium: "Medium",
  storytelling: "Storytelling",
};

export const CAPTION_STYLE_DESC: Record<string, string> = {
  singkat: "< 100 kata, langsung to the point",
  medium: "100–150 kata, penjelasan + CTA",
  storytelling: "150–250 kata, buka dengan cerita",
};
