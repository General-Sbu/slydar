import { Presentation } from "lucide-react";

export default function SlideWatermark() {
  return (
    <div
      className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-60 pointer-events-none select-none"
      data-testid="watermark-slydar"
    >
      <div className="bg-primary rounded-md p-1 flex items-center justify-center">
        <Presentation className="h-4 w-4 text-white" />
      </div>
      <span className="text-sm font-bold tracking-tight">
        <span className="text-primary">Slyd</span><span className="text-foreground">ar</span>
      </span>
    </div>
  );
}
