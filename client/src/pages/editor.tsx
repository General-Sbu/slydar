import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SlideTypeCard from "@/components/SlideTypeCard";
import SlideWatermark from "@/components/SlideWatermark";
import { SlideCanvas } from "@/components/SlideCanvas";
import { 
  BarChart3, Cloud, MessageSquare, Type, Image as ImageIcon,
  ChevronLeft, Save, Play, Trash2, Plus, Upload, Menu, Settings, Globe, Copy, Palette 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation, Slide, SlideType, SlideElement } from "@shared/schema";
import { useNotification } from "@/hooks/useNotification";
import { Skeleton } from "@/components/ui/skeleton";

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const presentationId = params?.id;

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [slidesSheetOpen, setSlidesSheetOpen] = useState(false);
  const [propertiesSheetOpen, setPropertiesSheetOpen] = useState(false);
  const [inlineEditingHeading, setInlineEditingHeading] = useState(false);
  const [headingText, setHeadingText] = useState<string>('');
  const [inlineEditingOptions, setInlineEditingOptions] = useState<number | null>(null);
  const [optionText, setOptionText] = useState<string>('');
  
  // Debounce ref must be declared before any conditional returns
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: presentation, isLoading: presentationLoading } = useQuery<Presentation>({
    queryKey: ['/api/presentations', presentationId],
    enabled: !!presentationId,
  });

  const { data: slides = [], isLoading: slidesLoading } = useQuery<Slide[]>({
    queryKey: ['/api/presentations', presentationId, 'slides'],
    enabled: !!presentationId,
  });

  const createSlideMutation = useMutation({
    mutationFn: async (slideData: { type: SlideType; question: string; options?: string[]; config?: any }) => {
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
          config: slideData.config || {}
        })
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      showNotification("New slide created", "success");
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
      showNotification("Slide updated", "success");
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
      showNotification("Slide removed", "success");
      setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
    }
  });

  const duplicateSlideMutation = useMutation({
    mutationFn: async (slide: Slide) => {
      const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : -1;
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId,
          type: slide.type,
          order: maxOrder + 1,
          question: slide.question,
          options: slide.options || [],
          config: slide.config || {}
        })
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      showNotification("Slide duplicated", "success");
    }
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const endpoint = presentation?.published 
        ? `/api/presentations/${presentationId}/unpublish`
        : `/api/presentations/${presentationId}/publish`;
      const res = await fetch(endpoint, {
        method: 'PATCH'
      });
      if (!res.ok) throw new Error('Failed to publish');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId] });
      showNotification(
        presentation?.published 
          ? "Presentation removed from library" 
          : "Presentation is now in the library",
        "success"
      );
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
      showNotification(`Imported ${data.slidesCreated} slides from file`, "success");
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ slideId, file }: { slideId: string; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`/api/slides/${slideId}/upload-image`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (editingSlide && data.element) {
        const config = editingSlide.config || { elements: [] };
        const elements = [...(config.elements || []), data.element];
        setEditingSlide({ ...editingSlide, config: { ...config, elements } });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      showNotification("Image added to slide", "success");
    },
    onError: (error: Error) => {
      showNotification(error.message, "error");
    }
  });

  useEffect(() => {
    if (slides.length > 0 && slides[selectedSlideIndex]) {
      setEditingSlide({ ...slides[selectedSlideIndex] });
    }
  }, [selectedSlideIndex, slides]);

  const handleAddSlide = (type: SlideType) => {
    // Helper function to create a default text element
    const createTextElement = (content: string, fontSize: number = 32, y: number = 30, fontWeight: "normal" | "bold" = "normal", textAlign: "left" | "center" | "right" = "center") => ({
      id: crypto.randomUUID(),
      type: "text" as const,
      x: 10,
      y,
      width: 80,
      content,
      fontSize,
      fontWeight,
      textAlign,
      color: presentation?.templateId ? "#000000" : "#000000", // Will inherit from template if available
      rotation: 0
    });

    const defaultData: Record<SlideType, { type: SlideType; question: string; options?: string[]; config?: any }> = {
      multiple_choice: { 
        type: 'multiple_choice', 
        question: "", 
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        config: {
          elements: [createTextElement("New multiple choice question?", 40, 20, "bold", "center")]
        }
      },
      word_cloud: { 
        type: 'word_cloud', 
        question: "", 
        options: [],
        config: {
          elements: [createTextElement("What words come to mind?", 40, 30, "bold", "center")]
        }
      },
      open_ended: { 
        type: 'open_ended', 
        question: "", 
        options: [],
        config: {
          elements: [createTextElement("Share your thoughts...", 40, 30, "bold", "center")]
        }
      },
      heading: { 
        type: 'heading', 
        question: "", 
        options: [],
        config: {
          elements: [
            createTextElement("Replace this with your heading", 18, 20, "bold", "left"),
            createTextElement("Replace this with your body text. Duplicate this text as many times as you would like.", 14, 50, "normal", "left")
          ]
        }
      },
      image: { 
        type: 'image', 
        question: "", 
        options: [],
        config: {
          elements: []
        }
      }
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

  const handleDuplicateSlide = () => {
    if (currentSlide) {
      duplicateSlideMutation.mutate(currentSlide);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    if (!editingSlide || !editingSlide.id) return;
    
    const config = editingSlide.config || { elements: [] };
    const updatedConfig = { ...config, background: color };
    
    setEditingSlide({ ...editingSlide, config: updatedConfig });
    debouncedUpdate(editingSlide.id, updatedConfig);
    showNotification("Background color updated", "success");
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
    if (file && currentSlide?.id) {
      uploadImageMutation.mutate({ slideId: currentSlide.id, file });
      event.target.value = '';
    }
  };

  const handleAddText = () => {
    if (!editingSlide || !editingSlide.id) return;
    
    const config = editingSlide.config || { elements: [] };
    const elements = config.elements || [];
    
    // Create a new text element
    const textColor = currentSlide?.config?.textColor;
    const newTextElement = {
      type: 'text' as const,
      id: `text-${Date.now()}`,
      content: 'Double-click to edit',
      x: 25,
      y: 25,
      width: 50,
      fontSize: 32,
      fontWeight: 'bold' as const,
      textAlign: 'center' as const,
      color: typeof textColor === 'string' ? textColor : undefined,
      rotation: 0,
      zIndex: elements.length + 1,
    };
    
    const updatedElements = [...elements, newTextElement];
    const updatedConfig = { ...config, elements: updatedElements };
    
    setEditingSlide({ ...editingSlide, config: updatedConfig });
    debouncedUpdate(editingSlide.id, updatedConfig);
    
    showNotification("Text added to slide", "success");
  };

  const handleElementUpdate = (elementId: string, updates: Partial<SlideElement>) => {
    if (!editingSlide || !editingSlide.id) return;
    
    const config = editingSlide.config || { elements: [] };
    const elements = config.elements || [];
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } as SlideElement : el
    );
    
    const updatedConfig = { ...config, elements: updatedElements };
    setEditingSlide({ ...editingSlide, config: updatedConfig });
    
    debouncedUpdate(editingSlide.id, updatedConfig);
  };

  const debouncedUpdateRef = useRef<NodeJS.Timeout>();
  const debouncedUpdate = (slideId: string, config: any) => {
    if (debouncedUpdateRef.current) {
      clearTimeout(debouncedUpdateRef.current);
    }
    
    debouncedUpdateRef.current = setTimeout(() => {
      fetch(`/api/slides/${slideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      });
    }, 500);
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

  const handleInlineTextUpdate = (text: string, field: 'question') => {
    if (!currentSlide) return;

    // Update local state immediately for responsive UI
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      updateSlideMutation.mutate({
        id: currentSlide.id,
        data: { [field]: text }
      });
    }, 500);
  };

  const handleInlineOptionUpdate = (optionIndex: number, text: string) => {
    if (!currentSlide || !currentSlide.options) return;

    const newOptions = [...currentSlide.options];
    newOptions[optionIndex] = text;

    // Update local state immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      updateSlideMutation.mutate({
        id: currentSlide.id,
        data: { options: newOptions }
      });
    }, 500);
  };

  const startEditingHeading = () => {
    if (currentSlide) {
      setHeadingText(currentSlide.question || '');
      setInlineEditingHeading(true);
    }
  };

  const finishEditingHeading = () => {
    if (headingText !== currentSlide?.question) {
      // Optimistic update: immediately update the UI
      queryClient.setQueryData<Slide[]>(
        ['/api/presentations', presentationId, 'slides'],
        (old) => old?.map(slide => 
          slide.id === currentSlide?.id 
            ? { ...slide, question: headingText }
            : slide
        ) || []
      );
      handleInlineTextUpdate(headingText, 'question');
    }
    setInlineEditingHeading(false);
  };

  const startEditingOption = (index: number) => {
    if (currentSlide && currentSlide.options && currentSlide.options[index]) {
      setOptionText(currentSlide.options[index]);
      setInlineEditingOptions(index);
    }
  };

  const finishEditingOption = () => {
    if (inlineEditingOptions !== null && optionText !== currentSlide?.options?.[inlineEditingOptions]) {
      // Optimistic update: immediately update the UI
      const newOptions = [...(currentSlide?.options || [])];
      newOptions[inlineEditingOptions] = optionText;
      
      queryClient.setQueryData<Slide[]>(
        ['/api/presentations', presentationId, 'slides'],
        (old) => old?.map(slide => 
          slide.id === currentSlide?.id 
            ? { ...slide, options: newOptions }
            : slide
        ) || []
      );
      handleInlineOptionUpdate(inlineEditingOptions, optionText);
    }
    setInlineEditingOptions(null);
  };

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

          <div>
            <h3 className="font-semibold mb-4">Media</h3>
            <div className="space-y-3">
              <Card 
                className="p-4 cursor-pointer hover-elevate" 
                onClick={handleAddText}
                data-testid="button-add-text"
              >
                <div className="flex items-center gap-3">
                  <Type className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Add Text</div>
                    <div className="text-xs text-muted-foreground">Add moveable text</div>
                  </div>
                </div>
              </Card>
              
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
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Add Image</div>
                      <div className="text-xs text-muted-foreground">Embed on this slide</div>
                    </div>
                  </div>
                </Card>
              </label>
              {uploadImageMutation.isPending && (
                <div className="text-xs text-muted-foreground">
                  Uploading image...
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
                variant={presentation?.published ? "secondary" : "default"}
                size="sm" 
                className="gap-2" 
                data-testid="button-publish"
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{presentation?.published ? "Unpublish" : "Publish"}</span>
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
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Slide Toolbar */}
              {slides.length > 0 && currentSlide && (
                <Card className="p-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddText}
                      data-testid="toolbar-add-text"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Text</span>
                    </Button>

                    <input
                      type="file"
                      id="toolbar-image-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="toolbar-image-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        data-testid="toolbar-upload-image"
                      >
                        <span>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Add Image</span>
                        </span>
                      </Button>
                    </label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid="toolbar-background-color"
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Background</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Background Color</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              '#ffffff', '#f8fafc', '#1e293b', '#0f172a',
                              '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
                              '#eab308', '#22c55e', '#14b8a6', '#06b6d4'
                            ].map((color) => (
                              <button
                                key={color}
                                className="h-10 w-10 rounded-md border-2 hover-elevate active-elevate-2"
                                style={{ backgroundColor: color }}
                                onClick={() => handleBackgroundColorChange(color)}
                                data-testid={`color-${color}`}
                              />
                            ))}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-color" className="text-sm">Custom Color</Label>
                            <Input
                              id="custom-color"
                              type="color"
                              defaultValue={currentSlide?.config?.background || '#ffffff'}
                              onChange={(e) => handleBackgroundColorChange(e.target.value)}
                              className="h-10"
                              data-testid="input-custom-color"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Separator orientation="vertical" className="h-8" />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDuplicateSlide}
                      disabled={duplicateSlideMutation.isPending}
                      data-testid="toolbar-duplicate-slide"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSlide}
                      disabled={deleteSlideMutation.isPending || slides.length <= 1}
                      data-testid="toolbar-delete-slide"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </Card>
              )}

              {/* Slide Canvas */}
              {slides.length === 0 ? (
                <Card className="aspect-video flex items-center justify-center p-12">
                  <div className="text-center text-muted-foreground">
                    <p>No slides yet. Add a slide to get started.</p>
                  </div>
                </Card>
              ) : (
                <Card 
                  className="aspect-video flex items-center justify-center p-12 relative overflow-hidden"
                  style={{
                    backgroundColor: typeof currentSlide?.config?.background === 'string' ? currentSlide.config.background : undefined,
                    color: typeof currentSlide?.config?.textColor === 'string' ? currentSlide.config.textColor : undefined
                  }}
                >
                  <div className="absolute inset-0">
                    <SlideCanvas
                      elements={editingSlide?.config?.elements || []}
                      onElementUpdate={handleElementUpdate}
                      isEditable={true}
                    />
                  </div>
                  <div className="w-full text-center space-y-6 relative z-10 pointer-events-none">
                    {currentSlide?.type === 'image' && currentSlide.question && (
                      <div className="pointer-events-none">
                        <img 
                          src={currentSlide.question || ''} 
                          alt={`Slide ${selectedSlideIndex + 1}`} 
                          className="w-full h-full object-contain"
                          data-testid="img-slide"
                        />
                      </div>
                    )}
                    {currentSlide?.type === 'multiple_choice' && currentSlide.options && (
                      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pointer-events-auto">
                        {currentSlide.options.map((option, index) => (
                          <Card 
                            key={index} 
                            className="p-6 hover-elevate cursor-pointer"
                            onClick={() => startEditingOption(index)}
                          >
                            {inlineEditingOptions === index ? (
                              <Input
                                value={optionText}
                                onChange={(e) => setOptionText(e.target.value)}
                                onBlur={finishEditingOption}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') finishEditingOption();
                                  if (e.key === 'Escape') {
                                    setInlineEditingOptions(null);
                                    setOptionText('');
                                  }
                                }}
                                autoFocus
                                className="font-medium text-lg text-center bg-transparent border-2 border-dashed border-primary/50"
                                data-testid={`input-option-${index}`}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="font-medium text-lg" data-testid={`text-option-${index}`}>
                                {option}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                    {currentSlide?.type === 'word_cloud' && (
                      <div className="text-muted-foreground pointer-events-none">Word cloud visualization will appear here</div>
                    )}
                    {currentSlide?.type === 'open_ended' && (
                      <div className="text-muted-foreground pointer-events-none">Open text input will appear here</div>
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
