import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layers,
  Users,
  FolderOpen,
  Upload,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Organized Workspaces",
    description:
      "Create dedicated workspaces for different projects, teams, or clients. Keep everything neatly organized.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite team members with role-based access. Admins, members, and viewers — everyone has the right permissions.",
  },
  {
    icon: FolderOpen,
    title: "Folder Structure",
    description:
      "Build nested folder hierarchies to organize your images and videos exactly how you need them.",
  },
  {
    icon: Upload,
    title: "Media Uploads",
    description:
      "Upload images and videos directly to your workspace folders. Drag and drop for quick uploads.",
  },
  {
    icon: Shield,
    title: "Secure Access",
    description:
      "Your files are protected with workspace-level access control. Only authorized members can view content.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on modern cloud infrastructure for fast uploads and instant file previews.",
  },
];

const highlights = [
  "Unlimited workspaces",
  "Cloud-backed file storage",
  "Team member management",
  "Nested folder hierarchies",
  "Image & video support",
  "Secure authentication",
];

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg" data-testid="text-app-name">
              WorkVault
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              data-testid="button-login"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth?mode=register")}
              data-testid="button-get-started-nav"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
              data-testid="text-hero-heading"
            >
              Your team's media,
              <br />
              <span className="text-primary">beautifully organized.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
              Create workspaces, invite your team, and organize images and videos
              in intuitive folder structures. Everything in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate("/auth?mode=register")}
                data-testid="button-get-started"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                data-testid="button-hero-signin"
              >
                Sign In
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Secure cloud storage
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Team collaboration
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl" />
              <div className="relative bg-card border rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-4/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-2/60" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Marketing Campaign</span>
                    <span className="ml-auto text-xs text-muted-foreground">12 files</span>
                  </div>
                  <div className="pl-8 space-y-2">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Social Media</span>
                      <span className="ml-auto text-xs text-muted-foreground">5 files</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Print Assets</span>
                      <span className="ml-auto text-xs text-muted-foreground">7 files</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Product Photos</span>
                    <span className="ml-auto text-xs text-muted-foreground">24 files</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Brand Videos</span>
                    <span className="ml-auto text-xs text-muted-foreground">8 files</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold mb-3"
              data-testid="text-features-heading"
            >
              Everything you need
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Powerful features to help your team manage and organize media assets
              efficiently.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-background border-card-border"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2
            className="text-3xl font-bold text-foreground"
            data-testid="text-highlights-heading"
          >
            Start organizing today
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            {highlights.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-2"
                data-testid={`text-highlight-${index}`}
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate("/auth?mode=register")}
            data-testid="button-cta-get-started"
          >
            Create Your Workspace
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <footer className="py-8 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="w-4 h-4" />
            <span>WorkVault</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WorkVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
