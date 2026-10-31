import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Heart, Loader2, Mail, ChevronRight } from "lucide-react";

// Animate UI — signature primitives
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { GradientText } from "@animate-ui/react/primitives/texts/gradient";
import { TypingText } from "@animate-ui/react/primitives/texts/typing";
import { HighlightText } from "@animate-ui/react/primitives/texts/highlight";
import { RollingText } from "@animate-ui/react/primitives/texts/rolling";
import { Shine } from "@animate-ui/react/primitives/effects/shine";
import { Tilt, TiltContent } from "@animate-ui/react/primitives/effects/tilt";
import {
  Highlight,
  HighlightItem,
} from "@animate-ui/react/primitives/effects/highlight";
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from "@animate-ui/react/primitives/avatar-group";
import {
  Tabs as ATabs,
  TabsContent as ATabsContent,
  TabsContents as ATabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList as ATabsList,
  TabsTrigger as ATabsTrigger,
} from "@animate-ui/react/primitives/tabs";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import {
  FlipButton,
  FlipButtonBack,
  FlipButtonFront,
} from "@/components/animate-ui/buttons/flip";
import { GradientBackground } from "@/components/animate-ui/backgrounds/gradient";
import { StarsBackground } from "@/components/animate-ui/backgrounds/stars";

// Animated icons
import { Bell } from "@/components/animate-ui/icons/bell";
import { Search } from "@/components/animate-ui/icons/search";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { Rocket } from "@/components/animate-ui/icons/rocket";
import { TrendingUp } from "@/components/animate-ui/icons/trending-up";
import { Wallet } from "@/components/animate-ui/icons/wallet";
import { Users } from "@/components/animate-ui/icons/users";
import { Plus } from "@/components/animate-ui/icons/plus";

// shadcn/ui — animated by Animate UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { initials } from "@/lib/format";
import { employees } from "@/lib/data";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Card>
        <CardContent className="flex flex-wrap items-start gap-x-8 gap-y-6">
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

function Demo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function ComponentsPage() {
  const [checks, setChecks] = useState({ a: true, b: false, c: true });
  const [slider, setSlider] = useState([40]);
  const [radio, setRadio] = useState("standard");
  const [sw, setSw] = useState(true);
  const [counter, setCounter] = useState(1280);

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <GradientText className="text-2xl font-semibold" text="Component library" />
            <Sparkles className="size-6 text-primary" animateOnHover />
          </span>
        }
        description="Every building block in PeopleHub — Animate UI primitives on top of shadcn/ui, shown with their options in light and dark mode."
      />

      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <TypingText
          className="font-medium text-foreground"
          text="Beautiful, accessible components — animated by Motion."
        />
      </div>

      {/* ---------------- Animate UI signatures ---------------- */}
      <Section
        title="Animate UI — motion primitives"
        description="The signature animated pieces that give the app life."
      >
        <Demo label="Counting number">
          <span className="text-3xl font-semibold tabular-nums">
            <CountingNumber number={48213} thousandSeparator="," inView />
          </span>
        </Demo>
        <Demo label="Sliding number">
          <span className="text-3xl font-semibold tabular-nums">
            <SlidingNumber number={counter} thousandSeparator="," />
          </span>
          <Button size="sm" variant="outline" onClick={() => setCounter((c) => c + 37)}>
            +37
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCounter((c) => Math.max(0, c - 128))}>
            −128
          </Button>
        </Demo>
        <Demo label="Highlight text">
          <HighlightText
            className="rounded px-1 text-lg font-semibold"
            text="Shipped on time"
            inView
          />
        </Demo>
        <Demo label="Rolling text">
          <RollingText className="text-lg font-semibold" text="PeopleHub" />
        </Demo>
        <Demo label="Shine">
          <Shine asChild loop loopDelay={1200}>
            <Button>
              <Sparkles className="size-4" /> Upgrade plan
            </Button>
          </Shine>
        </Demo>
        <Demo label="Tilt card">
          <Tilt maxTilt={12}>
            <TiltContent className="flex h-24 w-40 flex-col justify-end rounded-xl bg-gradient-to-br from-primary to-chart-2 p-3 text-primary-foreground shadow-lg">
              <span className="text-sm font-semibold">Tilt me</span>
              <span className="text-xs opacity-80">Follows your cursor</span>
            </TiltContent>
          </Tilt>
        </Demo>
        <Demo label="Avatar group">
          <AvatarGroup className="h-10 -space-x-3" invertOverlap>
            {employees.slice(0, 6).map((e) => (
              <div
                key={e.id}
                className="flex size-10 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white"
                style={{ background: `linear-gradient(135deg, oklch(0.68 0.16 ${e.avatarHue}), oklch(0.55 0.2 ${e.avatarHue}))` }}
              >
                {initials(e.name)}
                <AvatarGroupTooltip className="rounded-md bg-foreground px-2 py-1 text-xs text-background">
                  {e.name}
                </AvatarGroupTooltip>
              </div>
            ))}
          </AvatarGroup>
        </Demo>
        <Demo label="Highlight (segmented)">
          <Highlight
            defaultValue="day"
            className="rounded-md bg-background shadow-sm"
            containerClassName="flex rounded-lg bg-muted p-1"
            mode="parent"
          >
            {["Day", "Week", "Month"].map((t) => (
              <button
                key={t}
                data-value={t.toLowerCase()}
                className="relative z-10 rounded-md px-3 py-1.5 text-sm font-medium data-[active=true]:text-foreground"
              >
                {t}
              </button>
            ))}
          </Highlight>
        </Demo>
      </Section>

      {/* ---------------- Animate UI tabs ---------------- */}
      <Section
        title="Animated tabs"
        description="Animate UI's own tabs: the highlight glides and panels slide."
      >
        <ATabs defaultValue="overview" className="w-full max-w-md">
          <TabsHighlight className="absolute inset-0 rounded-md bg-background shadow-sm">
            <ATabsList className="flex rounded-lg bg-muted p-1">
              {["overview", "activity", "settings"].map((v) => (
                <TabsHighlightItem key={v} value={v} className="flex-1">
                  <ATabsTrigger
                    value={v}
                    className="relative z-10 w-full rounded-md px-3 py-1.5 text-sm font-medium capitalize text-muted-foreground data-[state=active]:text-foreground"
                  >
                    {v}
                  </ATabsTrigger>
                </TabsHighlightItem>
              ))}
            </ATabsList>
          </TabsHighlight>
          <ATabsContents className="mt-3">
            <ATabsContent value="overview" className="text-sm text-muted-foreground">
              A quick summary of the workspace and its people.
            </ATabsContent>
            <ATabsContent value="activity" className="text-sm text-muted-foreground">
              The latest changes, requests and approvals.
            </ATabsContent>
            <ATabsContent value="settings" className="text-sm text-muted-foreground">
              Preferences, appearance and notification controls.
            </ATabsContent>
          </ATabsContents>
        </ATabs>
      </Section>

      {/* ---------------- Buttons ---------------- */}
      <Section title="Buttons" description="Variants, sizes, states — plus Animate UI's own buttons.">
        <Demo label="Variants">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </Demo>
        <Demo label="Sizes">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Settings">
            <Settings className="size-4" animateOnHover />
          </Button>
        </Demo>
        <Demo label="With icon & state">
          <Button>
            <Mail className="size-4" /> Email
          </Button>
          <Button disabled>
            <Loader2 className="size-4 animate-spin" /> Loading
          </Button>
          <Button variant="outline">
            <Heart className="size-4" /> Like
          </Button>
        </Demo>
        <Demo label="Animate UI buttons">
          <LiquidButton>Liquid</LiquidButton>
          <FlipButton from="top">
            <FlipButtonFront>Hover me</FlipButtonFront>
            <FlipButtonBack>Let’s go</FlipButtonBack>
          </FlipButton>
        </Demo>
      </Section>

      {/* ---------------- Form controls ---------------- */}
      <Section title="Form controls" description="Inputs, selection and range controls.">
        <Demo label="Text fields">
          <div className="grid w-60 gap-2">
            <Label htmlFor="demo-input">Email</Label>
            <Input id="demo-input" type="email" placeholder="you@company.com" />
          </div>
          <div className="grid w-60 gap-2">
            <Label htmlFor="demo-ta">Message</Label>
            <Textarea id="demo-ta" placeholder="Type here…" rows={2} />
          </div>
          <div className="grid w-52 gap-2">
            <Label>Department</Label>
            <Select defaultValue="eng">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">Engineering</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Demo>
        <Demo label="Checkbox">
          {(["a", "b", "c"] as const).map((k) => (
            <Label key={k} className="flex items-center gap-2 font-normal">
              <Checkbox
                checked={checks[k]}
                onCheckedChange={(v) => setChecks((p) => ({ ...p, [k]: Boolean(v) }))}
              />
              Option {k.toUpperCase()}
            </Label>
          ))}
        </Demo>
        <Demo label="Radio group">
          <RadioGroup value={radio} onValueChange={setRadio} className="flex gap-4">
            {["standard", "priority", "express"].map((v) => (
              <Label key={v} className="flex items-center gap-2 font-normal capitalize">
                <RadioGroupItem value={v} /> {v}
              </Label>
            ))}
          </RadioGroup>
        </Demo>
        <Demo label="Switch">
          <Label className="flex items-center gap-2 font-normal">
            <Switch checked={sw} onCheckedChange={setSw} /> Notifications {sw ? "on" : "off"}
          </Label>
        </Demo>
        <Demo label="Slider">
          <div className="w-64">
            <Slider value={slider} onValueChange={setSlider} max={100} step={1} />
            <div className="mt-1 text-xs text-muted-foreground">Value: {slider[0]}</div>
          </div>
        </Demo>
      </Section>

      {/* ---------------- Data display ---------------- */}
      <Section title="Data display" description="Badges, avatars, progress and placeholders.">
        <Demo label="Badges">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </Demo>
        <Demo label="Status badges">
          <StatusBadge status="Active" />
          <StatusBadge status="Pending" />
          <StatusBadge status="On leave" />
          <StatusBadge status="Rejected" />
          <StatusBadge status="Offer" />
        </Demo>
        <Demo label="Avatars">
          <Avatar>
            <AvatarFallback className="bg-primary/15 text-primary">PN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className="bg-chart-3/20 text-chart-3">MC</AvatarFallback>
          </Avatar>
          <Avatar className="size-11">
            <AvatarFallback className="bg-chart-5/20 text-chart-5">LO</AvatarFallback>
          </Avatar>
        </Demo>
        <Demo label="Progress">
          <div className="w-56 space-y-2">
            <Progress value={30} />
            <Progress value={66} className="[&>div]:bg-success" />
            <Progress value={90} className="[&>div]:bg-warning" />
          </div>
        </Demo>
        <Demo label="Skeleton">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </Demo>
      </Section>

      {/* ---------------- Overlays ---------------- */}
      <Section title="Overlays & feedback" description="Dialogs, sheets, menus, tooltips and toasts.">
        <Demo label="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a teammate</DialogTitle>
                <DialogDescription>Send an invitation to join your workspace.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="invite">Email</Label>
                <Input id="invite" placeholder="name@company.com" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={() => toast.success("Invitation sent")}>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Demo>
        <Demo label="Alert dialog">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => toast("Deleted")}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Demo>
        <Demo label="Sheet">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Panel title</SheetTitle>
                <SheetDescription>A side panel that slides in with Motion.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Demo>
        <Demo label="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open popover</Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm">
              Popovers float above the page and animate on open.
            </PopoverContent>
          </Popover>
        </Demo>
        <Demo label="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Compact mode</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Demo>
        <Demo label="Tooltip">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Notifications">
                <Bell className="size-4" animateOnHover />
              </Button>
            </TooltipTrigger>
            <TooltipContent>You have 6 notifications</TooltipContent>
          </Tooltip>
        </Demo>
        <Demo label="Toasts">
          <Button variant="outline" onClick={() => toast.success("Saved successfully")}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning("Heads up")}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast("Plain message")}>
            Message
          </Button>
        </Demo>
      </Section>

      {/* ---------------- Navigation & disclosure ---------------- */}
      <Section title="Navigation & disclosure" description="Tabs, accordions, breadcrumbs and pagination.">
        <Demo label="Tabs (shadcn)">
          <Tabs defaultValue="t1" className="w-72">
            <TabsList>
              <TabsTrigger value="t1">Account</TabsTrigger>
              <TabsTrigger value="t2">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="t1" className="pt-2 text-sm text-muted-foreground">
              Manage your account details here.
            </TabsContent>
            <TabsContent value="t2" className="pt-2 text-sm text-muted-foreground">
              Change your password here.
            </TabsContent>
          </Tabs>
        </Demo>
        <Demo label="Accordion">
          <Accordion type="single" collapsible className="w-72">
            <AccordionItem value="a1">
              <AccordionTrigger>What is PeopleHub?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                An HRMS suite built with Animate UI and shadcn/ui.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="a2">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes — the primitives keep their Radix accessibility.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Demo>
        <Demo label="Breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">People</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Priya Nair</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Demo>
        <Demo label="Pagination">
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Demo>
      </Section>

      {/* ---------------- Animated icons ---------------- */}
      <Section title="Animated icons" description="Hover any icon to play its animation.">
        <Demo label="Lucide, animated">
          {[Bell, Search, Settings, Sparkles, Rocket, TrendingUp, Wallet, Users, Plus].map(
            (Icon, i) => (
              <div
                key={i}
                className="flex size-11 items-center justify-center rounded-lg border bg-card text-foreground transition-colors hover:bg-accent"
              >
                <Icon className="size-5" animateOnHover />
              </div>
            ),
          )}
        </Demo>
      </Section>

      {/* ---------------- Backgrounds ---------------- */}
      <Section title="Animated backgrounds" description="Drop-in canvases for heroes and empty states.">
        <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl border">
          <GradientBackground className="absolute inset-0 bg-gradient-to-br from-primary via-chart-2 to-chart-5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-white drop-shadow">Gradient</span>
          </div>
        </div>
        <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl border bg-neutral-950 text-white">
          <StarsBackground className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 text-lg font-semibold">
              <ChevronRight className="size-4" /> Stars
            </span>
          </div>
        </div>
      </Section>

      <Separator />
      <p className="pb-4 text-center text-sm text-muted-foreground">
        Built with{" "}
        <a className="font-medium text-primary hover:underline" href="https://animate-ui.com">
          Animate UI
        </a>{" "}
        · shadcn/ui · Tailwind CSS v4 · Motion
      </p>
    </>
  );
}
