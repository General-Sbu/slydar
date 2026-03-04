interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const containerSizeClasses = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${containerSizeClasses[size]} rounded-lg flex items-center justify-center flex-shrink-0`}
        style={{
          background: "linear-gradient(135deg, hsl(355,85%,50%) 0%, hsl(15,92%,54%) 55%, hsl(35,95%,58%) 100%)",
        }}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[72%] h-[72%]"
        >
          {/* Slide / screen frame */}
          <rect
            x="1"
            y="2"
            width="26"
            height="19"
            rx="3"
            fill="white"
            fillOpacity="0.15"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.25"
          />

          {/* Ascending poll bars — left (short), centre (tallest), right (medium) */}
          <rect x="4.5"  y="14"  width="4" height="5.5" rx="1.25" fill="white" fillOpacity="0.85" />
          <rect x="12"   y="9"   width="4" height="10.5" rx="1.25" fill="white" />
          <rect x="19.5" y="11.5" width="4" height="8"   rx="1.25" fill="white" fillOpacity="0.9" />

          {/* Live indicator — outer glow ring + solid dot */}
          <circle cx="23.5" cy="5.5" r="3"   fill="white" fillOpacity="0.25" />
          <circle cx="23.5" cy="5.5" r="1.75" fill="white" />
        </svg>
      </div>

      {showText && (
        <span className={`font-display font-bold tracking-tight ${textSizeClasses[size]}`}>
          Slydar
        </span>
      )}
    </div>
  );
}
