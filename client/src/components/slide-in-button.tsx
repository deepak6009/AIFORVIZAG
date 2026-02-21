import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface SlideInButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light" | "outline";
  className?: string;
  icon?: boolean;
  fullWidth?: boolean;
  "data-testid"?: string;
}

export default function SlideInButton({
  children,
  onClick,
  size = "md",
  variant = "dark",
  className = "",
  icon = true,
  fullWidth = false,
  "data-testid": testId,
}: SlideInButtonProps) {
  const [hovered, setHovered] = useState(false);

  const sizeStyles = {
    sm: "h-9 px-5 text-sm gap-1.5",
    md: "h-10 px-6 text-sm gap-2",
    lg: "h-11 px-7 text-[15px] gap-2",
  };

  const variantConfig = {
    dark: {
      bg: "bg-gray-900",
      text: "text-white",
      hoverBg: "rgb(37, 99, 235)",
      hoverText: "text-white",
      border: "",
    },
    light: {
      bg: "bg-white",
      text: "text-gray-900",
      hoverBg: "rgb(17, 24, 39)",
      hoverText: "text-white",
      border: "",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-gray-700",
      hoverBg: "rgb(17, 24, 39)",
      hoverText: "text-white",
      border: "border border-gray-300",
    },
  };

  const config = variantConfig[variant];

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-full font-semibold inline-flex items-center justify-center cursor-pointer ${sizeStyles[size]} ${config.bg} ${config.text} ${config.border} ${fullWidth ? "w-full" : ""} ${className}`}
      data-testid={testId}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ clipPath: "circle(0% at 50% 100%)" }}
        animate={{
          clipPath: hovered
            ? "circle(141% at 50% 100%)"
            : "circle(0% at 50% 100%)",
        }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ backgroundColor: config.hoverBg }}
      />

      <span className={`relative z-10 flex items-center ${sizeStyles[size].split(" ").filter(s => s.startsWith("gap")).join(" ")}`}>
        <span>{children}</span>
        {icon && (
          <motion.span
            className="inline-flex"
            animate={{
              x: hovered ? 0 : -4,
              opacity: hovered ? 1 : 0.7,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ArrowRight className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
}