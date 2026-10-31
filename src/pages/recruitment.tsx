import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, MapPin, Users2, Clock3, Upload, Wand2, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatCard } from "@/components/shared/stat-card";
import { Rocket } from "@/components/animate-ui/icons/rocket";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { candidates as seedCandidates, jobOpenings, type Candidate, type CandidateStage } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/format";
import { useRbac } from "@/lib/rbac";

const KNOWN_SKILLS = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "Go", "Node", "SQL",
  "PostgreSQL", "AWS", "Docker", "Kubernetes", "Figma", "Django", "FastAPI",
  "GraphQL", "Kotlin", "Swift", "Rust", "ML", "TensorFlow", "PyTorch",
];
const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "People Ops", "Finance", "Customer Success"];

/**
 * Heuristic résumé parser — stands in for the backend OCR + LLM prefill
 * (POST /recruitment/parse-resume). Extracts the obvious fields so HR starts
 * from a filled form instead of a blank one.
 */
function parseResume(text: string) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]{2,}/)?.[0] ?? "";
  const phone = text.match(/(\+?\d[\d ()-]{8,}\d)/)?.[0]?.trim() ?? "";
  const firstLine = text.trim().split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? "";
  const name = /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(firstLine) ? firstLine : (email ? email.split("@")[0].replace(/[._]/g, " ") : "New Candidate");
  const skills = KNOWN_SKILLS.filter((s) => new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
  const roleMatch = text.match(/(senior |lead |staff |junior )?(software|frontend|backend|full[- ]?stack|data|product|ux|ui|devops|qa|mobile)[\w /-]*(engineer|developer|designer|manager|scientist|analyst)/i);
  return { name: name.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 40), email, phone, skills, role: roleMatch?.[0] ?? "" };
}

const stages: { key: CandidateStage; tone: string }[] = [
  { key: "Applied", tone: "bg-muted-foreground" },
  { key: "Screening", tone: "bg-warning" },
  { key: "Interview", tone: "bg-info" },
  { key: "Offer", tone: "bg-primary" },
  { key: "Hired", tone: "bg-success" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < Math.round(rating)
              ? "fill-warning text-warning"
              : "fill-transparent text-muted-foreground/40",
          )}
        />
      ))}
      <span className="ml-1 text-xs tabular-nums text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function ResumeUploadDialog({ onAdd }: { onAdd: (c: Candidate) => void }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseResume> | null>(null);
  const [department, setDepartment] = useState("Engineering");

  function runParse(text: string) {
    setRaw(text);
    if (text.trim().length > 20) setParsed(parseResume(text));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setRaw(""); setParsed(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" /> Upload résumé
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" animateOnHover /> Résumé → candidate
          </DialogTitle>
          <DialogDescription>
            Upload or paste a résumé. OCR + AI prefill the fields so you can review, not retype.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="resume-file">Résumé file (.txt) or paste below</Label>
            <Input
              id="resume-file" type="file" accept=".txt,.md,text/plain"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) f.text().then(runParse);
              }}
            />
          </div>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={5}
            placeholder="Paste résumé text here…"
          />
          <Button type="button" variant="secondary" onClick={() => runParse(raw)} disabled={raw.trim().length < 20}>
            <Wand2 className="size-4" /> Extract with AI
          </Button>

          {parsed && (
            <form
              className="grid gap-3 rounded-xl border bg-muted/30 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                onAdd({
                  id: `CND-${Date.now()}`,
                  name: parsed.name || "New Candidate",
                  role: parsed.role || "Candidate",
                  department: department as Candidate["department"],
                  stage: "Applied",
                  rating: 3,
                  appliedOn: "2026-10-31",
                  avatarHue: (parsed.name.length * 29) % 360,
                });
                setOpen(false);
                setRaw("");
                setParsed(null);
                toast.success(`${parsed.name} added to the pipeline`);
              }}
            >
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="size-3.5" /> Prefilled by OCR + AI — review & edit
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={parsed.name} onChange={(e) => setParsed({ ...parsed, name: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Role</Label>
                  <Input value={parsed.role} onChange={(e) => setParsed({ ...parsed, role: e.target.value })} placeholder="e.g. Frontend Engineer" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input value={parsed.email} onChange={(e) => setParsed({ ...parsed, email: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {(parsed.email || parsed.phone) && (
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {parsed.email && <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {parsed.email}</span>}
                  {parsed.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3" /> {parsed.phone}</span>}
                </div>
              )}
              {parsed.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {parsed.skills.map((s) => <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>)}
                </div>
              )}
              <DialogFooter className="px-0">
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Add candidate</Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RecruitmentPage() {
  const { can } = useRbac();
  const canManage = can("recruitment:manage");
  const [added, setAdded] = useState<Candidate[]>([]);
  const candidates = useMemo(() => [...added, ...seedCandidates], [added]);
  const totalApplicants = jobOpenings.reduce((s, j) => s + j.applicants, 0) + added.length;
  const interviewing = candidates.filter((c) => c.stage === "Interview").length;
  const offers = candidates.filter((c) => c.stage === "Offer").length;

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Track candidates through your hiring pipeline and manage open roles."
      >
        {canManage && <ResumeUploadDialog onAdd={(c) => setAdded((prev) => [c, ...prev])} />}
        {canManage && (
          <Button onClick={() => toast.success("New role drafted")}>
            <Plus className="size-4" animateOnHover />
            Post a role
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open roles" value={jobOpenings.length} tone="primary" icon={<Rocket className="size-5" animateOnHover />} trendLabel="Across 5 departments" />
        <StatCard label="Total applicants" value={totalApplicants} tone="info" trend={12.5} icon={<Users2 className="size-5" />} />
        <StatCard label="In interview" value={interviewing} tone="warning" trendLabel="This week" icon={<Clock3 className="size-5" />} />
        <StatCard label="Offers out" value={offers} tone="success" trendLabel="Awaiting response" icon={<Star className="size-5" />} />
      </div>

      {/* Pipeline board */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Candidate pipeline</h2>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {stages.map((stage) => {
            const list = candidates.filter((c) => c.stage === stage.key);
            return (
              <div key={stage.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", stage.tone)} />
                    <span className="text-sm font-medium">{stage.key}</span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs tabular-nums">
                    {list.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {list.map((c) => (
                    <Card key={c.id} className="cursor-grab transition-shadow hover:shadow-md">
                      <CardContent className="space-y-2.5 p-3">
                        <div className="flex items-center gap-2.5">
                          <PersonAvatar name={c.name} hue={c.avatarHue} className="size-8" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{c.name}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {c.role}
                            </div>
                          </div>
                        </div>
                        <Stars rating={c.rating} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Badge variant="outline" className="font-normal">
                            {c.department}
                          </Badge>
                          <span>{formatDate(c.appliedOn, { month: "short", day: "numeric" })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {list.length === 0 && (
                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open roles */}
      <Card>
        <CardHeader>
          <CardTitle>Open roles</CardTitle>
          <CardDescription>Positions currently accepting applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {jobOpenings.map((job) => (
              <AccordionItem key={job.id} value={job.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-1 items-center justify-between gap-4 pr-2">
                    <div className="text-left">
                      <div className="font-medium">{job.title}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {job.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{job.type}</Badge>
                      <Badge variant="secondary" className="tabular-nums">
                        {formatNumber(job.applicants)} applicants
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Department:</span>{" "}
                      {job.department}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Open since:</span>{" "}
                      {formatDate(job.openSince)}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast("Viewing applicants")}>
                        View applicants
                      </Button>
                      <Button size="sm" onClick={() => toast.success("Role shared")}>
                        Share role
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
