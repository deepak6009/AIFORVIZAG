import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageNavbar from "@/components/page-navbar";
import PageFooter from "@/components/page-footer";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "For solo creators getting started",
    features: ["1 workspace", "100MB storage", "3 team members", "Basic folder structure", "Community support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    description: "For creators scaling with editors",
    features: ["Unlimited workspaces", "50GB storage", "25 team members", "Nested folders", "Priority email support", "Advanced roles"],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/mo",
    description: "For agencies and multi-creator teams",
    features: ["Everything in Pro", "500GB storage", "Unlimited members", "Priority support", "Custom branding", "API access", "SSO integration"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes, both Pro and Team plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What happens if I exceed my storage limit?",
    a: "We'll notify you when you're approaching your limit. You can upgrade your plan or remove unused files to free up space.",
  },
  {
    q: "Do you offer discounts for creators?",
    a: "Yes! We offer special pricing for verified content creators and educational creators. Contact us to learn more.",
  },
];

export default function PricingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <PageNavbar />

      <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 px-5 sm:px-8 lg:px-10 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-blue-500 mb-4">
            Pricing
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-900" data-testid="text-pricing-heading">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-lg mx-auto leading-[1.7]">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-5 sm:px-8 lg:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`rounded-2xl ${tier.highlight ? "border-blue-500 border-2 relative" : "border-gray-200/60"}`}
              data-testid={`card-tier-${tier.name.toLowerCase()}`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 sm:p-7">
                <h3 className="text-base font-semibold text-gray-900">{tier.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{tier.description}</p>
                <div className="mt-5 mb-6">
                  <span className="text-4xl font-bold text-gray-900 tracking-[-0.03em]">{tier.price}</span>
                  <span className="text-sm text-gray-400">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-full font-medium ${tier.highlight ? "bg-blue-500 text-white" : ""}`}
                  variant={tier.highlight ? "default" : "outline"}
                  onClick={() => navigate("/auth?mode=register")}
                  data-testid={`button-tier-${tier.name.toLowerCase()}`}
                >
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-12 sm:py-16 px-5 sm:px-8 lg:px-10 bg-white border-y border-gray-200/60">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} data-testid={`faq-item-${i}`}>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
