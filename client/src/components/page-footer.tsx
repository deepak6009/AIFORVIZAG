import { useLocation } from "wouter";

export default function PageFooter() {
  const [, navigate] = useLocation();

  return (
    <footer className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 border-t border-gray-200/60 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-12 gap-8 sm:gap-6 lg:gap-10">
          <div className="col-span-2 sm:col-span-3">
            <div className="flex items-center mb-1">
              <span className="text-gray-900 text-[15px] tracking-[0.02em] lowercase"><span className="font-light">the</span><span className="font-bold">crew</span></span>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Product</h4>
            <ul className="space-y-2.5">
              {["Workspaces", "Folders", "Uploads", "Team Roles", "Previews"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-gray-500 hover:text-gray-900 cursor-default transition-colors duration-200" data-testid={`footer-link-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {[{ label: "Help Center", path: "/help-center" }, { label: "Blog", path: "/blog" }, { label: "Changelog", path: "/changelog" }].map((item) => (
                <li key={item.label}>
                  <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[{ label: "About", path: "/about" }, { label: "Pricing", path: "/pricing" }, { label: "Privacy Policy", path: "/privacy-policy" }].map((item) => (
                <li key={item.label}>
                  <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 sm:col-span-3">
            <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">Help</h4>
            <ul className="space-y-2.5">
              {[{ label: "Support", path: "/support" }, { label: "Request a Feature", path: "/request-feature" }, { label: "Contact Us", path: "/contact" }].map((item) => (
                <li key={item.label}>
                  <span className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer transition-colors duration-200" onClick={() => navigate(item.path)} data-testid={`footer-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} thecrew. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
