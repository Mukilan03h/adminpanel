import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { RequirePermission } from "@/components/layout/require-permission";
import type { Permission } from "@/lib/rbac";
import type { ReactNode } from "react";

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const EmployeesPage = lazy(() => import("@/pages/employees"));
const AttendancePage = lazy(() => import("@/pages/attendance"));
const LeavePage = lazy(() => import("@/pages/leave"));
const PayrollPage = lazy(() => import("@/pages/payroll"));
const RecruitmentPage = lazy(() => import("@/pages/recruitment"));
const PerformancePage = lazy(() => import("@/pages/performance"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const WorkloadPage = lazy(() => import("@/pages/workload"));
const OrgChartPage = lazy(() => import("@/pages/org-chart"));
const DailyUpdatesPage = lazy(() => import("@/pages/daily-updates"));
const MeetingsPage = lazy(() => import("@/pages/meetings"));
const InternsPage = lazy(() => import("@/pages/interns"));
const DocumentsPage = lazy(() => import("@/pages/documents"));
const AccessControlPage = lazy(() => import("@/pages/access-control"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const ComponentsPage = lazy(() => import("@/pages/components"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function Guard({ perm, children }: { perm: Permission; children: ReactNode }) {
  return <RequirePermission perm={perm}>{children}</RequirePermission>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Guard perm="dashboard:view"><DashboardPage /></Guard>} />
        <Route path="/employees" element={<Guard perm="employees:view"><EmployeesPage /></Guard>} />
        <Route path="/attendance" element={<Guard perm="attendance:view"><AttendancePage /></Guard>} />
        <Route path="/leave" element={<Guard perm="leave:view"><LeavePage /></Guard>} />
        <Route path="/payroll" element={<Guard perm="payroll:view"><PayrollPage /></Guard>} />
        <Route path="/recruitment" element={<Guard perm="recruitment:view"><RecruitmentPage /></Guard>} />
        <Route path="/performance" element={<Guard perm="performance:view"><PerformancePage /></Guard>} />
        <Route path="/projects" element={<Guard perm="projects:view"><ProjectsPage /></Guard>} />
        <Route path="/workload" element={<Guard perm="projects:view"><WorkloadPage /></Guard>} />
        <Route path="/org-chart" element={<Guard perm="employees:view"><OrgChartPage /></Guard>} />
        <Route path="/daily-updates" element={<Guard perm="updates:view"><DailyUpdatesPage /></Guard>} />
        <Route path="/meetings" element={<Guard perm="meetings:view"><MeetingsPage /></Guard>} />
        <Route path="/interns" element={<Guard perm="interns:view"><InternsPage /></Guard>} />
        <Route path="/documents" element={<Guard perm="documents:view"><DocumentsPage /></Guard>} />
        <Route path="/access-control" element={<Guard perm="rbac:view"><AccessControlPage /></Guard>} />
        <Route path="/settings" element={<Guard perm="settings:view"><SettingsPage /></Guard>} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
