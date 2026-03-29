import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, BookOpen, GraduationCap, Rocket } from "lucide-react";

interface GenerationEvent {
  type: "status" | "progress" | "complete" | "error";
  message?: string;
  current?: number;
  total?: number;
  slideTitle?: string;
  presentationId?: string;
  slideCount?: number;
}

function FullScreenLoader({ progress, slideTitle, statusMessage }: {
  progress: number;
  slideTitle?: string;
  statusMessage?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-8">

        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute w-16 h-16 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.3s" }} />
          <div className="relative w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Creating your slides</h2>
          <p className="text-sm text-muted-foreground">
            {slideTitle ? `Building: ${slideTitle}` : statusMessage || "Setting things up..."}
          </p>
        </div>

        <div className="w-full space-y-2">
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, progress)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress > 0 ? `${Math.round(progress)}%` : "Starting..."}</span>
            <span>6 slides</span>
          </div>
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => {
            const filled = progress >= ((i + 1) / 6) * 100;
            const active = progress >= (i / 6) * 100 && !filled;
            return (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                  filled ? "bg-primary" : active ? "bg-primary/50 animate-pulse" : "bg-muted"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AIGenerator() {
  const [, setLocation] = useLocation();
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Beginner");
  const [isGenerating, setIsGenerating] = useState(false);
  const [events, setEvents] = useState<GenerationEvent[]>([]);
  const [completedPresentation, setCompletedPresentation] = useState<{ id: string; count: number } | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelRedirect = useCallback(() => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelRedirect();
    };
  }, [cancelRedirect]);

  const navigateTo = useCallback((path: string) => {
    cancelRedirect();
    setLocation(path);
  }, [cancelRedirect, setLocation]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() || isGenerating) return;

    cancelRedirect();
    setIsGenerating(true);
    setEvents([]);
    setCompletedPresentation(null);
    setQuotaExceeded(false);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), depth }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        if (err.quotaExceeded) setQuotaExceeded(true);
        setEvents([{ type: "error", message: err.error || "Generation failed" }]);
        setIsGenerating(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event: GenerationEvent = JSON.parse(line.slice(6));
            setEvents(prev => [...prev, event]);

            if (event.type === "complete") {
              setCompletedPresentation({
                id: event.presentationId!,
                count: event.slideCount!,
              });
              redirectTimerRef.current = setTimeout(() => {
                setLocation(`/editor/${event.presentationId}`);
              }, 1500);
            }
          } catch {}
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setEvents(prev => [...prev, { type: "error", message: "Connection lost. Please try again." }]);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [topic, depth, isGenerating]);

  const latestProgress = events.filter(e => e.type === "progress").pop();
  const latestStatus = events.filter(e => e.type === "status").pop();
  const hasError = events.some(e => e.type === "error");
  const errorMessage = events.find(e => e.type === "error")?.message;

  const progressPercent = latestProgress
    ? (latestProgress.current! / latestProgress.total!) * 100
    : latestStatus?.message === "Generating slides..." ? 10
    : latestStatus?.message === "Creating presentation..." ? 80
    : 5;

  const depthOptions = [
    { value: "Beginner", label: "Beginner", description: "Simple explanations & basics", icon: BookOpen },
    { value: "Intermediate", label: "Intermediate", description: "Deeper concepts & examples", icon: GraduationCap },
    { value: "Advanced", label: "Advanced", description: "Technical depth & tradeoffs", icon: Rocket },
  ];

  return (
    <>
      {isGenerating && !hasError && (
        <FullScreenLoader
          progress={progressPercent}
          slideTitle={latestProgress?.slideTitle}
          statusMessage={latestStatus?.message}
        />
      )}

      <div className="flex flex-col h-full overflow-auto">
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-ai-generator-title">AI Slide Generator</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              Enter any topic and get 6 ready-to-teach slides generated instantly.
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">Topic</Label>
                <Input
                  id="topic"
                  data-testid="input-ai-topic"
                  placeholder="e.g. Introduction to Machine Learning, The Water Cycle, World War II..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                  maxLength={500}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && topic.trim() && !isGenerating) {
                      handleGenerate();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">{topic.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Depth Level</Label>
                <div className="grid grid-cols-3 gap-3">
                  {depthOptions.map((opt) => {
                    const isSelected = depth === opt.value;
                    return (
                      <button
                        key={opt.value}
                        data-testid={`button-depth-${opt.value.toLowerCase()}`}
                        onClick={() => setDepth(opt.value)}
                        disabled={isGenerating}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-md border text-center transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border hover-elevate text-muted-foreground"
                        }`}
                      >
                        <opt.icon className={`h-4 w-4 ${isSelected ? "text-primary" : ""}`} />
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-[11px] leading-tight">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                data-testid="button-generate-slides"
                onClick={handleGenerate}
                disabled={!topic.trim() || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Slides
                  </>
                )}
              </Button>
            </div>
          </Card>

          {hasError && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-destructive" />
                  <span className="text-sm font-medium">Generation failed</span>
                </div>
                <div className="space-y-3" data-testid="text-ai-error">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                  {quotaExceeded && (
                    <a href="/pricing">
                      <Button variant="outline" size="sm" className="gap-2 w-full" data-testid="button-upgrade-quota">
                        <Sparkles className="h-3.5 w-3.5" />
                        Upgrade to Basic for unlimited access
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}

          {completedPresentation && !isGenerating && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{completedPresentation.count} slides created</span>
                </div>
                <div className="space-y-3 pt-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Opening editor...
                  </p>
                  <div className="flex gap-3">
                    <Button
                      data-testid="button-edit-generated"
                      onClick={() => navigateTo(`/editor/${completedPresentation.id}`)}
                      className="flex-1"
                    >
                      Edit Slides
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button
                      data-testid="button-present-generated"
                      variant="outline"
                      onClick={() => navigateTo(`/presenter/${completedPresentation.id}`)}
                      className="flex-1"
                    >
                      Present Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Try these topics</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Introduction to Photosynthesis",
                "The Solar System",
                "Basic Python Programming",
                "Climate Change",
                "Ancient Egypt",
                "Financial Literacy for Teens",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  data-testid={`button-suggestion-${suggestion.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}
                  onClick={() => {
                    if (!isGenerating) setTopic(suggestion);
                  }}
                  disabled={isGenerating}
                  className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover-elevate transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
