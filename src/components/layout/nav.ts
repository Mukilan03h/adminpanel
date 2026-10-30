import type { ComponentType } from "react";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { Users } from "@/components/animate-ui/icons/users";
import { CalendarCheck } from "@/components/animate-ui/icons/calendar-check";
import { Umbrella } from "@/components/animate-ui/icons/umbrella";
import { Wallet } from "@/components/animate-ui/icons/wallet";
import { Rocket } from "@/components/animate-ui/icons/rocket";
import { TrendingUp } from "@/components/animate-ui/icons/trending-up";
import { Layers } from "@/components/animate-ui/icons/layers";
import { Settings } from "@/components/animate-ui/icons/settings";

/** Animated icons each have a distinct props union, so store them loosely. */
export type IconComponent = ComponentType<{
  className?: string;
  size?: number;
  animateOnHover?: boolean;
}>;

export type NavItem = {
  title: string;
  to: string;
  icon: IconComponent;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", to: "/", icon: LayoutDashboard },
      { title: "Employees", to: "/employees", icon: Users, badge: "248" },
    ],
  },
  {
    label: "Time & money",
    items: [
      { title: "Attendance", to: "/attendance", icon: CalendarCheck },
      { title: "Leave", to: "/leave", icon: Umbrella, badge: "4" },
      { title: "Payroll", to: "/payroll", icon: Wallet },
    ],
  },
  {
    label: "Talent",
    items: [
      { title: "Recruitment", to: "/recruitment", icon: Rocket },
      { title: "Performance", to: "/performance", icon: TrendingUp },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Components", to: "/components", icon: Layers },
      { title: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

export function titleForPath(pathname: string): string {
  const match = allNavItems.find(
    (i) => i.to === pathname || (i.to !== "/" && pathname.startsWith(i.to)),
  );
  return match?.title ?? "Dashboard";
}
