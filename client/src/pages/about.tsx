import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Users, Shield, Zap } from "lucide-react";

const values = [
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "We believe powerful tools should be effortless to use. No clutter, no confusion — just clean, intuitive design.",
    color: "text-blue-500",
    bg: "bg-blue-50/80",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Great creative work happens together. We build for teams that move fast and stay aligned.",
    color: "text-violet-500",
    bg: "bg-violet-50/80",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Your media is your livelihood. We protect it with role-based access, encrypted storage, and workspace isolation.",
    color: "text-emerald-500",
    bg: "bg-emerald-50/80",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Instant uploads, instant previews, instant access. We obsess over performance so you never wait.",
    color: "text-amber-500",
    bg: "bg-amber-50/80",
  },
];

const team = [
  { initials: "AK", name: "Alex Kim", role: "Founder & CEO" },
  { initials: "JR", name: "Jordan Rivera", role: "Head of Engineering" },
  { initials: "ML", name: "Maya Lin", role: "Lead Designer" },
  { initials: "SC", name: "Sam Chen", role: "Head of Product" },
];

export default function AboutPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 sm:px-8 h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <span className="text-lg tracking-[0.02em] lowercase text-gray-900">
            <span className="font-light">the</span><span className="font-extrabold">crew</span>
          </span>
        </div>
      </nav>

      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Our Story
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-about-heading">
            About thecrew
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl leading-[1.7]">
            We're building the simplest way for creative teams to organize, share, and collaborate on their media assets — all in one place.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8 bg-white border-y border-gray-200/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-500 text-[15px] sm:text-base leading-[1.8] max-w-3xl">
            Creative teams waste hours every week searching for files scattered across Slack threads, Google Drive folders, and email attachments. We started thecrew because we lived this problem ourselves. Our mission is to give every creative team a single, beautiful workspace where their images and videos are always organized, always accessible, and always secure. No more version confusion. No more lost assets. Just your media, finally organized.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/60"
                data-testid={`card-value-${v.title.toLowerCase()}`}
              >
                <div className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                  <v.icon className={`w-[18px] h-[18px] ${v.color}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{v.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8 bg-white border-y border-gray-200/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-8">
            The Team
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {team.map((t) => (
              <div key={t.name} className="text-center" data-testid={`card-team-${t.initials.toLowerCase()}`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-semibold text-lg sm:text-xl mx-auto mb-3">
                  {t.initials}
                </div>
                <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-5 sm:px-8 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} thecrew. All rights reserved.</p>
      </footer>
    </div>
  );
}