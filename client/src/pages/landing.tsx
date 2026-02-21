import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";


const marqueeItems = [
  "Media Management",
  "Cloud Storage",
  "Team Collaboration",
  "Nested Folders",
  "Role-Based Access",
  "Instant Previews",
  "Fast Uploads",
  "Multi-Workspace",
  "Secure by Default",
  "Image & Video",
];

const testimonials = [
  {
    quote: "thecrew completely transformed how we manage our creative assets. No more digging through Slack threads for that one file.",
    name: "Sarah Chen",
    role: "Creative Director",
    company: "Bright Studio",
    rating: 5,
  },
  {
    quote: "The folder structure alone saved us hours every week. Our team finally knows exactly where everything lives.",
    name: "Marcus Webb",
    role: "Marketing Lead",
    company: "Onset Digital",
    rating: 5,
  },
  {
    quote: "Simple, fast, and exactly what we needed. We ditched three other tools after switching to thecrew.",
    name: "Priya Desai",
    role: "Operations Manager",
    company: "Mosaic Co",
    rating: 5,
  },
];

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
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
    <div className="relative rounded-2xl sm:rounded-[20px] border border-gray-200/60 bg-gray-900 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
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
        <button
          onClick={togglePlay}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          data-testid="button-toggle-play"
          aria-label={isPlaying ? "Pause" : "Play"}
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
        </button>
        <button
          onClick={toggleMute}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          data-testid="button-toggle-mute"
          aria-label={isMuted ? "Unmute" : "Mute"}
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
        </button>
      </div>
    </div>
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass-scrolled border-b border-gray-200/40 shadow-sm" : "border-b border-transparent"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-10 h-14 sm:h-16">
          <div className="flex items-center">
            <span
              className="text-lg sm:text-xl tracking-[0.02em] lowercase text-gray-900"
              data-testid="text-app-name"
            >
              <span className="font-light">the</span><span className="font-bold">crew</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-gray-500 font-medium text-sm"
              onClick={() => navigate("/auth")}
              data-testid="button-login"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=register")}
              className="bg-gray-900 text-white font-medium rounded-full text-sm"
              data-testid="button-get-started-nav"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
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
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
              data-testid="button-login-mobile"
            >
              Sign In
            </Button>
            <Button
              className="w-full justify-center bg-gray-900 text-white"
              onClick={() => { navigate("/auth?mode=register"); setMobileMenuOpen(false); }}
              data-testid="button-get-started-mobile"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </nav>

      <section className="pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28 px-5 sm:px-8 lg:px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="animate-fade-in-up">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
                AI-Powered Creative Workspace
              </p>
              <h1 className="text-[2.8rem] leading-[1.02] sm:text-[3.8rem] md:text-[4.5rem] lg:text-[5rem] font-bold tracking-[-0.035em] text-gray-950" data-testid="text-hero-heading">
                Your media,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  finally organized.
                </span>
              </h1>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-gray-500 max-w-md leading-[1.7] font-normal animate-fade-in-up-delay">
                Upload, organize, and collaborate on images and videos — with folders, roles, and cloud storage built right in.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 animate-fade-in-up-delay-2">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth?mode=register")}
                  className="bg-gray-900 text-white font-semibold rounded-full px-7"
                  data-testid="button-get-started"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="rounded-full font-semibold text-gray-700 border-gray-300"
                  data-testid="button-hero-signin"
                >
                  Sign in
                </Button>
              </div>
            </div>

            <div className="animate-fade-in-up-delay">
              <HeroVideo />
            </div>
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

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
              The Problem
            </p>
            <h2
              className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]"
              data-testid="text-problem-heading"
            >
              Your media is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
                scattered
              </span>{" "}
              everywhere.
            </h2>
            <p className="mt-4 sm:mt-6 text-[15px] sm:text-lg text-gray-400 leading-[1.7]">
              Files live in Slack threads, Google Drive links, local desktops, and
              email attachments. Nobody knows where the latest version is.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                stat: "73%",
                label: "of teams",
                desc: "waste time searching for the right file version",
              },
              {
                stat: "5+",
                label: "tools",
                desc: "the average team uses to manage their media assets",
              },
              {
                stat: "40%",
                label: "of files",
                desc: "end up duplicated across different platforms",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/60 landing-card-hover" data-testid={`card-stat-${i}`}>
                  <p className="text-4xl sm:text-5xl font-semibold text-gray-900 tracking-[-0.04em]">
                    {item.stat}
                  </p>
                  <p className="text-xs font-medium text-blue-500 mt-2 uppercase tracking-[0.15em]">
                    {item.label}
                  </p>
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
              The Solution
            </p>
            <h2
              className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]"
              data-testid="text-features-heading"
            >
              One place for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                everything visual
              </span>
              .
            </h2>
            <p className="mt-4 sm:mt-6 text-[15px] sm:text-lg text-gray-400 leading-[1.7]">
              thecrew brings your team's images and videos into a single,
              beautifully organized workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                icon: FolderTree,
                title: "Nested Folders",
                description: "Build deep folder hierarchies that mirror how your team thinks.",
                tag: "Organization",
                color: "text-blue-500",
                bg: "bg-blue-50/80",
                tagBg: "bg-blue-50 text-blue-600",
              },
              {
                icon: Users,
                title: "Team Roles",
                description: "Admins, members, viewers - everyone gets the right level of access.",
                tag: "Collaboration",
                color: "text-violet-500",
                bg: "bg-violet-50/80",
                tagBg: "bg-violet-50 text-violet-600",
              },
              {
                icon: Upload,
                title: "Fast Uploads",
                description: "Upload images and videos directly to any folder. Cloud-backed storage.",
                tag: "Performance",
                color: "text-emerald-500",
                bg: "bg-emerald-50/80",
                tagBg: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Shield,
                title: "Secure by Default",
                description: "Workspace-level access control ensures your assets stay protected.",
                tag: "Security",
                color: "text-amber-500",
                bg: "bg-amber-50/80",
                tagBg: "bg-amber-50 text-amber-600",
              },
              {
                icon: Globe,
                title: "Multi-Workspace",
                description: "Run separate workspaces for different clients or projects.",
                tag: "Scale",
                color: "text-cyan-500",
                bg: "bg-cyan-50/80",
                tagBg: "bg-cyan-50 text-cyan-600",
              },
              {
                icon: Zap,
                title: "Instant Previews",
                description: "See your images and videos immediately. No downloads needed.",
                tag: "Speed",
                color: "text-rose-500",
                bg: "bg-rose-50/80",
                tagBg: "bg-rose-50 text-rose-600",
              },
            ].map((feature, i) => (
              <div key={feature.title}>
                <div
                  className="group h-full bg-[#fafafa] rounded-2xl p-6 sm:p-7 border border-gray-200/60 landing-card-hover"
                  data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center`}>
                      <feature.icon className={`w-[18px] h-[18px] ${feature.color}`} />
                    </div>
                    <span className={`text-[10px] font-medium uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${feature.tagBg}`}>
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5 tracking-[-0.01em]">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4 sm:mb-5">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] leading-[1.12]">
              Three steps to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                organized bliss.
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8 lg:gap-14">
            {[
              {
                step: "01",
                title: "Create a workspace",
                desc: "Set up a dedicated workspace for your project or team in seconds.",
                icon: Layers,
              },
              {
                step: "02",
                title: "Invite your team",
                desc: "Add team members with the right roles - admin, member, or viewer.",
                icon: Users,
              },
              {
                step: "03",
                title: "Upload & organize",
                desc: "Create folders, upload your media, and start collaborating immediately.",
                icon: Upload,
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="relative" data-testid={`card-step-${item.step}`}>
                  <div className="text-[5rem] sm:text-[7rem] font-bold text-white/[0.025] leading-none absolute -top-4 sm:-top-6 -left-1 tracking-[-0.05em]">
                    {item.step}
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.05] flex items-center justify-center mb-5 sm:mb-6 border border-white/[0.06]">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-medium text-blue-400 tracking-[0.2em] uppercase mb-3">
                      Step {item.step}
                    </p>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 tracking-[-0.02em]">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-[1.7]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10 bg-white border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
              Kind Words
            </p>
            <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]">
              Trusted by teams who{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                care about craft
              </span>
              .
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <div key={i}>
                <div className="bg-[#fafafa] rounded-2xl p-6 sm:p-7 border border-gray-200/60 h-full flex flex-col landing-card-hover" data-testid={`card-testimonial-${i}`}>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 text-gray-200 mb-3" />
                  <p className="text-gray-600 text-sm sm:text-[15px] leading-[1.7] flex-1">
                    "{t.quote}"
                  </p>
                  <div className="mt-6 pt-5 border-t border-gray-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-medium text-xs">
                        {t.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 tracking-[-0.01em]">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.role}, {t.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
                Built for Teams
              </p>
              <h2
                className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]"
                data-testid="text-highlights-heading"
              >
                Everything you need,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                  nothing you don't.
                </span>
              </h2>
              <p className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-gray-400 leading-[1.7]">
                We stripped away the complexity of traditional DAMs and built
                something your team will actually enjoy using.
              </p>
              <div className="mt-7 sm:mt-9 space-y-3.5">
                {[
                  "Unlimited workspaces",
                  "Cloud-backed storage",
                  "Team role management",
                  "Nested folder trees",
                  "Image & video support",
                  "Secure authentication",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                    data-testid={`text-highlight-${index}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    <span className="text-gray-600 font-medium text-sm sm:text-[15px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-gray-950 rounded-2xl sm:rounded-[20px] p-6 sm:p-8 lg:p-9 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }} />
                <div className="relative space-y-4">
                  {[
                    {
                      icon: Shield,
                      title: "Enterprise-grade security",
                      desc: "Session-based auth with encrypted passwords",
                    },
                    {
                      icon: FolderTree,
                      title: "Infinite nesting",
                      desc: "Create folders within folders, as deep as you need",
                    },
                    {
                      icon: Image,
                      title: "Rich media support",
                      desc: "Upload PNGs, JPGs, SVGs, MP4s, and more",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 bg-white/[0.03] rounded-xl p-4 sm:p-5 border border-white/[0.05] hover:bg-white/[0.06] transition-colors duration-300"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-[15px] text-white/90 tracking-[-0.01em]">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.07] rounded-full blur-[100px]" />
        <div className="max-w-3xl mx-auto relative text-center">
          <div>
            <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] leading-[1.12]">
              Ready to get your media
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                under control?
              </span>
            </h2>
            <p className="mt-5 sm:mt-7 text-[15px] sm:text-lg text-gray-500 max-w-lg mx-auto leading-[1.7]">
              Join teams that already use thecrew to keep their visual assets
              organized, accessible, and secure.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5">
              <Button
                size="lg"
                onClick={() => navigate("/auth?mode=register")}
                className="bg-white text-gray-900 font-medium rounded-full"
                data-testid="button-cta-get-started"
              >
                Get started - it's free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
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
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-default transition-colors duration-200" data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Resources</h4>
              <ul className="space-y-2.5">
                {[{ label: "Help Center", path: "/help-center" }, { label: "Blog", path: "/blog" }, { label: "Changelog", path: "/changelog" }].map((item) => (
                  <li key={item.label}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[{ label: "About", path: "/about" }, { label: "Pricing", path: "/pricing" }, { label: "Privacy Policy", path: "/privacy-policy" }].map((item) => (
                  <li key={item.label}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-3">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Help</h4>
              <ul className="space-y-2.5">
                {[{ label: "Support", path: "/support" }, { label: "Request a Feature", path: "/request-feature" }, { label: "Contact Us", path: "/contact" }].map((item) => (
                  <li key={item.label}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
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
