"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { useToastStore } from "@/lib/toast";
import { Property } from "@/types";

interface Portal {
  id: string;
  name: string;
  slug: string;
  agentId: string;
  description: string;
  propertyIds: string[];
  createdAt: string;
}

interface PortalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PortalDetailPage({ params }: PortalDetailPageProps) {
  const { id } = React.use(params);
  const { user } = useAuthStore();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Import modal state (same as my-properties)
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importSaving, setImportSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const [portalRes, propsRes] = await Promise.all([
          fetch(`/api/portals?agentId=${encodeURIComponent(user.id)}`),
          fetch("/api/properties"),
        ]);
        if (portalRes.ok) {
          const portals: Portal[] = await portalRes.json();
          const found = portals.find((p) => p.id === id);
          if (found) {
            setPortal(found);
            setEditName(found.name);
            setEditDesc(found.description);
          }
        }
        if (propsRes.ok) {
          setAllProperties(await propsRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router, id]);

  const portalProperties = useMemo(() => {
    if (!portal) return [];
    return allProperties.filter((p) => portal.propertyIds.includes(p.id));
  }, [portal, allProperties]);

  const availableProperties = useMemo(() => {
    if (!portal) return [];
    return allProperties.filter((p) => !portal.propertyIds.includes(p.id));
  }, [portal, allProperties]);

  const handleAddProperty = async (propertyId: string) => {
    if (!portal) return;
    const newIds = [...portal.propertyIds, propertyId];
    setSaving(true);
    try {
      const res = await fetch("/api/portals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portal.id, propertyIds: newIds }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPortal(updated);
        addToast({ type: "success", message: "Property added to portal" });
      } else {
        addToast({ type: "error", message: "Failed to add property" });
      }
    } catch {
      addToast({ type: "error", message: "Failed to add property" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProperty = async (propertyId: string) => {
    if (!portal) return;
    const newIds = portal.propertyIds.filter((pid) => pid !== propertyId);
    setSaving(true);
    try {
      const res = await fetch("/api/portals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portal.id, propertyIds: newIds }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPortal(updated);
        addToast({ type: "success", message: "Property removed from portal" });
      } else {
        addToast({ type: "error", message: "Failed to remove property" });
      }
    } catch {
      addToast({ type: "error", message: "Failed to remove property" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!portal || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portal.id, name: editName.trim(), description: editDesc.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPortal(updated);
        setEditing(false);
        addToast({ type: "success", message: "Portal updated" });
      } else {
        addToast({ type: "error", message: "Failed to update portal" });
      }
    } catch {
      addToast({ type: "error", message: "Failed to update portal" });
    } finally {
      setSaving(false);
    }
  };

  const handleImportScrape = async () => {
    if (!importUrl.trim()) return;
    setImportLoading(true);
    setImportPreview(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", message: data.error || "Scraping failed" });
        return;
      }
      setImportPreview(data);
    } catch {
      addToast({ type: "error", message: "Failed to scrape URL" });
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportSave = async () => {
    if (!importPreview || !user || !portal) return;
    setImportSaving(true);
    try {
      // 1. Create the property
      const propRes = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: importPreview.title,
          address: importPreview.address,
          price: importPreview.price,
          description: importPreview.description,
          bedroom: importPreview.bedroom,
          bathroom: importPreview.bathroom,
          squareFeet: importPreview.squareFeet,
          yearBuilt: importPreview.yearBuilt,
          lot: importPreview.lot,
          images: [],
          agentId: user.id,
          locked: true,
        }),
      });
      if (!propRes.ok) {
        addToast({ type: "error", message: "Failed to save property" });
        return;
      }
      const saved = await propRes.json();
      setAllProperties((prev) => [saved, ...prev]);

      // 2. Add to portal
      const newIds = [...portal.propertyIds, saved.id];
      const portalRes = await fetch("/api/portals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: portal.id, propertyIds: newIds }),
      });
      if (portalRes.ok) {
        const updated = await portalRes.json();
        setPortal(updated);
      }

      addToast({ type: "success", message: "Property imported and added to portal!" });
      setImportModalOpen(false);
      setImportUrl("");
      setImportPreview(null);
    } catch {
      addToast({ type: "error", message: "Failed to import property" });
    } finally {
      setImportSaving(false);
    }
  };

  if (!user || user.role !== "agent") return null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!portal) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="heading-luxury text-2xl text-white mb-4">Portal not found</h1>
            <div className="gold-line w-16 mx-auto mb-6" />
            <Link href="/agent/portals" className="luxury-button-secondary text-sm">
              Back to Portals
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-20 bg-dark-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back link */}
          <Link href="/agent/portals" className="inline-flex items-center gap-2 text-dark-400 hover:text-teal-400 text-sm mb-6 transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Portals
          </Link>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 animate-fade-up">
            <div>
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-dark-800 border border-dark-600/30 text-white rounded-lg px-4 py-2 text-2xl font-display focus:outline-none focus:border-teal-400/40"
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-dark-800 border border-dark-600/30 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-400/40 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveDetails} disabled={saving} className="luxury-button-primary text-xs px-4 py-2">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditing(false); setEditName(portal.name); setEditDesc(portal.description); }} className="text-dark-400 hover:text-white text-xs px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="label-luxury text-teal-400/50 mb-3 tracking-[0.3em]">Portal</p>
                  <div className="flex items-center gap-3">
                    <h1 className="heading-luxury text-4xl lg:text-5xl text-white">{portal.name}</h1>
                    <button onClick={() => setEditing(true)} className="text-dark-500 hover:text-teal-400 transition-colors p-1" title="Edit">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  {portal.description && <p className="text-dark-400 text-sm mt-2">{portal.description}</p>}
                  <div className="gold-line-left w-24 mt-4 animate-reveal-line" />
                </>
              )}
            </div>

            {/* Share link */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-4 py-2.5 border border-dark-600/20">
                <span className="text-dark-400 text-sm truncate max-w-xs">/portal/{portal.slug}</span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/portal/${portal.slug}`;
                    navigator.clipboard.writeText(url);
                    addToast({ type: "success", message: "Link copied!" });
                  }}
                  className="text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Actions bar */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setShowAddModal(true)}
              className="luxury-button-primary text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add Existing Property
            </button>
            <button
              onClick={() => { setImportModalOpen(true); setImportUrl(""); setImportPreview(null); }}
              className="luxury-button-secondary text-sm flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M9 1h6v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 1L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Import from Link
            </button>
            <Link href="/agent/dashboard" className="luxury-button-secondary text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Create with AI
            </Link>
          </div>

          {/* Portal properties */}
          {portalProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
              <p className="text-dark-400 text-sm mb-4">No properties in this portal yet.</p>
              <button onClick={() => setShowAddModal(true)} className="luxury-button-primary text-sm">
                Add Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portalProperties.map((property, idx) => (
                <div
                  key={property.id}
                  className="group bg-dark-800/70 border border-teal-400/[0.06] rounded-xl overflow-hidden hover:border-teal-400/20 hover:bg-dark-800 transition-all duration-500"
                  style={{ animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + idx * 0.08}s both` }}
                >
                  <div className="relative h-48 bg-dark-700 overflow-hidden">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" className="text-dark-600">
                          <path d="M4 28V12l12-8 12 8v16H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-dark-900/10 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className="font-display text-xl font-bold text-white drop-shadow-lg">
                        ${property.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-white mb-0.5 line-clamp-1">{property.title}</h3>
                    <p className="text-dark-400 text-xs mb-3 line-clamp-1">{property.address}</p>
                    <div className="flex items-center gap-3 text-xs text-dark-300 mb-4">
                      <span className="bg-dark-700/50 px-2.5 py-1.5 rounded-md">{property.bedroom} bd</span>
                      <span className="bg-dark-700/50 px-2.5 py-1.5 rounded-md">{property.bathroom} ba</span>
                      <span className="bg-dark-700/50 px-2.5 py-1.5 rounded-md">{property.squareFeet?.toLocaleString()} ft²</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/agent/properties/${property.id}`} className="luxury-button-secondary text-xs flex-1 text-center">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleRemoveProperty(property.id)}
                        disabled={saving}
                        className="px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add existing property modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-teal-400/10 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-600/20 shrink-0">
              <div>
                <h3 className="text-white text-lg font-display font-semibold">Add Property to Portal</h3>
                <p className="text-dark-400 text-xs mt-1">Select from your existing properties</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-dark-400 hover:text-white transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {availableProperties.length === 0 ? (
                <p className="text-dark-400 text-sm text-center py-8">All your properties are already in this portal.</p>
              ) : (
                <div className="space-y-2">
                  {availableProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => { handleAddProperty(prop.id); setShowAddModal(false); }}
                      disabled={saving}
                      className="w-full flex items-center gap-4 p-3 rounded-xl bg-dark-900/50 border border-dark-600/20 hover:border-teal-400/20 hover:bg-dark-800 transition-all text-left disabled:opacity-50"
                    >
                      <div className="w-16 h-12 rounded-lg bg-dark-700 overflow-hidden shrink-0">
                        {prop.images?.[0] ? (
                          <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="text-dark-600">
                              <path d="M4 28V12l12-8 12 8v16H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{prop.title}</h4>
                        <p className="text-dark-400 text-xs truncate">{prop.address}</p>
                      </div>
                      <span className="text-teal-400 text-sm font-display font-bold shrink-0">
                        ${prop.price?.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import from Link Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-teal-400/10 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-600/20">
              <div>
                <h3 className="text-white text-lg font-display font-semibold">Import from Link</h3>
                <p className="text-dark-400 text-xs mt-1">Paste a listing URL to extract property info and add it to this portal</p>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="text-dark-400 hover:text-white transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-6 pt-5 pb-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImportScrape()}
                  placeholder="https://www.zillow.com/homedetails/..."
                  className="flex-1 bg-dark-900 border border-dark-600/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/20 transition-colors placeholder:text-dark-500"
                  autoFocus
                />
                <button
                  onClick={handleImportScrape}
                  disabled={importLoading || !importUrl.trim()}
                  className="luxury-button-primary text-sm px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                >
                  {importLoading ? "Scraping..." : "Extract"}
                </button>
              </div>
            </div>
            {importPreview && (
              <div className="px-6 pb-5">
                <div className="bg-dark-900/60 border border-teal-400/[0.08] rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-white font-display font-semibold text-base leading-tight">{importPreview.title || "Untitled"}</h4>
                    {importPreview.price > 0 && (
                      <span className="text-teal-400 font-display font-bold text-lg shrink-0">${importPreview.price.toLocaleString()}</span>
                    )}
                  </div>
                  {importPreview.address && <p className="text-dark-400 text-sm">{importPreview.address}</p>}
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-dark-300">
                    {importPreview.bedroom > 0 && <span className="bg-dark-800 rounded-full px-3 py-1.5 border border-dark-600/20">{importPreview.bedroom} beds</span>}
                    {importPreview.bathroom > 0 && <span className="bg-dark-800 rounded-full px-3 py-1.5 border border-dark-600/20">{importPreview.bathroom} baths</span>}
                    {importPreview.squareFeet > 0 && <span className="bg-dark-800 rounded-full px-3 py-1.5 border border-dark-600/20">{importPreview.squareFeet.toLocaleString()} sqft</span>}
                  </div>
                </div>
                <button
                  onClick={handleImportSave}
                  disabled={importSaving}
                  className="mt-4 w-full luxury-button-primary text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importSaving ? "Saving..." : "Import & Add to Portal"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
