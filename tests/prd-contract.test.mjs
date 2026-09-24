import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("PWA manifest identifies FinanceAI as an installable standalone app", async () => {
  const manifest = JSON.parse(await read("public/manifest.webmanifest"));
  assert.equal(manifest.name, "FinanceAI");
  assert.equal(manifest.short_name, "FinanceAI");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192" && /maskable/.test(icon.purpose ?? "")));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512" && /maskable/.test(icon.purpose ?? "")));
});

test("service worker precaches every PRD-critical offline route and uses lifecycle-safe caching", async () => {
  const sw = await read("public/sw.js");
  for (const route of ["/finance", "/calendar", "/personal", "/offline.html"]) assert.match(sw, new RegExp(route.replace("/", "\\/")));
  assert.match(sw, /request\.mode === "navigate"/);
  assert.match(sw, /event\.waitUntil/);
});

test("offline app-shell navigation falls back to document requests", async () => {
  const shell = await read("src/shared/components/layout/app-shell.tsx");
  assert.match(shell, /useSyncExternalStore/);
  assert.match(shell, /window\.location\.assign/);
  assert.match(shell, /Offline · tetap bisa dipakai/);
});

test("provider exposes required MVP CRUD operations", async () => {
  const provider = await read("src/shared/providers/finance-provider.tsx");
  for (const operation of ["updateWallet", "archiveWallet", "updateTransaction", "deleteTransaction", "updateGoal", "deleteGoal", "updateAgenda", "deleteAgenda", "updateNote", "deleteNote"]) assert.match(provider, new RegExp(operation));
});

test("backup validation rejects duplicate entity IDs and supports the PRD other wallet type", async () => {
  const validation = await read("src/shared/validation/app-state.ts");
  const domain = await read("src/shared/types/domain.ts");
  for (const entity of ["wallet", "transaksi", "financial goal", "agenda", "catatan"]) assert.match(validation, new RegExp(entity));
  assert.match(validation, /duplikat/);
  assert.match(domain, /"other"/);
});

test("CI runs all production quality gates without assuming an absent lockfile cache", async () => {
  const ci = await read(".github/workflows/ci.yml");
  for (const command of ["npm run lint", "npm run typecheck", "npm test", "npm run build"]) assert.match(ci, new RegExp(command.replaceAll(" ", "\\s+")));
  assert.doesNotMatch(ci, /cache:\s*npm/);
});

test("business modules do not import Vercel-specific SDKs", async () => {
  const files = ["src/modules/finance/components/finance-page.tsx", "src/modules/calendar/components/calendar-page.tsx", "src/modules/personal/components/personal-page.tsx"];
  for (const file of files) assert.doesNotMatch(await read(file), /@vercel\//);
});

test("production UX keeps quick entry progressive and finance analytics switchable", async () => {
  const quickAdd = await read("src/modules/quick-add/components/quick-add.tsx");
  const finance = await read("src/modules/finance/components/finance-page.tsx");
  assert.match(quickAdd, /<details className="form-details">/);
  assert.match(quickAdd, /currency-input/);
  assert.match(finance, /chartMonths/);
  assert.match(finance, /3 Bulan/);
  assert.match(finance, /6 Bulan/);
  assert.match(finance, /1 Tahun/);
  assert.match(finance, /TransactionReceiptDeck/);
  assert.match(finance, /Riwayat transaksi/);
  assert.match(finance, /filter-disclosure/);
});

test("modal and mobile UX retain keyboard focus and touch-friendly production affordances", async () => {
  const modal = await read("src/shared/components/ui/modal.tsx");
  const css = await read("src/app/globals.css");
  assert.match(modal, /restoreFocusRef/);
  assert.match(modal, /event\.key !== "Tab"/);
  assert.match(modal, /event\.key === "Escape"/);
  assert.match(css, /min-height:\s*40px/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("PWA install remains user initiated and offline state stays explicit", async () => {
  const pwa = await read("src/infrastructure/pwa/pwa-register.tsx");
  const personal = await read("src/modules/personal/components/personal-page.tsx");
  const shell = await read("src/shared/components/layout/app-shell.tsx");
  assert.match(pwa, /beforeinstallprompt/);
  assert.match(pwa, /Install FinanceAI/);
  assert.match(personal, /PwaInstallButton/);
  assert.match(shell, /Mode offline aktif/);
  assert.match(shell, /aria-live="polite"/);
});

test("impact UI pass preserves the Impeccable hierarchy and unified surface system", async () => {
  const dashboard = await read("src/modules/dashboard/components/dashboard-page.tsx");
  const finance = await read("src/modules/finance/components/finance-page.tsx");
  const css = await read("src/app/globals.css");
  assert.match(dashboard, /card-primary hero-card/);
  assert.match(dashboard, /hero-primary-action/);
  assert.match(finance, /card-secondary analytics-card/);
  assert.match(finance, /TransactionReceiptDeck/);
  for (const token of ["card-primary", "card-secondary", "card-compact"]) assert.match(css, new RegExp(token));
});

test("responsive navigation and dialogs implement rail-to-bottom-nav and dialog-to-sheet behavior", async () => {
  const shell = await read("src/shared/components/layout/app-shell.tsx");
  const modal = await read("src/shared/components/ui/modal.tsx");
  const css = await read("src/app/globals.css");
  assert.match(shell, /navigation-rail/);
  assert.match(shell, /pathname !== "\/"/);
  assert.match(modal, /sheet-handle/);
  assert.match(modal, /modal-body/);
  assert.match(css, /min-width:\s*901px/);
  assert.match(css, /sheet-enter/);
  assert.match(css, /bottom-nav/);
});

test("impact UI pass retains explicit loading, empty, disabled, offline, success and reduced-motion states", async () => {
  const shell = await read("src/shared/components/layout/app-shell.tsx");
  const quickAdd = await read("src/modules/quick-add/components/quick-add.tsx");
  const css = await read("src/app/globals.css");
  assert.match(shell, /aria-busy/);
  assert.match(shell, /Mode offline aktif/);
  assert.match(quickAdd, /success-toast/);
  assert.match(css, /button:disabled/);
  assert.match(css, /empty-panel/);
  assert.match(css, /prefers-reduced-motion/);
});


test("wallet form uses a custom touch picker and assigns accents automatically", async () => {
  const financePage = await read("src/modules/finance/components/finance-page.tsx");
  const nativeCss = await read("src/app/native.css");
  assert.doesNotMatch(financePage, /type="color"/);
  assert.doesNotMatch(financePage, /form\.get\("accent"\)/);
  assert.match(financePage, /walletTypeAccents/);
  assert.match(financePage, /wallet-type-picker/);
  assert.match(financePage, /role="radiogroup"/);
  assert.match(financePage, /type="hidden" name="type" value={walletType}/);
  assert.match(financePage, /setWalletType\(wallet\.type\)/);
  assert.doesNotMatch(financePage, /description="Atur sumber saldo[\s\S]*?<select name="type"[\s\S]*?Simpan wallet/);
  assert.match(nativeCss, /\.wallet-type-option\.active/);
  assert.match(nativeCss, /@media \(max-width: 560px\)/);
});


test("modal matches the mobile navigation breakpoint and stays inside the dynamic viewport", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /max-height:\s*min\(760px, calc\(100dvh - 48px\)\)/);
  assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.modal-backdrop \{[\s\S]*?align-items:\s*end;[\s\S]*?\.modal-panel \{[\s\S]*?max-height:\s*min\(92dvh, 820px\)/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});


test("modal escapes page stacking contexts through a body portal", async () => {
  const modal = await read("src/shared/components/ui/modal.tsx");
  const css = await read("src/app/globals.css");
  assert.match(modal, /createPortal/);
  assert.match(modal, /document\.body/);
  assert.match(modal, /typeof document === "undefined"/);
  assert.doesNotMatch(css, /\.page-stack \{ animation: page-enter \.28s ease both; \}/);
});


test("transaction history uses an accessible stacked receipt deck and preserves the detail modal", async () => {
  const finance = await read("src/modules/finance/components/finance-page.tsx");
  const deck = await read("src/modules/finance/components/transaction-receipt-deck.tsx");
  const css = await read("src/app/globals.css");
  const nativeCss = await read("src/app/native.css");
  assert.match(finance, /TransactionReceiptDeck/);
  assert.match(finance, /onOpen={setSelectedTransaction}/);
  assert.match(deck, /aria-roledescription="carousel"/);
  assert.match(deck, /receipt-card-total/);
  assert.match(deck, /shortReference/);
  assert.match(deck, /ID transaksi/);
  assert.match(finance, /transaction-receipt/);
  assert.match(finance, /Reference ID/);
  assert.match(finance, /formatTime\(selectedTransaction\.date\)/);
  assert.match(css, /\.transaction-receipt/);
  assert.match(nativeCss, /Transaction receipt stacked swipe deck/);
  assert.match(nativeCss, /\.receipt-deck-card/);
});


test("light UI uses a pure white canvas and removes decorative kicker text", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /--canvas:\s*#ffffff/);
  assert.match(css, /--surface:\s*#ffffff/);
  assert.match(css, /background:\s*rgba\(255, 255, 255, \.94\)/);
  const files = [
    "src/modules/dashboard/components/dashboard-page.tsx",
    "src/modules/finance/components/finance-page.tsx",
    "src/modules/calendar/components/calendar-page.tsx",
    "src/modules/personal/components/personal-page.tsx",
    "src/shared/components/ui/modal.tsx",
  ];
  for (const file of files) {
    const source = await read(file);
    assert.doesNotMatch(source, /className="eyebrow"/);
    assert.doesNotMatch(source, /className="card-label"/);
    assert.doesNotMatch(source, /className="modal-kicker"/);
  }
});


test("wallet cards keep the physical-card visual inside the swipe deck", async () => {
  const finance = await read("src/modules/finance/components/finance-page.tsx");
  const deck = await read("src/modules/finance/components/wallet-deck.tsx");
  const css = await read("src/app/globals.css");
  assert.match(finance, /WalletDeck/);
  assert.match(deck, /wallet-credit-surface/);
  assert.match(deck, /wallet-chip-visual/);
  assert.match(deck, /wallet-credit-number/);
  assert.match(deck, /walletCardDigits/);
  assert.match(deck, />FinanceAI</);
  assert.doesNotMatch(deck, /VISA|Mastercard|MasterCard/);
  assert.match(css, /aspect-ratio:\s*1\.586\s*\/\s*1/);
  assert.match(css, /\.wallet-credit-surface/);
});



test("wallet deck is stacked, bidirectional, velocity-aware, and keyboard accessible", async () => {
  const deck = await read("src/modules/finance/components/wallet-deck.tsx");
  const css = await read("src/app/native.css");
  assert.match(deck, /onPointerDown={startGesture}/);
  assert.match(deck, /onPointerMove={moveGesture}/);
  assert.match(deck, /onPointerUp=\{\(event\) => endGesture\(event\)\}/);
  assert.match(deck, /Math\.abs\(velocity\) > 0\.48/);
  assert.match(deck, /ArrowRight/);
  assert.match(deck, /ArrowLeft/);
  assert.match(deck, /aria-roledescription="carousel"/);
  assert.match(deck, /neighbor/);
  assert.match(css, /Wallet stacked swipe deck/);
  assert.match(css, /\.wallet-deck-card/);
  assert.match(css, /cubic-bezier\(\.2, \.92, \.24, 1\)/);
  assert.match(css, /touch-action:\s*pan-y/);
  assert.match(css, /prefers-reduced-motion/);
});


test("cashflow chart uses a plain-language premium fintech hierarchy", async () => {
  const chart = await read("src/modules/finance/components/cashflow-chart.tsx");
  const finance = await read("src/modules/finance/components/finance-page.tsx");
  const css = await read("src/app/globals.css");
  assert.match(chart, /cashflow-month-summary/);
  assert.match(chart, /cashflow-period-summary/);
  assert.match(chart, />Sisa</);
  assert.match(chart, /Masih ada uang tersisa bulan ini/);
  assert.match(chart, /Tap bulan untuk melihat detail/);
  assert.match(finance, /3 Bulan/);
  assert.match(finance, /6 Bulan/);
  assert.match(finance, /1 Tahun/);
  assert.match(css, /\.cashflow-month-summary/);
  assert.match(css, /\.period-balance/);
  assert.match(css, /\.cashflow-chart\.fintech/);
});




test("dashboard gives activity more space while keeping wallet summary compact", async () => {
  const dashboard = await read("src/modules/dashboard/components/dashboard-page.tsx");
  const css = await read("src/app/globals.css");
  assert.match(dashboard, /Ringkasan saldo wallet yang sedang digunakan/);
  assert.match(dashboard, /Aktivitas uang terbaru dari ledger/);
  assert.doesNotMatch(dashboard, /transaction-type-dot/);
  assert.match(css, /dashboard-wallet-card \{ grid-column: span 1; \}/);
  assert.match(css, /dashboard-activity-card \{ grid-column: span 3; \}/);
  assert.match(css, /dashboard-wallet-card \.wallet-strip[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(css, /dashboard-wallet-card \.wallet-chip > span:last-child[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  assert.match(css, /dashboard-activity-card \.dashboard-transaction-row[\s\S]*?min-height:\s*48px/);
});


test("native shell distinguishes installed mode and respects device safe areas", async () => {
  const shell = await read("src/shared/components/layout/app-shell.tsx");
  const pwa = await read("src/infrastructure/pwa/pwa-register.tsx");
  const layout = await read("src/app/layout.tsx");
  const css = await read("src/app/native.css");
  assert.match(shell, /native-screen-transition/);
  assert.match(shell, /onClick={prepareMobileNavigation}/);
  assert.match(pwa, /dataset\.displayMode/);
  assert.match(pwa, /display-mode: standalone/);
  assert.match(layout, /native\.css/);
  assert.match(css, /data-display-mode="standalone"/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /safe-area-inset-top/);
});

test("mobile sheets support drag-to-close without replacing keyboard accessibility", async () => {
  const modal = await read("src/shared/components/ui/modal.tsx");
  const css = await read("src/app/native.css");
  assert.match(modal, /onPointerDown={startDrag}/);
  assert.match(modal, /dragOffsetRef\.current >= 72/);
  assert.match(modal, /event\.key === "Escape"/);
  assert.match(css, /--sheet-drag-y/);
  assert.match(css, /\.modal-panel\.is-dragging/);
});

test("destructive actions use an in-app confirmation sheet instead of browser confirms", async () => {
  const confirm = await read("src/shared/components/ui/confirm-sheet.tsx");
  for (const file of [
    "src/modules/finance/components/finance-page.tsx",
    "src/modules/calendar/components/calendar-page.tsx",
    "src/modules/personal/components/personal-page.tsx",
  ]) {
    assert.doesNotMatch(await read(file), /window\.confirm/);
  }
  assert.match(confirm, /ConfirmSheet/);
  assert.match(confirm, /hapticWarning/);
});

test("quick add uses touch-first category choices and progressive haptic feedback", async () => {
  const quickAdd = await read("src/modules/quick-add/components/quick-add.tsx");
  const css = await read("src/app/native.css");
  assert.match(quickAdd, /native-chip-scroller/);
  assert.match(quickAdd, /native-choice-chip/);
  assert.match(quickAdd, /role="radiogroup"/);
  assert.match(quickAdd, /hapticSuccess/);
  assert.match(css, /touch-action:\s*manipulation/);
});

test("installed PWA metadata and service worker use the native shell revision", async () => {
  const manifest = JSON.parse(await read("public/manifest.webmanifest"));
  const sw = await read("public/sw.js");
  assert.equal(manifest.id, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.background_color, "#ffffff");
  assert.equal(manifest.lang, "id");
  assert.match(sw, /financeai-shell-v5/);
  assert.match(sw, /financeai-runtime-v5/);
});


test("CI smoke-tests the built production server and every core PWA route", async () => {
  const ci = await read(".github/workflows/ci.yml");
  assert.match(ci, /Smoke test production server/);
  assert.match(ci, /npm run start -- -p 3000/);
  for (const route of ["/finance", "/calendar", "/personal", "/manifest.webmanifest", "/sw.js", "/offline.html"]) {
    assert.match(ci, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(ci, /grep -q "FinanceAI"/);
});


test("small-screen navigation does not trigger browser auto-zoom", async () => {
  const css = await read("src/app/native.css");
  const shell = await read("src/shared/components/layout/app-shell.tsx");
  const search = await read("src/modules/search/components/global-search.tsx");
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*?\.native-screen-transition[\s\S]*?animation-name:\s*native-screen-fade/);
  assert.match(css, /\.field input,[\s\S]*?\.field select,[\s\S]*?font-size:\s*16px/);
  assert.match(css, /-webkit-text-size-adjust:\s*100%/);
  assert.match(shell, /document\.activeElement\.blur\(\)/);
  assert.match(search, /document\.activeElement\.blur\(\)/);
});


test("finance ledger uses the same receipt deck on desktop and mobile while keeping filters and destructive flow", async () => {
  const finance = await read("src/modules/finance/components/finance-page.tsx");
  const deck = await read("src/modules/finance/components/transaction-receipt-deck.tsx");
  assert.match(finance, /Riwayat transaksi/);
  assert.match(finance, /TransactionReceiptDeck/);
  assert.doesNotMatch(finance, /mobile-transactions/);
  assert.doesNotMatch(finance, /<table className="data-table"/);
  assert.match(finance, /filter-disclosure/);
  assert.match(finance, /removeTransaction\(transaction\.id\)/);
  assert.match(deck, />Hapus<\/button>/);
});


test("receipt deck mirrors a bill hierarchy and stays compact on narrow screens", async () => {
  const deck = await read("src/modules/finance/components/transaction-receipt-deck.tsx");
  const css = await read("src/app/native.css");
  assert.match(deck, /receipt-card-header/);
  assert.match(deck, /receipt-card-details/);
  assert.match(deck, /Tanggal/);
  assert.match(deck, /Dompet/);
  assert.match(deck, /Kategori/);
  assert.match(deck, /ID transaksi/);
  assert.match(deck, /receipt-card-total/);
  assert.match(css, /\.receipt-card-total/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*?\.receipt-deck-stage[\s\S]*?height:\s*474px/);
  assert.match(css, /@media \(max-width: 390px\)[\s\S]*?\.receipt-deck-stage/);
});


test("wallet deck axis-locks touch gestures and throttles drag updates to prevent page flicker", async () => {
  const deck = await read("src/modules/finance/components/wallet-deck.tsx");
  const css = await read("src/app/native.css");
  assert.match(deck, /startY/);
  assert.match(deck, /GestureAxis/);
  assert.match(deck, /AXIS_LOCK_PX/);
  assert.match(deck, /absoluteY > absoluteX \* AXIS_DOMINANCE/);
  assert.match(deck, /window\.requestAnimationFrame/);
  assert.match(deck, /setPointerCapture/);
  assert.doesNotMatch(deck, /\.focus\(\{ preventScroll: true \}\)/);
  assert.match(css, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(css, /overscroll-behavior-x:\s*contain/);
  assert.doesNotMatch(css, /perspective:\s*1000px/);
});


test("transaction receipt deck is bidirectional, velocity-aware, axis-locked, and keyboard accessible", async () => {
  const deck = await read("src/modules/finance/components/transaction-receipt-deck.tsx");
  const css = await read("src/app/native.css");
  assert.match(deck, /GestureAxis/);
  assert.match(deck, /AXIS_LOCK_PX/);
  assert.match(deck, /absoluteY > absoluteX \* AXIS_DOMINANCE/);
  assert.match(deck, /Math\.abs\(gesture\.velocity\) > 0\.48/);
  assert.match(deck, /window\.requestAnimationFrame/);
  assert.match(deck, /setPointerCapture/);
  assert.match(deck, /ArrowRight/);
  assert.match(deck, /ArrowLeft/);
  assert.match(deck, /roleFor/);
  assert.match(css, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(css, /cubic-bezier\(\.2, \.92, \.24, 1\)/);
  assert.match(css, /prefers-reduced-motion/);
});
