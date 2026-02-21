import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth";
import LandingPage from "@/pages/landing";
import WorkspaceLayout from "@/pages/workspace-layout";
import NotFound from "@/pages/not-found";
import AboutPage from "@/pages/about";
import PricingPage from "@/pages/pricing";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import HelpCenterPage from "@/pages/help-center";
import BlogPage from "@/pages/blog";
import ChangelogPage from "@/pages/changelog";
import SupportPage from "@/pages/support";
import RequestFeaturePage from "@/pages/request-feature";
import ContactPage from "@/pages/contact";
import { Skeleton } from "@/components/ui/skeleton";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/about" component={AboutPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/help-center" component={HelpCenterPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/changelog" component={ChangelogPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/request-feature" component={RequestFeaturePage} />
      <Route path="/contact" component={ContactPage} />
      {!user ? (
        <>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={LandingPage} />
          <Route component={LandingPage} />
        </>
      ) : (
        <>
          <Route path="/" component={WorkspaceLayout} />
          <Route path="/workspace/:id" component={WorkspaceLayout} />
          <Route path="/workspace/:id/:tab" component={WorkspaceLayout} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
