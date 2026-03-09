import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Check, Sparkles, CheckCircle, XCircle, Loader2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'cancelled' | 'error'>('idle');
  const [isSandbox, setIsSandbox] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    fetch('/api/payments/config')
      .then(r => r.json())
      .then(data => setIsSandbox(data.sandbox === true))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const status = params.get('status');
    
    if (status === 'success') {
      setPaymentStatus('success');
      const storedPaymentId = localStorage.getItem('slydar_payment_id');
      if (storedPaymentId) {
        apiRequest('POST', '/api/payments/confirm', { paymentId: storedPaymentId })
          .then(() => {
            localStorage.removeItem('slydar_payment_id');
          })
          .catch(err => {
            console.error('Failed to confirm plan upgrade:', err);
          });
      }
    } else if (status === 'cancelled') {
      setPaymentStatus('cancelled');
    }
  }, [searchString]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to upgrade your plan.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    setIsProcessing(true);

    const paymentWindow = window.open('', '_blank');

    try {
      const response = await apiRequest('POST', '/api/payments/initiate', {
        plan: 'basic',
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      const data = await response.json();

      if (data.paymentUrl && data.paymentFields) {
        if (data.paymentId) {
          localStorage.setItem('slydar_payment_id', data.paymentId);
        }

        if (paymentWindow) {
          const doc = paymentWindow.document;
          doc.open();
          doc.write('<html><body>');
          doc.write(`<form id="pf" method="POST" action="${data.paymentUrl}">`);
          for (const [key, value] of Object.entries(data.paymentFields)) {
            doc.write(`<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}">`);
          }
          doc.write('</form>');
          doc.write('<script>document.getElementById("pf").submit();<\/script>');
          doc.write('</body></html>');
          doc.close();
        } else {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.paymentUrl;
          form.target = '_blank';
          for (const [key, value] of Object.entries(data.paymentFields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          }
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        }
      } else {
        paymentWindow?.close();
        throw new Error('No payment URL received');
      }
    } catch (error) {
      paymentWindow?.close();
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: "There was an error initiating payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const planDetails = {
    name: "Basic Plan",
    price: "R199",
    period: "month",
    features: [
      "Up to 200 participants",
      "Remove Slydar watermark",
      "Advanced analytics & exports",
      "Custom branding & logo",
      "Priority support",
    ]
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4" data-testid="card-success">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground">
                Thank you for upgrading to Slydar Basic. Your account has been upgraded and you now have access to all Basic features.
              </p>
            </div>
            <Button asChild className="w-full" data-testid="button-go-dashboard">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full" data-testid="button-view-plan">
              <Link href="/my-plan">View My Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4" data-testid="card-cancelled">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Payment Cancelled</h2>
              <p className="text-muted-foreground">
                Your payment was cancelled. No charges were made to your account. You can try again when you're ready.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setPaymentStatus('idle')} className="w-full" data-testid="button-try-again">
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full" data-testid="button-back-pricing">
                <Link href="/pricing">Back to Pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLocation('/pricing')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo showText={true} />
            </div>
            <div className="flex items-center gap-3">
              {isSandbox && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-300 dark:border-amber-700">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Sandbox Mode
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              Upgrade to Basic
            </div>
            <h1 className="text-3xl font-bold" data-testid="heading-checkout">
              Complete your upgrade
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card data-testid="card-order-summary">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>You're upgrading to the Basic plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-start pb-4 border-b">
                  <div>
                    <h3 className="font-semibold text-lg">{planDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{planDetails.price}</span>
                    <span className="text-muted-foreground">/{planDetails.period}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">WHAT'S INCLUDED</h4>
                  {planDetails.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-total">R199.00</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secure payment processed by PayFast
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details Form */}
            <Card data-testid="card-payment-form">
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                  {isAuthenticated 
                    ? "Confirm your details to proceed to payment"
                    : "Please sign in to upgrade your plan"
                  }
                </CardDescription>
              </CardHeader>
              {isAuthenticated ? (
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Smith"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        data-testid="input-email"
                      />
                    </div>

                    <div className={`rounded-lg p-4 text-sm ${isSandbox ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-muted/50 text-muted-foreground'}`}>
                      {isSandbox ? (
                        <p className="flex items-center gap-2">
                          <FlaskConical className="h-4 w-4 flex-shrink-0" />
                          <span><strong>Sandbox mode:</strong> No real payments will be charged. Use PayFast test card details to complete the flow.</span>
                        </p>
                      ) : (
                        <p>
                          You'll be redirected to PayFast's secure payment page to complete your purchase.
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isProcessing}
                      data-testid="button-pay"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting to PayFast...
                        </>
                      ) : (
                        <>Proceed to Payment - R199.00</>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By completing this purchase, you agree to our terms of service. 
                      You can cancel your subscription at any time.
                    </p>
                  </CardFooter>
                </form>
              ) : (
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    You need to be signed in to upgrade your plan.
                  </p>
                  <Button asChild className="w-full" data-testid="button-sign-in">
                    <Link href="/">Sign In to Continue</Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button variant="ghost" data-testid="button-back-pricing">
                Back to Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
