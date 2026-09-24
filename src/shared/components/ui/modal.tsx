"use client";

import { useEffect, useId, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { hapticTick } from "@/shared/utils/haptics";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose(): void;
  description?: string;
};

export function Modal({ open, title, children, onClose, description }: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dragStartRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.style.removeProperty("--sheet-drag-y");
    panelRef.current?.classList.remove("is-dragging");

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>("[autofocus]") ?? panel?.querySelector<HTMLElement>(focusableSelector);
    window.requestAnimationFrame(() => firstFocusable?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      dragStartRef.current = null;
      dragOffsetRef.current = 0;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  function startDrag(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.button !== 0) return;
    dragStartRef.current = event.clientY;
    dragOffsetRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    panelRef.current?.classList.add("is-dragging");
  }

  function moveDrag(event: ReactPointerEvent<HTMLSpanElement>) {
    if (dragStartRef.current === null) return;
    const offset = Math.max(0, event.clientY - dragStartRef.current);
    dragOffsetRef.current = offset;
    panelRef.current?.style.setProperty("--sheet-drag-y", `${offset}px`);
  }

  function endDrag(event: ReactPointerEvent<HTMLSpanElement>) {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const shouldClose = dragOffsetRef.current >= 72;
    dragOffsetRef.current = 0;
    panelRef.current?.classList.remove("is-dragging");
    panelRef.current?.style.setProperty("--sheet-drag-y", "0px");
    if (shouldClose) {
      hapticTick();
      onCloseRef.current();
    }
  }

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={panelRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span
          className="sheet-handle"
          aria-hidden="true"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
        <div className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Tutup dialog">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>,
    document.body
  );
}
