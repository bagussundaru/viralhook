# PROGRESS.md — ViralHook.id

## ✅ FASE 3 — Caption & Hashtag Generator

**Status:** Selesai
**Tanggal:** 2026-04-25

### Yang Sudah Dibuat

- `src/lib/validations/caption.ts` — Zod schema input/output + konstanta (CAPTION_STYLE_LABELS, CAPTION_STYLE_DESC)
- `src/lib/ai/prompts/caption.ts` — System prompt + user prompt builder
- `src/app/api/generate/caption/route.ts` — POST endpoint: validasi → quota → AI (claude-3-5-haiku) → parse → simpan DB
- `src/app/(dashboard)/dashboard/caption/page.tsx` — UI form + 3 variasi caption + 3 set hashtag

### Fitur UI

- Form: topik, hook (opsional), niche, tone, platform, audience
- Pre-fill dari query params (navigasi dari hook page)
- 3 variasi caption (singkat/medium/storytelling) dengan copy per caption
- Tombol "Copy + Hashtag Mix" untuk salin caption sekaligus dengan hashtag
- 3 set hashtag (niche/mix/viral) dengan jumlah tag per set
- Tips engagement AI di bawah hasil
- Tombol "Buat Caption" (ikon #) di hook page → navigasi ke caption page pre-filled

### Cara Test

1. Dari `/dashboard/hook`, generate hook → klik ikon # (ungu) → terbuka caption page pre-filled
2. Atau langsung ke `/dashboard/caption`, isi form → klik Generate
3. Cek 3 variasi caption dan 3 set hashtag
4. Coba "Copy + Hashtag Mix" untuk salin caption + hashtag sekaligus

### Acceptance Criteria

- [x] Generate 3 variasi caption (singkat/medium/storytelling)
- [x] Generate 3 set hashtag (niche 10-12 tag / mix 20-22 tag / viral 25-28 tag)
- [x] Copy per caption dan copy per hashtag set
- [x] Integrasi hook opsional dalam caption
- [x] Integrasi dari hook page (pre-fill via query params)
- [x] UsageLog terisi dengan model, token, cost, latency

---

## ✅ FASE 2 — Script Generator

**Status:** Selesai
**Tanggal:** 2026-04-25

### Yang Sudah Dibuat

- `src/lib/validations/script.ts` — Zod schema input/output + konstanta (CTA_TYPE_OPTIONS, SEGMENT_COLORS, SEGMENT_LABELS)
- `src/lib/ai/prompts/script.ts` — System prompt + user prompt builder dengan timing struktur
- `src/app/api/generate/script/route.ts` — POST endpoint: validasi → quota → AI (claude-sonnet-4) → parse → simpan DB
- `src/app/(dashboard)/dashboard/script/page.tsx` — UI form + hasil dengan tab segmen + teleprompter

### Fitur UI

- Form: hook textarea, topik, niche/tone/audiens, durasi (15/30/60s toggle), CTA switch + tipe CTA
- Pre-fill otomatis dari query params ketika navigasi dari hook page
- Hasil Tab "Per Segmen": tiap segmen dengan timing, warna per tipe, copy per segmen
- Hasil Tab "Teleprompter": hook kuning, CTA ungu, font besar untuk dibaca saat syuting
- B-Roll suggestions di bawah script
- Tombol "Buat Script" di halaman hook → navigasi ke /dashboard/script dengan hook + context

### Cara Test

1. Dari `/dashboard/hook`, generate hook → klik ikon FileText → terbuka script page pre-filled
2. Atau langsung ke `/dashboard/script`, isi form manual → klik Generate Script
3. Cek tab Per Segmen dan Teleprompter
4. Coba copy per segmen dan copy semua

### Acceptance Criteria

- [x] Generate script dari hook dalam < 15 detik
- [x] Timing per segmen sesuai durasi (15/30/60s)
- [x] Mode teleprompter dengan highlight warna
- [x] B-Roll suggestions muncul
- [x] Integrasi dari hook page (pre-fill via query params)
- [x] UsageLog terisi dengan model, token, cost, latency

---

## ✅ FASE 1 — Hook Generator

**Status:** Selesai
**Tanggal:** 2026-04-25

### Yang Sudah Dibuat

- `src/lib/validations/hook.ts` — Zod schema input/output + konstanta opsi
- `src/lib/ai/prompts/hook.ts` — System prompt + user prompt builder
- `src/lib/ai/client.ts` — Agent Router client (OpenAI-compatible) + cost estimator
- `src/lib/quota.ts` — Quota checker untuk FREE/CREATOR/PRO plan
- `src/app/api/generate/hook/route.ts` — POST endpoint: validasi → quota → AI → simpan DB
- `src/app/api/generations/[id]/route.ts` — PATCH endpoint: update favorited
- `src/app/(dashboard)/dashboard/hook/page.tsx` — UI form + 10 hasil hook

### Fitur UI

- Form: topik (textarea), niche, tone, platform, audiens (4 select)
- Hasil 10 hook dengan badge framework + emosi
- Per hook: copy, bintang favorit, regenerate satu hook
- Copy semua hook sekaligus
- Error handling quota (429) dan AI error (503)

### Cara Test

1. Pastikan `AGENT_ROUTER_API_KEY` dan `AGENT_ROUTER_BASE_URL` diisi di `.env.local`
2. Jalankan `npm run dev`
3. Login → buka `/dashboard/hook`
4. Isi topik → klik Generate
5. Cek 10 hook muncul, coba copy, favorite, regenerate

### Acceptance Criteria

- [x] Generate 10 hook dalam < 10 detik
- [x] Quota free user ter-track (5/hari via UsageLog)
- [x] Hasil tersimpan di tabel Generation
- [x] Copy, favorite, regenerate per hook berfungsi
- [x] UsageLog terisi dengan model, token, cost, latency

---

## ✅ FASE 0 — Setup Proyek & Infrastruktur Dasar

**Status:** Selesai  
**Tanggal:** 2026-04-25

---

### Yang Sudah Dibuat

#### Stack & Dependencies

- **Next.js 16.2.4** (App Router) + TypeScript strict mode
- **Tailwind CSS v4** + **shadcn/ui v4** (pakai `@base-ui/react` bukan Radix)
- **Prisma 7.8.0** + `@prisma/adapter-pg` (driver adapter wajib di Prisma 7)
- **better-auth 1.6.9** (email/password + Google OAuth)
- **Husky 9** + lint-staged + Prettier

#### Breaking Changes yang Ditemukan & Ditangani

| Library        | Breaking Change                                             | Solusi                                    |
| -------------- | ----------------------------------------------------------- | ----------------------------------------- |
| **Next.js 16** | `middleware.ts` → `proxy.ts`, fungsi `middleware` → `proxy` | Renamed dan updated                       |
| **Next.js 16** | `asChild` (Radix) tidak ada di shadcn v4                    | Pakai `render` prop dari `@base-ui/react` |
| **Prisma 7**   | `url` di `schema.prisma` dihapus                            | URL dipindah ke `prisma.config.ts`        |
| **Prisma 7**   | `PrismaClient` wajib pakai adapter                          | Install `@prisma/adapter-pg`              |
| **Prisma 7**   | `datasourceUrl` di constructor dihapus                      | Gunakan adapter pg langsung               |

#### File & Direktori yang Dibuat

```
src/
  app/
    (auth)/
      layout.tsx          — Auth layout (split panel: branding + form)
      masuk/page.tsx      — Halaman login
      daftar/page.tsx     — Halaman register
    (dashboard)/
      layout.tsx          — Dashboard layout (sidebar + main)
      dashboard/page.tsx  — Halaman dashboard utama
    api/
      auth/[...all]/route.ts — better-auth API route
    layout.tsx            — Root layout dengan metadata SEO
    page.tsx              — Landing page (Hero + Features + Pricing)
  components/
    layout/
      navbar.tsx          — Navbar responsif dengan auth state
      sidebar.tsx         — Sidebar navigasi dashboard
      footer.tsx          — Footer
    ui/                   — shadcn/ui components
  lib/
    auth.ts               — better-auth server config
    auth-client.ts        — better-auth client config
    prisma.ts             — Prisma singleton dengan pg adapter
  generated/
    prisma/               — Prisma generated client (di .gitignore)
  proxy.ts                — Next.js 16 proxy (auth guard)
prisma/
  schema.prisma           — Schema: User, Session, Account, Verification,
                            Subscription, UsageLog, Generation
prisma.config.ts          — Prisma 7 datasource config
docker-compose.yml        — PostgreSQL + App untuk dev
Dockerfile                — Multi-stage build (dev + builder + production)
.env.example              — Template semua env vars
.prettierrc               — Prettier config
.husky/pre-commit         — Run lint-staged sebelum commit
```

#### Schema Prisma

- `User` — dengan `deletedAt` untuk soft delete
- `Session`, `Account`, `Verification` — required by better-auth
- `Subscription` — track plan & Midtrans order
- `UsageLog` — AI observability (model, tokens, cost, latency)
- `Generation` — riwayat generate dengan soft delete

---

### Cara Test Manual

1. **Setup database lokal:**

   ```bash
   # Start PostgreSQL via Docker
   docker compose up db -d

   # Run migrations
   npm run db:migrate
   ```

2. **Jalankan dev server:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local dengan credentials yang benar
   npm run dev
   ```

3. **Acceptance criteria FASE 0:**
   - [ ] Buka `http://localhost:3000` → landing page muncul
   - [ ] Klik "Daftar Gratis" → form register muncul
   - [ ] Register dengan email/password → redirect ke `/dashboard`
   - [ ] Dashboard muncul dengan nama user
   - [ ] `npm run typecheck` → 0 error

---

### Environment Variables yang Wajib Diisi

```bash
DATABASE_URL=postgresql://viralhook:viralhook123@localhost:5432/viralhook_db
BETTER_AUTH_SECRET=<random 32+ chars>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional untuk Google OAuth:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

### Step Selanjutnya — FASE 1

**Hook Generator** — fitur inti pertama:

- Form input topik, niche, tone, platform, audience
- API route `/api/generate/hook` dengan quota check
- Integrasi Agent Router (OpenRouter-compatible)
- Display 10 hook hasil dengan copy/favorite/regenerate

**Konfirmasi dulu sebelum mulai FASE 1.**
