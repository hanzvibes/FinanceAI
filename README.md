# FinanceAI

FinanceAI adalah responsive Progressive Web App untuk keuangan dan organisasi kehidupan pribadi. MVP menggunakan Next.js App Router, TypeScript, IndexedDB, dan service worker dengan arsitektur modular, local-first, provider-agnostic, dan responsive dari smartphone hingga desktop.

## Fitur MVP PRD

- Responsive shell: floating bottom navigation di mobile, sidebar di desktop
- Dashboard keuangan berbasis transaction ledger
- Wallet create, edit, archive/reactivate, dan calculated balance
- Income, expense, transfer dengan validasi antar-wallet
- Transaction edit/delete, search, filter lengkap, dan sorting
- Financial goals: create, edit progress, pause/resume, complete, delete
- Basic analytics: cashflow 6 bulan, spending categories, wallet allocation
- Agenda: create, edit, delete, complete, search/filter, end time, location
- Notes: create, edit, delete, search
- Global search lintas feature dan data
- JSON export/import dengan structural validation
- IndexedDB local-first persistence
- Empty/loading/error/offline/storage-failure states
- PWA manifest, icons, service worker, standalone mode, explicit offline fallback
- Light/dark mode dan Impeccable-style visual system
- Docker-ready standalone output
- Provider-agnostic Node/Vercel deployment contract
- GitHub Actions quality pipeline

Status implementasi detail ada di `docs/IMPLEMENTATION_STATUS.md`.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` memakai Node test runner dan tidak menambah test framework dependency.

## Production

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t finance-ai .
docker run -p 3000:3000 finance-ai
```

## Struktur

```text
src/
├── app/                # routing dan composition
├── config/             # environment dan navigation config
├── infrastructure/     # IndexedDB dan browser integrations
├── modules/            # feature-first modules
└── shared/             # reusable UI, provider, types, validation, utils
```

Data demo dimuat saat pertama kali aplikasi dibuka dan selanjutnya disimpan ke IndexedDB pada browser pengguna.

## PWA

Service worker didaftarkan pada production build. FinanceAI menggunakan runtime caching dan `public/offline.html` sebagai fallback navigasi ketika route belum tersedia di cache.

## Impeccable UI system

Product context ada di `PRODUCT.md`, visual system di `DESIGN.md`, dan page-specific direction di `.impeccable/surfaces/`. UI menggunakan hierarchy finansial yang jelas, restrained color, border-led surfaces, adaptive mobile/desktop composition, accessible focus states, dan micro-interactions yang menghormati `prefers-reduced-motion`.

## Roadmap

Routine tracking, wishlist, personal goals, recurring transactions, notifications, authentication, cloud sync, health integrations, dan AI layer tetap Phase 2/3 sesuai PRD, bukan scope MVP.
