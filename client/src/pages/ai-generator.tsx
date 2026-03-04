import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, BookOpen, GraduationCap, Rocket, Palette } from "lucide-react";

const slideThemes = [
  {
    id: "classic",
    name: "Classic",
    background: "#ffffff",
    text: "#1e293b",
    primary: "#2563eb",
    accent: "#dbeafe",
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#0f172a",
    text: "#f1f5f9",
    primary: "#818cf8",
    accent: "#1e293b",
  },
  {
    id: "sunset",
    name: "Sunset",
    background: "#fef2f2",
    text: "#7f1d1d",
    primary: "#ef4444",
    accent: "#fecaca",
  },
  {
    id: "forest",
    name: "Forest",
    background: "#f0fdf4",
    text: "#14532d",
    primary: "#22c55e",
    accent: "#bbf7d0",
  },
  {
    id: "ocean",
    name: "Ocean",
    background: "#ecfeff",
    text: "#164e63",
    primary: "#06b6d4",
    accent: "#a5f3fc",
  },
  {
    id: "royal",
    name: "Royal",
    background: "#faf5ff",
    text: "#3b0764",
    primary: "#a855f7",
    accent: "#e9d5ff",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    background: "#1c1917",
    text: "#fafaf9",
    primary: "#f97316",
    accent: "#292524",
  },
  {
    id: "rose",
    name: "Rose",
    background: "#fff1f2",
    text: "#881337",
    primary: "#f43f5e",
    accent: "#fecdd3",
  },
];

interface GenerationEvent {
  type: "status" | "progress" | "complete" | "error";
  message?: string;
  current?: number;
  total?: number;
  slideTitle?: string;
  presentationId?: string;
  slideCount?: number;
}

export default function AIGenerator() {
  const [, setLocation] = useLocation();
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Beginner");
  const [selectedTheme, setSelectedTheme] = useState("classic");
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
        body: JSON.stringify({ topic: topic.trim(), depth, theme: selectedTheme }),
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

  const depthOptions = [
    { value: "Beginner", label: "Beginner", description: "Simple explanations & basics", icon: BookOpen },
    { value: "Intermediate", label: "Intermediate", description: "Deeper concepts & examples", icon: GraduationCap },
    { value: "Advanced", label: "Advanced", description: "Technical depth & tradeoffs", icon: Rocket },
  ];

  return (
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
            Enter any topic and get a complete, ready-to-teach slide deck generated instantly.
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

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Slide Theme
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {slideThemes.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      data-testid={`button-theme-${theme.id}`}
                      onClick={() => setSelectedTheme(theme.id)}
                      disabled={isGenerating}
                      className={`relative rounded-md border overflow-hidden transition-all ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                          : "border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      <div
                        className="aspect-[16/10] p-2 flex flex-col justify-between"
                        style={{ backgroundColor: theme.background }}
                      >
                        <div className="space-y-1">
                          <div
                            className="h-1.5 rounded-full w-3/4"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div
                            className="h-1 rounded-full w-1/2 opacity-60"
                            style={{ backgroundColor: theme.text }}
                          />
                        </div>
                        <div className="flex gap-1">
                          <div
                            className="h-1 rounded-full flex-1"
                            style={{ backgroundColor: theme.accent }}
                          />
                          <div
                            className="h-1 rounded-full flex-1"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                      </div>
                      <div className="py-1 px-1.5 text-center">
                        <span className="text-[10px] font-medium leading-none">{theme.name}</span>
                      </div>
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

        {(isGenerating || events.length > 0) && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {completedPresentation && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {hasError && !completedPresentation && (
                  <div className="h-4 w-4 rounded-full bg-destructive" />
                )}
                <span className="text-sm font-medium">
                  {completedPresentation
                    ? `${completedPresentation.count} slides created`
                    : hasError
                    ? "Generation failed"
                    : "Generating your slides..."}
                </span>
              </div>

              {latestProgress && !completedPresentation && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(latestProgress.current! / latestProgress.total!) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Slide {latestProgress.current} of {latestProgress.total}: {latestProgress.slideTitle}
                  </p>
                </div>
              )}

              {latestStatus && !completedPresentation && !hasError && (
                <p className="text-xs text-muted-foreground" data-testid="text-ai-status">
                  {latestStatus.message}
                </p>
              )}

              {hasError && (
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
              )}

              {completedPresentation && (
                <div className="space-y-3 pt-2">
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
              )}
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
  );
}
