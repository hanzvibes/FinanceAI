import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./native.css";
import { FinanceProvider } from "@/shared/providers/finance-provider";
import { PwaRegister } from "@/infrastructure/pwa/pwa-register";
import { env } from "@/config/env";

export const metadata: Metadata = {
  title: { default: env.appName, template: `%s · ${env.appName}` },
  description: "Personal finance and life dashboard",
  applicationName: env.appName,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "FinanceAI", statusBarStyle: "default" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1210" },
  ],
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("financeai-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = stored === "dark" || stored === "light" ? stored : preferred;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const themeColor = theme === "dark" ? "#0d1210" : "#ffffff";
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", themeColor));
  } catch (_) {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <FinanceProvider>
          <PwaRegister />
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}
