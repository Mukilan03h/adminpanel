import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Clock3, AlertTriangle, CheckCircle2, Users2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { NotebookPen } from "@/components/animate-ui/icons/notebook-pen";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useRbac } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import { formatDate, initials } from "@/lib/format";

export default function DailyUpdatesPage() {
  const { updates, projects, addUpdate } = useStore();
  const { can, currentUser, currentRole } = useRbac();
  const viewAll = can("updates:viewAll");
  const canPost = can("updates:create");

  const [personFilter, setPersonFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(projects[0]?.name ?? "");
  const [done, setDone] = useState("");
  const [blockers, setBlockers] = useState("");
  const [hours, setHours] = useState("8");

  const scoped = useMemo(
    () => (viewAll ? updates : updates.filter((u) => u.author === currentUser.name)),
    [updates, viewAll, currentUser.name],
  );

  const people = useMemo(() => [...new Set(scoped.map((u) => u.author))].sort(), [scoped]);
  const filtered = personFilter === "all" ? scoped : scoped.filter((u) => u.author === personFilter);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const u of filtered) {
      const arr = map.get(u.date) ?? [];
      arr.push(u);
      map.set(u.date, arr);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const today = "2026-10-31";
  const todayCount = scoped.filter((u) => u.date === today).length;
  const blockerCount = scoped.filter((u) => u.blockers && u.blockers !== "None").length;
  const avgHours = scoped.length ? Math.round((scoped.reduce((s, u) => s + u.hours, 0) / scoped.length) * 10) / 10 : 0;

  return (
    <>
      <PageHeader
        title="Daily Updates"
        description={viewAll ? "Daily standups across the organization." : "Your daily standups and check-ins."}
      >
        {canPost && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <NotebookPen className="size-4" animateOnHover /> Post update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daily update</DialogTitle>
              </DialogHeader>
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!done.trim()) return;
                  addUpdate({
                    author: currentUser.name,
                    role: currentRole.name,
                    date: today,
                    project,
                    done: done.trim(),
                    blockers: blockers.trim() || "None",
                    hours: Number(hours) || 0,
                    hue: currentUser.hue,
                  });
                  setDone("");
                  setBlockers("");
                  setOpen(false);
                  toast.success("Update posted");
                }}
              >
                <div className="grid gap-2">
                  <Label>Project</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="done">What did you get done?</Label>
                  <Textarea id="done" value={done} onChange={(e) => setDone(e.target.value)} rows={3} required />
                </div>
                <div className="grid grid-cols-[1fr_120px] gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="blk">Blockers</Label>
                    <Input id="blk" value={blockers} onChange={(e) => setBlockers(e.target.value)} placeholder="None" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="hrs">Hours</Label>
                    <Input id="hrs" type="number" step="0.5" min="0" max="16" value={hours} onChange={(e) => setHours(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit">Post</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Updates today" value={todayCount} tone="primary" icon={<NotebookPen className="size-5" animateOnHover />} />
        <StatCard label="People reported" value={people.length} tone="info" icon={<Users2 className="size-5" />} />
        <StatCard label="Avg. hours logged" value={avgHours} decimalPlaces={1} tone="success" icon={<Clock3 className="size-5" />} />
        <StatCard label="Open blockers" value={blockerCount} tone="warning" icon={<AlertTriangle className="size-5" />} />
      </div>

      {viewAll && (
        <div className="flex items-center gap-2">
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Everyone" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              {people.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-6">
        {grouped.map(([date, items]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">
                {date === today ? "Today" : formatDate(date, { weekday: "long", month: "short", day: "numeric" })}
              </h3>
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{items.length} updates</span>
            </div>
            <div className="grid gap-3">
              {items.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card>
                    <CardContent className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${u.hue}), oklch(0.55 0.2 ${u.hue}))` }}>
                        {initials(u.author)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{u.author}</span>
                          <Badge variant="secondary" className="font-normal">{u.role}</Badge>
                          <Badge variant="outline" className="font-normal">{u.project}</Badge>
                          <span className="ml-auto text-xs text-muted-foreground">{u.hours}h logged</span>
                        </div>
                        <p className="text-sm">{u.done}</p>
                        {u.blockers && u.blockers !== "None" && (
                          <p className="flex items-center gap-1.5 text-sm text-warning">
                            <AlertTriangle className="size-3.5" /> {u.blockers}
                          </p>
                        )}
                        {(!u.blockers || u.blockers === "None") && (
                          <p className="flex items-center gap-1.5 text-xs text-success">
                            <CheckCircle2 className="size-3.5" /> No blockers
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No updates yet. Post your first standup.</CardContent></Card>
        )}
      </div>
    </>
  );
}
