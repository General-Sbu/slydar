import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { useState } from "react";
import {
  Wand2,
  Brain,
  Palette,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  Layers,
  Image,
  CheckCircle2,
  ArrowRight,
  Menu,
  GraduationCap,
  Briefcase,
  Play,
  Users,
  Zap,
  FileText,
  Settings2,
} from "lucide-react";

const RandIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold text-center leading-none ${className}`} style={{ fontFamily: 'serif' }}>R</span>
);

function FloatingShape({ className, delay = "0s" }: { className?: string; delay?: string }) {
  return (
    <div 
      className={`absolute rounded-full opacity-60 blur-3xl animate-float ${className}`}
      style={{ animationDelay: delay }}
    />
  );
}

const benefits = [
  {
    icon: Brain,
    title: "Intelligent Content Structure",
    description: "AI analyzes your topic and creates a logical flow of 10-20 slides including title slides, learning objectives, concept explanations, examples, activities, and quizzes."
  },
  {
    icon: Palette,
    title: "8 Beautiful Themes",
    description: "Choose from Classic, Midnight, Sunset, Forest, Ocean, Royal, Charcoal, or Rose. Each theme applies coordinated colors to backgrounds, text, and accents."
  },
  {
    icon: Image,
    title: "AI-Generated Images",
    description: "Key concept slides automatically receive custom AI-generated images that visually reinforce the content, making presentations more engaging and memorable."
  },
  {
    icon: Layers,
    title: "Multiple Slide Types",
    description: "Generated decks include a mix of heading slides, interactive polls, word clouds, open-ended questions, and fill-in-the-blank activities to keep audiences engaged."
  },
  {
    icon: Target,
    title: "Adjustable Depth Levels",
    description: "Select Beginner, Intermediate, or Advanced depth to tailor the complexity and detail of the generated content to your audience's knowledge level."
  },
  {
    icon: Clock,
    title: "Ready in Seconds",
    description: "Skip hours of slide preparation. Enter your topic, pick a theme, and have a complete, polished presentation ready to present in under a minute."
  },
  {
    icon: Settings2,
    title: "Fully Editable",
    description: "Every generated slide is fully customizable. Add, remove, or rearrange slides, edit text, change themes, and add your own images using the built-in editor."
  },
  {
    icon: Sparkles,
    title: "Speaker Notes Included",
    description: "Each slide comes with AI-generated speaker notes to help you deliver the presentation confidently, even on topics you're less familiar with."
  }
];

const steps = [
  {
    step: "1",
    title: "Enter Your Topic",
    description: "Type any subject — from quantum physics to marketing strategy. The AI handles the rest."
  },
  {
    step: "2",
    title: "Choose Your Settings",
    description: "Select a depth level (Beginner, Intermediate, Advanced) and pick one of 8 visual themes."
  },
  {
    step: "3",
    title: "Generate & Present",
    description: "Your complete slide deck is ready in seconds. Edit if needed, then present to your audience instantly."
  }
];

const useCases = [
  {
    icon: GraduationCap,
    title: "Teachers & Educators",
    description: "Quickly prepare lesson materials for any subject. Generate interactive quizzes and activities that keep students engaged.",
    features: ["Curriculum-aligned content", "Built-in quizzes", "Visual concept slides"]
  },
  {
    icon: Briefcase,
    title: "Business Professionals",
    description: "Create polished presentations for meetings, pitches, and training sessions without spending hours on design.",
    features: ["Professional themes", "Structured narratives", "Quick turnaround"]
  },
  {
    icon: Users,
    title: "Workshop Facilitators",
    description: "Build interactive workshop sessions with polls, word clouds, and Q&A slides to maximize participant engagement.",
    features: ["Interactive activities", "Audience participation", "Flexible content"]
  }
];

export default function AISlides() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/">
              <Logo />
            </Link>
            
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
              <Link href="/?auth=true">
                <Button variant="outline" className="transition-smooth ml-2" data-testid="button-signin">
                  Sign In
                </Button>
              </Link>
              <Link href="/?auth=true">
                <Button className="transition-smooth" data-testid="button-get-started-nav">
                  Get Started
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
                    <Link href="/education">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-education-mobile" onClick={() => setMobileMenuOpen(false)}>
                        <GraduationCap className="h-4 w-4" />
                        Education
                      </Button>
                    </Link>
                    <Link href="/business">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-business-mobile" onClick={() => setMobileMenuOpen(false)}>
                        <Briefcase className="h-4 w-4" />
                        Business
                      </Button>
                    </Link>
                    <Link href="/library">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-library-mobile" onClick={() => setMobileMenuOpen(false)}>
                        <BookOpen className="h-4 w-4" />
                        Library
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-pricing-mobile" onClick={() => setMobileMenuOpen(false)}>
                        <RandIcon className="h-4 w-4" />
                        Pricing
                      </Button>
                    </Link>
                    <Link href="/join">
                      <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-join-presentation-mobile" onClick={() => setMobileMenuOpen(false)}>
                        <Play className="h-4 w-4" />
                        Join Presentation
                      </Button>
                    </Link>
                    <div className="border-t my-2" />
                    <Link href="/?auth=true">
                      <Button variant="outline" className="w-full" data-testid="button-signin-mobile" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/?auth=true">
                      <Button className="w-full" data-testid="button-get-started-mobile" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Button>
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh pointer-events-none" />
          <FloatingShape className="w-96 h-96 bg-primary/20 -top-20 -left-20" delay="0s" />
          <FloatingShape className="w-80 h-80 bg-accent/30 top-40 right-0" delay="2s" />
          <FloatingShape className="w-64 h-64 bg-chart-3/20 bottom-0 left-1/3" delay="4s" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
                <Wand2 className="w-4 h-4" />
                AI-Powered Slide Generation
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up">
                Create presentations
                <span className="gradient-text block mt-2">in seconds, not hours</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in font-light" style={{ animationDelay: "0.2s" }}>
                Enter any topic and let AI generate a complete, interactive slide deck with quizzes, activities, custom images, and beautiful themes.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Link href="/?auth=true">
                  <Button size="lg" className="transition-smooth hover-glow" data-testid="button-try-ai-hero">
                    Try AI Generator
                    <Wand2 className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 lg:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight" data-testid="heading-how-it-works">
                How it works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                Three simple steps to a complete presentation
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={step.step} className="text-center space-y-4" data-testid={`step-${step.step}`}>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute">
                      <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 lg:py-32 relative">
          <div className="absolute inset-0 gradient-hero pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight" data-testid="heading-benefits">
                Why use AI slides
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                Save time and create better presentations with intelligent automation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card
                  key={benefit.title}
                  className="group border-0 bg-card/50 hover:bg-card transition-smooth hover-lift cursor-default overflow-visible"
                  data-testid={`card-benefit-${benefit.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transition-smooth group-hover:scale-110">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 lg:py-32 relative">
          <div className="absolute inset-0 gradient-hero pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" data-testid="heading-use-cases">
                Built for every presenter
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                Whether you teach, train, or facilitate
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase) => (
                <Card
                  key={useCase.title}
                  className="border-0 bg-gradient-to-br from-card to-muted/30 transition-smooth hover-lift overflow-visible"
                  data-testid={`card-usecase-${useCase.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-8 space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <useCase.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight">{useCase.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                    <ul className="space-y-2">
                      {useCase.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="py-24 lg:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" data-testid="heading-what-you-get">
                What every AI deck includes
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
                A complete, ready-to-present experience
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: "Title & Objective Slides", description: "Clear introduction with learning goals to set the stage" },
                { icon: BookOpen, title: "Concept Explanations", description: "Well-structured content slides with key takeaways" },
                { icon: Zap, title: "Interactive Quizzes", description: "Multiple choice questions to test understanding" },
                { icon: Brain, title: "Word Cloud Activities", description: "Open-ended prompts for creative audience input" },
                { icon: Image, title: "AI-Generated Images", description: "Custom visuals for 2-3 key concept slides" },
                { icon: Target, title: "Speaker Notes", description: "Detailed talking points for confident delivery" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4" data-testid={`item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
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
              Ready to let AI
              <span className="gradient-text block">build your slides?</span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
              Sign up for free and generate your first presentation in seconds.
            </p>
            <div className="pt-4">
              <Link href="/?auth=true">
                <Button 
                  size="lg" 
                  className="transition-smooth hover-glow"
                  data-testid="button-get-started-cta"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
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
              &copy; 2024 Slydar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
