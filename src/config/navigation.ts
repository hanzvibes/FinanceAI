import type { IconName } from "@/shared/components/ui/icon";

export type NavigationItem = {
  label: string;
  href: string;
  icon: IconName;
};

export const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: "home" },
  { label: "Finance", href: "/finance", icon: "wallet" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Personal", href: "/personal", icon: "user" },
];
