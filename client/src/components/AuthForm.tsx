import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { SiGoogle } from "react-icons/si";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const authMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; email?: string }) => {
      setErrorMessage(null);
      setSuccessMessage(null);
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Authentication failed");
      }

      return res.json();
    },
    onSuccess: () => {
      setErrorMessage(null);
      if (mode === "register") {
        setSuccessMessage("Account created successfully! Please sign in.");
        setMode("login");
        setPassword("");
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    },
    onError: (error: Error) => {
      setSuccessMessage(null);
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authMutation.mutate({
      username,
      password,
      ...(mode === "register" && email ? { email } : {}),
    });
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <Card className="w-full max-w-md border-0 bg-card/80 backdrop-blur shadow-xl">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">{mode === "login" ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {mode === "login"
            ? "Enter your credentials to access your account"
            : "Create a new account to get started"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium" data-testid="label-username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 bg-muted/50 border-0 focus:bg-muted transition-smooth"
              required
              data-testid="input-username"
            />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium" data-testid="label-email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-muted/50 border-0 focus:bg-muted transition-smooth"
                data-testid="input-email"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium" data-testid="label-password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-muted/50 border-0 focus:bg-muted transition-smooth"
              required
              minLength={mode === "register" ? 6 : 1}
              data-testid="input-password"
            />
            {mode === "register" && (
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full h-11 text-base transition-smooth hover-glow"
            disabled={authMutation.isPending}
            data-testid="button-submit"
          >
            {authMutation.isPending
              ? "Loading..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
          
          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-500/10 rounded-xl w-full animate-fade-in" data-testid="success-message">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-xl w-full animate-fade-in" data-testid="error-message">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <div className="relative w-full my-2">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-3 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 h-11 transition-smooth"
            onClick={handleGoogleSignIn}
            data-testid="button-google-signin"
          >
            <SiGoogle className="h-4 w-4" />
            Sign in with Google
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full transition-smooth"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setEmail("");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            data-testid="button-toggle-mode"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
