import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SlideTypeCard from "@/components/SlideTypeCard";
import SlideWatermark from "@/components/SlideWatermark";
import { 
  BarChart3, Cloud, MessageSquare, Type, 
  ChevronLeft, Save, Play, Trash2, Plus, Upload, Menu, Settings 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation, Slide, SlideType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const presentationId = params?.id;

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [slidesSheetOpen, setSlidesSheetOpen] = useState(false);
  const [propertiesSheetOpen, setPropertiesSheetOpen] = useState(false);

  const { data: presentation, isLoading: presentationLoading } = useQuery<Presentation>({
    queryKey: ['/api/presentations', presentationId],
    enabled: !!presentationId,
  });

  const { data: slides = [], isLoading: slidesLoading } = useQuery<Slide[]>({
    queryKey: ['/api/presentations', presentationId, 'slides'],
    enabled: !!presentationId,
  });

  const createSlideMutation = useMutation({
    mutationFn: async (slideData: { type: SlideType; question: string; options?: string[] }) => {
      const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : -1;
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId,
          type: slideData.type,
          order: maxOrder + 1,
          question: slideData.question,
          options: slideData.options || [],
          config: {}
        })
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      toast({ title: "Slide added", description: "New slide created" });
    }
  });

  const updateSlideMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Slide> }) => {
      const res = await fetch(`/api/slides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      toast({ title: "Saved", description: "Slide updated" });
    }
  });

  const deleteSlideMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/slides/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      toast({ title: "Deleted", description: "Slide removed" });
      setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
    }
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/presentations/${presentationId}/import`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to import');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      toast({ 
        title: "Success", 
        description: `Imported ${data.slidesCreated} slides from file` 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`/api/presentations/${presentationId}/upload-image`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      toast({ 
        title: "Success", 
        description: "Image added to presentation" 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (slides.length > 0 && slides[selectedSlideIndex]) {
      setEditingSlide({ ...slides[selectedSlideIndex] });
    }
  }, [selectedSlideIndex, slides]);

  const handleAddSlide = (type: SlideType) => {
    const defaultData: Record<SlideType, { type: SlideType; question: string; options?: string[] }> = {
      multiple_choice: { type: 'multiple_choice', question: "New multiple choice question?", options: ["Option 1", "Option 2", "Option 3", "Option 4"] },
      word_cloud: { type: 'word_cloud', question: "What words come to mind?", options: [] },
      open_ended: { type: 'open_ended', question: "Share your thoughts...", options: [] },
      heading: { type: 'heading', question: "New Section", options: [] },
      image: { type: 'image', question: "", options: [] }
    };
    
    createSlideMutation.mutate(defaultData[type]);
  };

  const handleSaveSlide = () => {
    if (editingSlide && editingSlide.id) {
      updateSlideMutation.mutate({
        id: editingSlide.id,
        data: {
          question: editingSlide.question,
          options: editingSlide.options,
          type: editingSlide.type
        }
      });
    }
  };

  const handleDeleteSlide = () => {
    if (editingSlide && editingSlide.id) {
      deleteSlideMutation.mutate(editingSlide.id);
    }
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (editingSlide && editingSlide.options) {
      const newOptions = [...editingSlide.options];
      newOptions[index] = value;
      setEditingSlide({ ...editingSlide, options: newOptions });
    }
  };

  const handleAddOption = () => {
    if (editingSlide) {
      const newOptions = [...(editingSlide.options || []), `Option ${(editingSlide.options?.length || 0) + 1}`];
      setEditingSlide({ ...editingSlide, options: newOptions });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (editingSlide && editingSlide.options) {
      const newOptions = editingSlide.options.filter((_, i) => i !== index);
      setEditingSlide({ ...editingSlide, options: newOptions });
    }
  };

  const handlePresent = () => {
    setLocation(`/presenter/${presentationId}`);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      event.target.value = '';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
      event.target.value = '';
    }
  };

  if (!presentationId) {
    return <div className="h-screen flex items-center justify-center">Invalid presentation ID</div>;
  }

  if (presentationLoading || slidesLoading) {
    return (
      <div className="h-screen flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between gap-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[selectedSlideIndex];

  const getSlidePreview = (slide: Slide) => {
    if (slide.type === 'image' && slide.question) {
      return (
        <div className="w-full h-16 rounded overflow-hidden bg-muted flex items-center justify-center">
          <img 
            src={slide.question} 
            alt="Slide preview" 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return (
      <div className="text-xs text-muted-foreground truncate">
        {slide.question || slide.type}
      </div>
    );
  };

  const SlidesPanel = () => (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div>
        <h3 className="font-semibold mb-3">Slides</h3>
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <Card 
              key={slide.id}
              className={`p-3 cursor-pointer hover-elevate ${selectedSlideIndex === index ? 'border-primary' : ''}`}
              onClick={() => {
                setSelectedSlideIndex(index);
                setSlidesSheetOpen(false);
              }}
              data-testid={`card-slide-${index}`}
            >
              <div className="text-sm font-medium mb-2">Slide {index + 1}</div>
              {getSlidePreview(slide)}
            </Card>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-semibold mb-3">Add Slide</h3>
        <div className="space-y-2">
          <div onClick={() => { handleAddSlide('multiple_choice'); setSlidesSheetOpen(false); }}>
            <SlideTypeCard
              icon={BarChart3}
              title="Multiple Choice"
              description="Poll with options"
            />
          </div>
          <div onClick={() => { handleAddSlide('word_cloud'); setSlidesSheetOpen(false); }}>
            <SlideTypeCard
              icon={Cloud}
              title="Word Cloud"
              description="Collect ideas"
            />
          </div>
          <div onClick={() => { handleAddSlide('open_ended'); setSlidesSheetOpen(false); }}>
            <SlideTypeCard
              icon={MessageSquare}
              title="Open Ended"
              description="Free text responses"
            />
          </div>
          <div onClick={() => { handleAddSlide('heading'); setSlidesSheetOpen(false); }}>
            <SlideTypeCard
              icon={Type}
              title="Heading"
              description="Title slide"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Import Slides</h3>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pptx,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
          onChange={handleFileImport}
          data-testid="input-file-upload"
        />
        <label htmlFor="file-upload">
          <Card className="p-4 cursor-pointer hover-elevate" data-testid="button-import-slides">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Import File</div>
                <div className="text-xs text-muted-foreground">PPTX or PDF</div>
              </div>
            </div>
          </Card>
        </label>
        {importMutation.isPending && (
          <div className="mt-2 text-xs text-muted-foreground">
            Importing slides...
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Upload Image</h3>
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
          data-testid="input-image-upload"
        />
        <label htmlFor="image-upload">
          <Card className="p-4 cursor-pointer hover-elevate" data-testid="button-upload-image">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Add Image</div>
                <div className="text-xs text-muted-foreground">JPEG, PNG, GIF, WebP</div>
              </div>
            </div>
          </Card>
        </label>
        {uploadImageMutation.isPending && (
          <div className="mt-2 text-xs text-muted-foreground">
            Uploading image...
          </div>
        )}
      </div>
    </div>
  );

  const PropertiesPanel = () => (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {editingSlide ? (
        <>
          <div>
            <h3 className="font-semibold mb-4">Slide Properties</h3>
            
            <div className="space-y-4">
              {editingSlide.type === 'image' ? (
                <div className="space-y-2">
                  <Label>Image Slide</Label>
                  <p className="text-sm text-muted-foreground">
                    This is an imported image slide. Image path: {editingSlide.question}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="question">
                    {editingSlide.type === 'heading' ? 'Heading' : 'Question'}
                  </Label>
                  <Textarea
                    id="question"
                    value={editingSlide.question || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, question: e.target.value })}
                    className="resize-none min-h-20"
                    data-testid="input-question"
                  />
                </div>
              )}

              {editingSlide.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Options</Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleAddOption}
                      data-testid="button-add-option"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editingSlide.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleUpdateOption(index, e.target.value)}
                          data-testid={`input-option-${index}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveOption(index)}
                          data-testid={`button-remove-option-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleDeleteSlide}
              disabled={deleteSlideMutation.isPending || slides.length <= 1}
              data-testid="button-delete-slide"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Slide
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          Select a slide to edit
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                data-testid="button-back"
                onClick={() => setLocation('/dashboard')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Sheet open={slidesSheetOpen} onOpenChange={setSlidesSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    data-testid="button-open-slides"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                  <SlidesPanel />
                </SheetContent>
              </Sheet>

              <Logo showText={false} className="hidden sm:block" />
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">{presentation?.title || 'Untitled'}</div>
                <div className="text-xs text-muted-foreground">{slides.length} slides</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2" 
                data-testid="button-save"
                onClick={handleSaveSlide}
                disabled={updateSlideMutation.isPending}
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button 
                size="sm" 
                className="gap-2" 
                data-testid="button-present-editor"
                onClick={handlePresent}
                disabled={slides.length === 0}
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Present</span>
              </Button>

              <Sheet open={propertiesSheetOpen} onOpenChange={setPropertiesSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    data-testid="button-open-properties"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                  <PropertiesPanel />
                </SheetContent>
              </Sheet>

              <div className="hidden sm:flex">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-64 border-r bg-muted/30 overflow-auto">
          <SlidesPanel />
        </aside>

        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {slides.length === 0 ? (
                <Card className="aspect-video flex items-center justify-center p-12">
                  <div className="text-center text-muted-foreground">
                    <p>No slides yet. Add a slide to get started.</p>
                  </div>
                </Card>
              ) : (
                <Card className="aspect-video flex items-center justify-center p-12 relative overflow-hidden">
                  <div className="w-full text-center space-y-6">
                    {currentSlide?.type === 'heading' ? (
                      <h1 className="text-5xl font-bold">{currentSlide.question || "Heading"}</h1>
                    ) : currentSlide?.type === 'image' ? (
                      <img 
                        src={currentSlide.question || ''} 
                        alt={`Slide ${selectedSlideIndex + 1}`} 
                        className="w-full h-full object-contain"
                        data-testid="img-slide"
                      />
                    ) : (
                      <>
                        <h2 className="text-4xl font-bold">{currentSlide?.question || "Your question here"}</h2>
                        {currentSlide?.type === 'multiple_choice' && currentSlide.options && (
                          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {currentSlide.options.map((option, index) => (
                              <Card key={index} className="p-6 hover-elevate cursor-pointer">
                                <div className="font-medium text-lg">{option}</div>
                              </Card>
                            ))}
                          </div>
                        )}
                        {currentSlide?.type === 'word_cloud' && (
                          <div className="text-muted-foreground">Word cloud visualization will appear here</div>
                        )}
                        {currentSlide?.type === 'open_ended' && (
                          <div className="text-muted-foreground">Open text input will appear here</div>
                        )}
                      </>
                    )}
                  </div>
                  <SlideWatermark />
                </Card>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden lg:block w-80 border-l overflow-auto">
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  );
}
