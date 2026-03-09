import { Presentation } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-primary rounded-md p-1.5 flex items-center justify-center">
        <Presentation className={`${sizeClasses[size]} text-white`} />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight leading-none ${textSizes[size]}`} style={{ letterSpacing: "-0.02em" }}>
          <span className="text-primary">Slyd</span><span className="text-foreground">ar</span>
        </span>
      )}
    </div>
  );
}
