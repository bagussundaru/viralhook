import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <Zap className="text-primary h-5 w-5" />
              <span className="font-bold">ViralHook.id</span>
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm">
              AI untuk bikin hook, script, dan caption TikTok & Reels yang viral. Untuk kreator
              Indonesia.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Produk</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/dashboard/hook" className="hover:text-primary transition-colors">
                  Hook Generator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/script" className="hover:text-primary transition-colors">
                  Script Generator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/caption" className="hover:text-primary transition-colors">
                  Caption & Hashtag
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Harga
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Akun</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/daftar" className="hover:text-primary transition-colors">
                  Daftar Gratis
                </Link>
              </li>
              <li>
                <Link href="/masuk" className="hover:text-primary transition-colors">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/dashboard/billing" className="hover:text-primary transition-colors">
                  Langganan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} ViralHook.id — Dibuat dengan ❤️ untuk kreator Indonesia
          </p>
          <div className="text-muted-foreground flex gap-4 text-xs">
            <Link href="/privasi" className="hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/syarat" className="hover:text-primary transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
