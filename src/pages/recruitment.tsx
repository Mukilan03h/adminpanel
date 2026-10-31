import { toast } from "sonner";
import { Star, MapPin, Users2, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatCard } from "@/components/shared/stat-card";
import { Rocket } from "@/components/animate-ui/icons/rocket";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { candidates, jobOpenings, type CandidateStage } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/format";
import { useRbac } from "@/lib/rbac";

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

export default function RecruitmentPage() {
  const { can } = useRbac();
  const canManage = can("recruitment:manage");
  const totalApplicants = jobOpenings.reduce((s, j) => s + j.applicants, 0);
  const interviewing = candidates.filter((c) => c.stage === "Interview").length;
  const offers = candidates.filter((c) => c.stage === "Offer").length;

  return (
    <>
      <PageHeader
        title="Recruitment"
        description="Track candidates through your hiring pipeline and manage open roles."
      >
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
