import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  success:
    "bg-success/12 text-success border-success/25 dark:bg-success/15",
  warning:
    "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/15 dark:text-warning",
  danger:
    "bg-destructive/12 text-destructive border-destructive/25 dark:bg-destructive/18",
  info: "bg-info/12 text-info border-info/25 dark:bg-info/15",
  accent: "bg-primary/12 text-primary border-primary/25 dark:bg-primary/18",
};

/** Map any domain status string to a tone so colors stay consistent. */
export function toneForStatus(status: string): Tone {
  const s = status.toLowerCase();
  if (["active", "approved", "present", "processed", "hired"].includes(s)) return "success";
  if (["pending", "late", "screening", "probation", "remote"].includes(s)) return "warning";
  if (["rejected", "absent", "hold", "offboarding"].includes(s)) return "danger";
  if (["on leave", "leave", "interview", "applied"].includes(s)) return "info";
  if (["offer"].includes(s)) return "accent";
  return "neutral";
}

export function StatusBadge({
  status,
  tone,
  className,
  dot = true,
}: {
  status: string;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  const resolved = tone ?? toneForStatus(status);
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full font-medium", toneClasses[resolved], className)}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", {
            "bg-success": resolved === "success",
            "bg-warning": resolved === "warning",
            "bg-destructive": resolved === "danger",
            "bg-info": resolved === "info",
            "bg-primary": resolved === "accent",
            "bg-muted-foreground": resolved === "neutral",
          })}
        />
      )}
      {status}
    </Badge>
  );
}
