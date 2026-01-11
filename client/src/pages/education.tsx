import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Link } from "wouter";
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Lightbulb,
  Target,
  Globe,
  Sparkles,
  Play
} from "lucide-react";

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
    title: "Interactive Lessons",
    description: "Transform passive lectures into engaging discussions with live polls, word clouds, and Q&A sessions that keep students actively participating."
  },
  {
    icon: BarChart3,
    title: "Formative Assessment",
    description: "Gauge student understanding in real-time with instant feedback on quizzes and polls. Identify knowledge gaps before they become problems."
  },
  {
    icon: Users,
    title: "Inclusive Participation",
    description: "Give every student a voice. Anonymous responses encourage shy students to participate without fear of judgment."
  },
  {
    icon: Target,
    title: "Learning Analytics",
    description: "Track engagement metrics and response patterns to understand how your class is learning and adapt your teaching accordingly."
  },
  {
    icon: Globe,
    title: "Hybrid Ready",
    description: "Seamlessly engage both in-person and remote students. Works perfectly for hybrid classrooms and distance learning."
  },
  {
    icon: Lightbulb,
    title: "Easy Setup",
    description: "No apps to download, no accounts for students. Just share a code and they're instantly connected and ready to participate."
  }
];

const scenarios = [
  {
    title: "Flipped Classroom",
    description: "Start class with a quick poll to check pre-reading comprehension. Use word clouds to gather questions, then address the most common topics. End with a quiz to reinforce key concepts.",
    features: ["Pre-class comprehension checks", "Collaborative brainstorming", "Exit ticket assessments"]
  },
  {
    title: "Hybrid Lectures",
    description: "Keep remote and in-person students equally engaged. Real-time Q&A ensures no one feels left out, while polls create shared experiences across locations.",
    features: ["Equal participation for all", "Live question moderation", "Synchronized activities"]
  },
  {
    title: "Professional Development",
    description: "Run engaging faculty workshops and training sessions. Gather feedback, facilitate discussions, and make professional learning interactive and memorable.",
    features: ["Workshop engagement", "Feedback collection", "Collaborative planning"]
  }
];

export default function Education() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/">
              <Logo showText={true} />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/join">
                <Button variant="ghost" className="transition-smooth" data-testid="button-join">
                  Join Session
                </Button>
              </Link>
              <Link href="/">
                <Button className="transition-smooth" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
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
                <GraduationCap className="w-4 h-4" />
                For Educators
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up">
                Transform your classroom into an
                <span className="gradient-text block mt-2">interactive experience</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in font-light" style={{ animationDelay: "0.2s" }}>
                Engage every student with live polls, quizzes, word clouds, and real-time Q&A. 
                Make learning active, inclusive, and measurable.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Link href="/">
                  <Button size="lg" className="gap-2 h-12 px-8 text-lg transition-smooth" data-testid="button-try-free">
                    Try Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-lg transition-smooth" data-testid="button-view-examples">
                    <Play className="w-5 h-5" />
                    View Examples
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Why educators love <span className="gradient-text">Slydar</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for the modern classroom, designed to maximize engagement and learning outcomes.
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
                How educators use Slydar
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real scenarios from teachers, professors, and trainers who've transformed their sessions.
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
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-semibold">{scenario.title}</h3>
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

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 gradient-hero pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              Free for educators
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to engage your students?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of educators who are making learning more interactive. 
              Start free and upgrade as you grow.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2 h-14 px-10 text-lg transition-smooth" data-testid="button-start-free">
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo showText={true} />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/business">
                <span className="hover:text-foreground transition-colors cursor-pointer">For Business</span>
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
