import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";

export default function PageNavbar() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass-scrolled border-b border-gray-200/40 shadow-sm" : "border-b border-transparent"}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-10 h-14 sm:h-16">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          data-testid="link-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <span
            className="text-lg sm:text-xl tracking-[0.02em] lowercase text-gray-900 mr-4"
            data-testid="text-app-name"
          >
            <span className="font-light">the</span><span className="font-bold">crew</span>
          </span>
          <Button
            variant="ghost"
            className="text-gray-500 font-medium text-sm"
            onClick={() => navigate("/auth")}
            data-testid="button-login"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/auth?mode=register")}
            className="bg-gray-900 text-white font-medium rounded-full text-sm"
            data-testid="button-get-started-nav"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
        <div className="sm:hidden flex items-center gap-3">
          <span className="text-lg tracking-[0.02em] lowercase text-gray-900">
            <span className="font-light">the</span><span className="font-bold">crew</span>
          </span>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200/60 bg-white px-5 py-4 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
            data-testid="button-login-mobile"
          >
            Sign In
          </Button>
          <Button
            className="w-full justify-center bg-gray-900 text-white"
            onClick={() => { navigate("/auth?mode=register"); setMobileMenuOpen(false); }}
            data-testid="button-get-started-mobile"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </nav>
  );
}
