import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { useState } from "react";
import { 
  Briefcase, 
  Users, 
  BarChart3, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  TrendingUp,
  Zap,
  Globe,
  Sparkles,
  Play,
  Building2,
  Menu,
  GraduationCap,
  BookOpen,
  Wand2,
  Clock,
  Palette,
  Brain,
  ImageIcon,
  Layers
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
    icon: MessageCircle,
    title: "Live Decision Polls",
    description: "Make faster decisions in meetings with instant polling. Gather consensus, vote on options, and move forward with confidence."
  },
  {
    icon: Users,
    title: "Team Onboarding",
    description: "Create interactive onboarding sessions that engage new hires. Track comprehension and ensure everyone is up to speed."
  },
  {
    icon: Globe,
    title: "Hybrid Alignment",
    description: "Bridge the gap between remote and in-office teams. Everyone participates equally regardless of location."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data stays secure with enterprise-grade encryption. Compliant with corporate security requirements."
  },
  {
    icon: BarChart3,
    title: "Engagement Analytics",
    description: "Measure meeting effectiveness with detailed analytics. Understand participation patterns and improve over time."
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "No IT involvement needed. Share a code and participants join instantly from any device, no downloads required."
  }
];

const scenarios = [
  {
    title: "Leadership All-Hands",
    description: "Run engaging company-wide meetings where every voice matters. Use live Q&A to address concerns transparently and polls to gauge sentiment on key initiatives.",
    features: ["Anonymous Q&A sessions", "Real-time sentiment polling", "Engagement tracking"],
    stat: "3x",
    statLabel: "more participation"
  },
  {
    title: "Sales Enablement",
    description: "Transform sales training from passive presentations into active learning. Quiz teams on product knowledge and gather feedback on new pitches.",
    features: ["Product knowledge quizzes", "Pitch feedback collection", "Competitive intelligence"],
    stat: "45%",
    statLabel: "better retention"
  },
  {
    title: "Change Management",
    description: "Navigate organizational change with transparency. Use word clouds to surface concerns, polls to measure readiness, and Q&A to address resistance.",
    features: ["Concern identification", "Readiness assessment", "Open dialogue facilitation"],
    stat: "2x",
    statLabel: "faster adoption"
  }
];

const stats = [
  { value: "500+", label: "Companies" },
  { value: "50K+", label: "Meetings Enhanced" },
  { value: "92%", label: "Satisfaction Rate" },
  { value: "40%", label: "More Engagement" }
];

export default function Business() {
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
              <Link href="/">
                <Button variant="outline" className="transition-smooth ml-2" data-testid="button-signin">
                  Sign In
                </Button>
              </Link>
              <Link href="/">
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
                        <Play className="h-4 w-4" />
                        Join Presentation
                      </Button>
                    </Link>
                    <div className="border-t my-2" />
                    <Link href="/">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        data-testid="button-signin-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button 
                        className="w-full" 
                        data-testid="button-get-started-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
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
          <FloatingShape className="w-64 h-64 bg-chart-5/20 bottom-0 left-1/3" delay="4s" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
                <Building2 className="w-4 h-4" />
                For Business
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up">
                Make every meeting
                <span className="gradient-text block mt-2">more productive</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in font-light" style={{ animationDelay: "0.2s" }}>
                Drive engagement in all-hands, training sessions, and workshops. 
                Get real-time feedback and make data-driven decisions.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Link href="/?auth=true">
                  <Button size="lg" className="gap-2 transition-smooth" data-testid="button-try-free">
                    Try Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" size="lg" className="gap-2 transition-smooth" data-testid="button-see-demo">
                    <Play className="w-5 h-5" />
                    See Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label} 
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`stat-${index}`}
                >
                  <div className="text-4xl lg:text-5xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Why businesses choose <span className="text-primary">Slyd</span><span>ar</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Purpose-built for corporate environments with the features teams need to succeed.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card 
                  key={benefit.title} 
                  className="p-6 border-0 bg-card/50 backdrop-blur hover-elevate transition-smooth animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`card-benefit-${index}`}
                >
                  <CardContent className="p-0 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Scenarios Section */}
        <section className="py-24 relative bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Use cases that drive results
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how leading organizations are using Slydar to transform their meetings.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {scenarios.map((scenario, index) => (
                <Card 
                  key={scenario.title}
                  className="p-8 border-0 bg-card/80 backdrop-blur animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                  data-testid={`card-scenario-${index}`}
                >
                  <CardContent className="p-0 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{scenario.title}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{scenario.stat}</div>
                        <div className="text-xs text-muted-foreground">{scenario.statLabel}</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{scenario.description}</p>
                    <ul className="space-y-2">
                      {scenario.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
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

        {/* AI Slide Generator Section */}
        <section className="py-24 relative" data-testid="section-ai-generator-biz">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
                <Wand2 className="w-4 h-4" />
                AI-Powered
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="heading-ai-biz">
                Build presentations with <span className="gradient-text">AI</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop spending hours on slide design. Enter your topic and let AI create a polished, professional deck ready for your next meeting.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">How it benefits your team</h3>
                <div className="space-y-4">
                  {[
                    { icon: Clock, title: "From topic to deck in under a minute", desc: "Need a training on \"Data Privacy Best Practices\" or \"Q3 Sales Strategy\"? Just type it in and AI handles the rest." },
                    { icon: Brain, title: "Adjustable depth for any audience", desc: "Set Beginner for new hires, Intermediate for team updates, or Advanced for leadership deep-dives. One tool fits all contexts." },
                    { icon: Layers, title: "Professional structure built in", desc: "Every deck includes a title slide, clear objectives, content sections, real-world examples, discussion activities, and recap quizzes." },
                    { icon: ImageIcon, title: "Custom AI visuals included", desc: "Key slides are enhanced with AI-generated images that reinforce your message — no stock photo hunting required." },
                    { icon: Palette, title: "On-brand themes", desc: "Choose from 8 polished themes like Midnight, Charcoal, Royal, or Classic. Every slide looks consistent and corporate-ready." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }} data-testid={`ai-benefit-biz-${i}`}>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="p-8 border-0 bg-card/60 backdrop-blur" data-testid="card-ai-steps-biz">
                <CardContent className="p-0 space-y-8">
                  <h3 className="text-2xl font-semibold text-center">Ready in 3 simple steps</h3>
                  {[
                    { step: "1", title: "Enter your topic", desc: "Type any subject — \"Quarterly Business Review\", \"Cybersecurity Awareness\", \"Product Launch Plan\" — and select a depth level." },
                    { step: "2", title: "Choose a theme", desc: "Pick from 8 professional color schemes designed for corporate settings. Your slides will look polished from the first click." },
                    { step: "3", title: "Generate & present", desc: "AI creates 10-20 structured slides with interactive elements and visuals. Customise anything, then present straight to your team." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start" data-testid={`ai-step-biz-${i}`}>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <Link href="/?auth=true">
                      <Button size="lg" className="gap-2 transition-smooth" data-testid="button-try-ai-biz">
                        <Wand2 className="w-4 h-4" />
                        Try AI Generator
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 gradient-hero pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              Enterprise ready
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to transform your meetings?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of companies making their meetings more engaging and productive. 
              Start with a free trial, no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/?auth=true">
                <Button size="lg" className="gap-2 transition-smooth" data-testid="button-try-free-cta">
                  Try Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 transition-smooth" data-testid="button-contact-sales">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo showText={true} />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/education">
                <span className="hover:text-foreground transition-colors cursor-pointer">For Education</span>
              </Link>
              <Link href="/library">
                <span className="hover:text-foreground transition-colors cursor-pointer">Library</span>
              </Link>
              <Link href="/pricing">
                <span className="hover:text-foreground transition-colors cursor-pointer">Pricing</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
