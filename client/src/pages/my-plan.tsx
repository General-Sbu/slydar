import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function MyPlan() {
  const { data: planData, isLoading } = useQuery<{ plan: string; planUpdatedAt: string | null }>({
    queryKey: ['/api/user/plan'],
  });

  const currentPlan = planData?.plan || 'free';
  const isBasic = currentPlan === 'basic';
  const planUpdatedAt = planData?.planUpdatedAt ? new Date(planData.planUpdatedAt) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-plan" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="heading-my-plan">My Plan</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
      </div>

      <Card className={isBasic ? "border-primary" : ""} data-testid="card-current-plan">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {isBasic ? (
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl" data-testid="text-plan-name">
                  {isBasic ? 'Basic Plan' : 'Free Plan'}
                </CardTitle>
                <CardDescription data-testid="text-plan-status">
                  {isBasic ? 'You have full access to all Basic features' : 'You are on the free plan'}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={isBasic ? "default" : "secondary"}
              data-testid="badge-plan-type"
            >
              {isBasic ? 'Active' : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold" data-testid="text-plan-price">
              {isBasic ? 'R199' : 'R0'}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>

          {planUpdatedAt && isBasic && (
            <p className="text-sm text-muted-foreground" data-testid="text-plan-since">
              Active since {planUpdatedAt.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}

          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {isBasic ? "Your features" : "Included features"}
            </h4>
            {isBasic ? (
              <>
                <PlanFeature text="Up to 200 participants per session" />
                <PlanFeature text="Unlimited presentations" />
                <PlanFeature text="All slide types (polls, quizzes, word clouds)" />
                <PlanFeature text="PDF & PPTX import" />
                <PlanFeature text="Remove Slydar watermark" />
                <PlanFeature text="Advanced analytics & exports" />
                <PlanFeature text="Custom branding & logo" />
                <PlanFeature text="Priority email support" />
              </>
            ) : (
              <>
                <PlanFeature text="Up to 50 participants per session" />
                <PlanFeature text="Unlimited presentations" />
                <PlanFeature text="All slide types (polls, quizzes, word clouds)" />
                <PlanFeature text="PDF & PPTX import" />
                <PlanFeature text="Basic analytics" />
                <PlanFeature text="5 color presets" />
              </>
            )}
          </div>

          {!isBasic && (
            <div className="pt-4 border-t">
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium">Upgrade to Basic for more features</p>
                    <p className="text-sm text-muted-foreground">
                      Get up to 200 participants, remove watermarks, advanced analytics, and more.
                    </p>
                    <Button asChild className="gap-2" data-testid="button-upgrade">
                      <Link href="/checkout">
                        Upgrade to Basic - R199/month
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="ghost" asChild data-testid="button-view-pricing">
          <Link href="/pricing">View full plan comparison</Link>
        </Button>
      </div>
    </div>
  );
}

function PlanFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check className="h-4 w-4 text-primary shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
