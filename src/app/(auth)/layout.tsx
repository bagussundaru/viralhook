import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Panel kiri — branding */}
      <div className="bg-primary text-primary-foreground hidden flex-col justify-between p-10 md:flex">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6" />
          <span className="text-xl font-bold">ViralHook.id</span>
        </Link>
        <div className="space-y-4">
          <blockquote className="text-2xl leading-snug font-semibold">
            &ldquo;Berhenti mikirin hook berjam-jam. Biarkan AI yang kerja.&rdquo;
          </blockquote>
          <p className="text-primary-foreground/70 text-sm">
            Ribuan kreator Indonesia sudah pakai ViralHook untuk bikin konten viral lebih cepat.
          </p>
        </div>
        <div className="text-primary-foreground/60 flex gap-6 text-sm">
          <span>5.000+ kreator aktif</span>
          <span>1M+ hook digenerate</span>
        </div>
      </div>

      {/* Panel kanan — form */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <Link href="/" className="mb-8 flex items-center gap-2 md:hidden">
            <Zap className="text-primary h-5 w-5" />
            <span className="font-bold">ViralHook.id</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
