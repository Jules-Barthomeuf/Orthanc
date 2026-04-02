"use client";

import Link from "next/link";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useEffect, useState, useRef } from "react";

/* ── Page title ── */
if (typeof document !== 'undefined') document.title = 'Orthanc - Home';

/* ── Stat counter ── */
function AnimatedStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      let start = 0;
      const step = Math.max(1, Math.floor(value / 40));
      const id = setInterval(() => {
        start += step;
        if (start >= value) { setCount(value); clearInterval(id); }
        else setCount(start);
      }, 30);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [visible, value, delay]);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl md:text-5xl text-white mb-2">{count}{suffix}</p>
      <p className="text-dark-400 text-xs tracking-widest uppercase">{label}</p>
    </div>
  );
}

/* ── Icons (inline SVG) ── */
const ShieldIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const SparklesIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const HeartIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const GlobeIcon = () => (
  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-4.247m0 0A8.966 8.966 0 013 12c0-1.777.515-3.434 1.404-4.832" />
  </svg>
);

const FEATURES = [
  { icon: <ShieldIcon />, title: "Digital Property Vault", desc: "Every asset is sealed in a sovereign digital vault with complete provenance tracking, ownership history, and verified documentation." },
  { icon: <SparklesIcon />, title: "AI-Powered Analysis", desc: "Our intelligent assistant generates listings, analyzes markets, and provides investment insights in seconds — not weeks." },
  { icon: <ChartIcon />, title: "Investment Intelligence", desc: "Real-time market data, ROI projections, and comparable analysis to make informed decisions on ultra-luxury assets." },
  { icon: <LockIcon />, title: "Bank-Grade Security", desc: "End-to-end encryption, document sealing, and immutable audit trails protect every transaction and document." },
];

const VALUES = [
  { icon: <EyeIcon />, title: "Radical Transparency", desc: "We believe every property transaction deserves full visibility. From ownership history to maintenance records, nothing stays hidden." },
  { icon: <HeartIcon />, title: "Craftsmanship Over Speed", desc: "Luxury real estate deserves meticulous care. We build tools that respect the art of the deal, not shortcuts." },
  { icon: <GlobeIcon />, title: "Global, Yet Personal", desc: "Serving agents and investors worldwide while keeping every interaction intimate, private, and tailored." },
  { icon: <ShieldIcon />, title: "Trust as Foundation", desc: "In a world of uncertainty, we provide verifiable truth. Every document sealed, every data point authenticated." },
];

export default function Home() {
  return (
    <div className="bg-dark-900 text-white">
      <Navbar variant="landing" />

      {/* ═══════════ HERO — Split layout ═══════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[40rem] h-[40rem] bg-gold-400/[0.03] rounded-full blur-[180px]" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gold-400/[0.02] rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "700ms" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "linear-gradient(rgba(201,169,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.3) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        <div className="absolute top-12 left-12 w-20 h-20 border-t border-l border-gold-400/[0.1] rounded-tl-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div>
              <div className="gold-line-left w-16 mb-8 animate-reveal-line" />

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight leading-[1.05] animate-fade-up-d1">
                The Truth Standard For Luxury Real Estate
              </h1>

              <p className="text-dark-300 text-base md:text-lg leading-relaxed max-w-xl mb-10 animate-fade-up-d2">
                Take your advisory role a step further. Enable your clients to experience their properties in a new way, with transparency and trust, all through a single and secure platform. Built for agents who really care about their clients.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-up-d3">
                <Link href="/signup" className="luxury-button-primary text-sm py-3.5 px-10 text-center">
                  Get Started
                </Link>
                <Link href="/login" className="luxury-button-secondary text-sm py-3.5 px-10 text-center">
                  Sign In
                </Link>
              </div>

              <p className="text-dark-500 text-xs animate-fade-up-d4">
                Trusted by elite agents managing $2B+ in luxury assets
              </p>
            </div>

            {/* Right — Hero image */}
            <div className="relative animate-fade-up-d2 hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-gold-400/[0.08] shadow-2xl shadow-black/40">
                <img
                  src="/hero.jpg"
                  alt="Luxury mountain estate"
                  className="w-full h-[600px] object-cover"
                />
                {/* Dark gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-dark-900/10" />
                {/* Gold border glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold-400/[0.08]" />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -left-6 bg-dark-800/90 backdrop-blur-xl border border-gold-400/[0.12] rounded-xl p-5 shadow-2xl animate-fade-up-d4">
                <p className="text-gold-400 font-display text-2xl mb-1">$4.2M</p>
                <p className="text-dark-400 text-xs tracking-wider uppercase">Avg. Listing Value</p>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-dark-800/90 backdrop-blur-xl border border-gold-400/[0.12] rounded-xl px-4 py-3 shadow-2xl animate-fade-up-d5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white text-xs font-medium">AI Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-up-d5">
          <div className="w-5 h-9 border border-white/10 rounded-full flex justify-center">
            <div className="w-0.5 h-2 bg-gold-400/40 rounded-full mt-2 animate-bounce" style={{ animationDuration: "1.5s" }} />
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="border-y border-gold-400/[0.08] bg-dark-800/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <AnimatedStat value={500} suffix="+" label="Properties Managed" delay={200} />
          <AnimatedStat value={2} suffix="B+" label="Assets Under Analysis" delay={400} />
          <AnimatedStat value={98} suffix="%" label="Client Satisfaction" delay={600} />
          <AnimatedStat value={24} suffix="/7" label="AI Availability" delay={800} />
        </div>
      </section>

      {/* ═══════════ WHAT WE DO ═══════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-gold-400/[0.02] rounded-full blur-[160px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left — Intro text */}
            <div>
              <p className="label-luxury text-gold-400/60 mb-4">What We Do</p>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-6 leading-tight">
                The Command Center for Ultra-Luxury Real Estate
              </h2>
              <div className="gold-line-left w-16 mb-8" />
              <p className="text-dark-300 text-sm leading-relaxed mb-6">
                Orthanc transforms how elite agents and investors interact with high-value properties. We combine artificial intelligence with sovereign-grade document management to create a single source of truth for every asset.
              </p>
              <p className="text-dark-400 text-sm leading-relaxed mb-6">
                From the moment a property enters the platform, it receives a complete digital identity — ownership provenance, market analysis, investment projections, maintenance history, and sealed documentation — all accessible through an intuitive vault interface.
              </p>
              <p className="text-dark-400 text-sm leading-relaxed">
                Our AI doesn't just assist — it anticipates. Describe a property in natural language, and watch as a full listing materializes with market comps, investment analysis, and professional documentation ready for your clients.
              </p>
            </div>
            {/* Right — Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="group bg-dark-800/50 border border-gold-400/[0.08] rounded-2xl p-6 hover:border-gold-400/20 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-400/[0.06] border border-gold-400/[0.12] flex items-center justify-center mb-4 group-hover:bg-gold-400/[0.12] transition-colors duration-500">
                    {f.icon}
                  </div>
                  <h3 className="font-display text-base text-white mb-2">{f.title}</h3>
                  <p className="text-dark-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT WE BELIEVE IN ═══════════ */}
      <section className="py-28 border-t border-gold-400/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/3 left-1/4 w-[30rem] h-[30rem] bg-gold-400/[0.02] rounded-full blur-[160px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <p className="label-luxury text-gold-400/60 mb-4">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              What We Believe In
            </h2>
            <div className="gold-line w-16 mx-auto mt-6" />
            <p className="text-dark-400 text-sm mt-6 max-w-2xl mx-auto leading-relaxed">
              We didn't build Orthanc to disrupt. We built it to elevate. Every decision we make is guided by a set of principles that put integrity, craftsmanship, and trust above everything else.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className="flex gap-5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-400/[0.06] border border-gold-400/[0.12] flex items-center justify-center flex-shrink-0 group-hover:bg-gold-400/[0.12] transition-colors duration-500">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg text-white mb-2">{v.title}</h3>
                  <p className="text-dark-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-28 border-t border-gold-400/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="label-luxury text-gold-400/60 mb-4">Process</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              Three Steps to Intelligence
            </h2>
            <div className="gold-line w-16 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Upload & Describe", desc: "Add property details, images, and documents — or let our AI generate everything from a simple description." },
              { step: "02", title: "AI Analyzes", desc: "Our engine processes market data, comps, and trends to provide a comprehensive investment analysis in seconds." },
              { step: "03", title: "Seal & Share", desc: "Lock your property vault with verified provenance and share secure access with qualified investors." },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold-400/20 mb-6">
                  <span className="font-display text-gold-400 text-lg">{item.step}</span>
                </div>
                <h3 className="font-display text-xl text-white mb-3">{item.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHO IT'S FOR ═══════════ */}
      <section className="py-28 border-t border-gold-400/[0.06] bg-dark-800/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="label-luxury text-gold-400/60 mb-4">Audience</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              Built for the Best
            </h2>
            <div className="gold-line w-16 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Elite Agents", desc: "Manage your portfolio with AI-generated listings, professional documentation, and real-time market intelligence. Spend less time on paperwork, more time closing.", badge: "Agents" },
              { title: "Private Investors", desc: "Access verified property vaults with complete due diligence data. Investment analysis, provenance tracking, and market comparables — all in one secure view.", badge: "Investors" },
              { title: "Family Offices", desc: "Oversee multiple high-value assets with institutional-grade reporting, sealed documentation, and AI-driven portfolio insights across your entire real estate holdings.", badge: "Institutions" },
            ].map((item, i) => (
              <div key={item.title} className="bg-dark-800/50 border border-gold-400/[0.08] rounded-2xl p-8 hover:border-gold-400/20 transition-all duration-500 group">
                <span className="label-luxury text-gold-400/50 text-[10px]">{item.badge}</span>
                <h3 className="font-display text-xl text-white mt-4 mb-4">{item.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gold-400/[0.03] rounded-full blur-[160px]" />
        </div>
        <div className="absolute inset-0 border-t border-b border-gold-400/[0.06]" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="gold-line w-20 mx-auto mb-10" />
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
            Ready to Elevate Your Portfolio?
          </h2>
          <p className="text-dark-400 text-sm leading-relaxed mb-10 max-w-lg mx-auto">
            Join the exclusive network of agents and investors using Orthanc to manage ultra-luxury real estate with unprecedented intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="luxury-button-primary text-sm py-3 px-10 w-full sm:w-auto text-center">
              Create Your Account
            </Link>
            <Link href="/login" className="luxury-button-secondary text-sm py-3 px-10 w-full sm:w-auto text-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />
    </div>
  );
}
