export default function SlideWatermark() {
  return (
    <div 
      className="absolute bottom-4 right-4 flex items-center gap-1 opacity-30 pointer-events-none select-none"
      data-testid="watermark-slydar"
    >
      <svg 
        viewBox="0 0 24 24" 
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
      <span className="text-sm font-semibold tracking-wide">
        SLYDAR
      </span>
    </div>
  );
}
