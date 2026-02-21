import Image from "next/image";
import {
  Check,
  Shield,
  CreditCard,
  Users,
  Mail,
  BarChart3,
  FileText,
  Database,
  Settings2,
  Zap,
  ArrowRight,
  Code,
  Layers,
  Lock,
  Palette,
  Star,
  Search,
  TrendingUp,
  ClipboardList,
  Upload,
} from "lucide-react";
import FAQItem from "../components/FAQItem";
import { TrackedCTALink } from "@/components/app/tracked-cta-link";
import { FinalCTASection } from "./components/final-cta-section";
import crunchbaseLogo from "../../../public/logos/crunchbase.svg";
import g2Logo from "../../../public/logos/g2.svg";
import capterraLogo from "../../../public/logos/capterra.svg";
import getappLogo from "../../../public/logos/getapp.svg";
import trustpilotLogo from "../../../public/logos/trustpilot.svg";

import mastercardIcon from "../../../public/icons/mastercard.svg";
import visaIcon from "../../../public/icons/visacard.svg";
import amexIcon from "../../../public/icons/amexcard.svg";
import maestroIcon from "../../../public/icons/maestrocard.svg";
import applepayIcon from "../../../public/icons/applepay.svg";
import googlepayIcon from "../../../public/icons/googlepay.svg";
import profileImg from "../../../public/profile-img.png";

const faqData = [
  {
    question: "What's included in this starter kit?",
    answer:
      "The starter kit includes authentication (Clerk), a real-time database (Convex), payment processing, team management, email automation, analytics integration, a blog system, and a fully responsive marketing site. Everything is pre-configured and ready for production.",
  },
  {
    question: "What tech stack does this use?",
    answer:
      "Next.js 15 with the App Router, React 19, Tailwind CSS 4, Convex for the backend, Clerk for authentication, and shadcn/ui for components. TypeScript throughout with strict mode enabled.",
  },
  {
    question: "Can I customize everything?",
    answer:
      "Absolutely. Every component, page, and feature is fully customizable. The codebase follows clean architecture patterns with small, focused components that are easy to understand and modify.",
  },
  {
    question: "How do I get started?",
    answer:
      "Clone the repo, set up your environment variables for Clerk and Convex, run npm install, and start the development server. The onboarding guide walks you through each step in under 10 minutes.",
  },
  {
    question: "Is this production-ready?",
    answer:
      "Yes. This kit is extracted from a live production app serving real users. Error handling, loading states, TypeScript strict mode, and security best practices are all baked in.",
  },
  {
    question: "Do I need to pay for the third-party services?",
    answer:
      "Clerk, Convex, and most other integrations have generous free tiers that work for development and early-stage products. You only pay as you scale.",
  },
  {
    question: "Can I use this for a SaaS product?",
    answer:
      "That's exactly what it's built for. Auth, payments, teams, credit systems, and user management are all included. Focus on your unique features instead of rebuilding infrastructure.",
  },
  {
    question: "Is there ongoing support or updates?",
    answer:
      "The starter kit is regularly updated to stay current with the latest versions of Next.js, React, and other dependencies. Check the repository for the latest changes.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white md:pt-12 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-6 flex flex-col items-center justify-center md:gap-3 gap-1 flex-wrap">
              <span>Build Your Product Faster</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              A production-ready SaaS starter kit with auth, payments, teams,
              and more.{" "}
              <span className="italic underline bg-success/10 text-success px-2 py-1 rounded-sm">
                Ship in days,{" "}
                <span className="font-semibold">not months.</span>
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center md:items-start mb-12">
              <div className="flex flex-col items-center">
                <TrackedCTALink
                  href="/app"
                  variant="default"
                  className="text-xl px-12 py-6 flex items-center"
                  size="lg"
                  eventData={{ button_location: "hero_cta_1" }}
                >
                  Get Started
                  <ArrowRight />
                </TrackedCTALink>
                <span className="text-[13px] text-muted-foreground mt-2">
                  Free to start - no credit card required
                </span>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  50+
                </div>
                <p className="text-sm text-muted-foreground">Features</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  100%
                </div>
                <p className="text-sm text-muted-foreground">TypeScript</p>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  10min
                </div>
                <p className="text-sm text-muted-foreground">Setup Time</p>
              </div>
            </div>
          </div>

          {/* Hero Image Placeholder — replace with your product screenshot or dashboard mock */}
          <div className="relative max-w-7xl mx-auto mb-8 rounded-sm overflow-hidden">
            <div className="bg-muted border border-border rounded-sm p-4 md:px-16 md:py-16">
              <div className="bg-background rounded-sm shadow-2xl border border-border aspect-video flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Your product screenshot or dashboard preview goes here
                </p>
              </div>
            </div>
          </div>

          {/* Trust Logos — Replace # links with your real profile URLs (see DOCS/FOUNDER/DIGITAL_PRESENCE.md) */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="text-foreground">
                  Trusted by{" "}
                  <span className="text-foreground font-semibold">
                    agencies,
                    <br />
                    companies
                  </span>{" "}
                  and{" "}
                  <span className="text-primary font-semibold">individual</span>
                  <br />
                  users{" "}
                  <span className="text-primary font-semibold">
                    growing with us
                  </span>
                  .
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap md:flex-nowrap">
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src={crunchbaseLogo}
                    alt="Crunchbase"
                    className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src={g2Logo}
                    alt="G2"
                    className="h-8 md:h-10 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src={capterraLogo}
                    alt="Capterra"
                    className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src={getappLogo}
                    alt="GetApp"
                    className="h-16 md:h-24 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Image
                    src={trustpilotLogo}
                    alt="Trustpilot"
                    className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-4">
              Everything You Need to Launch
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stop rebuilding the same infrastructure. Start with a
              production-tested foundation and focus on what makes your product
              unique.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-background border border-border rounded-sm p-8">
              <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                1. Clone & Configure
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Clone the repo, add your environment variables, and you have a
                running app with auth, database, and payments in minutes.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-background border border-border rounded-sm p-8">
              <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                2. Customize & Build
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Swap in your branding, tweak the components, and build your
                unique features on top of a solid, well-documented foundation.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-background border border-border rounded-sm p-8">
              <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                3. Ship & Scale
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Deploy to production with confidence. Every feature is battle-tested
                with real users and built to scale from day one.
              </p>
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-start gap-3 mt-12 mb-8">
            {[
              { icon: Lock, label: "Authentication" },
              { icon: CreditCard, label: "Payments" },
              { icon: Users, label: "Team Management" },
              { icon: Mail, label: "Email Automation" },
              { icon: BarChart3, label: "Analytics" },
              { icon: FileText, label: "Blog System" },
              { icon: Database, label: "Real-time Database" },
              { icon: Shield, label: "Role-Based Access" },
              { icon: Settings2, label: "Admin Dashboard" },
              { icon: Layers, label: "Multi-Tenancy" },
              { icon: Zap, label: "Webhooks" },
              { icon: Palette, label: "Design System" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground font-medium"
              >
                <feature.icon className="w-4 h-4 text-muted-foreground" />
                {feature.label}
              </div>
            ))}
            <TrackedCTALink
              href="/app"
              variant="default"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
              eventData={{ button_location: "feature_badges" }}
            >
              <ArrowRight className="w-4 h-4" />
              Get Started
            </TrackedCTALink>
          </div>
        </div>
      </section>

      {/* Features Detail Section */}
      <section id="benefits" className="px-4 py-20 bg-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-4">
              Built for Production from Day One
            </h2>
            <p className="text-lg text-gray-600 max-w-[900px] mx-auto">
              Every feature is extracted from a live production app. No toy
              demos, no TODO comments. Real patterns that work at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Auth & Users */}
            <div className="border bg-background border-border rounded-sm p-6">
              <div className="flex items-center -space-x-2 mb-4">
                {[Lock, Users, Shield, Settings2].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Auth & Users
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Clerk authentication with webhook sync, role-based access
                control, and user management out of the box.
              </p>
            </div>

            {/* Payments */}
            <div className="bg-background border border-border rounded-sm p-6">
              <div className="flex items-center -space-x-2 mb-4">
                {[CreditCard, Zap, BarChart3, Layers].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Payments & Credits
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Credit-based payment system with packages, usage tracking, and
                purchase flows. Ready to monetize from day one.
              </p>
            </div>

            {/* Real-time Backend */}
            <div className="bg-background border border-border rounded-sm p-6">
              <div className="flex items-center -space-x-2 mb-4">
                {[Database, Zap, Layers, Code].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Real-time Backend
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Convex real-time database with type-safe queries, mutations,
                actions, and automatic TypeScript type generation.
              </p>
            </div>

            {/* Developer Experience */}
            <div className="bg-background border border-border rounded-sm p-6">
              <div className="flex items-center -space-x-2 mb-4">
                {[Code, Palette, FileText, Settings2].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Developer Experience
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                TypeScript strict mode, shadcn/ui components, Tailwind CSS 4,
                clean architecture, and comprehensive error handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-primary/3 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Title and description */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-4xl font-semibold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Buy credits once, use them whenever you need. No monthly
              commitments, no automatic renewals. Credits never expire.
            </p>
          </div>

          {/* Top feature bar */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
            {[
              { icon: Search, title: "Smart Search", subtitle: "Find what you need" },
              { icon: FileText, title: "Unlimited Projects", subtitle: "No project limits" },
              { icon: Settings2, title: "Automations", subtitle: "Zero manual work" },
              { icon: TrendingUp, title: "Analytics", subtitle: "Track your growth" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main pricing grid */}
          <div className="grid lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Left - Pricing Card */}
            <div className="bg-background rounded-l-sm p-8 border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Zap className="w-4 h-4" />
                <span>630 credits</span>
              </div>

              <h3 className="text-3xl font-bold text-foreground mb-1">Standard</h3>
              <p className="text-muted-foreground mb-4">Perfect for getting started</p>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl text-muted-foreground line-through">$138</span>
                <span className="text-5xl font-bold text-foreground">$69</span>
                <span className="text-muted-foreground">one-time</span>
              </div>

              <TrackedCTALink
                href="/app"
                variant="default"
                size="lg"
                className="w-full mb-4"
                eventData={{ button_location: "pricing_standard" }}
              >
                Get Started
              </TrackedCTALink>

              <p className="text-sm text-muted-foreground mb-6">One-time payment. Credits never expire.</p>

              <div className="space-y-3">
                {[
                  "630 credits to use on any action",
                  "Full access to all features",
                  "Team collaboration (up to 7 members)",
                  "Real-time database access",
                  "Analytics dashboard",
                  "Email notifications",
                  "Priority support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Refund policy and payment methods */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  We offer a 60-day money-back policy. By purchasing, you agree to our terms of service.
                </p>
                <div className="flex items-start justify-start gap-2">
                  <Image src={mastercardIcon} alt="Mastercard" className="h-6 w-auto" />
                  <Image src={visaIcon} alt="Visa" className="h-6 w-auto" />
                  <Image src={amexIcon} alt="American Express" className="h-6 w-auto" />
                  <Image src={maestroIcon} alt="Maestro" className="h-6 w-auto" />
                  <Image src={applepayIcon} alt="Apple Pay" className="h-6 w-auto" />
                  <Image src={googlepayIcon} alt="Google Pay" className="h-6 w-auto" />
                </div>
              </div>
            </div>

            {/* Right - Features + Testimonial */}
            <div className="bg-accent rounded-r-sm p-8 border border-border flex flex-col">
              <h4 className="text-2xl font-bold text-foreground mb-2">All-in-One Solution</h4>
              <p className="text-muted-foreground mb-6">Everything you need to launch and grow your product</p>

              <div className="space-y-5 flex-grow">
                {[
                  {
                    icon: ClipboardList,
                    title: "Complete Dashboard",
                    description: "Full admin dashboard with analytics, user management, and real-time data.",
                  },
                  {
                    icon: CreditCard,
                    title: "Built-in Payments",
                    description: "Credit-based payments with packages, usage tracking, and automated billing.",
                  },
                  {
                    icon: Upload,
                    title: "Team Collaboration",
                    description: "Invite team members, manage roles, and collaborate on projects together.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Analytics & Insights",
                    description: "Track user behavior, monitor growth metrics, and make data-driven decisions.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">{item.title}</h5>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Founder Testimonial — Replace with your own photo and quote */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground italic mb-4">
                  &quot;Replace this with a testimonial from your first customer or your own
                  founder quote about why you built the product.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={profileImg}
                    alt="Founder"
                    className="w-10 h-10 rounded-full object-cover"
                    width={40}
                    height={40}
                  />
                  <div>
                    <p className="font-semibold text-foreground">Your Name</p>
                    <p className="text-sm text-muted-foreground">Founder of Your App</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="container mx-auto px-4 py-16 max-w-[1200px]"
      >
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#001438] mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-[700px]">
            Explore our comprehensive FAQ to find quick answers to common
            inquiries. If you need further assistance, don&apos;t hesitate to
            contact us for personalized help.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-0">
            {faqData
              .slice(0, Math.ceil(faqData.length / 2))
              .map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
          </div>

          {/* Right Column */}
          <div className="space-y-0">
            {faqData.slice(Math.ceil(faqData.length / 2)).map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <FinalCTASection buttonLocation="landing_final_cta" />
    </div>
  );
}
