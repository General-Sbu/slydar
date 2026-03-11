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
import SlideTypeCard from "@/components/SlideTypeCard";
import SlideWatermark from "@/components/SlideWatermark";
import { SlideCanvas } from "@/components/SlideCanvas";
import SpinnerWheel from "@/components/SpinnerWheel";
import FillBlankEditor from "@/components/FillBlankEditor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BarChart3, Cloud, MessageSquare, Type, Image as ImageIcon,
  ChevronLeft, Save, Play, Trash2, Plus, Upload, Menu, Globe, Copy, Palette, Check, CircleDot, MoreVertical, Pencil, Loader2, TextCursorInput,
  Trophy, Puzzle, Keyboard, Link2, HelpCircle, PenTool, CheckSquare, Download, FileText, Presentation as PresentationIcon, ClipboardList
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
  const [presentationTitle, setPresentationTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newSlideModalOpen, setNewSlideModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Debounce ref must be declared before any conditional returns
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
    mutationFn: async ({ slide, insertAfterIndex }: { slide: Slide; insertAfterIndex: number }) => {
      const insertOrder = slide.order + 1;
      
      // Shift all slides after the insertion point
      const slidesToShift = slides.filter(s => s.order >= insertOrder);
      for (const s of slidesToShift) {
        await fetch(`/api/slides/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: s.order + 1 })
        });
      }
      
      // Create the new slide at the insertion point
      const res = await fetch('/api/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId,
          type: slide.type,
          order: insertOrder,
          question: slide.question,
          options: slide.options || [],
          config: slide.config || {}
        })
      });
      if (!res.ok) throw new Error('Failed to duplicate');
      return { newSlide: await res.json(), insertAfterIndex };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId, 'slides'] });
      showNotification("Slide duplicated", "success");
      // Select the newly duplicated slide
      setSelectedSlideIndex(data.insertAfterIndex + 1);
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

  useEffect(() => {
    const el = slideRefs.current.get(selectedSlideIndex);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedSlideIndex]);

  // Sync presentation title when data loads
  useEffect(() => {
    if (presentation) {
      setPresentationTitle(presentation.title || '');
    }
  }, [presentation]);

  const updatePresentationTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/presentations/${presentationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to update title');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations', presentationId] });
      queryClient.invalidateQueries({ queryKey: ['/api/presentations'] });
    }
  });

  const handleTitleChange = (value: string) => {
    setPresentationTitle(value);
    
    // Debounce the save
    if (titleDebounceRef.current) {
      clearTimeout(titleDebounceRef.current);
    }
    
    titleDebounceRef.current = setTimeout(() => {
      updatePresentationTitleMutation.mutate(value);
    }, 500);
  };

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
        config: { elements: [] }
      },
      word_cloud: { 
        type: 'word_cloud', 
        question: "", 
        options: [],
        config: { elements: [createTextElement("Your Word Cloud question here", 40, 20, "bold", "center")] }
      },
      open_ended: { 
        type: 'open_ended', 
        question: "", 
        options: [],
        config: { elements: [createTextElement("Share your thoughts...", 40, 30, "bold", "center")] }
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
        config: { elements: [] }
      },
      spinner: {
        type: 'spinner',
        question: "",
        options: [],
        config: { elements: [], spinnerEntries: defaultSpinnerEntries }
      },
      fill_blank: {
        type: 'fill_blank',
        question: "Fill in the Missing Words",
        options: [],
        config: {
          elements: [createTextElement("Fill in the Missing Words", 40, 10, "bold", "center")],
          fillBlankQuestions: [{ id: crypto.randomUUID(), sentence: "The capital of France is ____.", blanks: [{ answer: "Paris" }] }]
        }
      },
      select_answer: {
        type: 'select_answer',
        question: "Select the correct answer",
        options: ["Answer A", "Answer B", "Answer C", "Answer D"],
        config: { elements: [], correctAnswer: 0 }
      },
      puzzle: {
        type: 'puzzle',
        question: "Solve the puzzle",
        options: [],
        config: { elements: [createTextElement("Solve the Puzzle", 40, 20, "bold", "center")] }
      },
      type_answer: {
        type: 'type_answer',
        question: "Type your answer",
        options: [],
        config: { elements: [] }
      },
      match_pair: {
        type: 'match_pair',
        question: "Match the pairs",
        options: [],
        config: { elements: [createTextElement("Match the Pairs", 40, 20, "bold", "center")], pairs: [{ left: "Item A", right: "Match A" }, { left: "Item B", right: "Match B" }] }
      },
      leaderboard: {
        type: 'leaderboard',
        question: "",
        options: [],
        config: { elements: [createTextElement("Leaderboard", 48, 30, "bold", "center")] }
      },
      poll: {
        type: 'poll',
        question: "What do you think?",
        options: ["Option 1", "Option 2", "Option 3"],
        config: { elements: [] }
      },
      q_a: {
        type: 'q_a',
        question: "",
        options: [],
        config: { elements: [createTextElement("Ask me anything", 40, 30, "bold", "center")] }
      },
      whiteboard: {
        type: 'whiteboard',
        question: "",
        options: [],
        config: { elements: [createTextElement("Whiteboard", 40, 30, "bold", "center")] }
      },
      attendance: {
        type: 'attendance',
        question: "Please Confirm Your Attendance",
        options: [],
        config: { elements: [] }
      }
    };
    
    createSlideMutation.mutate(defaultData[type]);
    setNewSlideModalOpen(false);
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
      duplicateSlideMutation.mutate({ slide: currentSlide, insertAfterIndex: selectedSlideIndex });
    }
  };

  const handleExport = async (format: "pptx" | "pdf") => {
    if (!presentationId || isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/export/${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentationTitle || "presentation"}.${format === "pptx" ? "pptx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showNotification("Export failed. Please try again.", "error");
    } finally {
      setIsExporting(false);
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
    
    // Create a new text element centered on the slide with high z-index to stay on top
    const textColor = currentSlide?.config?.textColor;
    const textElements = elements.filter(el => el.type === 'text');
    const newTextElement = {
      type: 'text' as const,
      id: `text-${Date.now()}`,
      content: 'Double-click to edit',
      x: 25,  // 25% from left with 50% width = centered horizontally
      y: 45,  // 45% from top = vertically centered
      width: 50,
      fontSize: 32,
      fontWeight: 'bold' as const,
      fontStyle: 'normal' as const,
      textDecoration: 'none' as const,
      fontFamily: 'Inter' as const,
      textAlign: 'center' as const,
      color: typeof textColor === 'string' ? textColor : undefined,
      rotation: 0,
      zIndex: 1000 + textElements.length,  // High z-index ensures text is always on top
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
    const updatedSlide = { ...editingSlide, config: updatedConfig };

    if (editingSlide.type === 'word_cloud' && 'content' in updates && updates.content !== undefined) {
      const targetEl = elements.find(el => el.id === elementId);
      if (targetEl?.type === 'text') {
        updatedSlide.question = updates.content as string;
        updateSlideMutation.mutate({ id: editingSlide.id, data: { question: updates.content as string } });
      }
    }

    setEditingSlide(updatedSlide);
    
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

  const slideTypeInfo: Record<string, { label: string; icon: typeof BarChart3 }> = {
    'multiple_choice': { label: 'Multiple Choice', icon: BarChart3 },
    'word_cloud': { label: 'Word Cloud', icon: Cloud },
    'open_ended': { label: 'Open Ended', icon: MessageSquare },
    'heading': { label: 'Heading', icon: Type },
    'image': { label: 'Image', icon: ImageIcon },
    'spinner': { label: 'Spinner Wheel', icon: CircleDot },
    'fill_blank': { label: 'Fill in the Blank', icon: TextCursorInput },
    'select_answer': { label: 'Select Answer', icon: CheckSquare },
    'puzzle': { label: 'Puzzle', icon: Puzzle },
    'type_answer': { label: 'Type Answer', icon: Keyboard },
    'match_pair': { label: 'Match Pair', icon: Link2 },
    'leaderboard': { label: 'Leaderboard', icon: Trophy },
    'poll': { label: 'Poll', icon: BarChart3 },
    'q_a': { label: 'Q&A', icon: HelpCircle },
    'whiteboard': { label: 'Whiteboard', icon: PenTool },
    'attendance': { label: 'Attendance Sheet', icon: ClipboardList },
  };

  const getSlideLabel = (slide: Slide, index: number) => {
    if (slide.title) return slide.title;
    return slideTypeInfo[slide.type]?.label || slide.type;
  };

  const getSlidePreview = (slide: Slide, index: number) => {
    const bgConfig = slide.config?.background;
    const bgColor = typeof bgConfig === 'string' ? bgConfig : undefined;
    
    if (slide.type === 'image' && slide.question) {
      return (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center relative group">
          <img 
            src={slide.question} 
            alt="Slide preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-1 left-1.5 text-[10px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1}
          </span>
        </div>
      );
    }
    
    const label = slideTypeInfo[slide.type]?.label || slide.type.replace('_', ' ');
    
    return (
      <div 
        className="w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center relative group ring-1 ring-black/5 dark:ring-white/10"
        style={{ backgroundColor: bgColor || 'hsl(var(--muted))' }}
      >
        <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium">
          {label}
        </span>
        <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-foreground/50">
          {index + 1}
        </span>
      </div>
    );
  };

  const slideTypeGroups = [
    {
      title: "Quiz & Game Competitions",
      types: [
        { type: 'select_answer' as SlideType, label: 'Select Answer', icon: CheckSquare },
        { type: 'puzzle' as SlideType, label: 'Puzzle', icon: Puzzle },
        { type: 'type_answer' as SlideType, label: 'Type Answer', icon: Keyboard },
        { type: 'match_pair' as SlideType, label: 'Match Pair', icon: Link2 },
        { type: 'leaderboard' as SlideType, label: 'Leaderboard', icon: Trophy },
        { type: 'spinner' as SlideType, label: 'Spinner Wheel', icon: CircleDot },
      ]
    },
    {
      title: "Interactive Questions",
      types: [
        { type: 'poll' as SlideType, label: 'Poll', icon: BarChart3 },
        { type: 'word_cloud' as SlideType, label: 'Word Cloud', icon: Cloud },
        { type: 'open_ended' as SlideType, label: 'Open Ended', icon: MessageSquare },
        { type: 'q_a' as SlideType, label: 'Q&A', icon: HelpCircle },
        { type: 'fill_blank' as SlideType, label: 'Fill in the Blank', icon: TextCursorInput },
        { type: 'whiteboard' as SlideType, label: 'Whiteboard', icon: PenTool },
      ]
    },
    {
      title: "Content Slides",
      types: [
        { type: 'heading' as SlideType, label: 'Heading', icon: Type },
        { type: 'image' as SlideType, label: 'Image', icon: ImageIcon },
        { type: 'multiple_choice' as SlideType, label: 'Multiple Choice', icon: BarChart3 },
        { type: 'attendance' as SlideType, label: 'Attendance Sheet', icon: ClipboardList },
      ]
    }
  ];

  const slidesPanel = (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <Button
          className="w-full gap-2"
          onClick={() => { setNewSlideModalOpen(true); setSlidesSheetOpen(false); }}
          data-testid="button-new-slide"
        >
          <Plus className="h-4 w-4" />
          New Slide
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          <AnimatePresence mode="popLayout">
            {slides.map((slide, index) => {
              const info = slideTypeInfo[slide.type];
              const SlideIcon = info?.icon || Type;
              return (
                <motion.div
                  key={slide.id}
                  ref={(el: HTMLDivElement | null) => {
                    if (el) slideRefs.current.set(index, el);
                    else slideRefs.current.delete(index);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.02 }}
                  layout
                >
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all group ${
                      selectedSlideIndex === index
                        ? 'bg-primary/10 ring-1 ring-primary/40'
                        : 'hover-elevate'
                    }`}
                    onClick={() => {
                      setSelectedSlideIndex(index);
                      setSlidesSheetOpen(false);
                    }}
                    data-testid={`card-slide-${index}`}
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0" data-testid={`text-slide-number-${index}`}>
                      {index + 1}
                    </span>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      selectedSlideIndex === index ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <SlideIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
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
                          className="h-6 text-xs"
                          placeholder="Slide name"
                          autoFocus
                          data-testid={`input-inline-rename-slide-${index}`}
                        />
                      ) : (
                        <span
                          className="text-sm font-medium truncate block"
                          data-testid={`text-slide-name-${index}`}
                        >
                          {getSlideLabel(slide, index)}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 invisible group-hover:visible focus:visible active:visible"
                          data-testid={`button-slide-menu-${index}`}
                        >
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
                          duplicateSlideMutation.mutate({ slide, insertAfterIndex: index });
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
          onChange={handleFileImport}
          data-testid="input-file-upload"
        />
        <label htmlFor="file-upload" className="block">
          <Button variant="outline" className="w-full gap-2 cursor-pointer" asChild data-testid="button-import-slides">
            <span>
              <Upload className="h-4 w-4" />
              Import File
            </span>
          </Button>
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

      <header className="border-b glass sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  data-testid="button-back"
                  onClick={() => setLocation('/dashboard')}
                  className="transition-smooth"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <Sheet open={slidesSheetOpen} onOpenChange={setSlidesSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden transition-smooth"
                    data-testid="button-open-slides"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Slides Panel</SheetTitle>
                  </SheetHeader>
                  {slidesPanel}
                </SheetContent>
              </Sheet>

              <Logo showText={false} className="hidden sm:block" />
              <div className="hidden sm:flex flex-col">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative flex items-center">
                      <Input
                        value={presentationTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="My Untitled Presentation"
                        className="h-8 text-sm font-semibold rounded-full bg-muted/50 border-0 pl-4 pr-9 w-56 focus-visible:ring-1 focus:bg-muted transition-smooth"
                        data-testid="input-presentation-title"
                      />
                      <Pencil className="absolute right-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg"
                  >
                    Click to edit name
                  </TooltipContent>
                </Tooltip>
                <motion.div 
                  className="text-xs text-muted-foreground pl-4 flex items-center gap-1"
                  key={slides.length}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="font-medium text-primary">{slides.length}</span> slides
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 transition-smooth" 
                  data-testid="button-save"
                  onClick={handleSaveSlide}
                  disabled={updateSlideMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </motion.div>
              {currentSlide?.type !== 'attendance' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isExporting}
                      className="gap-2 transition-smooth"
                      data-testid="toolbar-export"
                    >
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleExport("pptx")}
                      className="gap-2 cursor-pointer"
                      data-testid="export-pptx"
                    >
                      <PresentationIcon className="h-4 w-4 text-primary" />
                      PowerPoint (.pptx)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport("pdf")}
                      className="gap-2 cursor-pointer"
                      data-testid="export-pdf"
                    >
                      <FileText className="h-4 w-4 text-red-500" />
                      PDF (.pdf)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant={presentation?.published ? "secondary" : "default"}
                  size="sm" 
                  className="gap-2 transition-smooth" 
                  data-testid="button-publish"
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{presentation?.published ? "Unpublish" : "Publish"}</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="sm" 
                  className="gap-2 hover-glow transition-smooth" 
                  data-testid="button-present-editor"
                  onClick={handlePresent}
                  disabled={slides.length === 0}
                >
                  <Play className="h-4 w-4" />
                  <span className="hidden sm:inline">Present</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex lg:flex-col w-[280px] border-r bg-muted/30 overflow-hidden">
          {slidesPanel}
        </aside>

        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Floating Toolbar */}
              {slides.length > 0 && currentSlide && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-3 glass border-0 shadow-lg">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {currentSlide?.type !== 'attendance' && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddText}
                            className="gap-2 transition-smooth border-0 bg-muted/50 hover:bg-muted"
                            data-testid="toolbar-add-text"
                          >
                            <Type className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Text</span>
                          </Button>
                        </motion.div>
                      )}

                      {currentSlide?.type !== 'attendance' && (
                        <>
                          <input
                            type="file"
                            id="toolbar-image-upload"
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleImageUpload}
                          />
                          <motion.label htmlFor="toolbar-image-upload" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2 transition-smooth border-0 bg-muted/50 hover:bg-muted cursor-pointer"
                              data-testid="toolbar-upload-image"
                            >
                              <span>
                                <ImageIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Image</span>
                              </span>
                            </Button>
                          </motion.label>
                        </>
                      )}

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 transition-smooth border-0 bg-muted/50 hover:bg-muted"
                            data-testid="toolbar-background-color"
                          >
                            <Palette className="h-4 w-4" />
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

                      <Separator orientation="vertical" className="h-6 mx-1" />

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDuplicateSlide}
                          disabled={duplicateSlideMutation.isPending}
                          className="gap-2 transition-smooth border-0 bg-muted/50 hover:bg-muted"
                          data-testid="toolbar-duplicate-slide"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="hidden sm:inline">Duplicate</span>
                        </Button>
                      </motion.div>


                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteSlide}
                          disabled={deleteSlideMutation.isPending || slides.length <= 1}
                          className="gap-2 transition-smooth border-0 bg-destructive/10 hover:bg-destructive/20 text-destructive"
                          data-testid="toolbar-delete-slide"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Slide Canvas - Modern Canvas Style */}
              {slides.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="aspect-video flex items-center justify-center p-12 border-dashed border-2 bg-muted/20">
                    <div className="text-center text-muted-foreground space-y-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-lg font-medium">No slides yet</p>
                      <p className="text-sm">Click "+ New Slide" in the sidebar to get started</p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key={`slide-${selectedSlideIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Card 
                    className="aspect-video flex items-center justify-center p-12 relative overflow-hidden shadow-2xl border-0 ring-1 ring-black/5 dark:ring-white/10"
                    style={{
                      backgroundColor: typeof editingSlide?.config?.background === 'string' ? editingSlide.config.background : (typeof currentSlide?.config?.background === 'string' ? currentSlide.config.background : undefined),
                      color: typeof currentSlide?.config?.textColor === 'string' ? currentSlide.config.textColor : undefined
                    }}
                    data-testid="slide-canvas"
                  >
                  <div className="absolute inset-0">
                    <SlideCanvas
                      elements={currentSlide?.type === 'multiple_choice' || currentSlide?.type === 'poll' ? [] : (editingSlide?.config?.elements || [])}
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
                        <div className="text-center mb-4">
                          <h2 className="text-2xl font-bold px-4">
                            {editingSlide?.question || currentSlide.question || 'Your question here'}
                          </h2>
                        </div>
                        <div className="flex items-end justify-center gap-3 w-full max-w-xl mx-auto px-4" style={{ height: '120px' }}>
                          {(editingSlide?.options || currentSlide.options || []).map((option, index) => {
                            const colors = [
                              "hsl(var(--chart-1))",
                              "hsl(var(--chart-2))",
                              "hsl(var(--chart-3))",
                              "hsl(var(--chart-4))",
                              "hsl(var(--chart-5))"
                            ];
                            const barHeight = 30 + (index % 3) * 25;
                            return (
                              <div key={index} className="flex flex-col items-center flex-1 max-w-[100px] min-w-[40px]">
                                <div className="text-[10px] font-bold mb-1" style={{ color: colors[index % colors.length] }}>0</div>
                                <div className="w-full flex items-end" style={{ height: '80px' }}>
                                  <div className="w-full rounded-t-md" style={{ height: `${barHeight}%`, backgroundColor: colors[index % colors.length], opacity: 0.7 }} />
                                </div>
                                <p className="text-[10px] font-medium mt-1 text-center leading-tight line-clamp-2 w-full">{option}</p>
                              </div>
                            );
                          })}
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
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <h2 className="text-2xl font-bold mb-6">{editingSlide?.question || currentSlide.question || 'Share your thoughts...'}</h2>
                        <div className="w-full max-w-md bg-muted/30 rounded-lg p-4 border border-dashed border-muted-foreground/30">
                          <p className="text-sm text-muted-foreground">Audience will type their responses here...</p>
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'poll' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <div className="text-center mb-4">
                          <h2 className="text-2xl font-bold px-4">
                            {editingSlide?.question || currentSlide.question || 'What do you think?'}
                          </h2>
                        </div>
                        <div className="flex items-end justify-center gap-3 w-full max-w-xl mx-auto px-4" style={{ height: '120px' }}>
                          {(editingSlide?.options || currentSlide.options || []).map((option, index) => {
                            const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
                            const barHeight = 30 + (index % 3) * 25;
                            return (
                              <div key={index} className="flex flex-col items-center flex-1 max-w-[100px] min-w-[40px]">
                                <div className="text-[10px] font-bold mb-1" style={{ color: colors[index % colors.length] }}>0</div>
                                <div className="w-full flex items-end" style={{ height: '80px' }}>
                                  <div className="w-full rounded-t-md" style={{ height: `${barHeight}%`, backgroundColor: colors[index % colors.length], opacity: 0.7 }} />
                                </div>
                                <p className="text-[10px] font-medium mt-1 text-center leading-tight line-clamp-2 w-full">{option}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'select_answer' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold px-4">
                            {editingSlide?.question || currentSlide.question || 'Select the correct answer'}
                          </h2>
                        </div>
                        <div className="w-full max-w-xl mx-auto px-4">
                          <div className="grid grid-cols-2 gap-3">
                            {(editingSlide?.options || currentSlide.options || []).map((option, index) => {
                              const correctIdx = editingSlide?.config?.correctAnswer ?? currentSlide.config?.correctAnswer ?? 0;
                              const isCorrect = index === correctIdx;
                              const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];
                              return (
                                <div key={index} className={`bg-background/90 backdrop-blur rounded-lg px-4 py-3 text-center border-2 ${isCorrect ? 'border-green-500 bg-green-500/10' : ''}`} style={{ borderLeftColor: colors[index % colors.length], borderLeftWidth: '4px' }}>
                                  <span className="font-medium text-sm">{option}</span>
                                  {isCorrect && <Check className="inline-block ml-2 h-4 w-4 text-green-500" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'type_answer' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <h2 className="text-2xl font-bold mb-6">{editingSlide?.question || currentSlide.question || 'Type your answer'}</h2>
                        <div className="w-full max-w-md bg-muted/30 rounded-lg p-4 border border-dashed border-muted-foreground/30">
                          <p className="text-sm text-muted-foreground">Type your answer here...</p>
                        </div>
                        {(editingSlide?.config?.correctAnswer !== undefined || currentSlide.config?.correctAnswer !== undefined) && (
                          <div className="mt-4 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/30">
                            <p className="text-xs text-green-600 dark:text-green-400">Correct: {String((editingSlide?.config as any)?.correctAnswer || (currentSlide.config as any)?.correctAnswer || '')}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {currentSlide?.type === 'match_pair' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <h2 className="text-2xl font-bold mb-6">{editingSlide?.question || currentSlide.question || 'Match the pairs'}</h2>
                        <div className="w-full max-w-lg mx-auto">
                          <div className="flex gap-8 justify-center">
                            <div className="space-y-3 flex-1">
                              {((editingSlide?.config as any)?.pairs || (currentSlide.config as any)?.pairs || []).map((pair: any, i: number) => (
                                <div key={i} className="bg-primary/10 rounded-lg px-4 py-2.5 text-center border border-primary/20">
                                  <span className="text-sm font-medium">{pair.left}</span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-3 flex-1">
                              {((editingSlide?.config as any)?.pairs || (currentSlide.config as any)?.pairs || []).map((pair: any, i: number) => (
                                <div key={i} className="bg-accent/30 rounded-lg px-4 py-2.5 text-center border border-accent/30">
                                  <span className="text-sm font-medium">{pair.right}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'q_a' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <HelpCircle className="h-12 w-12 text-primary/40 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{editingSlide?.question || currentSlide.question || 'Ask me anything'}</h2>
                        <p className="text-sm text-muted-foreground">Audience questions will appear here in real-time</p>
                      </div>
                    )}
                    {currentSlide?.type === 'puzzle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <Puzzle className="h-12 w-12 text-primary/40 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">{editingSlide?.question || currentSlide.question || 'Solve the puzzle'}</h2>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="w-12 h-12 rounded-md bg-muted/50 border border-muted-foreground/20 flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">{i + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'leaderboard' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <Trophy className="h-12 w-12 text-yellow-500/60 mb-4" />
                        <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
                        <div className="w-full max-w-sm space-y-2">
                          {['1st Place', '2nd Place', '3rd Place'].map((place, i) => (
                            <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-2.5">
                              <span className="text-lg font-bold text-primary/60">{i + 1}</span>
                              <div className="flex-1 h-2 bg-muted rounded-full" />
                              <span className="text-xs text-muted-foreground">{place}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'whiteboard' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
                        <PenTool className="h-12 w-12 text-primary/40 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Whiteboard</h2>
                        <p className="text-sm text-muted-foreground">Interactive drawing canvas during presentation</p>
                      </div>
                    )}
                    {currentSlide?.type === 'attendance' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8">
                        <ClipboardList className="h-10 w-10 text-primary/40 mb-3" />
                        <h2 className="text-2xl font-bold mb-5 text-center">
                          {editingSlide?.question || currentSlide.question || 'Please Confirm Your Attendance'}
                        </h2>
                        <div className="w-full max-w-sm space-y-3">
                          <div className="rounded-md border bg-background/60 px-3 py-2 text-sm text-muted-foreground">First Name</div>
                          <div className="rounded-md border bg-background/60 px-3 py-2 text-sm text-muted-foreground">Last Name / Surname</div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-4 w-4 rounded border border-muted-foreground/40" />
                            <span className="text-xs text-muted-foreground">I certify that the above information is correct</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {currentSlide?.type === 'spinner' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <SpinnerWheel 
                          entries={editingSlide?.config?.spinnerEntries || currentSlide?.config?.spinnerEntries || defaultSpinnerEntries}
                          isInteractive={false}
                        />
                      </div>
                    )}
                    {currentSlide?.type === 'fill_blank' && (
                      <div className="absolute inset-0 p-6 flex flex-col justify-center pointer-events-none overflow-auto">
                        <div className="space-y-3 max-w-2xl mx-auto">
                          {(editingSlide?.config?.fillBlankQuestions || currentSlide?.config?.fillBlankQuestions || []).slice(0, 3).map((q: any, i: number) => (
                            <div key={q.id || i} className="bg-muted/50 rounded-lg p-3 text-sm">
                              <span className="text-muted-foreground mr-2">{i + 1}.</span>
                              {q.sentence.split('____').map((part: string, pi: number, arr: string[]) => (
                                <span key={pi}>
                                  {part}
                                  {pi < arr.length - 1 && (
                                    <span className="inline-block min-w-[50px] border-b-2 border-primary mx-1" />
                                  )}
                                </span>
                              ))}
                            </div>
                          ))}
                          {(editingSlide?.config?.fillBlankQuestions || currentSlide?.config?.fillBlankQuestions || []).length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{(editingSlide?.config?.fillBlankQuestions || currentSlide?.config?.fillBlankQuestions || []).length - 3} more questions
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <SlideWatermark />
                </Card>
                </motion.div>
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

              {/* Fill in the Blank Editor Panel */}
              {currentSlide?.type === 'fill_blank' && (
                <Card className="p-6" data-testid="fill-blank-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Fill in the Blank</h3>
                      <p className="text-sm text-muted-foreground">Create sentences with missing words for your audience to complete</p>
                    </div>

                    <Separator />

                    <FillBlankEditor
                      questions={editingSlide?.config?.fillBlankQuestions || currentSlide?.config?.fillBlankQuestions || []}
                      onChange={(questions) => {
                        const newConfig = {
                          elements: editingSlide?.config?.elements || [],
                          ...editingSlide?.config,
                          fillBlankQuestions: questions
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
                    />
                  </div>
                </Card>
              )}

              {/* Poll Editor Panel */}
              {currentSlide?.type === 'poll' && (
                <Card className="p-6" data-testid="poll-type-editor-panel">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">Poll</h3>
                        <p className="text-sm text-muted-foreground">Ask your audience a question and let them vote</p>
                      </div>
                      <div className="space-y-1">
                        <Label>Question</Label>
                        <Input
                          placeholder="What do you think?"
                          value={editingSlide?.question || ''}
                          onChange={(e) => {
                            if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                          }}
                          onBlur={() => {
                            if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                              updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                            }
                          }}
                          data-testid="input-poll-type-question"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Options</h3>
                        <p className="text-sm text-muted-foreground">Add the choices your audience can vote on</p>
                      </div>
                      <div className="space-y-3">
                        {(editingSlide?.options || currentSlide?.options || []).map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) => handleUpdateOption(index, e.target.value)}
                              onBlur={() => {
                                if (editingSlide?.id) {
                                  updateSlideMutation.mutate({ id: editingSlide.id, data: { options: editingSlide.options } });
                                }
                              }}
                              className="flex-1"
                              data-testid={`input-poll-option-${index}`}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} disabled={((editingSlide?.options || currentSlide?.options)?.length ?? 0) <= 2} className="text-muted-foreground shrink-0" data-testid={`button-delete-poll-option-${index}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" onClick={handleAddOption} className="gap-2" data-testid="button-add-poll-option">
                        <Plus className="h-4 w-4" />
                        Add option
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Select Answer Editor Panel */}
              {currentSlide?.type === 'select_answer' && (
                <Card className="p-6" data-testid="select-answer-editor-panel">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">Select Answer</h3>
                        <p className="text-sm text-muted-foreground">Create a quiz question with one correct answer</p>
                      </div>
                      <div className="space-y-1">
                        <Label>Question</Label>
                        <Input
                          placeholder="Select the correct answer"
                          value={editingSlide?.question || ''}
                          onChange={(e) => {
                            if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                          }}
                          onBlur={() => {
                            if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                              updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                            }
                          }}
                          data-testid="input-select-answer-question"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Answer Choices</h3>
                        <p className="text-sm text-muted-foreground">Click the circle to mark the correct answer</p>
                      </div>
                      <div className="space-y-3">
                        {(editingSlide?.options || currentSlide?.options || []).map((option, index) => {
                          const correctIdx = (editingSlide?.config as any)?.correctAnswer ?? (currentSlide?.config as any)?.correctAnswer ?? 0;
                          const isCorrect = index === correctIdx;
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const newConfig = { ...editingSlide?.config, correctAnswer: index } as any;
                                  setEditingSlide({ ...editingSlide, config: newConfig });
                                  if (editingSlide?.id) {
                                    updateSlideMutation.mutate({ id: editingSlide.id, data: { config: newConfig } });
                                  }
                                }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isCorrect ? 'border-green-500 bg-green-500' : 'border-muted-foreground/40'}`}
                                data-testid={`button-correct-${index}`}
                              >
                                {isCorrect && <Check className="h-3.5 w-3.5 text-white" />}
                              </button>
                              <Input
                                placeholder={`Answer ${index + 1}`}
                                value={option}
                                onChange={(e) => handleUpdateOption(index, e.target.value)}
                                onBlur={() => {
                                  if (editingSlide?.id) {
                                    updateSlideMutation.mutate({ id: editingSlide.id, data: { options: editingSlide.options } });
                                  }
                                }}
                                className="flex-1"
                                data-testid={`input-select-answer-option-${index}`}
                              />
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} disabled={((editingSlide?.options || currentSlide?.options)?.length ?? 0) <= 2} className="text-muted-foreground shrink-0" data-testid={`button-delete-select-option-${index}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                      <Button variant="outline" onClick={handleAddOption} className="gap-2" data-testid="button-add-select-option">
                        <Plus className="h-4 w-4" />
                        Add answer
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Type Answer Editor Panel */}
              {currentSlide?.type === 'type_answer' && (
                <Card className="p-6" data-testid="type-answer-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Type Answer</h3>
                      <p className="text-sm text-muted-foreground">Audience types their answer, optionally check against the correct one</p>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Question</Label>
                        <Input
                          placeholder="What is the capital of France?"
                          value={editingSlide?.question || ''}
                          onChange={(e) => {
                            if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                          }}
                          onBlur={() => {
                            if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                              updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                            }
                          }}
                          data-testid="input-type-answer-question"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Correct Answer (optional)</Label>
                        <Input
                          placeholder="Paris"
                          value={(editingSlide?.config as any)?.correctAnswer || ''}
                          onChange={(e) => {
                            const newConfig = { ...editingSlide?.config, correctAnswer: e.target.value } as any;
                            setEditingSlide({ ...editingSlide, config: newConfig });
                            if (editingSlide?.id) debouncedUpdate(editingSlide.id, newConfig);
                          }}
                          data-testid="input-type-answer-correct"
                        />
                        <p className="text-xs text-muted-foreground">Leave blank to accept any answer</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Word Cloud Editor Panel */}
              {currentSlide?.type === 'word_cloud' && (
                <Card className="p-6" data-testid="word-cloud-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Word Cloud</h3>
                      <p className="text-sm text-muted-foreground">Audience submits words that form a visual cloud</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label>Question / Prompt</Label>
                      <Input
                        placeholder="What comes to mind when you think of innovation?"
                        value={editingSlide?.question || ''}
                        onChange={(e) => {
                          if (editingSlide) {
                            const newQuestion = e.target.value;
                            const config = editingSlide.config || { elements: [] };
                            const elements = (config.elements || []) as any[];
                            const textEl = elements.find((el: any) => el.type === 'text');
                            const updatedElements = textEl
                              ? elements.map((el: any) => el.id === textEl.id ? { ...el, content: newQuestion } : el)
                              : elements;
                            setEditingSlide({ ...editingSlide, question: newQuestion, config: { ...config, elements: updatedElements } });
                          }
                        }}
                        onBlur={() => {
                          if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                            debouncedUpdate(editingSlide.id, editingSlide.config);
                          }
                        }}
                        data-testid="input-word-cloud-question"
                      />
                      <p className="text-xs text-muted-foreground">This question will be shown to your audience</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Open Ended Editor Panel */}
              {currentSlide?.type === 'open_ended' && (
                <Card className="p-6" data-testid="open-ended-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Open Ended</h3>
                      <p className="text-sm text-muted-foreground">Let your audience share their thoughts freely</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label>Question / Prompt</Label>
                      <Input
                        placeholder="Share your thoughts..."
                        value={editingSlide?.question || ''}
                        onChange={(e) => {
                          if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                        }}
                        onBlur={() => {
                          if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                          }
                        }}
                        data-testid="input-open-ended-question"
                      />
                      <p className="text-xs text-muted-foreground">Audience can submit text responses to this prompt</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Q&A Editor Panel */}
              {currentSlide?.type === 'q_a' && (
                <Card className="p-6" data-testid="qa-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Q&A Session</h3>
                      <p className="text-sm text-muted-foreground">Audience submits questions that you can answer live</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label>Prompt / Title</Label>
                      <Input
                        placeholder="Ask me anything"
                        value={editingSlide?.question || ''}
                        onChange={(e) => {
                          if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                        }}
                        onBlur={() => {
                          if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                          }
                        }}
                        data-testid="input-qa-prompt"
                      />
                      <p className="text-xs text-muted-foreground">Audience can submit and upvote questions in real-time</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Match Pair Editor Panel */}
              {currentSlide?.type === 'match_pair' && (
                <Card className="p-6" data-testid="match-pair-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Match Pairs</h3>
                      <p className="text-sm text-muted-foreground">Audience matches items from the left column to the right</p>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Question</Label>
                        <Input
                          placeholder="Match the pairs"
                          value={editingSlide?.question || ''}
                          onChange={(e) => {
                            if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                          }}
                          onBlur={() => {
                            if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                              updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                            }
                          }}
                          data-testid="input-match-pair-question"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Pairs</h3>
                        <p className="text-sm text-muted-foreground">Each row is a matching pair</p>
                      </div>
                      <div className="space-y-3">
                        {((editingSlide?.config as any)?.pairs || (currentSlide?.config as any)?.pairs || []).map((pair: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="Left item"
                              value={pair.left}
                              onChange={(e) => {
                                const pairs = [...((editingSlide?.config as any)?.pairs || [])];
                                pairs[index] = { ...pairs[index], left: e.target.value };
                                const newConfig = { ...editingSlide?.config, pairs } as any;
                                setEditingSlide({ ...editingSlide, config: newConfig });
                                if (editingSlide?.id) debouncedUpdate(editingSlide.id, newConfig);
                              }}
                              className="flex-1"
                              data-testid={`input-pair-left-${index}`}
                            />
                            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Input
                              placeholder="Right item"
                              value={pair.right}
                              onChange={(e) => {
                                const pairs = [...((editingSlide?.config as any)?.pairs || [])];
                                pairs[index] = { ...pairs[index], right: e.target.value };
                                const newConfig = { ...editingSlide?.config, pairs } as any;
                                setEditingSlide({ ...editingSlide, config: newConfig });
                                if (editingSlide?.id) debouncedUpdate(editingSlide.id, newConfig);
                              }}
                              className="flex-1"
                              data-testid={`input-pair-right-${index}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const pairs = [...((editingSlide?.config as any)?.pairs || [])];
                                if (pairs.length > 2) {
                                  pairs.splice(index, 1);
                                  const newConfig = { ...editingSlide?.config, pairs } as any;
                                  setEditingSlide({ ...editingSlide, config: newConfig });
                                  if (editingSlide?.id) {
                                    updateSlideMutation.mutate({ id: editingSlide.id, data: { config: newConfig } });
                                  }
                                }
                              }}
                              disabled={((editingSlide?.config as any)?.pairs || []).length <= 2}
                              className="text-muted-foreground shrink-0"
                              data-testid={`button-delete-pair-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const pairs = [...((editingSlide?.config as any)?.pairs || [])];
                          pairs.push({ left: `Item ${pairs.length + 1}`, right: `Match ${pairs.length + 1}` });
                          const newConfig = { ...editingSlide?.config, pairs } as any;
                          setEditingSlide({ ...editingSlide, config: newConfig });
                          if (editingSlide?.id) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { config: newConfig } });
                          }
                        }}
                        className="gap-2"
                        data-testid="button-add-pair"
                      >
                        <Plus className="h-4 w-4" />
                        Add pair
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Puzzle Editor Panel */}
              {currentSlide?.type === 'puzzle' && (
                <Card className="p-6" data-testid="puzzle-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Puzzle</h3>
                      <p className="text-sm text-muted-foreground">Create a puzzle challenge for your audience</p>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Question / Instructions</Label>
                        <Input
                          placeholder="Solve the puzzle"
                          value={editingSlide?.question || ''}
                          onChange={(e) => {
                            if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                          }}
                          onBlur={() => {
                            if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                              updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                            }
                          }}
                          data-testid="input-puzzle-question"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Answer</Label>
                        <Input
                          placeholder="The answer to the puzzle"
                          value={(editingSlide?.config as any)?.puzzleAnswer || ''}
                          onChange={(e) => {
                            const newConfig = { ...editingSlide?.config, puzzleAnswer: e.target.value } as any;
                            setEditingSlide({ ...editingSlide, config: newConfig });
                            if (editingSlide?.id) debouncedUpdate(editingSlide.id, newConfig);
                          }}
                          data-testid="input-puzzle-answer"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Hint (optional)</Label>
                        <Input
                          placeholder="A helpful hint..."
                          value={(editingSlide?.config as any)?.puzzleHint || ''}
                          onChange={(e) => {
                            const newConfig = { ...editingSlide?.config, puzzleHint: e.target.value } as any;
                            setEditingSlide({ ...editingSlide, config: newConfig });
                            if (editingSlide?.id) debouncedUpdate(editingSlide.id, newConfig);
                          }}
                          data-testid="input-puzzle-hint"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Leaderboard Editor Panel */}
              {currentSlide?.type === 'leaderboard' && (
                <Card className="p-6" data-testid="leaderboard-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Leaderboard</h3>
                      <p className="text-sm text-muted-foreground">Displays participant scores and rankings during the presentation</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        placeholder="Leaderboard"
                        value={editingSlide?.question || ''}
                        onChange={(e) => {
                          if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                        }}
                        onBlur={() => {
                          if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                          }
                        }}
                        data-testid="input-leaderboard-title"
                      />
                      <p className="text-xs text-muted-foreground">Scores are calculated automatically from quiz answers</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Whiteboard Editor Panel */}
              {currentSlide?.type === 'whiteboard' && (
                <Card className="p-6" data-testid="whiteboard-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Whiteboard</h3>
                      <p className="text-sm text-muted-foreground">An interactive drawing canvas for live collaboration</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        placeholder="Whiteboard"
                        value={editingSlide?.question || ''}
                        onChange={(e) => {
                          if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                        }}
                        onBlur={() => {
                          if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                          }
                        }}
                        data-testid="input-whiteboard-title"
                      />
                      <p className="text-xs text-muted-foreground">The drawing tools will be available during the presentation</p>
                    </div>
                  </div>
                </Card>
              )}
              {currentSlide?.type === 'attendance' && (
                <Card className="p-6" data-testid="attendance-editor-panel">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Attendance Sheet</h3>
                      <p className="text-sm text-muted-foreground">Audience members enter their name and confirm attendance</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label>Heading</Label>
                      <Input
                        placeholder="Please Confirm Your Attendance"
                        value={editingSlide?.question || ''}
                        onChange={(e) => {
                          if (editingSlide) setEditingSlide({ ...editingSlide, question: e.target.value });
                        }}
                        onBlur={() => {
                          if (editingSlide?.id && editingSlide.question !== currentSlide?.question) {
                            updateSlideMutation.mutate({ id: editingSlide.id, data: { question: editingSlide.question } });
                          }
                        }}
                        data-testid="input-attendance-heading"
                      />
                      <p className="text-xs text-muted-foreground">This heading is shown at the top of the attendance form</p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Form fields (fixed)</p>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /><span>First Name</span></div>
                        <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /><span>Last Name / Surname</span></div>
                        <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-primary" /><span>Certification checkbox</span></div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={newSlideModalOpen} onOpenChange={setNewSlideModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Slide Type</DialogTitle>
            <DialogDescription>
              Select the type of slide you want to add to your presentation.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-3">
              {slideTypeGroups.map((group) => (
                <div key={group.title} className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider" data-testid={`text-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {group.title}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {group.types.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.type}
                          className="flex flex-col items-center gap-2 p-4 rounded-md border bg-card hover-elevate active-elevate-2 transition-all text-center"
                          onClick={() => handleAddSlide(item.type)}
                          data-testid={`tile-slide-type-${item.type}`}
                        >
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <ItemIcon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xs font-medium leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
