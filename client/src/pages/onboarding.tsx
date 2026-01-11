import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { queryClient, apiRequest } from "@/lib/queryClient";

const USE_CASE_OPTIONS = [
  { value: "company", label: "Company" },
  { value: "education", label: "Education" },
  { value: "student", label: "I am a student" },
  { value: "other", label: "Other" },
];

const EXPLORATION_GOAL_OPTIONS = [
  { value: "create", label: "I want to create slides", description: "Build presentations with interactive features like word clouds, quizzes, and polls." },
  { value: "explore", label: "I want to explore Slydar", description: "Look around and see what the platform can do." },
  { value: "vibes", label: "I'm here for vibes", description: "Other activities like giving feedback or managing a workspace." },
];

const EDUCATOR_FIRST_SLIDE_OPTIONS = [
  { value: "word_cloud", label: "Kick-start discussions in class", description: "Use a Word Cloud to visualize students' thoughts in real-time." },
  { value: "multiple_choice", label: "Get quick input from students", description: "Use a Poll to capture students' opinions instantly." },
  { value: "multiple_choice_quiz", label: "Check student understanding", description: "Use a Quiz to test students' understanding of the material." },
  { value: "open_ended", label: "Gather reflections in class", description: "Use Open Ended questions to collect and display student responses." },
];

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
  
  // Calculate step metadata for display
  // Educators: "Step 1 of 3", "Step 2 of 3", "Step 3 of 3"
  // Non-educators: "Step 1 of 2", "Step 2 of 2"
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold">Slydar</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-2xl space-y-12">
          <div className="space-y-4 text-center">
            {currentStep === 1 && (
              <>
                <h1 className="text-2xl font-normal text-foreground">
                  Hi, {user?.username || "there"}.
                </h1>
                <h2 className="text-4xl font-bold text-foreground">
                  Where will you use Slydar?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Your choice will help us customize your experience.
                </p>
              </>
            )}
            {currentStep === 2 && (
              <>
                <h2 className="text-4xl font-bold text-foreground">
                  What brings you here today?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Tell us what you'd like to do.
                </p>
              </>
            )}
            {currentStep === 3 && (
              <>
                <h2 className="text-4xl font-bold text-foreground">
                  What would you like to do first?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Choose your first slide type to get started.
                </p>
              </>
            )}
          </div>

          {currentStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {USE_CASE_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                    selectedUseCase === option.value
                      ? "border-primary border-2"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedUseCase(option.value)}
                  data-testid={`option-${option.value}`}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-lg font-medium text-foreground">
                      {option.label}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {EXPLORATION_GOAL_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                    selectedGoal === option.value
                      ? "border-primary border-2"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedGoal(option.value)}
                  data-testid={`goal-${option.value}`}
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {option.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {EDUCATOR_FIRST_SLIDE_OPTIONS.map((option) => (
                <Card
                  key={option.value}
                  className={`p-6 cursor-pointer transition-all hover-elevate active-elevate-2 ${
                    selectedSlideType === option.value
                      ? "border-primary border-2"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedSlideType(option.value)}
                  data-testid={`slide-${option.value}`}
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {option.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Step {displayStep} of {totalSteps}</span>
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <Button
            onClick={handleContinue}
            disabled={
              updateOnboardingMutation.isPending ||
              createPresentationMutation.isPending ||
              (currentStep === 1 && !selectedUseCase) ||
              (currentStep === 2 && !selectedGoal) ||
              (currentStep === 3 && !selectedSlideType)
            }
            size="lg"
            data-testid="button-continue"
          >
            {updateOnboardingMutation.isPending || createPresentationMutation.isPending
              ? "Saving..."
              : currentStep === 3
              ? "Create"
              : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
