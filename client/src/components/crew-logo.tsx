interface CrewLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function CrewLogo({ size = 32, className = "", color = "currentColor" }: CrewLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M68 16A42 42 0 1 0 68 84"
        stroke={color}
        strokeWidth="13"
        strokeLinecap="round"
      />
      <circle cx="80" cy="50" r="6.5" fill={color} />
    </svg>
  );
}
