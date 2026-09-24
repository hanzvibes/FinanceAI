"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFinance } from "@/shared/providers/finance-provider";
import { Icon } from "@/shared/components/ui/icon";
import { formatCurrency, formatDate } from "@/shared/utils/format";

type Result = { id: string; title: string; detail: string; href: string; icon: "wallet" | "target" | "calendar" | "note" | "home" };
const features: Result[] = [
  { id: "feature-dashboard", title: "Dashboard", detail: "Ringkasan FinanceAI", href: "/", icon: "home" },
  { id: "feature-transactions", title: "Transaksi", detail: "Ledger income, expense, transfer", href: "/finance", icon: "wallet" },
  { id: "feature-wallets", title: "Wallet", detail: "Kelola rekening dan dompet", href: "/finance", icon: "wallet" },
  { id: "feature-goals", title: "Financial goals", detail: "Target keuangan", href: "/finance", icon: "target" },
  { id: "feature-calendar", title: "Calendar", detail: "Agenda pribadi", href: "/calendar", icon: "calendar" },
  { id: "feature-notes", title: "Notes", detail: "Catatan pribadi", href: "/personal", icon: "note" },
];

export function GlobalSearch() {
  function finishNavigation() {
    setQuery("");
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }
  const { state } = useFinance(); const [query, setQuery] = useState(""); const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (normalized.length < 2) return [];
    const items: Result[] = [];
    features.forEach((item) => { if (`${item.title} ${item.detail}`.toLowerCase().includes(normalized)) items.push(item); });
    state.transactions.forEach((tx) => { if (`${tx.description} ${tx.category} ${tx.note ?? ""}`.toLowerCase().includes(normalized)) items.push({ id: tx.id, title: tx.description, detail: `${tx.category} · ${formatCurrency(tx.amount)}`, href: "/finance", icon: "wallet" }); });
    state.wallets.forEach((wallet) => { if (wallet.name.toLowerCase().includes(normalized)) items.push({ id: wallet.id, title: wallet.name, detail: wallet.archived ? "Wallet · archived" : "Wallet", href: "/finance", icon: "wallet" }); });
    state.goals.forEach((goal) => { if (goal.name.toLowerCase().includes(normalized)) items.push({ id: goal.id, title: goal.name, detail: `Financial goal · ${goal.status}`, href: "/finance", icon: "target" }); });
    state.agendas.forEach((agenda) => { if (`${agenda.title} ${agenda.description ?? ""} ${agenda.location ?? ""}`.toLowerCase().includes(normalized)) items.push({ id: agenda.id, title: agenda.title, detail: formatDate(agenda.startAt), href: "/calendar", icon: "calendar" }); });
    state.notes.forEach((note) => { if (`${note.title} ${note.content}`.toLowerCase().includes(normalized)) items.push({ id: note.id, title: note.title, detail: "Note", href: "/personal", icon: "note" }); });
    return items.slice(0, 10);
  }, [state, normalized]);

  return <div className="global-search"><Icon name="search" size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari transaksi, wallet, goal, agenda..." aria-label="Pencarian global" />{normalized.length >= 2 && <div className="search-results">{results.length ? results.map((item) => <Link href={item.href} className="search-result" key={item.id} onClick={finishNavigation}><span className="search-result-icon"><Icon name={item.icon} size={17}/></span><span><strong>{item.title}</strong><small>{item.detail}</small></span></Link>) : <div className="search-empty">Tidak ada hasil untuk “{query}”.</div>}</div>}</div>;
}
