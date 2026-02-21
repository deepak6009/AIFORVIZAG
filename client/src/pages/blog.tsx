import { Clock } from "lucide-react";
import PageNavbar from "@/components/page-navbar";
import PageFooter from "@/components/page-footer";

const posts = [
  {
    title: "How Top Creators Organize Their Short-Form Content Pipeline",
    excerpt: "From raw clips to final exports — here's how creators posting daily keep their media organized without losing their minds.",
    date: "Feb 18, 2026",
    category: "Workflow",
    readTime: "5 min read",
    categoryColor: "bg-blue-50 text-blue-600",
  },
  {
    title: "Why Your Editor Needs a Dedicated Media Workspace",
    excerpt: "Sending files over DMs and WeTransfer links slows everyone down. Learn why purpose-built tools make the creator-editor relationship seamless.",
    date: "Feb 12, 2026",
    category: "Collaboration",
    readTime: "4 min read",
    categoryColor: "bg-violet-50 text-violet-600",
  },
  {
    title: "The Hidden Cost of Disorganized Content Files",
    excerpt: "Missed deadlines, duplicated edits, and lost B-roll cost creators more than they think. We break down the real numbers.",
    date: "Feb 5, 2026",
    category: "Insights",
    readTime: "6 min read",
    categoryColor: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Role-Based Access: Giving Editors What They Need",
    excerpt: "Not every collaborator needs full access. Learn how role-based permissions protect your raw footage without slowing your editor down.",
    date: "Jan 28, 2026",
    category: "Security",
    readTime: "3 min read",
    categoryColor: "bg-amber-50 text-amber-600",
  },
  {
    title: "From Chaos to Clarity: Migrating Your Content Library",
    excerpt: "Moving your team's footage and graphics to a new platform doesn't have to be painful. Follow our step-by-step migration checklist.",
    date: "Jan 20, 2026",
    category: "Guides",
    readTime: "7 min read",
    categoryColor: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "How Growing Creator Teams Scale Their Editing Workflow",
    excerpt: "Three creators share how they went from doing everything solo to running a team of editors — and how they keep content flowing.",
    date: "Jan 14, 2026",
    category: "Case Study",
    readTime: "5 min read",
    categoryColor: "bg-rose-50 text-rose-600",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageNavbar />

      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Blog
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-blog-heading">
            Blog
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg leading-[1.7]">
            Insights, guides, and stories about short-form content workflows and creator-editor collaboration.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8 lg:px-10">
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

      <PageFooter />
    </div>
  );
}
