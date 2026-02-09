import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import AuthForm from "@/components/AuthForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { Menu, BookOpen, ArrowRight, LogIn, Sparkles, Users, BarChart3, MessageCircle, Presentation, Upload, Zap, Play, Circle, GraduationCap, Briefcase } from "lucide-react";

const RandIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold text-center leading-none ${className}`} style={{ fontFamily: 'serif' }}>R</span>
);
import { useQuery } from "@tanstack/react-query";

interface FeaturedPresentation {
  id: string;
  title: string;
  slideCount: number;
  presenterName: string;
  previewSlide: {
    id: string;
    backgroundColor: string;
    backgroundImage: string | null;
  } | null;
}

function FloatingShape({ className, delay = "0s" }: { className?: string; delay?: string }) {
  return (
    <div 
      className={`absolute rounded-full opacity-60 blur-3xl animate-float ${className}`}
      style={{ animationDelay: delay }}
    />
  );
}

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const searchString = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get('auth') === 'true') {
      setShowAuth(true);
    }
  }, [searchString]);

  const { data: featuredPresentations = [] } = useQuery<FeaturedPresentation[]>({
    queryKey: ['/api/featured-presentations'],
    enabled: !showAuth
  });

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Logo />
            
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/education">
                <Button variant="ghost" className="transition-smooth" data-testid="button-education">
                  Education
                </Button>
              </Link>
              <Link href="/business">
                <Button variant="ghost" className="transition-smooth" data-testid="button-business">
                  Business
                </Button>
              </Link>
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
              <Link href="/join">
                <Button variant="ghost" className="transition-smooth" data-testid="button-join-presentation">
                  Join Presentation
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowAuth(true)} className="transition-smooth ml-2" data-testid="button-login">
                Sign In
              </Button>
              <Button onClick={() => setShowAuth(true)} className="transition-smooth" data-testid="button-get-started-nav">
                Get Started
              </Button>
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
                    <Link href="/education">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2" 
                        data-testid="button-education-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <GraduationCap className="h-4 w-4" />
                        Education
                      </Button>
                    </Link>
                    <Link href="/business">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2" 
                        data-testid="button-business-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="h-4 w-4" />
                        Business
                      </Button>
                    </Link>
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
                        <RandIcon className="h-4 w-4" />
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
          <section className="py-20 lg:py-32 relative">
            <div className="absolute inset-0 gradient-mesh pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8 relative z-10">
              <div className="text-center space-y-4 animate-fade-in">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Welcome to <span className="gradient-text">Slydar</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Sign in or create an account to get started
                </p>
              </div>
              <div className="animate-scale-in">
                <AuthForm />
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowAuth(false)}
                className="transition-smooth"
                data-testid="button-back"
              >
                Back to Home
              </Button>
            </div>
          </section>
        ) : (
          <>
            {/* Hero Section with Abstract Shapes */}
            <section className="relative py-24 lg:py-40 overflow-hidden">
              <div className="absolute inset-0 gradient-mesh pointer-events-none" />
              <FloatingShape className="w-96 h-96 bg-primary/20 -top-20 -left-20" delay="0s" />
              <FloatingShape className="w-80 h-80 bg-accent/30 top-40 right-0" delay="2s" />
              <FloatingShape className="w-64 h-64 bg-chart-5/20 bottom-0 left-1/3" delay="4s" />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
                    <Sparkles className="w-4 h-4" />
                    Real-time audience engagement
                  </div>
                  
                  <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight animate-slide-up">
                    Make every presentation
                    <span className="gradient-text block mt-2" style={{ marginBottom: "50px" }}>unforgettable</span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in font-light" style={{ animationDelay: "0.2s" }}>
                    Create interactive presentations with live polls, Q&A, word clouds, and real-time analytics. 
                    Your audience participates instantly.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <Button 
                      onClick={() => setShowAuth(true)} 
                      size="lg" 
                      className="text-lg px-8 py-6 transition-smooth hover-glow"
                      data-testid="button-get-started"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Creating
                    </Button>
                    <Link href="/join">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="text-lg px-8 py-6 transition-smooth"
                        data-testid="button-join"
                      >
                        Join a Presentation
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
                    <div className="flex items-center gap-2">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      No downloads required
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      Free to start
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      Works everywhere
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-24 lg:py-32 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-20">
                  <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
                    Everything you need
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                    Powerful features designed to make every presentation interactive
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { icon: Zap, title: "Real-time Interaction", description: "Live polls, quizzes, and instant feedback with responses updating in real-time.", color: "primary" },
                    { icon: MessageCircle, title: "Live Q&A", description: "Collect anonymous questions and let participants upvote the most important topics.", color: "chart-2" },
                    { icon: BarChart3, title: "Detailed Analytics", description: "Track engagement metrics, participant responses, and presentation performance.", color: "chart-3" },
                    { icon: Upload, title: "Import PPT & PDF", description: "Bring existing presentations to life. Import files and add interactive elements.", color: "chart-4" },
                    { icon: Presentation, title: "Screen Casting", description: "Present on external displays using the Web Presentation API seamlessly.", color: "chart-5" },
                    { icon: Users, title: "Easy Access", description: "Participants join with a simple room code. No accounts, no downloads, no friction.", color: "primary" },
                  ].map((feature, index) => (
                    <Card 
                      key={feature.title}
                      className="group border-0 bg-card/50 hover:bg-card transition-smooth hover-lift cursor-default overflow-visible"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <CardContent className="p-8 space-y-4">
                        <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center transition-smooth group-hover:scale-110`}>
                          <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Presentations Section */}
            {featuredPresentations.length > 0 && (
              <section className="py-24 lg:py-32 relative">
                <div className="absolute inset-0 gradient-hero pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="text-center space-y-4 mb-16">
                    <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
                      Explore the library
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                      Get inspired by presentations from our community
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {featuredPresentations.map((presentation, index) => (
                      <Card 
                        key={presentation.id} 
                        className="group cursor-pointer overflow-hidden border-0 bg-card/50 hover:bg-card transition-smooth hover-lift"
                        onClick={() => navigate(`/library/${presentation.id}`)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        data-testid={`card-featured-${presentation.id}`}
                      >
                        <div 
                          className="w-full aspect-video flex items-center justify-center relative overflow-hidden"
                          style={{ 
                            backgroundColor: presentation.previewSlide?.backgroundColor || 'hsl(var(--primary))',
                            backgroundImage: presentation.previewSlide?.backgroundImage 
                              ? `url(${presentation.previewSlide.backgroundImage})` 
                              : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="text-white/80 text-sm font-medium">
                              {presentation.slideCount} {presentation.slideCount === 1 ? 'slide' : 'slides'}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-5 space-y-2">
                          <h3 className="font-semibold text-lg truncate tracking-tight" data-testid={`text-title-${presentation.id}`}>
                            {presentation.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {presentation.presenterName}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center">
                    <Link href="/library">
                      <Button variant="outline" size="lg" className="transition-smooth" data-testid="button-browse-library">
                        Browse All Presentations
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Use Cases Section */}
            <section className="py-24 lg:py-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                  <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
                    Built for everyone
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                    Whether you're teaching, training, or presenting
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { icon: BookOpen, title: "Education", description: "Create interactive lessons that keep students engaged and participating actively in learning." },
                    { icon: Users, title: "Business", description: "Make meetings more productive and engaging. Foster collaboration and boost team participation." },
                    { icon: Sparkles, title: "Events", description: "Deliver unforgettable conferences with real-time audience interaction and memorable experiences." },
                  ].map((useCase, index) => (
                    <Card 
                      key={useCase.title}
                      className="border-0 bg-gradient-to-br from-card to-muted/30 transition-smooth hover-lift"
                      data-testid={`card-usecase-${useCase.title.toLowerCase()}`}
                    >
                      <CardContent className="p-8 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <useCase.icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight">{useCase.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                          {useCase.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 lg:py-40 relative overflow-hidden">
              <div className="absolute inset-0 gradient-mesh pointer-events-none" />
              <FloatingShape className="w-96 h-96 bg-primary/15 -bottom-20 -right-20" delay="1s" />
              <FloatingShape className="w-72 h-72 bg-accent/25 top-20 left-10" delay="3s" />
              
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                  Ready to create
                  <span className="gradient-text block">something amazing?</span>
                </h2>
                <p className="text-xl lg:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
                  Join thousands of presenters making their presentations more interactive and engaging.
                </p>
                <div className="pt-4">
                  <Button 
                    onClick={() => setShowAuth(true)} 
                    size="lg" 
                    className="text-lg px-10 py-7 transition-smooth hover-glow"
                    data-testid="button-get-started-cta"
                  >
                    Get Started for Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo />
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/education">
                <Button variant="ghost" size="sm" className="transition-smooth" data-testid="link-footer-education">
                  Education
                </Button>
              </Link>
              <Link href="/business">
                <Button variant="ghost" size="sm" className="transition-smooth" data-testid="link-footer-business">
                  Business
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" size="sm" className="transition-smooth" data-testid="link-footer-library">
                  Library
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="transition-smooth" data-testid="link-footer-pricing">
                  Pricing
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="ghost" size="sm" className="transition-smooth" data-testid="link-footer-join">
                  Join Presentation
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Slydar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
