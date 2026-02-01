import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Presentation, BarChart3, LogOut, LayoutTemplate } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/authUtils";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const RandIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold text-center leading-none ${className}`} style={{ fontFamily: 'serif' }}>R</span>
);

const mobileMenuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "My Presentations", url: "/presentations", icon: Presentation },
  { title: "Templates", url: "/templates", icon: LayoutTemplate },
  { title: "Report", url: "/report", icon: BarChart3 },
  { title: "My Plan", url: "/pricing", icon: RandIcon },
];

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:flex">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="hidden md:flex" />
            <div className="md:hidden flex items-center justify-between w-full">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="p-5 border-b">
                    <SheetTitle className="text-left">
                      <Logo showText={true} />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-[calc(100%-5rem)]">
                    <nav className="flex-1 p-4 space-y-1">
                      {mobileMenuItems.map((item) => {
                        const isActive = location === item.url || 
                          (item.url === "/dashboard" && location === "/");
                        return (
                          <Link 
                            key={item.title} 
                            href={item.url}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div 
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                isActive 
                                  ? "bg-primary/10 text-primary font-medium" 
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                              data-testid={`mobile-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.title}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/50 mb-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                            {user?.firstName?.[0] ?? user?.username?.[0]?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user?.firstName ?? user?.username ?? "User"}
                          </p>
                          {user?.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                        onClick={() => { setMobileMenuOpen(false); logout(); }}
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Logo size="sm" />
              <div className="w-9" />
            </div>
          </header>
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>
        </SidebarInset>
      </div>
      <BottomNavigation />
    </SidebarProvider>
  );
}
