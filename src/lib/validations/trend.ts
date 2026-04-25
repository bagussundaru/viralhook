import { z } from "zod";

export const TREND_PLATFORM_OPTIONS = ["TikTok", "Instagram", "YouTube Shorts"] as const;
export const TREND_DIFFICULTY_OPTIONS = ["mudah", "sedang", "sulit"] as const;

export const trendScanSchema = z.object({
  niche: z.string().min(1),
  platform: z.enum(TREND_PLATFORM_OPTIONS),
});

export type TrendScanInput = z.infer<typeof trendScanSchema>;

export const trendItem = z.object({
  rank: z.number(),
  topic: z.string(),
  category: z.string(),
  why: z.string(),
  contentAngle: z.string(),
  suggestedHooks: z.array(z.string()),
  difficulty: z.enum(TREND_DIFFICULTY_OPTIONS),
  estimatedViews: z.string(),
});

export const trendScanOutput = z.object({
  trends: z.array(trendItem).min(1),
  analysisDate: z.string(),
  tip: z.string().optional(),
});

export type TrendItem = z.infer<typeof trendItem>;
export type TrendScanOutput = z.infer<typeof trendScanOutput>;

export const DIFFICULTY_COLORS: Record<string, string> = {
  mudah: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  sedang: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  sulit: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};
