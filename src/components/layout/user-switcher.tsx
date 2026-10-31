import { UserCog, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/shared/person-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRbac } from "@/lib/rbac";
import { cn } from "@/lib/utils";

/**
 * "Viewing as" impersonation control. Switching the active user changes the
 * user's role, which re-gates the whole UI — the clearest way to demo RBAC.
 */
export function UserSwitcher() {
  const { users, roles, currentUser, currentRole, setCurrentUser } = useRbac();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCog className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline">Viewing as</span>
          <Badge
            variant="secondary"
            className="font-medium"
            style={{ color: `oklch(0.6 0.17 ${currentRole.hue})` }}
          >
            {currentRole.name}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch persona to preview role-based access
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((u) => {
          const role = roles.find((r) => r.id === u.roleId);
          const active = u.id === currentUser.id;
          return (
            <DropdownMenuItem
              key={u.id}
              onSelect={() => setCurrentUser(u.id)}
              className="gap-3 py-2"
            >
              <PersonAvatar name={u.name} hue={u.hue} className="size-8" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{u.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {role?.name ?? u.title}
                </div>
              </div>
              <Check className={cn("size-4 text-primary", active ? "opacity-100" : "opacity-0")} />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
