import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, ArrowLeft, Menu, BookOpen, DollarSign } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "./Logo";
import { useNotification } from "@/hooks/useNotification";

export default function JoinPresentation() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const [isChecking, setIsChecking] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 3) return;
    
    setIsChecking(true);
    try {
      const res = await fetch(`/api/sessions/code/${code.toUpperCase()}`);
      if (res.ok) {
        const session = await res.json();
        if (session.isActive) {
          setLocation(`/audience/${code.toUpperCase()}`);
        } else {
          showNotification("This presentation session has ended", "error");
        }
      } else {
        showNotification("No active presentation found with this code", "error");
      }
    } catch (error) {
      showNotification("Failed to join presentation", "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="transition-smooth"
                onClick={() => setLocation('/')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo />
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/library">
                <Button variant="ghost" className="transition-smooth" data-testid="button-library">
                  Library
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="transition-smooth" data-testid="button-pricing">
                  Pricing
                </Button>
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    <Link href="/library">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2" 
                        data-testid="button-library-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        Library
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2" 
                        data-testid="button-pricing-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <DollarSign className="h-4 w-4" />
                        Pricing
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-20 -left-20 animate-float" />
        <div className="absolute w-80 h-80 bg-accent/20 rounded-full blur-3xl bottom-10 right-0 animate-float-delayed" />
        
        <Card className="w-full max-w-md border-0 bg-card/80 backdrop-blur animate-scale-in relative z-10">
          <CardHeader className="space-y-4 text-center pb-2">
            <CardTitle className="text-4xl font-bold tracking-tight">Join Presentation</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter the code provided by your presenter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <Input
              placeholder="ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-3xl font-mono tracking-widest h-16 bg-muted/50 border-0 focus:bg-muted transition-smooth"
              maxLength={6}
              data-testid="input-room-code"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            <Button 
              size="lg" 
              className="w-full gap-2 h-12 text-base transition-smooth hover-glow"
              onClick={handleJoin}
              disabled={code.length < 3 || isChecking}
              data-testid="button-join"
            >
              {isChecking ? "Checking..." : "Join Now"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
