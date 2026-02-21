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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-10 h-14 sm:h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Layers className="w-[18px] h-[18px] text-white" />
            </div>
            <span
              className="text-lg sm:text-xl font-bold tracking-tight text-gray-900"
              data-testid="text-app-name"
            >
              WorkVault
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-gray-600 font-medium"
              onClick={() => navigate("/auth")}
              data-testid="button-login"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=register")}
              className="bg-gray-900 text-white font-medium rounded-full"
              data-testid="button-get-started-nav"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <button
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-center h-11"
              onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
              data-testid="button-login-mobile"
            >
              Sign In
            </Button>
            <Button
              className="w-full justify-center bg-gray-900 text-white h-11"
              onClick={() => { navigate("/auth?mode=register"); setMobileMenuOpen(false); }}
              data-testid="button-get-started-mobile"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </nav>

      <section className="pt-24 pb-8 sm:pt-32 sm:pb-12 lg:pt-40 lg:pb-16 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-5xl">
            <div className="landing-fade-up landing-stagger-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6 sm:mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-glow" />
                <span className="text-xs sm:text-sm font-semibold text-blue-700 tracking-wide uppercase">
                  Workspace Media Manager
                </span>
              </div>
            </div>
            <h1
              className="text-[2.5rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-gray-900 landing-fade-up landing-stagger-2"
              data-testid="text-hero-heading"
            >
              Your team's media,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
                finally organized.
              </span>
            </h1>
            <p className="mt-5 sm:mt-7 text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed font-normal landing-fade-up landing-stagger-3">
              The workspace where teams upload, organize, and collaborate on
              images and videos — with folders, roles, and cloud storage
              built right in.
            </p>
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 landing-fade-up landing-stagger-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth?mode=register")}
                className="bg-gray-900 text-white font-semibold rounded-full shadow-lg shadow-gray-900/20 h-12 sm:h-12 text-base"
                data-testid="button-get-started"
              >
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="rounded-full font-medium border-gray-200 text-gray-700 h-12 sm:h-12 text-base"
                data-testid="button-hero-signin"
              >
                Sign in to your workspace
              </Button>
            </div>
          </div>

          <div className="mt-10 sm:mt-14 lg:mt-16 landing-scale-in landing-stagger-5">
            <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-gray-950 overflow-hidden shadow-2xl shadow-gray-300/40">
              <div className="aspect-video flex items-center justify-center relative group cursor-pointer" data-testid="video-placeholder">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950" />
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }} />
                <div className="relative flex flex-col items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-105 transition-all duration-300">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/90 font-semibold text-sm sm:text-base">See WorkVault in action</p>
                    <p className="text-white/40 text-xs sm:text-sm mt-1">Product walkthrough coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 sm:py-8 overflow-hidden">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 shrink-0">
                <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-900 whitespace-nowrap">
                  {item}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="max-w-3xl mb-10 sm:mb-16">
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-600 mb-3 sm:mb-4">
              The Problem
            </p>
            <h2
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
              data-testid="text-problem-heading"
            >
              Your media is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                scattered
              </span>{" "}
              everywhere.
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl">
              Files live in Slack threads, Google Drive links, local desktops, and
              email attachments. Nobody knows where the latest version is.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100" data-testid={`card-stat-${i}`}>
                  <p className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tighter">
                    {item.stat}
                  </p>
                  <p className="text-sm font-bold text-blue-600 mt-2 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-gray-500 mt-2 sm:mt-3 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-600 mb-3 sm:mb-4">
              The Solution
            </p>
            <h2
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
              data-testid="text-features-heading"
            >
              One place for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                everything visual
              </span>
              .
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 leading-relaxed">
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
                color: "text-blue-600",
                bg: "bg-blue-50",
                tagBg: "bg-blue-50 text-blue-700",
              },
              {
                icon: Users,
                title: "Team Roles",
                description: "Admins, members, viewers — everyone gets the right level of access.",
                tag: "Collaboration",
                color: "text-violet-600",
                bg: "bg-violet-50",
                tagBg: "bg-violet-50 text-violet-700",
              },
              {
                icon: Upload,
                title: "Fast Uploads",
                description: "Upload images and videos directly to any folder. Cloud-backed storage.",
                tag: "Performance",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                tagBg: "bg-emerald-50 text-emerald-700",
              },
              {
                icon: Shield,
                title: "Secure by Default",
                description: "Workspace-level access control ensures your assets stay protected.",
                tag: "Security",
                color: "text-amber-600",
                bg: "bg-amber-50",
                tagBg: "bg-amber-50 text-amber-700",
              },
              {
                icon: Globe,
                title: "Multi-Workspace",
                description: "Run separate workspaces for different clients or projects.",
                tag: "Scale",
                color: "text-cyan-600",
                bg: "bg-cyan-50",
                tagBg: "bg-cyan-50 text-cyan-700",
              },
              {
                icon: Zap,
                title: "Instant Previews",
                description: "See your images and videos immediately. No downloads needed.",
                tag: "Speed",
                color: "text-rose-600",
                bg: "bg-rose-50",
                tagBg: "bg-rose-50 text-rose-700",
              },
            ].map((feature, i) => (
              <AnimatedSection
                key={feature.title}
                delay={`landing-stagger-${(i % 3) + 1}`}
              >
                <div
                  className="group h-full bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${feature.tagBg}`}>
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <div className="max-w-7xl mx-auto relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-400 mb-3 sm:mb-4">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Three steps to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                organized bliss.
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
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
                desc: "Add team members with the right roles — admin, member, or viewer.",
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
                  <div className="text-[6rem] sm:text-[8rem] font-black text-white/[0.03] leading-none absolute -top-6 sm:-top-8 -left-2">
                    {item.step}
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/[0.06] backdrop-blur flex items-center justify-center mb-5 sm:mb-6 border border-white/[0.08]">
                      <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-2 sm:mb-3">
                      Step {item.step}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-600 mb-3 sm:mb-4">
              Kind Words
            </p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Trusted by teams who{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                care about craft
              </span>
              .
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection
                key={i}
                delay={`landing-stagger-${i + 1}`}
              >
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 h-full flex flex-col" data-testid={`card-testimonial-${i}`}>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-100 mb-3" />
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed flex-1">
                    "{t.quote}"
                  </p>
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {t.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <AnimatedSection animation="landing-slide-right">
              <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-blue-600 mb-3 sm:mb-4">
                Built for Teams
              </p>
              <h2
                className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
                data-testid="text-highlights-heading"
              >
                Everything you need,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  nothing you don't.
                </span>
              </h2>
              <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-500 leading-relaxed">
                We stripped away the complexity of traditional DAMs and built
                something your team will actually enjoy using.
              </p>
              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-3.5">
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
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span className="text-gray-700 font-semibold text-sm sm:text-base">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="landing-slide-left">
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }} />
                <div className="relative space-y-4 sm:space-y-5">
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
                      className="flex items-start gap-4 bg-white/[0.04] backdrop-blur rounded-xl p-4 sm:p-5 border border-white/[0.06]"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-white">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
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

      <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="max-w-3xl mx-auto relative text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Ready to get your media
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400">
                under control?
              </span>
            </h2>
            <p className="mt-5 sm:mt-7 text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              Join teams that already use WorkVault to keep their visual assets
              organized, accessible, and secure.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth?mode=register")}
                className="bg-white text-gray-900 font-bold rounded-full shadow-xl shadow-white/10 h-12 text-base hover:bg-gray-100"
                data-testid="button-cta-get-started"
              >
                Get started — it's free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="py-10 sm:py-14 px-4 sm:px-6 lg:px-10 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">WorkVault</span>
            </div>
            <p className="text-sm text-gray-400 text-center sm:text-right">
              Built for teams who care about their creative assets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
