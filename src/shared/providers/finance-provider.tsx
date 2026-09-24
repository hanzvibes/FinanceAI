"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { indexedDbAppRepository } from "@/infrastructure/database/indexeddb-app-repository";
import { demoState } from "@/shared/data/demo-state";
import type { Agenda, AppState, FinancialGoal, Note, Transaction, Wallet } from "@/shared/types/domain";
import { uid } from "@/shared/utils/format";
import { validateAppState } from "@/shared/validation/app-state";

type FinanceContextValue = {
  state: AppState;
  ready: boolean;
  storageError: string | null;
  addWallet(input: Omit<Wallet, "id">): void;
  updateWallet(id: string, input: Partial<Omit<Wallet, "id">>): void;
  archiveWallet(id: string, archived?: boolean): { ok: boolean; message?: string };
  addTransaction(input: Omit<Transaction, "id">): { ok: boolean; message?: string };
  updateTransaction(id: string, input: Omit<Transaction, "id">): { ok: boolean; message?: string };
  deleteTransaction(id: string): void;
  addGoal(input: Omit<FinancialGoal, "id">): void;
  updateGoal(id: string, input: Partial<Omit<FinancialGoal, "id">>): void;
  deleteGoal(id: string): void;
  addAgenda(input: Omit<Agenda, "id">): void;
  updateAgenda(id: string, input: Omit<Agenda, "id">): void;
  deleteAgenda(id: string): void;
  toggleAgenda(id: string): void;
  addNote(input: Omit<Note, "id" | "updatedAt">): void;
  updateNote(id: string, input: Pick<Note, "title" | "content">): void;
  deleteNote(id: string): void;
  exportData(): void;
  importData(file: File): Promise<{ ok: boolean; message: string }>;
  resetDemo(): void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

function validTransaction(input: Omit<Transaction, "id">) {
  if (!input.walletId || !Number.isFinite(input.amount) || input.amount <= 0) return "Nominal dan wallet harus valid.";
  if (input.type === "transfer" && (!input.destinationWalletId || input.destinationWalletId === input.walletId)) return "Wallet tujuan transfer harus berbeda dari wallet sumber.";
  return null;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(demoState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    let alive = true;
    indexedDbAppRepository.load().then((saved) => {
      if (!alive) return;
      const validated = saved ? validateAppState(saved) : null;
      setState(validated?.ok ? validated.data : demoState);
      setReady(true);
      hydrated.current = true;
    }).catch(() => {
      if (!alive) return;
      setState(demoState);
      setStorageError("Penyimpanan lokal tidak dapat dibuka. Data sesi tetap dapat digunakan sementara.");
      setReady(true);
      hydrated.current = true;
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready || !hydrated.current) return;
    indexedDbAppRepository.save(state).then(() => setStorageError(null)).catch(() => setStorageError("Perubahan belum dapat disimpan ke IndexedDB."));
  }, [state, ready]);

  const addWallet = useCallback((input: Omit<Wallet, "id">) => setState((current) => ({ ...current, wallets: [{ ...input, id: uid("wallet") }, ...current.wallets] })), []);
  const updateWallet = useCallback((id: string, input: Partial<Omit<Wallet, "id">>) => setState((current) => ({ ...current, wallets: current.wallets.map((item) => item.id === id ? { ...item, ...input } : item) })), []);
  const archiveWallet = useCallback((id: string, archived = true) => {
    const hasTransactions = state.transactions.some((tx) => tx.walletId === id || tx.destinationWalletId === id);
    if (archived && hasTransactions) {
      setState((current) => ({ ...current, wallets: current.wallets.map((item) => item.id === id ? { ...item, archived: true } : item) }));
      return { ok: true, message: "Wallet diarsipkan. Riwayat transaksi tetap dipertahankan." };
    }
    setState((current) => ({ ...current, wallets: current.wallets.map((item) => item.id === id ? { ...item, archived } : item) }));
    return { ok: true };
  }, [state.transactions]);

  const addTransaction = useCallback((input: Omit<Transaction, "id">) => {
    const error = validTransaction(input); if (error) return { ok: false, message: error };
    setState((current) => ({ ...current, transactions: [{ ...input, id: uid("tx") }, ...current.transactions] }));
    return { ok: true };
  }, []);
  const updateTransaction = useCallback((id: string, input: Omit<Transaction, "id">) => {
    const error = validTransaction(input); if (error) return { ok: false, message: error };
    setState((current) => ({ ...current, transactions: current.transactions.map((item) => item.id === id ? { ...input, id } : item) }));
    return { ok: true };
  }, []);
  const deleteTransaction = useCallback((id: string) => setState((current) => ({ ...current, transactions: current.transactions.filter((item) => item.id !== id) })), []);

  const addGoal = useCallback((input: Omit<FinancialGoal, "id">) => setState((current) => ({ ...current, goals: [{ ...input, id: uid("goal") }, ...current.goals] })), []);
  const updateGoal = useCallback((id: string, input: Partial<Omit<FinancialGoal, "id">>) => setState((current) => ({ ...current, goals: current.goals.map((item) => item.id === id ? { ...item, ...input } : item) })), []);
  const deleteGoal = useCallback((id: string) => setState((current) => ({ ...current, goals: current.goals.filter((item) => item.id !== id) })), []);

  const addAgenda = useCallback((input: Omit<Agenda, "id">) => setState((current) => ({ ...current, agendas: [...current.agendas, { ...input, id: uid("agenda") }].sort((a, b) => a.startAt.localeCompare(b.startAt)) })), []);
  const updateAgenda = useCallback((id: string, input: Omit<Agenda, "id">) => setState((current) => ({ ...current, agendas: current.agendas.map((item) => item.id === id ? { ...input, id } : item).sort((a, b) => a.startAt.localeCompare(b.startAt)) })), []);
  const deleteAgenda = useCallback((id: string) => setState((current) => ({ ...current, agendas: current.agendas.filter((item) => item.id !== id) })), []);
  const toggleAgenda = useCallback((id: string) => setState((current) => ({ ...current, agendas: current.agendas.map((item) => item.id === id ? { ...item, done: !item.done } : item) })), []);

  const addNote = useCallback((input: Omit<Note, "id" | "updatedAt">) => setState((current) => ({ ...current, notes: [{ ...input, id: uid("note"), updatedAt: new Date().toISOString() }, ...current.notes] })), []);
  const updateNote = useCallback((id: string, input: Pick<Note, "title" | "content">) => setState((current) => ({ ...current, notes: current.notes.map((item) => item.id === id ? { ...item, ...input, updatedAt: new Date().toISOString() } : item) })), []);
  const deleteNote = useCallback((id: string) => setState((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) })), []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `financeai-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback(async (file: File) => {
    if (file.size > 5_000_000) return { ok: false, message: "File backup terlalu besar (maksimal 5 MB)." };
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = validateAppState(parsed);
      if (!result.ok) return result;
      setState(result.data);
      return { ok: true, message: "Backup tervalidasi dan berhasil diimpor." };
    } catch { return { ok: false, message: "File tidak dapat dibaca sebagai JSON FinanceAI." }; }
  }, []);

  const resetDemo = useCallback(() => setState(demoState), []);
  const value = useMemo(() => ({ state, ready, storageError, addWallet, updateWallet, archiveWallet, addTransaction, updateTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal, addAgenda, updateAgenda, deleteAgenda, toggleAgenda, addNote, updateNote, deleteNote, exportData, importData, resetDemo }), [state, ready, storageError, addWallet, updateWallet, archiveWallet, addTransaction, updateTransaction, deleteTransaction, addGoal, updateGoal, deleteGoal, addAgenda, updateAgenda, deleteAgenda, toggleAgenda, addNote, updateNote, deleteNote, exportData, importData, resetDemo]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
}
