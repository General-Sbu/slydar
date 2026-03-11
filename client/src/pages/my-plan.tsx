import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Sparkles, ArrowRight, Loader2, X, Minus } from "lucide-react";
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

          {!isBasic && (
            <div className="pt-2 border-t">
              <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium">Upgrade to Basic for more features</p>
                    <p className="text-sm text-muted-foreground">
                      Get unlimited AI generations, up to 200 participants, remove watermarks, advanced analytics, and more.
                    </p>
                    <Button asChild className="gap-2" data-testid="button-upgrade">
                      <Link href="/checkout">
                        Upgrade to Basic — R199/month
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

      {/* Feature comparison table */}
      <Card className="mt-6" data-testid="card-feature-comparison">
        <CardHeader>
          <CardTitle className="text-base">Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-comparison">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-1/2">Feature</th>
                  <th className="text-center px-4 py-3 font-medium w-1/4">
                    <span className={!isBasic ? "text-primary font-semibold" : ""}>Free</span>
                  </th>
                  <th className="text-center px-4 py-3 font-medium w-1/4">
                    <span className={isBasic ? "text-primary font-semibold" : ""}>Basic</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <SectionRow label="Presentations" />
                <CompareRow feature="Presentations" free="Unlimited" basic="Unlimited" />
                <CompareRow feature="Participants per session" free="Up to 50" basic="Up to 200" highlight />
                <CompareRow feature="Slide types (polls, quizzes, word clouds)" free="check" basic="check" />
                <CompareRow feature="PDF & PPTX import" free="check" basic="check" />
                <CompareRow feature="Slydar watermark" free="Shown" basic="Removed" highlight />

                <SectionRow label="AI Slide Generator" />
                <CompareRow feature="AI-generated slide decks" free="check" basic="check" />
                <CompareRow feature="AI generations per day" free="2 per day" basic="Unlimited" highlight />
                <CompareRow feature="Slides per deck" free="10–20 slides" basic="10–20 slides" />
                <CompareRow feature="Depth levels (Beginner / Intermediate / Advanced)" free="check" basic="check" />
                <CompareRow feature="AI-generated images on key slides" free="check" basic="check" />
                <CompareRow feature="Theme selection for AI decks" free="check" basic="check" />

                <SectionRow label="Analytics & Exports" />
                <CompareRow feature="Session analytics" free="Basic" basic="Advanced" highlight />
                <CompareRow feature="Export to PPTX" free="check" basic="check" />
                <CompareRow feature="Export to PDF" free="check" basic="check" />
                <CompareRow feature="Per-slide response drill-down" free="check" basic="check" />

                <SectionRow label="Support" />
                <CompareRow feature="Email support" free="cross" basic="check" highlight />
                <CompareRow feature="Priority support" free="cross" basic="check" highlight />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Button variant="ghost" asChild data-testid="button-view-pricing">
          <Link href="/pricing">View full pricing page</Link>
        </Button>
      </div>
    </div>
  );
}

function SectionRow({ label }: { label: string }) {
  return (
    <tr className="bg-muted/20">
      <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </td>
    </tr>
  );
}

function CompareRow({
  feature,
  free,
  basic,
  highlight = false,
}: {
  feature: string;
  free: string;
  basic: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-primary/[0.03]" : ""}>
      <td className="px-4 py-3 text-sm">{feature}</td>
      <td className="px-4 py-3 text-center">
        <CellValue value={free} />
      </td>
      <td className="px-4 py-3 text-center">
        <CellValue value={basic} isBasicCol />
      </td>
    </tr>
  );
}

function CellValue({ value, isBasicCol = false }: { value: string; isBasicCol?: boolean }) {
  if (value === "check") {
    return <Check className={`h-4 w-4 mx-auto ${isBasicCol ? "text-primary" : "text-muted-foreground"}`} />;
  }
  if (value === "cross") {
    return <X className="h-4 w-4 mx-auto text-muted-foreground/40" />;
  }
  return (
    <span className={`text-sm ${isBasicCol ? "font-medium text-primary" : "text-muted-foreground"}`}>
      {value}
    </span>
  );
}
