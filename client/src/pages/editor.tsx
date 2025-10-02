import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SlideTypeCard from "@/components/SlideTypeCard";
import { 
  BarChart3, Cloud, MessageSquare, Type, 
  ChevronLeft, Save, Eye, Play 
} from "lucide-react";
import { useState } from "react";

export default function Editor() {
  const [question, setQuestion] = useState("What's your favorite feature?");
  const [options, setOptions] = useState(["Polls", "Quizzes", "Word Clouds", "Q&A"]);

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Logo showText={false} />
              <div className="hidden sm:block">
                <div className="font-semibold">Product Launch Q4</div>
                <div className="text-xs text-muted-foreground">12 slides</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-preview">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-save">
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button size="sm" className="gap-2" data-testid="button-present-editor">
                <Play className="h-4 w-4" />
                Present
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r bg-muted/30 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Add Slide</h3>
                <div className="space-y-2">
                  <SlideTypeCard
                    icon={BarChart3}
                    title="Multiple Choice"
                    description="Poll with options"
                  />
                  <SlideTypeCard
                    icon={Cloud}
                    title="Word Cloud"
                    description="Collect ideas"
                  />
                  <SlideTypeCard
                    icon={MessageSquare}
                    title="Open Ended"
                    description="Free text responses"
                  />
                  <SlideTypeCard
                    icon={Type}
                    title="Heading"
                    description="Title slide"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <Card className="aspect-video flex items-center justify-center p-12">
                <div className="w-full text-center space-y-6">
                  <h2 className="text-4xl font-bold">{question || "Your question here"}</h2>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {options.map((option, index) => (
                      <Card key={index} className="p-6 hover-elevate cursor-pointer">
                        <div className="font-medium text-lg">{option}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        <aside className="w-80 border-l overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Slide Properties</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter your question"
                      data-testid="input-question"
                      className="min-h-20"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Options</Label>
                    {options.map((option, index) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        data-testid={`input-option-${index}`}
                      />
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      data-testid="button-add-option"
                      onClick={() => setOptions([...options, `Option ${options.length + 1}`])}
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
