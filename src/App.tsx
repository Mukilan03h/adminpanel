import { Button, useTheme } from "@heroui/react";

export default function App() {
  const { resolvedTheme, setTheme } = useTheme("system");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-2xl font-semibold">PeopleHub HRMS</h1>
      <Button
        onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        Toggle theme (now: {resolvedTheme})
      </Button>
    </main>
  );
}
