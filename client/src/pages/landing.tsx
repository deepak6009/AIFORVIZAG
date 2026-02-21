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
    quote: "WorkVault completely transformed how we manage our creative assets. No more digging through Slack threads for that one file.",
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
    quote: "Simple, fast, and exactly what we needed. We ditched three other tools after switching to WorkVault.",
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-10 h-14 sm:h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-base sm:text-lg font-semibold tracking-tight text-white"
              data-testid="text-app-name"
            >
              WorkVault
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/70 font-medium text-sm"
              onClick={() => navigate("/auth")}
              data-testid="button-login"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=register")}
              className="bg-white text-primary font-medium rounded-full text-sm"
              data-testid="button-get-started-nav"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
          <button
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 bg-primary px-5 py-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-center border-white/20 text-white"
              onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
              data-testid="button-login-mobile"
            >
              Sign In
            </Button>
            <Button
              className="w-full justify-center bg-white text-primary"
              onClick={() => { navigate("/auth?mode=register"); setMobileMenuOpen(false); }}
              data-testid="button-get-started-mobile"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </nav>

      <section className="pt-20 pb-4 sm:pt-24 sm:pb-6 lg:pt-28 lg:pb-8 px-5 sm:px-8 lg:px-10 relative">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto relative">
            <div className="hidden lg:block absolute -left-16 top-8 landing-fade-up landing-stagger-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center float-gentle">
                <FolderTree className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="hidden lg:block absolute -right-12 top-4 landing-fade-up landing-stagger-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100/60 flex items-center justify-center float-gentle" style={{ animationDelay: "1s" }}>
                <Image className="w-5 h-5 text-violet-500" />
              </div>
            </div>
            <div className="hidden lg:block absolute -left-10 top-32 landing-fade-up landing-stagger-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center float-gentle" style={{ animationDelay: "2s" }}>
                <Upload className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="hidden lg:block absolute -right-16 top-28 landing-fade-up landing-stagger-6">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center float-gentle" style={{ animationDelay: "1.5s" }}>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="hidden lg:block absolute left-4 bottom-4 landing-fade-up landing-stagger-6">
              <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100/60 flex items-center justify-center float-gentle" style={{ animationDelay: "2.5s" }}>
                <Zap className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <div className="hidden lg:block absolute right-0 bottom-8 landing-fade-up landing-stagger-7">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 border border-cyan-100/60 flex items-center justify-center float-gentle" style={{ animationDelay: "3s" }}>
                <Shield className="w-4 h-4 text-cyan-500" />
              </div>
            </div>

            <h1
              className="text-[2.25rem] leading-[1.08] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.5rem] font-semibold tracking-[-0.035em] text-gray-900 landing-fade-up landing-stagger-2"
              data-testid="text-hero-heading"
            >
              Your team's media,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                finally organized.
              </span>
            </h1>
            <p className="mt-4 sm:mt-5 text-[15px] sm:text-lg text-gray-400 max-w-lg mx-auto leading-[1.7] font-normal landing-fade-up landing-stagger-3">
              The workspace where teams upload, organize, and collaborate on
              images and videos - with folders, roles, and cloud storage
              built right in.
            </p>
            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5 landing-fade-up landing-stagger-4">
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
                Sign in to your workspace
              </Button>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 lg:mt-12 landing-scale-in landing-stagger-5">
            <div className="relative rounded-2xl sm:rounded-[20px] border border-gray-200/60 bg-gray-900 overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.15)]">
              <div className="aspect-[16/9] flex items-center justify-center relative group cursor-pointer" data-testid="video-placeholder">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }} />
                <div className="relative flex flex-col items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center group-hover:bg-white/[0.14] group-hover:scale-105 transition-all duration-500 ease-out">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white/80 ml-0.5" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/70 font-medium text-sm sm:text-[15px]">See WorkVault in action</p>
                    <p className="text-white/30 text-xs sm:text-sm mt-1 font-normal">Product walkthrough coming soon</p>
                  </div>
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
              WorkVault brings your team's images and videos into a single,
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
              Join teams that already use WorkVault to keep their visual assets
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
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-[15px]">WorkVault</span>
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
              &copy; {new Date().getFullYear()} WorkVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
