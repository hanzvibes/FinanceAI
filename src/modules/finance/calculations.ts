import type { AppState, Transaction, Wallet } from "@/shared/types/domain";

export type MonthlyCashflowPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
};

export function walletBalance(wallet: Wallet, transactions: Transaction[]) {
  return transactions.reduce((balance, transaction) => {
    if (transaction.type === "income" && transaction.walletId === wallet.id) return balance + transaction.amount;
    if (transaction.type === "expense" && transaction.walletId === wallet.id) return balance - transaction.amount;
    if (transaction.type === "transfer") {
      if (transaction.walletId === wallet.id) balance -= transaction.amount;
      if (transaction.destinationWalletId === wallet.id) balance += transaction.amount;
    }
    return balance;
  }, wallet.initialBalance);
}

function isCurrentMonth(date: string, now: Date) {
  const candidate = new Date(date);
  return candidate.getFullYear() === now.getFullYear() && candidate.getMonth() === now.getMonth();
}

export function financeSummary(state: AppState, now = new Date()) {
  const activeWallets = state.wallets.filter((wallet) => !wallet.archived);
  const netWorth = activeWallets.reduce((total, wallet) => total + walletBalance(wallet, state.transactions), 0);
  const currentMonth = state.transactions.filter((transaction) => isCurrentMonth(transaction.date, now));
  const income = currentMonth.filter((transaction) => transaction.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = currentMonth.filter((transaction) => transaction.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const savings = income - expense;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  return { netWorth, income, expense, savings, savingsRate };
}

export function monthlyCashflow(transactions: Transaction[], months = 6, now = new Date()): MonthlyCashflowPoint[] {
  const points = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date),
      income: 0,
      expense: 0,
      net: 0,
    };
  });

  const byKey = new Map(points.map((point) => [point.key, point]));

  for (const transaction of transactions) {
    if (transaction.type === "transfer") continue;
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const point = byKey.get(key);
    if (!point) continue;
    if (transaction.type === "income") point.income += transaction.amount;
    if (transaction.type === "expense") point.expense += transaction.amount;
    point.net = point.income - point.expense;
  }

  return points;
}

export function categorySpending(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  transactions.filter((item) => item.type === "expense").forEach((item) => {
    totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
  });
  return [...totals.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}
