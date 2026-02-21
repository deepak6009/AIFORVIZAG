import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const badgeStyles: Record<string, string> = {
  New: "bg-emerald-50 text-emerald-600",
  Improved: "bg-blue-50 text-blue-600",
  Fixed: "bg-amber-50 text-amber-600",
};

const entries = [
  {
    version: "v1.4.0",
    date: "February 15, 2026",
    changes: [
      { badge: "New", text: "AI-powered image tagging for instant search and discovery" },
      { badge: "New", text: "Bulk upload support — drag and drop up to 50 files at once" },
      { badge: "Improved", text: "Workspace loading speed improved by 40%" },
      { badge: "Fixed", text: "Resolved an issue where folder thumbnails would not refresh after upload" },
    ],
  },
  {
    version: "v1.3.2",
    date: "January 30, 2026",
    changes: [
      { badge: "Improved", text: "Video preview now supports more codecs including HEVC and ProRes" },
      { badge: "Fixed", text: "Team invitations no longer fail for emails with plus-addressing" },
      { badge: "Fixed", text: "Corrected timezone display in file upload timestamps" },
    ],
  },
  {
    version: "v1.3.0",
    date: "January 12, 2026",
    changes: [
      { badge: "New", text: "Nested folder support — organize your media with unlimited depth" },
      { badge: "New", text: "Viewer role added for read-only team access" },
      { badge: "Improved", text: "File preview modal redesigned with a cleaner layout" },
    ],
  },
  {
    version: "v1.2.0",
    date: "December 18, 2025",
    changes: [
      { badge: "New", text: "Multi-workspace support — run separate workspaces per project" },
      { badge: "Improved", text: "Dashboard now shows recent activity and storage usage" },
      { badge: "Fixed", text: "Resolved a bug where renaming folders would reset sort order" },
    ],
  },
  {
    version: "v1.1.0",
    date: "November 25, 2025",
    changes: [
      { badge: "New", text: "Initial public launch with core upload, folder, and team features" },
      { badge: "New", text: "Role-based access control for admins, members, and viewers" },
      { badge: "Improved", text: "Onboarding flow streamlined to three simple steps" },
    ],
  },
];

export default function ChangelogPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-5 sm:px-8 h-14">
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
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Updates
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-changelog-heading">
            Changelog
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg leading-[1.7]">
            What's new in thecrew
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-gray-200/80 ml-3 sm:ml-4 space-y-10">
            {entries.map((entry, i) => (
              <div key={i} className="relative pl-7 sm:pl-8" data-testid={`changelog-entry-${i}`}>
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300" />
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{entry.version}</span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
                <ul className="space-y-2.5">
                  {entry.changes.map((change, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <span className={`text-[10px] font-medium uppercase tracking-[0.1em] px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${badgeStyles[change.badge]}`}>
                        {change.badge}
                      </span>
                      <span className="text-sm text-gray-600 leading-relaxed">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-5 sm:px-8 text-center border-t border-gray-200/60">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} thecrew. All rights reserved.</p>
      </footer>
    </div>
  );
}