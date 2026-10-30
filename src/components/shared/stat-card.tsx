import type { ReactNode } from "react";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "info" | "danger";

const iconTone: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  danger: "bg-destructive/12 text-destructive",
};

export function StatCard({
  label,
  value,
  prefix,
  suffix,
  decimalPlaces = 0,
  trend,
  trendLabel,
  icon,
  tone = "primary",
  footer,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  tone?: Tone;
  footer?: ReactNode;
}) {
  const positive = (trend ?? 0) >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {icon && (
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                iconTone[tone],
              )}
            >
              {icon}
            </span>
          )}
        </div>

        <div className="flex items-end gap-2">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {prefix}
            <CountingNumber
              number={value}
              decimalPlaces={decimalPlaces}
              thousandSeparator=","
              inView
            />
            {suffix}
          </div>
          {typeof trend === "number" && (
            <span
              className={cn(
                "mb-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                positive
                  ? "bg-success/12 text-success"
                  : "bg-destructive/12 text-destructive",
              )}
            >
              {positive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>

        {(trendLabel || footer) && (
          <div className="text-xs text-muted-foreground">{footer ?? trendLabel}</div>
        )}
      </CardContent>
    </Card>
  );
}
