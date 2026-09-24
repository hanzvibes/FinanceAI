"use client";

import { useState, type CSSProperties } from "react";
import { Icon } from "@/shared/components/ui/icon";
import type { Wallet, WalletType } from "@/shared/types/domain";
import { formatCurrency } from "@/shared/utils/format";
import { useSwipeDeck } from "@/shared/hooks/use-swipe-deck";

type WalletWithBalance = Wallet & { balance: number };
type CardRole = "current" | "next" | "next2" | "prev" | "neighbor";

type WalletDeckProps = {
  wallets: WalletWithBalance[];
  typeLabels: Record<WalletType, string>;
  onEdit(wallet: WalletWithBalance): void;
  onToggleArchive(wallet: WalletWithBalance): void;
};

function walletCardDigits(id: string) {
  let value = 0;
  for (let index = 0; index < id.length; index += 1) value = (value * 31 + id.charCodeAt(index)) % 10000;
  return String(value).padStart(4, "0");
}

function renderWalletFrame(stage: HTMLDivElement, dragX: number, width: number) {
  const progress = Math.min(1, Math.abs(dragX) / Math.max(width, 1));
  const towardNext = dragX < 0;
  const towardPrev = dragX > 0;
  const rotate = (dragX / Math.max(width, 1)) * 2.2;

  for (const child of Array.from(stage.children)) {
    if (!(child instanceof HTMLElement)) continue;

    if (child.classList.contains("current")) {
      child.style.transform = `translate3d(${dragX}px, 0, 0) scale(1) rotate(${rotate}deg)`;
      child.style.opacity = "1";
      continue;
    }

    if (child.classList.contains("next")) {
      const lift = towardNext ? progress : 0;
      child.style.transform = `translate3d(${10 * (1 - lift)}px, ${13 * (1 - lift)}px, 0) scale(${0.965 + 0.035 * lift})`;
      child.style.opacity = String(0.96 + 0.04 * lift);
      continue;
    }

    if (child.classList.contains("prev")) {
      const lift = towardPrev ? progress : 0;
      child.style.transform = `translate3d(${-10 * (1 - lift)}px, ${15 * (1 - lift)}px, 0) scale(${0.955 + 0.045 * lift})`;
      child.style.opacity = String(0.93 + 0.07 * lift);
      continue;
    }

    if (child.classList.contains("neighbor")) {
      child.style.transform = `translate3d(0, ${14 * (1 - progress)}px, 0) scale(${0.96 + 0.04 * progress})`;
      child.style.opacity = String(0.95 + 0.05 * progress);
    }
  }
}

function resetWalletFrame(stage: HTMLDivElement) {
  for (const child of Array.from(stage.children)) {
    if (!(child instanceof HTMLElement)) continue;
    child.style.removeProperty("transform");
    child.style.removeProperty("opacity");
  }
}

export function WalletDeck({ wallets, typeLabels, onEdit, onToggleArchive }: WalletDeckProps) {
  const [activeId, setActiveId] = useState(() => wallets[0]?.id ?? "");
  const count = wallets.length;
  const foundIndex = wallets.findIndex((wallet) => wallet.id === activeId);
  const activeIndex = foundIndex >= 0 ? foundIndex : 0;
  const activeWallet = wallets[activeIndex];

  const {
    stageRef,
    move,
    startGesture,
    moveGesture,
    endGesture,
  } = useSwipeDeck({
    count,
    activeIndex,
    onCommit: (nextIndex) => setActiveId(wallets[nextIndex].id),
    renderFrame: renderWalletFrame,
    resetFrame: resetWalletFrame,
  });

  function roleFor(index: number): CardRole | null {
    if (index === activeIndex) return "current";
    if (count === 2) return "neighbor";
    const forward = (index - activeIndex + count) % count;
    if (forward === 1) return "next";
    if (forward === count - 1) return "prev";
    if (count > 3 && forward === 2) return "next2";
    return null;
  }

  if (!activeWallet) return null;

  return (
    <div className="wallet-deck">
      <div
        ref={stageRef}
        className="wallet-deck-stage"
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
              style={{ "--wallet-accent": wallet.accent } as CSSProperties}
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
