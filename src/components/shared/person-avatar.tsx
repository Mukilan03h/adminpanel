import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

type PersonAvatarProps = {
  name: string;
  hue?: number;
  className?: string;
};

/**
 * A deterministic, network-free avatar: colored initials derived from the
 * person's name (and optional hue). Keeps the demo stable offline.
 */
export function PersonAvatar({ name, hue = 255, className }: PersonAvatarProps) {
  return (
    <Avatar className={cn("size-9", className)}>
      <AvatarFallback
        className="font-medium text-white"
        style={{
          background: `linear-gradient(135deg, oklch(0.68 0.16 ${hue}), oklch(0.55 0.2 ${hue}))`,
        }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
