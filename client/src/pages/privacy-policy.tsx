import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    content: "We collect information you provide directly, including your name, email address, and any content you upload to the platform. We also automatically collect certain technical information when you use our service, such as your IP address, browser type, device information, and usage patterns within the application.",
  },
  {
    title: "How We Use Information",
    content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you about your account and updates, to respond to your requests and support inquiries, and to protect the security and integrity of our platform. We do not sell your personal information to third parties.",
  },
  {
    title: "Data Storage",
    content: "Your data is stored on secure, encrypted servers. Media files uploaded to thecrew are stored in cloud infrastructure with redundancy across multiple regions. We retain your data for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time.",
  },
  {
    title: "Cookies",
    content: "We use essential cookies to keep you signed in and maintain your session preferences. We may also use analytics cookies to understand how our service is used and to improve the user experience. You can control cookie preferences through your browser settings.",
  },
  {
    title: "Your Rights",
    content: "You have the right to access, correct, or delete your personal data at any time. You can export your data from the platform, request a copy of all information we hold about you, or ask us to delete your account entirely. We will respond to all data requests within 30 days.",
  },
  {
    title: "Contact",
    content: "If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@thecrew.app. We are committed to resolving any concerns you may have about our handling of your personal information.",
  },
];

export default function PrivacyPolicyPage() {
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
            Legal
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-privacy-heading">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-400">
            Last updated: February 1, 2026
          </p>
          <p className="mt-5 text-base text-gray-500 max-w-2xl leading-[1.7]">
            At thecrew, your privacy matters. This policy explains what data we collect, how we use it, and how we protect your information.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {sections.map((s, i) => (
            <div key={i} data-testid={`section-privacy-${i}`}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{s.title}</h2>
              <p className="text-[15px] text-gray-500 leading-[1.8]">{s.content}</p>
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