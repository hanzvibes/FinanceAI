---
colors:
  canvas: "#f4f5f1"
  surface: "#fdfdfb"
  surfaceSubtle: "#f7f8f5"
  text: "#171c19"
  muted: "#68716c"
  border: "#dfe4df"
  action: "#173f35"
  actionSoft: "#e5eee9"
  success: "#26715a"
  danger: "#a64b45"
  transfer: "#59658e"
radii:
  card: "16px"
  control: "10px"
  compact: "9px"
spacing:
  pageDesktop: "30px"
  pageMobile: "14-18px"
  sectionGap: "20px"
  gridGap: "10-14px"
---

# Overview
FinanceAI uses a calm product-interface register. Design serves scanning, comparison, and fast data entry. It should feel precise and personal, not promotional or decorative.

# Colors
Use warm neutral surfaces for most of the product. Dark green is the primary action and selection color. Do not tint every panel. Reserve semantic green, red, and blue-gray for income/success, expense/destructive actions, and transfers.

Color must never be the only cue for meaning. Keep labels and icons alongside semantic color.

# Typography
Use the native variable/system stack to avoid network-dependent font loading and layout shifts:

`"Segoe UI Variable", "SF Pro Text", "Avenir Next", system-ui, sans-serif`

Headings use tighter tracking and stronger hierarchy. Supporting labels stay readable at 10–11px and are not forced into decorative all-caps. Monetary values use tabular numerals where practical.

# Layout
Desktop uses a light 232px sidebar and a centered content region capped near 1480px. Mobile uses a floating bottom navigation and a single-column content flow.

Use spacing to group related content before adding containers. Do not create a new card merely to separate every piece of information.

# Elevation & Depth
Default cards use borders without shadows. Shadows are reserved for floating layers: search results, modals, toasts, and mobile navigation. Avoid decorative glows.

# Shapes
Cards use 16px radius, controls 9–10px, and semantic pills use fully rounded shapes. Avoid making every icon sit inside a rounded-square tile.

# Components
- Primary button: solid dark green, no gradient, clear hover/focus state.
- Secondary button: neutral surface with border.
- Cards: neutral surface + border. Use a solid dark hero surface only for the highest-priority financial summary.
- Search: restrained bordered field; results appear in a single floating surface.
- Tables: subtle row separators, no heavy grid lines.
- Forms: 42px minimum control height, visible labels, strong keyboard focus.
- Navigation: selection uses a soft green background rather than a saturated rail.

# Do's and Don'ts
## Do
- Make financial hierarchy obvious before adding decoration.
- Keep touch targets around 44px on mobile.
- Preserve keyboard focus and semantic labels.
- Reflow layouts rather than shrinking desktop compositions.
- Use consistent spacing and shared design tokens.

## Don't
- Use purple/blue AI gradients or ornamental gradients.
- Add shadows to every card.
- Nest cards inside cards without an information-architecture reason.
- Use tiny uppercase labels as the main hierarchy device.
- Depend on hover for essential actions.
- Stretch mobile layouts across desktop widths.

## Visual QA pass

The current UI has been reviewed with the following rules:

- Financial visualizations must represent actual application data; decorative fake charts are avoided.
- Body and supporting text should remain readable on both desktop and mobile; avoid sub-10px UI copy for meaningful information.
- Income, expense, and transfer use semantic color as a secondary cue, while signs, icons, and labels remain the primary cue.
- Empty states must explain the next useful action instead of leaving blank cards.
- Dashboard hierarchy prioritizes net worth, monthly cash flow, active goals, agenda, wallet balances, and recent transactions in that order.
- Desktop uses higher information density, while small screens reflow into one-column reading order without hiding essential data.
- Surfaces stay mostly flat. Borders and spacing communicate grouping before shadows or decoration.

## Premium Polish v2

### Theme
- Mendukung light dan dark theme tanpa mengubah struktur informasi.
- Theme disimpan di `localStorage` dengan key `financeai-theme` dan mengikuti preferensi sistem pada kunjungan pertama.
- Dark mode menggunakan surface bertingkat, bukan sekadar membalik warna.
- Warna status tetap semantik: income/success, expense/danger, transfer/netral.

### Financial visualization
- Semua chart harus berasal dari ledger atau data nyata pengguna.
- Dashboard menggunakan sparkline net cashflow enam bulan sebagai konteks sekunder, bukan dekorasi utama.
- Finance menggunakan grouped bar chart income vs expense enam bulan.
- Chart tidak memakai dependency eksternal agar bundle MVP tetap kecil dan portable.
- Tooltip native SVG tersedia lewat `<title>` dan legend selalu terlihat.

### Motion
- Motion digunakan untuk feedback, bukan hiasan.
- Page entry maksimal ~300ms dan hanya opacity/translate kecil.
- Hover lift dibatasi 1–2px pada pointer devices.
- Button active menggunakan scale ringan.
- Seluruh motion menghormati `prefers-reduced-motion`.

### Responsive analytics
- Chart desktop memanfaatkan ruang penuh card.
- Pada mobile, chart memiliki local horizontal scroll agar label dan perbandingan data tidak dipaksa terlalu rapat.
- Layout analytics berubah dari dua kolom menjadi satu kolom sebelum tablet sempit.

## Impeccable Impact Pass

The product now uses three explicit surface levels: primary, secondary, and compact. The dashboard reserves the primary level for net worth and monthly cashflow only. Responsive navigation progresses from full sidebar to compact rail to mobile bottom navigation, while create/edit flows progress from desktop dialog to mobile bottom sheet. Transaction rows share one scan order across table and mobile feed: semantic icon/type, description, context, amount. Motion uses shared 160/220/280ms timing tokens and remains subordinate to information hierarchy.
