import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Link } from "wouter";
import { useState } from "react";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Brain,
  Zap,
  Layers,
  ImageIcon,
  BarChart3,
  Clock,
  Users,
  Target,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Globe,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const RandIcon = ({ className }: { className?: string }) => (
  <span className={`font-bold text-center leading-none ${className}`} style={{ fontFamily: "serif" }}>R</span>
);

const steps = [
  {
    number: "01",
    title: "Choose your topic",
    description: "Type any subject — from quantum mechanics to digital marketing strategy. Slydar AI understands the context and adapts its output accordingly.",
    icon: Lightbulb,
  },
  {
    number: "02",
    title: "Select depth & style",
    description: "Pick Beginner, Intermediate, or Advanced. The AI tailors vocabulary, complexity, and examples to match your audience's knowledge level.",
    icon: Target,
  },
  {
    number: "03",
    title: "Generate in seconds",
    description: "Watch a complete 10–20 slide deck come to life in real time — title slides, learning objectives, concept explanations, examples, activities, and a closing quiz.",
    icon: Zap,
  },
  {
    number: "04",
    title: "Make it interactive",
    description: "Every generated deck lands directly in the Slydar editor. Add live polls, word clouds, Q&A, and spinner wheels before presenting to your audience.",
    icon: BarChart3,
  },
];

const educatorBenefits = [
  {
    icon: Clock,
    title: "Cut prep time from hours to seconds",
    description: "A full lesson deck — with objectives, examples, and assessment activities — appears in under 30 seconds. Spend more time teaching, less time building slides.",
  },
  {
    icon: Brain,
    title: "Pedagogically structured content",
    description: "AI generates slides that follow proven instructional design: introduce, explain, exemplify, practise, assess. Not just bullet points.",
  },
  {
    icon: BarChart3,
    title: "Built-in formative assessment",
    description: "Closing quiz slides are automatically included. Add live polling to any slide to gauge understanding on the spot.",
  },
  {
    icon: Globe,
    title: "Any subject, any level",
    description: "From primary school science to postgraduate finance, the AI adapts its language, depth, and examples to the right audience.",
  },
];

const corporateBenefits = [
  {
    icon: Zap,
    title: "Accelerate content production",
    description: "Create onboarding decks, product training, compliance modules, or team briefings at a fraction of the time. No designer required.",
  },
  {
    icon: TrendingUp,
    title: "Consistent messaging at scale",
    description: "Generate standardised slide structures across departments. Every deck follows the same logical flow — intro, context, key points, next steps.",
  },
  {
    icon: Users,
    title: "Engage your workforce",
    description: "Transform dry training sessions into interactive experiences. Add live polls to check comprehension, word clouds for brainstorming, and Q&A for open dialogue.",
  },
  {
    icon: Target,
    title: "Tailored to your audience",
    description: "Use Beginner mode for new hires, Intermediate for up-skilling, Advanced for leadership and technical teams — all from the same topic input.",
  },
];

const eventBenefits = [
  {
    icon: Calendar,
    title: "Rapid session creation",
    description: "Build keynote scaffolds, panel discussion frameworks, or workshop content in seconds. Focus on the ideas — let the AI handle the structure.",
  },
  {
    icon: Layers,
    title: "AI-generated visual slides",
    description: "Key concept slides include AI-generated images that match the topic, giving presentations a polished, professional look without a design team.",
  },
  {
    icon: Users,
    title: "Real-time audience participation",
    description: "Pair your AI-generated deck with live polls, reactions, and Q&A. Audiences join with a room code — no app download required.",
  },
  {
    icon: BookOpen,
    title: "Multilingual & diverse topics",
    description: "Generate content on any topic across industries — technology, sustainability, finance, healthcare — all ready to present the moment they're created.",
  },
];

const features = [
  { icon: Layers, label: "10–20 slides per generation" },
  { icon: ImageIcon, label: "AI images for key concept slides" },
  { icon: BookOpen, label: "Learning objectives included" },
  { icon: BarChart3, label: "Closing quiz auto-generated" },
  { icon: Target, label: "3 depth levels" },
  { icon: Zap, label: "Under 30 seconds" },
];

export default function AIFeatures() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/">
              <Logo />
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <Link href="/education">
                <Button variant="ghost" className="transition-smooth" data-testid="button-education">Education</Button>
              </Link>
              <Link href="/business">
                <Button variant="ghost" className="transition-smooth" data-testid="button-business">Business</Button>
              </Link>
              <Link href="/ai-features">
                <Button variant="ghost" className="transition-smooth bg-primary/5 text-primary" data-testid="button-ai-features">AI Features</Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" className="transition-smooth" data-testid="button-library">Library</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="transition-smooth" data-testid="button-pricing">Pricing</Button>
              </Link>
              <Link href="/">
                <Button className="ml-2 transition-smooth" data-testid="button-get-started">Get Started Free</Button>
              </Link>
            </div>

            <div className="flex lg:hidden items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <nav className="flex flex-col gap-3 mt-8">
                    {[
                      { href: "/education", label: "Education", icon: GraduationCap },
                      { href: "/business", label: "Business", icon: Briefcase },
                      { href: "/ai-features", label: "AI Features", icon: Sparkles },
                      { href: "/library", label: "Library", icon: BookOpen },
                      { href: "/pricing", label: "Pricing", icon: RandIcon },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Button>
                      </Link>
                    ))}
                    <Link href="/">
                      <Button className="w-full mt-2" onClick={() => setMobileMenuOpen(false)}>
                        Get Started Free
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
        {/* Hero */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Badge className="mb-6 gap-1.5 px-4 py-1.5 text-sm" data-testid="badge-ai-powered">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by AI
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="heading-hero">
              Turn any topic into a{" "}
              <span className="gradient-text">complete presentation</span>{" "}
              in seconds
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Slydar's AI slide generator builds structured, audience-ready decks from a single text input — complete with learning objectives, concept explanations, AI-generated images, and a closing quiz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-cta-hero">
                  <Sparkles className="h-4 w-4" />
                  Try AI Generator Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-see-pricing">
                  See Pricing
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-12">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-sm text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-muted/30 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-how-it-works">How it works</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                From idea to interactive presentation in four simple steps.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(({ number, title, description, icon: Icon }) => (
                <Card key={number} className="relative overflow-hidden" data-testid={`card-step-${number}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-4xl font-black text-muted-foreground/20 leading-none">{number}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Educators & Learners */}
        <section className="py-20" id="educators">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
                  <GraduationCap className="h-4 w-4" />
                  Educators &amp; Learners
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-educators">
                  Teach smarter, not harder
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Whether you're a university lecturer, a school teacher, or a corporate trainer, Slydar AI eliminates the grunt work of lesson planning so you can focus on what matters — engaging your students.
                </p>
                <div className="space-y-5">
                  {educatorBenefits.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex gap-4" data-testid={`benefit-educator-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/">
                  <Button className="mt-8 gap-2" data-testid="button-educators-cta">
                    Start teaching with AI
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/30">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Sample generated deck — "Introduction to Photosynthesis"</div>
                  {[
                    { type: "Title", label: "Introduction to Photosynthesis · Grade 9 Biology" },
                    { type: "Objectives", label: "Learning Objectives (4 items)" },
                    { type: "Concept", label: "What is Photosynthesis?" },
                    { type: "Deep dive", label: "The Light-Dependent Reactions" },
                    { type: "Deep dive", label: "The Calvin Cycle" },
                    { type: "Example", label: "Real-world example: Leaf colour in autumn" },
                    { type: "Activity", label: "Live Poll — Which factor affects rate most?" },
                    { type: "Quiz", label: "Closing Quiz — 4 questions" },
                  ].map(({ type, label }, i) => (
                    <div key={i} className="flex items-center gap-3 bg-background/70 rounded-lg px-4 py-2.5 border border-border/50">
                      <span className="text-xs font-medium text-primary min-w-[64px]">{type}</span>
                      <span className="text-sm text-muted-foreground truncate">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate */}
        <section className="py-20 bg-muted/30 border-y border-border/50" id="corporate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/40 dark:to-red-950/40 rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/30">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Onboarding", icon: Users, color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30" },
                    { label: "Product Training", icon: Layers, color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30" },
                    { label: "Compliance", icon: CheckCircle2, color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30" },
                    { label: "Team Briefings", icon: Target, color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30" },
                    { label: "Sales Enablement", icon: TrendingUp, color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30" },
                    { label: "Leadership Dev.", icon: Brain, color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30" },
                  ].map(({ label, icon: Icon, color }) => (
                    <div key={label} className="bg-background/70 rounded-xl p-4 border border-border/50 flex flex-col items-center gap-2 text-center">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-primary" />
                        AI-ready
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium mb-6">
                  <Briefcase className="h-4 w-4" />
                  Corporate &amp; Business
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-corporate">
                  Scale training without scaling effort
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  From new-hire onboarding to executive briefings, Slydar AI generates structured, professional decks in seconds — then makes them interactive so your teams actually engage with the content.
                </p>
                <div className="space-y-5">
                  {corporateBenefits.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex gap-4" data-testid={`benefit-corporate-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/">
                  <Button className="mt-8 gap-2" data-testid="button-corporate-cta">
                    Start building training decks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Event Organisers */}
        <section className="py-20" id="events">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6">
                  <Calendar className="h-4 w-4" />
                  Event Organisers
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-events">
                  Unforgettable sessions, built in minutes
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Whether it's a conference keynote, a workshop, or a panel session, Slydar AI gives you a solid, structured scaffold to build on — so you're never starting from a blank slide.
                </p>
                <div className="space-y-5">
                  {eventBenefits.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex gap-4" data-testid={`benefit-event-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/">
                  <Button className="mt-8 gap-2" data-testid="button-events-cta">
                    Plan your next event
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40 rounded-2xl p-8 border border-purple-200/50 dark:border-purple-800/30 space-y-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Live event experience</div>
                <div className="bg-background/70 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Live Poll</span>
                    <span className="text-xs text-primary font-medium">342 responses</span>
                  </div>
                  {[
                    { label: "AI & Automation", pct: 72 },
                    { label: "Sustainability", pct: 58 },
                    { label: "Talent Strategy", pct: 43 },
                    { label: "Digital Transformation", pct: 31 },
                  ].map(({ label, pct }) => (
                    <div key={label} className="mb-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-background/70 rounded-xl p-4 border border-border/50">
                  <div className="text-sm font-semibold mb-2">Audience Q&amp;A</div>
                  {[
                    { q: "How does AI change hiring workflows?", votes: 24 },
                    { q: "What's the ROI timeline for these tools?", votes: 17 },
                  ].map(({ q, votes }) => (
                    <div key={q} className="flex items-start justify-between gap-3 mb-2 last:mb-0">
                      <span className="text-sm text-muted-foreground">{q}</span>
                      <span className="text-xs font-medium text-primary whitespace-nowrap">{votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden border-t border-border/50">
          <div className="absolute inset-0 gradient-mesh pointer-events-none" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-cta">
              Ready to generate your first AI deck?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Sign up for free and try the AI generator today. No credit card needed for your first presentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-cta-final">
                  <Sparkles className="h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-pricing-final">
                  View plans &amp; pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Logo />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                { href: "/education", label: "Education" },
                { href: "/business", label: "Business" },
                { href: "/ai-features", label: "AI Features" },
                { href: "/library", label: "Library" },
                { href: "/pricing", label: "Pricing" },
              ].map(({ href, label }) => (
                <Link key={href} href={href}>
                  <Button variant="ghost" size="sm" data-testid={`link-footer-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</Button>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">© 2025 Slydar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
