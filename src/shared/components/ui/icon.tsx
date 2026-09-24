import type { SVGProps } from "react";

export type IconName = "home" | "wallet" | "calendar" | "user" | "search" | "plus" | "arrow-up" | "arrow-down" | "swap" | "target" | "note" | "menu" | "download" | "upload" | "check" | "chevron-right" | "sparkles" | "sun" | "moon";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M9.5 19.5v-6h5v6"/></>,
  wallet: <><path d="M4 7.5h14.5a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h12"/><path d="M16 13h4.5"/><circle cx="16" cy="13" r=".6" fill="currentColor" stroke="none"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  "arrow-up": <><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>,
  "arrow-down": <><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></>,
  swap: <><path d="M7 7h12l-3-3M17 17H5l3 3"/></>,
  target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m14 10 6-6"/></>,
  note: <><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  download: <><path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/></>,
  upload: <><path d="M12 16V5M7 10l5-5 5 5"/><path d="M5 20h14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  "chevron-right": <path d="m9 5 7 7-7 7"/>,
  sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z"/><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/></>,
  sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></>,
  moon: <path d="M20.2 15.4A8.2 8.2 0 0 1 8.6 3.8 8.4 8.4 0 1 0 20.2 15.4Z"/>,
};

export function Icon({ name, size = 20, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
