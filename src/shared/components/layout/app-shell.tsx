"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { navigation } from "@/config/navigation";
import { GlobalSearch } from "@/modules/search";
import { QuickAdd } from "@/modules/quick-add";
import { Icon } from "@/shared/components/ui/icon";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { useFinance } from "@/shared/providers/finance-provider";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() { return navigator.onLine; }
function getServerOnlineSnapshot() { return true; }

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, storageError } = useFinance();
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);

  useEffect(() => {
    if (online) return;
    const forceDocumentNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      window.location.assign(url.href);
    };
    document.addEventListener("click", forceDocumentNavigation, true);
    return () => document.removeEventListener("click", forceDocumentNavigation, true);
  }, [online]);

  return <div className="app-shell">
    <aside className="sidebar navigation-rail"><Link href="/" className="brand"><span className="brand-mark">F</span><span><strong>FinanceAI</strong><small>Personal command center</small></span></Link><nav className="side-nav" aria-label="Navigasi utama">{navigation.map((item) => { const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined} title={item.label}><Icon name={item.icon}/><span>{item.label}</span></Link>; })}</nav><div className="sidebar-footer"><span className={online ? "status-dot online" : "status-dot"}/><span>{online ? "Online · tersimpan lokal" : "Offline · tetap bisa dipakai"}</span></div></aside>

    <div className="main-column"><header className="topbar"><div className="mobile-brand"><span className="brand-mark small">F</span><strong>FinanceAI</strong></div><GlobalSearch/><div className="topbar-actions"><ThemeToggle/>{pathname !== "/" ? <QuickAdd compact/> : null}<div className="avatar" aria-label="Profil personal">FA</div></div></header>{(!online || storageError) && <div className={storageError ? "system-banner danger" : "system-banner"} role="status" aria-live="polite"><strong>{storageError ? "Penyimpanan lokal bermasalah" : "Mode offline aktif"}</strong><span>{storageError ?? "Data yang sudah tersimpan tetap tersedia. Perubahan baru akan tetap disimpan lokal di perangkat ini."}</span></div>}<main className="content" aria-busy={!ready}>{ready ? children : <div className="page-stack app-loading" aria-label="Memuat data FinanceAI"><div className="skeleton skeleton-title"/><div className="stats-grid"><div className="skeleton skeleton-stat"/><div className="skeleton skeleton-stat"/><div className="skeleton skeleton-stat"/><div className="skeleton skeleton-stat"/></div><div className="dashboard-grid"><div className="skeleton skeleton-card span-2"/><div className="skeleton skeleton-card"/><div className="skeleton skeleton-card"/></div></div>}</main></div>

    <nav className="bottom-nav" aria-label="Navigasi mobile">{navigation.map((item) => { const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={active ? "bottom-link active" : "bottom-link"} aria-current={active ? "page" : undefined}><Icon name={item.icon} size={19}/><span>{item.label}</span></Link>; })}</nav>{pathname !== "/" ? <QuickAdd floating/> : null}
  </div>;
}
