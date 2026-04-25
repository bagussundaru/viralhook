import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Zap, FileText, Hash, TrendingUp, ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="from-background to-muted/30 flex flex-col items-center justify-center bg-gradient-to-b px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          🚀 Gratis 5 hook/hari — tanpa kartu kredit
        </Badge>
        <h1 className="max-w-3xl text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
          Bikin Hook TikTok Viral dalam <span className="text-primary">5 Detik</span>. Bukan 5 Jam.
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg">
          AI yang paham kreator Indonesia. Generate hook, script video, caption & hashtag TikTok dan
          Reels yang viral — dalam bahasa gaul, untuk audiens lokal.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/daftar" />}>
            Coba Gratis Sekarang <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/pricing" />}>
            Lihat Harga
          </Button>
        </div>
        <p className="text-muted-foreground mt-4 text-xs">
          5.000+ kreator Indonesia sudah pakai ViralHook
        </p>
      </section>

      {/* Features */}
      <section className="bg-background px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Semua yang kamu butuhkan untuk konten viral</h2>
            <p className="text-muted-foreground mt-2">
              4 fitur AI dalam satu platform, khusus kreator Indonesia
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                icon: Zap,
                title: "Hook Generator",
                desc: "Generate 10 variasi hook viral dalam bahasa Indonesia gaul. Pakai framework terbukti: POV, contrarian, curiosity gap, dan lainnya.",
                color: "text-yellow-500",
              },
              {
                icon: FileText,
                title: "Script Generator",
                desc: "Dari hook pilihan kamu → script lengkap 15/30/60 detik dengan timing per detik, B-roll suggestions, dan CTA yang mengonversi.",
                color: "text-blue-500",
              },
              {
                icon: Hash,
                title: "Caption & Hashtag",
                desc: "3 variasi caption (pendek/sedang/panjang) + 30 hashtag terstruktur: viral, niche, dan longtail — siap copy-paste.",
                color: "text-green-500",
              },
              {
                icon: TrendingUp,
                title: "Trend Scanner",
                desc: "Pantau trend TikTok Indonesia setiap hari. Dapat rekomendasi ide konten yang match dengan niche kamu, otomatis.",
                color: "text-purple-500",
                badge: "Pro",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-6 w-6 ${f.color}`} />
                      {f.title}
                      {f.badge && <Badge variant="secondary">{f.badge}</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">Mulai gratis, upgrade kalau butuh lebih</h2>
          <p className="text-muted-foreground mt-2 mb-10">
            Harga transparan, bayar pakai QRIS/GoPay/OVO/Transfer Bank
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: "Gratis",
                price: "Rp 0",
                period: "/bulan",
                features: ["5 hook/hari", "Tidak bisa simpan riwayat", "Tanpa script & caption"],
                cta: "Mulai Gratis",
                href: "/daftar",
                highlight: false,
              },
              {
                name: "Creator",
                price: "Rp 49.000",
                period: "/bulan",
                features: [
                  "Unlimited hook",
                  "50 script/bulan",
                  "Simpan riwayat",
                  "Hashtag generator",
                ],
                cta: "Pilih Creator",
                href: "/daftar",
                highlight: true,
              },
              {
                name: "Pro",
                price: "Rp 149.000",
                period: "/bulan",
                features: [
                  "Semua di Creator",
                  "Trend scanner harian",
                  "Voice-over export",
                  "Export ke CapCut format",
                ],
                cta: "Pilih Pro",
                href: "/daftar",
                highlight: false,
              },
            ].map((p) => (
              <Card
                key={p.name}
                className={p.highlight ? "border-primary ring-primary shadow-md ring-2" : ""}
              >
                <CardHeader>
                  {p.highlight && <Badge className="mb-2 self-start">Paling Populer</Badge>}
                  <CardTitle>{p.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {p.price}
                    <span className="text-muted-foreground text-base font-normal">{p.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={p.highlight ? "default" : "outline"}
                    render={<Link href={p.href} />}
                  >
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
