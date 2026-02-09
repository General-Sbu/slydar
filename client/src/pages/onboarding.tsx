import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Sparkles,
  PenTool,
  Compass,
  Zap,
  Cloud,
  BarChart3,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Check,
  ChevronLeft,
} from "lucide-react";

const USE_CASE_OPTIONS = [
  { value: "company", label: "Company", description: "Meetings, pitches & team updates", icon: Building2, gradient: "from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20" },
  { value: "education", label: "Education", description: "Lectures, workshops & training", icon: GraduationCap, gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20" },
  { value: "student", label: "I'm a Student", description: "Assignments, projects & study groups", icon: BookOpen, gradient: "from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20" },
  { value: "other", label: "Something Else", description: "Events, communities & more", icon: Sparkles, gradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20" },
];

const EXPLORATION_GOAL_OPTIONS = [
  { value: "create", label: "Create interactive slides", description: "Build presentations with polls, quizzes, word clouds and more.", icon: PenTool, gradient: "from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20" },
  { value: "explore", label: "Explore the platform", description: "Look around and discover what Slydar can do.", icon: Compass, gradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20" },
  { value: "vibes", label: "Just checking it out", description: "Browsing, giving feedback or managing a workspace.", icon: Zap, gradient: "from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20" },
];

const EDUCATOR_FIRST_SLIDE_OPTIONS = [
  { value: "word_cloud", label: "Word Cloud", description: "Visualize students' thoughts in real-time to kick-start discussions.", icon: Cloud, gradient: "from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20" },
  { value: "multiple_choice", label: "Live Poll", description: "Capture opinions instantly with multiple choice questions.", icon: BarChart3, gradient: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20" },
  { value: "multiple_choice_quiz", label: "Quiz", description: "Test understanding with scored questions and instant feedback.", icon: HelpCircle, gradient: "from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20" },
  { value: "open_ended", label: "Open Response", description: "Collect and display free-form student reflections.", icon: MessageSquare, gradient: "from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20" },
];

function AnimatedStep({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [stepKey]);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedSlideType, setSelectedSlideType] = useState<string | null>(null);

  const updateOnboardingMutation = useMutation({
    mutationFn: async (data: { useCase?: string; explorationGoal?: string; onboardingComplete: boolean }) => {
      return await apiRequest("PATCH", "/api/onboarding", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      showNotification(error.message || "Failed to save onboarding data", "error");
    },
  });

  const createPresentationMutation = useMutation({
    mutationFn: async (slideType: string) => {
      const response = await apiRequest("POST", "/api/presentations", {
        title: "My First Presentation",
        firstSlideType: slideType,
      });
      return response.json();
    },
    onSuccess: async (presentation: any) => {
      await updateOnboardingMutation.mutateAsync({ onboardingComplete: true });
      setLocation(`/editor/${presentation.id}`);
      showNotification("Your presentation is ready!", "success");
    },
    onError: (error: Error) => {
      showNotification(error.message || "Failed to create presentation", "error");
    },
  });

  const isEducator = selectedUseCase === "education";

  const getStepMeta = (step: number, useCase: string | null) => {
    const totalSteps = useCase === "education" ? 3 : 2;
    const displayStep = step;
    const progressPercent = (displayStep / totalSteps) * 100;
    return { displayStep, totalSteps, progressPercent };
  };

  const { displayStep, totalSteps, progressPercent } = getStepMeta(currentStep, selectedUseCase);

  const handleContinue = async () => {
    if (currentStep === 1 && selectedUseCase) {
      await updateOnboardingMutation.mutateAsync({
        useCase: selectedUseCase,
        onboardingComplete: false,
      });
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedGoal) {
      await updateOnboardingMutation.mutateAsync({
        explorationGoal: selectedGoal,
        onboardingComplete: false,
      });

      if (isEducator) {
        setCurrentStep(3);
      } else {
        await updateOnboardingMutation.mutateAsync({ onboardingComplete: true });
        setLocation("/dashboard");
        showNotification("Welcome to Slydar! Your account is ready.", "success");
      }
    } else if (currentStep === 3 && selectedSlideType) {
      createPresentationMutation.mutate(selectedSlideType);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isDisabled =
    updateOnboardingMutation.isPending ||
    createPresentationMutation.isPending ||
    (currentStep === 1 && !selectedUseCase) ||
    (currentStep === 2 && !selectedGoal) ||
    (currentStep === 3 && !selectedSlideType);

  const firstName = user?.username?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold" data-testid="text-logo">Slydar</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i + 1 <= currentStep ? "bg-primary w-8" : "bg-muted w-2"
              }`}
              data-testid={`progress-dot-${i + 1}`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-32">
        <div className="w-full max-w-2xl">
          <AnimatedStep stepKey={currentStep}>
            <div className="space-y-10">
              <div className="space-y-3 text-center">
                {currentStep === 1 && (
                  <>
                    <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground" data-testid="text-step-label">
                      Let's get started
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-greeting">
                      Hi {firstName}, welcome to Slydar
                    </h1>
                    <p className="text-base text-muted-foreground max-w-md mx-auto" data-testid="text-step-description">
                      Tell us a bit about yourself so we can tailor your experience.
                    </p>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground" data-testid="text-step-label">
                      Almost there
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-step-title">
                      What would you like to do?
                    </h1>
                    <p className="text-base text-muted-foreground max-w-md mx-auto" data-testid="text-step-description">
                      Pick the option that best describes your goal.
                    </p>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground" data-testid="text-step-label">
                      One last thing
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground" data-testid="text-step-title">
                      Pick your first activity
                    </h1>
                    <p className="text-base text-muted-foreground max-w-md mx-auto" data-testid="text-step-description">
                      We'll set up your first slide so you can jump right in.
                    </p>
                  </>
                )}
              </div>

              {currentStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {USE_CASE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedUseCase === option.value;
                    return (
                      <Card
                        key={option.value}
                        className={`relative p-5 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 overflow-visible ${
                          isSelected
                            ? "border-primary border-2 ring-2 ring-primary/20"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedUseCase(option.value)}
                        data-testid={`option-${option.value}`}
                      >
                        <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${option.gradient} pointer-events-none`} />
                        <div className="relative flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground">{option.label}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3">
                  {EXPLORATION_GOAL_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedGoal === option.value;
                    return (
                      <Card
                        key={option.value}
                        className={`relative p-5 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 overflow-visible ${
                          isSelected
                            ? "border-primary border-2 ring-2 ring-primary/20"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedGoal(option.value)}
                        data-testid={`goal-${option.value}`}
                      >
                        <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${option.gradient} pointer-events-none`} />
                        <div className="relative flex items-center gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200 ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground">{option.label}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EDUCATOR_FIRST_SLIDE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedSlideType === option.value;
                    return (
                      <Card
                        key={option.value}
                        className={`relative p-5 cursor-pointer transition-all duration-200 hover-elevate active-elevate-2 overflow-visible ${
                          isSelected
                            ? "border-primary border-2 ring-2 ring-primary/20"
                            : "border-border"
                        }`}
                        onClick={() => setSelectedSlideType(option.value)}
                        data-testid={`slide-${option.value}`}
                      >
                        <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${option.gradient} pointer-events-none`} />
                        <div className="relative flex flex-col items-center text-center gap-3 py-2">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-foreground">{option.label}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedStep>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 sm:p-6 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {currentStep > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                data-testid="button-back"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground" data-testid="text-step-counter">
                Step {displayStep} of {totalSteps}
              </span>
            )}
          </div>
          <Button
            onClick={handleContinue}
            disabled={isDisabled}
            data-testid="button-continue"
          >
            {updateOnboardingMutation.isPending || createPresentationMutation.isPending ? (
              "Saving..."
            ) : currentStep === 3 ? (
              <>
                Create
                <Sparkles className="w-4 h-4 ml-1.5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
