import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Users2, CheckSquare, ListChecks, CalendarClock, Video } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarDays } from "@/components/animate-ui/icons/calendar-days";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useStore, type Meeting } from "@/lib/store";
import { formatDate, initials } from "@/lib/format";

const typeTone: Record<Meeting["type"], string> = {
  Standup: "text-info",
  Review: "text-primary",
  Client: "text-warning",
  "1:1": "text-success",
  Planning: "text-muted-foreground",
};

function ScheduleDialog({ onAdd }: { onAdd: (m: Omit<Meeting, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-11-05");
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState<Meeting["type"]>("Standup");
  const [link, setLink] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a meeting</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            onAdd({ title: title.trim(), date, time, type, attendees: [], agenda: [], minutes: "", decisions: [], actionItems: [], hue: 200, link: link.trim() || undefined });
            setTitle("");
            setLink("");
            setOpen(false);
            toast.success("Meeting scheduled");
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="m-title">Title</Label>
            <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="m-link">Join link (shared with attendees, incl. interns)</Label>
            <Input id="m-link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.…" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="m-date">Date</Label>
              <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="m-time">Time</Label>
              <Input id="m-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Meeting["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Standup", "Review", "Client", "1:1", "Planning"] as Meeting["type"][]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MeetingsPage() {
  const { meetings, addMeeting, updateMeeting, toggleActionItem, addActionItem } = useStore();
  const { can } = useRbac();
  const canEdit = can("meetings:editMinutes");
  const canCreate = can("meetings:create");

  const [selectedId, setSelectedId] = useState(meetings[0]?.id ?? "");
  const selected = useMemo(() => meetings.find((m) => m.id === selectedId) ?? meetings[0], [meetings, selectedId]);

  const [aiText, setAiText] = useState("");
  const [aiOwner, setAiOwner] = useState("");

  const openActions = meetings.flatMap((m) => m.actionItems).filter((a) => !a.done).length;

  if (!selected) {
    return (
      <>
        <PageHeader title="Meetings" description="Schedule meetings and capture minutes." >
          {canCreate && <ScheduleDialog onAdd={addMeeting} />}
        </PageHeader>
        <Card><CardContent className="py-12 text-center text-muted-foreground">No meetings yet.</CardContent></Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Meetings & Minutes"
        description="Agendas, minutes of meeting, decisions and action items — all in one place."
      >
        <Badge variant="outline" className="gap-1.5">
          <ListChecks className="size-3.5" /> {openActions} open actions
        </Badge>
        {canCreate && <ScheduleDialog onAdd={addMeeting} />}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Meeting list */}
        <div className="flex flex-col gap-2">
          {meetings.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                m.id === selected.id ? "border-primary/40 bg-primary/5" : "bg-card hover:bg-accent/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn("text-xs font-medium", typeTone[m.type])}>{m.type}</span>
                <span className="text-xs text-muted-foreground">{formatDate(m.date, { month: "short", day: "numeric" })} · {m.time}</span>
              </div>
              <div className="mt-1 text-sm font-medium leading-snug">{m.title}</div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Users2 className="size-3.5" /> {m.attendees.length} attendees
                {m.minutes ? <Badge variant="secondary" className="ml-auto h-5 gap-1 px-1.5"><CheckSquare className="size-3" /> MoM</Badge> : null}
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={typeTone[selected.type]}>{selected.type}</Badge>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" /> {formatDate(selected.date, { weekday: "short", month: "short", day: "numeric" })} · {selected.time}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary" /> {selected.title}
                </CardTitle>
                {selected.link && (
                  <Button size="sm" onClick={() => window.open(selected.link, "_blank", "noopener,noreferrer")}>
                    <Video className="size-4" /> Join
                  </Button>
                )}
              </div>
              {selected.attendees.length > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex -space-x-2">
                    {selected.attendees.slice(0, 6).map((a, i) => (
                      <div key={i} className="flex size-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold text-white" style={{ background: `oklch(0.6 0.16 ${(a.length * 23) % 360})` }} title={a}>
                        {initials(a)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{selected.attendees.join(", ")}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Agenda */}
              {selected.agenda.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">Agenda</h3>
                  <ul className="space-y-1">
                    {selected.agenda.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground">{i + 1}</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Minutes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Minutes of meeting</h3>
                  {!canEdit && <Badge variant="outline" className="text-xs">Read-only</Badge>}
                </div>
                <Textarea
                  value={selected.minutes}
                  readOnly={!canEdit}
                  onChange={(e) => updateMeeting(selected.id, { minutes: e.target.value })}
                  rows={5}
                  placeholder={canEdit ? "Capture the discussion, context and outcomes…" : "No minutes recorded."}
                  className={cn(!canEdit && "bg-muted/40")}
                />
                {canEdit && (
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => toast.success("Minutes saved")}>Save minutes</Button>
                  </div>
                )}
              </div>

              {/* Decisions */}
              {selected.decisions.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">Decisions</h3>
                  <ul className="space-y-1.5">
                    {selected.decisions.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg bg-success/8 p-2 text-sm">
                        <CheckSquare className="mt-0.5 size-4 shrink-0 text-success" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action items</CardTitle>
              <CardDescription>Tasks owned by attendees after the meeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {selected.actionItems.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <Checkbox checked={a.done} disabled={!canEdit} onCheckedChange={() => toggleActionItem(selected.id, a.id)} />
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm", a.done && "text-muted-foreground line-through")}>{a.text}</div>
                    <div className="text-xs text-muted-foreground">{a.owner} · due {formatDate(a.due, { month: "short", day: "numeric" })}</div>
                  </div>
                  <Badge variant={a.done ? "secondary" : "outline"} className={a.done ? "text-success" : ""}>
                    {a.done ? "Done" : "Open"}
                  </Badge>
                </div>
              ))}
              {selected.actionItems.length === 0 && (
                <p className="py-2 text-center text-sm text-muted-foreground">No action items yet.</p>
              )}

              {canEdit && (
                <form
                  className="flex flex-col gap-2 pt-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!aiText.trim()) return;
                    addActionItem(selected.id, { text: aiText.trim(), owner: aiOwner.trim() || "Unassigned", due: "2026-11-15", done: false });
                    setAiText("");
                    setAiOwner("");
                    toast.success("Action item added");
                  }}
                >
                  <Input value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="New action item…" className="flex-1" />
                  <Input value={aiOwner} onChange={(e) => setAiOwner(e.target.value)} placeholder="Owner" className="sm:w-40" />
                  <Button type="submit" size="sm"><Plus className="size-4" /> Add</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
