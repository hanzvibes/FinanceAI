import type { AppState } from "@/shared/types/domain";

function dateOffset(days: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function monthOffset(monthsAgo: number, day: number, hour = 10) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1, hour, 0, 0, 0);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.toISOString();
}

export const demoState: AppState = {
  wallets: [
    { id: "wallet-main", name: "Bank Utama", type: "bank", initialBalance: 16500000, accent: "#173f35" },
    { id: "wallet-cash", name: "Cash", type: "cash", initialBalance: 1250000, accent: "#c78e3f" },
    { id: "wallet-ewallet", name: "E-Wallet", type: "ewallet", initialBalance: 850000, accent: "#6d76d8" },
    { id: "wallet-invest", name: "Investasi", type: "investment", initialBalance: 24750000, accent: "#2e748d" },
  ],
  transactions: [
    { id: "tx-salary", type: "income", walletId: "wallet-main", amount: 8500000, category: "Gaji", description: "Gaji bulanan", date: dateOffset(-12, 9) },
    { id: "tx-rent", type: "expense", walletId: "wallet-main", amount: 2200000, category: "Rumah", description: "Sewa tempat tinggal", date: dateOffset(-10, 8) },
    { id: "tx-food", type: "expense", walletId: "wallet-ewallet", amount: 85000, category: "Makanan", description: "Makan siang", date: dateOffset(-2, 12, 30) },
    { id: "tx-coffee", type: "expense", walletId: "wallet-ewallet", amount: 32000, category: "Makanan", description: "Kopi", date: dateOffset(-1, 16) },
    { id: "tx-freelance", type: "income", walletId: "wallet-main", amount: 1750000, category: "Freelance", description: "Project freelance", date: dateOffset(-4, 14) },
    { id: "tx-groceries", type: "expense", walletId: "wallet-main", amount: 485000, category: "Belanja", description: "Belanja mingguan", date: dateOffset(-3, 18) },
    { id: "tx-transfer", type: "transfer", walletId: "wallet-main", destinationWalletId: "wallet-ewallet", amount: 500000, category: "Transfer", description: "Top up e-wallet", date: dateOffset(-5, 17) },

    { id: "hist-1-income", type: "income", walletId: "wallet-main", amount: 8300000, category: "Gaji", description: "Gaji", date: monthOffset(1, 2, 9) },
    { id: "hist-1-expense", type: "expense", walletId: "wallet-main", amount: 4450000, category: "Kebutuhan", description: "Pengeluaran bulanan", date: monthOffset(1, 18, 12) },
    { id: "hist-2-income", type: "income", walletId: "wallet-main", amount: 8300000, category: "Gaji", description: "Gaji", date: monthOffset(2, 2, 9) },
    { id: "hist-2-extra", type: "income", walletId: "wallet-main", amount: 950000, category: "Freelance", description: "Freelance", date: monthOffset(2, 15, 15) },
    { id: "hist-2-expense", type: "expense", walletId: "wallet-main", amount: 5120000, category: "Kebutuhan", description: "Pengeluaran bulanan", date: monthOffset(2, 20, 12) },
    { id: "hist-3-income", type: "income", walletId: "wallet-main", amount: 8100000, category: "Gaji", description: "Gaji", date: monthOffset(3, 2, 9) },
    { id: "hist-3-expense", type: "expense", walletId: "wallet-main", amount: 4780000, category: "Kebutuhan", description: "Pengeluaran bulanan", date: monthOffset(3, 21, 12) },
    { id: "hist-4-income", type: "income", walletId: "wallet-main", amount: 8100000, category: "Gaji", description: "Gaji", date: monthOffset(4, 2, 9) },
    { id: "hist-4-expense", type: "expense", walletId: "wallet-main", amount: 5660000, category: "Kebutuhan", description: "Pengeluaran bulanan", date: monthOffset(4, 19, 12) },
    { id: "hist-5-income", type: "income", walletId: "wallet-main", amount: 7900000, category: "Gaji", description: "Gaji", date: monthOffset(5, 2, 9) },
    { id: "hist-5-expense", type: "expense", walletId: "wallet-main", amount: 4930000, category: "Kebutuhan", description: "Pengeluaran bulanan", date: monthOffset(5, 20, 12) },
  ],
  goals: [
    { id: "goal-emergency", name: "Dana Darurat", targetAmount: 15000000, currentAmount: 10200000, targetDate: dateOffset(150), status: "active" },
    { id: "goal-laptop", name: "Upgrade Laptop", targetAmount: 22000000, currentAmount: 7200000, targetDate: dateOffset(240), status: "active" },
  ],
  agendas: [
    { id: "agenda-review", title: "Review keuangan mingguan", startAt: dateOffset(0, 19), category: "Finance", done: false },
    { id: "agenda-gym", title: "Gym", startAt: dateOffset(1, 18), category: "Health", done: false },
    { id: "agenda-planning", title: "Weekly planning", startAt: dateOffset(2, 9), category: "Personal", done: false },
  ],
  notes: [
    { id: "note-focus", title: "Fokus bulan ini", content: "Kurangi pengeluaran impulsif dan tambahkan dana darurat sebelum akhir bulan.", updatedAt: dateOffset(-1) },
    { id: "note-ideas", title: "Ide kecil", content: "Coba review langganan bulanan yang sudah jarang dipakai.", updatedAt: dateOffset(-3) },
  ],
};
