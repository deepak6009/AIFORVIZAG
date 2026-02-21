import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Rocket, LayoutGrid, FolderOpen, Users, Settings, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Learn the basics of setting up your account and creating your first workspace.",
    color: "text-blue-500",
    bg: "bg-blue-50/80",
  },
  {
    icon: LayoutGrid,
    title: "Workspaces",
    description: "Manage multiple workspaces, switch between projects, and organize your teams.",
    color: "text-violet-500",
    bg: "bg-violet-50/80",
  },
  {
    icon: FolderOpen,
    title: "File Management",
    description: "Upload, organize, and preview your images and videos with nested folders.",
    color: "text-emerald-500",
    bg: "bg-emerald-50/80",
  },
  {
    icon: Users,
    title: "Team & Roles",
    description: "Invite team members, assign roles, and control access to your workspace.",
    color: "text-amber-500",
    bg: "bg-amber-50/80",
  },
  {
    icon: Settings,
    title: "Account Settings",
    description: "Update your profile, change your password, and manage notification preferences.",
    color: "text-cyan-500",
    bg: "bg-cyan-50/80",
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "View invoices, update payment methods, and manage your subscription plan.",
    color: "text-rose-500",
    bg: "bg-rose-50/80",
  },
];

export default function HelpCenterPage() {
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

      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 px-5 sm:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Help Center
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-help-heading">
            How can we help?
          </h1>
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for articles..."
              className="pl-10 h-11 rounded-full bg-white border-gray-200/60"
              data-testid="input-help-search"
            />
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/60 cursor-pointer landing-card-hover"
              data-testid={`card-help-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center mb-4`}>
                <cat.icon className={`w-[18px] h-[18px] ${cat.color}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{cat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 px-5 sm:px-8 text-center border-t border-gray-200/60">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} thecrew. All rights reserved.</p>
      </footer>
    </div>
  );
}