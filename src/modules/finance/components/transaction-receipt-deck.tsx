"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Icon } from "@/shared/components/ui/icon";
import type { Transaction, Wallet } from "@/shared/types/domain";
import { formatCurrency, formatDate, formatTime } from "@/shared/utils/format";
import { hapticTick } from "@/shared/utils/haptics";

type CardRole = "current" | "next" | "next2" | "prev" | "neighbor";
type GestureAxis = "pending" | "horizontal" | "vertical";

type TransactionReceiptDeckProps = {
  transactions: Transaction[];
  wallets: Wallet[];
  onOpen(transaction: Transaction): void;
  onEdit(transaction: Transaction): void;
  onDelete(transaction: Transaction): void;
};

const SETTLE_MS = 320;
const DRAG_REFERENCE = 420;
const AXIS_LOCK_PX = 7;
const AXIS_DOMINANCE = 1.15;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

export function TransactionReceiptDeck({
  transactions,
  wallets,
  onOpen,
  onEdit,
  onDelete,
}: TransactionReceiptDeckProps) {
  const [activeId, setActiveId] = useState(() => transactions[0]?.id ?? "");
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingDragXRef = useRef(0);
  const suppressClickRef = useRef(false);
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    deltaX: 0,
    width: DRAG_REFERENCE,
    pointerId: -1,
    axis: "pending" as GestureAxis,
  });

  const count = transactions.length;
  const foundIndex = transactions.findIndex((transaction) => transaction.id === activeId);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeTransaction = transactions[activeIndex];
  const walletById = new Map(wallets.map((wallet) => [wallet.id, wallet]));

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
  }, []);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearDragFrame() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  function scheduleDragX(value: number) {
    pendingDragXRef.current = value;
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      setDragX(pendingDragXRef.current);
    });
  }

  function finishTransition(callback?: () => void) {
    clearTimer();
    const duration = prefersReducedMotion() ? 0 : SETTLE_MS;
    timerRef.current = window.setTimeout(() => {
      callback?.();
      setDragX(0);
      setDragging(false);
      setSettling(false);
      timerRef.current = null;
    }, duration);
  }

  function move(direction: 1 | -1) {
    if (count < 2 || settling) return;
    clearDragFrame();
    setDragging(false);
    setSettling(true);
    setDragX(direction === 1 ? -DRAG_REFERENCE * 1.35 : DRAG_REFERENCE * 1.35);
    hapticTick();
    finishTransition(() => {
      const nextIndex = (activeIndex + direction + count) % count;
      setActiveId(transactions[nextIndex].id);
    });
  }

  function snapBack() {
    clearDragFrame();
    setDragging(false);
    setSettling(true);
    setDragX(0);
    finishTransition();
  }

  function startGesture(event: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2 || settling) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    suppressClickRef.current = false;
    clearTimer();
    clearDragFrame();

    const width = event.currentTarget.getBoundingClientRect().width || DRAG_REFERENCE;
    const mouseGesture = event.pointerType === "mouse";
    gestureRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      deltaX: 0,
      width,
      pointerId: event.pointerId,
      axis: mouseGesture ? "horizontal" : "pending",
    };

    if (mouseGesture) {
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function moveGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (gesture.pointerId !== event.pointerId || gesture.axis === "vertical") return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);

    if (gesture.axis === "pending") {
      if (Math.max(absoluteX, absoluteY) < AXIS_LOCK_PX) return;

      if (absoluteY > absoluteX * AXIS_DOMINANCE) {
        gesture.axis = "vertical";
        gesture.pointerId = -1;
        setDragging(false);
        return;
      }

      if (absoluteX < absoluteY * AXIS_DOMINANCE) return;

      gesture.axis = "horizontal";
      gesture.lastX = event.clientX;
      gesture.lastTime = event.timeStamp;
      gesture.velocity = 0;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    if (absoluteX > AXIS_LOCK_PX) suppressClickRef.current = true;

    const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
    gesture.velocity = (event.clientX - gesture.lastX) / elapsed;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;

    const resistanceStart = gesture.width * 0.8;
    const resisted = absoluteX <= resistanceStart
      ? absoluteX
      : resistanceStart + (absoluteX - resistanceStart) * 0.2;
    const limited = Math.sign(deltaX) * Math.min(gesture.width * 0.94, resisted);

    gesture.deltaX = limited;
    scheduleDragX(limited);
  }

  function endGesture(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = gestureRef.current;
    if (gesture.pointerId !== event.pointerId) return;

    const wasHorizontal = gesture.axis === "horizontal";
    gesture.pointerId = -1;

    if (!wasHorizontal) {
      clearDragFrame();
      setDragging(false);
      return;
    }

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already be released by the browser.
    }

    if (cancelled) {
      snapBack();
      return;
    }

    const shouldCommit =
      Math.abs(gesture.deltaX) >= Math.min(92, gesture.width * 0.18) ||
      Math.abs(gesture.velocity) > 0.48;

    if (!shouldCommit || gesture.deltaX === 0) {
      snapBack();
      return;
    }

    move(gesture.deltaX < 0 ? 1 : -1);
  }

  function roleFor(index: number): CardRole | null {
    if (index === activeIndex) return "current";
    if (count === 2) return "neighbor";

    const forward = (index - activeIndex + count) % count;
    if (forward === 1) return "next";
    if (forward === count - 1) return "prev";
    if (count > 3 && forward === 2) return "next2";
    return null;
  }

  function cardStyle(role: CardRole): CSSProperties {
    const progress = Math.min(1, Math.abs(dragX) / DRAG_REFERENCE);
    const towardNext = dragX < 0;
    const towardPrev = dragX > 0;
    let x = 0;
    let y = 0;
    let scale = 1;
    let rotate = 0;
    let opacity = 1;
    let zIndex = 4;

    if (role === "current") {
      x = dragX;
      rotate = dragX * 0.012;
      opacity = 1 - Math.min(0.18, progress * 0.14);
    } else if (role === "next") {
      const lift = towardNext ? progress : 0;
      x = 68 * (1 - lift);
      y = 17 * (1 - lift);
      scale = 0.925 + 0.075 * lift;
      rotate = 2.4 * (1 - lift);
      zIndex = 3;
      opacity = 0.86 + 0.14 * lift;
    } else if (role === "prev") {
      const lift = towardPrev ? progress : 0;
      x = -68 * (1 - lift);
      y = 17 * (1 - lift);
      scale = 0.925 + 0.075 * lift;
      rotate = -2.4 * (1 - lift);
      zIndex = 3;
      opacity = 0.86 + 0.14 * lift;
    } else if (role === "neighbor") {
      const direction = dragX > 0 ? -1 : 1;
      const lift = progress;
      x = direction * 68 * (1 - lift);
      y = 17 * (1 - lift);
      scale = 0.925 + 0.075 * lift;
      rotate = direction * 2.4 * (1 - lift);
      zIndex = 3;
      opacity = 0.86 + 0.14 * lift;
    } else {
      x = 0;
      y = 30;
      scale = 0.875;
      zIndex = 2;
      opacity = 0.48;
    }

    return {
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
      opacity,
      zIndex,
    };
  }

  const indicatorIndices = count <= 3
    ? Array.from({ length: count }, (_, index) => index)
    : [(activeIndex - 1 + count) % count, activeIndex, (activeIndex + 1) % count];

  if (!activeTransaction) return null;

  return (
    <div className="receipt-deck">
      <div
        className={`receipt-deck-stage${dragging ? " is-dragging" : ""}${settling ? " is-settling" : ""}`}
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
              style={cardStyle(role)}
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
                    <Icon
                      name={transaction.type === "income" ? "arrow-down" : transaction.type === "expense" ? "arrow-up" : "swap"}
                      size={21}
                    />
                  </span>
                  <div className="receipt-card-title">
                    <strong>{transaction.description}</strong>
                    <span className={`receipt-type-pill ${transaction.type}`}>
                      <Icon
                        name={transaction.type === "income" ? "arrow-down" : transaction.type === "expense" ? "arrow-up" : "swap"}
                        size={12}
                      />
                      {typeLabel(transaction)}
                    </span>
                  </div>
                  <strong className={`receipt-card-amount ${transaction.type}`}>
                    {prefix}{formatCurrency(transaction.amount)}
                  </strong>
                </header>

                <p className="receipt-card-description">
                  {transaction.note ?? `${transaction.category} melalui ${wallet?.name ?? "wallet"}.`}
                </p>

                <div className="receipt-card-details">
                  <div className="receipt-card-row">
                    <span className="receipt-card-row-label"><Icon name="calendar" size={17}/>Tanggal</span>
                    <strong>{formatDate(transaction.date, { day: "2-digit", month: "short", year: "numeric" })} · {formatTime(transaction.date)}</strong>
                  </div>
                  <div className="receipt-card-row">
                    <span className="receipt-card-row-label"><Icon name="wallet" size={17}/>Dompet</span>
                    <strong>{wallet?.name ?? "-"}</strong>
                  </div>
                  {destination && (
                    <div className="receipt-card-row">
                      <span className="receipt-card-row-label"><Icon name="swap" size={17}/>Tujuan</span>
                      <strong>{destination.name}</strong>
                    </div>
                  )}
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
          <button type="button" className="receipt-deck-arrow prev" onClick={() => move(-1)} disabled={count < 2} aria-label="Transaksi sebelumnya">
            <Icon name="chevron-right" size={16}/>
          </button>
          <div className="receipt-deck-progress" aria-live="polite">
            <div className="receipt-deck-dots" aria-hidden="true">
              {indicatorIndices.map((index) => (
                <span key={transactions[index].id} className={index === activeIndex ? "active" : ""}/>
              ))}
            </div>
            <small>{activeIndex + 1} / {count}</small>
          </div>
          <button type="button" className="receipt-deck-arrow" onClick={() => move(1)} disabled={count < 2} aria-label="Transaksi berikutnya">
            <Icon name="chevron-right" size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}
