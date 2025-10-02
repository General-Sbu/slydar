import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";

export default function JoinPresentation() {
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (code.trim()) {
      console.log("Joining presentation with code:", code);
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
            disabled={code.length < 3}
            data-testid="button-join"
          >
            Join Now
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
