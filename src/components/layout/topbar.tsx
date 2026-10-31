import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "@/components/animate-ui/icons/bell";
import { Search } from "@/components/animate-ui/icons/search";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserSwitcher } from "@/components/layout/user-switcher";
import { titleForPath } from "@/components/layout/nav";
import { activity } from "@/lib/data";
import { Kbd } from "@/components/shared/kbd";

export function Topbar() {
  const { pathname } = useLocation();
  const title = titleForPath(pathname);
  const isDashboard = pathname === "/";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />

      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">PeopleHub</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {isDashboard ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbPage>{title}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <UserSwitcher />
        {/* Search */}
        <button
          type="button"
          onClick={() => {}}
          className="hidden items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex"
        >
          <Search className="size-4" animateOnHover />
          <span>Search…</span>
          <Kbd className="ml-6">⌘K</Kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Search"
          onClick={() => {}}
        >
          <Search className="size-5" animateOnHover />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-5" animateOnHover />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-xs font-medium text-primary">
                {activity.length} new
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activity.slice(0, 5).map((a) => (
              <DropdownMenuItem key={a.id} className="flex-col items-start gap-0.5 py-2">
                <span className="text-sm">
                  <span className="font-medium">{a.actor}</span> {a.message}
                </span>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}
