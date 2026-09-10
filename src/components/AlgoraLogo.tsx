interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export default function AlgoraLogo({ size = 32, showText = true, textColor, className = "" }: LogoProps) {
  const textSize = size * 0.5;
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} style={{ lineHeight: 1 }}>
      {/* Mark */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="11" fill="url(#lg1)" />
        {/* A letterform with neural node accent */}
        <path
          d="M13 29L19.5 11H20.5L27 29H24.2L22.8 25H17.2L15.8 29H13Z"
          fill="white"
          fillOpacity="0.15"
        />
        <path
          d="M14.5 28L20.5 12H21L27 28H24.8L23.2 23.5H17.8L16.2 28H14.5Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M18.4 21.8H22.6L20.75 16.8L18.4 21.8Z"
          fill="white"
        />
        {/* Node dot */}
        <circle cx="29.5" cy="10.5" r="3.5" fill="url(#lg2)" />
        <circle cx="29.5" cy="10.5" r="1.8" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="55%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="lg2" x1="0" y1="0" x2="7" y2="7">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: textSize,
            letterSpacing: "-0.03em",
            color: textColor || "var(--text-primary)",
          }}
        >
          Algora
        </span>
      )}
    </div>
  );
}
