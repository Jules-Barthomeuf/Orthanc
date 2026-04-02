"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToastStore } from "@/lib/toast";

if (typeof document !== "undefined") document.title = "Orthanc - My Portals";

interface Portal {
  id: string;
  name: string;
  slug: string;
  agentId: string;
  description: string;
  propertyIds: string[];
  createdAt: string;
}

export default function MyPortalsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/portals?agentId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          setPortals(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, router]);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    setCreating(true);
    try {
      const res = await fetch("/api/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), agentId: user.id }),
      });
      if (res.ok) {
        const portal = await res.json();
        setPortals((prev) => [portal, ...prev]);
        addToast({ type: "success", message: "Portal created!" });
        setShowCreate(false);
        setNewName("");
        setNewDesc("");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", message: data.error || "Failed to create portal" });
      }
    } catch {
      addToast({ type: "error", message: "Failed to create portal" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/portals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setPortals((prev) => prev.filter((p) => p.id !== id));
        addToast({ type: "success", message: "Portal deleted" });
      } else {
        addToast({ type: "error", message: "Failed to delete portal" });
      }
    } catch {
      addToast({ type: "error", message: "Failed to delete portal" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (!user || user.role !== "agent") return null;

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-20 bg-dark-900 min-h-screen">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full animate-soft-glow"
              style={{ background: "radial-gradient(ellipse at center, rgba(201,169,110,0.06) 0%, transparent 70%)" }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-4 pb-10 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10 animate-fade-up">
              <div>
                <p className="label-luxury text-gold-400/50 mb-3 tracking-[0.3em]">Agent Portal</p>
                <h1 className="heading-luxury text-5xl lg:text-6xl text-white mb-4">My Portals</h1>
                <div className="gold-line-left w-32 animate-reveal-line" />
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="luxury-button-primary text-sm flex items-center gap-2 self-start lg:self-auto"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                New Portal
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-dark-800/60 border border-dark-600/10 rounded-xl overflow-hidden animate-pulse">
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-dark-700/50 rounded w-3/4" />
                    <div className="h-4 bg-dark-700/50 rounded w-1/2" />
                    <div className="h-10 bg-dark-700/50 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && portals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 animate-fade-up">
              <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-gold-400/10 flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gold-400/40">
                  <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 12h24" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="9" r="1" fill="currentColor" />
                  <circle cx="12" cy="9" r="1" fill="currentColor" />
                  <circle cx="16" cy="9" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-white mb-2">No portals yet</h3>
              <p className="text-dark-400 text-sm mb-8 max-w-sm text-center leading-relaxed">
                Create a portal to group your properties and share a single link with clients.
              </p>
              <button onClick={() => setShowCreate(true)} className="luxury-button-primary text-sm">
                Create Your First Portal
              </button>
            </div>
          )}

          {/* Portals grid */}
          {!loading && portals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portals.map((portal, idx) => (
                <div
                  key={portal.id}
                  className="group bg-dark-800/70 border border-gold-400/[0.06] rounded-xl overflow-hidden hover:border-gold-400/20 hover:bg-dark-800 transition-all duration-500"
                  style={{ animation: `fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${0.05 + idx * 0.08}s both` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-gold-300 transition-colors line-clamp-1">
                          {portal.name}
                        </h3>
                        {portal.description && (
                          <p className="text-dark-400 text-xs line-clamp-2">{portal.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setConfirmDeleteId(portal.id)}
                        className="shrink-0 p-1.5 rounded-md text-dark-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete portal"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4h10zM7 7v4M9 7v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-dark-400 mb-4">
                      <span className="flex items-center gap-1.5 bg-dark-700/50 px-2.5 py-1.5 rounded-md">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gold-400/60">
                          <path d="M4 28V12l12-8 12 8v16H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        {portal.propertyIds.length} propert{portal.propertyIds.length === 1 ? "y" : "ies"}
                      </span>
                      <span className="text-dark-500">
                        {new Date(portal.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Share link */}
                    <div className="flex items-center gap-2 mb-4 bg-dark-900/50 rounded-lg px-3 py-2 border border-dark-600/20">
                      <span className="text-dark-400 text-xs truncate flex-1">
                        /portal/{portal.slug}
                      </span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/portal/${portal.slug}`;
                          navigator.clipboard.writeText(url);
                          addToast({ type: "success", message: "Portal link copied!" });
                        }}
                        className="shrink-0 text-gold-400 hover:text-gold-300 transition-colors text-xs"
                      >
                        Copy
                      </button>
                    </div>

                    <Link
                      href={`/agent/portals/${portal.id}`}
                      className="luxury-button-secondary text-sm w-full block text-center"
                    >
                      Manage Portal
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-gold-400/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-600/20">
              <h3 className="text-white text-lg font-display font-semibold">Create Portal</h3>
              <button onClick={() => setShowCreate(false)} className="text-dark-400 hover:text-white transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-dark-300 text-xs font-medium block mb-1.5">Portal Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Miami Luxury Collection"
                  className="w-full bg-dark-900 border border-dark-600/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-colors placeholder:text-dark-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-dark-300 text-xs font-medium block mb-1.5">Description (optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="A curated selection of premium properties..."
                  rows={3}
                  className="w-full bg-dark-900 border border-dark-600/30 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400/40 focus:ring-1 focus:ring-gold-400/20 transition-colors placeholder:text-dark-500 resize-none"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="w-full luxury-button-primary text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Portal"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 border border-gold-400/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-display text-lg text-white mb-2">Delete Portal</h3>
            <p className="text-dark-400 text-sm mb-6">
              Are you sure? This will delete the portal but not the properties inside it.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-dark-300 hover:text-white transition-colors rounded-lg border border-dark-600/30 hover:border-dark-500/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors rounded-lg border border-red-500/20 disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
