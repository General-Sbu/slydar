import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  popular?: boolean;
  features: {
    participants: string;
    branding: string;
    customization: string[];
    other: string[];
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out the platform",
    features: {
      participants: "Up to 50 participants per session",
      branding: "Platform branding included",
      customization: [
        "Basic presentation templates",
        "Standard reactions & polls"
      ],
      other: [
        "PDF & PPTX import",
        "Real-time audience engagement",
        "Session analytics",
        "Export feedback data"
      ]
    }
  },
  {
    name: "Pro",
    price: "$29",
    description: "For professional presenters and educators",
    popular: true,
    features: {
      participants: "Up to 500 participants per session",
      branding: "Custom branding & logo",
      customization: [
        "Custom color themes",
        "Advanced presentation templates",
        "Custom reaction emojis",
        "Branded session pages"
      ],
      other: [
        "Everything in Free",
        "Priority support",
        "Advanced analytics & insights",
        "Export to multiple formats",
        "Attendee tracking"
      ]
    }
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with specific needs",
    features: {
      participants: "Unlimited participants",
      branding: "Full white-label solution",
      customization: [
        "Complete UI customization",
        "Custom domain support",
        "Branded mobile experience",
        "Custom integrations",
        "API access"
      ],
      other: [
        "Everything in Pro",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom feature development",
        "On-premise deployment option",
        "Advanced security & compliance"
      ]
    }
  }
];

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
          <h1 className="text-4xl font-bold mb-4" data-testid="heading-pricing">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.name}
              className={tier.popular ? "border-primary shadow-lg" : ""}
              data-testid={`card-tier-${tier.name.toLowerCase()}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle data-testid={`text-tier-name-${tier.name.toLowerCase()}`}>
                    {tier.name}
                  </CardTitle>
                  {tier.popular && (
                    <Badge variant="default" data-testid="badge-popular">
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold" data-testid={`text-price-${tier.name.toLowerCase()}`}>
                    {tier.price}
                  </span>
                  {tier.price !== "Custom" && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground">
                    PARTICIPANTS
                  </div>
                  <div className="flex gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm" data-testid={`text-participants-${tier.name.toLowerCase()}`}>
                      {tier.features.participants}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground">
                    BRANDING
                  </div>
                  <div className="flex gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm" data-testid={`text-branding-${tier.name.toLowerCase()}`}>
                      {tier.features.branding}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground">
                    CUSTOMIZATION
                  </div>
                  {tier.features.customization.map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="font-semibold text-sm text-muted-foreground">
                    FEATURES
                  </div>
                  {tier.features.other.map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                  data-testid={`button-select-${tier.name.toLowerCase()}`}
                >
                  <Link href={tier.name === "Enterprise" ? "/contact" : "/"}>
                    {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            All plans include PDF & PPTX import, real-time engagement, and basic analytics
          </p>
          <Button variant="ghost" asChild data-testid="button-back-home">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
