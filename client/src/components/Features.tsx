import { BarChart3, Zap, Users, MessageSquare, TrendingUp, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: BarChart3,
    title: "Live Polls",
    description: "Create multiple choice polls with real-time results and beautiful visualizations"
  },
  {
    icon: Zap,
    title: "Interactive Quizzes",
    description: "Gamify learning with scoring, leaderboards, and instant feedback"
  },
  {
    icon: Users,
    title: "Word Clouds",
    description: "Collect audience ideas and display them in dynamic, size-based clouds"
  },
  {
    icon: MessageSquare,
    title: "Live Q&A",
    description: "Let your audience ask questions anonymously with upvoting and moderation"
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Track participation, responses, and engagement with live dashboards"
  },
  {
    icon: Lock,
    title: "No Login Required",
    description: "Participants join instantly with a simple room code—no account needed"
  }
];

export default function Features() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Everything You Need to
            <span className="gradient-text block">Engage Your Audience</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for presenters, educators, and team leaders
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover-elevate transition-all duration-200">
                <CardHeader className="space-y-3">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
