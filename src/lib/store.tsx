import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ *
 * PeopleHub work store — projects, tasks, daily updates, meetings,
 * interns, the scoring rubric, intern scores and documents.
 * All collections persist to localStorage so edits stick across reloads.
 * ------------------------------------------------------------------ */

export type ProjectStatus = "On track" | "At risk" | "Delayed" | "Completed";
export type Project = {
  id: string;
  name: string;
  code: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  lead: string;
  due: string;
  hue: number;
  members: string[];
  budgetInr: number;
};

export type TaskStatus = "Backlog" | "To do" | "In progress" | "In review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";
export type Task = {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  due: string;
  tags: string[];
  points: number;
};

export type DailyUpdate = {
  id: string;
  author: string;
  role: string;
  date: string;
  project: string;
  done: string;
  blockers: string;
  hours: number;
  hue: number;
};

export type ActionItem = { id: string; text: string; owner: string; due: string; done: boolean };
export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "Standup" | "Review" | "Client" | "1:1" | "Planning";
  attendees: string[];
  agenda: string[];
  minutes: string;
  decisions: string[];
  actionItems: ActionItem[];
  hue: number;
  /** Video/join link, visible to and shareable with attendees including interns. */
  link?: string;
};

export type Intern = {
  id: string;
  name: string;
  college: string;
  department: string;
  mentor: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Extended";
  hue: number;
};

export type Criterion = {
  id: string;
  name: string;
  description: string;
  weight: number; // 0..100
  definedBy: string;
};

/** internId -> criterionId -> score (0..10) */
export type Scores = Record<string, Record<string, number>>;

export type DocStatus = "Approved" | "Pending" | "Expired" | "Draft";
export type DocSource = "file" | "link";
export type Document = {
  id: string;
  name: string;
  category: "Policy" | "Contract" | "Intern" | "Finance" | "Template" | "Report";
  owner: string;
  accessRoles: string[];
  status: DocStatus;
  version: string;
  updated: string;
  sizeKb: number;
  /** "file" (uploaded) or "link" (external URL). */
  source: DocSource;
  /** File type / extension, e.g. PDF, DOCX, Link. */
  fileType: string;
  /** External URL (for link docs) or a stand-in href for uploaded files. */
  url: string;
  /** People/teams this document is assigned to (set by Superadmin). */
  assignedTo: string[];
  /** Transient object URL for files uploaded this session (not persisted meaningfully). */
  __blobUrl?: string;
};

export const TASK_STATUSES: TaskStatus[] = ["Backlog", "To do", "In progress", "In review", "Done"];

/* ----------------------------- seed data ----------------------------- */

const seedProjects: Project[] = [
  { id: "PRJ-01", name: "Aadhaar KYC Revamp", code: "AKR", client: "FinServe India", status: "On track", progress: 68, lead: "Rahul Mehta", due: "2026-12-15", hue: 255, members: ["Vikram Singh", "Sneha Iyer", "Ishaan Gupta"], budgetInr: 4200000 },
  { id: "PRJ-02", name: "UPI Merchant Portal", code: "UMP", client: "PayBharat", status: "At risk", progress: 44, lead: "Sneha Iyer", due: "2026-11-28", hue: 150, members: ["Vikram Singh", "Aditi Rao"], budgetInr: 2800000 },
  { id: "PRJ-03", name: "HRMS Mobile App", code: "HMA", client: "Internal", status: "On track", progress: 81, lead: "Rahul Mehta", due: "2026-11-20", hue: 280, members: ["Sneha Iyer", "Ishaan Gupta", "Diya Sharma"], budgetInr: 1600000 },
  { id: "PRJ-04", name: "GST Filing Automation", code: "GFA", client: "TaxEasy", status: "Delayed", progress: 29, lead: "Vikram Singh", due: "2026-12-05", hue: 30, members: ["Aditi Rao", "Diya Sharma"], budgetInr: 3500000 },
  { id: "PRJ-05", name: "Analytics Dashboard", code: "ADX", client: "RetailNxt", status: "Completed", progress: 100, lead: "Sneha Iyer", due: "2026-10-10", hue: 200, members: ["Vikram Singh"], budgetInr: 1900000 },
];

const seedTasks: Task[] = [
  { id: "T-1001", projectId: "PRJ-01", title: "Design OTP verification flow", status: "In progress", priority: "High", assignee: "Sneha Iyer", due: "2026-11-05", tags: ["design", "auth"], points: 5 },
  { id: "T-1002", projectId: "PRJ-01", title: "Integrate Aadhaar sandbox API", status: "To do", priority: "Urgent", assignee: "Vikram Singh", due: "2026-11-08", tags: ["backend"], points: 8 },
  { id: "T-1003", projectId: "PRJ-01", title: "Write API tests for KYC", status: "Backlog", priority: "Medium", assignee: "Ishaan Gupta", due: "2026-11-12", tags: ["testing"], points: 3 },
  { id: "T-1004", projectId: "PRJ-02", title: "Merchant onboarding wizard", status: "In review", priority: "High", assignee: "Vikram Singh", due: "2026-11-02", tags: ["frontend"], points: 5 },
  { id: "T-1005", projectId: "PRJ-02", title: "Settlement reconciliation job", status: "In progress", priority: "Urgent", assignee: "Aditi Rao", due: "2026-11-06", tags: ["backend"], points: 8 },
  { id: "T-1006", projectId: "PRJ-03", title: "Push notifications (FCM)", status: "Done", priority: "Medium", assignee: "Diya Sharma", due: "2026-10-28", tags: ["mobile"], points: 3 },
  { id: "T-1007", projectId: "PRJ-03", title: "Leave approval screen", status: "In progress", priority: "High", assignee: "Sneha Iyer", due: "2026-11-04", tags: ["mobile", "ui"], points: 5 },
  { id: "T-1008", projectId: "PRJ-03", title: "Biometric login", status: "To do", priority: "Low", assignee: "Ishaan Gupta", due: "2026-11-15", tags: ["mobile"], points: 2 },
  { id: "T-1009", projectId: "PRJ-04", title: "GSTR-1 parser", status: "Backlog", priority: "High", assignee: "Aditi Rao", due: "2026-11-18", tags: ["backend"], points: 8 },
  { id: "T-1010", projectId: "PRJ-04", title: "Error reporting dashboard", status: "To do", priority: "Medium", assignee: "Diya Sharma", due: "2026-11-20", tags: ["frontend"], points: 5 },
  { id: "T-1011", projectId: "PRJ-01", title: "Security review with InfoSec", status: "To do", priority: "High", assignee: "Rahul Mehta", due: "2026-11-10", tags: ["security"], points: 3 },
  { id: "T-1012", projectId: "PRJ-02", title: "Load test 10k TPS", status: "Backlog", priority: "Medium", assignee: "Vikram Singh", due: "2026-11-22", tags: ["perf"], points: 5 },
];

const seedUpdates: DailyUpdate[] = [
  { id: "DU-1", author: "Vikram Singh", role: "Software Engineer", date: "2026-10-31", project: "Aadhaar KYC Revamp", done: "Wired the Aadhaar sandbox API and handled retry logic.", blockers: "Waiting on prod credentials from FinServe.", hours: 7.5, hue: 240 },
  { id: "DU-2", author: "Sneha Iyer", role: "Team Lead", date: "2026-10-31", project: "HRMS Mobile App", done: "Reviewed 3 PRs, finalized leave approval UX.", blockers: "None", hours: 8, hue: 150 },
  { id: "DU-3", author: "Ishaan Gupta", role: "Intern", date: "2026-10-31", project: "Aadhaar KYC Revamp", done: "Wrote unit tests for KYC validators, 82% coverage.", blockers: "Need guidance on mocking the Aadhaar client.", hours: 6, hue: 30 },
  { id: "DU-4", author: "Aditi Rao", role: "Software Engineer", date: "2026-10-30", project: "UPI Merchant Portal", done: "Built settlement reconciliation cron.", blockers: "Flaky staging DB.", hours: 7, hue: 320 },
  { id: "DU-5", author: "Diya Sharma", role: "Intern", date: "2026-10-30", project: "HRMS Mobile App", done: "Implemented FCM push notifications end-to-end.", blockers: "None", hours: 6.5, hue: 200 },
];

const seedMeetings: Meeting[] = [
  {
    id: "MTG-1", title: "Aadhaar KYC — Sprint 7 Review", date: "2026-10-30", time: "15:00", type: "Review",
    attendees: ["Rahul Mehta", "Sneha Iyer", "Vikram Singh", "Ishaan Gupta"],
    agenda: ["Demo OTP flow", "API integration status", "Risks & blockers"],
    minutes: "Team demoed the OTP verification flow. Aadhaar sandbox integration is 70% complete; production credentials pending from FinServe. Decided to parallelize test-writing with Ishaan.",
    decisions: ["Ship OTP flow to staging by Nov 5", "Escalate credential request to client"],
    actionItems: [
      { id: "AI-1", text: "Raise credential request with FinServe", owner: "Rahul Mehta", due: "2026-11-01", done: true },
      { id: "AI-2", text: "Complete KYC API tests", owner: "Ishaan Gupta", due: "2026-11-12", done: false },
    ],
    hue: 255,
  },
  {
    id: "MTG-2", title: "Weekly Engineering Standup", date: "2026-10-31", time: "10:00", type: "Standup",
    attendees: ["Rahul Mehta", "Sneha Iyer", "Vikram Singh", "Aditi Rao", "Diya Sharma", "Ishaan Gupta"],
    agenda: ["Yesterday / Today", "Blockers"],
    minutes: "All teams on track except GST Filing Automation, which is delayed due to parser complexity. Aditi to pair with Vikram.",
    decisions: ["Move 2 engineers to GFA for a week"],
    actionItems: [{ id: "AI-3", text: "Pair on GSTR-1 parser", owner: "Aditi Rao", due: "2026-11-04", done: false }],
    hue: 150,
    link: "https://meet.peoplehub.io/eng-standup",
  },
  {
    id: "MTG-3", title: "PayBharat — Client Sync", date: "2026-11-03", time: "16:30", type: "Client",
    attendees: ["Rahul Mehta", "Sneha Iyer"],
    agenda: ["Timeline update", "Scope change: refunds", "Go-live plan"],
    minutes: "",
    decisions: [],
    actionItems: [],
    hue: 200,
    link: "https://meet.peoplehub.io/paybharat-sync",
  },
];

const seedInterns: Intern[] = [
  { id: "INT-01", name: "Ishaan Gupta", college: "IIT Bombay", department: "Engineering", mentor: "Sneha Iyer", startDate: "2026-06-02", endDate: "2026-12-02", status: "Active", hue: 30 },
  { id: "INT-02", name: "Diya Sharma", college: "BITS Pilani", department: "Engineering", mentor: "Rahul Mehta", startDate: "2026-07-01", endDate: "2026-12-31", status: "Active", hue: 200 },
  { id: "INT-03", name: "Arjun Reddy", college: "NIT Trichy", department: "Product", mentor: "Rahul Mehta", startDate: "2026-08-15", endDate: "2027-02-15", status: "Active", hue: 280 },
  { id: "INT-04", name: "Meera Krishnan", college: "VIT Vellore", department: "Design", mentor: "Sneha Iyer", startDate: "2026-05-10", endDate: "2026-11-10", status: "Extended", hue: 320 },
  { id: "INT-05", name: "Kabir Shah", college: "IIIT Hyderabad", department: "Engineering", mentor: "Vikram Singh", startDate: "2026-06-20", endDate: "2026-12-20", status: "Active", hue: 150 },
];

const seedCriteria: Criterion[] = [
  { id: "C-1", name: "Technical skills", description: "Code quality, problem solving, tooling.", weight: 30, definedBy: "Manager" },
  { id: "C-2", name: "Ownership", description: "Follows through, proactive, reliable.", weight: 20, definedBy: "Manager" },
  { id: "C-3", name: "Communication", description: "Clear updates, asks good questions.", weight: 15, definedBy: "HR" },
  { id: "C-4", name: "Collaboration", description: "Works well with the team.", weight: 15, definedBy: "HR" },
  { id: "C-5", name: "Learning agility", description: "Picks up new concepts quickly.", weight: 20, definedBy: "Manager" },
];

const seedScores: Scores = {
  "INT-01": { "C-1": 9, "C-2": 8, "C-3": 7, "C-4": 8, "C-5": 9 },
  "INT-02": { "C-1": 8, "C-2": 9, "C-3": 8, "C-4": 9, "C-5": 8 },
  "INT-03": { "C-1": 6, "C-2": 7, "C-3": 8, "C-4": 7, "C-5": 7 },
  "INT-04": { "C-1": 7, "C-2": 8, "C-3": 9, "C-4": 9, "C-5": 8 },
  "INT-05": { "C-1": 8, "C-2": 7, "C-3": 6, "C-4": 7, "C-5": 8 },
};

const seedDocuments: Document[] = [
  { id: "DOC-1", name: "Employee Handbook 2026", category: "Policy", owner: "Priya Nair", accessRoles: ["admin", "hr", "pm", "lead", "employee", "intern"], status: "Approved", version: "v3.2", updated: "2026-09-01", sizeKb: 1840, source: "file", fileType: "PDF", url: "#/files/handbook-2026.pdf", assignedTo: ["Everyone"] },
  { id: "DOC-2", name: "Leave & Attendance Policy (India)", category: "Policy", owner: "Priya Nair", accessRoles: ["admin", "hr", "pm", "lead", "employee", "intern"], status: "Approved", version: "v2.0", updated: "2026-08-12", sizeKb: 640, source: "file", fileType: "PDF", url: "#/files/leave-policy.pdf", assignedTo: ["Everyone"] },
  { id: "DOC-3", name: "Master Services Agreement — FinServe", category: "Contract", owner: "Ananya Rao", accessRoles: ["admin", "hr", "pm"], status: "Approved", version: "v1.0", updated: "2026-07-20", sizeKb: 2210, source: "file", fileType: "PDF", url: "#/files/msa-finserve.pdf", assignedTo: ["Rahul Mehta"] },
  { id: "DOC-4", name: "Intern Offer — Ishaan Gupta", category: "Intern", owner: "Priya Nair", accessRoles: ["admin", "hr"], status: "Approved", version: "v1.0", updated: "2026-05-28", sizeKb: 320, source: "file", fileType: "DOCX", url: "#/files/offer-ishaan.docx", assignedTo: ["Ishaan Gupta"] },
  { id: "DOC-5", name: "Intern NDA — Diya Sharma", category: "Intern", owner: "Priya Nair", accessRoles: ["admin", "hr"], status: "Pending", version: "v1.0", updated: "2026-10-20", sizeKb: 290, source: "file", fileType: "PDF", url: "#/files/nda-diya.pdf", assignedTo: ["Diya Sharma"] },
  { id: "DOC-6", name: "Engineering Wiki", category: "Template", owner: "Rahul Mehta", accessRoles: ["admin", "hr", "pm", "lead", "employee", "intern"], status: "Approved", version: "—", updated: "2026-10-22", sizeKb: 0, source: "link", fileType: "Link", url: "https://wiki.peoplehub.io/engineering", assignedTo: ["Engineering"] },
  { id: "DOC-7", name: "Sprint Review Template", category: "Template", owner: "Rahul Mehta", accessRoles: ["admin", "hr", "pm", "lead"], status: "Draft", version: "v0.9", updated: "2026-10-18", sizeKb: 120, source: "file", fileType: "DOCX", url: "#/files/sprint-template.docx", assignedTo: ["Team Leads"] },
  { id: "DOC-8", name: "PF & Gratuity Guidelines", category: "Policy", owner: "Priya Nair", accessRoles: ["admin", "hr", "employee"], status: "Expired", version: "v1.4", updated: "2025-04-01", sizeKb: 410, source: "file", fileType: "PDF", url: "#/files/pf-gratuity.pdf", assignedTo: ["Everyone"] },
];

/* ----------------------------- store ----------------------------- */

type StoreState = {
  projects: Project[];
  tasks: Task[];
  updates: DailyUpdate[];
  meetings: Meeting[];
  interns: Intern[];
  criteria: Criterion[];
  scores: Scores;
  documents: Document[];

  addProject: (p: Omit<Project, "id">) => void;
  addTask: (t: Omit<Task, "id">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addUpdate: (u: Omit<DailyUpdate, "id">) => void;
  addMeeting: (m: Omit<Meeting, "id">) => void;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  toggleActionItem: (meetingId: string, itemId: string) => void;
  addActionItem: (meetingId: string, item: Omit<ActionItem, "id">) => void;
  addCriterion: (c: Omit<Criterion, "id">) => void;
  updateCriterion: (id: string, patch: Partial<Criterion>) => void;
  removeCriterion: (id: string) => void;
  setScore: (internId: string, criterionId: string, value: number) => void;
  addDocument: (d: Omit<Document, "id">) => void;
  updateDocument: (id: string, patch: Partial<Document>) => void;
};

const StoreContext = createContext<StoreState | null>(null);

function usePersisted<T>(key: string, seed: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return seed;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);
  return [state, setState];
}

let counter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${counter++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = usePersisted("ph-projects", seedProjects);
  const [tasks, setTasks] = usePersisted("ph-tasks", seedTasks);
  const [updates, setUpdates] = usePersisted("ph-updates", seedUpdates);
  const [meetings, setMeetings] = usePersisted("ph-meetings", seedMeetings);
  const [interns] = usePersisted("ph-interns", seedInterns);
  const [criteria, setCriteria] = usePersisted("ph-criteria", seedCriteria);
  const [scores, setScores] = usePersisted<Scores>("ph-scores", seedScores);
  const [documents, setDocuments] = usePersisted("ph-documents", seedDocuments);

  const value = useMemo<StoreState>(
    () => ({
      projects,
      tasks,
      updates,
      meetings,
      interns,
      criteria,
      scores,
      documents,
      addProject: (p) => setProjects((prev) => [{ ...p, id: uid("PRJ") }, ...prev]),
      addTask: (t) => setTasks((prev) => [{ ...t, id: uid("T") }, ...prev]),
      updateTask: (id, patch) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
      addUpdate: (u) => setUpdates((prev) => [{ ...u, id: uid("DU") }, ...prev]),
      addMeeting: (m) => setMeetings((prev) => [{ ...m, id: uid("MTG") }, ...prev]),
      updateMeeting: (id, patch) =>
        setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      toggleActionItem: (meetingId, itemId) =>
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meetingId
              ? {
                  ...m,
                  actionItems: m.actionItems.map((a) =>
                    a.id === itemId ? { ...a, done: !a.done } : a,
                  ),
                }
              : m,
          ),
        ),
      addActionItem: (meetingId, item) =>
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meetingId
              ? { ...m, actionItems: [...m.actionItems, { ...item, id: uid("AI") }] }
              : m,
          ),
        ),
      addCriterion: (c) => setCriteria((prev) => [...prev, { ...c, id: uid("C") }]),
      updateCriterion: (id, patch) =>
        setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      removeCriterion: (id) => setCriteria((prev) => prev.filter((c) => c.id !== id)),
      setScore: (internId, criterionId, v) =>
        setScores((prev) => ({
          ...prev,
          [internId]: { ...(prev[internId] ?? {}), [criterionId]: v },
        })),
      addDocument: (d) => setDocuments((prev) => [{ ...d, id: uid("DOC") }, ...prev]),
      updateDocument: (id, patch) =>
        setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    }),
    [projects, tasks, updates, meetings, interns, criteria, scores, documents, setProjects, setTasks, setUpdates, setMeetings, setCriteria, setScores, setDocuments],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}

/** Weighted intern score as a percentage (0..100). */
export function weightedScore(scores: Scores, criteria: Criterion[], internId: string): number {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0) || 1;
  const rec = scores[internId] ?? {};
  const earned = criteria.reduce((s, c) => s + ((rec[c.id] ?? 0) / 10) * c.weight, 0);
  return Math.round((earned / totalWeight) * 100);
}
