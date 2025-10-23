import { Card } from "@/components/ui/card";
import { SlideCanvas } from "@/components/SlideCanvas";
import { Eye } from "lucide-react";
import type { Slide } from "@shared/schema";

interface UpcomingSlidePreviewProps {
  slide: Slide | null;
}

export default function UpcomingSlidePreview({ slide }: UpcomingSlidePreviewProps) {
  if (!slide) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Next Slide</h3>
        </div>
        <div className="text-center text-muted-foreground text-sm py-8">
          No more slides
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4" />
        <h3 className="font-semibold text-sm">Next Slide</h3>
      </div>
      <div 
        className="relative bg-muted rounded-md overflow-hidden"
        data-testid="card-upcoming-slide"
      >
        <div className="aspect-video relative">
          <div className="absolute inset-0 opacity-50">
            <SlideCanvas
              elements={slide?.config?.elements || []}
              isEditable={false}
            />
          </div>
          <div className="relative z-10 p-4 flex items-center justify-center h-full">
            {slide.type === 'heading' ? (
              <div className="text-center">
                <h4 className="text-sm font-semibold line-clamp-2">{slide.question || "Heading"}</h4>
              </div>
            ) : slide.type === 'image' ? (
              <div className="flex items-center justify-center h-full">
                <img 
                  src={slide.question || ''} 
                  alt="Next slide preview" 
                  className="max-w-full max-h-full object-contain"
                  data-testid="img-upcoming-slide"
                />
              </div>
            ) : slide.type === 'multiple_choice' && slide.options ? (
              <div className="text-center w-full">
                <h4 className="text-sm font-semibold mb-2 line-clamp-2">{slide.question || "Poll"}</h4>
                <div className="text-xs text-muted-foreground">
                  {slide.options.length} options
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h4 className="text-sm font-semibold line-clamp-3">{slide.question || "Question"}</h4>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
