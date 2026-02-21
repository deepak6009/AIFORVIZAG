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
        d="M25 72 C10 58, 10 32, 30 22 C50 12, 60 28, 50 40 C40 52, 20 48, 25 72Z"
        fill={color}
      />
      <path
        d="M75 28 C90 42, 90 68, 70 78 C50 88, 40 72, 50 60 C60 48, 80 52, 75 28Z"
        fill={color}
      />
      <circle cx="50" cy="50" r="5" fill={color} />
    </svg>
  );
}
