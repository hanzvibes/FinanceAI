"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/shared/components/ui/icon";
import type { Transaction, Wallet } from "@/shared/types/domain";
import { formatCurrency, formatDate, formatTime } from "@/shared/utils/format";
import { useSwipeDeck } from "@/shared/hooks/use-swipe-deck";

type CardRole = "current" | "next" | "next2" | "prev" | "prev2" | "far" | "neighbor";

type TransactionReceiptDeckProps = {
  transactions: Transaction[];
  wallets: Wallet[];
  onOpen(transaction: Transaction): void;
  onEdit(transaction: Transaction): void;
  onDelete(transaction: Transaction): void;
};

function typeLabel(transaction: Transaction) {
  if (transaction.type === "income") return "Pemasukan";
  if (transaction.type === "expense") return "Pengeluaran";
  return "Transfer";
}

function amountPrefix(transaction: Transaction) {
  if (transaction.type === "income") return "+";
  if (transaction.type === "expense") return "-";
  return "";
}

function shortReference(id: string) {
  const normalized = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const tail = normalized.slice(-8).padStart(8, "0");
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}

function renderReceiptFrame(stage: HTMLDivElement, dragX: number, width: number) {
  const progress = Math.min(1, Math.abs(dragX) / Math.max(width, 1));
  const towardNext = dragX < 0;
  const towardPrev = dragX > 0;
  const rotate = (dragX / Math.max(width, 1)) * 1.6;

  for (const child of Array.from(stage.children)) {
    if (!(child instanceof HTMLElement)) continue;

    if (child.classList.contains("current")) {
      child.style.transform = `translate3d(${dragX}px, 0, 0) scale(1) rotate(${rotate}deg)`;
      child.style.opacity = "1";
      continue;
    }

    if (child.classList.contains("next")) {
      const lift = towardNext ? progress : 0;
      child.style.transform = `translate3d(${52 * (1 - lift)}px, ${17 * (1 - lift)}px, 0) scale(${0.925 + 0.075 * lift}) rotate(${1.5 * (1 - lift)}deg)`;
      child.style.opacity = String(0.88 + 0.12 * lift);
      continue;
    }

    if (child.classList.contains("prev")) {
      const lift = towardPrev ? progress : 0;
      child.style.transform = `translate3d(${-52 * (1 - lift)}px, ${17 * (1 - lift)}px, 0) scale(${0.925 + 0.075 * lift}) rotate(${-1.5 * (1 - lift)}deg)`;
      child.style.opacity = String(0.88 + 0.12 * lift);
      continue;
    }

    if (child.classList.contains("next2")) {
      // Preserve the proven left-swipe path: the second forward receipt
      // remains parked until the active index is rebased before paint.
      continue;
    }

    if (child.classList.contains("prev2")) {
      const lift = towardPrev ? progress : 0;
      child.style.transform = `translate3d(${-52 * lift}px, ${30 - 13 * lift}px, 0) scale(${0.875 + 0.05 * lift}) rotate(${-1.5 * lift}deg)`;
      child.style.opacity = String(0.48 + 0.4 * lift);
      continue;
    }

    if (child.classList.contains("far")) {
      const lift = towardPrev ? progress : 0;
      child.style.transform = `translate3d(${-52 * lift}px, ${30 - 13 * lift}px, 0) scale(${0.875 + 0.05 * lift}) rotate(${-1.5 * lift}deg)`;
      child.style.opacity = String(0.48 + 0.4 * lift);
      continue;
    }

    if (child.classList.contains("neighbor")) {
      child.style.transform = `translate3d(0, ${17 * (1 - progress)}px, 0) scale(${0.925 + 0.075 * progress})`;
      child.style.opacity = String(0.88 + 0.12 * progress);
    }
  }
}

function resetReceiptFrame(stage: HTMLDivElement) {
  for (const child of Array.from(stage.children)) {
    if (!(child instanceof HTMLElement)) continue;
    child.style.removeProperty("transform");
    child.style.removeProperty("opacity");
  }
}

export function TransactionReceiptDeck({
  transactions,
  wallets,
  onOpen,
  onEdit,
  onDelete,
}: TransactionReceiptDeckProps) {
  const [activeId, setActiveId] = useState(() => transactions[0]?.id ?? "");
  const count = transactions.length;
  const foundIndex = transactions.findIndex((transaction) => transaction.id === activeId);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeTransaction = transactions[activeIndex];
  const walletById = useMemo(() => new Map(wallets.map((wallet) => [wallet.id, wallet])), [wallets]);

  const {
    stageRef,
    suppressClickRef,
    move,
    startGesture,
    moveGesture,
    endGesture,
  } = useSwipeDeck({
    count,
    activeIndex,
    onCommit: (nextIndex) => setActiveId(transactions[nextIndex].id),
    renderFrame: renderReceiptFrame,
    resetFrame: resetReceiptFrame,
  });

  function roleFor(index: number): CardRole | null {
    if (index === activeIndex) return "current";
    if (count === 2) return "neighbor";
    const forward = (index - activeIndex + count) % count;
    if (forward === 1) return "next";
    if (forward === count - 1) return "prev";
    if (count === 4 && forward === 2) return "far";
    if (count > 4 && forward === 2) return "next2";
    if (count > 4 && forward === count - 2) return "prev2";
    return null;
  }

  const indicatorIndices = count <= 3
    ? Array.from({ length: count }, (_, index) => index)
    : [(activeIndex - 1 + count) % count, activeIndex, (activeIndex + 1) % count];

  if (!activeTransaction) return null;


  return (
    <div className="receipt-deck">
      <div
        ref={stageRef}
        className="receipt-deck-stage"
        role="group"
        aria-label="Riwayat transaksi. Geser ke kiri atau kanan untuk berpindah struk."
        aria-roledescription="carousel"
        tabIndex={0}
        onPointerDown={startGesture}
        onPointerMove={moveGesture}
        onPointerUp={(event) => endGesture(event)}
        onPointerCancel={(event) => endGesture(event, true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        }}
      >
        {transactions.map((transaction, index) => {
          const role = roleFor(index);
          if (!role) return null;

          const current = role === "current";
          const wallet = walletById.get(transaction.walletId);
          const destination = transaction.destinationWalletId
            ? walletById.get(transaction.destinationWalletId)
            : undefined;
          const prefix = amountPrefix(transaction);

          return (
            <article
              key={transaction.id}
              className={`receipt-deck-card ${role} ${transaction.type}`}
              aria-hidden={!current}
              role={current ? "button" : undefined}
              tabIndex={current ? 0 : -1}
              aria-label={current ? `Buka detail transaksi ${transaction.description}` : undefined}
              onClick={() => {
                if (!current) return;
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                  return;
                }
                onOpen(transaction);
              }}
              onKeyDown={(event) => {
                if (!current) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpen(transaction);
                }
              }}
            >
              <div className="receipt-card">
                <header className="receipt-card-header">
                  <span className={`receipt-card-icon ${transaction.type}`}>
                    <Icon name={transaction.type === "income" ? "arrow-down" : transaction.type === "expense" ? "arrow-up" : "swap"} size={21}/>
                  </span>
                  <div className="receipt-card-title">
                    <strong>{transaction.description}</strong>
                    <span className={`receipt-type-pill ${transaction.type}`}>
                      <Icon name={transaction.type === "income" ? "arrow-down" : transaction.type === "expense" ? "arrow-up" : "swap"} size={12}/>
                      {typeLabel(transaction)}
                    </span>
                  </div>
                  <strong className={`receipt-card-amount ${transaction.type}`}>{prefix}{formatCurrency(transaction.amount)}</strong>
                </header>

                <p className="receipt-card-description">{transaction.note ?? `${transaction.category} melalui ${wallet?.name ?? "wallet"}.`}</p>

                <div className="receipt-card-details">
                  <div className="receipt-card-row">
                    <span className="receipt-card-row-label"><Icon name="calendar" size={17}/>Tanggal</span>
                    <strong>{formatDate(transaction.date, { day: "2-digit", month: "short", year: "numeric" })} · {formatTime(transaction.date)}</strong>
                  </div>
                  <div className="receipt-card-row">
                    <span className="receipt-card-row-label"><Icon name="wallet" size={17}/>Dompet</span>
                    <strong>{wallet?.name ?? "-"}</strong>
                  </div>
                  {destination && <div className="receipt-card-row"><span className="receipt-card-row-label"><Icon name="swap" size={17}/>Tujuan</span><strong>{destination.name}</strong></div>}
                  <div className="receipt-card-row">
                    <span className="receipt-card-row-label"><Icon name="menu" size={17}/>Kategori</span>
                    <strong>{transaction.category}</strong>
                  </div>
                  <div className="receipt-card-row">
                    <span className="receipt-card-row-label"><Icon name="note" size={17}/>ID transaksi</span>
                    <strong>{shortReference(transaction.id)}</strong>
                  </div>
                </div>

                <div className={`receipt-card-total ${transaction.type}`}>
                  <span>Total</span>
                  <strong>{prefix}{formatCurrency(transaction.amount)}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="receipt-deck-footer">
        <div className="receipt-deck-actions">
          <button type="button" onClick={() => onEdit(activeTransaction)}>Edit</button>
          <button type="button" className="danger-link" onClick={() => onDelete(activeTransaction)}>Hapus</button>
        </div>
        <div className="receipt-deck-nav" aria-label="Navigasi struk transaksi">
          <button type="button" className="receipt-deck-arrow prev" onClick={() => move(-1)} disabled={count < 2} aria-label="Transaksi sebelumnya"><Icon name="chevron-right" size={16}/></button>
          <div className="receipt-deck-progress" aria-live="polite">
            <div className="receipt-deck-dots" aria-hidden="true">
              {indicatorIndices.map((index) => <span key={transactions[index].id} className={index === activeIndex ? "active" : ""}/>)}
            </div>
            <small>{activeIndex + 1} / {count}</small>
          </div>
          <button type="button" className="receipt-deck-arrow" onClick={() => move(1)} disabled={count < 2} aria-label="Transaksi berikutnya"><Icon name="chevron-right" size={16}/></button>
        </div>
      </div>
    </div>
  );
}
