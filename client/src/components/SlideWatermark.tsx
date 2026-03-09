export default function SlideWatermark() {
  return (
    <div
      className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-60 pointer-events-none select-none"
      data-testid="watermark-slydar"
    >
      <div className="bg-primary rounded flex items-center justify-center" style={{ width: "1.25rem", height: "1.25rem" }}>
        <span className="text-white font-black leading-none text-xs" style={{ letterSpacing: "-0.03em" }}>S</span>
      </div>
      <span className="text-sm font-bold tracking-tight">
        <span className="text-primary">Slyd</span><span className="text-foreground">ar</span>
      </span>
    </div>
  );
}
