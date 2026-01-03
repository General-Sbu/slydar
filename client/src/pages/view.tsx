import { Button } from "@/components/ui/button";
import SlideWatermark from "@/components/SlideWatermark";
import { SlideCanvas } from "@/components/SlideCanvas";
import { ChevronLeft, ChevronRight, ArrowLeft, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Presentation, Slide } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

type PresentationWithSlides = Presentation & {
  slides: Slide[];
  presenterName: string;
};

export default function View() {
  const [, params] = useRoute("/view/:id");
  const [, setLocation] = useLocation();
  const presentationId = params?.id;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const { data: presentation, isLoading } = useQuery<PresentationWithSlides>({
    queryKey: ['/api/library', presentationId],
    enabled: !!presentationId,
  });

  const slides = presentation?.slides || [];
  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'Escape') {
        setLocation('/library');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, slides.length]);

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-4xl px-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-semibold mb-2">Presentation Not Found</h2>
        <p className="text-muted-foreground mb-4">This presentation may not be published or does not exist.</p>
        <Button onClick={() => setLocation('/library')} data-testid="button-back-library">
          Back to Library
        </Button>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-semibold mb-2">No Slides</h2>
        <p className="text-muted-foreground mb-4">This presentation doesn't have any slides yet.</p>
        <Button onClick={() => setLocation('/library')} data-testid="button-back-library">
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate" data-testid="text-presentation-title">
                {presentation.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span data-testid="text-presenter-name">{presentation.presenterName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" data-testid="text-slide-counter">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLocation('/library')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-6xl aspect-video bg-card rounded-lg shadow-lg overflow-hidden">
          {currentSlide && (
            <div className="w-full h-full relative">
              {currentSlide.type === 'content' && currentSlide.config?.background && (
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundColor: currentSlide.config.background,
                    backgroundImage: currentSlide.config.background.startsWith('url') ? currentSlide.config.background : undefined 
                  }} 
                />
              )}
              <SlideCanvas
                elements={currentSlide.config?.elements || []}
                isEditable={false}
              />
              <SlideWatermark />
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 bg-gradient-to-t from-black/50 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousSlide}
              disabled={currentSlideIndex === 0}
              className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
              data-testid="button-previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
              data-testid="button-next"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Read-only view • Press ESC or click the back button to return to library
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
