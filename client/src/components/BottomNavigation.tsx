import { Home, Presentation, BarChart3, CreditCard, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Slides",
    url: "/presentations",
    icon: Presentation,
  },
  {
    title: "Reports",
    url: "/report",
    icon: BarChart3,
  },
  {
    title: "Plan",
    url: "/pricing",
    icon: CreditCard,
  },
];

export function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden safe-area-bottom"
      data-testid="bottom-navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.url || 
            (item.url === "/dashboard" && location === "/");
          
          return (
            <Link 
              key={item.title} 
              href={item.url}
              className="flex-1"
            >
              <div 
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                data-testid={`bottom-nav-${item.title.toLowerCase()}`}
              >
                <item.icon className={`h-5 w-5 mb-1 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
