"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-luxury-dark">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              The Private Vault for
              <br />
              <span className="gradient-text">Ultra-Luxury Real Estate</span>
            </h1>
            <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Access comprehensive property analysis, ownership history, market insights, and
              investment projections. Everything you need to make confident luxury real estate
              decisions.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup" className="luxury-button-primary">
                Get Started
              </Link>
              <Link href="/login" className="luxury-button-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 border-y border-gold-900">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold gradient-text">3</p>
              <p className="text-gray-400 text-sm mt-2">Featured Properties</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">$46.25M</p>
              <p className="text-gray-400 text-sm mt-2">Total Portfolio Value</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">2</p>
              <p className="text-gray-400 text-sm mt-2">Expert Agents</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-dark-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">The Four Truth Pillars</h2>
              <p className="text-gray-400">De-risk your investment with comprehensive analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Pillar 1 */}
              <div className="luxury-card group hover:border-gold-500 transition">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold mb-3">Provenance & Legal</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Immutable blockchain-verified ownership history with complete transaction
                  records
                </p>
                <div className="text-gold-400 text-sm">→ Authenticity verified</div>
              </div>

              {/* Pillar 2 */}
              <div className="luxury-card group hover:border-gold-500 transition">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-bold mb-3">Technical & Structural</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Complete documents, AI-powered analysis, full maintenance history with expert
                  insights
                </p>
                <div className="text-gold-400 text-sm">→ AI analyst included</div>
              </div>

              {/* Pillar 3 */}
              <div className="luxury-card group hover:border-gold-500 transition">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-3">Market Insight</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Real-time market analysis, neighborhood vibe, local policies, and economic
                  outlook
                </p>
                <div className="text-gold-400 text-sm">→ Agent expertise</div>
              </div>

              {/* Pillar 4 */}
              <div className="luxury-card group hover:border-gold-500 transition">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-3">Investment & Tax</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Interactive simulators, scenario planning, ROI projections, and policy impact
                  analysis
                </p>
                <div className="text-gold-400 text-sm">→ Play with numbers</div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Sides Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">For Agents & Clients</h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Agent Side */}
              <div className="bg-dark-800 border border-gold-900 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">
                  <span className="text-gold-400">👨‍💼</span> For Real Estate Agents
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Upload properties in less than 1 minute via AI chatbot</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Build your market knowledge profile with expertise</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Generate secure links to share with your clients</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Track client engagement and interactions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Manage multiple properties from one dashboard</span>
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="luxury-button-primary block text-center mt-8 w-full"
                >
                  Sign Up as Agent
                </Link>
              </div>

              {/* Client Side */}
              <div className="bg-dark-800 border border-gold-900 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">
                  <span className="text-gold-400">💎</span> For High-Net-Worth Clients
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Access comprehensive property analysis in one place</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Verify authenticity with blockchain-backed ownership records</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Review documents with AI-powered analysis</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Simulate investment scenarios with interactive calculators</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-gold-400">✓</span>
                    <span>Access agent's local market expertise and predictions</span>
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="luxury-button-primary block text-center mt-8 w-full"
                >
                  Sign Up as Client
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 border-t border-gold-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to transform real estate investing?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join agents and clients who are taking control of luxury property investments with
              complete transparency and data-driven insights.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup" className="luxury-button-primary">
                Start Free
              </Link>
              <a href="#features" className="luxury-button-secondary">
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
