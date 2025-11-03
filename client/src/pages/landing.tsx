import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import AuthForm from "@/components/AuthForm";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, BookOpen, DollarSign, ArrowRight, LogIn, Sparkles, Users, BarChart3, MessageCircle, Presentation, Upload, Zap } from "lucide-react";
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

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: featuredPresentations = [] } = useQuery<FeaturedPresentation[]>({
    queryKey: ['/api/featured-presentations'],
    enabled: !showAuth
  });

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
            {/* Hero Section */}
            <section className="py-20 lg:py-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-8">
                  <h1 className="text-5xl lg:text-7xl font-bold">
                    The all-in-one platform for
                    <span className="gradient-text block mt-2">interactive presentations</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Create engaging presentations with real-time polls, Q&A, word clouds, and analytics. 
                    Your audience participates instantly - no downloads required.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={() => setShowAuth(true)} size="lg" data-testid="button-get-started">
                      Get Started - It's Free
                    </Button>
                    <Link href="/join">
                      <Button variant="outline" size="lg" data-testid="button-join">
                        Join a Presentation
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-24 bg-muted/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                  <h2 className="text-3xl lg:text-5xl font-bold">
                    Everything you need to engage your audience
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Powerful features designed to make every presentation interactive and memorable
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover-elevate" data-testid="card-feature-realtime">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Real-time Interaction</h3>
                      <p className="text-muted-foreground">
                        Engage your audience with live polls, quizzes, and instant feedback. 
                        See responses update in real-time as participants interact.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-feature-qa">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Live Q&A</h3>
                      <p className="text-muted-foreground">
                        Collect questions from your audience anonymously. 
                        Let participants upvote questions to surface the most important topics.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-feature-analytics">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Detailed Analytics</h3>
                      <p className="text-muted-foreground">
                        Track engagement metrics, participant responses, and presentation performance. 
                        Understand what resonates with your audience.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-feature-import">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Import PowerPoint & PDF</h3>
                      <p className="text-muted-foreground">
                        Bring your existing presentations to life. Import PPT, PPTX, or PDF files 
                        and add interactive elements instantly.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-feature-casting">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Presentation className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Screen Casting</h3>
                      <p className="text-muted-foreground">
                        Present on external displays using the Web Presentation API. 
                        Cast your slides seamlessly to any connected screen.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-feature-easy">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Easy Audience Access</h3>
                      <p className="text-muted-foreground">
                        Participants join with a simple room code. No accounts, no downloads, 
                        no friction - just instant engagement.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Featured Presentations Section */}
            {featuredPresentations.length > 0 && (
              <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center space-y-4 mb-12">
                    <h2 className="text-3xl lg:text-5xl font-bold">
                      Explore presentations from our library
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Get inspired by presentations created by our community. View, learn, and create your own.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {featuredPresentations.map((presentation) => (
                      <Card 
                        key={presentation.id} 
                        className="hover-elevate cursor-pointer overflow-hidden"
                        onClick={() => navigate(`/library/${presentation.id}`)}
                        data-testid={`card-featured-${presentation.id}`}
                      >
                        <div 
                          className="w-full h-48 flex items-center justify-center relative"
                          style={{ 
                            backgroundColor: presentation.previewSlide?.backgroundColor || '#6366f1',
                            backgroundImage: presentation.previewSlide?.backgroundImage 
                              ? `url(${presentation.previewSlide.backgroundImage})` 
                              : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="text-white text-sm font-medium truncate">
                              {presentation.slideCount} {presentation.slideCount === 1 ? 'slide' : 'slides'}
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold text-lg truncate" data-testid={`text-title-${presentation.id}`}>
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
                      <Button variant="outline" size="lg" data-testid="button-browse-library">
                        Browse All Presentations
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Use Cases Section */}
            <section className="py-16 lg:py-24 bg-muted/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-12">
                  <h2 className="text-3xl lg:text-5xl font-bold">
                    Perfect for every context
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Whether you're teaching, training, or presenting, Slidr helps you connect with your audience
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="hover-elevate" data-testid="card-usecase-education">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Education</h3>
                      <p className="text-muted-foreground">
                        Promote active learning in classrooms and lectures. 
                        Create interactive lessons that keep students engaged and participating.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-usecase-business">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Business</h3>
                      <p className="text-muted-foreground">
                        Foster collaboration and boost productivity in meetings and training sessions. 
                        Make every meeting more engaging and actionable.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover-elevate" data-testid="card-usecase-events">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">Events</h3>
                      <p className="text-muted-foreground">
                        Deliver unforgettable conferences and events with real-time audience interaction. 
                        Create memorable experiences that attendees love.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                <h2 className="text-4xl lg:text-6xl font-bold">
                  Ready to create amazing presentations?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of presenters who are making their presentations more interactive and engaging with Slidr.
                </p>
                <Button onClick={() => setShowAuth(true)} size="lg" data-testid="button-get-started-cta">
                  Get Started for Free
                </Button>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo />
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/library">
                <Button variant="ghost" size="sm" data-testid="link-footer-library">
                  Library
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="sm" data-testid="link-footer-pricing">
                  Pricing
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="ghost" size="sm" data-testid="link-footer-join">
                  Join Presentation
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Slidr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
