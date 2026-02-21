import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, useInView, useSpring, useTransform, useMotionValue, useScroll } from "framer-motion";
import SlideInButton from "@/components/slide-in-button";
import {
  Layers,
  Users,
  FolderTree,
  Upload,
  Shield,
  Zap,
  ArrowRight,
  Play,
  Image,
  Globe,
  Menu,
  X,
  Star,
  Quote,
  CheckCircle2,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

const fadeUpSmall = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease },
  },
};

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollRevealText({ text, className = "", as: Tag = "p", "data-testid": testId }: { text: string; className?: string; as?: "p" | "h1" | "h2" | "h3"; "data-testid"?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "start 0.4"],
  });
  const words = text.split(" ");

  return (
    <Tag ref={ref as any} className={`relative flex flex-wrap ${className}`} data-testid={testId}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return <ScrollWord key={i} word={word} range={[start, end]} progress={scrollYProgress} />;
      })}
    </Tag>
  );
}

function ScrollWord({ word, range, progress }: { word: string; range: [number, number]; progress: any }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.3em] inline-block">
      {word}
    </motion.span>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 50, damping: 20 });
  const rounded = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref}>0{suffix}</span>;
}

const marqueeItems = [
  "Short-Form Content",
  "Creator-Editor Workflow",
  "Clip Management",
  "Raw Footage Storage",
  "Team Collaboration",
  "Instant Previews",
  "Fast Uploads",
  "Multi-Creator Workspace",
  "Role-Based Access",
  "Reels & Shorts",
];

const testimonials = [
  {
    quote: "I used to send raw clips over WhatsApp and pray my editor found the right one. thecrew made that chaos disappear overnight.",
    name: "Sarah Chen",
    role: "Content Creator",
    company: "1.2M followers",
    rating: 5,
  },
  {
    quote: "As an editor working with 4 creators, keeping track of footage was a nightmare. Now every clip, draft, and final cut has a home.",
    name: "Marcus Webb",
    role: "Video Editor",
    company: "Freelance",
    rating: 5,
  },
  {
    quote: "We post 30+ short-form videos a week. thecrew is the only reason our creator-editor pipeline doesn't fall apart.",
    name: "Priya Desai",
    role: "Head of Content",
    company: "Mosaic Media",
    rating: 5,
  },
];

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      className="relative rounded-2xl sm:rounded-[20px] border border-gray-200/60 bg-gray-900 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]"
      variants={scaleIn}
      whileHover={{ boxShadow: "0 24px 70px -15px rgba(0,0,0,0.3)", transition: { duration: 0.4, ease } }}
    >
      <video
        ref={videoRef}
        src="https://d645yzu9m78ar.cloudfront.net/IMG_9172.MP4"
        className="w-full h-full object-cover block"
        playsInline
        autoPlay
        loop
        muted
        data-testid="video-player"
      />
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 z-10">
        <motion.button
          onClick={togglePlay}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          data-testid="button-toggle-play"
          aria-label={isPlaying ? "Pause" : "Play"}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </motion.button>
        <motion.button
          onClick={toggleMute}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          data-testid="button-toggle-mute"
          aria-label={isMuted ? "Unmute" : "Mute"}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
        >
          {isMuted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: FolderTree,
    title: "Content Pipeline Folders",
    description: "Organize by Raw, Drafts, Finals - or build any folder structure that fits your editing workflow.",
    tag: "Organization",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    tagColor: "bg-blue-500/10 text-blue-600",
    accentColor: "bg-blue-500",
    hoverBorder: "rgba(59, 130, 246, 0.25)",
    hoverShadow: "0 20px 50px -12px rgba(59, 130, 246, 0.12)",
  },
  {
    icon: Users,
    title: "Creator & Editor Roles",
    description: "Creators upload, editors access what they need. Viewers can review without touching files.",
    tag: "Collaboration",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    tagColor: "bg-blue-500/10 text-blue-600",
    accentColor: "bg-blue-500",
    hoverBorder: "rgba(59, 130, 246, 0.25)",
    hoverShadow: "0 20px 50px -12px rgba(59, 130, 246, 0.12)",
  },
  {
    icon: Upload,
    title: "Drop Your Clips",
    description: "Upload raw footage, B-roll, graphics, and finals directly into any folder. Cloud-backed.",
    tag: "Performance",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-500/10",
    tagColor: "bg-indigo-500/10 text-indigo-600",
    accentColor: "bg-indigo-500",
    hoverBorder: "rgba(99, 102, 241, 0.25)",
    hoverShadow: "0 20px 50px -12px rgba(99, 102, 241, 0.12)",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Your unreleased content stays protected with workspace-level access control.",
    tag: "Security",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-500/10",
    tagColor: "bg-indigo-500/10 text-indigo-600",
    accentColor: "bg-indigo-500",
    hoverBorder: "rgba(99, 102, 241, 0.25)",
    hoverShadow: "0 20px 50px -12px rgba(99, 102, 241, 0.12)",
  },
  {
    icon: Globe,
    title: "Multi-Creator Workspaces",
    description: "Run separate workspaces per creator, brand, or project - all from one account.",
    tag: "Scale",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    tagColor: "bg-blue-500/10 text-blue-600",
    accentColor: "bg-blue-500",
    hoverBorder: "rgba(59, 130, 246, 0.25)",
    hoverShadow: "0 20px 50px -12px rgba(59, 130, 246, 0.12)",
  },
  {
    icon: Zap,
    title: "Instant Clip Previews",
    description: "Preview your clips, thumbnails, and graphics right in the browser. No downloads.",
    tag: "Speed",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-500/10",
    tagColor: "bg-indigo-500/10 text-indigo-600",
    accentColor: "bg-indigo-500",
    hoverBorder: "rgba(99, 102, 241, 0.25)",
    hoverShadow: "0 20px 50px -12px rgba(99, 102, 241, 0.12)",
  },
];

function BrandWord({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="font-bold" style={{ color }}>
      {children}
    </span>
  );
}

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass-scrolled border-b border-gray-200/40 shadow-sm" : "border-b border-gray-200/30"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-10 h-14 sm:h-16">
          <div className="flex items-center">
            <span className="text-lg sm:text-xl tracking-[0.02em] lowercase text-gray-900" data-testid="text-app-name">
              <span className="font-light">the</span><span className="font-bold">crew</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => navigate("/auth")}
              className="text-gray-500 hover:text-gray-900 font-medium text-sm px-4 h-9 rounded-full transition-colors duration-200"
              data-testid="button-login"
            >
              Sign In
            </button>
            <SlideInButton onClick={() => navigate("/auth?mode=register")} size="sm" data-testid="button-get-started-nav">
              Get Started
            </SlideInButton>
          </div>
          <button
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200/60 bg-white px-5 py-4 space-y-3">
            <button
              className="w-full h-10 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
              data-testid="button-login-mobile"
            >
              Sign In
            </button>
            <SlideInButton fullWidth onClick={() => { navigate("/auth?mode=register"); setMobileMenuOpen(false); }} data-testid="button-get-started-mobile">
              Get Started
            </SlideInButton>
          </div>
        )}
      </nav>

      <section className="pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28 px-5 sm:px-8 lg:px-10 relative overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"
          animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <RevealSection>
              <motion.p
                variants={fadeUp}
                className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5"
              >
                Built for Short-Form Creators & Editors
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-[2.8rem] leading-[1.02] sm:text-[3.8rem] md:text-[4.5rem] lg:text-[5rem] font-bold tracking-[-0.035em] text-gray-950"
                data-testid="text-hero-heading"
              >
                Your content,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 inline-block animate-gradient-shimmer bg-[length:200%_auto]">
                  finally organized.
                </span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-500 max-w-md leading-[1.7] font-normal"
              >
                The workspace where short-form creators and their editors upload raw clips, organize drafts, and ship final cuts - without the DM chaos.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5"
              >
                <SlideInButton size="lg" onClick={() => navigate("/auth?mode=register")} data-testid="button-get-started">
                  Start for free
                </SlideInButton>
                <SlideInButton size="lg" variant="outline" onClick={() => navigate("/auth")} icon={false} data-testid="button-hero-signin">
                  Sign in
                </SlideInButton>
              </motion.div>
            </RevealSection>

            <RevealSection>
              <HeroVideo />
            </RevealSection>
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-5 overflow-hidden bg-blue-600">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-blue-600 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-blue-600 to-transparent z-10" />
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={i} className="flex items-center gap-5 sm:gap-7 px-5 sm:px-7 shrink-0">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/80 whitespace-nowrap">
                  {item}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
            <RevealSection>
              <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
                The Problem
              </motion.p>
            </RevealSection>
            <RevealSection>
              <motion.h2
                variants={fadeUp}
                data-testid="text-problem-heading"
                className="text-2xl sm:text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.03em] text-gray-900 leading-[1.35]"
              >
                Your clips are scattered across{" "}
                <BrandWord color="#25D366">WhatsApp</BrandWord> threads,{" "}
                <BrandWord color="#4285F4">Google Drive</BrandWord> links,{" "}
                <BrandWord color="#409FFF">WeTransfer</BrandWord> emails, and random DMs. Your editor can't find the right cut. Deadlines slip.
              </motion.h2>
            </RevealSection>
          </div>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { stat: 73, suffix: "%", label: "of creators", desc: "waste hours every week hunting for the right clip or draft" },
              { stat: 5, suffix: "+", label: "apps used", desc: "the average creator-editor team uses to exchange content files" },
              { stat: 40, suffix: "%", label: "of footage", desc: "gets lost or duplicated across DMs, drives, and email threads" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUpSmall}>
                <motion.div
                  className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/60 cursor-default group"
                  data-testid={`card-stat-${i}`}
                  whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.2)", boxShadow: "0 20px 50px -12px rgba(59, 130, 246, 0.1)" }}
                  transition={{ duration: 0.3, ease }}
                >
                  <p className="text-4xl sm:text-5xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                    <AnimatedCounter value={item.stat} suffix={item.suffix} />
                  </p>
                  <p className="text-[11px] font-semibold text-gray-900 mt-3 uppercase tracking-[0.15em]">
                    {item.label}
                  </p>
                  <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </RevealSection>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
                The Solution
              </p>
              <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]" data-testid="text-features-heading">
                One workspace for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  your entire content pipeline
                </span>
                .
              </h2>
              <p className="mt-4 sm:mt-6 text-[15px] sm:text-lg text-gray-400 leading-[1.7]">
                thecrew gives creators and editors a single space to upload raw clips,
                organize drafts, and deliver final cuts - all without leaving the platform.
              </p>
            </motion.div>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeUpSmall}>
                  <motion.div
                    className="group h-full bg-[#fafafa] rounded-2xl border border-gray-200/60 cursor-default overflow-hidden"
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                    whileHover={{
                      y: -4,
                      borderColor: feature.hoverBorder,
                      boxShadow: feature.hoverShadow,
                    }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <div className={`h-1 w-full ${feature.accentColor} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className="p-6 sm:p-7">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center`}
                          whileHover={{ scale: 1.08, rotate: -4 }}
                          transition={{ duration: 0.25, ease }}
                        >
                          <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                        </motion.div>
                        <span className={`text-[10px] font-medium uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${feature.tagColor}`}>
                          {feature.tag}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5 tracking-[-0.01em]">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </RevealSection>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-10 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/[0.06] rounded-full blur-[80px]"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-60 h-60 bg-indigo-500/[0.05] rounded-full blur-[80px]"
          animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-6xl mx-auto relative">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4 sm:mb-5">
                How It Works
              </p>
              <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] leading-[1.12]">
                Three steps to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  content flow.
                </span>
              </h2>
            </motion.div>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-5 lg:gap-6 relative">
            {[
              { step: "01", title: "Create a workspace", desc: "Set up a workspace for your channel, brand, or project in seconds.", icon: Layers },
              { step: "02", title: "Add your editors", desc: "Invite editors with the right access level - they see what you want them to see.", icon: Users },
              { step: "03", title: "Upload & ship", desc: "Drop your raw clips, organize by stage, and let your editors get to work.", icon: Upload },
            ].map((item, i) => {
              const StepIcon = item.icon;
              return (
                <motion.div key={i} variants={fadeUpSmall}>
                  <motion.div
                    className="relative bg-white/[0.04] rounded-2xl p-6 sm:p-7 border border-white/[0.06] backdrop-blur-sm group"
                    data-testid={`card-step-${item.step}`}
                    whileHover={{ y: -4, borderColor: "rgba(96, 165, 250, 0.2)", backgroundColor: "rgba(255,255,255,0.06)" }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <motion.div
                        className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center"
                        whileHover={{ scale: 1.08, rotate: -4 }}
                        transition={{ duration: 0.25, ease }}
                      >
                        <StepIcon className="w-5 h-5 text-blue-400" />
                      </motion.div>
                      <span className="text-[10px] font-semibold text-blue-400 tracking-[0.2em] uppercase bg-blue-400/10 px-2.5 py-1 rounded-full">
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 tracking-[-0.02em]">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-[1.7]">{item.desc}</p>
                    {i < 2 && (
                      <div className="hidden sm:flex absolute -right-3 lg:-right-3 top-1/2 -translate-y-1/2 z-10">
                        <ArrowRight className="w-4 h-4 text-blue-400/40" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </RevealSection>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-10 bg-white border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
                Kind Words
              </p>
              <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]">
                Trusted by creators who{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  ship daily
                </span>
                .
              </h2>
            </motion.div>
          </RevealSection>

          <RevealSection className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUpSmall}>
                <motion.div
                  className="bg-[#fafafa] rounded-2xl border border-gray-200/60 h-full flex flex-col cursor-default overflow-hidden group"
                  data-testid={`card-testimonial-${i}`}
                  whileHover={{
                    y: -4,
                    borderColor: "rgba(59, 130, 246, 0.2)",
                    boxShadow: "0 20px 50px -12px rgba(59, 130, 246, 0.08)",
                  }}
                  transition={{ duration: 0.3, ease }}
                >
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="p-6 sm:p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-gray-200" />
                    </div>
                    <p className="text-gray-600 text-sm sm:text-[15px] leading-[1.7] flex-1">
                      "{t.quote}"
                    </p>
                    <div className="mt-5 pt-4 border-t border-gray-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium text-xs">
                          {t.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 tracking-[-0.01em]">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.role}, {t.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </RevealSection>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <RevealSection>
              <motion.p variants={fadeUp} className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
                Built for Creators & Editors
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]"
                data-testid="text-highlights-heading"
              >
                Everything your content team needs,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  nothing it doesn't.
                </span>
              </motion.h2>
              <ScrollRevealText
                text="We stripped away the complexity of traditional file sharing and built something creator-editor teams actually enjoy using."
                className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-gray-400 leading-[1.7]"
              />
              <motion.div variants={staggerContainer} className="mt-7 sm:mt-9 space-y-3">
                {[
                  "Separate workspaces per creator",
                  "Cloud-backed clip storage",
                  "Creator & editor role management",
                  "Raw > Draft > Final folder trees",
                  "Video & image preview support",
                  "Secure access for your whole team",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    variants={fadeUpSmall}
                    className="flex items-center gap-3 group"
                    data-testid={`text-highlight-${index}`}
                  >
                    <CheckCircle2 className="w-[18px] h-[18px] text-blue-500 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-gray-600 font-medium text-sm sm:text-[15px]">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </RevealSection>

            <RevealSection>
              <motion.div
                variants={scaleIn}
                className="bg-gray-950 rounded-2xl sm:rounded-[20px] p-6 sm:p-8 lg:p-9 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }} />
                <div className="relative space-y-4">
                  {[
                    { icon: Shield, title: "Your content stays private", desc: "Role-based access so editors only see what you share" },
                    { icon: FolderTree, title: "Pipeline-ready folders", desc: "Raw > Edit > Review > Final - nest as deep as you need" },
                    { icon: Image, title: "Every format, instantly", desc: "Upload MP4s, MOVs, PNGs, JPGs, and preview them all in-browser" },
                  ].map((item) => (
                    <motion.div
                      key={item.title}
                      className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4 sm:p-5 border border-white/[0.05] group"
                      whileHover={{
                        y: -2,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        borderColor: "rgba(96, 165, 250, 0.15)",
                      }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <motion.div
                        className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.08, rotate: -6 }}
                        transition={{ duration: 0.25 }}
                      >
                        <item.icon className="w-4 h-4 text-blue-400" />
                      </motion.div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-[15px] text-white/90 tracking-[-0.01em]">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </RevealSection>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 px-5 sm:px-8 lg:px-10 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.07] rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.12, 0.07] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="max-w-3xl mx-auto relative text-center">
          <RevealSection>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] leading-[1.12]">
              Ready to get your content pipeline
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                under control?
              </span>
            </motion.h2>
            <ScrollRevealText
              text="Join creators and editors who already use thecrew to keep their clips organized, accessible, and ready to post."
              className="mt-5 sm:mt-7 text-[15px] sm:text-lg text-gray-400 max-w-lg mx-auto leading-[1.7] justify-center"
            />
            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5">
              <SlideInButton size="lg" variant="light" onClick={() => navigate("/auth?mode=register")} data-testid="button-cta-get-started">
                Get started - it's free
              </SlideInButton>
            </motion.div>
          </RevealSection>
        </div>
      </section>

      <footer className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 border-t border-gray-200/60 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-8 sm:gap-6 lg:gap-10">
            <div className="col-span-2 sm:col-span-3">
              <div className="flex items-center mb-1">
                <span className="text-gray-900 text-[15px] tracking-[0.02em] lowercase"><span className="font-light">the</span><span className="font-bold">crew</span></span>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Product</h4>
              <ul className="space-y-2.5">
                {["Workspaces", "Folders", "Uploads", "Team Roles", "Previews"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 hover:translate-x-0.5 inline-block transition-all duration-200 cursor-default" data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Resources</h4>
              <ul className="space-y-2.5">
                {[{ label: "Help Center", path: "/help-center" }, { label: "Blog", path: "/blog" }, { label: "Changelog", path: "/changelog" }].map((item) => (
                  <li key={item.label}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 hover:translate-x-0.5 inline-block transition-all duration-200 cursor-pointer" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[{ label: "About", path: "/about" }, { label: "Pricing", path: "/pricing" }, { label: "Privacy Policy", path: "/privacy-policy" }].map((item) => (
                  <li key={item.label}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 hover:translate-x-0.5 inline-block transition-all duration-200 cursor-pointer" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-3">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Help</h4>
              <ul className="space-y-2.5">
                {[{ label: "Support", path: "/support" }, { label: "Request a Feature", path: "/request-feature" }, { label: "Contact Us", path: "/contact" }].map((item) => (
                  <li key={item.label}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 hover:translate-x-0.5 inline-block transition-all duration-200 cursor-pointer" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} thecrew. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
