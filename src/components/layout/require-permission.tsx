import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRbac, type Permission } from "@/lib/rbac";

export function Forbidden() {
  const { currentRole } = useRbac();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="size-8" />
      </span>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your current role (<span className="font-medium text-foreground">{currentRole.name}</span>
          ) doesn’t have permission to view this page. Switch persona or ask an admin to grant access.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}

/** Gates a route's element behind a permission. */
export function RequirePermission({
  perm,
  children,
}: {
  perm: Permission;
  children: ReactNode;
}) {
  const { can } = useRbac();
  if (!can(perm)) return <Forbidden />;
  return <>{children}</>;
}
