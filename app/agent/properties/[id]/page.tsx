"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useToastStore } from "@/lib/toast";
import { ProvenancePanel } from "@/components/client/ProvenancePanel";
import { TechnicalPanel } from "@/components/client/TechnicalPanel";
import { MarketInsightPanel } from "@/components/client/MarketInsightPanel";
import { InvestmentAdvisorPanel } from "@/components/client/InvestmentAdvisorPanel";
import { OverviewPanel } from "@/components/client/OverviewPanel";
import Simulator from "@/components/client/Simulator";
import Link from "next/link";
import { Property } from "@/types";

/* Page title */
if (typeof document !== 'undefined') document.title = 'Orthanc - Property';

const TABS = [
  { id: "overview", title: "Overview" },
  { id: "simulator", title: "Simulator" },
  { id: "provenance", title: "Provenance & Legal" },
  { id: "technical", title: "Technical & Structural" },
  { id: "market", title: "Market Insights" },
  { id: "advisor", title: "Investment Advisor" },
];

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

/* ─── Inline editable field ─── */
function EditableField({
  label,
  value,
  editing,
  type = "text",
  onChange,
  displayValue,
}: {
  label: string;
  value: string | number;
  editing: boolean;
  type?: string;
  onChange: (v: string) => void;
  displayValue?: React.ReactNode;
}) {
  if (!editing) {
    return (
      <div>
        <span className="label-luxury text-dark-400 text-[10px]">{label}</span>
        <p className="text-white text-sm mt-1">{displayValue ?? value}</p>
      </div>
    );
  }
  return (
    <div>
      <label className="label-luxury text-dark-400 text-[10px] block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="luxury-input text-sm w-full"
      />
    </div>
  );
}

export default function PropertyEditPage({ params }: PropertyPageProps) {
  const { id } = React.use(params);
  const { user } = useAuthStore();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lockToggling, setLockToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [sealed, setSealed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [imgIdx, setImgIdx] = useState(0);

  /* ─── Editing state ─── */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
    }
    (async () => {
      if (!user || user.role !== "agent") return;
      try {
        const res = await fetch('/api/properties');
        if (!res.ok) return;
        const all = await res.json();
        const found = all.find((p: any) => p.id === id);
        setProperty(found || null);
        if (found) setShareLink(`${window.location.origin}/client/vault/${found.id}`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router, id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─── Start editing ─── */
  const startEditing = () => {
    setDraft({ ...property });
    setEditing(true);
  };

  /* ─── Cancel editing ─── */
  const cancelEditing = () => {
    setDraft(null);
    setEditing(false);
  };

  /* ─── Save edits ─── */
  const saveEdits = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        const updated = await res.json();
        setProperty(updated);
        setEditing(false);
        setDraft(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Image helpers ─── */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setDraft((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
    // reset input so re-selecting same file works
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setDraft((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  /* ─── Draft setter helper ─── */
  const setField = (key: string, value: any) => {
    setDraft((prev: any) => ({ ...prev, [key]: value }));
  };

  const setNestedField = (parent: string, key: string, value: any) => {
    setDraft((prev: any) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [key]: value },
    }));
  };

  /* currently displayed data */
  const data = editing ? draft : property;

  /* ─── Lock toggle ─── */
  const handleToggleLock = async () => {
    setLockToggling(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, locked: !property.locked }),
      });
      if (res.ok) {
        setProperty((prev: any) => ({ ...prev, locked: !prev.locked }));
        addToast({ type: 'success', message: property.locked ? 'Property unlocked' : 'Property locked — it cannot be deleted' });
      } else {
        addToast({ type: 'error', message: 'Failed to update lock status' });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update lock status' });
    } finally {
      setLockToggling(false);
    }
  };

  if (!user || user.role !== "agent") {
    return null;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="gold-line w-12 mx-auto mb-4"></div>
            <p className="text-dark-400 text-sm">Loading…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Property not found</h1>
            <Link href="/agent/my-properties" className="luxury-button-primary">
              Back to Properties
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
      <main className="pt-20 pb-16 bg-dark-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          {/* Navigation & Actions */}
          <div className="flex justify-between items-center mb-8 pt-4">
            <Link href="/agent/my-properties" className="text-dark-400 hover:text-gold-400 transition text-sm flex items-center gap-2">
              <span>←</span> Back to Properties
            </Link>
            <div className="flex gap-3">
              {!editing ? (
                <>
                  <button onClick={startEditing} className="luxury-button-secondary text-sm py-2">
                    ✎ Edit Property
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/seal', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ propertyId: property.id }),
                        });
                        const d = await res.json();
                        setSealed(d.hash || null);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="luxury-button-secondary text-sm py-2"
                  >
                    Seal & Anchor
                  </button>
                  <button onClick={handleCopyLink} className="luxury-button-primary text-sm py-2">
                    {copied ? "✓ Copied!" : "Share with Client"}
                  </button>
                  <button
                    onClick={handleToggleLock}
                    disabled={lockToggling}
                    className={`text-sm py-2 px-4 rounded-lg border transition-colors flex items-center gap-1.5 ${
                      property.locked
                        ? 'border-gold-400/30 text-gold-400 bg-gold-400/10 hover:bg-gold-400/20'
                        : 'border-dark-600/30 text-dark-300 hover:text-gold-400 hover:border-gold-400/20'
                    }`}
                    title={property.locked ? 'Unlock property' : 'Lock property to prevent deletion'}
                  >
                    {property.locked ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 7V5a3 3 0 116 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    )}
                    {lockToggling ? '...' : property.locked ? 'Locked' : 'Lock'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    disabled={!!property.locked}
                    className={`text-sm py-2 px-4 rounded-lg border transition-colors ${
                      property.locked
                        ? 'border-dark-600/10 text-dark-600 cursor-not-allowed'
                        : 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                    }`}
                    title={property.locked ? 'Unlock to delete' : 'Delete property'}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button onClick={cancelEditing} className="luxury-button-secondary text-sm py-2">
                    Cancel
                  </button>
                  <button onClick={saveEdits} disabled={saving} className="luxury-button-primary text-sm py-2">
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Editing banner */}
          {editing && (
            <div className="mb-6 bg-gold-400/5 border border-gold-400/20 rounded-lg p-4 flex items-center gap-3">
              <span className="text-gold-400 text-lg">✎</span>
              <p className="text-gold-400 text-sm">You are editing this property. Click any field to modify it.</p>
            </div>
          )}

          {/* Sealed Hash Banner */}
          {sealed && !editing && (
            <div className="mb-6 bg-dark-800 border border-gold-400/15 rounded-lg p-4">
              <p className="label-luxury text-gold-400/60 mb-1">Sealed On-Chain</p>
              <p className="text-xs text-dark-300 font-mono break-all">{sealed}</p>
            </div>
          )}

          {/* Property Hero — split layout */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Property Info */}
              <div className="flex flex-col justify-end space-y-4">
                <div>
                  <p className="label-luxury text-gold-400 mb-3">Single-Family</p>
                  {editing ? (
                    <input
                      value={draft.title}
                      onChange={(e) => setField("title", e.target.value)}
                      className="bg-transparent border-b border-gold-400/30 text-white font-display text-5xl lg:text-6xl tracking-tight w-full focus:outline-none focus:border-gold-400 transition-colors pb-1"
                    />
                  ) : (
                    <h1 className="font-display text-5xl lg:text-6xl text-white mb-3 tracking-tight">{data.title}</h1>
                  )}
                </div>

                {editing ? (
                  <input
                    value={draft.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="luxury-input text-lg"
                    placeholder="Address"
                  />
                ) : (
                  <p className="text-dark-300 text-lg">{data.address}</p>
                )}

                {/* Editable details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  <EditableField
                    label="Price ($)"
                    value={editing ? draft.price : data.price}
                    editing={editing}
                    type="number"
                    onChange={(v) => setField("price", Number(v))}
                    displayValue={
                      <span className="font-display text-3xl font-bold text-gold-400">
                        ${(data.price / 1000000).toFixed(2)}M
                      </span>
                    }
                  />
                  <EditableField
                    label="Bedrooms"
                    value={editing ? draft.bedroom : data.bedroom}
                    editing={editing}
                    type="number"
                    onChange={(v) => setField("bedroom", Number(v))}
                  />
                  <EditableField
                    label="Bathrooms"
                    value={editing ? draft.bathroom : data.bathroom}
                    editing={editing}
                    type="number"
                    onChange={(v) => setField("bathroom", Number(v))}
                  />
                  <EditableField
                    label="Square Feet"
                    value={editing ? draft.squareFeet : data.squareFeet}
                    editing={editing}
                    type="number"
                    onChange={(v) => setField("squareFeet", Number(v))}
                    displayValue={`${data.squareFeet?.toLocaleString()} sqft`}
                  />
                  <EditableField
                    label="Year Built"
                    value={editing ? draft.yearBuilt : data.yearBuilt}
                    editing={editing}
                    type="number"
                    onChange={(v) => setField("yearBuilt", Number(v))}
                  />
                  <EditableField
                    label="Lot (acres)"
                    value={editing ? draft.lot : data.lot}
                    editing={editing}
                    type="number"
                    onChange={(v) => setField("lot", Number(v))}
                  />
                </div>

                {/* Description */}
                {editing && (
                  <div>
                    <label className="label-luxury text-dark-400 text-[10px] block mb-1">Description</label>
                    <textarea
                      value={draft.description || ""}
                      onChange={(e) => setField("description", e.target.value)}
                      rows={3}
                      className="luxury-input text-sm w-full resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Right: Single Image with Arrows / Upload */}
              <div>
                {editing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {(draft.images || []).map((img: string, i: number) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden h-44">
                          <img src={img} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => imgInputRef.current?.click()}
                        className="h-44 border-2 border-dashed border-dark-600 hover:border-gold-400/40 rounded-lg flex flex-col items-center justify-center text-dark-500 hover:text-gold-400 transition-colors"
                      >
                        <span className="text-3xl mb-1">+</span>
                        <span className="text-xs">Add Image</span>
                      </button>
                    </div>
                    <input
                      ref={imgInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <p className="text-dark-500 text-xs">Click + to add images, hover to remove.</p>
                  </div>
                ) : (
                  <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden group">
                    {(data.images || []).length > 0 ? (
                      <>
                        <img
                          src={data.images[imgIdx % data.images.length]}
                          alt={`${data.title} ${imgIdx + 1}`}
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        {data.images.length > 1 && (
                          <>
                            <button
                              onClick={() => setImgIdx((i) => (i - 1 + data.images.length) % data.images.length)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/70 hover:bg-dark-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ‹
                            </button>
                            <button
                              onClick={() => setImgIdx((i) => (i + 1) % data.images.length)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-900/70 hover:bg-dark-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ›
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {data.images.map((_: string, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => setImgIdx(i)}
                                  className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx % data.images.length ? "bg-gold-400" : "bg-white/40 hover:bg-white/70"}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-dark-800 flex items-center justify-center">
                        <p className="text-dark-500 text-sm">No image available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editable investment & market fields (shown when editing) */}
          {editing && (
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-6 space-y-4">
                <h3 className="label-luxury text-dark-300 mb-2">Investment Analysis</h3>
                <EditableField
                  label="Current Value ($)"
                  value={draft.investmentAnalysis?.currentValue || 0}
                  editing={true}
                  type="number"
                  onChange={(v) => setNestedField("investmentAnalysis", "currentValue", Number(v))}
                />
                <EditableField
                  label="5-Year Projection ($)"
                  value={draft.investmentAnalysis?.projectedValue5Year || 0}
                  editing={true}
                  type="number"
                  onChange={(v) => setNestedField("investmentAnalysis", "projectedValue5Year", Number(v))}
                />
                <EditableField
                  label="Cap Rate (%)"
                  value={draft.investmentAnalysis?.capRate || 0}
                  editing={true}
                  type="number"
                  onChange={(v) => setNestedField("investmentAnalysis", "capRate", Number(v))}
                />
                <EditableField
                  label="ROI Projection (%)"
                  value={draft.investmentAnalysis?.roiProjection || 0}
                  editing={true}
                  type="number"
                  onChange={(v) => setNestedField("investmentAnalysis", "roiProjection", Number(v))}
                />
              </div>
              <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-6 space-y-4">
                <h3 className="label-luxury text-dark-300 mb-2">Market Data</h3>
                <EditableField
                  label="Neighborhood Vibe"
                  value={draft.marketData?.neighborhoodVibe || ""}
                  editing={true}
                  onChange={(v) => setNestedField("marketData", "neighborhoodVibe", v)}
                />
                <EditableField
                  label="Zoning Info"
                  value={draft.marketData?.zoningInfo || ""}
                  editing={true}
                  onChange={(v) => setNestedField("marketData", "zoningInfo", v)}
                />
                <EditableField
                  label="Economic Outlook"
                  value={draft.marketData?.economicOutlook || ""}
                  editing={true}
                  onChange={(v) => setNestedField("marketData", "economicOutlook", v)}
                />
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-0 border-b border-dark-600/30 mb-10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-6 py-4 text-sm tracking-wide transition-colors focus:outline-none group"
              >
                <span
                  className={`transition-colors duration-300 ${
                    activeTab === tab.id
                      ? "text-gold-400"
                      : "text-dark-500 group-hover:text-dark-300"
                  }`}
                >
                  {tab.title}
                </span>
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gold-400 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                    activeTab === tab.id
                      ? "w-full opacity-100"
                      : "w-0 opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Panel Content + Map Sidebar (map only on overview) */}
          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              {activeTab === "overview" && <OverviewPanel property={data} />}
              {activeTab === "simulator" && <Simulator address={data.address} price={data.price} />}
              {activeTab === "provenance" && <ProvenancePanel property={data} />}
              {activeTab === "technical" && <TechnicalPanel property={data} />}
              {activeTab === "market" && <MarketInsightPanel property={data} />}
              {activeTab === "advisor" && <InvestmentAdvisorPanel property={data} />}
            </div>
            {activeTab === "overview" && (
              <div className="hidden lg:block w-96 flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-5">
                    <h3 className="label-luxury text-dark-300 mb-2">Location</h3>
                    <p className="text-dark-400 text-xs mb-4">{data.address}</p>
                    <div className="rounded-lg overflow-hidden border border-gold-400/10" style={{ height: 480 }}>
                      <iframe
                        title="Property Location"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(1.1) contrast(1.1)" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address || '')}&hl=en&z=15&ie=UTF8&iwloc=B&output=embed`}
                      />
                    </div>
                  </div>
                  <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-5 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dark-500 text-xs uppercase tracking-wider">Price</span>
                      <span className="font-display text-gold-400 font-bold">${(data.price / 1000000).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 text-xs uppercase tracking-wider">Cap Rate</span>
                      <span className="text-white text-sm">{data.investmentAnalysis?.capRate ? `${data.investmentAnalysis.capRate}%` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 text-xs uppercase tracking-wider">Year Built</span>
                      <span className="text-white text-sm">{data.yearBuilt}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-gold-400/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-display text-lg text-white mb-2">Delete Property</h3>
            <p className="text-dark-400 text-sm mb-6">
              Are you sure you want to permanently delete &ldquo;{property?.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors rounded-lg border border-dark-600/30 hover:border-dark-500/50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, { method: "DELETE" });
                    if (res.ok) {
                      addToast({ type: "success", message: "Property deleted" });
                      router.push("/agent/my-properties");
                    } else {
                      addToast({ type: "error", message: "Failed to delete property" });
                    }
                  } catch {
                    addToast({ type: "error", message: "Failed to delete property" });
                  } finally {
                    setDeleting(false);
                    setConfirmDelete(false);
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors rounded-lg border border-red-500/20 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}