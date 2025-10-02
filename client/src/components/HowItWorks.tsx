import { PlusCircle, Share2, BarChart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Create Your Presentation",
    description: "Choose from multiple interactive slide types including polls, quizzes, word clouds, and more"
  },
  {
    number: "02",
    icon: Share2,
    title: "Share Room Code",
    description: "Your audience joins instantly using a simple code—no downloads or accounts needed"
  },
  {
    number: "03",
    icon: BarChart,
    title: "See Results Live",
    description: "Watch responses flow in real-time with beautiful charts and instant analytics"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple three-step process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 text-7xl font-bold text-primary/10">
                      {step.number}
                    </div>
                    <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                      <Icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mt-8">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
