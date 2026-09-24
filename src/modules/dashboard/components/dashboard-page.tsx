"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { financeSummary, monthlyCashflow, walletBalance } from "@/modules/finance/calculations";
import { CashflowSparkline } from "@/modules/finance/components/cashflow-chart";
import { QuickAdd } from "@/modules/quick-add";
import { Icon } from "@/shared/components/ui/icon";
import { useFinance } from "@/shared/providers/finance-provider";
import { formatCurrency, formatDate, formatTime } from "@/shared/utils/format";

export function DashboardPage() {
  const { state } = useFinance();
  const [now] = useState(() => new Date());
  const summary = useMemo(() => financeSummary(state, now), [state, now]);
  const cashflow = useMemo(() => monthlyCashflow(state.transactions, 6, now), [state.transactions, now]);
  const wallets = useMemo(
    () => state.wallets
      .filter((item) => !item.archived)
      .map((wallet) => ({ ...wallet, balance: walletBalance(wallet, state.transactions) }))
      .sort((a, b) => b.balance - a.balance),
    [state]
  );
  const walletNames = useMemo(() => new Map(state.wallets.map((wallet) => [wallet.id, wallet.name])), [state.wallets]);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const agenda = [...state.agendas]
    .filter((item) => !item.done && new Date(item.startAt).getTime() >= now.getTime() - 86400000)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 4);
  const activeGoals = state.goals.filter((goal) => goal.status === "active").slice(0, 3);
  const expenseShare = summary.income > 0 ? Math.min(100, Math.round((summary.expense / summary.income) * 100)) : 0;
  const hour = now.getHours();
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";

  return <div className="page-stack dashboard-page">
    <section className="page-heading dashboard-heading">
      <div>
        <span className="eyebrow">{formatDate(now.toISOString(), { weekday: "long", day: "numeric", month: "long" })}</span>
        <h1>{greeting}.</h1>
        <p>Satu pandangan untuk kondisi uang hari ini. Detail lain tetap dekat, tetapi tidak berebut perhatian.</p>
      </div>
    </section>

    <section className="dashboard-grid dashboard-priority-grid">
      <article className="card card-primary hero-card span-4">
        <div className="hero-top">
          <div>
            <span className="card-label">Kekayaan bersih</span>
            <strong className="hero-number amount-display">{formatCurrency(summary.netWorth)}</strong>
            <span className="hero-caption">Akumulasi seluruh wallet aktif</span>
          </div>
          <div className="hero-primary-action"><QuickAdd/><span>Catat perubahan uang tanpa meninggalkan dashboard.</span></div>
        </div>

        <div className="hero-metrics" aria-label="Ringkasan arus kas bulan ini">
          <div><span>Pemasukan</span><strong className="semantic-income">{formatCurrency(summary.income, true)}</strong></div>
          <div><span>Pengeluaran</span><strong>{formatCurrency(summary.expense, true)}</strong></div>
          <div><span>Net cashflow</span><strong className={summary.savings < 0 ? "semantic-expense" : "semantic-income"}>{formatCurrency(summary.savings, true)}</strong></div>
          <div><span>Saving rate</span><strong>{summary.savingsRate}%</strong></div>
        </div>

        <div className="hero-chart" aria-label="Tren net cashflow enam bulan terakhir"><CashflowSparkline data={cashflow}/></div>

        <div className="cashflow-rail" aria-label={`Pengeluaran memakai ${expenseShare}% dari pemasukan bulan ini`}>
          <div className="cashflow-copy"><span>Porsi pemasukan yang sudah terpakai</span><strong>{expenseShare}%</strong></div>
          <div className="cashflow-track"><span style={{ width: `${expenseShare}%` }}/></div>
        </div>
      </article>

      <article className="card card-secondary span-2 dashboard-wallet-card">
        <div className="card-head"><div><span className="card-label">Accounts</span><h2>Wallet aktif</h2><p className="section-helper">Saldo yang paling relevan untuk keputusan hari ini.</p></div><Link href="/finance" className="text-link">Kelola wallet</Link></div>
        {wallets.length ? <div className="wallet-strip">{wallets.slice(0, 4).map((wallet) => <div className="wallet-chip" key={wallet.id}><span className="wallet-dot" style={{ background: wallet.accent }}/><span><small>{wallet.name}</small><strong>{formatCurrency(wallet.balance, true)}</strong></span></div>)}</div> : <div className="empty-compact state-inline"><Icon name="wallet" size={18}/><span>Tambahkan wallet pertama untuk mulai mencatat.</span><Link href="/finance" className="text-link">Buka Finance</Link></div>}
      </article>

      <article className="card card-secondary span-2 dashboard-activity-card">
        <div className="card-head"><div><span className="card-label">Aktivitas</span><h2>Transaksi terbaru</h2><p className="section-helper">Lima perubahan terakhir pada ledger.</p></div><Link href="/finance" className="text-link">Semua transaksi</Link></div>
        {recent.length ? <div className="transaction-list">{recent.map((tx) => <div className="transaction-row" key={tx.id}><span className={`transaction-icon ${tx.type}`}><Icon name={tx.type === "income" ? "arrow-down" : tx.type === "expense" ? "arrow-up" : "swap"} size={17}/></span><span className="transaction-main"><span className={`transaction-kicker ${tx.type}`}>{tx.type === "income" ? "Pemasukan" : tx.type === "expense" ? "Pengeluaran" : "Transfer"}</span><strong>{tx.description}</strong><small>{walletNames.get(tx.walletId) ?? "Wallet"} · {formatDate(tx.date, { day: "2-digit", month: "short" })}</small></span><strong className={tx.type === "income" ? "money positive-text" : tx.type === "expense" ? "money negative-text" : "money neutral"}>{tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}{formatCurrency(tx.amount)}</strong></div>)}</div> : <div className="empty-compact state-inline"><Icon name="swap" size={18}/><span>Belum ada transaksi. Tambahkan transaksi pertama dari tombol Tambah.</span></div>}
      </article>

      <article className="card card-compact span-2">
        <div className="card-head"><div><span className="card-label">Financial goals</span><h2>Target aktif</h2></div><Link href="/finance" className="text-link">Lihat semua</Link></div>
        {activeGoals.length ? <div className="goal-list">{activeGoals.map((goal) => {
          const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          return <div className="goal-row" key={goal.id}>
            <div className="row-between"><strong>{goal.name}</strong><span>{progress}%</span></div>
            <div className="progress"><span style={{ width: `${progress}%` }}/></div>
            <small>{formatCurrency(goal.currentAmount, true)} dari {formatCurrency(goal.targetAmount, true)}</small>
          </div>;
        })}</div> : <div className="empty-compact state-inline"><Icon name="target" size={18}/><span>Belum ada target aktif. Buat goal dari halaman Finance.</span></div>}
      </article>

      <article className="card card-compact span-2">
        <div className="card-head"><div><span className="card-label">Agenda berikutnya</span><h2>Yang perlu dilakukan</h2></div><Link href="/calendar" className="text-link">Kalender</Link></div>
        {agenda.length ? <div className="agenda-compact">{agenda.map((item) => <div className="agenda-mini" key={item.id}><span className="agenda-time">{formatTime(item.startAt)}</span><span><strong>{item.title}</strong><small>{item.category}</small></span></div>)}</div> : <div className="empty-compact state-inline"><Icon name="calendar" size={18}/><span>Tidak ada agenda yang menunggu.</span></div>}
      </article>
    </section>
  </div>;
}
