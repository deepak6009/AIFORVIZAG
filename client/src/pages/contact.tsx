import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Globe } from "lucide-react";
import PageNavbar from "@/components/page-navbar";
import PageFooter from "@/components/page-footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageNavbar />

      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Contact
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-contact-heading">
            Get in Touch
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg leading-[1.7]">
            Have a question, partnership inquiry, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center shrink-0">
                  <Mail className="w-[18px] h-[18px] text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">hello@thecrew.app</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50/80 flex items-center justify-center shrink-0">
                  <MapPin className="w-[18px] h-[18px] text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-500">548 Market St, Suite 300<br />San Francisco, CA 94104</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center shrink-0">
                  <Globe className="w-[18px] h-[18px] text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Social</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">Twitter</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-sm text-gray-500">LinkedIn</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-sm text-gray-500">GitHub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/60">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" data-testid="input-contact-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" data-testid="input-contact-email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us what's on your mind..." className="min-h-[120px]" data-testid="input-contact-message" />
              </div>
              <Button className="w-full rounded-full font-medium" data-testid="button-contact-submit">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
