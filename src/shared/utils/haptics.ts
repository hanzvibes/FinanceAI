export function haptic(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}

export function hapticTick() { haptic(8); }
export function hapticSuccess() { haptic([10, 28, 14]); }
export function hapticWarning() { haptic([18, 24, 18]); }
