import { useRef, useEffect, useCallback } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useInView, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

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
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const hasPlayed = useRef(false);
  const inView = useInView(containerRef, { once: playOnce, margin: "-40px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: scrollOffset as any,
  });

  useEffect(() => {
    if (!lottieRef.current) return;
    lottieRef.current.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (trigger !== "appear" || !lottieRef.current) return;

    if (inView && !hasPlayed.current) {
      lottieRef.current.goToAndPlay(0);
      hasPlayed.current = true;
    } else if (!inView && !playOnce) {
      lottieRef.current.goToAndStop(0);
      hasPlayed.current = false;
    }
  }, [inView, trigger, playOnce]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (trigger !== "scroll" || !lottieRef.current) return;
    const totalFrames = lottieRef.current.getDuration(true) || 60;
    const frame = Math.round(v * totalFrames);
    lottieRef.current.goToAndStop(frame, true);
  });

  const handleMouseEnter = useCallback(() => {
    if (trigger === "hover" && lottieRef.current) {
      lottieRef.current.goToAndPlay(0);
    }
  }, [trigger]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === "hover" && lottieRef.current && !loop) {
      lottieRef.current.goToAndStop(0);
    }
  }, [trigger, loop]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={trigger === "appear" ? loop : false}
        autoplay={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
