import { useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Award, Target, CheckCircle2, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatCard } from "@/components/shared/stat-card";
import { TrendingUp } from "@/components/animate-ui/icons/trending-up";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { employees } from "@/lib/data";

const distribution = [
  { band: "90–100", count: 38, fill: "var(--chart-3)" },
  { band: "80–89", count: 96, fill: "var(--chart-1)" },
  { band: "70–79", count: 71, fill: "var(--chart-4)" },
  { band: "60–69", count: 31, fill: "var(--chart-5)" },
  { band: "<60", count: 12, fill: "var(--muted-foreground)" },
];

const distConfig = { count: { label: "Employees" } } satisfies ChartConfig;

const competencies = ["Impact", "Collaboration", "Ownership"] as const;
const ratingLabels = ["Needs work", "Meets", "Exceeds", "Outstanding"];

const cycle = [
  { label: "Self-assessments", pct: 92 },
  { label: "Peer reviews", pct: 74 },
  { label: "Manager reviews", pct: 48 },
  { label: "Calibration", pct: 12 },
];

export default function PerformancePage() {
  const [scores, setScores] = useState<number[]>([80, 72, 88]);
  const [overall, setOverall] = useState("2");

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const topPerformers = [...employees].sort((a, b) => b.performance - a.performance).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Performance"
        description="Q3 review cycle · track scores, goals and calibration progress."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg. score" value={82} suffix="/100" tone="primary" trend={2.6} icon={<TrendingUp className="size-5" animateOnHover />} />
        <StatCard label="Reviews done" value={186} tone="success" trend={9.1} trendLabel="of 248 employees" icon={<CheckCircle2 className="size-5" />} />
        <StatCard label="Goals on track" value={78} suffix="%" tone="info" trend={3.4} icon={<Target className="size-5" />} />
        <StatCard label="Top performers" value={38} tone="warning" trendLabel="Score 90+" icon={<Award className="size-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Interactive self-assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Self-assessment</CardTitle>
            <CardDescription>Rate your competencies for this cycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {competencies.map((c, i) => (
              <div key={c} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{c}</Label>
                  <span className="text-sm font-medium tabular-nums">{scores[i]}</span>
                </div>
                <Slider
                  value={[scores[i]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) =>
                    setScores((prev) => prev.map((s, idx) => (idx === i ? v : s)))
                  }
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Overall rating</Label>
              <RadioGroup
                value={overall}
                onValueChange={setOverall}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {ratingLabels.map((label, i) => (
                  <Label
                    key={label}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value={String(i)} />
                    {label}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Computed score</span>
                <div className="text-2xl font-semibold tabular-nums">{avg}/100</div>
              </div>
              <Button onClick={() => toast.success("Self-assessment submitted")}>
                Submit review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Distribution + cycle progress */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Score distribution</CardTitle>
              <CardDescription>Across the whole organization</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={distConfig} className="h-[180px] w-full">
                <BarChart
                  data={distribution}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="band"
                    tickLine={false}
                    axisLine={false}
                    width={56}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cycle progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cycle.map((c) => (
                <div key={c.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-medium tabular-nums">{c.pct}%</span>
                  </div>
                  <Progress value={c.pct} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top performers</CardTitle>
          <CardDescription>Highest scores this cycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topPerformers.map((e, i) => (
            <div key={e.id} className="flex items-center gap-4">
              <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <PersonAvatar name={e.name} hue={e.avatarHue} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{e.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {e.title} · {e.department}
                </div>
              </div>
              <div className="flex w-40 items-center gap-2">
                <Progress value={e.performance} className="h-1.5 [&>div]:bg-success" />
                <span className="w-8 text-right text-sm font-medium tabular-nums">
                  {e.performance}
                </span>
              </div>
              {i === 0 && <Star className="size-4 fill-warning text-warning" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
