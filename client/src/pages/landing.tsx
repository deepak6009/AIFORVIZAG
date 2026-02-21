import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { useInView } from "@/hooks/use-in-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layers,
  Users,
  FolderTree,
  Upload,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Image,
  Video,
  Lock,
  Globe,
  MousePointer2,
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

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
              <Layers className="w-[18px] h-[18px] text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight text-gray-900"
              data-testid="text-app-name"
            >
              WorkVault
            </span>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </nav>

      <section className="pt-36 pb-24 lg:pt-44 lg:pb-32 px-6 lg:px-10 relative">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl">
            <div className="landing-fade-up landing-stagger-1">
              <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 mb-6">
                Workspace Media Manager
              </p>
            </div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 leading-[0.95] landing-fade-up landing-stagger-2"
              data-testid="text-hero-heading"
            >
              Store, organize
              <br />
              <span className="relative inline-block">
                & collaborate
                <span
                  className="absolute -bottom-1 left-0 h-3 w-full bg-blue-500/15 rounded-sm -z-10"
                  style={{ transform: "skewX(-6deg)" }}
                />
              </span>
              <br />
              <span className="text-blue-600">on media.</span>
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-gray-500 max-w-xl leading-relaxed font-normal landing-fade-up landing-stagger-3">
              The all-in-one workspace where teams upload, organize, and manage
              their images and videos — with folders, roles, and cloud storage
              built right in.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4 landing-fade-up landing-stagger-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth?mode=register")}
                className="bg-blue-600 text-white font-semibold rounded-full shadow-lg shadow-blue-600/20"
                data-testid="button-get-started"
              >
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="rounded-full font-medium border-gray-200 text-gray-700"
                data-testid="button-hero-signin"
              >
                Sign in to your workspace
              </Button>
            </div>
          </div>

          <div className="mt-16 lg:mt-20 landing-scale-in landing-stagger-5">
            <div className="relative rounded-2xl border border-gray-200/80 bg-gray-50/50 p-1.5 shadow-2xl shadow-gray-200/50">
              <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <div className="ml-4 flex-1 h-7 bg-gray-100 rounded-md flex items-center px-3">
                    <span className="text-xs text-gray-400 font-mono">
                      app.workvault.io/workspace/design-team
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-12">
                  <div className="col-span-3 border-r border-gray-100 p-4 bg-gray-50/40 min-h-[280px]">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Folders
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { name: "Marketing Campaign", count: 12, active: true },
                        { name: "Product Photos", count: 24, active: false },
                        { name: "Brand Videos", count: 8, active: false },
                        { name: "Social Media", count: 31, active: false },
                      ].map((folder) => (
                        <div
                          key={folder.name}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${
                            folder.active
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          <FolderTree className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{folder.name}</span>
                          <span className="ml-auto text-[10px] text-gray-400">
                            {folder.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-9 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-800">
                        Marketing Campaign
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-semibold">
                          JS
                        </div>
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[9px] text-white font-semibold">
                          AK
                        </div>
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[9px] text-white font-semibold">
                          MR
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { type: "img", color: "bg-gradient-to-br from-pink-200 to-pink-300", label: "hero-banner.png" },
                        { type: "img", color: "bg-gradient-to-br from-blue-200 to-indigo-300", label: "social-post.jpg" },
                        { type: "vid", color: "bg-gradient-to-br from-amber-200 to-orange-300", label: "promo-v2.mp4" },
                        { type: "img", color: "bg-gradient-to-br from-green-200 to-emerald-300", label: "logo-dark.svg" },
                        { type: "vid", color: "bg-gradient-to-br from-purple-200 to-violet-300", label: "tutorial.mp4" },
                        { type: "img", color: "bg-gradient-to-br from-rose-200 to-red-300", label: "banner-2x.png" },
                        { type: "img", color: "bg-gradient-to-br from-teal-200 to-cyan-300", label: "icon-set.svg" },
                        { type: "img", color: "bg-gradient-to-br from-yellow-200 to-amber-300", label: "mockup.psd" },
                      ].map((file, i) => (
                        <div key={i} className="group">
                          <div
                            className={`${file.color} rounded-lg aspect-square flex items-center justify-center`}
                          >
                            {file.type === "img" ? (
                              <Image className="w-5 h-5 text-white/70" />
                            ) : (
                              <Video className="w-5 h-5 text-white/70" />
                            )}
                          </div>
                          <p className="mt-1.5 text-[10px] text-gray-500 truncate">
                            {file.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-6 lg:px-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="max-w-3xl mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 mb-4">
              The Problem
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight"
              data-testid="text-problem-heading"
            >
              Your team's media is
              <span className="landing-highlight"> scattered everywhere</span>.
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Files live in Slack threads, Google Drive links, local desktops, and
              email attachments. Nobody knows where the latest version is. Sound
              familiar?
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
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
                <Card data-testid={`card-stat-${i}`}>
                  <CardContent className="pt-8 pb-8">
                    <p className="text-5xl font-bold text-gray-900 tracking-tight">
                      {item.stat}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {item.label}
                    </p>
                    <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 mb-4">
              The Solution
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight"
              data-testid="text-features-heading"
            >
              One place for
              <span className="landing-highlight"> everything visual</span>.
            </h2>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              WorkVault brings your team's images and videos into a single,
              beautifully organized workspace.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FolderTree,
                title: "Nested Folders",
                description:
                  "Build deep folder hierarchies that mirror how your team thinks. No more flat file dumps.",
                accent: "from-blue-500 to-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: Users,
                title: "Team Roles",
                description:
                  "Admins, members, viewers — everyone gets the right level of access. No overreach, no gaps.",
                accent: "from-violet-500 to-purple-600",
                bg: "bg-violet-50",
              },
              {
                icon: Upload,
                title: "Fast Uploads",
                description:
                  "Upload images and videos directly to any folder. Cloud-backed storage means no size worries.",
                accent: "from-emerald-500 to-green-600",
                bg: "bg-emerald-50",
              },
              {
                icon: Shield,
                title: "Secure by Default",
                description:
                  "Workspace-level access control ensures your assets are only visible to authorized team members.",
                accent: "from-amber-500 to-orange-600",
                bg: "bg-amber-50",
              },
              {
                icon: Globe,
                title: "Multi-Workspace",
                description:
                  "Run separate workspaces for different clients or projects. Switch between them instantly.",
                accent: "from-cyan-500 to-teal-600",
                bg: "bg-cyan-50",
              },
              {
                icon: Zap,
                title: "Instant Previews",
                description:
                  "See your images and videos immediately. No downloads, no waiting, no separate viewer needed.",
                accent: "from-rose-500 to-pink-600",
                bg: "bg-rose-50",
              },
            ].map((feature, i) => (
              <AnimatedSection
                key={feature.title}
                delay={`landing-stagger-${i + 1}`}
              >
                <Card
                  className="h-full"
                  data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <CardContent className="pt-7 pb-7">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}
                    >
                      <feature.icon
                        className="w-6 h-6"
                        style={{
                          color: feature.accent.includes("blue")
                            ? "#3b82f6"
                            : feature.accent.includes("violet")
                              ? "#8b5cf6"
                              : feature.accent.includes("emerald")
                                ? "#10b981"
                                : feature.accent.includes("amber")
                                  ? "#f59e0b"
                                  : feature.accent.includes("cyan")
                                    ? "#06b6d4"
                                    : "#f43f5e",
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-6 lg:px-10 bg-gray-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-4">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Three steps to
              <br />
              <span className="text-blue-400">organized bliss.</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Create a workspace",
                desc: "Set up a dedicated workspace for your project or team in seconds.",
                icon: MousePointer2,
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
                <div className="text-center" data-testid={`card-step-${item.step}`}>
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <item.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-blue-400 tracking-widest uppercase mb-3">
                    Step {item.step}
                  </p>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection animation="landing-slide-right">
              <p className="text-sm font-semibold tracking-widest uppercase text-blue-600 mb-4">
                Built for Teams
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight"
                data-testid="text-highlights-heading"
              >
                Everything you need,
                <br />
                <span className="landing-highlight">nothing you don't.</span>
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                We stripped away the complexity of traditional DAMs and built
                something your team will actually enjoy using.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Unlimited workspaces",
                  "Cloud-backed storage",
                  "Team role management",
                  "Nested folder trees",
                  "Image & video support",
                  "Secure authentication",
                  "Instant previews",
                  "One-click uploads",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3"
                    data-testid={`text-highlight-${index}`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection animation="landing-slide-left">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100/50">
                <div className="space-y-4">
                  {[
                    {
                      icon: Lock,
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
                      className="flex items-start gap-4 bg-white/80 backdrop-blur rounded-xl p-5 border border-white"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {item.title}
                        </p>
                        <p className="text-gray-500 text-sm mt-0.5">
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

      <section className="py-28 lg:py-36 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-4xl mx-auto relative text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Ready to bring order
              <br />
              to your media chaos?
            </h2>
            <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Join teams that already use WorkVault to keep their visual assets
              organized, accessible, and secure.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/auth?mode=register")}
                className="bg-white text-blue-700 font-bold rounded-full shadow-xl shadow-blue-900/20"
                data-testid="button-cta-get-started"
              >
                Get started — it's free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="py-10 px-6 lg:px-10 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">WorkVault</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} WorkVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
