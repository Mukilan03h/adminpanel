import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Umbrella } from "@/components/animate-ui/icons/umbrella";
import { Plus } from "@/components/animate-ui/icons/plus";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { leaveRequests, employeeById, type RequestStatus } from "@/lib/data";
import { formatDate } from "@/lib/format";

const balances = [
  { type: "Vacation", used: 12, total: 25, tone: "[&>div]:bg-info" },
  { type: "Sick", used: 3, total: 10, tone: "[&>div]:bg-warning" },
  { type: "Personal", used: 2, total: 5, tone: "[&>div]:bg-primary" },
  { type: "Parental", used: 0, total: 60, tone: "[&>div]:bg-success" },
];

const leaveTone: Record<string, string> = {
  Vacation: "text-info",
  Sick: "text-warning",
  Personal: "text-primary",
  Parental: "text-success",
  Unpaid: "text-muted-foreground",
};

function RequestLeaveDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" animateOnHover />
          Request leave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request time off</DialogTitle>
          <DialogDescription>
            Submit a leave request for approval by your manager.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            toast.success("Leave request submitted", {
              description: "Your manager will review it shortly.",
            });
          }}
        >
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select defaultValue="Vacation">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Vacation", "Sick", "Personal", "Parental", "Unpaid"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} placeholder="Add a short note…" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Submit request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LeavePage() {
  const [filter, setFilter] = useState<RequestStatus | "All">("Pending");

  const requests = useMemo(
    () => (filter === "All" ? leaveRequests : leaveRequests.filter((r) => r.status === filter)),
    [filter],
  );

  return (
    <>
      <PageHeader
        title="Leave management"
        description="Review requests, approve time off and keep an eye on balances."
      >
        <RequestLeaveDialog />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {balances.map((b) => {
          const pct = Math.round((b.used / b.total) * 100);
          return (
            <Card key={b.type}>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {b.type}
                  </span>
                  <Umbrella className="size-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tabular-nums">
                    {b.total - b.used}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {b.total} days left</span>
                </div>
                <Progress value={pct} className={`h-1.5 ${b.tone}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as RequestStatus | "All")}>
        <TabsList>
          <TabsTrigger value="Pending">
            Pending
            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
              {leaveRequests.filter((r) => r.status === "Pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Approved">Approved</TabsTrigger>
          <TabsTrigger value="Rejected">Rejected</TabsTrigger>
          <TabsTrigger value="All">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {requests.map((r) => {
            const e = employeeById(r.employeeId);
            if (!e) return null;
            return (
              <Card key={r.id}>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3">
                    <PersonAvatar name={e.name} hue={e.avatarHue} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{e.name}</span>
                        <span className={`text-xs font-medium ${leaveTone[r.type]}`}>
                          {r.type}
                        </span>
                      </div>
                      <div className="truncate text-sm text-muted-foreground">{r.reason}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <span>
                      {formatDate(r.from, { month: "short", day: "numeric" })} –{" "}
                      {formatDate(r.to, { month: "short", day: "numeric" })}
                    </span>
                    <Badge variant="outline" className="tabular-nums">
                      {r.days}d
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 sm:w-56 sm:justify-end">
                    {r.status === "Pending" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => toast.error(`Rejected ${e.name}’s request`)}
                        >
                          <X className="size-4" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            toast.success(`Approved ${e.name}’s ${r.type.toLowerCase()} leave`)
                          }
                        >
                          <Check className="size-4" /> Approve
                        </Button>
                      </>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {requests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No {filter.toLowerCase()} requests.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
