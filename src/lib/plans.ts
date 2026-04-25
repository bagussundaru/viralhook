export type PlanKey = "FREE" | "CREATOR" | "PRO";

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceMonthly: number; // IDR
  priceLabel: string;
  description: string;
  features: string[];
  limits: {
    hook: string;
    script: string;
    caption: string;
  };
  highlighted: boolean;
  ctaLabel: string;
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  FREE: {
    key: "FREE",
    name: "Gratis",
    priceMonthly: 0,
    priceLabel: "Rp 0",
    description: "Coba fitur dasar, gratis selamanya",
    features: ["5 hook per hari", "Tanpa kartu kredit", "Akses Hook Generator"],
    limits: { hook: "5/hari", script: "—", caption: "—" },
    highlighted: false,
    ctaLabel: "Mulai Gratis",
  },
  CREATOR: {
    key: "CREATOR",
    name: "Creator",
    priceMonthly: 79000,
    priceLabel: "Rp 79.000",
    description: "Untuk kreator aktif yang konsisten posting",
    features: [
      "Hook Generator unlimited",
      "Script Generator (50/bulan)",
      "Caption & Hashtag unlimited",
      "Riwayat generate tersimpan",
      "Prioritas support",
    ],
    limits: { hook: "Unlimited", script: "50/bulan", caption: "Unlimited" },
    highlighted: true,
    ctaLabel: "Upgrade ke Creator",
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    priceMonthly: 149000,
    priceLabel: "Rp 149.000",
    description: "Untuk agensi dan kreator profesional",
    features: [
      "Semua fitur Creator",
      "Script Generator unlimited",
      "Trend Scanner (coming soon)",
      "Voice-Over Export (coming soon)",
      "API access (coming soon)",
    ],
    limits: { hook: "Unlimited", script: "Unlimited", caption: "Unlimited" },
    highlighted: false,
    ctaLabel: "Upgrade ke Pro",
  },
};

export const PLAN_ORDER: PlanKey[] = ["FREE", "CREATOR", "PRO"];

export function isPlanHigher(current: PlanKey, target: PlanKey): boolean {
  return PLAN_ORDER.indexOf(target) > PLAN_ORDER.indexOf(current);
}
