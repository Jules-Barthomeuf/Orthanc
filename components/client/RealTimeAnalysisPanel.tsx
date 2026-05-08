"use client";

import { Property, RealTimeAnalysis, RealTimeAnalysisCard } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, MinusCircle, EyeOff, RotateCw, Undo2 } from "lucide-react";

interface RealTimeAnalysisPanelProps {
  property: Property;
  editable?: boolean;
}

function formatDate(value?: Date | string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function impactColor(direction: RealTimeAnalysisCard["impactDirection"]) {
  if (direction === "negative") return "text-red-400 border-red-400/30 bg-red-500/5";
  if (direction === "positive") return "text-emerald-400 border-emerald-400/30 bg-emerald-500/5";
  return "text-yellow-300 border-yellow-300/30 bg-yellow-500/5";
}

function impactIcon(direction: RealTimeAnalysisCard["impactDirection"]) {
  if (direction === "negative") return <AlertTriangle size={14} />;
  if (direction === "positive") return <CheckCircle2 size={14} />;
  return <MinusCircle size={14} />;
}

export function RealTimeAnalysisPanel({ property, editable = false }: RealTimeAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<RealTimeAnalysis | null>(property.marketData?.realTimeAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("-");

  const loadAnalysis = useCallback(async (force = false) => {
    if (!property.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/market/news?propertyId=${encodeURIComponent(property.id)}${force ? "&force=1" : ""}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Unable to load real-time analysis");
        return;
      }
      setAnalysis(json);
      setSource(json?.source || "-");
    } catch {
      setError("Unable to load real-time analysis");
    } finally {
      setLoading(false);
    }
  }, [property.id]);

  useEffect(() => {
    void loadAnalysis(false);
  }, [loadAnalysis]);

  const onRefresh = async () => {
    if (!editable || !property.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/market/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Refresh failed");
        return;
      }
      setAnalysis(json);
      setSource(json?.source || source);
    } catch {
      setError("Refresh failed");
    } finally {
      setLoading(false);
    }
  };

  const updateVisibility = async (cardId: string, action: "hide" | "restore") => {
    if (!editable || !property.id) return;

    const previous = analysis;
    if (!previous) return;

    const now = new Date();
    const optimisticCards = previous.cards.map((c) => {
      if (c.id !== cardId) return c;
      if (action === "restore") {
        return { ...c, visible: true, hiddenAt: undefined, hiddenReason: undefined };
      }
      return { ...c, visible: false, hiddenAt: now, hiddenReason: "manual" };
    });

    setAnalysis({ ...previous, cards: optimisticCards });

    try {
      const res = await fetch("/api/market/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, cardId, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAnalysis(previous);
        setError(json?.error || "Failed to update visibility");
        return;
      }
      setAnalysis(json);
    } catch {
      setAnalysis(previous);
      setError("Failed to update visibility");
    }
  };

  const visibleCards = useMemo(() => (analysis?.cards || []).filter((c) => c.visible), [analysis]);
  const hiddenCards = useMemo(() => (analysis?.cards || []).filter((c) => !c.visible), [analysis]);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="heading-luxury text-3xl text-white mb-2">Real Time Analysis</h2>
          <div className="gold-line-left w-20 mb-4"></div>
          <p className="text-white/75 text-sm max-w-3xl">
            News-driven signals that may influence purchase timing, financing risk, or resale outlook for this property.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-dark-400">Source: <span className="text-white/80">{source}</span></div>
          <div className="text-xs text-dark-400">Last updated: <span className="text-white/80">{formatDate(analysis?.lastUpdated)}</span></div>
          <div className="text-xs text-dark-400">Next refresh: <span className="text-white/80">{formatDate(analysis?.nextRefreshAt)}</span></div>
          {editable && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-2 rounded border border-gold-400/30 text-gold-400 hover:bg-gold-400/10 disabled:opacity-60"
            >
              <RotateCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh Now
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading && !analysis && (
        <div className="text-dark-400 text-sm">Loading analysis...</div>
      )}

      {!loading && visibleCards.length === 0 && (
        <div className="rounded-lg border border-dark-700 bg-dark-900/30 text-dark-400 text-sm px-4 py-6 text-center">
          No visible real-time signals for this property.
        </div>
      )}

      <div className="space-y-4">
        {visibleCards.map((card) => (
          <div key={card.id} className="rounded-xl border border-gold-400/15 bg-dark-900/40 p-5">
            <div className="flex flex-wrap justify-between gap-3 mb-3">
              <div>
                <h3 className="text-white text-base font-semibold">{card.title}</h3>
                <div className="text-xs text-dark-400 mt-1">
                  {card.source} · {formatDate(card.publishedAt)}
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold uppercase tracking-wider ${impactColor(card.impactDirection)}`}>
                {impactIcon(card.impactDirection)}
                {card.impactDirection} ({card.impactScore})
              </div>
            </div>

            <p className="text-white/75 text-sm leading-relaxed mb-2">{card.summary}</p>
            <p className="text-gold-300/85 text-sm leading-relaxed mb-3">Impact on purchase: {card.purchaseImpact}</p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-dark-500">Category: {card.category}</span>
              <div className="flex items-center gap-3">
                {card.sourceUrl && (
                  <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-dark-300 hover:text-gold-400 underline underline-offset-2">
                    View source
                  </a>
                )}
                {editable && (
                  <button
                    onClick={() => updateVisibility(card.id, "hide")}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-red-400/40 text-red-300 hover:bg-red-500/10"
                  >
                    <EyeOff size={12} /> Hide
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editable && hiddenCards.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm uppercase tracking-wider text-dark-400 mb-3">Hidden Cards ({hiddenCards.length})</h4>
          <div className="space-y-3">
            {hiddenCards.map((card) => (
              <div key={card.id} className="rounded-lg border border-dark-700 bg-dark-900/20 p-4 opacity-80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-white/80 text-sm font-medium">{card.title}</div>
                    <div className="text-xs text-dark-500">Hidden {formatDate(card.hiddenAt)} · {card.hiddenReason || "manual"}</div>
                  </div>
                  <button
                    onClick={() => updateVisibility(card.id, "restore")}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Undo2 size={12} /> Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
