"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { mockAgents } from "@/lib/db";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AgentProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [agent] = useState(mockAgents[0]);
  const [formData, setFormData] = useState({
    marketKnowledge: agent?.marketKnowledge || "",
    expertiseAreas: "Luxury properties, Waterfront developments, Investment properties",
    yearsExperience: 15,
    bio: agent?.bio || "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
    }
  }, [user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsExperience" ? parseInt(value) : value,
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // In a real app, this would save to a database
  };

  if (!user || user.role !== "agent") {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/agent/dashboard" className="text-gold-400 hover:text-gold-300 mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold mb-2">Agent Profile</h1>
            <p className="text-gray-400">Manage your professional information</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="space-y-6">
              <div className="luxury-card text-center">
                <div className="mb-6">
                  <img
                    src={agent?.profileImage}
                    alt={agent?.name}
                    className="w-32 h-32 rounded-full border-4 border-gold-500 mx-auto mb-4"
                  />
                  <h2 className="text-2xl font-bold">{agent?.name}</h2>
                  <p className="text-gold-400 font-semibold mt-1">
                    Real Estate Agent
                  </p>
                </div>

                <div className="border-t border-gold-800 pt-6 space-y-4 text-left">
                  <div>
                    <p className="text-gray-500 text-sm">PHONE</p>
                    <p className="font-semibold">{agent?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">EMAIL</p>
                    <p className="font-semibold text-gold-400">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">SPECIALIZATION</p>
                    <p className="font-semibold">Luxury Real Estate</p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="luxury-card">
                <h3 className="text-lg font-bold mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">PROPERTIES LISTED</p>
                    <p className="text-3xl font-bold text-gold-400">3</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">TOTAL VALUE</p>
                    <p className="text-2xl font-bold">$46.25M</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">CLIENTS ENGAGED</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2 space-y-6">
              {saved && (
                <div className="bg-green-900 border border-green-500 rounded-lg p-4">
                  <p className="text-green-400">✓ Profile updated successfully</p>
                </div>
              )}

              {/* Professional Information */}
              <div className="luxury-card">
                <h2 className="text-2xl font-bold mb-6">Professional Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="luxury-input"
                      min="0"
                      max="70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Expertise Areas (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="expertiseAreas"
                      value={formData.expertiseAreas}
                      onChange={handleInputChange}
                      className="luxury-input"
                      placeholder="Luxury waterfront properties, Historic estates, Investment properties..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Examples: Luxury Properties, Waterfront, Commercial, Residential
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Knowledge */}
              <div className="luxury-card">
                <h2 className="text-2xl font-bold mb-6">Market Knowledge</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="luxury-input h-24"
                      placeholder="Write a brief professional biography to showcase your expertise..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Market Knowledge & Insights
                    </label>
                    <textarea
                      name="marketKnowledge"
                      value={formData.marketKnowledge}
                      onChange={handleInputChange}
                      className="luxury-input h-32"
                      placeholder="Share your insights about local market trends, investment opportunities, neighborhood dynamics, economic outlook, and pricing strategies..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      This information helps clients understand market conditions when viewing your properties
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="luxury-card">
                <h2 className="text-2xl font-bold mb-6">Credentials & Certifications</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-dark-700 rounded-lg border border-gold-800">
                    <span className="text-gold-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold">Florida Real Estate License</p>
                      <p className="text-sm text-gray-400">Active - Expires Dec 31, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-dark-700 rounded-lg border border-gold-800">
                    <span className="text-gold-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold">National Association of REALTORS®</p>
                      <p className="text-sm text-gray-400">Member since 2015</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-dark-700 rounded-lg border border-gold-800">
                    <span className="text-gold-400 text-xl">✓</span>
                    <div>
                      <p className="font-semibold">Certified Luxury Home Marketing Specialist</p>
                      <p className="text-sm text-gray-400">REBAC Training Certified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button onClick={handleSave} className="luxury-button-primary flex-1">
                  Save Changes
                </button>
                <Link href="/agent/dashboard" className="flex-1">
                  <button className="luxury-button-secondary w-full">
                    Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
