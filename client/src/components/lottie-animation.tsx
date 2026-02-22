import { useRef, useEffect, useCallback } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { useInView, useScroll, useMotionValueEvent } from "framer-motion";

type TriggerMode = "appear" | "scroll" | "hover";

interface LottieAnimationProps {
  animationData: object;
  trigger?: TriggerMode;
  loop?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  playOnce?: boolean;
  scrollOffset?: [string, string];
}

export default function LottieAnimation({
  animationData,
  trigger = "appear",
  loop = false,
  speed = 1,
  className = "",
  style,
  playOnce = true,
  scrollOffset = ["start 0.95", "end 0.2"],
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const hasPlayed = useRef(false);
  const inView = useInView(containerRef, { once: playOnce, margin: "-40px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: scrollOffset as any,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: trigger === "appear" ? loop : false,
      autoplay: false,
      animationData,
    });

    anim.setSpeed(speed);
    animRef.current = anim;

    return () => {
      anim.destroy();
      animRef.current = null;
    };
  }, [animationData, trigger, loop]);

  useEffect(() => {
    if (!animRef.current) return;
    animRef.current.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (trigger !== "appear" || !animRef.current) return;

    if (inView && !hasPlayed.current) {
      animRef.current.goToAndPlay(0);
      hasPlayed.current = true;
    } else if (!inView && !playOnce) {
      animRef.current.goToAndStop(0);
      hasPlayed.current = false;
    }
  }, [inView, trigger, playOnce]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (trigger !== "scroll" || !animRef.current) return;
    const clamped = Math.max(0, Math.min(1, v));
    const totalFrames = animRef.current.totalFrames || 60;
    const frame = Math.round(clamped * (totalFrames - 1));
    animRef.current.goToAndStop(frame, true);
  });

  const handleMouseEnter = useCallback(() => {
    if (trigger === "hover" && animRef.current) {
      animRef.current.goToAndPlay(0);
    }
  }, [trigger]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === "hover" && animRef.current && !loop) {
      animRef.current.goToAndStop(0);
    }
  }, [trigger, loop]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: "100%", height: "100%", ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
