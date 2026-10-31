import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";

/** Pastel hex (no leading #) from a 0–360 hue, for a premium tinted backdrop. */
function hueToHex(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  const s = 0.68;
  const l = 0.86;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `${to(r)}${to(g)}${to(b)}`;
}

const cache = new Map<string, string>();

/** Deterministic, offline, premium avatar (SVG data URI) seeded by name + hue. */
export function avatarUri(seed: string, hue = 255): string {
  const key = `${seed}:${hue}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const uri = createAvatar(micah, {
    seed,
    size: 96,
    radius: 50,
    backgroundType: ["gradientLinear", "solid"],
    backgroundColor: [hueToHex(hue), hueToHex(hue + 25)],
  }).toDataUri();
  cache.set(key, uri);
  return uri;
}
