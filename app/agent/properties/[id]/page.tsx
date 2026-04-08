"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { PropertyVault } from "@/components/client/PropertyVault";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useToastStore } from "@/lib/toast";
import Link from "next/link";
import { Property } from "@/types";

const getPropertyDetailCacheKey = (propertyId: string) => `agentPropertyDetail:${propertyId}`;

/* Page title */
if (typeof document !== 'undefined') document.title = 'Orthanc - Property';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyEditPage({ params }: PropertyPageProps) {
  const { id } = React.use(params);
  const { user } = useAuthStore();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lockToggling, setLockToggling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [sealed, setSealed] = useState<string | null>(null);

  /* ─── Editing state ─── */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
      return;
    }

    let cancelled = false;
    const cacheKey = getPropertyDetailCacheKey(id);

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && !cancelled) {
          setProperty(parsed);
          setShareLink(`${window.location.origin}/client/vault/${id}`);
          setLoading(false);
        }
      }
    } catch {
      // ignore cache read failures
    }

    (async () => {
      try {
        const res = await fetch(`/api/properties?ids=${encodeURIComponent(id)}`);
        if (!res.ok || cancelled) return;
        const results = await res.json();
        const found = results[0] || null;
        setProperty(found);
        if (found) {
          sessionStorage.setItem(cacheKey, JSON.stringify(found));
          setShareLink(`${window.location.origin}/client/vault/${found.id}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, router, id]);

  /* ─── Editing handlers ─── */
  const startEditing = () => { setDraft({ ...property }); setEditing(true); };
  const cancelEditing = () => { setDraft(null); setEditing(false); };

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

  const handleFieldChange = (key: string, value: any) => {
    setDraft((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleNestedFieldChange = (parent: string, key: string, value: any) => {
    setDraft((prev: any) => ({
      ...prev,
      [parent]: { ...(prev[parent] || {}), [key]: value },
    }));
  };

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
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setDraft((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeal = async () => {
    try {
      const res = await fetch('/api/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property?.id }),
      });
      const d = await res.json();
      setSealed(d.hash || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLock = async () => {
    setLockToggling(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, locked: !property?.locked }),
      });
      if (res.ok) {
        setProperty((prev: any) => ({ ...prev, locked: !prev.locked }));
        addToast({ type: 'success', message: property?.locked ? 'Property unlocked' : 'Property locked' });
      } else {
        addToast({ type: 'error', message: 'Failed to update lock status' });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update lock status' });
    } finally {
      setLockToggling(false);
    }
  };

  if (!user || user.role !== "agent") return null;

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
            <Link href="/agent/properties" className="luxury-button-primary">
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
        <div className="max-w-7xl mx-auto px-6 pt-4 mb-4">
          <Link href="/agent/properties" className="text-dark-400 hover:text-gold-400 transition text-sm flex items-center gap-2">
            <span>←</span> Back to Properties
          </Link>
        </div>
        <PropertyVault
          property={property}
          editable
          editing={editing}
          draft={draft}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSaveEdits={saveEdits}
          saving={saving}
          onFieldChange={handleFieldChange}
          onNestedFieldChange={handleNestedFieldChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onShare={handleCopyLink}
          shareLabel={copied ? "✓ Copied!" : "Share with Client"}
          onSeal={handleSeal}
          sealedHash={sealed}
          onToggleLock={handleToggleLock}
          lockToggling={lockToggling}
          onDelete={() => setConfirmDelete(true)}
        />
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
                      router.push("/agent/properties");
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