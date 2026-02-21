import { Sparkles, Users, Shield, Zap } from "lucide-react";
import PageNavbar from "@/components/page-navbar";
import PageFooter from "@/components/page-footer";
import saiDeepakImg from "@assets/WhatsApp_Image_2026-02-14_at_1.23.17_PM_1771711854316.jpeg";
import ashishImg from "@assets/WhatsApp_Image_2025-03-19_at_14.23.34_c99293f4_1771712034052.jpg";
import lokeshImg from "@assets/file_00000000dac472069ef0df3151b3d363_1771712079650.png";

const values = [
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "Powerful tools should be effortless. No clutter, no confusion — just clean, intuitive design built for creators who move fast.",
    color: "text-blue-500",
    bg: "bg-blue-50/80",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Great short-form content happens when creators and editors are perfectly in sync. We build for teams that ship daily.",
    color: "text-violet-500",
    bg: "bg-violet-50/80",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Your content is your livelihood. We protect it with role-based access, encrypted storage, and workspace isolation.",
    color: "text-emerald-500",
    bg: "bg-emerald-50/80",
  },
  {
    icon: Zap,
    title: "Speed",
    description: "Instant uploads, instant previews, instant handoffs. We obsess over speed because your posting schedule won't wait.",
    color: "text-amber-500",
    bg: "bg-amber-50/80",
  },
];

const team = [
  {
    name: "Sai Deepak",
    role: "AI & Cloud Architect",
    image: saiDeepakImg,
  },
  {
    name: "Ashish Pragada",
    role: "Product & UI/UX Developer",
    image: ashishImg,
  },
  {
    name: "Unnam Lokesh Chowdary",
    role: "AI Engineer",
    image: lokeshImg,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageNavbar />

      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Our Story
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-about-heading">
            About thecrew
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl leading-[1.7]">
            We're building the simplest way for short-form content creators and their editors to organize, share, and collaborate on media — all in one place.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-500 text-[15px] sm:text-base leading-[1.8] max-w-3xl">
            Short-form creators and their editors juggle raw footage, drafts, and final cuts across DMs, Google Drive, WeTransfer links, and WhatsApp threads. Nobody knows which version is latest. Deadlines get missed. Assets get lost. We started thecrew because we lived this chaos ourselves. Our mission is to give every creator-editor team a single, beautiful workspace where clips, graphics, and final exports are always organized, always accessible, and always secure. No more "can you resend that file?" Just your content, finally organized.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10">
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

      <section className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-3">
            Meet The Team
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-3">
            The people behind thecrew
          </h2>
          <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed max-w-xl mb-10">
            We're a small team of builders who understand the creator-editor workflow because we've lived it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {team.map((t) => (
              <div key={t.name} className="group" data-testid={`card-team-${t.name.split(" ")[0].toLowerCase()}`}>
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold text-base text-gray-900">{t.name}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}