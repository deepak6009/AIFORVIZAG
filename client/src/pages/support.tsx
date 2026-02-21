import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, BookOpen } from "lucide-react";
import PageNavbar from "@/components/page-navbar";
import PageFooter from "@/components/page-footer";

const channels = [
  {
    icon: Mail,
    title: "Email",
    description: "Reach us at support@thecrew.app. We typically respond within 24 hours.",
    action: "support@thecrew.app",
    color: "text-blue-500",
    bg: "bg-blue-50/80",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Real-time support for Pro and Team plans. Available weekdays 9am-6pm EST.",
    action: "Coming soon",
    color: "text-violet-500",
    bg: "bg-violet-50/80",
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Browse our help center for guides, tutorials, and frequently asked questions.",
    action: "Visit Help Center",
    color: "text-emerald-500",
    bg: "bg-emerald-50/80",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageNavbar />

      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Support
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-support-heading">
            Get Support
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg leading-[1.7]">
            We're here to help. Choose the channel that works best for you.
          </p>
        </div>
      </section>

      <section className="pb-12 sm:pb-16 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {channels.map((ch) => (
            <div
              key={ch.title}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/60"
              data-testid={`card-channel-${ch.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`w-10 h-10 rounded-xl ${ch.bg} flex items-center justify-center mb-4`}>
                <ch.icon className={`w-[18px] h-[18px] ${ch.color}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{ch.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">{ch.description}</p>
              <p className="text-sm font-medium text-gray-600">{ch.action}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-6">
            Send us a message
          </h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" data-testid="input-support-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" data-testid="input-support-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="How can we help?" data-testid="input-support-subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Describe your issue or question..." className="min-h-[120px]" data-testid="input-support-message" />
            </div>
            <Button className="w-full rounded-full font-medium" data-testid="button-support-submit">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
