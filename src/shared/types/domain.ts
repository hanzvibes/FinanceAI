export type TransactionType = "income" | "expense" | "transfer";
export type WalletType = "cash" | "bank" | "ewallet" | "savings" | "investment" | "credit" | "other";
export type GoalStatus = "active" | "paused" | "completed";

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  initialBalance: number;
  accent: string;
  archived?: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  walletId: string;
  destinationWalletId?: string;
  amount: number;
  category: string;
  description: string;
  note?: string;
  date: string;
};

export type FinancialGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  status: GoalStatus;
};

export type Agenda = {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  category: string;
  location?: string;
  done: boolean;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export type AppState = {
  wallets: Wallet[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  agendas: Agenda[];
  notes: Note[];
};
