/**
 * Mock HRMS domain data for PeopleHub.
 * Deterministic and self-contained — no network, so the demo is stable.
 */

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Intern";
export type EmployeeStatus = "Active" | "On leave" | "Probation" | "Offboarding";
export type Department =
  | "Engineering"
  | "Product"
  | "Design"
  | "Marketing"
  | "Sales"
  | "People Ops"
  | "Finance"
  | "Customer Success";

export type Employee = {
  id: string;
  name: string;
  email: string;
  title: string;
  department: Department;
  type: EmploymentType;
  status: EmployeeStatus;
  location: string;
  startDate: string;
  salary: number;
  performance: number; // 0..100
  avatarHue: number;
};

export type LeaveType = "Vacation" | "Sick" | "Personal" | "Parental" | "Unpaid";
export type RequestStatus = "Pending" | "Approved" | "Rejected";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: RequestStatus;
  submitted: string;
};

export type AttendanceStatus = "Present" | "Remote" | "Late" | "Absent" | "Leave";

export type AttendanceRow = {
  employeeId: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  hours: number;
};

export type PayrollRow = {
  employeeId: string;
  base: number;
  bonus: number;
  deductions: number;
  net: number;
  status: "Processed" | "Pending" | "Hold";
};

export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired";

export type Candidate = {
  id: string;
  name: string;
  role: string;
  department: Department;
  stage: CandidateStage;
  rating: number; // 0..5
  appliedOn: string;
  avatarHue: number;
};

export type JobOpening = {
  id: string;
  title: string;
  department: Department;
  location: string;
  type: EmploymentType;
  applicants: number;
  openSince: string;
};

export type ActivityItem = {
  id: string;
  kind: "join" | "leave" | "review" | "payroll" | "doc" | "birthday";
  actor: string;
  message: string;
  time: string;
};

export const departments: { name: Department; headcount: number; hue: number }[] = [
  { name: "Engineering", headcount: 86, hue: 255 },
  { name: "Product", headcount: 24, hue: 200 },
  { name: "Design", headcount: 18, hue: 320 },
  { name: "Marketing", headcount: 22, hue: 30 },
  { name: "Sales", headcount: 41, hue: 150 },
  { name: "People Ops", headcount: 14, hue: 280 },
  { name: "Finance", headcount: 12, hue: 90 },
  { name: "Customer Success", headcount: 31, hue: 240 },
];

export const employees: Employee[] = [
  { id: "EMP-1024", name: "Aarav Sharma", email: "aarav.sharma@peoplehub.io", title: "Staff Engineer", department: "Engineering", type: "Full-time", status: "Active", location: "Bengaluru, IN", startDate: "2019-04-15", salary: 182000, performance: 92, avatarHue: 255 },
  { id: "EMP-1042", name: "Mia Chen", email: "mia.chen@peoplehub.io", title: "Product Manager", department: "Product", type: "Full-time", status: "Active", location: "San Francisco, US", startDate: "2020-09-01", salary: 164000, performance: 88, avatarHue: 200 },
  { id: "EMP-1067", name: "Liam O'Connor", email: "liam.oconnor@peoplehub.io", title: "Design Lead", department: "Design", type: "Full-time", status: "On leave", location: "Dublin, IE", startDate: "2018-02-20", salary: 151000, performance: 90, avatarHue: 320 },
  { id: "EMP-1090", name: "Sofia Rossi", email: "sofia.rossi@peoplehub.io", title: "Growth Marketer", department: "Marketing", type: "Full-time", status: "Active", location: "Milan, IT", startDate: "2021-06-14", salary: 98000, performance: 81, avatarHue: 30 },
  { id: "EMP-1103", name: "Noah Williams", email: "noah.williams@peoplehub.io", title: "Account Executive", department: "Sales", type: "Full-time", status: "Active", location: "Austin, US", startDate: "2022-01-10", salary: 112000, performance: 76, avatarHue: 150 },
  { id: "EMP-1128", name: "Priya Nair", email: "priya.nair@peoplehub.io", title: "People Partner", department: "People Ops", type: "Full-time", status: "Active", location: "Bengaluru, IN", startDate: "2020-11-03", salary: 104000, performance: 85, avatarHue: 280 },
  { id: "EMP-1150", name: "Ethan Brown", email: "ethan.brown@peoplehub.io", title: "Senior Accountant", department: "Finance", type: "Full-time", status: "Probation", location: "London, UK", startDate: "2024-07-22", salary: 96000, performance: 70, avatarHue: 90 },
  { id: "EMP-1176", name: "Hana Kim", email: "hana.kim@peoplehub.io", title: "CS Manager", department: "Customer Success", type: "Full-time", status: "Active", location: "Seoul, KR", startDate: "2019-10-07", salary: 118000, performance: 87, avatarHue: 240 },
  { id: "EMP-1198", name: "Lucas Müller", email: "lucas.muller@peoplehub.io", title: "Frontend Engineer", department: "Engineering", type: "Full-time", status: "Active", location: "Berlin, DE", startDate: "2021-03-29", salary: 128000, performance: 83, avatarHue: 262 },
  { id: "EMP-1210", name: "Amara Okafor", email: "amara.okafor@peoplehub.io", title: "UX Researcher", department: "Design", type: "Contract", status: "Active", location: "Lagos, NG", startDate: "2023-05-18", salary: 86000, performance: 79, avatarHue: 330 },
  { id: "EMP-1234", name: "Olivia Martin", email: "olivia.martin@peoplehub.io", title: "Backend Engineer", department: "Engineering", type: "Full-time", status: "Active", location: "Toronto, CA", startDate: "2022-08-08", salary: 134000, performance: 84, avatarHue: 250 },
  { id: "EMP-1256", name: "Yuki Tanaka", email: "yuki.tanaka@peoplehub.io", title: "Data Scientist", department: "Product", type: "Full-time", status: "Active", location: "Tokyo, JP", startDate: "2021-12-01", salary: 142000, performance: 89, avatarHue: 195 },
  { id: "EMP-1270", name: "Carlos Díaz", email: "carlos.diaz@peoplehub.io", title: "SDR", department: "Sales", type: "Full-time", status: "Probation", location: "Madrid, ES", startDate: "2024-09-16", salary: 68000, performance: 66, avatarHue: 145 },
  { id: "EMP-1288", name: "Zara Ahmed", email: "zara.ahmed@peoplehub.io", title: "Brand Designer", department: "Design", type: "Part-time", status: "Active", location: "Dubai, AE", startDate: "2023-02-27", salary: 72000, performance: 82, avatarHue: 310 },
  { id: "EMP-1301", name: "Daniel Novak", email: "daniel.novak@peoplehub.io", title: "DevOps Engineer", department: "Engineering", type: "Full-time", status: "Active", location: "Prague, CZ", startDate: "2020-05-11", salary: 139000, performance: 86, avatarHue: 268 },
  { id: "EMP-1322", name: "Grace Lee", email: "grace.lee@peoplehub.io", title: "Content Strategist", department: "Marketing", type: "Full-time", status: "Active", location: "Singapore, SG", startDate: "2022-04-04", salary: 94000, performance: 80, avatarHue: 25 },
  { id: "EMP-1340", name: "Tomás Silva", email: "tomas.silva@peoplehub.io", title: "Solutions Engineer", department: "Customer Success", type: "Full-time", status: "Active", location: "Lisbon, PT", startDate: "2021-07-19", salary: 109000, performance: 78, avatarHue: 235 },
  { id: "EMP-1365", name: "Isabella Costa", email: "isabella.costa@peoplehub.io", title: "Recruiter", department: "People Ops", type: "Full-time", status: "Active", location: "São Paulo, BR", startDate: "2023-01-30", salary: 82000, performance: 77, avatarHue: 285 },
  { id: "EMP-1388", name: "Felix Wagner", email: "felix.wagner@peoplehub.io", title: "QA Engineer", department: "Engineering", type: "Intern", status: "Active", location: "Vienna, AT", startDate: "2025-06-02", salary: 48000, performance: 74, avatarHue: 258 },
  { id: "EMP-1402", name: "Nadia Haddad", email: "nadia.haddad@peoplehub.io", title: "FP&A Analyst", department: "Finance", type: "Full-time", status: "Offboarding", location: "Paris, FR", startDate: "2019-09-23", salary: 101000, performance: 72, avatarHue: 95 },
];

export function employeeById(id: string): Employee | undefined {
  return employees.find((e) => e.id === id);
}

export const leaveRequests: LeaveRequest[] = [
  { id: "LV-5001", employeeId: "EMP-1042", type: "Vacation", from: "2026-11-09", to: "2026-11-13", days: 5, reason: "Family trip to Kyoto", status: "Pending", submitted: "2026-10-26" },
  { id: "LV-5002", employeeId: "EMP-1103", type: "Sick", from: "2026-10-28", to: "2026-10-29", days: 2, reason: "Flu recovery", status: "Approved", submitted: "2026-10-27" },
  { id: "LV-5003", employeeId: "EMP-1067", type: "Parental", from: "2026-10-15", to: "2026-12-15", days: 44, reason: "Paternity leave", status: "Approved", submitted: "2026-09-30" },
  { id: "LV-5004", employeeId: "EMP-1234", type: "Personal", from: "2026-11-03", to: "2026-11-03", days: 1, reason: "Apartment move", status: "Pending", submitted: "2026-10-28" },
  { id: "LV-5005", employeeId: "EMP-1256", type: "Vacation", from: "2026-12-22", to: "2026-12-31", days: 8, reason: "Year-end break", status: "Pending", submitted: "2026-10-20" },
  { id: "LV-5006", employeeId: "EMP-1150", type: "Sick", from: "2026-10-24", to: "2026-10-24", days: 1, reason: "Migraine", status: "Rejected", submitted: "2026-10-24" },
  { id: "LV-5007", employeeId: "EMP-1322", type: "Vacation", from: "2026-11-18", to: "2026-11-22", days: 5, reason: "Wedding", status: "Approved", submitted: "2026-10-12" },
  { id: "LV-5008", employeeId: "EMP-1198", type: "Unpaid", from: "2026-11-25", to: "2026-11-27", days: 3, reason: "Personal matters", status: "Pending", submitted: "2026-10-29" },
];

export const attendanceToday: AttendanceRow[] = employees.map((e, i) => {
  const roll = (i * 7) % 10;
  let status: AttendanceStatus = "Present";
  if (e.status === "On leave" || e.status === "Offboarding") status = "Leave";
  else if (roll === 0) status = "Absent";
  else if (roll <= 2) status = "Late";
  else if (roll <= 5) status = "Remote";
  const clockIn =
    status === "Absent" || status === "Leave"
      ? null
      : status === "Late"
        ? "09:4" + ((i % 5) + 1)
        : "08:" + (30 + (i % 25)).toString().padStart(2, "0");
  const clockOut =
    status === "Absent" || status === "Leave" ? null : "17:" + (30 + (i % 25)).toString().padStart(2, "0");
  const hours = status === "Absent" || status === "Leave" ? 0 : 7.5 + ((i % 6) - 3) * 0.3;
  return { employeeId: e.id, clockIn, clockOut, status, hours: Math.round(hours * 10) / 10 };
});

export const payroll: PayrollRow[] = employees.map((e, i) => {
  const base = Math.round(e.salary / 12);
  const bonus = i % 4 === 0 ? Math.round(base * 0.12) : i % 3 === 0 ? Math.round(base * 0.06) : 0;
  const deductions = Math.round(base * 0.22);
  const net = base + bonus - deductions;
  const status = e.status === "Offboarding" ? "Hold" : i % 9 === 0 ? "Pending" : "Processed";
  return { employeeId: e.id, base, bonus, deductions, net, status };
});

export const candidates: Candidate[] = [
  { id: "CND-3001", name: "Ava Thompson", role: "Senior Frontend Engineer", department: "Engineering", stage: "Interview", rating: 4.5, appliedOn: "2026-10-09", avatarHue: 255 },
  { id: "CND-3002", name: "Ravi Patel", role: "Product Designer", department: "Design", stage: "Screening", rating: 4, appliedOn: "2026-10-18", avatarHue: 320 },
  { id: "CND-3003", name: "Elena Petrova", role: "Account Executive", department: "Sales", stage: "Offer", rating: 4.8, appliedOn: "2026-09-28", avatarHue: 150 },
  { id: "CND-3004", name: "Marcus Johnson", role: "Data Scientist", department: "Product", stage: "Applied", rating: 3.5, appliedOn: "2026-10-25", avatarHue: 200 },
  { id: "CND-3005", name: "Chloe Dubois", role: "People Partner", department: "People Ops", stage: "Interview", rating: 4.2, appliedOn: "2026-10-14", avatarHue: 280 },
  { id: "CND-3006", name: "Kenji Sato", role: "Backend Engineer", department: "Engineering", stage: "Hired", rating: 4.9, appliedOn: "2026-09-12", avatarHue: 262 },
  { id: "CND-3007", name: "Fatima Zahra", role: "Content Strategist", department: "Marketing", stage: "Screening", rating: 3.8, appliedOn: "2026-10-21", avatarHue: 30 },
  { id: "CND-3008", name: "Oscar Lindqvist", role: "DevOps Engineer", department: "Engineering", stage: "Applied", rating: 3.2, appliedOn: "2026-10-27", avatarHue: 268 },
];

export const jobOpenings: JobOpening[] = [
  { id: "JOB-7001", title: "Senior Frontend Engineer", department: "Engineering", location: "Remote · EU", type: "Full-time", applicants: 148, openSince: "2026-09-01" },
  { id: "JOB-7002", title: "Product Designer", department: "Design", location: "San Francisco, US", type: "Full-time", applicants: 92, openSince: "2026-09-18" },
  { id: "JOB-7003", title: "Account Executive", department: "Sales", location: "Austin, US", type: "Full-time", applicants: 64, openSince: "2026-10-02" },
  { id: "JOB-7004", title: "Data Scientist", department: "Product", location: "Remote · Global", type: "Full-time", applicants: 211, openSince: "2026-08-21" },
  { id: "JOB-7005", title: "People Partner", department: "People Ops", location: "Bengaluru, IN", type: "Full-time", applicants: 38, openSince: "2026-10-10" },
];

export const activity: ActivityItem[] = [
  { id: "ACT-1", kind: "join", actor: "Felix Wagner", message: "joined Engineering as QA Engineer (Intern)", time: "2h ago" },
  { id: "ACT-2", kind: "leave", actor: "Mia Chen", message: "requested 5 days of vacation", time: "4h ago" },
  { id: "ACT-3", kind: "review", actor: "Priya Nair", message: "completed Q3 review for Noah Williams", time: "Yesterday" },
  { id: "ACT-4", kind: "payroll", actor: "Finance", message: "ran October payroll for 20 employees", time: "Yesterday" },
  { id: "ACT-5", kind: "doc", actor: "Isabella Costa", message: "uploaded offer letter for Elena Petrova", time: "2 days ago" },
  { id: "ACT-6", kind: "birthday", actor: "Hana Kim", message: "has a birthday today 🎂", time: "Today" },
];

/** 12-month headcount & hiring series for the dashboard charts. */
export const headcountSeries = [
  { month: "Nov", headcount: 198, hires: 6, attrition: 3 },
  { month: "Dec", headcount: 201, hires: 5, attrition: 2 },
  { month: "Jan", headcount: 208, hires: 11, attrition: 4 },
  { month: "Feb", headcount: 214, hires: 9, attrition: 3 },
  { month: "Mar", headcount: 219, hires: 8, attrition: 3 },
  { month: "Apr", headcount: 223, hires: 7, attrition: 3 },
  { month: "May", headcount: 229, hires: 10, attrition: 4 },
  { month: "Jun", headcount: 234, hires: 9, attrition: 4 },
  { month: "Jul", headcount: 240, hires: 11, attrition: 5 },
  { month: "Aug", headcount: 244, hires: 8, attrition: 4 },
  { month: "Sep", headcount: 248, hires: 9, attrition: 5 },
  { month: "Oct", headcount: 248, hires: 6, attrition: 6 },
];

export const engagementSeries = [
  { week: "W1", engagement: 72, satisfaction: 68 },
  { week: "W2", engagement: 74, satisfaction: 70 },
  { week: "W3", engagement: 71, satisfaction: 69 },
  { week: "W4", engagement: 78, satisfaction: 74 },
  { week: "W5", engagement: 80, satisfaction: 77 },
  { week: "W6", engagement: 83, satisfaction: 79 },
];

export const upcoming = [
  { id: "EV-1", title: "All-hands meeting", when: "Today · 4:00 PM", tag: "Company" },
  { id: "EV-2", title: "Design system review", when: "Tomorrow · 11:00 AM", tag: "Design" },
  { id: "EV-3", title: "October payroll cut-off", when: "Oct 31 · 6:00 PM", tag: "Finance" },
  { id: "EV-4", title: "New hire orientation", when: "Nov 3 · 9:30 AM", tag: "People Ops" },
];
