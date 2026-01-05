import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";

export default function AuthForm() {
  const handleGoogleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Slidr</CardTitle>
        <CardDescription>
          Sign in to create and manage interactive presentations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          className="w-full gap-2"
          onClick={handleGoogleSignIn}
          data-testid="button-google-signin"
        >
          <SiGoogle className="h-4 w-4" />
          Continue with Google
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <p className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardFooter>
    </Card>
  );
}
