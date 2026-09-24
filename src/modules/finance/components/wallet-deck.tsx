"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "@/shared/components/ui/icon";
import type { Wallet, WalletType } from "@/shared/types/domain";
import { formatCurrency } from "@/shared/utils/format";
import { hapticTick } from "@/shared/utils/haptics";

type WalletWithBalance = Wallet & { balance: number };
type CardRole = "current" | "next" | "next2" | "prev" | "neighbor";

type WalletDeckProps = {
  wallets: WalletWithBalance[];
  typeLabels: Record<WalletType, string>;
  onEdit(wallet: WalletWithBalance): void;
  onToggleArchive(wallet: WalletWithBalance): void;
};

const SETTLE_MS = 320;
const DRAG_REFERENCE = 360;

function walletCardDigits(id: string) {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) value = (value * 31 + id.charCodeAt(index)) % 10000;
  return String(value).padStart(4, "0");
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function WalletDeck({ wallets, typeLabels, onEdit, onToggleArchive }: WalletDeckProps) {
  const [activeId, setActiveId] = useState(() => wallets[0]?.id ?? "");
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
  const timerRef = useRef<number | null>(null);
  const gestureRef = useRef({ startX: 0, lastX: 0, lastTime: 0, velocity: 0, deltaX: 0, width: DRAG_REFERENCE, pointerId: -1 });

  const count = wallets.length;
  const foundIndex = wallets.findIndex((wallet) => wallet.id === activeId);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeWallet = wallets[activeIndex];


  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
    setSettling(true);
    setDragX(direction === 1 ? -DRAG_REFERENCE * 1.45 : DRAG_REFERENCE * 1.45);
    hapticTick();
    finishTransition(() => {
      const nextIndex = (activeIndex + direction + count) % count;
      setActiveId(wallets[nextIndex].id);
    });
  }

  function snapBack() {
    setSettling(true);
    setDragX(0);
    finishTransition();
  }

  function startGesture(event: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2 || settling) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearTimer();
    const width = event.currentTarget.getBoundingClientRect().width || DRAG_REFERENCE;
    gestureRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      deltaX: 0,
      width,
      pointerId: event.pointerId,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
  }

  function moveGesture(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || gestureRef.current.pointerId !== event.pointerId) return;
    const elapsed = Math.max(1, event.timeStamp - gestureRef.current.lastTime);
    const velocity = (event.clientX - gestureRef.current.lastX) / elapsed;
    gestureRef.current.lastX = event.clientX;
    gestureRef.current.lastTime = event.timeStamp;
    gestureRef.current.velocity = velocity;

    const width = gestureRef.current.width;
    const delta = event.clientX - gestureRef.current.startX;
    const absoluteDelta = Math.abs(delta);
    const resistanceStart = width * 0.82;
    const resisted = absoluteDelta <= resistanceStart
      ? absoluteDelta
      : resistanceStart + (absoluteDelta - resistanceStart) * 0.22;
    const limited = Math.sign(delta) * Math.min(width * 0.96, resisted);
    gestureRef.current.deltaX = limited;
    setDragX(limited);
  }

  function endGesture(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    if (!dragging || gestureRef.current.pointerId !== event.pointerId) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }

    if (cancelled) {
      snapBack();
      return;
    }

    const width = gestureRef.current.width;
    const velocity = gestureRef.current.velocity;
    const releaseX = gestureRef.current.deltaX;
    const shouldCommit = Math.abs(releaseX) >= Math.min(88, width * 0.18) || Math.abs(velocity) > 0.48;
    if (!shouldCommit || releaseX === 0) {
      snapBack();
      return;
    }

    move(releaseX < 0 ? 1 : -1);
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

  function cardStyle(role: CardRole, accent: string): CSSProperties {
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
      rotate = dragX * 0.018;
      opacity = 1 - Math.min(0.22, progress * 0.18);
    } else if (role === "next") {
      const lift = towardNext ? progress : 0;
      x = 10 * (1 - lift);
      y = 13 * (1 - lift);
      scale = 0.965 + 0.035 * lift;
      zIndex = 3;
      opacity = 0.96 + 0.04 * lift;
    } else if (role === "prev") {
      const lift = towardPrev ? progress : 0;
      x = -10 * (1 - lift);
      y = 15 * (1 - lift);
      scale = 0.955 + 0.045 * lift;
      zIndex = 3;
      opacity = 0.93 + 0.07 * lift;
    } else if (role === "neighbor") {
      const lift = progress;
      x = (dragX >= 0 ? -10 : 10) * (1 - lift);
      y = 14 * (1 - lift);
      scale = 0.96 + 0.04 * lift;
      zIndex = 3;
      opacity = 0.95 + 0.05 * lift;
    } else {
      x = 16;
      y = 26;
      scale = 0.925;
      zIndex = 2;
      opacity = 0.78;
    }

    return {
      "--wallet-accent": accent,
      transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`,
      opacity,
      zIndex,
    } as CSSProperties;
  }

  if (!activeWallet) return null;

  return (
    <div className="wallet-deck">
      <div
        className={`wallet-deck-stage${dragging ? " is-dragging" : ""}${settling ? " is-settling" : ""}`}
        role="group"
        aria-label="Kartu wallet. Geser ke kiri atau kanan untuk berpindah wallet."
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
        {wallets.map((wallet, index) => {
          const role = roleFor(index);
          if (!role) return null;
          const current = role === "current";
          return (
            <article
              className={`wallet-deck-card ${role}${wallet.archived ? " archived" : ""}`}
              key={wallet.id}
              style={cardStyle(role, wallet.accent)}
              aria-hidden={!current}
            >
              <div className="wallet-credit-surface" aria-label={current ? `${wallet.name}, saldo ${formatCurrency(wallet.balance)}` : undefined}>
                <div className="wallet-credit-top">
                  <span className="wallet-card-brand"><strong>FinanceAI</strong><small>{typeLabels[wallet.type]}</small></span>
                  <span className={`wallet-status ${wallet.archived ? "archived" : ""}`}>{wallet.archived ? "Diarsipkan" : "Aktif"}</span>
                </div>
                <div className="wallet-credit-tech" aria-hidden="true">
                  <span className="wallet-chip-visual"><i/><i/><i/><i/></span>
                  <span className="wallet-contactless"><i/><i/><i/></span>
                </div>
                <div className="wallet-credit-number" aria-label={current ? `Nomor visual berakhir ${walletCardDigits(wallet.id)}` : undefined}>
                  <span>••••</span><span>••••</span><span>••••</span><strong>{walletCardDigits(wallet.id)}</strong>
                </div>
                <div className="wallet-credit-bottom">
                  <span className="wallet-credit-owner"><small>Wallet</small><strong>{wallet.name}</strong></span>
                  <span className="wallet-credit-balance"><small>Saldo</small><strong>{formatCurrency(wallet.balance)}</strong></span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="wallet-deck-footer">
        <div className="entity-actions wallet-deck-actions">
          <button type="button" onClick={() => onEdit(activeWallet)}>Edit</button>
          <button type="button" onClick={() => onToggleArchive(activeWallet)}>{activeWallet.archived ? "Aktifkan" : "Arsipkan"}</button>
        </div>
        <div className="wallet-deck-nav" aria-label="Navigasi kartu wallet">
          <button type="button" className="wallet-deck-arrow prev" onClick={() => move(-1)} disabled={count < 2} aria-label="Wallet sebelumnya"><Icon name="chevron-right" size={16}/></button>
          <div className="wallet-deck-progress" aria-live="polite">
            <div className="wallet-deck-dots" aria-hidden="true">
              {wallets.map((wallet, index) => <span key={wallet.id} className={index === activeIndex ? "active" : ""}/>)}
            </div>
            <small>{activeIndex + 1} / {count}</small>
          </div>
          <button type="button" className="wallet-deck-arrow" onClick={() => move(1)} disabled={count < 2} aria-label="Wallet berikutnya"><Icon name="chevron-right" size={16}/></button>
        </div>
      </div>
    </div>
  );
}
