import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Flag, CalendarClock, UserPlus, Zap, Coffee } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Kanban } from "@/components/animate-ui/icons/kanban";
import { Users } from "@/components/animate-ui/icons/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRbac } from "@/lib/rbac";
import { useStore, type Task, type TaskPriority } from "@/lib/store";
import { initials, formatDate } from "@/lib/format";

const priorityTone: Record<TaskPriority, string> = {
  Urgent: "text-destructive",
  High: "text-warning",
  Medium: "text-info",
  Low: "text-muted-foreground",
};

type Member = {
  name: string;
  active: Task[]; // In progress / In review
  queued: Task[]; // To do / Backlog
  done: number;
  state: "Busy" | "Queued" | "Free";
  hue: number;
};

function AssignDialog({ members }: { members: string[] }) {
  const { projects, addTask } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(members[0] ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" /> Assign work
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a task</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            addTask({ title: title.trim(), projectId, assignee, priority, status: "To do", due: "2026-11-30", tags: [], points: 3 });
            setTitle("");
            setOpen(false);
            toast.success(`Assigned to ${assignee}`);
          }}
        >
          <div className="grid gap-2">
            <Label>Task</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Assign to</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{members.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(["Urgent", "High", "Medium", "Low"] as TaskPriority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Assign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const stateTone: Record<Member["state"], string> = {
  Busy: "bg-destructive/12 text-destructive",
  Queued: "bg-warning/15 text-warning",
  Free: "bg-success/12 text-success",
};

export default function WorkloadPage() {
  const { tasks, projects } = useStore();
  const { can } = useRbac();
  const canAssign = can("tasks:assign") || can("projects:manage");
  const [filter, setFilter] = useState<"all" | "Busy" | "Queued" | "Free">("all");

  const members = useMemo<Member[]>(() => {
    const names = new Set<string>();
    tasks.forEach((t) => t.assignee && names.add(t.assignee));
    projects.forEach((p) => {
      names.add(p.lead);
      p.members.forEach((m) => names.add(m));
    });
    const list: Member[] = [...names].sort().map((name) => {
      const mine = tasks.filter((t) => t.assignee === name);
      const active = mine.filter((t) => t.status === "In progress" || t.status === "In review");
      const queued = mine.filter((t) => t.status === "To do" || t.status === "Backlog");
      const done = mine.filter((t) => t.status === "Done").length;
      const state: Member["state"] = active.length ? "Busy" : queued.length ? "Queued" : "Free";
      return { name, active, queued, done, state, hue: (name.length * 23) % 360 };
    });
    return list;
  }, [tasks, projects]);

  const filtered = filter === "all" ? members : members.filter((m) => m.state === filter);
  const busy = members.filter((m) => m.state === "Busy").length;
  const free = members.filter((m) => m.state === "Free").length;
  const projName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader
        title="Team Workload"
        description="See who is working on what and who is free, then assign work to available people."
      >
        {canAssign && <AssignDialog members={members.map((m) => m.name)} />}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="People" value={members.length} tone="primary" icon={<Users className="size-5" animateOnHover />} />
        <StatCard label="Busy now" value={busy} tone="danger" icon={<Zap className="size-5" />} />
        <StatCard label="Available" value={free} tone="success" icon={<Coffee className="size-5" />} />
        <StatCard label="Active tasks" value={tasks.filter((t) => t.status === "In progress" || t.status === "In review").length} tone="warning" icon={<Kanban className="size-5" animateOnHover />} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "Busy", "Queued", "Free"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? "Everyone" : f}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => {
          const load = Math.min(100, (m.active.length * 40 + m.queued.length * 15));
          return (
            <Card key={m.name}>
              <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${m.hue}), oklch(0.55 0.2 ${m.hue}))` }}>
                    {initials(m.name)}
                  </div>
                  <div>
                    <CardTitle className="text-base leading-tight">{m.name}</CardTitle>
                    <CardDescription>{m.active.length + m.queued.length} open · {m.done} done</CardDescription>
                  </div>
                </div>
                <Badge className={cn("gap-1 border-transparent", stateTone[m.state])}>
                  <span className={cn("size-1.5 rounded-full", m.state === "Busy" ? "bg-destructive" : m.state === "Queued" ? "bg-warning" : "bg-success")} />
                  {m.state}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Load</span>
                    <span>{m.active.length} active · {m.queued.length} queued</span>
                  </div>
                  <Progress value={load} className={cn(m.state === "Busy" && "[&>div]:bg-destructive", m.state === "Queued" && "[&>div]:bg-warning", m.state === "Free" && "[&>div]:bg-success")} />
                </div>
                <div className="space-y-1.5">
                  {[...m.active, ...m.queued].slice(0, 3).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                      <Flag className={cn("size-3.5 shrink-0", priorityTone[t.priority])} />
                      <span className="min-w-0 flex-1 truncate">{t.title}</span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">{projName(t.projectId)}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3" /> {formatDate(t.due, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                  {m.active.length + m.queued.length === 0 && (
                    <div className="rounded-lg border border-dashed p-3 text-center text-xs text-success">
                      Free — ready for new work
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
