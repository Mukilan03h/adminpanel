import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navGroups } from "@/components/layout/nav";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { LogOut } from "@/components/animate-ui/icons/log-out";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { useRbac } from "@/lib/rbac";
import { ChevronsUpDown, BadgeCheck, Bell, CreditCard } from "lucide-react";

function isActivePath(pathname: string, to: string): boolean {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { can, currentUser, currentRole } = useRbac();

  const visibleGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.perm || can(i.perm)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1.5 py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-md shadow-primary/30 ring-1 ring-white/20">
            <Sparkles className="size-5" animateOnHover />
          </div>
          <div className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-sm font-bold text-transparent">
              PeopleHub
            </span>
            <span className="truncate text-xs text-muted-foreground">HRMS Suite</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.to);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="relative transition-colors data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/15 data-[active=true]:to-primary/0 data-[active=true]:font-medium data-[active=true]:text-primary data-[active=true]:before:absolute data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary"
                      >
                        <NavLink to={item.to}>
                          <Icon className="size-4 shrink-0" animateOnHover />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <PersonAvatar name={currentUser.name} hue={currentUser.hue} className="size-8 rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{currentUser.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {currentRole.name}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56 rounded-lg"
              >
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {currentUser.name.toLowerCase().replace(/[^a-z]+/g, ".")}@peoplehub.io
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <BadgeCheck className="size-4" /> Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="size-4" /> Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="size-4" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
