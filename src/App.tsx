import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import DashboardPage from "@/pages/dashboard";
import EmployeesPage from "@/pages/employees";
import AttendancePage from "@/pages/attendance";
import LeavePage from "@/pages/leave";
import PayrollPage from "@/pages/payroll";
import RecruitmentPage from "@/pages/recruitment";
import PerformancePage from "@/pages/performance";
import SettingsPage from "@/pages/settings";
import ComponentsPage from "@/pages/components";
import NotFoundPage from "@/pages/not-found";

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
