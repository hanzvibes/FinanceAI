"use client";

import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Icon } from "@/shared/components/ui/icon";
import { useFinance } from "@/shared/providers/finance-provider";
import { hapticSuccess, hapticTick, hapticWarning } from "@/shared/utils/haptics";
import type { TransactionType } from "@/shared/types/domain";

const expenseCategories = ["Makanan", "Transportasi", "Belanja", "Tagihan", "Rumah", "Hiburan", "Kesehatan", "Pendidikan", "Langganan", "Lainnya"];
const incomeCategories = ["Gaji", "Bonus", "Freelance", "Bisnis", "Investasi", "Refund", "Hadiah", "Lainnya"];
type QuickType = TransactionType | "agenda" | "goal" | "note";

function localDatetimeNow() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

const labels: Record<QuickType, string> = {
  expense: "Pengeluaran",
  income: "Pemasukan",
  transfer: "Transfer",
  agenda: "Agenda",
  goal: "Goal",
  note: "Catatan",
};

export function QuickAdd({ compact = false, floating = false }: { compact?: boolean; floating?: boolean }) {
  const { state, addTransaction, addAgenda, addGoal, addNote } = useFinance();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QuickType>("expense");
  const [category, setCategory] = useState("Makanan");
  const [defaultDateTime] = useState(localDatetimeNow);
  const [message, setMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const firstWallet = useMemo(() => state.wallets.find((wallet) => !wallet.archived)?.id ?? "", [state.wallets]);
  const wallets = state.wallets.filter((wallet) => !wallet.archived);

  function finish(messageText: string) {
    setMessage("");
    setOpen(false);
    hapticSuccess();
    setSavedMessage(messageText);
    window.setTimeout(() => setSavedMessage(""), 2600);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (type === "agenda") {
      const startAt = new Date(String(form.get("startAt"))).toISOString();
      addAgenda({ title: String(form.get("title")).trim(), description: String(form.get("description") || "").trim() || undefined, startAt, category: String(form.get("category") || "Personal"), done: false });
      finish("Agenda tersimpan.");
      return;
    }
    if (type === "goal") {
      addGoal({ name: String(form.get("name")).trim(), targetAmount: Number(form.get("target")), currentAmount: Number(form.get("current")) || 0, targetDate: String(form.get("targetDate") || "") || undefined, status: "active" });
      finish("Goal tersimpan.");
      return;
    }
    if (type === "note") {
      addNote({ title: String(form.get("title")).trim(), content: String(form.get("content")).trim() });
      finish("Catatan tersimpan.");
      return;
    }

    const amount = Number(form.get("amount"));
    const walletId = String(form.get("walletId") || firstWallet);
    const destinationWalletId = String(form.get("destinationWalletId") || "") || undefined;
    if (!amount || !walletId) { hapticWarning(); setMessage("Nominal dan wallet wajib diisi."); return; }
    const result = addTransaction({
      type,
      amount,
      walletId,
      destinationWalletId,
      category: type === "transfer" ? "Transfer" : String(form.get("category") || "Lainnya"),
      description: String(form.get("description") || labels[type]),
      note: String(form.get("note") || "") || undefined,
      date: new Date(String(form.get("date") || new Date().toISOString())).toISOString(),
    });
    if (!result.ok) { hapticWarning(); setMessage(result.message ?? "Transaksi tidak valid."); return; }
    finish(type === "income" ? "Pemasukan tercatat." : type === "expense" ? "Pengeluaran tercatat." : "Transfer tercatat.");
  }

  const triggerClass = floating ? "fab" : compact ? "button primary top-add" : "button primary";
  const isTransaction = type === "expense" || type === "income" || type === "transfer";

  return <>
    <button className={triggerClass} onClick={() => { hapticTick(); setOpen(true); }} aria-label="Tambah data"><Icon name="plus" size={18}/>{!floating && <span>Tambah</span>}</button>
    <Modal open={open} onClose={() => { setOpen(false); setMessage(""); }} title="Tambah cepat" description="Pilih jenis data, isi hal penting dulu, lalu simpan. Detail tambahan tetap opsional.">
      <form className="form-stack quick-add-form" onSubmit={submit}>
        <div className="quick-type-grid" role="group" aria-label="Jenis data yang ditambahkan">
          {(["expense", "income", "transfer", "agenda", "goal", "note"] as QuickType[]).map((value) => (
            <button type="button" key={value} className={type === value ? "quick-type active" : "quick-type"} onClick={() => { hapticTick(); setType(value); setCategory(value === "income" ? "Gaji" : value === "expense" ? "Makanan" : "Transfer"); setMessage(""); }} aria-pressed={type === value}>{labels[value]}</button>
          ))}
        </div>

        {isTransaction && <>
          {!wallets.length && <div className="form-alert">Tambahkan wallet terlebih dahulu dari halaman Finance.</div>}
          <label className="field amount-field"><span>Nominal</span><div className="currency-input"><span>Rp</span><input name="amount" type="number" min="1" inputMode="numeric" placeholder="150000" required autoFocus/></div></label>
          <div className="form-grid primary-fields">
            <label className="field"><span>Wallet</span><select name="walletId" defaultValue={firstWallet} required>{wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label>
            {type === "transfer" ? (
              <label className="field"><span>Wallet tujuan</span><select name="destinationWalletId" defaultValue="" required><option value="" disabled>Pilih wallet berbeda</option>{wallets.map((wallet) => <option value={wallet.id} key={wallet.id}>{wallet.name}</option>)}</select></label>
            ) : (
              <div className="field native-choice-field"><span>Kategori</span><input type="hidden" name="category" value={category}/><div className="native-chip-scroller" role="radiogroup" aria-label="Kategori transaksi">{(type === "income" ? incomeCategories : expenseCategories).map((item) => <button type="button" key={item} role="radio" aria-checked={category === item} className={category === item ? "native-choice-chip active" : "native-choice-chip"} onClick={() => { hapticTick(); setCategory(item); }}>{item}</button>)}</div></div>
            )}
          </div>
          <details className="form-details">
            <summary>Detail lainnya <span>opsional</span></summary>
            <div className="form-details-body">
              <label className="field"><span>Tanggal & waktu</span><input name="date" type="datetime-local" defaultValue={defaultDateTime} required/></label>
              <label className="field"><span>Deskripsi</span><input name="description" placeholder={type === "income" ? "Contoh: Gaji bulanan" : type === "expense" ? "Contoh: Makan siang" : "Contoh: Pindah dana"}/></label>
              <label className="field"><span>Catatan</span><textarea name="note" rows={2} placeholder="Tambahkan detail singkat..."/></label>
            </div>
          </details>
        </>}
        {type === "agenda" && <><label className="field"><span>Judul agenda</span><input name="title" required autoFocus placeholder="Contoh: Review keuangan"/></label><div className="form-grid"><label className="field"><span>Waktu</span><input name="startAt" type="datetime-local" defaultValue={defaultDateTime} required/></label><label className="field"><span>Kategori</span><select name="category"><option>Personal</option><option>Finance</option><option>Health</option><option>Work</option></select></label></div><label className="field"><span>Deskripsi</span><textarea name="description" rows={3}/></label></>}
        {type === "goal" && <><label className="field"><span>Nama target</span><input name="name" required autoFocus placeholder="Contoh: Dana darurat"/></label><div className="form-grid"><label className="field"><span>Target nominal</span><input name="target" type="number" inputMode="numeric" min="1" required/></label><label className="field"><span>Progress awal</span><input name="current" type="number" inputMode="numeric" min="0" defaultValue="0"/></label></div><label className="field"><span>Target tanggal</span><input name="targetDate" type="date"/></label></>}
        {type === "note" && <><label className="field"><span>Judul</span><input name="title" required autoFocus placeholder="Contoh: Fokus bulan ini"/></label><label className="field"><span>Isi catatan</span><textarea name="content" rows={5} required/></label></>}
        {message && <div className="form-alert error" role="alert">{message}</div>}
        <div className="modal-actions sticky-actions"><button type="button" className="button ghost" onClick={() => { setOpen(false); setMessage(""); }}>Batal</button><button className="button primary" type="submit" disabled={isTransaction && !wallets.length}>Simpan {labels[type].toLowerCase()}</button></div>
      </form>
    </Modal>
    {savedMessage && <div className="toast success-toast" role="status"><Icon name="check" size={16}/>{savedMessage}</div>}
  </>;
}
