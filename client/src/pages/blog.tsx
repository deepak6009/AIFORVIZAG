import { useLocation } from "wouter";
import { ArrowLeft, Clock } from "lucide-react";

const posts = [
  {
    title: "5 Ways to Organize Your Creative Assets Like a Pro",
    excerpt: "Tired of searching for files across five different apps? Here's how top creative teams keep their media organized and accessible.",
    date: "Feb 18, 2026",
    category: "Productivity",
    readTime: "5 min read",
    categoryColor: "bg-blue-50 text-blue-600",
  },
  {
    title: "Why Your Team Needs a Dedicated Media Workspace",
    excerpt: "Google Drive and Dropbox weren't built for creative teams. Learn why purpose-built tools make all the difference.",
    date: "Feb 12, 2026",
    category: "Collaboration",
    readTime: "4 min read",
    categoryColor: "bg-violet-50 text-violet-600",
  },
  {
    title: "The Hidden Cost of Disorganized Media Files",
    excerpt: "Duplicated files, lost assets, and version confusion cost teams more than they think. We break down the real numbers.",
    date: "Feb 5, 2026",
    category: "Insights",
    readTime: "6 min read",
    categoryColor: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Role-Based Access: Keeping Your Assets Secure",
    excerpt: "Not everyone needs edit access. Learn how role-based permissions protect your workspace without slowing your team down.",
    date: "Jan 28, 2026",
    category: "Security",
    readTime: "3 min read",
    categoryColor: "bg-amber-50 text-amber-600",
  },
  {
    title: "From Chaos to Clarity: A Media Migration Guide",
    excerpt: "Moving your team's media to a new platform doesn't have to be painful. Follow our step-by-step migration checklist.",
    date: "Jan 20, 2026",
    category: "Guides",
    readTime: "7 min read",
    categoryColor: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "How Small Studios Scale Their Creative Workflows",
    excerpt: "Three growing studios share how they streamlined their media management as their teams doubled in size.",
    date: "Jan 14, 2026",
    category: "Case Study",
    readTime: "5 min read",
    categoryColor: "bg-rose-50 text-rose-600",
  },
];

export default function BlogPage() {
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
            Blog
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-blog-heading">
            Blog
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg leading-[1.7]">
            Insights, guides, and stories about creative media management and team collaboration.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {posts.map((post, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/60 flex flex-col cursor-pointer landing-card-hover"
              data-testid={`card-blog-post-${i}`}
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`text-[10px] font-medium uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${post.categoryColor}`}>
                  {post.category}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug">{post.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-5 pt-4 border-t border-gray-200/60 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-400">{post.date}</span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>
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