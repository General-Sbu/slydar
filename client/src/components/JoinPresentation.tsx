import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import Logo from "./Logo";
import { useToast } from "@/hooks/use-toast";

export default function JoinPresentation() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
          toast({
            title: "Session not active",
            description: "This presentation session has ended",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid code",
          description: "No active presentation found with this code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join presentation",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
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
