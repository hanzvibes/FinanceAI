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
  assert.match(finance, /\[3, 6, 12\]/);
  assert.match(finance, /groupedTransactions/);
  assert.match(finance, /Hari ini/);
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
  assert.match(dashboard, /transaction-kicker/);
  assert.match(finance, /card-secondary analytics-card/);
  assert.match(finance, /transaction-cell/);
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

test("financial visualization exposes focused monthly detail and semantic transaction styling", async () => {
  const chart = await read("src/modules/finance/components/cashflow-chart.tsx");
  const css = await read("src/app/globals.css");
  assert.match(chart, /chart-spotlight/);
  assert.match(chart, /tabIndex=\{0\}/);
  assert.match(chart, /onFocus/);
  assert.match(chart, /Pemasukan/);
  assert.match(css, /--income:/);
  assert.match(css, /--expense:/);
  assert.match(css, /transaction-kicker\.income/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
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


test("wallet form has no color picker and assigns accents automatically", async () => {
  const financePage = await read("src/modules/finance/components/finance-page.tsx");
  assert.doesNotMatch(financePage, /type="color"/);
  assert.doesNotMatch(financePage, /form\.get\("accent"\)/);
  assert.match(financePage, /walletTypeAccents/);
});


test("modal matches the mobile navigation breakpoint and stays inside the dynamic viewport", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /max-height:\s*min\(760px, calc\(100dvh - 48px\)\)/);
  assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.modal-backdrop \{[\s\S]*?align-items:\s*end;[\s\S]*?\.modal-panel \{[\s\S]*?max-height:\s*min\(92dvh, 820px\)/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});
