import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import { Link } from "wouter";
import { login } from "@/lib/authUtils";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            
            <div className="flex items-center gap-4">
              <Link href="/join">
                <Button variant="ghost" data-testid="button-join-presentation">
                  Join Presentation
                </Button>
              </Link>
              <Button variant="outline" onClick={login} data-testid="button-login">
                Sign In
              </Button>
              <Button onClick={login} data-testid="button-get-started-nav">
                Get Started
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        
        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Engage
              <span className="gradient-text block">Your Audience?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of presenters creating interactive experiences
            </p>
            <Button onClick={login} size="lg" className="gap-2" data-testid="button-start-free">
              Start Creating for Free
            </Button>
          </div>
        </section>
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
