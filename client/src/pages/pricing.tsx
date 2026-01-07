import { Check, X, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

interface PlanFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  category: string;
}

const features: PlanFeature[] = [
  { category: "Participants", name: "Participants per session", free: "Up to 50", basic: "Up to 200" },
  { category: "Participants", name: "Unlimited presentations", free: true, basic: true },
  { category: "Content", name: "PDF & PPTX import", free: true, basic: true },
  { category: "Content", name: "All slide types (polls, quizzes, word clouds)", free: true, basic: true },
  { category: "Content", name: "Spinner wheel", free: true, basic: true },
  { category: "Content", name: "Q&A sessions", free: true, basic: true },
  { category: "Content", name: "Custom templates", free: false, basic: true },
  { category: "Branding", name: "Slidr watermark", free: "Included", basic: "Removable" },
  { category: "Branding", name: "Custom color schemes", free: "5 presets", basic: "Unlimited" },
  { category: "Branding", name: "Custom logo on presentations", free: false, basic: true },
  { category: "Analytics", name: "Session analytics", free: "Basic", basic: "Advanced" },
  { category: "Analytics", name: "Export response data", free: false, basic: true },
  { category: "Analytics", name: "Engagement reports", free: false, basic: true },
  { category: "Support", name: "Community support", free: true, basic: true },
  { category: "Support", name: "Priority email support", free: false, basic: true },
];

const categories = ["Participants", "Content", "Branding", "Analytics", "Support"];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-primary" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export default function Pricing() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation('/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">Pricing</h1>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            Simple Pricing
          </div>
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-pricing">
            Choose the plan that fits your needs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative" data-testid="card-tier-free">
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="text-tier-name-free">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold" data-testid="text-price-free">R0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Up to 50 participants</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>All slide types included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>PDF & PPTX import</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>5 color presets</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild data-testid="button-select-free">
                <Link href="/dashboard">Get Started Free</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Basic Plan */}
          <Card className="relative border-primary shadow-lg" data-testid="card-tier-basic">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="px-4 py-1" data-testid="badge-popular">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl" data-testid="text-tier-name-basic">Basic</CardTitle>
              <CardDescription>For professionals and teams</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold" data-testid="text-price-basic">R199</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Up to 200 participants</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Remove Slidr watermark</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Advanced analytics & exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Custom branding & logo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild data-testid="button-select-basic">
                <Link href="/checkout">Upgrade to Basic</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-muted/50 border-b">
              <div className="p-4 font-semibold">Feature</div>
              <div className="p-4 font-semibold text-center border-l">Free</div>
              <div className="p-4 font-semibold text-center border-l bg-primary/5">Basic</div>
            </div>
            
            {/* Table Body */}
            {categories.map((category) => (
              <div key={category}>
                {/* Category Header */}
                <div className="grid grid-cols-3 bg-muted/30 border-b">
                  <div className="p-3 font-semibold text-sm text-muted-foreground col-span-3">
                    {category.toUpperCase()}
                  </div>
                </div>
                
                {/* Category Features */}
                {features
                  .filter((f) => f.category === category)
                  .map((feature, idx) => (
                    <div 
                      key={feature.name} 
                      className="grid grid-cols-3 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                      data-testid={`row-feature-${idx}`}
                    >
                      <div className="p-4 text-sm">{feature.name}</div>
                      <div className="p-4 flex justify-center items-center border-l">
                        <FeatureValue value={feature.free} />
                      </div>
                      <div className="p-4 flex justify-center items-center border-l bg-primary/5">
                        <FeatureValue value={feature.basic} />
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ / Bottom CTA */}
        <div className="text-center mt-16 space-y-6">
          <h3 className="text-xl font-semibold">Have questions?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            All plans include unlimited presentations, real-time engagement features, and our core interactive slide types. 
            Upgrade or downgrade anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild data-testid="button-back-home">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild data-testid="button-get-started-cta">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
