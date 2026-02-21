import { Search, Rocket, LayoutGrid, FolderOpen, Users, Settings, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import PageNavbar from "@/components/page-navbar";
import PageFooter from "@/components/page-footer";

const categories = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Learn the basics of setting up your account and creating your first workspace for your content team.",
    color: "text-blue-500",
    bg: "bg-blue-50/80",
  },
  {
    icon: LayoutGrid,
    title: "Workspaces",
    description: "Manage multiple workspaces for different creators or projects, and organize your editing teams.",
    color: "text-violet-500",
    bg: "bg-violet-50/80",
  },
  {
    icon: FolderOpen,
    title: "File Management",
    description: "Upload, organize, and preview your clips, graphics, and exports with nested folders.",
    color: "text-emerald-500",
    bg: "bg-emerald-50/80",
  },
  {
    icon: Users,
    title: "Team & Roles",
    description: "Invite editors and collaborators, assign roles, and control who can access what in your workspace.",
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
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageNavbar />

      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 px-5 sm:px-8 lg:px-10 text-center">
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

      <section className="pb-16 sm:pb-20 px-5 sm:px-8 lg:px-10">
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

      <PageFooter />
    </div>
  );
}
