# Vercel Deployment

FinanceAI tetap provider-agnostic dan tidak membutuhkan Vercel SDK di business modules. Vercel dapat mendeteksi project ini sebagai Next.js App Router secara otomatis.

## Runtime

- Node.js: 22.x direkomendasikan (minimum project: 20.9.0)
- Package manager: npm 10.9.2
- Install: `npm install --no-audit --no-fund`
- Build: `npm run build`
- Framework preset: Next.js
- Output directory: gunakan deteksi default Next.js, jangan override ke folder statis

`next.config.ts` memakai `output: "standalone"` agar artifact juga kompatibel dengan generic Node/Docker deployment.

## Environment variables

Tidak ada secret yang dibutuhkan untuk MVP local-first.

Opsional:

```text
NEXT_PUBLIC_APP_NAME=FinanceAI
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

`NEXT_PUBLIC_APP_URL` harus berupa URL valid jika diisi pada production.

## Pre-deploy quality gate

Jalankan sebelum production deployment:

```bash
npm install --no-audit --no-fund
npm run lint
npm run typecheck
npm test
npm run build
```

Workflow `.github/workflows/ci.yml` menjalankan urutan quality gate yang sama pada push ke `main` dan pull request.

## Vercel project settings

Gunakan root directory repository/project ini. Tidak diperlukan `vercel.json` untuk MVP karena tidak ada rewrite, cron, function override, atau provider-specific runtime requirement.

Setelah deployment, verifikasi minimal:

1. Dashboard, Finance, Calendar, dan Personal dapat dibuka langsung lewat URL.
2. Tidak ada error di browser console.
3. `/manifest.webmanifest`, `/sw.js`, dan icon PWA mengembalikan HTTP 200.
4. Service worker aktif pada production HTTPS.
5. Setelah app shell pernah online, navigasi utama tetap dapat digunakan saat offline.
