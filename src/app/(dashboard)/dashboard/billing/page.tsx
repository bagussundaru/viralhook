"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "@/lib/auth-client";
import { Check, Loader2, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS, PLAN_ORDER, isPlanHigher, type PlanKey } from "@/lib/plans";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = ((session?.user as Record<string, unknown>)?.plan as PlanKey) ?? "FREE";

  const handleUpgrade = async (targetPlan: PlanKey) => {
    setError(null);
    setSuccessMessage(null);
    setLoadingPlan(targetPlan);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal membuat pembayaran.");
        setLoadingPlan(null);
        return;
      }

      const { snapToken } = json as { snapToken: string };

      if (!window.snap) {
        setError("Snap.js belum siap. Refresh halaman dan coba lagi.");
        setLoadingPlan(null);
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: () => {
          setSuccessMessage(
            "Pembayaran berhasil! Plan kamu akan diupdate dalam beberapa detik. Refresh halaman."
          );
          setLoadingPlan(null);
        },
        onPending: () => {
          setSuccessMessage("Pembayaran pending. Selesaikan pembayaran agar plan diaktifkan.");
          setLoadingPlan(null);
        },
        onError: () => {
          setError("Pembayaran gagal. Coba lagi.");
          setLoadingPlan(null);
        },
        onClose: () => {
          setLoadingPlan(null);
        },
      });
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setLoadingPlan(null);
    }
  };

  const snapUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <>
      <Script
        src={snapUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CreditCard className="h-6 w-6 text-blue-500" />
            Langganan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Kelola plan dan pembayaran kamu</p>
        </div>

        {/* Current plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Plan Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Zap className="text-primary h-5 w-5" />
              <div>
                <p className="font-semibold">{PLANS[currentPlan].name}</p>
                <p className="text-muted-foreground text-sm">{PLANS[currentPlan].description}</p>
              </div>
              <Badge variant={currentPlan === "FREE" ? "secondary" : "default"} className="ml-auto">
                {currentPlan}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {successMessage && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key];
            const isCurrent = key === currentPlan;
            const canUpgrade = isPlanHigher(currentPlan, key);

            return (
              <Card
                key={key}
                className={`flex flex-col ${
                  plan.highlighted ? "border-primary shadow-md" : ""
                } ${isCurrent ? "bg-muted/30" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Aktif
                      </Badge>
                    )}
                    {plan.highlighted && !isCurrent && <Badge className="text-xs">Populer</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{plan.priceLabel}</span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-muted-foreground text-xs">/bln</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {key !== "FREE" && (
                    <Button
                      size="sm"
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                      disabled={isCurrent || !canUpgrade || loadingPlan !== null}
                      onClick={() => canUpgrade && handleUpgrade(key)}
                    >
                      {loadingPlan === key ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Memproses...
                        </>
                      ) : isCurrent ? (
                        "Plan Aktif"
                      ) : !canUpgrade ? (
                        "Downgrade tidak tersedia"
                      ) : (
                        plan.ctaLabel
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment methods note */}
        <p className="text-muted-foreground text-center text-xs">
          Pembayaran diproses secara aman oleh Midtrans · QRIS · GoPay · OVO · Dana · Transfer Bank
        </p>
      </div>
    </>
  );
}
