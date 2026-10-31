import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus,
  CalendarClock,
  Flag,
  MoreHorizontal,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Kanban } from "@/components/animate-ui/icons/kanban";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  TASK_STATUSES,
  useStore,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/store";
import { formatDate } from "@/lib/format";
import { initials } from "@/lib/format";

const priorityTone: Record<TaskPriority, string> = {
  Urgent: "text-destructive",
  High: "text-warning",
  Medium: "text-info",
  Low: "text-muted-foreground",
};

const statusDot: Record<TaskStatus, string> = {
  Backlog: "bg-muted-foreground",
  "To do": "bg-info",
  "In progress": "bg-warning",
  "In review": "bg-primary",
  Done: "bg-success",
};

function AddTaskDialog({ onAdd, members }: { onAdd: (t: Omit<Task, "id">) => void; members: string[] }) {
  const { projects } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [assignee, setAssignee] = useState(members[0] ?? "");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [status, setStatus] = useState<TaskStatus>("To do");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onAdd({ title: title.trim(), projectId, assignee, priority, status, due: "2026-11-30", tags: [], points: 3 });
            setTitle("");
            setOpen(false);
            toast.success("Task created");
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Urgent", "High", "Medium", "Low"] as TaskPriority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Create task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskCard({
  task,
  projectName,
  projectHue,
  canMove,
  onMove,
}: {
  task: Task;
  projectName: string;
  projectHue: number;
  canMove: boolean;
  onMove: (status: TaskStatus) => void;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
      <Card className="group gap-0 py-0">
        <CardContent className="space-y-2.5 p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium leading-snug">{task.title}</span>
            {canMove && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-6 shrink-0 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Move to</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={task.status} onValueChange={(v) => onMove(v as TaskStatus)}>
                    {TASK_STATUSES.map((s) => (
                      <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="gap-1 font-normal" style={{ color: `oklch(0.6 0.17 ${projectHue})` }}>
              <span className="size-1.5 rounded-full" style={{ background: `oklch(0.6 0.17 ${projectHue})` }} />
              {projectName}
            </Badge>
            <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", priorityTone[task.priority])}>
              <Flag className="size-3" /> {task.priority}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              {formatDate(task.due, { month: "short", day: "numeric" })}
            </div>
            <div
              className="flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ background: `oklch(0.6 0.17 ${(task.assignee.length * 23) % 360})` }}
              title={task.assignee}
            >
              {initials(task.assignee)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const { projects, tasks, addTask, updateTask } = useStore();
  const { can, currentUser } = useRbac();
  const canMove = can("tasks:update") || can("tasks:assign") || can("projects:manage");
  const canCreate = can("tasks:assign") || can("projects:manage");
  // Interns and individual contributors see only tasks assigned to them.
  const scopedToSelf = !can("tasks:assign") && !can("projects:manage");

  const [projectFilter, setProjectFilter] = useState("all");

  const members = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      set.add(p.lead);
      p.members.forEach((m) => set.add(m));
    });
    tasks.forEach((t) => set.add(t.assignee));
    return [...set].sort();
  }, [projects, tasks]);

  const filteredTasks = useMemo(() => {
    let list = projectFilter === "all" ? tasks : tasks.filter((t) => t.projectId === projectFilter);
    if (scopedToSelf) list = list.filter((t) => t.assignee === currentUser.name);
    return list;
  }, [tasks, projectFilter, scopedToSelf, currentUser.name]);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const projectHue = (id: string) => projects.find((p) => p.id === id)?.hue ?? 255;

  const done = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In progress").length;
  const overdue = tasks.filter((t) => t.status !== "Done" && new Date(t.due) < new Date()).length;

  return (
    <>
      <PageHeader
        title="Projects"
        description="Plan, assign and track work across teams — board and list views."
      >
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {canCreate && <AddTaskDialog onAdd={addTask} members={members} />}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active projects" value={projects.filter((p) => p.status !== "Completed").length} tone="primary" icon={<Kanban className="size-5" animateOnHover />} />
        <StatCard label="Tasks in progress" value={inProgress} tone="warning" trendLabel="Across all teams" />
        <StatCard label="Completed" value={done} tone="success" trendLabel="This sprint" />
        <StatCard label="Overdue" value={overdue} tone="danger" trendLabel="Needs attention" />
      </div>

      {/* Project cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: `oklch(0.6 0.17 ${p.hue})` }}>
                    {p.code}
                  </span>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.client}</div>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium text-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className={cn(p.status === "Delayed" && "[&>div]:bg-destructive", p.status === "At risk" && "[&>div]:bg-warning", p.status === "Completed" && "[&>div]:bg-success")} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[p.lead, ...p.members].slice(0, 4).map((m, i) => (
                    <div key={i} className="flex size-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold text-white" style={{ background: `oklch(0.6 0.16 ${(m.length * 23) % 360})` }} title={m}>
                      {initials(m)}
                    </div>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" /> {formatDate(p.due, { month: "short", day: "numeric" })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Board / list */}
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board"><LayoutGrid className="size-4" /> Board</TabsTrigger>
          <TabsTrigger value="list"><ListIcon className="size-4" /> List</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {TASK_STATUSES.map((status) => {
              const list = filteredTasks.filter((t) => t.status === status);
              return (
                <div key={status} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", statusDot[status])} />
                      <span className="text-sm font-medium">{status}</span>
                    </div>
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs tabular-nums">{list.length}</Badge>
                  </div>
                  <div className="flex min-h-[80px] flex-col gap-2 rounded-xl bg-muted/40 p-2">
                    <AnimatePresence initial={false}>
                      {list.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          projectName={projectName(t.projectId)}
                          projectHue={projectHue(t.projectId)}
                          canMove={canMove}
                          onMove={(s) => {
                            updateTask(t.id, { status: s });
                            toast(`Moved to ${s}`);
                          }}
                        />
                      ))}
                    </AnimatePresence>
                    {list.length === 0 && (
                      <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                        Nothing here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Task</TableHead>
                    <TableHead className="hidden md:table-cell">Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="w-40">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="font-normal" style={{ color: `oklch(0.6 0.17 ${projectHue(t.projectId)})` }}>
                          {projectName(t.projectId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{t.assignee}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1 text-sm font-medium", priorityTone[t.priority])}>
                          <Flag className="size-3.5" /> {t.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {canMove ? (
                          <Select value={t.status} onValueChange={(v) => { updateTask(t.id, { status: v as TaskStatus }); toast(`Moved to ${v}`); }}>
                            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{t.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(t.due, { month: "short", day: "numeric" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
