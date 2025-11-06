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

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const updateOnboardingMutation = useMutation({
    mutationFn: async (data: { useCase: string; onboardingComplete: boolean }) => {
      return await apiRequest("PATCH", "/api/onboarding", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
      showNotification("Welcome to Slidr! Your account is ready.", "success");
    },
    onError: (error: Error) => {
      showNotification(error.message || "Failed to save onboarding data", "error");
    },
  });

  const handleContinue = () => {
    if (selectedUseCase) {
      updateOnboardingMutation.mutate({
        useCase: selectedUseCase,
        onboardingComplete: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold">Slidr</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-2xl space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-normal text-foreground">
              Hi, {user?.username || "there"}.
            </h1>
            <h2 className="text-4xl font-bold text-foreground">
              Where will you use Slidr?
            </h2>
            <p className="text-lg text-muted-foreground">
              Your choice will help us customize your experience.
            </p>
          </div>

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
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
          <Button
            onClick={handleContinue}
            disabled={!selectedUseCase || updateOnboardingMutation.isPending}
            size="lg"
            data-testid="button-continue"
          >
            {updateOnboardingMutation.isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
