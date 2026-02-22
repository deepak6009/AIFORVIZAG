import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import SlideInButton from "@/components/slide-in-button";
import { ArrowLeft, Menu, X } from "lucide-react";

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
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            className="text-lg sm:text-xl tracking-[0.02em] lowercase text-gray-900 mr-4 cursor-pointer hover:opacity-70 transition-opacity"
            data-testid="text-app-name"
          >
            <span className="font-light">the</span><span className="font-bold">crew</span>
          </a>
          <button
            onClick={() => navigate("/auth")}
            className="text-gray-500 hover:text-gray-900 font-medium text-sm px-4 h-9 rounded-full transition-colors duration-200"
            data-testid="button-login"
          >
            Sign In
          </button>
          <SlideInButton
            onClick={() => navigate("/auth?mode=register")}
            size="sm"
            data-testid="button-get-started-nav"
          >
            Get Started
          </SlideInButton>
        </div>
        <div className="sm:hidden flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigate("/"); }}
            className="text-lg tracking-[0.02em] lowercase text-gray-900 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <span className="font-light">the</span><span className="font-bold">crew</span>
          </a>
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
          <button
            className="w-full h-10 rounded-full border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}
            data-testid="button-login-mobile"
          >
            Sign In
          </button>
          <SlideInButton
            fullWidth
            onClick={() => { navigate("/auth?mode=register"); setMobileMenuOpen(false); }}
            data-testid="button-get-started-mobile"
          >
            Get Started
          </SlideInButton>
        </div>
      )}
    </nav>
  );
}
