interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: { box: "h-6 w-6 rounded", text: "text-base font-bold" },
    md: { box: "h-7 w-7 rounded-md", text: "text-xl font-bold" },
    lg: { box: "h-9 w-9 rounded-md", text: "text-2xl font-bold" },
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`bg-primary flex items-center justify-center ${iconSizes[size].box}`}
        style={{ aspectRatio: "1 / 1" }}
      >
        <span
          className="text-white font-black leading-none select-none"
          style={{ fontSize: size === "sm" ? "0.85rem" : size === "md" ? "1rem" : "1.25rem", letterSpacing: "-0.03em" }}
        >
          S
        </span>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight leading-none ${textSizes[size]}`} style={{ letterSpacing: "-0.02em" }}>
          <span className="text-primary">Slyd</span><span className="text-foreground">ar</span>
        </span>
      )}
    </div>
  );
}
