import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Lock, ShieldCheck as ShieldIcon, Users2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { PERMISSION_GROUPS, useRbac, type Role } from "@/lib/rbac";

function CreateRoleDialog({ onCreate }: { onCreate: (name: string, desc: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> New role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a role</DialogTitle>
          <DialogDescription>
            New roles start with dashboard access. Grant permissions after creating.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onCreate(name.trim(), desc.trim());
            setName("");
            setDesc("");
            setOpen(false);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="QA Lead" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-desc">Description</Label>
            <Textarea id="role-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="What can this role do?" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function permCount(role: Role, total: number): number {
  return role.permissions.includes("*") ? total : role.permissions.length;
}

export default function AccessControlPage() {
  const {
    roles,
    users,
    can,
    toggleRolePermission,
    createRole,
    deleteRole,
    assignUserRole,
  } = useRbac();
  const canManage = can("rbac:manage");
  const totalPerms = PERMISSION_GROUPS.reduce((s, g) => s + g.permissions.length, 0);

  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "admin");
  const selected = useMemo(
    () => roles.find((r) => r.id === selectedId) ?? roles[0],
    [roles, selectedId],
  );
  const isWildcard = selected.permissions.includes("*");

  const countByRole = useMemo(
    () => Object.fromEntries(users.reduce((m, u) => m.set(u.roleId, (m.get(u.roleId) ?? 0) + 1), new Map<string, number>())),
    [users],
  );

  return (
    <>
      <PageHeader
        title="Access Control"
        description="Define roles, toggle permissions and assign people. Changes re-gate the app instantly."
      >
        {!canManage && (
          <Badge variant="outline" className="gap-1.5">
            <Lock className="size-3.5" /> Read-only
          </Badge>
        )}
      </PageHeader>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">
            <ShieldIcon className="size-4" /> Roles & permissions
          </TabsTrigger>
          <TabsTrigger value="assign">
            <Users2 className="size-4" /> User assignments
          </TabsTrigger>
        </TabsList>

        {/* Roles & permissions */}
        <TabsContent value="roles">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            {/* Role list */}
            <Card className="h-fit py-0">
              <div className="flex items-center justify-between border-b p-3">
                <span className="text-sm font-medium">Roles</span>
                {canManage && <CreateRoleDialog onCreate={(n, d) => { const id = createRole(n, d); setSelectedId(id); toast.success(`Role “${n}” created`); }} />}
              </div>
              <div className="p-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      r.id === selected.id ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: `oklch(0.62 0.18 ${r.hue})` }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{r.name}</span>
                        {r.system && <Lock className="size-3 text-muted-foreground" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {permCount(r, totalPerms)} perms · {countByRole[r.id] ?? 0} users
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Permission matrix */}
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selected.name}
                    {selected.system && <Badge variant="secondary" className="gap-1"><Lock className="size-3" /> Built-in</Badge>}
                  </CardTitle>
                  <CardDescription>{selected.description}</CardDescription>
                </div>
                {canManage && !selected.system && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{selected.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Users assigned to this role will fall back to their default role.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteRole(selected.id);
                            setSelectedId("admin");
                            toast.success("Role deleted");
                          }}
                        >
                          Delete role
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                {isWildcard && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                    <span className="font-medium text-primary">Full access.</span>{" "}
                    This role is granted every permission across all modules.
                  </div>
                )}
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.module} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{group.module}</h3>
                      <span className="text-xs text-muted-foreground">{group.description}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {group.permissions.map((p) => {
                        const checked = isWildcard || selected.permissions.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm transition-colors",
                              checked && "border-primary/30 bg-primary/5",
                              (!canManage || isWildcard) && "opacity-80",
                            )}
                          >
                            <span>{p.label}</span>
                            <Switch
                              checked={checked}
                              disabled={!canManage || isWildcard}
                              onCheckedChange={() => toggleRolePermission(selected.id, p.key)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assign">
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-56">Role</TableHead>
                    <TableHead>Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const role = roles.find((r) => r.id === u.roleId);
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <PersonAvatar name={u.name} hue={u.hue} className="size-8" />
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.title}</TableCell>
                        <TableCell>
                          <Select
                            value={u.roleId}
                            disabled={!canManage}
                            onValueChange={(v) => {
                              assignUserRole(u.id, v);
                              toast.success(`${u.name} is now ${roles.find((r) => r.id === v)?.name}`);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" style={{ color: `oklch(0.6 0.17 ${role?.hue ?? 255})` }}>
                            {permCount(role ?? roles[0], totalPerms)} permissions
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
