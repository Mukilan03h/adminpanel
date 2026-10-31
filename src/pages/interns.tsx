import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star, GraduationCap as CapIcon, Scale, FileCheck2, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { GraduationCap } from "@/components/animate-ui/icons/graduation-cap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRbac } from "@/lib/rbac";
import { useStore, weightedScore, type Intern } from "@/lib/store";
import { formatDate, formatINR } from "@/lib/format";

function scoreColor(score: number): string {
  if (score >= 85) return "[&>div]:bg-success";
  if (score >= 70) return "[&>div]:bg-info";
  if (score >= 55) return "[&>div]:bg-warning";
  return "[&>div]:bg-destructive";
}

function ScoreDialog({ intern }: { intern: Intern }) {
  const { criteria, scores, setScore } = useStore();
  const { can } = useRbac();
  const canScore = can("interns:score");
  const total = weightedScore(scores, criteria, intern.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Star className="size-4" /> {canScore ? "Score" : "View scores"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PersonAvatar name={intern.name} hue={intern.hue} className="size-8" />
            {intern.name}
          </DialogTitle>
          <DialogDescription>
            {intern.department} intern · mentored by {intern.mentor}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 p-4">
          <div className="flex items-end justify-between">
            <span className="text-sm text-muted-foreground">Weighted score</span>
            <span className="text-3xl font-semibold tabular-nums">{total}<span className="text-base text-muted-foreground">/100</span></span>
          </div>
          <Progress value={total} className={cn("mt-2 h-2", scoreColor(total))} />
        </div>

        <div className="space-y-5">
          {criteria.map((c) => {
            const v = scores[intern.id]?.[c.id] ?? 0;
            return (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {c.name}
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">{c.weight}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">{v}<span className="text-xs text-muted-foreground">/10</span></span>
                </div>
                <Slider
                  value={[v]}
                  min={0}
                  max={10}
                  step={1}
                  disabled={!canScore}
                  onValueChange={([nv]) => setScore(intern.id, c.id, nv)}
                />
              </div>
            );
          })}
        </div>

        {canScore && (
          <Button onClick={() => toast.success(`Saved score for ${intern.name}: ${total}/100`)}>
            Save evaluation
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

const REQUIRED_DOCS = ["Offer letter", "NDA", "ID proof", "Bank details", "Completion certificate"];
type DocState = "Pending" | "Received" | "Approved";
const docCycle: Record<DocState, DocState> = { Pending: "Received", Received: "Approved", Approved: "Pending" };
const docTone: Record<DocState, string> = {
  Pending: "bg-muted text-muted-foreground",
  Received: "bg-info/12 text-info",
  Approved: "bg-success/12 text-success",
};

export default function InternsPage() {
  const { interns, criteria, scores, addCriterion, updateCriterion, removeCriterion } = useStore();
  const { can } = useRbac();
  const canRubric = can("interns:manageRubric");
  const canDocs = can("interns:docs");

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  const avgScore = interns.length
    ? Math.round(interns.reduce((s, i) => s + weightedScore(scores, criteria, i.id), 0) / interns.length)
    : 0;
  const top = [...interns].sort((a, b) => weightedScore(scores, criteria, b.id) - weightedScore(scores, criteria, a.id))[0];

  // Onboarding docs (demo, local): internId -> doc -> state
  const [docState, setDocState] = useState<Record<string, Record<string, DocState>>>(() => {
    const seed: Record<string, Record<string, DocState>> = {};
    interns.forEach((it, idx) => {
      seed[it.id] = {};
      REQUIRED_DOCS.forEach((d, di) => {
        seed[it.id][d] = (idx + di) % 4 === 0 ? "Pending" : (idx + di) % 3 === 0 ? "Received" : "Approved";
      });
    });
    return seed;
  });

  const [newCrit, setNewCrit] = useState({ name: "", weight: "10", by: "Manager", desc: "" });

  return (
    <>
      <PageHeader
        title="Interns"
        description="Manage interns, run HR- and manager-defined evaluations, and track onboarding documents."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total interns" value={interns.length} tone="primary" icon={<GraduationCap className="size-5" animateOnHover />} />
        <StatCard label="Active" value={interns.filter((i) => i.status === "Active").length} tone="success" />
        <StatCard label="Avg. score" value={avgScore} suffix="/100" tone="info" icon={<Scale className="size-5" />} />
        <StatCard label="Top intern" value={top ? weightedScore(scores, criteria, top.id) : 0} suffix="/100" tone="warning" trendLabel={top?.name} icon={<Star className="size-5" />} />
      </div>

      <Tabs defaultValue="interns">
        <TabsList>
          <TabsTrigger value="interns"><CapIcon className="size-4" /> Interns</TabsTrigger>
          <TabsTrigger value="rubric"><Scale className="size-4" /> Scoring rubric</TabsTrigger>
          <TabsTrigger value="docs"><FileCheck2 className="size-4" /> Onboarding docs</TabsTrigger>
        </TabsList>

        {/* Interns grid */}
        <TabsContent value="interns">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {interns.map((it) => {
              const score = weightedScore(scores, criteria, it.id);
              return (
                <Card key={it.id}>
                  <CardContent className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <PersonAvatar name={it.name} hue={it.hue} className="size-11" />
                        <div>
                          <div className="font-semibold leading-tight">{it.name}</div>
                          <div className="text-xs text-muted-foreground">{it.college}</div>
                        </div>
                      </div>
                      <StatusBadge status={it.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Department</div>
                        <div className="font-medium">{it.department}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Mentor</div>
                        <div className="font-medium">{it.mentor}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Stipend</div>
                        <div className="font-medium tabular-nums">{formatINR(it.stipendInr)}/mo</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Ends</div>
                        <div className="font-medium">{formatDate(it.endDate, { month: "short", day: "numeric" })}</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Evaluation</span>
                        <span className="font-semibold tabular-nums">{score}/100</span>
                      </div>
                      <Progress value={score} className={cn("h-1.5", scoreColor(score))} />
                    </div>
                    <div className="flex justify-end">
                      <ScoreDialog intern={it} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Rubric */}
        <TabsContent value="rubric">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Scoring rubric</CardTitle>
                <CardDescription>Criteria and weights defined by HR and managers.</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total weight</div>
                <div className={cn("text-lg font-semibold tabular-nums", totalWeight === 100 ? "text-success" : "text-warning")}>
                  {totalWeight}%
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalWeight !== 100 && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning-foreground dark:text-warning">
                  Weights add up to {totalWeight}%. Adjust so they total 100% for an accurate score.
                </div>
              )}
              {!canRubric && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="size-4" /> Only HR and managers can edit the rubric.
                </div>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Criterion</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Defined by</TableHead>
                      <TableHead className="w-28">Weight</TableHead>
                      {canRubric && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={c.definedBy === "HR" ? "text-primary" : "text-info"}>{c.definedBy}</Badge>
                        </TableCell>
                        <TableCell>
                          {canRubric ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={c.weight}
                                onChange={(e) => updateCriterion(c.id, { weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                                className="h-8 w-16"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          ) : (
                            <span className="font-medium tabular-nums">{c.weight}%</span>
                          )}
                        </TableCell>
                        {canRubric && (
                          <TableCell>
                            <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => { removeCriterion(c.id); toast("Criterion removed"); }}>
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {canRubric && (
                <form
                  className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_1fr_120px_110px_auto]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCrit.name.trim()) return;
                    addCriterion({ name: newCrit.name.trim(), description: newCrit.desc.trim() || "—", weight: Number(newCrit.weight) || 0, definedBy: newCrit.by });
                    setNewCrit({ name: "", weight: "10", by: "Manager", desc: "" });
                    toast.success("Criterion added");
                  }}
                >
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Criterion</Label>
                    <Input value={newCrit.name} onChange={(e) => setNewCrit((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Code reviews" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Description</Label>
                    <Input value={newCrit.desc} onChange={(e) => setNewCrit((p) => ({ ...p, desc: e.target.value }))} placeholder="Short description" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Defined by</Label>
                    <Select value={newCrit.by} onValueChange={(v) => setNewCrit((p) => ({ ...p, by: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Weight %</Label>
                    <Input type="number" min={0} max={100} value={newCrit.weight} onChange={(e) => setNewCrit((p) => ({ ...p, weight: e.target.value }))} />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full"><Plus className="size-4" /> Add</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding docs */}
        <TabsContent value="docs">
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Intern</TableHead>
                    {REQUIRED_DOCS.map((d) => (
                      <TableHead key={d} className="text-center">{d}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interns.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <PersonAvatar name={it.name} hue={it.hue} className="size-8" />
                          <div>
                            <div className="text-sm font-medium">{it.name}</div>
                            <div className="text-xs text-muted-foreground">{it.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      {REQUIRED_DOCS.map((d) => {
                        const state = docState[it.id]?.[d] ?? "Pending";
                        return (
                          <TableCell key={d} className="text-center">
                            <button
                              disabled={!canDocs}
                              onClick={() =>
                                setDocState((prev) => ({
                                  ...prev,
                                  [it.id]: { ...prev[it.id], [d]: docCycle[state] },
                                }))
                              }
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                                docTone[state],
                                canDocs ? "cursor-pointer hover:opacity-80" : "cursor-default",
                              )}
                            >
                              {state}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {canDocs && (
              <div className="border-t p-3 text-xs text-muted-foreground">
                Click a status to cycle Pending → Received → Approved.
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
