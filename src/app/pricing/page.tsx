import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, PLAN_ORDER } from "@/lib/plans";

export const metadata = {
  title: "Harga — ViralHook.id",
  description:
    "Pilih paket ViralHook.id yang sesuai. Mulai gratis, upgrade kalau butuh lebih. Bayar pakai QRIS, GoPay, OVO, atau Transfer Bank.",
};

export default function PricingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Nav */}
      <header className="border-b px-4 py-4">
        <div className="container mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Zap className="text-primary h-5 w-5" />
            ViralHook.id
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" render={<Link href="/masuk" />}>
              Masuk
            </Button>
            <Button size="sm" render={<Link href="/daftar" />}>
              Daftar Gratis
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          {/* Heading */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Harga transparan, tanpa biaya tersembunyi
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Bayar pakai QRIS, GoPay, OVO, Dana, atau Transfer Bank
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const plan = PLANS[key];
              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-2xl border p-6 ${
                    plan.highlighted
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="px-3 py-1 text-xs">Paling Populer</Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.priceLabel}</span>
                      {plan.priceMonthly > 0 && (
                        <span className="text-muted-foreground text-sm">/bulan</span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    render={<Link href={key === "FREE" ? "/daftar" : `/daftar?plan=${key}`} />}
                  >
                    {plan.ctaLabel}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* FAQ ringkas */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                q: "Apakah ada kontrak jangka panjang?",
                a: "Tidak. Semua plan bulanan, bisa berhenti kapan saja.",
              },
              {
                q: "Metode pembayaran apa yang tersedia?",
                a: "QRIS, GoPay, OVO, Dana, Shopeepay, kartu kredit, dan transfer bank.",
              },
              {
                q: "Bagaimana cara upgrade plan?",
                a: "Masuk ke Dashboard → Langganan → klik Upgrade. Proses instan setelah bayar.",
              },
              {
                q: "Bisa downgrade atau refund?",
                a: "Kamu bisa berhenti kapan saja. Refund tidak tersedia, tapi plan tetap aktif sampai akhir bulan.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border p-5">
                <p className="font-semibold">{item.q}</p>
                <p className="text-muted-foreground mt-1.5 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
