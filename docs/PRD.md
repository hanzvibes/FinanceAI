# FinanceAI
## Product Requirements Document

---

# 1. Product Overview

**FinanceAI** adalah Progressive Web App personal untuk membantu satu pengguna mengelola keuangan, agenda, target, rutinitas, catatan, wishlist, dan ringkasan keseharian dalam satu dashboard terpadu.

FinanceAI dirancang sebagai **personal finance and life dashboard** dengan fokus utama pada pengelolaan keuangan pribadi.

Aplikasi harus nyaman digunakan pada berbagai ukuran perangkat, mulai dari smartphone kecil hingga tablet, laptop, desktop, dan monitor berlayar besar.

FinanceAI bukan aplikasi kolaboratif dan tidak menggunakan konsep keluarga, grup, approval, role, atau pembagian akses antar pengguna.

---

# 2. Product Vision

Membangun dashboard pribadi yang memungkinkan pengguna memahami:

- Kondisi keuangan saat ini
- Pemasukan dan pengeluaran
- Kekayaan bersih
- Target finansial
- Agenda
- Rutinitas
- Catatan pribadi
- Wishlist
- Aktivitas keseharian

dalam satu aplikasi yang cepat, sederhana, privat, responsif, offline-friendly, dan dapat dipasang sebagai PWA.

FinanceAI harus terasa seperti **personal command center**, bukan aplikasi akuntansi bisnis.

---

# 3. Product Principles

## 3.1 Personal First

FinanceAI digunakan oleh satu pengguna.

Tidak ada:

- Family group
- Member
- Role
- Approval workflow
- Collaborative workspace
- Shared wallet
- Chat
- Arisan
- Split bill
- Multi-user management

## 3.2 Finance First

Keuangan adalah domain utama aplikasi.

Fitur non-finansial seperti agenda, routine, notes, wishlist, dan health menjadi lapisan tambahan untuk membangun dashboard pribadi yang lebih lengkap.

## 3.3 Responsive Across Devices

FinanceAI bukan aplikasi mobile-only.

Aplikasi harus memberikan pengalaman optimal pada:

- Smartphone kecil
- Smartphone besar
- Tablet portrait
- Tablet landscape
- Laptop
- Desktop
- Large desktop

Setiap ukuran layar dapat memiliki komposisi layout berbeda.

## 3.4 Fast to Use

Aktivitas yang sering dilakukan harus membutuhkan langkah sesedikit mungkin.

Contoh:

- Mencatat pengeluaran
- Mencatat pemasukan
- Transfer antar wallet
- Membuat agenda
- Menambah goal
- Membuat catatan

## 3.5 Calm Interface

UI harus terasa:

- Bersih
- Modern
- Personal
- Tenang
- Ringan
- Informatif
- Tidak terlalu padat

FinanceAI tidak boleh terlihat seperti software akuntansi korporat.

## 3.6 Local First

Fungsi utama aplikasi harus tetap dapat digunakan tanpa koneksi internet.

Data utama disimpan terlebih dahulu secara lokal.

Cloud sync dapat ditambahkan sebagai lapisan tambahan.

## 3.7 Provider Agnostic

FinanceAI tidak boleh bergantung secara permanen pada satu platform deployment.

Vercel dapat digunakan sebagai jalur deployment utama, tetapi aplikasi harus tetap mudah dipindahkan ke platform lain.

---

# 4. Target User

FinanceAI ditujukan untuk individu yang ingin:

- Memahami kondisi finansial pribadi
- Mengelola beberapa rekening atau wallet
- Mencatat transaksi
- Mengontrol pengeluaran
- Memantau target finansial
- Mengelola agenda
- Menjaga rutinitas
- Menyimpan notes
- Mengelola wishlist
- Memiliki satu dashboard pribadi

---

# 5. Core Jobs To Be Done

Pengguna harus dapat menjawab pertanyaan berikut dengan cepat:

- Berapa uang saya saat ini?
- Berapa total kekayaan saya?
- Berapa pengeluaran bulan ini?
- Pengeluaran terbesar saya ada di kategori apa?
- Wallet mana yang memiliki saldo terbesar?
- Target finansial saya sudah berapa persen?
- Apa agenda saya hari ini?
- Apa rutinitas saya hari ini?
- Apa transaksi terakhir saya?
- Apa yang ingin saya beli?
- Bagaimana ringkasan keseharian saya?

---

# 6. Main Navigation

FinanceAI memiliki empat area utama:

```text
Dashboard
Finance
Calendar
Personal
```

Pada desktop dapat ditambahkan:

```text
Search
Settings
```

---

# 7. Responsive Navigation

## Mobile

Gunakan floating bottom navigation.

```text
Dashboard
Finance
Calendar
Personal
```

Quick action dapat menggunakan tombol `+`.

## Tablet

Dapat menggunakan:

- Bottom navigation
- Compact sidebar

tergantung ruang layar.

## Desktop

Gunakan sidebar.

Contoh:

```text
FinanceAI

Dashboard
Finance
Calendar
Personal

Search
Settings
```

Sidebar dapat memiliki mode:

```text
Expanded
Collapsed
```

---

# 8. Dashboard

Dashboard menjadi pusat informasi FinanceAI.

Pengguna harus dapat memahami kondisi hari ini tanpa membuka banyak halaman.

## 8.1 Header

Menampilkan:

- Sapaan
- Tanggal
- Waktu
- Lokasi
- Cuaca

Contoh:

```text
Selamat pagi

Kamis, 24 September 2026
28°C • Cerah
```

Lokasi dan cuaca bersifat opsional.

---

# 9. Global Search

Search harus dapat menemukan:

- Transactions
- Wallets
- Goals
- Agenda
- Routine
- Notes
- Wishlist
- Features

Contoh:

```text
Search: "kopi"

Transactions
Kopi Shop
Rp25.000

Notes
Daftar kopi favorit
```

---

# 10. Quick Actions

Quick action utama:

```text
Tambah Pengeluaran
Tambah Pemasukan
Transfer
Tambah Agenda
Tambah Goal
Tambah Catatan
```

Pada mobile dapat tampil sebagai bottom sheet.

Pada desktop dapat tampil sebagai dropdown, dialog, atau command panel.

---

# 11. Financial Summary

Dashboard menampilkan:

- Net worth
- Available cash
- Monthly income
- Monthly expense
- Savings
- Monthly financial trend

---

# 12. Goal Summary

Menampilkan financial goals aktif.

Contoh:

```text
Dana Darurat

Rp7.200.000
dari Rp10.000.000

72%
```

---

# 13. Agenda Summary

Menampilkan agenda hari ini dan beberapa hari berikutnya.

Contoh:

```text
09:00 Meeting
13:00 Belanja
18:00 Gym
```

---

# 14. Health Summary

Modul opsional:

- Sleep duration
- Steps
- Active minutes

Jika tidak digunakan, card dapat disembunyikan.

---

# 15. Recent Transactions

Menampilkan transaksi terbaru.

Data minimum:

```text
Title
Category
Wallet
Amount
Date
```

---

# 16. Finance Module

Finance adalah domain utama FinanceAI.

Submodule:

```text
Overview
Wallets
Transactions
Goals
Categories
Analytics
Import / Export
```

---

# 17. Finance Overview

Menampilkan:

- Total assets
- Total liabilities jika digunakan
- Net worth
- Available cash
- Monthly income
- Monthly expenses
- Savings rate
- Monthly trend

---

# 18. Wallet

Wallet merepresentasikan sumber uang.

Jenis wallet dapat berupa:

```text
Cash
Bank
E-Wallet
Savings
Investment
Credit Card
Other
```

Data:

```text
id
name
type
currency
initialBalance
currentBalance
icon
color
isArchived
createdAt
updatedAt
```

Pengguna dapat:

- Membuat wallet
- Mengedit wallet
- Mengarsipkan wallet
- Melihat saldo
- Melihat transaksi
- Transfer antar wallet

---

# 19. Transactions

Jenis transaksi:

```text
income
expense
transfer
```

Data:

```text
id
walletId
destinationWalletId
type
amount
categoryId
description
note
date
createdAt
updatedAt
```

---

# 20. Expense

Input:

```text
Amount
Wallet
Category
Date
Description
Note
```

Setelah disimpan:

- Wallet balance berubah
- Monthly expense berubah
- Analytics diperbarui
- Recent transactions diperbarui

---

# 21. Income

Input:

```text
Amount
Wallet
Category
Date
Source
Note
```

Setelah disimpan:

- Wallet balance bertambah
- Monthly income diperbarui

---

# 22. Transfer

Transfer memindahkan uang antar wallet.

Contoh:

```text
BCA → GoPay
Rp500.000
```

Transfer tidak dihitung sebagai income maupun expense.

Transfer tidak memengaruhi total net worth.

---

# 23. Transaction Categories

## Expense

```text
Food
Transport
Shopping
Bills
Entertainment
Health
Education
Home
Subscription
Other
```

## Income

```text
Salary
Bonus
Freelance
Business
Investment
Refund
Gift
Other
```

Kategori custom dapat ditambahkan pada fase lanjutan.

---

# 24. Transaction Management

Pengguna dapat:

- Search
- Filter
- Sort
- Edit
- Delete

Filter berdasarkan:

```text
Date
Wallet
Category
Transaction type
Amount range
```

Penghapusan transaksi membutuhkan confirmation.

---

# 25. Financial Goals

Data:

```text
id
name
targetAmount
currentAmount
targetDate
category
status
createdAt
updatedAt
```

Status:

```text
active
paused
completed
```

Pengguna dapat:

- Membuat goal
- Menambah progress
- Mengedit target
- Pause goal
- Complete goal

---

# 26. Financial Analytics

Visualisasi minimal:

- Income vs expense
- Expense by category
- Monthly expense trend
- Net worth trend
- Wallet distribution

Chart harus responsif.

Mobile menggunakan versi lebih ringkas.

Desktop dapat menampilkan lebih banyak detail dan legend.

---

# 27. Calendar

Calendar digunakan untuk:

- Agenda
- Events
- Upcoming activities
- Routine

Agenda memiliki:

```text
id
title
description
startAt
endAt
category
location
status
createdAt
updatedAt
```

---

# 28. Routine

Routine digunakan untuk aktivitas berulang.

Contoh:

```text
Gym
Read
Take vitamins
Review finances
```

Data:

```text
id
title
frequency
days
time
reminder
createdAt
updatedAt
```

Frequency:

```text
daily
weekly
custom
```

Routine dapat ditandai selesai berdasarkan tanggal.

---

# 29. Personal Module

Personal menjadi area untuk informasi non-finansial pribadi.

Isi:

```text
Routine
Notes
Personal Goals
Wishlist
Health Summary
```

---

# 30. Notes

Data:

```text
id
title
content
createdAt
updatedAt
```

Fitur dasar:

- Create
- Edit
- Delete
- Search

---

# 31. Personal Goals

Digunakan untuk target non-finansial.

Contoh:

```text
Baca 20 buku
Lari 100 km
Belajar bahasa Jepang
```

---

# 32. Wishlist

Data:

```text
id
name
price
priority
url
note
status
createdAt
updatedAt
```

Status:

```text
wanted
planned
purchased
cancelled
```

FinanceAI dapat menampilkan total nilai wishlist.

---

# 33. Health Summary

Data opsional:

```text
date
sleepMinutes
steps
activeMinutes
```

Sumber data awal dapat berasal dari input manual.

Integrasi platform kesehatan dapat ditambahkan kemudian.

---

# 34. Responsive Layout System

FinanceAI menggunakan **adaptive responsive design**.

Layout tidak sekadar memperbesar tampilan mobile.

---

# 35. Small Screen Layout

Pada smartphone:

```text
Single column
Floating bottom navigation
Compact cards
Bottom sheets
Touch-friendly controls
```

---

# 36. Tablet Layout

Tablet dapat menggunakan:

```text
1–2 column layout
```

---

# 37. Desktop Layout

Desktop menggunakan:

```text
Sidebar
Multi-column dashboard
Larger charts
Data tables
Persistent filters
```

---

# 38. Large Desktop

Konten tidak boleh terus melebar mengikuti viewport.

Gunakan maximum content width.

Target awal:

```text
1440–1600px
```

Chart atau data-heavy page dapat menggunakan area lebih luas bila diperlukan.

---

# 39. Responsive Tables

Desktop:

```text
Date | Transaction | Category | Wallet | Amount
```

Mobile:

```text
Coffee Shop
Food

BCA
-Rp35.000

24 Sep 2026
```

Data tetap sama.

Presentation menyesuaikan perangkat.

---

# 40. Responsive Forms

Mobile:

```text
Single-column
Bottom sheet
Full-screen sheet
```

Desktop:

```text
Dialog
Side panel
Two-column form
```

---

# 41. Touch, Mouse and Keyboard

FinanceAI harus mendukung:

```text
Touch
Mouse
Trackpad
Keyboard
```

Fitur utama tidak boleh bergantung pada hover.

Desktop dapat menyediakan:

- Hover state
- Tooltip
- Keyboard shortcut

---

# 42. Breakpoints

Baseline:

```text
sm  ≈ 640px
md  ≈ 768px
lg  ≈ 1024px
xl  ≈ 1280px
2xl ≈ 1536px
```

Breakpoint dapat berubah berdasarkan kebutuhan layout.

---

# 43. PWA Requirements

FinanceAI harus installable sebagai PWA.

Minimum:

- Web App Manifest
- Service Worker
- App icons
- Maskable icons
- Standalone mode
- Offline fallback
- Responsive layout
- Theme color
- Safe-area support
- HTTPS

Manifest:

```text
name: FinanceAI
short_name: FinanceAI
display: standalone
```

---

# 44. Offline Behaviour

Saat offline pengguna tetap dapat:

- Membuka dashboard
- Melihat wallet
- Melihat transaksi
- Menambah transaksi
- Membuat agenda
- Membuat notes
- Melihat goals

Perubahan lokal disimpan terlebih dahulu.

Jika cloud sync tersedia:

```text
Local Change
↓
Sync Queue
↓
Connection Restored
↓
Cloud Sync
```

---

# 45. Data Architecture

FinanceAI menggunakan local-first architecture.

```text
UI
 ↓
Application Layer
 ↓
Repository
 ↓
Local Database
 ↓
Sync Engine
 ↓
Cloud Database
```

UI tidak boleh mengakses database langsung.

---

# 46. Financial Source of Truth

Transaction ledger menjadi sumber utama data finansial.

Formula:

```text
Initial Balance
+ Income
- Expense
+ Incoming Transfers
- Outgoing Transfers
= Current Balance
```

Saldo wallet boleh disimpan untuk performa, tetapi harus dapat dihitung ulang dari transaksi.

---

# 47. Currency

Versi awal:

```text
IDR
```

Format:

```text
Rp1.250.000
```

Nominal disimpan sebagai integer untuk menghindari floating-point error.

---

# 48. Date and Time

Gunakan timezone lokal pengguna.

Format:

```text
24 Sep 2026
18:30
```

---

# 49. Import and Export

FinanceAI mendukung backup data.

Minimum format:

```text
JSON
```

Export mencakup:

- Wallets
- Transactions
- Financial goals
- Agenda
- Routine
- Notes
- Personal goals
- Wishlist

Import harus divalidasi sebelum data diterapkan.

---

# 50. Notification

Notifikasi bersifat opt-in.

Dapat digunakan untuk:

- Agenda
- Routine
- Goal reminder
- Financial review

---

# 51. Privacy

Data FinanceAI bersifat private by default.

Tidak ada data finansial publik.

Prinsip:

- No public financial URL
- No automatic sharing
- No hidden upload
- Secrets tidak disimpan di client
- Cloud backup membutuhkan authentication

Future:

```text
PIN lock
Biometric lock
Encrypted backup
```

---

# 52. Technical Architecture

FinanceAI menggunakan:

```text
Modular Monolith
Feature First
Local First
Offline Friendly
Provider Agnostic
Deployment Portable
Responsive PWA
```

---

# 53. Recommended Stack

Baseline:

```text
Next.js
TypeScript
Tailwind CSS
IndexedDB
PWA Service Worker
```

Future backend dapat menggunakan layanan seperti Supabase atau provider lain melalui abstraction layer.

---

# 54. Project Structure

Recommended root structure:

```text
finance-ai/
│
├── public/
│
├── src/
│   ├── app/
│   ├── modules/
│   ├── shared/
│   ├── infrastructure/
│   ├── config/
│   └── styles/
│
├── tests/
│
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

# 55. App Layer

`app/` hanya digunakan untuk:

```text
Routing
Layouts
Metadata
Loading states
Error boundaries
Page composition
```

Business logic tidak boleh tinggal di `page.tsx`.

Contoh:

```tsx
import { FinanceOverview } from "@/modules/finance";

export default function FinancePage() {
  return <FinanceOverview />;
}
```

---

# 56. Module Structure

Modules:

```text
modules/
├── dashboard/
├── finance/
│   ├── wallet/
│   ├── transaction/
│   ├── goal/
│   ├── category/
│   ├── analytics/
│   └── import-export/
│
├── calendar/
├── routine/
├── notes/
├── personal-goal/
├── wishlist/
├── health/
└── search/
```

---

# 57. Feature Structure

Contoh:

```text
transaction/
├── components/
├── hooks/
├── services/
├── repository/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Tidak semua folder harus dibuat sejak awal.

Struktur tumbuh sesuai kompleksitas.

---

# 58. Shared Layer

`shared/` hanya digunakan untuk code yang benar-benar digunakan oleh beberapa module.

```text
shared/
├── components/
│   ├── ui/
│   └── layout/
│
├── hooks/
├── utils/
├── types/
└── constants/
```

Component spesifik finance tidak boleh masuk `shared`.

---

# 59. Infrastructure Layer

```text
infrastructure/
├── database/
├── storage/
├── sync/
├── pwa/
├── integrations/
└── platform/
```

Detail teknologi hidup di sini.

---

# 60. Repository Pattern

UI tidak boleh berbicara langsung dengan IndexedDB.

Gunakan:

```text
UI
↓
Use Case
↓
Repository Interface
↓
Repository Implementation
↓
Storage
```

Contoh:

```text
TransactionRepository
        │
        ├── IndexedDBTransactionRepository
        └── CloudTransactionRepository
```

---

# 61. Public Module API

Setiap module sebaiknya memiliki:

```text
index.ts
```

Contoh:

```ts
export { TransactionList } from "./components/transaction-list";
export { createTransaction } from "./services/create-transaction";
export type { Transaction } from "./types/transaction.types";
```

Hindari deep import lintas module.

---

# 62. Dependency Rules

Allowed:

```text
app → modules
app → shared
modules → shared
```

Tidak boleh:

```text
shared → module
module → app
```

Circular dependency tidak diperbolehkan.

---

# 63. State Management

Gunakan state sesuai jenisnya.

```text
Persistent data
→ Repository / database

URL state
→ search params

Form state
→ component / form layer

UI state
→ local React state

Global UI state
→ global store jika benar-benar diperlukan
```

Hindari satu global store raksasa.

---

# 64. Client and Server Components

Client Component hanya digunakan ketika dibutuhkan untuk:

- Browser API
- State
- Event handlers
- Interactive UI

Jangan menjadikan seluruh halaman Client Component bila hanya satu elemen yang membutuhkan interaktivitas.

---

# 65. Naming Convention

Files:

```text
transaction-form.tsx
transaction-list.tsx
use-transactions.ts
create-transaction.ts
transaction.repository.ts
```

Components:

```text
TransactionForm
TransactionList
```

Hooks:

```text
useTransactions
useWallet
```

Types:

```text
Transaction
Wallet
FinancialGoal
```

Hindari nama generik seperti:

```text
helper.ts
misc.ts
utils2.ts
functions.ts
```

---

# 66. Deployment Philosophy

FinanceAI harus provider-agnostic.

Deployment provider hanyalah tempat aplikasi berjalan.

Business logic tidak boleh bergantung pada provider.

---

# 67. Standard Build Interface

Repository harus mendukung:

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
pnpm start
```

Kontrak utama production build:

```bash
pnpm build
```

Bukan:

```text
vercel build
netlify build
wrangler build
```

---

# 68. Deployment Targets

FinanceAI harus dapat berkembang agar mendukung:

```text
Vercel
Netlify
Cloudflare
Railway
Render
Docker
VPS
Generic Node hosting
Static hosting
```

Tidak semua target wajib dikonfigurasi sejak MVP.

---

# 69. Deployment Profiles

## Node

```text
next build
next start
```

## Docker

```text
Source
↓
Docker Build
↓
Production Image
↓
Container Platform
```

## Static

Untuk deployment yang tidak membutuhkan server-only features:

```text
Next.js
↓
Static Export
↓
HTML / CSS / JS
↓
Static Hosting
```

---

# 70. Docker

Repository sebaiknya memiliki:

```text
Dockerfile
.dockerignore
```

Gunakan multi-stage build:

```text
deps
↓
builder
↓
runner
```

---

# 71. Environment Variables

Environment configuration harus terpusat.

Contoh:

```text
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_URL

DATABASE_URL

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

WEATHER_API_KEY
AI_API_KEY
```

Validation:

```text
src/config/env.ts
```

Module tidak dianjurkan mengakses `process.env` secara acak.

---

# 72. Environments

FinanceAI dapat menggunakan:

```text
development
preview
production
```

Opsional:

```text
staging
```

Business behavior tidak boleh bergantung pada nama provider.

---

# 73. CI/CD

Baseline pipeline:

```text
Git Push
↓
Install
↓
Lint
↓
Type Check
↓
Tests
↓
Build
↓
Deploy
```

Tahap terakhir dapat berbeda berdasarkan platform.

---

# 74. Provider Isolation

Tidak diperbolehkan:

```text
finance module
↓
vercel-specific API
```

Integrasi provider-specific harus berada di:

```text
infrastructure/platform/
```

Contoh:

```text
platform/
├── generic/
├── vercel/
└── cloudflare/
```

---

# 75. Design System

Core components:

```text
Button
IconButton
Card
StatCard
WalletCard
GoalCard
TransactionRow
AgendaItem

Input
Select
DatePicker

Dialog
Sheet
BottomSheet

Tabs
Progress
Toast
Tooltip

Skeleton
EmptyState

BottomNavigation
Sidebar
PageHeader
```

---

# 76. Empty States

Tidak boleh ada halaman kosong tanpa panduan.

Contoh:

```text
Belum ada transaksi.

Catat transaksi pertamamu untuk mulai melihat arus keuangan.
```

---

# 77. Error States

FinanceAI harus memiliki:

- Friendly error messages
- Retry action
- Offline state
- Validation error
- Import error
- Sync error

Error teknis mentah tidak boleh langsung ditampilkan ke pengguna.

---

# 78. Loading States

Gunakan:

```text
Skeleton
Progress indicator
Optimistic feedback
```

Hindari blank screen selama loading.

---

# 79. MVP Scope

MVP FinanceAI mencakup:

- Responsive application shell
- Mobile bottom navigation
- Desktop sidebar
- Dashboard
- Wallets
- Income
- Expense
- Transfers
- Transactions
- Search transactions
- Transaction filters
- Finance summary
- Financial goals
- Basic analytics
- Basic calendar
- Agenda
- Notes
- JSON export
- JSON import
- IndexedDB
- Offline support
- PWA installability
- Responsive layout
- Vercel-compatible deployment
- Generic production build

---

# 80. Phase 2

Tambahkan:

- Routine
- Wishlist
- Personal goals
- Custom transaction categories
- Recurring transactions
- Advanced analytics
- Global search
- Notifications
- Investment tracking

---

# 81. Phase 3

Tambahkan:

- Authentication
- Cloud sync
- Cross-device sync
- Conflict resolution
- Encrypted backup
- Health integration
- Automatic financial import
- Advanced financial insights

---

# 82. AI Layer

AI bukan requirement MVP.

Future FinanceAI dapat menjawab:

```text
"Pengeluaran terbesar saya bulan ini apa?"

"Berapa rata-rata pengeluaran makanan saya?"

"Bandingkan pengeluaran bulan ini dengan bulan lalu."

"Kalau saya menabung Rp1 juta per bulan,
kapan target laptop tercapai?"

"Apa agenda saya besok?"

"Ringkas kondisi keuangan saya."
```

AI tidak boleh:

- Menghapus data tanpa confirmation
- Mengubah transaksi tanpa persetujuan
- Memindahkan uang
- Membuat keputusan finansial otomatis

---

# 83. Non Goals

FinanceAI tidak ditujukan untuk:

- Accounting bisnis
- ERP
- Payroll
- Business inventory
- Invoice bisnis
- Family finance
- Group finance
- Member management
- Roles
- Approval
- Shared workspace
- Split bill
- Chat
- Arisan

---

# 84. Success Criteria

FinanceAI MVP dianggap berhasil apabila pengguna dapat:

1. Membuka FinanceAI di smartphone maupun desktop.
2. Menginstal FinanceAI sebagai PWA.
3. Menggunakan aplikasi dalam kondisi offline.
4. Membuat wallet.
5. Mencatat income.
6. Mencatat expense.
7. Transfer antar wallet.
8. Melihat saldo setiap wallet.
9. Melihat net worth.
10. Melihat monthly income.
11. Melihat monthly expense.
12. Melihat transaction history.
13. Search dan filter transaksi.
14. Membuat financial goal.
15. Melihat progress goal.
16. Membuat agenda.
17. Melihat agenda hari ini.
18. Membuat notes.
19. Export data.
20. Import data.
21. Menggunakan layout yang nyaman pada mobile, tablet, dan desktop.
22. Menjalankan production build tanpa ketergantungan pada deployment provider tertentu.

---

# 85. Primary User Flow

```text
Open FinanceAI
        ↓
Dashboard
        ↓
Review Today
        ↓
Quick Action
        ↓
Add Transaction / Agenda
        ↓
Save
        ↓
Local Database Updated
        ↓
Dashboard Updated
```

Finance flow:

```text
Finance
   ↓
Wallet
   ↓
Transaction
   ↓
Income / Expense / Transfer
   ↓
Save
   ↓
Wallet Balance Updated
   ↓
Financial Summary Updated
```

---

# 86. Final Product Definition

FinanceAI adalah:

> **Responsive personal finance and life dashboard untuk membantu satu pengguna memahami dan mengelola uang, waktu, target, rutinitas, dan aktivitas keseharian dalam satu Progressive Web App.**

FinanceAI dibangun dengan prinsip:

```text
Personal First
Finance First
Responsive
Local First
Offline Friendly
Clean Architecture
Feature First
Modular
Scalable
Provider Agnostic
Deployment Portable
Privacy Focused
```

Target teknis FinanceAI bukan hanya membuat aplikasi yang berfungsi hari ini.

Targetnya adalah membangun fondasi yang cukup sederhana untuk dikembangkan sekarang, tetapi cukup modular untuk bertumbuh tanpa membutuhkan rewrite besar ketika fitur, jumlah data, integrasi, atau deployment environment menjadi lebih kompleks.
