"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { hapticTick } from "@/shared/utils/haptics";

type GestureAxis = "pending" | "horizontal" | "vertical";

type SwipeDeckOptions = {
  count: number;
  activeIndex: number;
  onCommit(nextIndex: number): void;
  renderFrame(stage: HTMLDivElement, offsetX: number, width: number): void;
  resetFrame(stage: HTMLDivElement): void;
};

const AXIS_LOCK_PX = 7;
const AXIS_DOMINANCE = 1.15;
const VELOCITY_PROJECTION_MS = 140;
const FALLBACK_WIDTH = 360;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useSwipeDeck({
  count,
  activeIndex,
  onCommit,
  renderFrame,
  resetFrame,
}: SwipeDeckOptions) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const settleCleanupRef = useRef<(() => void) | null>(null);
  const rebaseFrameRef = useRef<number | null>(null);
  const pendingFrameRef = useRef({ offsetX: 0, width: FALLBACK_WIDTH });
  const rebasingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    deltaX: 0,
    width: FALLBACK_WIDTH,
    pointerId: -1,
    axis: "pending" as GestureAxis,
  });

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    if (rebaseFrameRef.current !== null) window.cancelAnimationFrame(rebaseFrameRef.current);
    settleCleanupRef.current?.();
  }, []);

  useLayoutEffect(() => {
    if (!rebasingRef.current) return;
    rebasingRef.current = false;

    const stage = stageRef.current;
    if (!stage) return;

    settleCleanupRef.current?.();
    settleCleanupRef.current = null;
    stage.classList.add("is-rebasing");
    resetFrame(stage);
    stage.classList.remove("is-dragging", "is-settling");
    stage.style.removeProperty("--deck-settle-duration");

    if (rebaseFrameRef.current !== null) window.cancelAnimationFrame(rebaseFrameRef.current);
    rebaseFrameRef.current = window.requestAnimationFrame(() => {
      stage.classList.remove("is-rebasing");
      rebaseFrameRef.current = null;
    });
  }, [activeIndex, resetFrame]);

  function clearDragFrame() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  function clearSettleWait() {
    settleCleanupRef.current?.();
    settleCleanupRef.current = null;
  }

  function scheduleFrame(offsetX: number, width: number) {
    pendingFrameRef.current = { offsetX, width };
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const stage = stageRef.current;
      if (!stage) return;
      const frame = pendingFrameRef.current;
      renderFrame(stage, frame.offsetX, frame.width);
    });
  }

  function waitForTransform(stage: HTMLDivElement, duration: number, done: () => void) {
    clearSettleWait();

    if (duration === 0) {
      window.queueMicrotask(done);
      return;
    }

    const current = stage.querySelector<HTMLElement>(":scope > .current");
    if (!current) {
      window.queueMicrotask(done);
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      current.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
      settleCleanupRef.current = null;
      done();
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === current && event.propertyName === "transform") finish();
    };
    const fallback = window.setTimeout(finish, duration + 96);

    current.addEventListener("transitionend", onTransitionEnd);
    settleCleanupRef.current = () => {
      current.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }

  function settleDuration(velocity: number) {
    if (prefersReducedMotion()) return 0;
    const speed = Math.min(1.6, Math.abs(velocity));
    return Math.round(clamp(175, 255 - speed * 52, 255));
  }

  function settleTo(direction: 1 | -1, velocity = 0) {
    const stage = stageRef.current;
    if (!stage || count < 2 || stage.classList.contains("is-settling")) return;

    clearDragFrame();
    clearSettleWait();

    const width = gestureRef.current.width || stage.getBoundingClientRect().width || FALLBACK_WIDTH;
    const duration = settleDuration(velocity);
    const destination = direction === 1 ? -width * 1.08 : width * 1.08;

    stage.classList.remove("is-dragging");
    stage.classList.add("is-settling");
    stage.style.setProperty("--deck-settle-duration", `${duration}ms`);
    renderFrame(stage, destination, width);
    hapticTick();

    waitForTransform(stage, duration, () => {
      const nextIndex = (activeIndex + direction + count) % count;
      rebasingRef.current = true;
      onCommit(nextIndex);
    });
  }

  function snapBack(offsetX: number, width: number) {
    const stage = stageRef.current;
    if (!stage) return;

    clearDragFrame();
    clearSettleWait();

    const progress = Math.min(1, Math.abs(offsetX) / Math.max(width, 1));
    const duration = prefersReducedMotion() ? 0 : Math.round(135 + progress * 85);

    stage.classList.remove("is-dragging");
    stage.classList.add("is-settling");
    stage.style.setProperty("--deck-settle-duration", `${duration}ms`);
    renderFrame(stage, 0, width);

    waitForTransform(stage, duration, () => {
      resetFrame(stage);
      stage.classList.remove("is-settling");
      stage.style.removeProperty("--deck-settle-duration");
    });
  }

  function startGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage || count < 2 || stage.classList.contains("is-settling")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    suppressClickRef.current = false;
    clearDragFrame();
    clearSettleWait();

    const width = stage.getBoundingClientRect().width || FALLBACK_WIDTH;
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
      stage.classList.add("is-dragging");
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function moveGesture(event: ReactPointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (gesture.pointerId !== event.pointerId || gesture.axis === "vertical") return;

    let deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);

    if (gesture.axis === "pending") {
      if (Math.max(absoluteX, absoluteY) < AXIS_LOCK_PX) return;

      if (absoluteY > absoluteX * AXIS_DOMINANCE) {
        gesture.axis = "vertical";
        gesture.pointerId = -1;
        return;
      }

      if (absoluteX < absoluteY * AXIS_DOMINANCE) return;

      gesture.axis = "horizontal";
      gesture.startX = event.clientX;
      gesture.startY = event.clientY;
      gesture.lastX = event.clientX;
      gesture.lastTime = event.timeStamp;
      gesture.velocity = 0;
      gesture.deltaX = 0;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      stageRef.current?.classList.add("is-dragging");
      return;
    }

    event.preventDefault();
    deltaX = event.clientX - gesture.startX;
    if (Math.abs(deltaX) > AXIS_LOCK_PX) suppressClickRef.current = true;

    const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
    const instantVelocity = (event.clientX - gesture.lastX) / elapsed;
    gesture.velocity = gesture.velocity * 0.62 + instantVelocity * 0.38;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;

    const absoluteDrag = Math.abs(deltaX);
    const resistanceStart = gesture.width * 0.82;
    const resisted = absoluteDrag <= resistanceStart
      ? absoluteDrag
      : resistanceStart + (absoluteDrag - resistanceStart) * 0.2;
    const limited = Math.sign(deltaX) * Math.min(gesture.width * 0.96, resisted);

    gesture.deltaX = limited;
    scheduleFrame(limited, gesture.width);
  }

  function endGesture(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = gestureRef.current;
    if (gesture.pointerId !== event.pointerId) return;

    const wasHorizontal = gesture.axis === "horizontal";
    gesture.pointerId = -1;

    if (!wasHorizontal) return;

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already be released by the browser.
    }

    clearDragFrame();

    if (cancelled) {
      snapBack(gesture.deltaX, gesture.width);
      return;
    }

    const projectedX = gesture.deltaX + gesture.velocity * VELOCITY_PROJECTION_MS;
    const distanceThreshold = Math.min(86, gesture.width * 0.18);
    const projectedThreshold = Math.min(112, gesture.width * 0.22);
    const shouldCommit =
      Math.abs(gesture.deltaX) >= distanceThreshold ||
      Math.abs(projectedX) >= projectedThreshold;

    if (!shouldCommit) {
      snapBack(gesture.deltaX, gesture.width);
      return;
    }

    const direction = (projectedX || gesture.deltaX) < 0 ? 1 : -1;
    settleTo(direction, gesture.velocity);
  }

  function move(direction: 1 | -1) {
    const stage = stageRef.current;
    if (!stage || count < 2 || stage.classList.contains("is-settling")) return;
    gestureRef.current.width = stage.getBoundingClientRect().width || FALLBACK_WIDTH;
    gestureRef.current.deltaX = 0;
    gestureRef.current.velocity = 0;
    settleTo(direction);
  }

  return {
    stageRef,
    suppressClickRef,
    move,
    startGesture,
    moveGesture,
    endGesture,
  };
}
