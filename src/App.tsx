import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const EmployeesPage = lazy(() => import("@/pages/employees"));
const AttendancePage = lazy(() => import("@/pages/attendance"));
const LeavePage = lazy(() => import("@/pages/leave"));
const PayrollPage = lazy(() => import("@/pages/payroll"));
const RecruitmentPage = lazy(() => import("@/pages/recruitment"));
const PerformancePage = lazy(() => import("@/pages/performance"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const ComponentsPage = lazy(() => import("@/pages/components"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
