import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { motion } from "motion/react";
import { AvatarGroup, AvatarGroupTooltip } from "@animate-ui/react/primitives/avatar-group";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Plus } from "@/components/animate-ui/icons/plus";
import { Users } from "@/components/animate-ui/icons/users";
import { Rocket } from "@/components/animate-ui/icons/rocket";
import { CalendarCheck } from "@/components/animate-ui/icons/calendar-check";
import { TrendingUp } from "@/components/animate-ui/icons/trending-up";
import {
  activity,
  attendanceToday,
  departments,
  employees,
  headcountSeries,
  upcoming,
} from "@/lib/data";
import { initials } from "@/lib/format";
import { useRbac } from "@/lib/rbac";

const headcountConfig = {
  headcount: { label: "Headcount", color: "var(--chart-1)" },
  hires: { label: "Hires", color: "var(--chart-3)" },
} satisfies ChartConfig;

const deptConfig = {
  headcount: { label: "Headcount" },
} satisfies ChartConfig;

const attendanceBuckets = (() => {
  const counts = { Present: 0, Remote: 0, Late: 0, Absent: 0, Leave: 0 };
  for (const row of attendanceToday) counts[row.status]++;
  const total = attendanceToday.length;
  return (Object.entries(counts) as [keyof typeof counts, number][]).map(
    ([status, count]) => ({ status, count, pct: Math.round((count / total) * 100) }),
  );
})();

const attendanceTone: Record<string, string> = {
  Present: "[&>div]:bg-success",
  Remote: "[&>div]:bg-info",
  Late: "[&>div]:bg-warning",
  Absent: "[&>div]:bg-destructive",
  Leave: "[&>div]:bg-muted-foreground",
};

export default function DashboardPage() {
  const { can } = useRbac();
  const team = employees.slice(0, 7);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-5 p-6 text-white shadow-lg shadow-primary/20"
      >
        <StarsBackground className="absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Good morning, Priya 👋</h1>
            <p className="max-w-xl text-sm text-white/85">
              Here’s what’s happening across your organization today, Friday, October 30.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select defaultValue="30d">
              <SelectTrigger className="w-[150px] border-white/25 bg-white/15 text-white backdrop-blur hover:bg-white/25">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="qtr">This quarter</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            {can("employees:create") && (
              <Button className="bg-white text-primary hover:bg-white/90 hover:brightness-100">
                <Plus className="size-4" animateOnHover />
                Add employee
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total headcount"
          value={248}
          trend={3.2}
          trendLabel="+8 vs last month"
          tone="primary"
          icon={<Users className="size-5" animateOnHover />}
        />
        <StatCard
          label="Open positions"
          value={5}
          trend={-1.4}
          trendLabel="2 in final round"
          tone="info"
          icon={<Rocket className="size-5" animateOnHover />}
        />
        <StatCard
          label="Attendance rate"
          value={94.2}
          suffix="%"
          decimalPlaces={1}
          trend={1.1}
          trendLabel="Today across all teams"
          tone="success"
          icon={<CalendarCheck className="size-5" animateOnHover />}
        />
        <StatCard
          label="Avg. performance"
          value={82}
          suffix="/100"
          trend={2.6}
          trendLabel="Q3 review cycle"
          tone="warning"
          icon={<TrendingUp className="size-5" animateOnHover />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Headcount growth</CardTitle>
            <CardDescription>Monthly headcount and new hires over the last year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={headcountConfig} className="h-[280px] w-full">
              <AreaChart data={headcountSeries} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillHeadcount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-headcount)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-headcount)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-hires)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-hires)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="hires"
                  type="natural"
                  fill="url(#fillHires)"
                  stroke="var(--color-hires)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="headcount"
                  type="natural"
                  fill="url(#fillHeadcount)"
                  stroke="var(--color-headcount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>By department</CardTitle>
            <CardDescription>Headcount distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={deptConfig}
              className="mx-auto aspect-square max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie
                  data={departments.map((d) => ({
                    name: d.name,
                    value: d.headcount,
                    fill: `oklch(0.65 0.17 ${d.hue})`,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  strokeWidth={3}
                >
                  {departments.map((d) => (
                    <Cell key={d.name} fill={`oklch(0.65 0.17 ${d.hue})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {departments.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ background: `oklch(0.65 0.17 ${d.hue})` }}
                  />
                  <span className="truncate text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium tabular-nums">{d.headcount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance + hires bar + team */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today’s attendance</CardTitle>
            <CardDescription>{attendanceToday.length} employees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {attendanceBuckets.map((b) => (
              <div key={b.status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{b.status}</span>
                  <span className="font-medium tabular-nums">{b.count}</span>
                </div>
                <Progress value={b.pct} className={attendanceTone[b.status]} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Hiring vs. attrition</CardTitle>
            <CardDescription>Net movement per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                hires: { label: "Hires", color: "var(--chart-3)" },
                attrition: { label: "Attrition", color: "var(--chart-5)" },
              }}
              className="h-[220px] w-full"
            >
              <BarChart data={headcountSeries.slice(-6)} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="hires" fill="var(--color-hires)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attrition" fill="var(--color-attrition)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your team</CardTitle>
            <CardDescription>People Ops · {team.length} members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AvatarGroup className="h-11 -space-x-3" invertOverlap>
              {team.map((e) => (
                <div
                  key={e.id}
                  className="flex size-11 items-center justify-center rounded-full border-3 border-background text-xs font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.68 0.16 ${e.avatarHue}), oklch(0.55 0.2 ${e.avatarHue}))`,
                  }}
                >
                  {initials(e.name)}
                  <AvatarGroupTooltip className="rounded-md bg-foreground px-2.5 py-1 text-xs text-background">
                    {e.name}
                  </AvatarGroupTooltip>
                </div>
              ))}
            </AvatarGroup>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open roles</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending approvals</span>
                <StatusBadge status="4 pending" tone="warning" dot={false} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity + events */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest updates across the org</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1 text-sm">
                  <span className="font-medium">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.message}</span>
                  <div className="text-xs text-muted-foreground/80">{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Events and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex size-10 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CalendarCheck className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.when}</div>
                </div>
                <StatusBadge status={e.tag} tone="accent" dot={false} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
