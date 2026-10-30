import { ThemeToggler } from "@animate-ui/react/primitives/effects/theme-toggler";
import { Sun } from "@/components/animate-ui/icons/sun";
import { Moon } from "@/components/animate-ui/icons/moon";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

/**
 * Topbar theme control. Uses Animate UI's ThemeToggler, which reveals the new
 * theme with a View Transitions wipe across the whole page, then persists it
 * through our own useTheme setter.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <ThemeToggler
      theme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ effective, toggleTheme }) => {
        const isDark = effective === "dark";
        return (
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => toggleTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Moon className="size-5" animateOnHover />
            ) : (
              <Sun className="size-5" animateOnHover />
            )}
          </Button>
        );
      }}
    </ThemeToggler>
  );
}
