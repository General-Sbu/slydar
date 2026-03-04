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
    lg: "h-8 w-8"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="gradient-purple-blue rounded-md p-1.5 flex items-center justify-center">
        <Presentation className={`${sizeClasses[size]} text-white`} />
      </div>
      {showText && (
        <span className={`font-display font-bold ${textSizeClasses[size]}`}>
          Slydar
        </span>
      )}
    </div>
  );
}
