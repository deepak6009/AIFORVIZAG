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
        d="M22 68C14 56 14 36 28 24C42 12 56 22 52 38C48 54 26 50 22 68Z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M78 32C86 44 86 64 72 76C58 88 44 78 48 62C52 46 74 50 78 32Z"
        fill={color}
      />
      <circle cx="50" cy="50" r="4.5" fill="white" />
    </svg>
  );
}
