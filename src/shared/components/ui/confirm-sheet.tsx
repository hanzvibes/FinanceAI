"use client";

import { Modal } from "@/shared/components/ui/modal";
import { hapticTick, hapticWarning } from "@/shared/utils/haptics";

type ConfirmSheetProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onClose(): void;
  onConfirm(): void;
};

export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  onClose,
  onConfirm,
}: ConfirmSheetProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="confirm-sheet">
        <div className={tone === "danger" ? "confirm-symbol danger" : "confirm-symbol"} aria-hidden="true">!</div>
        <p>{message}</p>
        <div className="modal-actions confirm-actions">
          <button type="button" className="button ghost" onClick={() => { hapticTick(); onClose(); }}>{cancelLabel}</button>
          <button
            type="button"
            className={tone === "danger" ? "button danger" : "button primary"}
            onClick={() => { hapticWarning(); onConfirm(); }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
