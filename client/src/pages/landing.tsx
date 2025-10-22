import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import AuthForm from "@/components/AuthForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { useState } from "react";
import { Menu, BookOpen, DollarSign, ArrowRight, LogIn } from "lucide-react";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/library">
                <Button variant="ghost" data-testid="button-library">
                  Library
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" data-testid="button-pricing">
                  Pricing
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="ghost" data-testid="button-join-presentation">
                  Join Presentation
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowAuth(true)} data-testid="button-login">
                Sign In
              </Button>
              <Button onClick={() => setShowAuth(true)} data-testid="button-get-started-nav">
                Get Started
              </Button>
              <ThemeToggle />
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
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
                    <Link href="/join">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2" 
                        data-testid="button-join-presentation-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Join Presentation
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2" 
                      onClick={() => {
                        setShowAuth(true);
                        setMobileMenuOpen(false);
                      }} 
                      data-testid="button-login-mobile"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button 
                      className="w-full gap-2" 
                      onClick={() => {
                        setShowAuth(true);
                        setMobileMenuOpen(false);
                      }} 
                      data-testid="button-get-started-mobile"
                    >
                      Get Started
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>
        {showAuth ? (
          <section className="py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold">
                  Welcome to <span className="gradient-text">Slidr</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Sign in or create an account to get started
                </p>
              </div>
              <AuthForm />
              <Button 
                variant="ghost" 
                onClick={() => setShowAuth(false)}
                data-testid="button-back"
              >
                Back to Home
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="py-20 lg:py-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8">
                  <h1 className="text-5xl lg:text-7xl font-bold">
                    Interactive Presentations
                    <span className="gradient-text block">Made Simple</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Engage your audience with real-time polls, word clouds, and interactive Q&A
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => setShowAuth(true)} size="lg" data-testid="button-get-started">
                      Get Started
                    </Button>
                    <Link href="/join">
                      <Button variant="outline" size="lg" data-testid="button-join">
                        Join Presentation
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              © 2024 Slidr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
