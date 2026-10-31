import type { ComponentType } from "react";
import type { Permission } from "@/lib/rbac";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { Users } from "@/components/animate-ui/icons/users";
import { CalendarCheck } from "@/components/animate-ui/icons/calendar-check";
import { Umbrella } from "@/components/animate-ui/icons/umbrella";
import { Wallet } from "@/components/animate-ui/icons/wallet";
import { Rocket } from "@/components/animate-ui/icons/rocket";
import { TrendingUp } from "@/components/animate-ui/icons/trending-up";
import { Layers } from "@/components/animate-ui/icons/layers";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Kanban } from "@/components/animate-ui/icons/kanban";
import { NotebookPen } from "@/components/animate-ui/icons/notebook-pen";
import { CalendarDays } from "@/components/animate-ui/icons/calendar-days";
import { GraduationCap } from "@/components/animate-ui/icons/graduation-cap";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { ShieldCheck } from "@/components/animate-ui/icons/shield-check";
import { ChartColumn } from "@/components/animate-ui/icons/chart-column";

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
  /** Required permission; undefined means always visible. */
  perm?: Permission;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", to: "/", icon: LayoutDashboard, perm: "dashboard:view" }],
  },
  {
    label: "People",
    items: [
      { title: "Employees", to: "/employees", icon: Users, badge: "248", perm: "employees:view" },
      { title: "Attendance", to: "/attendance", icon: CalendarCheck, perm: "attendance:view" },
      { title: "Leave", to: "/leave", icon: Umbrella, badge: "4", perm: "leave:view" },
      { title: "Payroll", to: "/payroll", icon: Wallet, perm: "payroll:view" },
      { title: "Performance", to: "/performance", icon: TrendingUp, perm: "performance:view" },
      { title: "Recruitment", to: "/recruitment", icon: Rocket, perm: "recruitment:view" },
      { title: "Org Chart", to: "/org-chart", icon: Users, perm: "employees:view" },
    ],
  },
  {
    label: "Work",
    items: [
      { title: "Projects", to: "/projects", icon: Kanban, perm: "projects:view" },
      { title: "Workload", to: "/workload", icon: ChartColumn, perm: "projects:view" },
      { title: "Daily Updates", to: "/daily-updates", icon: NotebookPen, perm: "updates:view" },
      { title: "Meetings", to: "/meetings", icon: CalendarDays, perm: "meetings:view" },
    ],
  },
  {
    label: "Talent & docs",
    items: [
      { title: "Interns", to: "/interns", icon: GraduationCap, perm: "interns:view" },
      { title: "Documents", to: "/documents", icon: FileText, perm: "documents:view" },
    ],
  },
  {
    label: "Admin",
    items: [
      { title: "Access Control", to: "/access-control", icon: ShieldCheck, perm: "rbac:view" },
      { title: "Components", to: "/components", icon: Layers },
      { title: "Settings", to: "/settings", icon: Settings, perm: "settings:view" },
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
