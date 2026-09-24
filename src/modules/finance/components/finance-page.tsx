"use client";

import { FormEvent, useMemo, useState } from "react";
import { categorySpending, financeSummary, monthlyCashflow, walletBalance } from "@/modules/finance/calculations";
import { CashflowChart } from "@/modules/finance/components/cashflow-chart";
import { Icon } from "@/shared/components/ui/icon";
import { Modal } from "@/shared/components/ui/modal";
import { ConfirmSheet } from "@/shared/components/ui/confirm-sheet";
import { useFinance } from "@/shared/providers/finance-provider";
import type { FinancialGoal, Transaction, TransactionType, Wallet, WalletType } from "@/shared/types/domain";
import { formatCurrency, formatDate, formatTime } from "@/shared/utils/format";
import { hapticTick } from "@/shared/utils/haptics";

const expenseCategories = ["Makanan", "Transportasi", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Rumah", "Langganan", "Lainnya"];
const incomeCategories = ["Gaji", "Bonus", "Freelance", "Bisnis", "Investasi", "Refund", "Hadiah", "Lainnya"];
const walletTypeLabels: Record<WalletType, string> = {
  bank: "Bank",
  cash: "Cash",
  ewallet: "E-Wallet",
  savings: "Tabungan",
  investment: "Investasi",
  credit: "Kartu kredit",
  other: "Lainnya",
};

const walletTypeAccents: Record<WalletType, string> = {
  bank: "#173f35",
  cash: "#c78e3f",
  ewallet: "#6d76d8",
  savings: "#4f7a68",
  investment: "#2e748d",
  credit: "#a64b45",
  other: "#6f7a74",
};

function dateInput(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function datetimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function localDayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayLabel(key: string, today: Date) {
  const todayKey = localDayKey(today.toISOString());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = localDayKey(yesterday.toISOString());
  if (key === todayKey) return "Hari ini";
  if (key === yesterdayKey) return "Kemarin";
  return formatDate(`${key}T12:00:00`, { weekday: "long", day: "numeric", month: "long" });
}

function walletCardDigits(id: string) {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) value = (value * 31 + id.charCodeAt(index)) % 10000;
  return String(value).padStart(4, "0");
}

export function FinancePage() {
  const { state, addWallet, updateWallet, archiveWallet, addGoal, updateGoal, deleteGoal, updateTransaction, deleteTransaction } = useFinance();
  const [now] = useState(() => new Date());
  const [walletOpen, setWalletOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletType, setWalletType] = useState<WalletType>("bank");
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ kind: "transaction" | "goal"; id: string } | null>(null);
  const [chartMonths, setChartMonths] = useState<3 | 6 | 12>(6);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [message, setMessage] = useState("");

  const summary = useMemo(() => financeSummary(state, now), [state, now]);
  const cashflow = useMemo(() => monthlyCashflow(state.transactions, chartMonths, now), [state.transactions, chartMonths, now]);
  const wallets = useMemo(
    () => state.wallets
      .map((wallet) => ({ ...wallet, balance: walletBalance(wallet, state.transactions) }))
      .sort((a, b) => Number(a.archived) - Number(b.archived) || b.balance - a.balance),
    [state]
  );
  const activeWallets = wallets.filter((wallet) => !wallet.archived);
  const spending = useMemo(() => categorySpending(state.transactions).slice(0, 5), [state.transactions]);
  const totalSpending = spending.reduce((sum, item) => sum + item.amount, 0) || 1;
  const totalWalletBalance = activeWallets.reduce((sum, wallet) => sum + Math.max(0, wallet.balance), 0) || 1;
  const categories = useMemo(() => [...new Set(state.transactions.map((tx) => tx.category))].sort(), [state.transactions]);
  const walletById = useMemo(() => new Map(state.wallets.map((wallet) => [wallet.id, wallet])), [state.wallets]);

  const transactions = useMemo(() => [...state.transactions].filter((tx) => {
    const text = `${tx.description} ${tx.category} ${tx.note ?? ""}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (walletFilter !== "all" && tx.walletId !== walletFilter && tx.destinationWalletId !== walletFilter) return false;
    if (categoryFilter !== "all" && tx.category !== categoryFilter) return false;
    const time = new Date(tx.date).getTime();
    if (dateFrom && time < new Date(`${dateFrom}T00:00:00`).getTime()) return false;
    if (dateTo && time > new Date(`${dateTo}T23:59:59`).getTime()) return false;
    if (minAmount && tx.amount < Number(minAmount)) return false;
    if (maxAmount && tx.amount > Number(maxAmount)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "date-asc") return a.date.localeCompare(b.date);
    if (sortBy === "amount-desc") return b.amount - a.amount;
    if (sortBy === "amount-asc") return a.amount - b.amount;
    return b.date.localeCompare(a.date);
  }), [state.transactions, query, typeFilter, walletFilter, categoryFilter, dateFrom, dateTo, minAmount, maxAmount, sortBy]);

  const groupedTransactions = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const transaction of transactions) {
      const key = localDayKey(transaction.date);
      const items = groups.get(key);
      if (items) items.push(transaction);
      else groups.set(key, [transaction]);
    }
    return Array.from(groups, ([key, items]) => ({ key, items }));
  }, [transactions]);

  const activeFilterCount = [query, typeFilter !== "all", walletFilter !== "all", categoryFilter !== "all", dateFrom, dateTo, minAmount, maxAmount, sortBy !== "date-desc"].filter(Boolean).length;

  function flash(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 3000); }
  function clearFilters() { setQuery(""); setTypeFilter("all"); setWalletFilter("all"); setCategoryFilter("all"); setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount(""); setSortBy("date-desc"); }

  function submitWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type")) as WalletType;
    const accent = editingWallet && editingWallet.type === type ? editingWallet.accent : walletTypeAccents[type];
    const input = { name: String(form.get("name")).trim(), type, initialBalance: Math.max(0, Number(form.get("balance")) || 0), accent, archived: editingWallet?.archived ?? false };
    if (editingWallet) updateWallet(editingWallet.id, input); else addWallet(input);
    setWalletOpen(false);
    setEditingWallet(null);
    flash(editingWallet ? "Wallet diperbarui." : "Wallet ditambahkan.");
  }

  function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const targetAmount = Math.max(1, Number(form.get("target")) || 1);
    const currentAmount = Math.max(0, Number(form.get("current")) || 0);
    const input = { name: String(form.get("name")).trim(), targetAmount, currentAmount, targetDate: String(form.get("date") || "") || undefined, status: String(form.get("status") || "active") as FinancialGoal["status"] };
    if (editingGoal) updateGoal(editingGoal.id, input); else addGoal(input);
    setGoalOpen(false);
    setEditingGoal(null);
    flash(editingGoal ? "Goal diperbarui." : "Goal ditambahkan.");
  }

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTransaction) return;
    const form = new FormData(event.currentTarget);
    const type = String(form.get("type")) as TransactionType;
    const input = { type, walletId: String(form.get("walletId")), destinationWalletId: type === "transfer" ? String(form.get("destinationWalletId") || "") || undefined : undefined, amount: Number(form.get("amount")), category: type === "transfer" ? "Transfer" : String(form.get("category") || "Lainnya"), description: String(form.get("description")).trim() || "Transaksi", note: String(form.get("note") || "").trim() || undefined, date: new Date(String(form.get("date"))).toISOString() };
    const result = updateTransaction(editingTransaction.id, input);
    if (!result.ok) { flash(result.message ?? "Transaksi tidak valid."); return; }
    setEditingTransaction(null);
    flash("Transaksi diperbarui.");
  }

  function removeTransaction(id: string) { setPendingDelete({ kind: "transaction", id }); }
  function removeGoal(id: string) { setPendingDelete({ kind: "goal", id }); }
  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "transaction") {
      deleteTransaction(pendingDelete.id);
      flash("Transaksi dihapus.");
    } else {
      deleteGoal(pendingDelete.id);
      flash("Goal dihapus.");
    }
    setPendingDelete(null);
  }

  return <div className="page-stack">
    <section className="page-heading finance-heading">
      <div><h1>Keuangan pribadi</h1><p>Saldo, arus kas, target, dan transaksi dengan ledger lokal sebagai sumber kebenaran.</p></div>
      <div className="heading-actions"><button className="button ghost" onClick={() => { setEditingWallet(null); setWalletType("bank"); setWalletOpen(true); }}><Icon name="wallet" size={17}/>Wallet</button><button className="button primary" onClick={() => { setEditingGoal(null); setGoalOpen(true); }}><Icon name="target" size={17}/>Goal</button></div>
    </section>

    <section className="stats-grid finance-summary-grid" aria-label="Ringkasan finansial">
      <div className="stat-card emphasis"><span>Net worth</span><strong>{formatCurrency(summary.netWorth)}</strong><small>Total seluruh wallet aktif</small></div>
      <div className="stat-card semantic-stat income"><span>Income bulan ini</span><strong className="positive-text">{formatCurrency(summary.income)}</strong><small>Saving rate {summary.savingsRate}%</small></div>
      <div className="stat-card semantic-stat expense"><span>Expense bulan ini</span><strong className="negative-text">{formatCurrency(summary.expense)}</strong><small>{state.transactions.filter((tx) => tx.type === "expense").length} transaksi expense</small></div>
      <div className="stat-card"><span>Net cashflow</span><strong className={summary.savings < 0 ? "negative-text" : ""}>{formatCurrency(summary.savings)}</strong><small>Income dikurangi expense</small></div>
    </section>

    <section className="analytics-grid">
      <article className="card card-secondary analytics-card">
        <div className="card-head analytics-head fintech">
          <div><h2>Arus kas</h2><p className="section-helper">Lihat berapa uang yang masuk, keluar, dan tersisa setiap bulan.</p></div>
          <div className="analytics-actions">
            <div className="period-switch fintech" role="group" aria-label="Periode grafik">{([[3, "3 Bulan"], [6, "6 Bulan"], [12, "1 Tahun"]] as const).map(([months, label]) => <button type="button" key={months} className={chartMonths === months ? "active" : ""} aria-pressed={chartMonths === months} onClick={() => setChartMonths(months)}>{label}</button>)}</div>
          </div>
        </div>
        <CashflowChart data={cashflow}/>
      </article>
      <article className="card card-compact spending-card">
        <div className="card-head"><div><h2>Kategori terbesar</h2></div></div>
        {spending.length ? <div className="spending-list">{spending.map((item, index) => <div className="spending-row" key={item.category}><div className="row-between"><span><i className={`rank-dot rank-${index + 1}`}/>{item.category}</span><strong>{formatCurrency(item.amount, true)}</strong></div><div className="progress thin"><span style={{ width: `${Math.max(8, (item.amount / totalSpending) * 100)}%` }}/></div></div>)}</div> : <div className="empty-panel compact"><Icon name="arrow-up"/><strong>Belum ada expense</strong><span>Distribusi kategori akan muncul setelah ada transaksi pengeluaran.</span></div>}
      </article>
    </section>

    <section className="finance-grid">
      <article className="card card-secondary finance-wallets">
        <div className="card-head"><div><h2>Wallet</h2><p className="section-helper">Saldo dihitung dari saldo awal dan seluruh ledger.</p></div><button className="small-action" onClick={() => { setEditingWallet(null); setWalletType("bank"); setWalletOpen(true); }}><Icon name="plus" size={16}/>Tambah</button></div>
        {wallets.length ? <div className="wallet-grid">{wallets.map((wallet) => <article className={`wallet-card ${wallet.archived ? "archived" : ""}`} key={wallet.id} style={{ "--wallet-accent": wallet.accent } as React.CSSProperties}>
          <div className="wallet-credit-surface" aria-label={`${wallet.name}, saldo ${formatCurrency(wallet.balance)}`}>
            <div className="wallet-credit-top">
              <span className="wallet-card-brand"><strong>FinanceAI</strong><small>{walletTypeLabels[wallet.type]}</small></span>
              <span className={`wallet-status ${wallet.archived ? "archived" : ""}`}>{wallet.archived ? "Diarsipkan" : "Aktif"}</span>
            </div>
            <div className="wallet-credit-tech" aria-hidden="true">
              <span className="wallet-chip-visual"><i/><i/><i/><i/></span>
              <span className="wallet-contactless"><i/><i/><i/></span>
            </div>
            <div className="wallet-credit-number" aria-label={`Nomor visual berakhir ${walletCardDigits(wallet.id)}`}>
              <span>••••</span><span>••••</span><span>••••</span><strong>{walletCardDigits(wallet.id)}</strong>
            </div>
            <div className="wallet-credit-bottom">
              <span className="wallet-credit-owner"><small>Wallet</small><strong>{wallet.name}</strong></span>
              <span className="wallet-credit-balance"><small>Saldo</small><strong>{formatCurrency(wallet.balance)}</strong></span>
            </div>
          </div>
          <div className="entity-actions wallet-card-actions"><button type="button" aria-label={`Edit wallet ${wallet.name}`} onClick={() => { setEditingWallet(wallet); setWalletType(wallet.type); setWalletOpen(true); }}>Edit</button><button type="button" onClick={() => { const result = archiveWallet(wallet.id, !wallet.archived); flash(result.message ?? (wallet.archived ? "Wallet diaktifkan kembali." : "Wallet diarsipkan.")); }}>{wallet.archived ? "Aktifkan" : "Arsipkan"}</button></div>
        </article>)}</div> : <div className="empty-panel"><Icon name="wallet"/><strong>Belum ada wallet</strong><span>Tambahkan tempat uangmu disimpan untuk mulai membangun ledger.</span></div>}
      </article>
      <article className="card card-compact allocation-card">
        <div className="card-head"><div><h2>Komposisi wallet</h2><p className="section-helper">Porsi saldo positif pada setiap wallet aktif.</p></div></div>
        {activeWallets.length ? <div className="allocation-list">{activeWallets.map((wallet) => { const share = Math.max(0, Math.round((Math.max(0, wallet.balance) / totalWalletBalance) * 100)); return <div className="allocation-row" key={wallet.id}><div className="row-between"><span><i className="allocation-dot" style={{ background: wallet.accent }}/>{wallet.name}</span><strong>{share}%</strong></div><div className="allocation-track"><span style={{ width: `${share}%`, background: wallet.accent }}/></div></div>; })}</div> : <div className="empty-panel compact"><Icon name="wallet"/><strong>Belum ada komposisi</strong><span>Komposisi muncul setelah wallet ditambahkan.</span></div>}
      </article>
    </section>

    <section className="card card-secondary ledger-card">
      <div className="card-head transaction-head"><div><h2>Transaksi</h2><p className="section-helper">{transactions.length} hasil dari {state.transactions.length} transaksi</p></div>{activeFilterCount > 0 && <button type="button" className="filter-reset-inline" onClick={clearFilters}>{activeFilterCount} filter aktif · reset</button>}</div>
      <div className="type-filter-row" role="group" aria-label="Filter cepat tipe transaksi">{[["all", "Semua"], ["income", "Pemasukan"], ["expense", "Pengeluaran"], ["transfer", "Transfer"]].map(([value, label]) => <button type="button" key={value} className={typeFilter === value ? "active" : ""} aria-pressed={typeFilter === value} onClick={() => setTypeFilter(value)}>{label}</button>)}</div>
      <details className="filter-disclosure" open={activeFilterCount > (typeFilter !== "all" ? 1 : 0)}>
        <summary>Filter lanjutan <span>{activeFilterCount ? `${activeFilterCount} aktif` : "opsional"}</span></summary>
        <div className="filter-grid"><label><span>Cari</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Deskripsi, kategori, catatan"/></label><label><span>Wallet</span><select value={walletFilter} onChange={(e) => setWalletFilter(e.target.value)}><option value="all">Semua</option>{state.wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label><label><span>Kategori</span><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">Semua</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Dari</span><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}/></label><label><span>Sampai</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}/></label><label><span>Min nominal</span><input type="number" inputMode="numeric" min="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)}/></label><label><span>Max nominal</span><input type="number" inputMode="numeric" min="0" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)}/></label><label><span>Urutkan</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="date-desc">Terbaru</option><option value="date-asc">Terlama</option><option value="amount-desc">Nominal terbesar</option><option value="amount-asc">Nominal terkecil</option></select></label><button type="button" className="button ghost filter-clear" onClick={clearFilters}>Reset filter</button></div>
      </details>

      {transactions.length ? <>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Aktivitas</th><th>Kategori</th><th>Wallet</th><th>Tanggal</th><th className="right">Nominal</th><th>Aksi</th></tr></thead><tbody>{transactions.map((tx) => { const wallet = walletById.get(tx.walletId); return <tr key={tx.id} className="transaction-clickable" tabIndex={0} role="button" aria-label={`Lihat detail transaksi ${tx.description}`} onClick={() => setSelectedTransaction(tx)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedTransaction(tx); } }}><td><div className="transaction-cell"><span className={`transaction-icon ${tx.type}`}><Icon name={tx.type === "income" ? "arrow-down" : tx.type === "expense" ? "arrow-up" : "swap"} size={16}/></span><span><span className={`transaction-kicker ${tx.type}`}>{tx.type === "income" ? "Pemasukan" : tx.type === "expense" ? "Pengeluaran" : "Transfer"}</span><strong>{tx.description}</strong>{tx.note && <small>{tx.note}</small>}</span></div></td><td><span className="pill">{tx.category}</span></td><td>{wallet?.name ?? "-"}</td><td>{formatDate(tx.date, { day: "2-digit", month: "short", year: "numeric" })}</td><td className={`right money ${tx.type === "income" ? "positive-text" : tx.type === "expense" ? "negative-text" : "neutral"}`}>{tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatCurrency(tx.amount)}</td><td><div className="table-actions"><button type="button" onClick={(event) => { event.stopPropagation(); setEditingTransaction(tx); }}>Edit</button><button type="button" className="danger-link" onClick={(event) => { event.stopPropagation(); removeTransaction(tx.id); }}>Hapus</button></div></td></tr>; })}</tbody></table></div>
        <div className="mobile-transactions grouped-feed">{groupedTransactions.map((group) => <section className="transaction-day" key={group.key}><div className="transaction-day-label"><span>{dayLabel(group.key, now)}</span><small>{group.items.length} transaksi</small></div>{group.items.map((tx) => { const wallet = walletById.get(tx.walletId); return <article className="transaction-row transaction-row-actions transaction-clickable-mobile" key={tx.id} tabIndex={0} role="button" aria-label={`Lihat detail transaksi ${tx.description}`} onClick={() => setSelectedTransaction(tx)} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedTransaction(tx); } }}><span className={`transaction-icon ${tx.type}`}><Icon name={tx.type === "income" ? "arrow-down" : tx.type === "expense" ? "arrow-up" : "swap"} size={17}/></span><span className="transaction-main"><span className={`transaction-kicker ${tx.type}`}>{tx.type === "income" ? "Pemasukan" : tx.type === "expense" ? "Pengeluaran" : "Transfer"}</span><strong>{tx.description}</strong><small>{tx.category} · {wallet?.name ?? "Wallet"}</small><span className="mobile-row-actions"><button type="button" onClick={(event) => { event.stopPropagation(); setEditingTransaction(tx); }}>Edit</button><button type="button" className="danger-link" onClick={(event) => { event.stopPropagation(); removeTransaction(tx.id); }}>Hapus</button></span></span><strong className={tx.type === "income" ? "money positive-text" : tx.type === "expense" ? "money negative-text" : "money neutral"}>{tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatCurrency(tx.amount, true)}</strong></article>; })}</section>)}</div>
      </> : <div className="empty-panel"><Icon name="search"/><strong>Tidak ada transaksi yang cocok</strong><span>{activeFilterCount ? "Reset atau ubah filter untuk melihat lebih banyak transaksi." : "Catat transaksi pertama lewat tombol Tambah."}</span>{activeFilterCount > 0 && <button type="button" className="button ghost empty-action" onClick={clearFilters}>Reset filter</button>}</div>}
    </section>

    <section className="card card-compact"><div className="card-head"><div><h2>Target finansial</h2></div><button className="small-action" onClick={() => { setEditingGoal(null); setGoalOpen(true); }}><Icon name="plus" size={16}/>Tambah</button></div>{state.goals.length ? <div className="goal-grid">{state.goals.map((goal) => { const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)); return <article className="goal-card" key={goal.id}><div className="row-between"><span className="pill">{goal.status}</span><strong>{progress}%</strong></div><h3>{goal.name}</h3><p>{formatCurrency(goal.currentAmount, true)} dari {formatCurrency(goal.targetAmount, true)}</p><div className="progress"><span style={{ width: `${progress}%` }}/></div>{goal.targetDate && <small>Target {formatDate(goal.targetDate, { day: "2-digit", month: "short", year: "numeric" })}</small>}<div className="entity-actions"><button type="button" onClick={() => { setEditingGoal(goal); setGoalOpen(true); }}>Edit</button>{goal.status !== "completed" && <button type="button" onClick={() => updateGoal(goal.id, { status: goal.status === "paused" ? "active" : "paused" })}>{goal.status === "paused" ? "Lanjutkan" : "Pause"}</button>}<button type="button" onClick={() => updateGoal(goal.id, { status: "completed", currentAmount: goal.targetAmount })}>Selesai</button><button type="button" className="danger-link" onClick={() => removeGoal(goal.id)}>Hapus</button></div></article>; })}</div> : <div className="empty-panel"><Icon name="target"/><strong>Belum ada target finansial</strong><span>Buat target untuk memantau progress tabungan atau tujuan keuangan.</span></div>}</section>

    <Modal open={walletOpen} onClose={() => { setWalletOpen(false); setEditingWallet(null); }} title={editingWallet ? "Edit wallet" : "Tambah wallet"} description="Atur sumber saldo yang akan dipakai oleh seluruh ledger.">
      <form className="form-stack" onSubmit={submitWallet}>
        <label className="field"><span>Nama wallet</span><input name="name" defaultValue={editingWallet?.name ?? ""} placeholder="Contoh: BCA" required/></label>
        <div className="field wallet-type-field">
          <span>Tipe</span>
          <input type="hidden" name="type" value={walletType}/>
          <div className="wallet-type-picker" role="radiogroup" aria-label="Tipe wallet">
            {(Object.entries(walletTypeLabels) as [WalletType, string][]).map(([value, label]) => (
              <button
                type="button"
                key={value}
                role="radio"
                aria-checked={walletType === value}
                className={walletType === value ? "wallet-type-option active" : "wallet-type-option"}
                onClick={() => { hapticTick(); setWalletType(value); }}
              >
                <span className="wallet-type-swatch" style={{ background: walletTypeAccents[value] }} aria-hidden="true"/>
                <span className="wallet-type-copy">
                  <strong>{label}</strong>
                  <small>{value === "bank" ? "Rekening bank" : value === "cash" ? "Uang tunai" : value === "ewallet" ? "Dompet digital" : value === "savings" ? "Tabungan khusus" : value === "investment" ? "Aset investasi" : value === "credit" ? "Limit kartu kredit" : "Sumber lainnya"}</small>
                </span>
                <span className="wallet-type-check" aria-hidden="true">{walletType === value ? "✓" : ""}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="field"><span>Saldo awal</span><input type="number" inputMode="numeric" name="balance" min="0" defaultValue={editingWallet?.initialBalance ?? 0}/></label>
        <div className="modal-actions sticky-actions"><button type="button" className="button ghost" onClick={() => { setWalletOpen(false); setEditingWallet(null); }}>Batal</button><button className="button primary">Simpan wallet</button></div>
      </form>
    </Modal>

    <Modal open={goalOpen} onClose={() => { setGoalOpen(false); setEditingGoal(null); }} title={editingGoal ? "Edit financial goal" : "Tambah financial goal"} description="Simpan target, progres, dan tenggat dalam satu tempat."><form className="form-stack" onSubmit={submitGoal}><label className="field"><span>Nama target</span><input name="name" defaultValue={editingGoal?.name ?? ""} placeholder="Contoh: Dana liburan" required/></label><div className="form-grid"><label className="field"><span>Target nominal</span><input type="number" inputMode="numeric" name="target" min="1" defaultValue={editingGoal?.targetAmount ?? ""} required/></label><label className="field"><span>Progress</span><input type="number" inputMode="numeric" name="current" min="0" defaultValue={editingGoal?.currentAmount ?? 0}/></label></div><div className="form-grid"><label className="field"><span>Target tanggal</span><input name="date" type="date" defaultValue={editingGoal?.targetDate ? dateInput(editingGoal.targetDate) : ""}/></label><label className="field"><span>Status</span><select name="status" defaultValue={editingGoal?.status ?? "active"}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></select></label></div><div className="modal-actions sticky-actions"><button type="button" className="button ghost" onClick={() => { setGoalOpen(false); setEditingGoal(null); }}>Batal</button><button className="button primary">Simpan goal</button></div></form></Modal>


    <Modal open={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Detail transaksi" description="Bukti transaksi yang tersimpan di ledger FinanceAI.">
      {selectedTransaction && (() => {
        const sourceWallet = walletById.get(selectedTransaction.walletId);
        const destinationWallet = selectedTransaction.destinationWalletId ? walletById.get(selectedTransaction.destinationWalletId) : undefined;
        const typeLabel = selectedTransaction.type === "income" ? "Pemasukan" : selectedTransaction.type === "expense" ? "Pengeluaran" : "Transfer";
        const amountPrefix = selectedTransaction.type === "income" ? "+" : selectedTransaction.type === "expense" ? "-" : "";
        return <div className={`transaction-receipt ${selectedTransaction.type}`}>
          <div className="receipt-brand"><span className="brand-mark small">F</span><span><strong>FinanceAI</strong><small>Bukti transaksi</small></span></div>
          <div className="receipt-status"><span className={`pill ${selectedTransaction.type}`}>{typeLabel}</span><span>Tersimpan lokal</span></div>
          <div className="receipt-amount"><span>Total transaksi</span><strong className={selectedTransaction.type === "income" ? "positive-text" : selectedTransaction.type === "expense" ? "negative-text" : "neutral"}>{amountPrefix}{formatCurrency(selectedTransaction.amount)}</strong><small>{selectedTransaction.description}</small></div>
          <div className="receipt-divider" aria-hidden="true"/>
          <dl className="receipt-details">
            <div><dt>Tanggal</dt><dd>{formatDate(selectedTransaction.date, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</dd></div>
            <div><dt>Waktu</dt><dd>{formatTime(selectedTransaction.date)}</dd></div>
            <div><dt>Wallet</dt><dd>{sourceWallet?.name ?? "-"}</dd></div>
            {selectedTransaction.type === "transfer" && <div><dt>Wallet tujuan</dt><dd>{destinationWallet?.name ?? "-"}</dd></div>}
            <div><dt>Kategori</dt><dd>{selectedTransaction.category}</dd></div>
            <div><dt>Status</dt><dd>Berhasil</dd></div>
          </dl>
          {selectedTransaction.note && <div className="receipt-note"><span>Catatan</span><p>{selectedTransaction.note}</p></div>}
          <div className="receipt-divider" aria-hidden="true"/>
          <div className="receipt-reference"><span>Reference ID</span><code>{selectedTransaction.id}</code></div>
          <p className="receipt-footnote">Data transaksi tersimpan lokal di perangkat ini.</p>
          <div className="modal-actions receipt-actions">
            <button type="button" className="button ghost" onClick={() => { const transaction = selectedTransaction; setSelectedTransaction(null); setEditingTransaction(transaction); }}>Edit transaksi</button>
            <button type="button" className="button primary" onClick={() => setSelectedTransaction(null)}>Tutup</button>
          </div>
        </div>;
      })()}
    </Modal>

    <Modal open={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Edit transaksi" description="Perubahan akan langsung dihitung ulang ke saldo dan ringkasan.">{editingTransaction && <form className="form-stack" onSubmit={submitTransaction}><div className="form-grid"><label className="field"><span>Tipe</span><select name="type" defaultValue={editingTransaction.type}><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option></select></label><label className="field"><span>Nominal</span><input name="amount" type="number" inputMode="numeric" min="1" defaultValue={editingTransaction.amount} required/></label></div><div className="form-grid"><label className="field"><span>Wallet</span><select name="walletId" defaultValue={editingTransaction.walletId}>{state.wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label><label className="field"><span>Wallet tujuan</span><select name="destinationWalletId" defaultValue={editingTransaction.destinationWalletId ?? ""}><option value="">Tidak ada</option>{state.wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label></div><div className="form-grid"><label className="field"><span>Kategori</span><select name="category" defaultValue={editingTransaction.category}>{[...new Set([...expenseCategories, ...incomeCategories, editingTransaction.category])].map((category) => <option key={category}>{category}</option>)}</select></label><label className="field"><span>Tanggal & waktu</span><input name="date" type="datetime-local" defaultValue={datetimeLocal(editingTransaction.date)} required/></label></div><label className="field"><span>Deskripsi</span><input name="description" defaultValue={editingTransaction.description} required/></label><label className="field"><span>Catatan</span><textarea name="note" rows={3} defaultValue={editingTransaction.note ?? ""}/></label><div className="modal-actions sticky-actions"><button type="button" className="button ghost" onClick={() => setEditingTransaction(null)}>Batal</button><button className="button primary">Simpan perubahan</button></div></form>}</Modal>
    <ConfirmSheet
      open={!!pendingDelete}
      onClose={() => setPendingDelete(null)}
      onConfirm={confirmDelete}
      title={pendingDelete?.kind === "goal" ? "Hapus target finansial?" : "Hapus transaksi?"}
      message={pendingDelete?.kind === "goal" ? "Target ini akan dihapus dari FinanceAI." : "Saldo dan ringkasan akan langsung dihitung ulang setelah transaksi dihapus."}
      confirmLabel="Hapus"
    />
    {message && <div className="toast" role="status">{message}</div>}
  </div>;
}
