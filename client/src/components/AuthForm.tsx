import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "@/hooks/useNotification";
import { queryClient } from "@/lib/queryClient";
import { SiGoogle } from "react-icons/si";
import { AlertCircle } from "lucide-react";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const authMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; email?: string }) => {
      setErrorMessage(null);
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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      showNotification(
        mode === "login" ? "Logged in successfully" : "Account created successfully",
        "success"
      );
    },
    onError: (error: Error) => {
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Sign In" : "Create Account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your credentials to access your account"
            : "Create a new account to get started"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" data-testid="label-username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              data-testid="input-username"
            />
          </div>
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="email" data-testid="label-email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" data-testid="label-password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === "register" ? 6 : 1}
              data-testid="input-password"
            />
            {mode === "register" && (
              <p className="text-sm text-muted-foreground">
                Password must be at least 6 characters
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={authMutation.isPending}
            data-testid="button-submit"
          >
            {authMutation.isPending
              ? "Loading..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </Button>
          
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md" data-testid="error-message">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              window.location.href = "/api/login";
            }}
            data-testid="button-google-signin"
          >
            <SiGoogle className="h-4 w-4" />
            Sign in with Google
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setEmail("");
              setErrorMessage(null);
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
