"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/components/ui/icon";
import { hapticSuccess, hapticTick } from "@/shared/utils/haptics";

type InstallPromptEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type StandaloneNavigator = Navigator & { standalone?: boolean };

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as StandaloneNavigator).standalone === true;
}

export function PwaRegister() {
  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const syncDisplayMode = () => {
      document.documentElement.dataset.displayMode = isStandaloneMode() ? "standalone" : "browser";
    };

    syncDisplayMode();
    media.addEventListener("change", syncDisplayMode);
    window.addEventListener("appinstalled", syncDisplayMode);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => registration.update()).catch(() => undefined);
    }

    return () => {
      media.removeEventListener("change", syncDisplayMode);
      window.removeEventListener("appinstalled", syncDisplayMode);
    };
  }, []);

  return null;
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandaloneMode);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      hapticSuccess();
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !installPrompt) return null;
  return <button type="button" className="button ghost install-app-button" onClick={async () => {
    hapticTick();
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }}><Icon name="download" size={17}/>Install FinanceAI</button>;
}
