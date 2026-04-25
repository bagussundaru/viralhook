import { prisma } from "./prisma";

const FREE_DAILY_LIMITS: Record<string, number> = {
  hook: 5,
  script: 0,
  caption: 0,
  hashtag: 0,
  trend: 0,
  voiceover: 0,
};

const CREATOR_MONTHLY_LIMITS: Record<string, number> = {
  hook: Infinity,
  script: 50,
  caption: Infinity,
  hashtag: Infinity,
  trend: 0,
  voiceover: 0, // PRO only
};

export type QuotaResult = { allowed: true } | { allowed: false; reason: string; resetAt?: Date };

export async function checkQuota(
  userId: string,
  plan: string,
  feature: string
): Promise<QuotaResult> {
  if (plan === "PRO") return { allowed: true };

  if (plan === "CREATOR") {
    const limit = CREATOR_MONTHLY_LIMITS[feature] ?? 0;
    if (limit === 0) {
      return { allowed: false, reason: `Fitur ${feature} tidak tersedia di plan Creator.` };
    }
    if (limit === Infinity) return { allowed: true };

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    const usedThisMonth = await prisma.usageLog.count({
      where: { userId, feature, createdAt: { gte: firstOfMonth } },
    });

    if (usedThisMonth >= limit) {
      const nextMonth = new Date(firstOfMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return {
        allowed: false,
        reason: `Kuota ${feature} bulan ini sudah habis (${limit}/${limit}). Reset tanggal ${nextMonth.toLocaleDateString("id-ID")}.`,
        resetAt: nextMonth,
      };
    }
    return { allowed: true };
  }

  // FREE plan
  const dailyLimit = FREE_DAILY_LIMITS[feature] ?? 0;
  if (dailyLimit === 0) {
    return {
      allowed: false,
      reason: `Fitur ${feature} tidak tersedia di plan Gratis. Upgrade ke Creator atau Pro.`,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usedToday = await prisma.usageLog.count({
    where: { userId, feature, createdAt: { gte: today } },
  });

  if (usedToday >= dailyLimit) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      allowed: false,
      reason: `Kuota harian kamu sudah habis (${dailyLimit}/${dailyLimit}). Reset besok pukul 00:00 WIB, atau upgrade plan untuk unlimited.`,
      resetAt: tomorrow,
    };
  }

  return { allowed: true };
}
