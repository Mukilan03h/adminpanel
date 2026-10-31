import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { avatarUri } from "@/lib/avatar";

type PersonAvatarProps = {
  name: string;
  hue?: number;
  className?: string;
};

/**
 * Premium, deterministic, network-free avatar: a seeded DiceBear illustration
 * on a hue-tinted gradient, with initials as the fallback.
 */
export function PersonAvatar({ name, hue = 255, className }: PersonAvatarProps) {
  return (
    <Avatar className={cn("size-9 ring-2 ring-background shadow-sm", className)}>
      <AvatarImage src={avatarUri(name, hue)} alt={name} />
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
