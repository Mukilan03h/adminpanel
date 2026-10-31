import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { CalendarCheck } from "@/components/animate-ui/icons/calendar-check";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceToday, employeeById } from "@/lib/data";

const weekData = [
  { day: "Mon", present: 182, remote: 41, absent: 8 },
  { day: "Tue", present: 190, remote: 38, absent: 5 },
  { day: "Wed", present: 176, remote: 52, absent: 7 },
  { day: "Thu", present: 188, remote: 44, absent: 6 },
  { day: "Fri", present: 171, remote: 58, absent: 9 },
];

const weekConfig = {
  present: { label: "On-site", color: "var(--chart-1)" },
  remote: { label: "Remote", color: "var(--chart-2)" },
  absent: { label: "Absent", color: "var(--chart-5)" },
} satisfies ChartConfig;

const counts = attendanceToday.reduce(
  (acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);

export default function AttendancePage() {
  return (
    <>
      <PageHeader
        title="Attendance"
        description="Track clock-ins, remote days and time worked across the organization."
      >
        <Select defaultValue="today">
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="On-site today"
          value={counts.Present ?? 0}
          tone="success"
          trend={2.1}
          trendLabel="vs yesterday"
          icon={<CalendarCheck className="size-5" animateOnHover />}
        />
        <StatCard label="Remote" value={counts.Remote ?? 0} tone="info" trendLabel="Working from home" icon={<MapPin className="size-5" />} />
        <StatCard label="Late arrivals" value={counts.Late ?? 0} tone="warning" trendLabel="After 9:30 AM" icon={<Clock className="size-5" />} />
        <StatCard label="Absent" value={counts.Absent ?? 0} tone="danger" trendLabel="Unplanned" icon={<LogOut className="size-5" />} />
      </div>

      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Daily log</TabsTrigger>
          <TabsTrigger value="trends">Weekly trends</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <Card className="overflow-hidden py-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Employee</TableHead>
                    <TableHead>
                      <span className="inline-flex items-center gap-1">
                        <LogIn className="size-3.5" /> Clock in
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="inline-flex items-center gap-1">
                        <LogOut className="size-3.5" /> Clock out
                      </span>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-48">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceToday.map((row) => {
                    const e = employeeById(row.employeeId);
                    if (!e) return null;
                    return (
                      <TableRow key={row.employeeId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <PersonAvatar name={e.name} hue={e.avatarHue} className="size-8" />
                            <div>
                              <div className="text-sm font-medium">{e.name}</div>
                              <div className="text-xs text-muted-foreground">{e.department}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">{row.clockIn ?? "—"}</TableCell>
                        <TableCell className="tabular-nums">{row.clockOut ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={(row.hours / 9) * 100} className="h-1.5" />
                            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                              {row.hours}h
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>This week</CardTitle>
              <CardDescription>On-site, remote and absent per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weekConfig} className="h-[320px] w-full">
                <BarChart data={weekData} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="present" stackId="a" fill="var(--color-present)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remote" stackId="a" fill="var(--color-remote)" />
                  <Bar dataKey="absent" stackId="a" fill="var(--color-absent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
