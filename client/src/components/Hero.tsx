import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@assets/generated_images/Interactive_presentation_hero_mockup_71870220.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Interactive
                <span className="gradient-text block">Presentations</span>
                Made Easy
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Engage your audience with live polls, quizzes, word clouds, and real-time Q&A. 
                No downloads required—just share a code and start presenting.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button 
                size="lg" 
                className="gap-2"
                data-testid="button-get-started"
              >
                Start Creating Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2"
                data-testid="button-watch-demo"
              >
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">Presenters</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold">2M+</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 gradient-purple-blue opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroImage} 
              alt="Interactive presentation with live poll results" 
              className="relative rounded-lg shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
