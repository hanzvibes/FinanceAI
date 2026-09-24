import type { Agenda, AppState, FinancialGoal, Note, Transaction, Wallet } from "@/shared/types/domain";

const walletTypes = new Set(["cash", "bank", "ewallet", "savings", "investment", "credit", "other"]);
const transactionTypes = new Set(["income", "expense", "transfer"]);
const goalStatuses = new Set(["active", "paused", "completed"]);

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function string(value: unknown): value is string { return typeof value === "string"; }
function nonEmpty(value: unknown): value is string { return string(value) && value.trim().length > 0; }
function finite(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function iso(value: unknown): value is string { return string(value) && !Number.isNaN(Date.parse(value)); }

function wallet(value: unknown): value is Wallet {
  if (!object(value)) return false;
  return nonEmpty(value.id) && nonEmpty(value.name) && string(value.type) && walletTypes.has(value.type) && finite(value.initialBalance) && value.initialBalance >= 0 && nonEmpty(value.accent) && (value.archived === undefined || typeof value.archived === "boolean");
}

function transaction(value: unknown): value is Transaction {
  if (!object(value)) return false;
  if (!nonEmpty(value.id) || !string(value.type) || !transactionTypes.has(value.type) || !nonEmpty(value.walletId) || !finite(value.amount) || value.amount <= 0 || !nonEmpty(value.category) || !nonEmpty(value.description) || !iso(value.date)) return false;
  if (value.note !== undefined && !string(value.note)) return false;
  if (value.destinationWalletId !== undefined && !string(value.destinationWalletId)) return false;
  if (value.type === "transfer" && (!nonEmpty(value.destinationWalletId) || value.destinationWalletId === value.walletId)) return false;
  return true;
}

function goal(value: unknown): value is FinancialGoal {
  if (!object(value)) return false;
  return nonEmpty(value.id) && nonEmpty(value.name) && finite(value.targetAmount) && value.targetAmount > 0 && finite(value.currentAmount) && value.currentAmount >= 0 && string(value.status) && goalStatuses.has(value.status) && (value.targetDate === undefined || value.targetDate === "" || iso(value.targetDate));
}

function agenda(value: unknown): value is Agenda {
  if (!object(value)) return false;
  return nonEmpty(value.id) && nonEmpty(value.title) && iso(value.startAt) && nonEmpty(value.category) && typeof value.done === "boolean" && (value.endAt === undefined || iso(value.endAt)) && (value.description === undefined || string(value.description)) && (value.location === undefined || string(value.location));
}

function note(value: unknown): value is Note {
  if (!object(value)) return false;
  return nonEmpty(value.id) && nonEmpty(value.title) && string(value.content) && iso(value.updatedAt);
}

export function validateAppState(value: unknown): { ok: true; data: AppState } | { ok: false; message: string } {
  if (!object(value)) return { ok: false, message: "Backup harus berupa object JSON FinanceAI." };
  const { wallets, transactions, goals, agendas, notes } = value;
  if (![wallets, transactions, goals, agendas, notes].every(Array.isArray)) return { ok: false, message: "Backup tidak memiliki koleksi FinanceAI yang lengkap." };
  if (!(wallets as unknown[]).every(wallet)) return { ok: false, message: "Data wallet pada backup tidak valid." };
  if (!(transactions as unknown[]).every(transaction)) return { ok: false, message: "Data transaksi pada backup tidak valid." };
  if (!(goals as unknown[]).every(goal)) return { ok: false, message: "Data financial goal pada backup tidak valid." };
  if (!(agendas as unknown[]).every(agenda)) return { ok: false, message: "Data agenda pada backup tidak valid." };
  if (!(notes as unknown[]).every(note)) return { ok: false, message: "Data catatan pada backup tidak valid." };

  const collections: Array<[string, Array<{ id: string }>]> = [
    ["wallet", wallets as Wallet[]],
    ["transaksi", transactions as Transaction[]],
    ["financial goal", goals as FinancialGoal[]],
    ["agenda", agendas as Agenda[]],
    ["catatan", notes as Note[]],
  ];
  for (const [label, items] of collections) {
    if (new Set(items.map((item) => item.id)).size !== items.length) return { ok: false, message: `Backup memiliki ID ${label} duplikat.` };
  }

  const walletIds = new Set((wallets as Wallet[]).map((item) => item.id));
  for (const item of transactions as Transaction[]) {
    if (!walletIds.has(item.walletId) || (item.destinationWalletId && !walletIds.has(item.destinationWalletId))) return { ok: false, message: "Ada transaksi yang merujuk wallet yang tidak tersedia." };
  }
  return { ok: true, data: value as AppState };
}
