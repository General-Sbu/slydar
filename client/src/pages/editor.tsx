import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SlideTypeCard from "@/components/SlideTypeCard";
import SlideWatermark from "@/components/SlideWatermark";
import { SlideCanvas } from "@/components/SlideCanvas";
import SpinnerWheel from "@/components/SpinnerWheel";
import { 
  BarChart3, Cloud, MessageSquare, Type, Image as ImageIcon,
  ChevronLeft, Save, Play, Trash2, Plus, Upload, Menu, Globe, Copy, Palette, Check, CircleDot, MoreVertical, Pencil, Loader2 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation, Slide, SlideType, SlideElement, Response } from "@shared/schema";
import { defaultSpinnerEntries } from "@shared/schema";
import { useNotification } from "@/hooks/useNotification";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Template } from "@shared/schema";

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const presentationId = params?.id;

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [slidesSheetOpen, setSlidesSheetOpen] = useState(false);
  const [inlineEditingHeading, setInlineEditingHeading] = useState(false);
  const [headingText, setHeadingText] = useState<string>('');
  const [inlineEditingOptions, setInlineEditingOptions] = useState<number | null>(null);
  const [optionText, setOptionText] = useState<string>('');
  const [renameSlideId, setRenameSlideId] = useState<string | null>(null);
  const [renameSlideTitle, setRenameSlideTitle] = useState('');
  
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

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
  });

  const selectedSlide = slides[selectedSlideIndex];
  
  const { data: wordCloudResponses = [] } = useQuery<Response[]>({
    queryKey: ['/api/slides', selectedSlide?.id, 'all-responses'],
    enabled: !!selectedSlide?.id && selectedSlide?.type === 'word_cloud',
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
      // Auto-select the newly created slide (will be at the end)
      setTimeout(() => setSelectedSlideIndex(slides.length), 100);
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
        question: "Your question here", 
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        config: {
          elements: []
        }
      },
      word_cloud: { 
        type: 'word_cloud', 
        question: "", 
        options: [],
        config: {
          elements: [createTextElement("Your Word Cloud question here", 40, 20, "bold", "center")]
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
      },
      spinner: {
        type: 'spinner',
        question: "",
        options: [],
        config: {
          elements: [],
          spinnerEntries: defaultSpinnerEntries
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

  const updatePresentationTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch(`/api/presentations/${presentationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      if (!res.ok) throw new Error('Failed to update template');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId] });
      showNotification("Presentation color scheme updated", "success");
    }
  });

  const handleBackgroundColorChange = (color: string) => {
    if (!editingSlide || !editingSlide.id) return;
    
    const config = editingSlide.config || { elements: [] };
    const updatedConfig = { ...config, background: color };
    
    setEditingSlide({ ...editingSlide, config: updatedConfig });
    debouncedUpdate(editingSlide.id, updatedConfig);
    showNotification("Slide background updated", "success");
  };

  const handleTemplateSelect = (templateId: string) => {
    updatePresentationTemplateMutation.mutate(templateId);
  };

  const handleUpdateOption = (index: number, value: string) => {
    if (editingSlide && editingSlide.options) {
      const newOptions = [...editingSlide.options];
      newOptions[index] = value;
      setEditingSlide({ ...editingSlide, options: newOptions });
    }
  };

  const handleAddOption = () => {
    if (editingSlide && editingSlide.id) {
      const newOptions = [...(editingSlide.options || []), `Option ${(editingSlide.options?.length || 0) + 1}`];
      setEditingSlide({ ...editingSlide, options: newOptions });
      
      // Optimistic update for immediate UI feedback
      queryClient.setQueryData<Slide[]>(
        ['/api/presentations', presentationId, 'slides'],
        (old) => old?.map(slide => 
          slide.id === editingSlide.id 
            ? { ...slide, options: newOptions }
            : slide
        ) || []
      );
      
      // Persist to database
      updateSlideMutation.mutate({
        id: editingSlide.id,
        data: { options: newOptions }
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (editingSlide && editingSlide.options && editingSlide.id) {
      const newOptions = editingSlide.options.filter((_, i) => i !== index);
      setEditingSlide({ ...editingSlide, options: newOptions });
      
      // Optimistic update for immediate UI feedback
      queryClient.setQueryData<Slide[]>(
        ['/api/presentations', presentationId, 'slides'],
        (old) => old?.map(slide => 
          slide.id === editingSlide.id 
            ? { ...slide, options: newOptions }
            : slide
        ) || []
      );
      
      // Persist to database
      updateSlideMutation.mutate({
        id: editingSlide.id,
        data: { options: newOptions }
      });
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

  const getSlideLabel = (slide: Slide, index: number) => {
    if (slide.title) return slide.title;
    const typeLabels: Record<string, string> = {
      'multiple_choice': 'Poll',
      'word_cloud': 'Word Cloud',
      'open_ended': 'Q&A',
      'heading': 'Heading',
      'image': 'Image',
      'spinner': 'Spinner'
    };
    return `${typeLabels[slide.type] || slide.type} ${index + 1}`;
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
          <AnimatePresence mode="popLayout">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  mass: 0.8
                }}
                layout
              >
                <Card 
                  className={`p-3 cursor-pointer hover-elevate ${selectedSlideIndex === index ? 'border-primary' : ''}`}
                  onClick={() => {
                    setSelectedSlideIndex(index);
                    setSlidesSheetOpen(false);
                  }}
                  data-testid={`card-slide-${index}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {renameSlideId === slide.id ? (
                      <Input
                        value={renameSlideTitle}
                        onChange={(e) => setRenameSlideTitle(e.target.value)}
                        onBlur={() => {
                          updateSlideMutation.mutate({
                            id: slide.id,
                            data: { title: renameSlideTitle.trim() || null }
                          });
                          setRenameSlideId(null);
                          setRenameSlideTitle('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateSlideMutation.mutate({
                              id: slide.id,
                              data: { title: renameSlideTitle.trim() || null }
                            });
                            setRenameSlideId(null);
                            setRenameSlideTitle('');
                          } else if (e.key === 'Escape') {
                            setRenameSlideId(null);
                            setRenameSlideTitle('');
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-6 text-sm"
                        placeholder="Slide name"
                        autoFocus
                        data-testid={`input-inline-rename-slide-${index}`}
                      />
                    ) : (
                      <div 
                        className="text-sm font-medium truncate cursor-text hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameSlideId(slide.id);
                          setRenameSlideTitle(slide.title || '');
                        }}
                        data-testid={`text-slide-name-${index}`}
                      >
                        {getSlideLabel(slide, index)}
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" data-testid={`button-slide-menu-${index}`}>
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setRenameSlideId(slide.id);
                          setRenameSlideTitle(slide.title || '');
                        }} data-testid={`menu-item-rename-slide-${index}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          duplicateSlideMutation.mutate(slide);
                        }} data-testid={`menu-item-duplicate-slide-${index}`}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlideMutation.mutate(slide.id);
                          }}
                          className="text-destructive focus:text-destructive"
                          data-testid={`menu-item-delete-slide-${index}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {getSlidePreview(slide)}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
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
          <div onClick={() => { handleAddSlide('spinner'); setSlidesSheetOpen(false); }}>
            <SlideTypeCard
              icon={CircleDot}
              title="Spinner Wheel"
              description="Random picker"
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
          accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
          onChange={handleFileImport}
          data-testid="input-file-upload"
        />
        <label htmlFor="file-upload">
          <Card className="p-4 cursor-pointer hover-elevate" data-testid="button-import-slides">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Import File</div>
                <div className="text-xs text-muted-foreground">PPT, PPTX, or PDF</div>
              </div>
            </div>
          </Card>
        </label>
      </div>

    </div>
  );


  return (
    <div className="h-screen flex flex-col relative">
      {/* Import Loading Overlay */}
      <AnimatePresence>
        {importMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            data-testid="import-loading-overlay"
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <div className="font-semibold">Importing slides...</div>
                <div className="text-sm text-muted-foreground">This may take a moment for large files</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                          <span className="hidden sm:inline">Colors</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <Tabs defaultValue="slide" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="slide" data-testid="tab-slide-background">Slide</TabsTrigger>
                            <TabsTrigger value="presentation" data-testid="tab-presentation-scheme">Presentation</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="slide" className="space-y-3 mt-3">
                            <h4 className="font-medium text-sm">Slide Background</h4>
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
                          </TabsContent>

                          <TabsContent value="presentation" className="space-y-3 mt-3">
                            <h4 className="font-medium text-sm">Presentation Color Scheme</h4>
                            <ScrollArea className="h-[300px] pr-3">
                              <div className="space-y-2">
                                {templates.map((template) => (
                                  <button
                                    key={template.id}
                                    className={`w-full p-3 rounded-md border-2 text-left hover-elevate active-elevate-2 transition-all ${
                                      presentation?.templateId === template.id ? 'ring-2 ring-primary border-primary' : 'border-border'
                                    }`}
                                    onClick={() => handleTemplateSelect(template.id)}
                                    data-testid={`template-${template.id}`}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{template.name}</span>
                                        {presentation?.templateId === template.id && (
                                          <Check className="h-4 w-4 text-primary" />
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        <div 
                                          className="h-6 w-6 rounded border"
                                          style={{ backgroundColor: template.colorScheme.primary }}
                                          title="Primary"
                                        />
                                        <div 
                                          className="h-6 w-6 rounded border"
                                          style={{ backgroundColor: template.colorScheme.secondary }}
                                          title="Secondary"
                                        />
                                        <div 
                                          className="h-6 w-6 rounded border"
                                          style={{ backgroundColor: template.colorScheme.accent }}
                                          title="Accent"
                                        />
                                        <div 
                                          className="h-6 w-6 rounded border"
                                          style={{ backgroundColor: template.colorScheme.background }}
                                          title="Background"
                                        />
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
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
                    backgroundColor: typeof editingSlide?.config?.background === 'string' ? editingSlide.config.background : (typeof currentSlide?.config?.background === 'string' ? currentSlide.config.background : undefined),
                    color: typeof currentSlide?.config?.textColor === 'string' ? currentSlide.config.textColor : undefined
                  }}
                  data-testid="slide-canvas"
                >
                  <div className="absolute inset-0">
                    <SlideCanvas
                      elements={editingSlide?.config?.elements || []}
                      onElementUpdate={handleElementUpdate}
                      isEditable={true}
                    />
                  </div>
                  <div className="w-full h-full text-center space-y-6 relative z-10 pointer-events-none">
                    {currentSlide?.type === 'image' && currentSlide.question && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                        <img 
                          src={currentSlide.question || ''} 
                          alt={`Slide ${selectedSlideIndex + 1}`} 
                          className="max-w-full max-h-full object-contain"
                          data-testid="img-slide"
                        />
                      </div>
                    )}
                    {currentSlide?.type === 'multiple_choice' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        {/* Question at top - bigger and centered */}
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold px-4">
                            {editingSlide?.question || currentSlide.question || 'Your question here'}
                          </h2>
                        </div>
                        
                        {/* Options centered in middle */}
                        <div className="w-full max-w-xl mx-auto px-4">
                          <div className="grid grid-cols-2 gap-3">
                            {(editingSlide?.options || currentSlide.options || []).slice(0, 4).map((option, index) => {
                              const colors = [
                                "hsl(var(--chart-1))",
                                "hsl(var(--chart-2))",
                                "hsl(var(--chart-3))",
                                "hsl(var(--chart-4))",
                                "hsl(var(--chart-5))"
                              ];
                              return (
                                <div 
                                  key={index} 
                                  className="bg-background/90 backdrop-blur rounded-lg px-4 py-3 text-center border"
                                  style={{ borderLeftColor: colors[index % colors.length], borderLeftWidth: '4px' }}
                                >
                                  <span className="font-medium text-sm truncate block">{option}</span>
                                </div>
                              );
                            })}
                          </div>
                          {(editingSlide?.options || currentSlide.options || []).length > 4 && (
                            <div className="text-center text-xs text-muted-foreground mt-2">
                              +{(editingSlide?.options || currentSlide.options || []).length - 4} more options
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'word_cloud' && (
                      <div className="space-y-4">
                        {wordCloudResponses.length > 0 ? (
                          <div className="space-y-3">
                            <div className="text-sm text-muted-foreground text-center">
                              {wordCloudResponses.length} response{wordCloudResponses.length !== 1 ? 's' : ''} collected
                            </div>
                            <div className="relative w-full h-48 overflow-hidden">
                              {(() => {
                                const wordFrequency = wordCloudResponses.reduce((acc, r) => {
                                  const text = r.answer.trim();
                                  if (text) acc[text] = (acc[text] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>);
                                const sortedWords = Object.entries(wordFrequency)
                                  .map(([text, count]) => ({ text, count }))
                                  .sort((a, b) => b.count - a.count)
                                  .slice(0, 15);
                                const maxCount = sortedWords[0]?.count || 1;
                                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];
                                return sortedWords.map((word, index) => {
                                  const fontSize = 14 + (word.count / maxCount) * 20;
                                  const positions = [
                                    { left: '15%', top: '20%' }, { left: '55%', top: '15%' }, { left: '35%', top: '45%' },
                                    { left: '70%', top: '50%' }, { left: '20%', top: '65%' }, { left: '50%', top: '70%' },
                                    { left: '75%', top: '30%' }, { left: '10%', top: '40%' }, { left: '80%', top: '60%' },
                                    { left: '30%', top: '25%' }, { left: '60%', top: '75%' }, { left: '45%', top: '35%' },
                                    { left: '25%', top: '55%' }, { left: '65%', top: '40%' }, { left: '40%', top: '80%' }
                                  ];
                                  const pos = positions[index % positions.length];
                                  const rotation = (index % 5 - 2) * 5;
                                  return (
                                    <span
                                      key={word.text}
                                      className="absolute font-bold whitespace-nowrap"
                                      style={{
                                        left: pos.left,
                                        top: pos.top,
                                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                                        color: colors[index % colors.length],
                                        fontSize: `${fontSize}px`
                                      }}
                                    >
                                      {word.text}
                                    </span>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-48 pointer-events-none overflow-hidden opacity-20">
                            <span className="absolute text-2xl font-bold" style={{ left: '15%', top: '20%', transform: 'rotate(-5deg)', color: '#3b82f6' }}>Innovation</span>
                            <span className="absolute text-xl font-bold" style={{ left: '55%', top: '15%', transform: 'rotate(8deg)', color: '#8b5cf6' }}>Creative</span>
                            <span className="absolute text-3xl font-bold" style={{ left: '35%', top: '45%', transform: 'rotate(-3deg)', color: '#ec4899' }}>Ideas</span>
                            <span className="absolute text-lg font-bold" style={{ left: '70%', top: '50%', transform: 'rotate(12deg)', color: '#f59e0b' }}>Growth</span>
                            <span className="absolute text-xl font-bold" style={{ left: '20%', top: '65%', transform: 'rotate(5deg)', color: '#10b981' }}>Success</span>
                            <span className="absolute text-2xl font-bold" style={{ left: '50%', top: '70%', transform: 'rotate(-8deg)', color: '#06b6d4' }}>Future</span>
                            <span className="absolute text-lg font-bold" style={{ left: '75%', top: '30%', transform: 'rotate(-10deg)', color: '#6366f1' }}>Vision</span>
                            <p className="absolute bottom-2 left-0 right-0 text-center text-sm text-muted-foreground">No responses yet</p>
                          </div>
                        )}
                      </div>
                    )}
                    {currentSlide?.type === 'open_ended' && (
                      <div className="text-muted-foreground pointer-events-none">Open text input will appear here</div>
                    )}
                    {currentSlide?.type === 'spinner' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <SpinnerWheel 
                          entries={editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || defaultSpinnerEntries}
                          isInteractive={false}
                        />
                      </div>
                    )}
                  </div>
                  <SlideWatermark />
                </Card>
              )}

              {/* Poll Creation Form - Wooclap Style */}
              {currentSlide?.type === 'multiple_choice' && (
                <Card className="p-6" data-testid="poll-editor-panel">
                  <div className="space-y-6">
                    {/* Question Section */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">Create a Poll</h3>
                        <p className="text-sm text-muted-foreground">Enter the question you want to ask your audience</p>
                      </div>
                      <div className="space-y-1">
                        <Input
                          placeholder="Question title"
                          value={editingSlide?.question || ''}
                          onChange={(e) => {
                            if (editingSlide) {
                              setEditingSlide({ ...editingSlide, question: e.target.value });
                            }
                          }}
                          onBlur={() => {
                            if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                              updateSlideMutation.mutate({
                                id: editingSlide.id,
                                data: { question: editingSlide.question }
                              });
                            }
                          }}
                          className="text-base"
                          data-testid="input-poll-question"
                        />
                        <p className="text-xs text-muted-foreground">e.g.: Do you think we need to do more to fight climate change?</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Answers Section */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Answers</h3>
                        <p className="text-sm text-muted-foreground">Enter the answers your audience can vote for</p>
                      </div>
                      
                      <div className="space-y-3">
                        {(editingSlide?.options || currentSlide?.options || []).map((option, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <Input
                                  placeholder={`Choice ${index + 1}`}
                                  value={option}
                                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                                  onBlur={() => {
                                    if (editingSlide?.id) {
                                      updateSlideMutation.mutate({
                                        id: editingSlide.id,
                                        data: { options: editingSlide.options }
                                      });
                                    }
                                  }}
                                  className="text-base"
                                  data-testid={`input-choice-${index}`}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveOption(index)}
                                disabled={((editingSlide?.options || currentSlide?.options)?.length ?? 0) <= 2}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                data-testid={`button-delete-choice-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground pl-1">
                              {index === 0 ? 'e.g.: Yes' : index === 1 ? 'e.g.: No' : `e.g.: Option ${index + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleAddOption}
                        className="gap-2"
                        data-testid="button-new-choice"
                      >
                        <Plus className="h-4 w-4" />
                        New choice
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Spinner Wheel Settings Panel */}
              {currentSlide?.type === 'spinner' && (
                <Card className="p-6" data-testid="spinner-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Spinner Wheel</h3>
                      <p className="text-sm text-muted-foreground">Customize the entries on your spinner wheel</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Entries</h3>
                        <p className="text-sm text-muted-foreground">Edit the labels for each wheel segment</p>
                      </div>
                      
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {(editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || defaultSpinnerEntries).map((entry: { id: string; label: string; color: string }, index: number) => (
                          <div key={entry.id} className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full shrink-0"
                              style={{ backgroundColor: entry.color }}
                            />
                            <Input
                              value={entry.label}
                              onChange={(e) => {
                                const entries = [...(editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || defaultSpinnerEntries)];
                                entries[index] = { ...entries[index], label: e.target.value };
                                setEditingSlide({
                                  ...editingSlide,
                                  config: {
                                    elements: editingSlide?.config?.elements || [],
                                    ...editingSlide?.config,
                                    spinnerEntries: entries
                                  }
                                });
                              }}
                              onBlur={() => {
                                if (editingSlide?.id) {
                                  updateSlideMutation.mutate({
                                    id: editingSlide.id,
                                    data: { config: editingSlide.config }
                                  });
                                }
                              }}
                              placeholder={`Entry ${index + 1}`}
                              className="flex-1"
                              data-testid={`input-spinner-entry-${index}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const entries = [...(editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || defaultSpinnerEntries)];
                                if (entries.length > 2) {
                                  entries.splice(index, 1);
                                  const newConfig = {
                                    elements: editingSlide?.config?.elements || [],
                                    ...editingSlide?.config,
                                    spinnerEntries: entries
                                  };
                                  setEditingSlide({
                                    ...editingSlide,
                                    config: newConfig
                                  });
                                  if (editingSlide?.id) {
                                    updateSlideMutation.mutate({
                                      id: editingSlide.id,
                                      data: { config: newConfig }
                                    });
                                  }
                                }
                              }}
                              disabled={(editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || []).length <= 2}
                              className="text-muted-foreground hover:text-destructive shrink-0"
                              data-testid={`button-delete-spinner-entry-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          const entries = [...(editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || defaultSpinnerEntries)];
                          const colors = ["#9333EA", "#DC2626", "#EA580C", "#EAB308", "#22C55E", "#14B8A6", "#3B82F6", "#1E3A8A"];
                          const newEntry = {
                            id: crypto.randomUUID(),
                            label: `Entry ${entries.length + 1}`,
                            color: colors[entries.length % colors.length]
                          };
                          entries.push(newEntry);
                          const newConfig = {
                            elements: editingSlide?.config?.elements || [],
                            ...editingSlide?.config,
                            spinnerEntries: entries
                          };
                          setEditingSlide({
                            ...editingSlide,
                            config: newConfig
                          });
                          if (editingSlide?.id) {
                            updateSlideMutation.mutate({
                              id: editingSlide.id,
                              data: { config: newConfig }
                            });
                          }
                        }}
                        className="gap-2"
                        data-testid="button-add-spinner-entry"
                      >
                        <Plus className="h-4 w-4" />
                        Add entry
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!renameSlideId} onOpenChange={(open) => {
        if (!open) {
          setRenameSlideId(null);
          setRenameSlideTitle('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Slide</DialogTitle>
            <DialogDescription>
              Enter a new name for this slide.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameSlideTitle}
            onChange={(e) => setRenameSlideTitle(e.target.value)}
            placeholder="Slide name"
            data-testid="input-rename-slide"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameSlideId) {
                updateSlideMutation.mutate({
                  id: renameSlideId,
                  data: { title: renameSlideTitle.trim() || null }
                });
                setRenameSlideId(null);
                setRenameSlideTitle('');
              }
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRenameSlideId(null);
              setRenameSlideTitle('');
            }} data-testid="button-cancel-rename-slide">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (renameSlideId) {
                  updateSlideMutation.mutate({
                    id: renameSlideId,
                    data: { title: renameSlideTitle.trim() || null }
                  });
                  setRenameSlideId(null);
                  setRenameSlideTitle('');
                }
              }}
              data-testid="button-confirm-rename-slide"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
