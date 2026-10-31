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
 * Dynamic Role-Based Access Control
 *
 * Permissions are "<resource>:<action>" strings grouped by module. Roles
 * hold a set of permission keys (the wildcard "*" grants everything).
 * Users are assigned a role. The signed-in user can be switched
 * (impersonation) to demonstrate how the whole UI adapts. Roles,
 * assignments and the active user persist to localStorage.
 * ------------------------------------------------------------------ */

export type Permission = string;

export type PermissionGroup = {
  module: string;
  description: string;
  permissions: { key: Permission; label: string }[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: "Dashboard",
    description: "Organization overview",
    permissions: [{ key: "dashboard:view", label: "View dashboard" }],
  },
  {
    module: "Employees",
    description: "People directory & records",
    permissions: [
      { key: "employees:view", label: "View employees" },
      { key: "employees:create", label: "Add employees" },
      { key: "employees:edit", label: "Edit employees" },
      { key: "employees:delete", label: "Offboard employees" },
      { key: "employees:export", label: "Export data" },
    ],
  },
  {
    module: "Attendance",
    description: "Time & attendance",
    permissions: [
      { key: "attendance:view", label: "View attendance" },
      { key: "attendance:manage", label: "Edit attendance" },
    ],
  },
  {
    module: "Leave",
    description: "Leave & time off",
    permissions: [
      { key: "leave:view", label: "View leave" },
      { key: "leave:request", label: "Request leave" },
      { key: "leave:approve", label: "Approve / reject leave" },
    ],
  },
  {
    module: "Payroll",
    description: "Compensation & payroll",
    permissions: [
      { key: "payroll:view", label: "View payroll" },
      { key: "payroll:run", label: "Run payroll" },
    ],
  },
  {
    module: "Recruitment",
    description: "Hiring pipeline",
    permissions: [
      { key: "recruitment:view", label: "View recruitment" },
      { key: "recruitment:manage", label: "Manage candidates & roles" },
    ],
  },
  {
    module: "Performance",
    description: "Reviews & goals",
    permissions: [
      { key: "performance:view", label: "View performance" },
      { key: "performance:review", label: "Submit reviews" },
    ],
  },
  {
    module: "Projects",
    description: "Project & task tracker",
    permissions: [
      { key: "projects:view", label: "View projects" },
      { key: "projects:create", label: "Create projects" },
      { key: "projects:manage", label: "Manage projects" },
      { key: "tasks:assign", label: "Assign tasks" },
      { key: "tasks:update", label: "Update task status" },
    ],
  },
  {
    module: "Daily Updates",
    description: "Standups & daily logs",
    permissions: [
      { key: "updates:view", label: "View own updates" },
      { key: "updates:create", label: "Post daily updates" },
      { key: "updates:viewAll", label: "View everyone’s updates" },
    ],
  },
  {
    module: "Meetings",
    description: "Meetings & minutes",
    permissions: [
      { key: "meetings:view", label: "View meetings" },
      { key: "meetings:create", label: "Schedule meetings" },
      { key: "meetings:editMinutes", label: "Edit minutes & actions" },
    ],
  },
  {
    module: "Interns",
    description: "Interns & scoring",
    permissions: [
      { key: "interns:view", label: "View interns" },
      { key: "interns:score", label: "Score interns" },
      { key: "interns:manageRubric", label: "Define scoring rubric" },
      { key: "interns:docs", label: "Manage intern documents" },
    ],
  },
  {
    module: "Documents",
    description: "Document management",
    permissions: [
      { key: "documents:view", label: "View documents" },
      { key: "documents:upload", label: "Upload documents" },
      { key: "documents:manage", label: "Manage & approve documents" },
    ],
  },
  {
    module: "Access Control",
    description: "Roles & permissions",
    permissions: [
      { key: "rbac:view", label: "View roles" },
      { key: "rbac:manage", label: "Manage roles & assignments" },
    ],
  },
  {
    module: "Settings",
    description: "Workspace settings",
    permissions: [{ key: "settings:view", label: "View settings" }],
  },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);

export function permissionLabel(key: Permission): string {
  for (const g of PERMISSION_GROUPS) {
    const p = g.permissions.find((x) => x.key === key);
    if (p) return p.label;
  }
  return key;
}

export type Role = {
  id: string;
  name: string;
  description: string;
  /** "*" grants every permission. */
  permissions: Permission[];
  /** Built-in roles cannot be deleted. */
  system?: boolean;
  hue: number;
};

export type AppUser = {
  id: string;
  name: string;
  title: string;
  roleId: string;
  hue: number;
};

const DEFAULT_ROLES: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to every module and setting.",
    permissions: ["*"],
    system: true,
    hue: 262,
  },
  {
    id: "hr",
    name: "HR Manager",
    description: "People operations, payroll, interns and documents.",
    system: true,
    hue: 280,
    permissions: [
      "dashboard:view",
      "employees:view", "employees:create", "employees:edit", "employees:delete", "employees:export",
      "attendance:view", "attendance:manage",
      "leave:view", "leave:approve", "leave:request",
      "payroll:view", "payroll:run",
      "recruitment:view", "recruitment:manage",
      "performance:view", "performance:review",
      "meetings:view", "meetings:create", "meetings:editMinutes",
      "updates:view", "updates:viewAll",
      "interns:view", "interns:score", "interns:manageRubric", "interns:docs",
      "documents:view", "documents:upload", "documents:manage",
      "rbac:view", "rbac:manage",
      "settings:view",
    ],
  },
  {
    id: "pm",
    name: "Project Manager",
    description: "Owns projects, tasks, meetings and intern mentoring.",
    system: true,
    hue: 200,
    permissions: [
      "dashboard:view",
      "employees:view",
      "projects:view", "projects:create", "projects:manage", "tasks:assign", "tasks:update",
      "updates:view", "updates:create", "updates:viewAll",
      "meetings:view", "meetings:create", "meetings:editMinutes",
      "performance:view", "performance:review",
      "interns:view", "interns:score",
      "documents:view", "documents:upload",
      "attendance:view", "leave:view", "leave:approve",
      "settings:view",
    ],
  },
  {
    id: "lead",
    name: "Team Lead",
    description: "Runs a squad: assigns tasks and scores interns.",
    system: true,
    hue: 150,
    permissions: [
      "dashboard:view",
      "employees:view",
      "projects:view", "tasks:assign", "tasks:update",
      "updates:view", "updates:create", "updates:viewAll",
      "meetings:view", "meetings:create",
      "interns:view", "interns:score",
      "documents:view",
      "attendance:view", "leave:view",
      "settings:view",
    ],
  },
  {
    id: "employee",
    name: "Employee",
    description: "Standard access to own work and requests.",
    system: true,
    hue: 240,
    permissions: [
      "dashboard:view",
      "projects:view", "tasks:update",
      "updates:view", "updates:create",
      "meetings:view",
      "performance:view",
      "leave:view", "leave:request",
      "attendance:view",
      "documents:view",
      "settings:view",
    ],
  },
  {
    id: "intern",
    name: "Intern",
    description: "Limited access: tasks, updates and own documents.",
    system: true,
    hue: 30,
    permissions: [
      "dashboard:view",
      "projects:view", "tasks:update",
      "updates:view", "updates:create",
      "meetings:view",
      "leave:view", "leave:request",
      "documents:view",
      "settings:view",
    ],
  },
];

export const USERS: AppUser[] = [
  { id: "u-admin", name: "Ananya Rao", title: "Administrator", roleId: "admin", hue: 262 },
  { id: "u-hr", name: "Priya Nair", title: "HR Manager", roleId: "hr", hue: 280 },
  { id: "u-pm", name: "Rahul Mehta", title: "Project Manager", roleId: "pm", hue: 200 },
  { id: "u-lead", name: "Sneha Iyer", title: "Team Lead", roleId: "lead", hue: 150 },
  { id: "u-emp", name: "Vikram Singh", title: "Software Engineer", roleId: "employee", hue: 240 },
  { id: "u-intern", name: "Ishaan Gupta", title: "Engineering Intern", roleId: "intern", hue: 30 },
];

type RbacState = {
  roles: Role[];
  users: AppUser[];
  currentUser: AppUser;
  currentRole: Role;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  setCurrentUser: (userId: string) => void;
  assignUserRole: (userId: string, roleId: string) => void;
  toggleRolePermission: (roleId: string, permission: Permission) => void;
  setRolePermissions: (roleId: string, permissions: Permission[]) => void;
  createRole: (name: string, description: string) => string;
  deleteRole: (roleId: string) => void;
};

const RbacContext = createContext<RbacState | null>(null);

const ROLES_KEY = "peoplehub-roles";
const ASSIGN_KEY = "peoplehub-assignments";
const USER_KEY = "peoplehub-current-user";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

let roleCounter = 0;

export function RbacProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>(() => load(ROLES_KEY, DEFAULT_ROLES));
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    load(ASSIGN_KEY, {}),
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    load(USER_KEY, "u-admin"),
  );

  useEffect(() => save(ROLES_KEY, roles), [roles]);
  useEffect(() => save(ASSIGN_KEY, assignments), [assignments]);
  useEffect(() => save(USER_KEY, currentUserId), [currentUserId]);

  const users = useMemo<AppUser[]>(
    () => USERS.map((u) => ({ ...u, roleId: assignments[u.id] ?? u.roleId })),
    [assignments],
  );

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? users[0],
    [users, currentUserId],
  );

  const currentRole = useMemo(
    () => roles.find((r) => r.id === currentUser.roleId) ?? roles[roles.length - 1],
    [roles, currentUser],
  );

  const can = useCallback(
    (permission: Permission) =>
      currentRole.permissions.includes("*") ||
      currentRole.permissions.includes(permission),
    [currentRole],
  );

  const canAny = useCallback(
    (permissions: Permission[]) => permissions.some((p) => can(p)),
    [can],
  );

  const setCurrentUser = useCallback((userId: string) => setCurrentUserId(userId), []);

  const assignUserRole = useCallback((userId: string, roleId: string) => {
    setAssignments((prev) => ({ ...prev, [userId]: roleId }));
  }, []);

  const toggleRolePermission = useCallback((roleId: string, permission: Permission) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId || r.permissions.includes("*")) return r;
        const has = r.permissions.includes(permission);
        return {
          ...r,
          permissions: has
            ? r.permissions.filter((p) => p !== permission)
            : [...r.permissions, permission],
        };
      }),
    );
  }, []);

  const setRolePermissions = useCallback((roleId: string, permissions: Permission[]) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId && !r.permissions.includes("*") ? { ...r, permissions } : r)),
    );
  }, []);

  const createRole = useCallback((name: string, description: string) => {
    const id = `role-${Date.now()}-${roleCounter++}`;
    setRoles((prev) => [
      ...prev,
      {
        id,
        name,
        description,
        permissions: ["dashboard:view"],
        hue: 200 + ((roleCounter * 37) % 140),
      },
    ]);
    return id;
  }, []);

  const deleteRole = useCallback((roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId || r.system));
    setAssignments((prev) => {
      const next = { ...prev };
      for (const [uid, rid] of Object.entries(next)) {
        if (rid === roleId) delete next[uid];
      }
      return next;
    });
  }, []);

  const value = useMemo<RbacState>(
    () => ({
      roles,
      users,
      currentUser,
      currentRole,
      can,
      canAny,
      setCurrentUser,
      assignUserRole,
      toggleRolePermission,
      setRolePermissions,
      createRole,
      deleteRole,
    }),
    [roles, users, currentUser, currentRole, can, canAny, setCurrentUser, assignUserRole, toggleRolePermission, setRolePermissions, createRole, deleteRole],
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbac(): RbacState {
  const ctx = useContext(RbacContext);
  if (!ctx) throw new Error("useRbac must be used within a RbacProvider");
  return ctx;
}
