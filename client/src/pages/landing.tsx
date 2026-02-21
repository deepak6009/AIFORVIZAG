import { type ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { useInView } from "@/hooks/use-in-view";
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

function AnimatedSection({
  children,
  className = "",
  animation = "landing-fade-up",
  delay = "",
}: {
  children: ReactNode;
  className?: string;
  animation?: string;
  delay?: string;
}) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className={`${isInView ? `${animation} ${delay}` : "landing-animate-hidden"} ${className}`}
    >
      {children}
    </div>
  );
}

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

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 nav-gradient-animated border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-10 h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <img src="/images/crew-mark.png" alt="thecrew" className="w-8 h-8 sm:w-9 sm:h-9" />
            <span
              className="text-base sm:text-lg font-bold tracking-[0.06em] lowercase text-gray-900"
              data-testid="text-app-name"
            >
              thecrew
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

      <section className="pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 px-5 sm:px-8 lg:px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="landing-fade-up">
              <div className="mb-5 sm:mb-6 landing-fade-up" data-testid="text-hero-heading">
                <h1 className="text-[3.5rem] leading-[0.85] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.5rem] font-extrabold tracking-[0.04em] lowercase text-gray-900">
                  thecrew
                </h1>
                <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2">
                  {[
                    { letter: "Cr", word: "eator" },
                    { letter: "E", word: "ditor" },
                    { letter: "W", word: "orkspace" },
                  ].map((item, i) => (
                    <span key={item.letter} className="flex items-center gap-1.5 sm:gap-2">
                      {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-300" />}
                      <span className="text-[10px] sm:text-xs font-medium tracking-[0.1em] uppercase text-gray-400">
                        <span className="text-gray-900 font-bold">{item.letter}</span>{item.word}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <h2
                className="text-lg leading-[1.3] sm:text-xl md:text-2xl font-medium tracking-[-0.01em] text-gray-500"
              >
                AI-Powered{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 font-semibold">
                  Creative Workspace
                </span>
              </h2>
              <p className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-gray-400 max-w-md leading-[1.7] font-normal landing-fade-up landing-stagger-2">
                Upload, organize, and collaborate on images and videos - with folders, roles, and cloud storage built right in.
              </p>
              <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 landing-fade-up landing-stagger-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth?mode=register")}
                  className="bg-gray-900 text-white font-medium rounded-full"
                  data-testid="button-get-started"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="rounded-full font-medium text-gray-600"
                  data-testid="button-hero-signin"
                >
                  Sign in
                </Button>
              </div>
              <div className="mt-8 sm:mt-10 flex items-center gap-6 landing-fade-up landing-stagger-4">
                {[
                  { icon: FolderTree, label: "Folders", color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: Users, label: "Teams", color: "text-violet-500", bg: "bg-violet-50" },
                  { icon: Upload, label: "Uploads", color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: Shield, label: "Secure", color: "text-amber-500", bg: "bg-amber-50" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 hidden sm:inline">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative landing-scale-in landing-stagger-3">
              <div className="relative rounded-2xl sm:rounded-[20px] border border-gray-200/60 bg-gray-900 overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
                <div className="aspect-[4/3] flex items-center justify-center relative group cursor-pointer" data-testid="video-placeholder">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950" />
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                  }} />

                  <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <div className="flex-1 h-5 rounded bg-white/[0.06] ml-2" />
                  </div>

                  <div className="absolute left-4 top-14 bottom-4 w-36 rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 hidden sm:block">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-3 h-3 text-blue-400/60" />
                        <div className="h-2 rounded bg-white/10 flex-1" />
                      </div>
                      <div className="flex items-center gap-2 pl-3">
                        <FolderTree className="w-2.5 h-2.5 text-blue-400/40" />
                        <div className="h-2 rounded bg-white/[0.06] flex-1" />
                      </div>
                      <div className="flex items-center gap-2 pl-3">
                        <FolderTree className="w-2.5 h-2.5 text-blue-400/40" />
                        <div className="h-2 rounded bg-white/[0.06] flex-1" />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <FolderTree className="w-3 h-3 text-violet-400/60" />
                        <div className="h-2 rounded bg-white/10 flex-1" />
                      </div>
                      <div className="flex items-center gap-2 pl-3">
                        <FolderTree className="w-2.5 h-2.5 text-violet-400/40" />
                        <div className="h-2 rounded bg-white/[0.06] flex-1" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute sm:left-44 left-4 right-4 top-14 bottom-4 rounded-lg bg-white/[0.03] border border-white/[0.05] p-3 sm:p-4">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 h-full">
                      {[
                        "bg-gradient-to-br from-blue-500/30 to-blue-600/20",
                        "bg-gradient-to-br from-violet-500/30 to-purple-600/20",
                        "bg-gradient-to-br from-emerald-500/30 to-teal-600/20",
                        "bg-gradient-to-br from-amber-500/30 to-orange-600/20",
                        "bg-gradient-to-br from-rose-500/30 to-pink-600/20",
                        "bg-gradient-to-br from-cyan-500/30 to-sky-600/20",
                      ].map((bg, idx) => (
                        <div key={idx} className={`rounded-lg ${bg} border border-white/[0.06] flex items-center justify-center`}>
                          <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white/20" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500 ease-out">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100 landing-fade-up landing-stagger-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">12 files uploaded</p>
                    <p className="text-[10px] text-gray-400">Just now</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 bg-white rounded-xl p-2.5 shadow-lg border border-gray-100 landing-fade-up landing-stagger-7 hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-violet-500 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">3 online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10 overflow-hidden">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#fafafa] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#fafafa] to-transparent z-10" />
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-5 px-4 sm:px-6 shrink-0">
                <span className="text-[13px] sm:text-sm font-medium uppercase tracking-[0.15em] text-gray-300 whitespace-nowrap">
                  {item}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
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
          </AnimatedSection>

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
              <AnimatedSection
                key={i}
                delay={`landing-stagger-${i + 2}`}
              >
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
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
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
          </AnimatedSection>

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
              <AnimatedSection
                key={feature.title}
                delay={`landing-stagger-${(i % 3) + 1}`}
              >
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
              </AnimatedSection>
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
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-blue-400 mb-4 sm:mb-5">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] leading-[1.12]">
              Three steps to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                organized bliss.
              </span>
            </h2>
          </AnimatedSection>

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
              <AnimatedSection
                key={i}
                delay={`landing-stagger-${i + 2}`}
              >
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
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10 bg-white border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
              Kind Words
            </p>
            <h2 className="text-2xl sm:text-[2.5rem] md:text-5xl font-semibold tracking-[-0.03em] text-gray-900 leading-[1.12]">
              Trusted by teams who{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                care about craft
              </span>
              .
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((t, i) => (
              <AnimatedSection
                key={i}
                delay={`landing-stagger-${i + 1}`}
              >
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
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <AnimatedSection animation="landing-slide-right">
              <p className="text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase text-blue-500 mb-4 sm:mb-5">
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
            </AnimatedSection>

            <AnimatedSection animation="landing-slide-left">
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
            </AnimatedSection>
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
          <AnimatedSection>
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
          </AnimatedSection>
        </div>
      </section>

      <footer className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 border-t border-gray-200/60 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-8 sm:gap-6 lg:gap-10">
            <div className="col-span-2 sm:col-span-3">
              <div className="flex items-center gap-2 mb-1">
                <img src="/images/crew-mark.png" alt="thecrew" className="w-7 h-7" />
                <span className="font-bold text-gray-900 text-[15px] tracking-[0.06em] lowercase">thecrew</span>
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
                {["Help Center", "Blog", "Changelog"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-default transition-colors duration-200" data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["About", "Pricing", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-default transition-colors duration-200" data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1 sm:col-span-3">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Help</h4>
              <ul className="space-y-2.5">
                {["Support", "Request a Feature", "Contact Us"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 hover:text-gray-900 cursor-default transition-colors duration-200" data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
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
