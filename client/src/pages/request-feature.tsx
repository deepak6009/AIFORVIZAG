import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ArrowLeft, Lightbulb } from "lucide-react";

export default function RequestFeaturePage() {
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
            Feedback
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-feature-heading">
            Request a Feature
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl leading-[1.7]">
            Your feedback shapes thecrew. Tell us what features would make your workflow better — we read every request.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center">
              <Lightbulb className="w-[18px] h-[18px] text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Share your idea</h2>
              <p className="text-xs text-gray-400">We review feature requests weekly</p>
            </div>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="feature-title">Feature Title</Label>
              <Input id="feature-title" placeholder="e.g., Bulk file renaming" data-testid="input-feature-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger data-testid="select-feature-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui">UI</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="integrations">Integrations</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the feature you'd like to see and how it would help your workflow..."
                className="min-h-[120px]"
                data-testid="input-feature-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger data-testid="select-feature-priority">
                  <SelectValue placeholder="How important is this?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nice-to-have">Nice to have</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full rounded-full font-medium" data-testid="button-feature-submit">
              Submit Request
            </Button>
          </form>
        </div>
      </section>

      <footer className="py-8 px-5 sm:px-8 text-center border-t border-gray-200/60">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} thecrew. All rights reserved.</p>
      </footer>
    </div>
  );
}