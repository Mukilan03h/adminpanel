import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type ApiRole, type ApiUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { RbacContext, type AppUser, type RbacState, type Role } from "@/lib/rbac";

function toRole(r: ApiRole): Role {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    hue: r.hue,
    system: r.is_system,
    permissions: r.is_superuser ? ["*"] : r.permissions,
  };
}

function toUser(u: ApiUser): AppUser {
  return {
    id: String(u.id),
    name: u.full_name,
    title: u.title,
    roleId: u.roles[0] ?? "employee",
    hue: u.hue,
  };
}

function slug(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) ||
    `role-${Date.now()}`
  );
}

/**
 * RBAC backed by the FastAPI server. Reads the signed-in user's permissions
 * from the auth session and manages roles/users via the API. Exposes the same
 * context shape as the demo provider, so every page works unchanged.
 */
export function ConnectedRbacProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  const canViewRbac = auth.isSuperuser || auth.permissions.includes("rbac:view");

  const load = useCallback(async () => {
    if (!canViewRbac) return;
    try {
      const [r, u] = await Promise.all([api.roles(), api.users()]);
      setRoles(r.map(toRole));
      setUsers(u.map(toUser));
    } catch {
      /* ignore — likely insufficient permission */
    }
  }, [canViewRbac]);

  useEffect(() => {
    void load();
  }, [load]);

  const can = useCallback(
    (perm: string) => auth.isSuperuser || auth.permissions.includes(perm),
    [auth.isSuperuser, auth.permissions],
  );
  const canAny = useCallback((perms: string[]) => perms.some((p) => can(p)), [can]);

  const currentUser = useMemo<AppUser>(() => {
    const u = auth.me?.user;
    return u
      ? { id: String(u.id), name: u.full_name, title: u.title, roleId: u.roles[0] ?? "employee", hue: u.hue }
      : { id: "0", name: "Guest", title: "", roleId: "employee", hue: 255 };
  }, [auth.me]);

  const currentRole = useMemo<Role>(() => {
    const found = roles.find((r) => r.id === currentUser.roleId);
    if (found) return found;
    return {
      id: currentUser.roleId,
      name: auth.isSuperuser ? "Administrator" : currentUser.roleId,
      description: "",
      hue: 255,
      permissions: auth.isSuperuser ? ["*"] : auth.permissions,
    };
  }, [roles, currentUser, auth.isSuperuser, auth.permissions]);

  const value = useMemo<RbacState>(
    () => ({
      roles,
      users,
      currentUser,
      currentRole,
      can,
      canAny,
      setCurrentUser: () => {
        /* impersonation is disabled in connected mode */
      },
      assignUserRole: (userId, roleId) => {
        void api.assignRole(Number(userId), roleId).then(load);
      },
      toggleRolePermission: (roleId, permission) => {
        const role = roles.find((r) => r.id === roleId);
        if (!role || role.permissions.includes("*")) return;
        const next = role.permissions.includes(permission)
          ? role.permissions.filter((p) => p !== permission)
          : [...role.permissions, permission];
        setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, permissions: next } : r)));
        void api.updateRole(roleId, { permissions: next }).then(load);
      },
      setRolePermissions: (roleId, permissions) => {
        void api.updateRole(roleId, { permissions }).then(load);
      },
      createRole: (name, description) => {
        const id = slug(name);
        void api.createRole({ id, name, description, hue: 210, permissions: ["dashboard:view"] }).then(load);
        return id;
      },
      deleteRole: (roleId) => {
        void api.deleteRole(roleId).then(load);
      },
    }),
    [roles, users, currentUser, currentRole, can, canAny, load],
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}
