import { toast } from "sonner";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { Banknote, Download, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Wallet } from "@/components/animate-ui/icons/wallet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { payroll, employeeById } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

const totals = payroll.reduce(
  (acc, r) => {
    acc.base += r.base;
    acc.bonus += r.bonus;
    acc.deductions += r.deductions;
    acc.net += r.net;
    return acc;
  },
  { base: 0, bonus: 0, deductions: 0, net: 0 },
);

const processed = payroll.filter((r) => r.status === "Processed").length;
const pending = payroll.filter((r) => r.status !== "Processed").length;

export default function PayrollPage() {
  return (
    <>
      <PageHeader
        title="Payroll"
        description="October 2026 pay run · 20 employees across 8 departments."
      >
        <Button variant="outline" onClick={() => toast("Payslips exported")}>
          <Download className="size-4" /> Payslips
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Wallet className="size-4" animateOnHover />
              Run payroll
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Run October payroll?</AlertDialogTitle>
              <AlertDialogDescription>
                This will process {formatCurrency(totals.net)} in net pay for{" "}
                {payroll.length} employees. Funds settle within 2 business days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.success("Payroll run started")}>
                Confirm run
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageHeader>

      {/* Headline card with sliding number */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden bg-primary text-primary-foreground lg:col-span-1">
          <CardContent className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
              <Banknote className="size-4" /> Total net this month
            </div>
            <div className="flex items-center text-4xl font-semibold tabular-nums">
              <span>$</span>
              <SlidingNumber number={totals.net} thousandSeparator="," />
            </div>
            <p className="text-sm text-primary-foreground/80">
              {processed} processed · {pending} pending
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          <StatCard
            label="Gross base"
            value={totals.base}
            prefix="$"
            tone="info"
            trend={1.8}
            icon={<TrendingUp className="size-5" />}
          />
          <StatCard
            label="Bonuses"
            value={totals.bonus}
            prefix="$"
            tone="success"
            trend={4.2}
            icon={<TrendingUp className="size-5" />}
          />
          <StatCard
            label="Deductions"
            value={totals.deductions}
            prefix="$"
            tone="warning"
            trend={-0.6}
            icon={<TrendingDown className="size-5" />}
          />
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        <CardHeader className="border-b p-4">
          <CardTitle>Pay run detail</CardTitle>
          <CardDescription>Base, bonus and deductions per employee</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Bonus</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Deductions</TableHead>
                <TableHead className="text-right">Net pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.map((r) => {
                const e = employeeById(r.employeeId);
                if (!e) return null;
                return (
                  <TableRow key={r.employeeId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PersonAvatar name={e.name} hue={e.avatarHue} className="size-8" />
                        <div>
                          <div className="text-sm font-medium">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{e.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(r.base)}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-success sm:table-cell">
                      {r.bonus ? `+${formatCurrency(r.bonus)}` : "—"}
                    </TableCell>
                    <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                      −{formatCurrency(r.deductions)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(r.net)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(totals.base)}
                </TableCell>
                <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">
                  {formatCurrency(totals.bonus)}
                </TableCell>
                <TableCell className="hidden text-right font-medium tabular-nums sm:table-cell">
                  {formatCurrency(totals.deductions)}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(totals.net)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </Card>
    </>
  );
}
