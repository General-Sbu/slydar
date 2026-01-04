import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Logo from "./Logo";
import { useNotification } from "@/hooks/useNotification";

export default function JoinPresentation() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const [isChecking, setIsChecking] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 3) return;
    
    setIsChecking(true);
    try {
      const res = await fetch(`/api/sessions/code/${code.toUpperCase()}`);
      if (res.ok) {
        const session = await res.json();
        if (session.isActive) {
          setLocation(`/audience/${code.toUpperCase()}`);
        } else {
          showNotification("This presentation session has ended", "error");
        }
      } else {
        showNotification("No active presentation found with this code", "error");
      }
    } catch (error) {
      showNotification("Failed to join presentation", "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={() => setLocation('/')}
        data-testid="button-back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-3xl">Join Presentation</CardTitle>
          <CardDescription className="text-base">
            Enter the code provided by your presenter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter code (e.g., ABC123)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="text-center text-2xl font-mono tracking-wider h-14"
            maxLength={6}
            data-testid="input-room-code"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button 
            size="lg" 
            className="w-full gap-2"
            onClick={handleJoin}
            disabled={code.length < 3 || isChecking}
            data-testid="button-join"
          >
            {isChecking ? "Checking..." : "Join Now"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
