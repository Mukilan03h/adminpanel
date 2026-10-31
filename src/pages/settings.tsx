import { toast } from "sonner";
import { Monitor, Moon, Sun, Shield, Smartphone, Laptop } from "lucide-react";
import {
  ThemeTogglerButton,
  ThemeTogglerButtonIcon,
} from "@/components/animate-ui/buttons/theme-toggler";
import { PageHeader } from "@/components/shared/page-header";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeSelection } from "@/lib/theme";

const themeOptions: { value: ThemeSelection; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const notifications = [
  { id: "leave", label: "Leave requests", desc: "When someone requests or updates time off", on: true },
  { id: "payroll", label: "Payroll runs", desc: "Reminders before and after each pay run", on: true },
  { id: "reviews", label: "Performance reviews", desc: "Cycle milestones and overdue reviews", on: false },
  { id: "hiring", label: "New applicants", desc: "When a candidate applies to an open role", on: true },
  { id: "digest", label: "Weekly digest", desc: "A Monday summary of org activity", on: false },
];

const sessions = [
  { device: "MacBook Pro · Chrome", where: "Bengaluru, IN", when: "Active now", icon: Laptop, current: true },
  { device: "iPhone 15 · Safari", where: "Bengaluru, IN", when: "2 hours ago", icon: Smartphone, current: false },
  { device: "Windows · Edge", where: "Mumbai, IN", when: "3 days ago", icon: Monitor, current: false },
];

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, appearance, notifications and security." />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This information is visible to your team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <PersonAvatar name="Priya Nair" hue={280} className="size-16 text-lg" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast("Upload a photo")}>
                    Change photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" defaultValue="Priya Nair" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" defaultValue="priya.nair@peoplehub.io" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Job title</Label>
                  <Input id="role" defaultValue="People Partner" />
                </div>
                <div className="grid gap-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="ist">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">India Standard Time (GMT+5:30)</SelectItem>
                      <SelectItem value="pst">Pacific Time (GMT−8)</SelectItem>
                      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="cet">Central European Time (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} defaultValue="People Partner supporting Engineering and Product. Passionate about building healthy teams." />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t">
              <Button variant="outline">Cancel</Button>
              <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how PeopleHub looks. The theme switches with a smooth wipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="grid flex-1 grid-cols-3 gap-3">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const active = theme === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTheme(opt.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                            active
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-accent",
                          )}
                        >
                          <Icon className={cn("size-5", active && "text-primary")} />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border p-3">
                    <ThemeTogglerButton
                      theme={theme}
                      resolvedTheme={resolvedTheme}
                      setTheme={setTheme}
                      modes={["light", "dark", "system"]}
                      variant="outline"
                      aria-label="Cycle theme"
                    >
                      <ThemeTogglerButtonIcon
                        light={<Sun className="size-4" />}
                        dark={<Moon className="size-4" />}
                        system={<Monitor className="size-4" />}
                      />
                    </ThemeTogglerButton>
                    <span className="text-xs text-muted-foreground">
                      Quick toggle
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="density">Compact density</Label>
                  <p className="text-xs text-muted-foreground">Tighten spacing across tables and lists.</p>
                </div>
                <Switch id="density" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce">Reduce motion</Label>
                  <p className="text-xs text-muted-foreground">Minimize animations throughout the app.</p>
                </div>
                <Switch id="reduce" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <Label htmlFor={n.id}>{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch
                    id={n.id}
                    defaultChecked={n.on}
                    onCheckedChange={(v) => toast(`${n.label} ${v ? "on" : "off"}`)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" placeholder="••••••••" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <Button onClick={() => toast.success("Password updated")}>Update password</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-success/12 text-success">
                  <Shield className="size-5" />
                </span>
                <div>
                  <div className="font-medium">Two-factor authentication</div>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>
              <Switch defaultChecked onCheckedChange={(v) => toast(`2FA ${v ? "enabled" : "disabled"}`)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <CardDescription>Devices currently signed in to your account.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {sessions.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.device} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{s.device}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.where} · {s.when}
                      </div>
                    </div>
                    {s.current ? (
                      <span className="text-xs font-medium text-success">This device</span>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => toast("Signed out device")}>
                        Sign out
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
