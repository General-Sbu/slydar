import { Home, Presentation, BarChart3, LogOut, Settings, LayoutTemplate } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/authUtils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const RandIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold text-center leading-none ${className}`} style={{ fontFamily: 'serif' }}>R</span>
);

const menuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "My Presentations",
    url: "/presentations",
    icon: Presentation,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: LayoutTemplate,
  },
  {
    title: "Report",
    url: "/report",
    icon: BarChart3,
  },
  {
    title: "My Plan",
    url: "/pricing",
    icon: RandIcon,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/80">
      <SidebarHeader className="p-5">
        <Link href="/dashboard">
          <Logo showText={true} />
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url === "/dashboard" && location === "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="h-10 rounded-xl transition-smooth"
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4 opacity-50" />
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/50">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
              {user?.firstName?.[0] ?? user?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" data-testid="sidebar-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.firstName ?? user?.username ?? "User"}
            </p>
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate" data-testid="sidebar-user-email">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout}
              className="h-10 rounded-xl transition-smooth"
              data-testid="button-sidebar-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
