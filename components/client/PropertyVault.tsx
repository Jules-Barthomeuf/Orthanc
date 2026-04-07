"use client";

import { useState, useRef, lazy, Suspense } from "react";
import { Property } from "@/types";

const ProvenancePanel = lazy(() => import("./ProvenancePanel").then(m => ({ default: m.ProvenancePanel })));
const TechnicalPanel = lazy(() => import("./TechnicalPanel").then(m => ({ default: m.TechnicalPanel })));
const MarketInsightPanel = lazy(() => import("./MarketInsightPanel").then(m => ({ default: m.MarketInsightPanel })));
const InvestmentAdvisorPanel = lazy(() => import("./InvestmentAdvisorPanel").then(m => ({ default: m.InvestmentAdvisorPanel })));
const OverviewPanel = lazy(() => import("./OverviewPanel").then(m => ({ default: m.OverviewPanel })));
const LeaseAnalysisPanel = lazy(() => import("./LeaseAnalysisPanel").then(m => ({ default: m.LeaseAnalysisPanel })));
const Simulator = lazy(() => import("./Simulator"));

const TABS = [
  { id: "overview", title: "Overview" },
  { id: "market", title: "Market" },
  { id: "technical", title: "Property" },
  { id: "lease", title: "Lease Analysis" },
  { id: "provenance", title: "Provenance" },
  { id: "advisor", title: "Investment Advisor" },
];

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

interface PropertyVaultProps {
  property: Property;
  portalSlug?: string;
  /* ── Admin / editable mode ── */
  editable?: boolean;
  editing?: boolean;
  draft?: any;
  onStartEditing?: () => void;
  onCancelEditing?: () => void;
  onSaveEdits?: () => void;
  saving?: boolean;
  onFieldChange?: (key: string, value: any) => void;
  onNestedFieldChange?: (parent: string, key: string, value: any) => void;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
  /* Admin actions */
  onShare?: () => void;
  shareLabel?: string;
  onSeal?: () => void;
  sealedHash?: string | null;
  onToggleLock?: () => void;
  lockToggling?: boolean;
  onDelete?: () => void;
}

export function PropertyVault({
  property,
  portalSlug,
  editable = false,
  editing = false,
  draft,
  onStartEditing,
  onCancelEditing,
  onSaveEdits,
  saving = false,
  onFieldChange,
  onNestedFieldChange,
  onImageUpload,
  onRemoveImage,
  onShare,
  shareLabel,
  onSeal,
  sealedHash,
  onToggleLock,
  lockToggling = false,
  onDelete,
}: PropertyVaultProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSimulator, setShowSimulator] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const data = editing && draft ? draft : property;
  const images = data.images || [];

  return (
    <div className="pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Admin Toolbar ── */}
        {editable && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div />
            <div className="flex flex-wrap gap-3">
              {!editing ? (
                <>
                  {onStartEditing && (
                    <button onClick={onStartEditing} className="luxury-button-secondary text-sm py-2">✎ Edit Property</button>
                  )}
                  {onSeal && (
                    <button onClick={onSeal} className="luxury-button-secondary text-sm py-2">Seal &amp; Anchor</button>
                  )}
                  {onShare && (
                    <button onClick={onShare} className="luxury-button-primary text-sm py-2">{shareLabel || "Share with Client"}</button>
                  )}
                  {onToggleLock && (
                    <button
                      onClick={onToggleLock}
                      disabled={lockToggling}
                      className={`text-sm py-2 px-4 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        property.locked
                          ? "border-gold-400/30 text-gold-400 bg-gold-400/10 hover:bg-gold-400/20"
                          : "border-dark-600/30 text-dark-300 hover:text-gold-400 hover:border-gold-400/20"
                      }`}
                    >
                      {lockToggling ? "..." : property.locked ? "Locked" : "Lock"}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      disabled={!!property.locked}
                      className={`text-sm py-2 px-4 rounded-lg border transition-colors ${
                        property.locked
                          ? "border-dark-600/10 text-dark-600 cursor-not-allowed"
                          : "border-red-500/20 text-red-400 hover:bg-red-500/10"
                      }`}
                    >
                      Delete
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onCancelEditing && (
                    <button onClick={onCancelEditing} className="luxury-button-secondary text-sm py-2">Cancel</button>
                  )}
                  {onSaveEdits && (
                    <button onClick={onSaveEdits} disabled={saving} className="luxury-button-primary text-sm py-2">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Editing banner */}
        {editable && editing && (
          <div className="mb-6 bg-gold-400/5 border border-gold-400/20 rounded-lg p-4 flex items-center gap-3">
            <span className="text-gold-400 text-lg">✎</span>
            <p className="text-gold-400 text-sm">You are editing this property. Click any field to modify it.</p>
          </div>
        )}

        {/* Sealed hash banner */}
        {editable && sealedHash && !editing && (
          <div className="mb-6 bg-dark-800 border border-gold-400/15 rounded-lg p-4">
            <p className="label-luxury text-gold-400/60 mb-1">Sealed On-Chain</p>
            <p className="text-xs text-dark-300 font-mono break-all">{sealedHash}</p>
          </div>
        )}

        {/* ── Hero: Map + Images ── */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-dark-600/20" style={{ height: 420 }}>
            <iframe
              title="Property Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="eager"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address || "")}&hl=en&z=16&ie=UTF8&iwloc=B&output=embed`}
            />
          </div>
          {/* Image column */}
          {editing ? (
            <div className="hidden lg:flex flex-col gap-2">
              {(draft?.images || []).slice(0, 2).map((img: string, i: number) => (
                <div key={i} className="relative group rounded-lg overflow-hidden flex-1 min-h-0">
                  <img src={img} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                  {onRemoveImage && (
                    <button
                      onClick={() => onRemoveImage(i)}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => imgInputRef.current?.click()}
                className="flex-1 min-h-[100px] border-2 border-dashed border-dark-600 hover:border-gold-400/40 rounded-lg flex flex-col items-center justify-center text-dark-500 hover:text-gold-400 transition-colors"
              >
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs">Add Image</span>
              </button>
              <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onImageUpload} />
            </div>
          ) : images.length > 0 ? (
            <div className="hidden lg:flex flex-col gap-2">
              {images.slice(0, 3).map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setLightboxImg(img)}
                  className="rounded-lg overflow-hidden border-2 border-transparent hover:border-gold-400/30 transition-colors flex-1 min-h-0 cursor-pointer relative group"
                >
                  <img src={img} alt={`${data.title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Property Info Row ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-4">
          <div>
            {editing && onFieldChange ? (
              <>
                <input
                  value={draft?.title || ""}
                  onChange={(e) => onFieldChange("title", e.target.value)}
                  className="bg-transparent border-b border-gold-400/30 text-white font-display text-3xl lg:text-4xl tracking-tight w-full focus:outline-none focus:border-gold-400 transition-colors pb-1 mb-2"
                />
                <input
                  value={draft?.address || ""}
                  onChange={(e) => onFieldChange("address", e.target.value)}
                  className="luxury-input text-sm w-full max-w-lg"
                  placeholder="Address"
                />
              </>
            ) : (
              <>
                <h1 className="font-display text-3xl lg:text-4xl text-white mb-1 tracking-tight">{data.title}</h1>
                <p className="text-dark-400 text-sm">
                  {data.squareFeet ? `${data.squareFeet.toLocaleString("en-US")} sqft` : ""}
                  {data.squareFeet && data.bedroom ? " · " : ""}
                  {data.bedroom ? `${data.bedroom}bd` : ""}
                  {data.bathroom ? ` · ${data.bathroom}ba` : ""}
                </p>
              </>
            )}
          </div>
          <div className="text-right">
            {editing && onFieldChange ? (
              <div>
                <label className="label-luxury text-dark-400 text-[10px] block mb-1">Price ($)</label>
                <input
                  type="number"
                  value={draft?.price || 0}
                  onChange={(e) => onFieldChange("price", Number(e.target.value))}
                  className="luxury-input text-sm w-40 text-right"
                />
              </div>
            ) : (
              <>
                <p className="text-dark-500 text-xs uppercase tracking-wider mb-1">Asking Price</p>
                <p className="text-3xl lg:text-4xl text-white font-bold">
                  {data.price >= 1000000
                    ? `$${(data.price / 1000000).toFixed(2)}M`
                    : `$${data.price?.toLocaleString("en-US")}`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Editable details (when editing) ── */}
        {editing && onFieldChange && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            <EditableField label="Bedrooms" value={draft?.bedroom ?? 0} editing type="number" onChange={(v) => onFieldChange("bedroom", Number(v))} />
            <EditableField label="Bathrooms" value={draft?.bathroom ?? 0} editing type="number" onChange={(v) => onFieldChange("bathroom", Number(v))} />
            <EditableField label="Square Feet" value={draft?.squareFeet ?? 0} editing type="number" onChange={(v) => onFieldChange("squareFeet", Number(v))} />
            <EditableField label="Year Built" value={draft?.yearBuilt ?? 0} editing type="number" onChange={(v) => onFieldChange("yearBuilt", Number(v))} />
            <EditableField label="Lot (acres)" value={draft?.lot ?? 0} editing type="number" onChange={(v) => onFieldChange("lot", Number(v))} />
            <div>
              <label className="label-luxury text-dark-400 text-[10px] block mb-1">Description</label>
              <textarea
                value={draft?.description || ""}
                onChange={(e) => onFieldChange("description", e.target.value)}
                rows={2}
                className="luxury-input text-sm w-full resize-none"
              />
            </div>
          </div>
        )}

        {/* ── Editable investment & market fields ── */}
        {editing && onNestedFieldChange && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-6 space-y-4">
              <h3 className="label-luxury text-dark-300 mb-2">Investment Analysis</h3>
              <EditableField label="Current Value ($)" value={draft?.investmentAnalysis?.currentValue || 0} editing type="number" onChange={(v) => onNestedFieldChange("investmentAnalysis", "currentValue", Number(v))} />
              <EditableField label="5-Year Projection ($)" value={draft?.investmentAnalysis?.projectedValue5Year || 0} editing type="number" onChange={(v) => onNestedFieldChange("investmentAnalysis", "projectedValue5Year", Number(v))} />
              <EditableField label="Cap Rate (%)" value={draft?.investmentAnalysis?.capRate || 0} editing type="number" onChange={(v) => onNestedFieldChange("investmentAnalysis", "capRate", Number(v))} />
              <EditableField label="ROI Projection (%)" value={draft?.investmentAnalysis?.roiProjection || 0} editing type="number" onChange={(v) => onNestedFieldChange("investmentAnalysis", "roiProjection", Number(v))} />
            </div>
            <div className="bg-dark-800 border border-gold-400/10 rounded-lg p-6 space-y-4">
              <h3 className="label-luxury text-dark-300 mb-2">Market Data</h3>
              <EditableField label="Neighborhood Vibe" value={draft?.marketData?.neighborhoodVibe || ""} editing onChange={(v) => onNestedFieldChange("marketData", "neighborhoodVibe", v)} />
              <EditableField label="Zoning Info" value={draft?.marketData?.zoningInfo || ""} editing onChange={(v) => onNestedFieldChange("marketData", "zoningInfo", v)} />
              <EditableField label="Economic Outlook" value={draft?.marketData?.economicOutlook || ""} editing onChange={(v) => onNestedFieldChange("marketData", "economicOutlook", v)} />
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setShowSimulator(true)}
            className="luxury-button-primary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Full Simulator
          </button>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-0 border-b border-dark-600/30 mb-10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-5 py-4 text-sm tracking-wide transition-colors focus:outline-none group whitespace-nowrap"
            >
              <span
                className={`transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-white font-medium"
                    : "text-dark-500 group-hover:text-dark-300"
                }`}
              >
                {tab.title}
              </span>
              <span
                className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gold-400 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                  activeTab === tab.id ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel Content ── */}
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-dark-500 text-sm">Loading...</div>}>
          {activeTab === "overview" && <OverviewPanel property={data} />}
          {activeTab === "lease" && <LeaseAnalysisPanel property={data} />}
          {activeTab === "provenance" && <ProvenancePanel property={data} />}
          {activeTab === "technical" && <TechnicalPanel property={data} />}
          {activeTab === "market" && <MarketInsightPanel property={data} />}
          {activeTab === "advisor" && <InvestmentAdvisorPanel property={data} />}
        </Suspense>
      </div>

      {/* ── Simulator Modal ── */}
      {showSimulator && (
        <Suspense fallback={null}>
        <div className="fixed inset-0 z-[100] flex items-start justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowSimulator(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-[1400px] max-h-[92vh] mt-[4vh] mx-4 bg-dark-900 border border-dark-600/30 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Financial Simulator</h2>
                <span className="text-dark-500 text-sm">— {data.title}</span>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="w-8 h-8 rounded-full border border-dark-600/30 flex items-center justify-center text-dark-400 hover:text-white hover:border-dark-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Simulator content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Simulator address={data.address} price={data.price} />
            </div>
          </div>
        </div>
        </Suspense>
      )}

      {/* ── Image Lightbox ── */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center" onClick={() => setLightboxImg(null)}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="relative max-w-5xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt={data.title} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-dark-800 border border-dark-600/50 flex items-center justify-center text-white hover:bg-dark-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setLightboxImg(img)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                      lightboxImg === img ? "border-gold-400" : "border-transparent hover:border-gold-400/40"
                    }`}
                  >
                    <img src={img} alt={`${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
