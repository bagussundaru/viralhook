# PROGRESS.md — ViralHook.id

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
