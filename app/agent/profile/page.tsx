"use client";

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { mockAgents } from "@/lib/db";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

/* Page title */
if (typeof document !== 'undefined') document.title = 'Orthanc - Profile';

/* ── tiny inline-edit pencil icon ── */
const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* ── reusable inline-editable field ── */
function InlineField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  rows = 3,
  suffix,
  gold = false,
  large = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  rows?: number;
  suffix?: string;
  gold?: boolean;
  large?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [editing, value]);

  const confirm = useCallback(() => {
    onChange(draft);
    setEditing(false);
  }, [draft, onChange]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const onKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) confirm();
      if (e.key === "Escape") cancel();
    },
    [confirm, cancel, multiline]
  );

  return (
    <div className="group/field">
      <p className="label-luxury text-dark-500 text-[10px] mb-1.5">{label}</p>

      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={rows}
              className="luxury-input flex-1 text-sm resize-none"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              className="luxury-input flex-1 text-sm"
            />
          )}
          <button
            onClick={confirm}
            className="p-2 rounded-lg bg-gold-400/10 text-gold-400 hover:bg-gold-400/20 transition-colors mt-0.5"
            title="Confirm"
          >
            <CheckIcon />
          </button>
          <button
            onClick={cancel}
            className="p-2 rounded-lg bg-dark-700 text-dark-400 hover:text-white transition-colors mt-0.5"
            title="Cancel"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="flex items-start gap-2 cursor-pointer group/val rounded-lg -mx-2 px-2 py-1 hover:bg-dark-700/40 transition-colors"
        >
          <p
            className={`flex-1 ${large ? "font-display text-2xl font-bold" : "text-sm"} ${gold ? "text-gold-400" : "text-white"} ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}
          >
            {value}
            {suffix && <span className="text-dark-400 font-normal text-xs ml-1">{suffix}</span>}
          </p>
          <span className="text-dark-600 opacity-0 group-hover/val:opacity-100 transition-opacity mt-0.5">
            <PencilIcon />
          </span>
        </div>
      )}
    </div>
  );
}

/* ── credential row with inline edit ── */
function CredentialRow({
  credential,
  onUpdate,
  onRemove,
}: {
  credential: { title: string; detail: string };
  onUpdate: (c: { title: string; detail: string }) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(credential.title);
  const [detail, setDetail] = useState(credential.detail);

  const save = () => {
    onUpdate({ title, detail });
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-dark-900/60 rounded-xl border border-gold-400/[0.06] group/cred hover:border-gold-400/15 transition-colors">
      <span className="w-7 h-7 rounded-full bg-gold-400/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gold-400">
          <path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      {editing ? (
        <div className="flex-1 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="luxury-input text-sm w-full"
            placeholder="Certification name"
          />
          <input
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="luxury-input text-xs w-full"
            placeholder="Details (e.g. Active - Expires Dec 2026)"
          />
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="text-gold-400 text-xs hover:underline">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="text-dark-400 text-xs hover:underline">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditing(true)}>
          <p className="text-white text-sm font-semibold">{credential.title}</p>
          <p className="text-dark-400 text-xs mt-0.5">{credential.detail}</p>
        </div>
      )}

      <button
        onClick={onRemove}
        className="opacity-0 group-hover/cred:opacity-100 text-dark-500 hover:text-red-400 transition-all p-1"
        title="Remove"
      >
        <XIcon />
      </button>
    </div>
  );
}

/* ═════════════════════════════════════════
   MAIN PAGE
   ═════════════════════════════════════════ */
export default function AgentProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [agent] = useState(mockAgents[0]);

  /* ── form state ── */
  const [name, setName] = useState(agent?.name || "");
  const [phone, setPhone] = useState(agent?.phone || "");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("Luxury Real Estate");
  const [yearsExp, setYearsExp] = useState("15");
  const [expertiseAreas, setExpertiseAreas] = useState(
    "Luxury properties, Waterfront developments, Investment properties"
  );
  const [bio, setBio] = useState(agent?.bio || "");
  const [marketKnowledge, setMarketKnowledge] = useState(agent?.marketKnowledge || "");
  const [credentials, setCredentials] = useState([
    { title: "Florida Real Estate License", detail: "Active — Expires Dec 31, 2026" },
    { title: "National Association of REALTORS®", detail: "Member since 2015" },
    { title: "Certified Luxury Home Marketing Specialist", detail: "REBAC Training Certified" },
  ]);

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "credentials" | "market">("profile");

  useEffect(() => {
    if (user) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      router.push("/login");
    }
  }, [user, router]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addCredential = () => {
    setCredentials((prev) => [...prev, { title: "New Certification", detail: "Click to edit details" }]);
  };

  if (!user || user.role !== "agent") return null;

  const tabs: { key: typeof activeTab; label: string; icon: JSX.Element }[] = [
    {
      key: "profile",
      label: "Profile",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "credentials",
      label: "Credentials",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "market",
      label: "Market Knowledge",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 12l4-4 3 2 5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 bg-dark-900 min-h-screen">
        {/* ── ambient glow ── */}
        <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full animate-soft-glow"
            style={{ background: "radial-gradient(ellipse at center, rgba(201,169,110,0.05) 0%, transparent 70%)" }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* ── breadcrumb ── */}
          <Link
            href="/agent/dashboard"
            className="inline-flex items-center gap-1.5 text-dark-400 hover:text-gold-400 text-xs tracking-wide transition-colors mb-8"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          {/* ── hero card ── */}
          <div className="bg-dark-800/70 border border-gold-400/[0.07] rounded-2xl overflow-hidden mb-8 animate-fade-up backdrop-blur-sm">
            {/* cover band */}
            <div className="h-28 bg-gradient-to-r from-dark-800 via-dark-700/60 to-dark-800 relative">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(201,169,110,0.08) 0%, transparent 60%)" }} />
            </div>

            <div className="px-8 pb-8 -mt-14 flex flex-col md:flex-row md:items-end gap-6">
              {/* avatar */}
              <div className="relative shrink-0">
                <img
                  src={agent?.profileImage}
                  alt={name}
                  className="w-28 h-28 rounded-2xl border-4 border-dark-800 object-cover shadow-xl bg-dark-700"
                />
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-gold-400 text-dark-900 flex items-center justify-center shadow-lg hover:bg-gold-300 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M12 2a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8z" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="11.5" cy="4.5" r="0.8" fill="currentColor" />
                  </svg>
                </button>
              </div>

              {/* name + title */}
              <div className="flex-1 min-w-0">
                <InlineField label="" value={name} onChange={setName} large />
                <p className="text-gold-400/70 text-sm tracking-wide mt-0.5">Real Estate Agent</p>
              </div>

              {/* quick stats */}
              <div className="flex gap-6 md:gap-8 shrink-0">
                {[
                  { n: "3", l: "Properties" },
                  { n: "$46.25M", l: "Portfolio" },
                  { n: "12", l: "Clients" },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="font-display text-xl font-bold text-white">{s.n}</p>
                    <p className="text-dark-400 text-[10px] uppercase tracking-widest">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── toast ── */}
          {saved && (
            <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
              <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckIcon />
              </span>
              <p className="text-green-400 text-sm">Profile updated successfully</p>
            </div>
          )}

          {/* ── tab bar ── */}
          <div className="flex gap-1 mb-8 bg-dark-800/50 border border-dark-600/10 rounded-xl p-1 w-fit animate-fade-up-d1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                  activeTab === t.key
                    ? "bg-gold-400/10 text-gold-400 shadow-sm"
                    : "text-dark-400 hover:text-white hover:bg-dark-700/40"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* ═══ TAB: Profile ═══ */}
          {activeTab === "profile" && (
            <div className="grid lg:grid-cols-2 gap-6 animate-fade-up-d2">
              {/* Contact */}
              <div className="bg-dark-800/60 border border-gold-400/[0.06] rounded-xl p-6 backdrop-blur-sm">
                <h3 className="label-luxury text-dark-300 text-[11px] mb-5 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gold-400/50">
                    <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 6l6 3.5L14 6" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <InlineField label="PHONE" value={phone} onChange={setPhone} />
                  <InlineField label="EMAIL" value={email} onChange={setEmail} />
                </div>
              </div>

              {/* Professional */}
              <div className="bg-dark-800/60 border border-gold-400/[0.06] rounded-xl p-6 backdrop-blur-sm">
                <h3 className="label-luxury text-dark-300 text-[11px] mb-5 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gold-400/50">
                    <path d="M4 14V2h8v12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                    <path d="M7 5h2M7 8h2M7 11h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Professional Details
                </h3>
                <div className="space-y-4">
                  <InlineField label="SPECIALIZATION" value={specialization} onChange={setSpecialization} />
                  <InlineField label="YEARS OF EXPERIENCE" value={yearsExp} onChange={setYearsExp} type="number" suffix="years" />
                  <InlineField label="EXPERTISE AREAS" value={expertiseAreas} onChange={setExpertiseAreas} />
                </div>
              </div>

              {/* Bio — full width */}
              <div className="lg:col-span-2 bg-dark-800/60 border border-gold-400/[0.06] rounded-xl p-6 backdrop-blur-sm">
                <h3 className="label-luxury text-dark-300 text-[11px] mb-5 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gold-400/50">
                    <path d="M3 3h10M3 7h10M3 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Professional Bio
                </h3>
                <InlineField label="" value={bio} onChange={setBio} multiline rows={4} />
              </div>
            </div>
          )}

          {/* ═══ TAB: Credentials ═══ */}
          {activeTab === "credentials" && (
            <div className="max-w-2xl animate-fade-up-d2">
              <div className="bg-dark-800/60 border border-gold-400/[0.06] rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="label-luxury text-dark-300 text-[11px] flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gold-400/50">
                      <path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Certifications & Licenses
                  </h3>
                  <button
                    onClick={addCredential}
                    className="text-xs text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {credentials.map((c, i) => (
                    <CredentialRow
                      key={i}
                      credential={c}
                      onUpdate={(updated) =>
                        setCredentials((prev) =>
                          prev.map((cr, idx) => (idx === i ? updated : cr))
                        )
                      }
                      onRemove={() =>
                        setCredentials((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    />
                  ))}
                  {credentials.length === 0 && (
                    <p className="text-dark-500 text-sm text-center py-8">
                      No credentials added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ TAB: Market Knowledge ═══ */}
          {activeTab === "market" && (
            <div className="max-w-3xl animate-fade-up-d2">
              <div className="bg-dark-800/60 border border-gold-400/[0.06] rounded-xl p-6 backdrop-blur-sm">
                <h3 className="label-luxury text-dark-300 text-[11px] mb-5 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-gold-400/50">
                    <path d="M2 12l4-4 3 2 5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Market Knowledge & Insights
                </h3>
                <InlineField
                  label=""
                  value={marketKnowledge}
                  onChange={setMarketKnowledge}
                  multiline
                  rows={8}
                />
                <p className="text-dark-500 text-xs mt-4 leading-relaxed">
                  This information is shared with potential clients when they view your property listings.
                  Include local market trends, investment opportunities, neighborhood dynamics, and pricing strategies.
                </p>
              </div>
            </div>
          )}

          {/* ── save bar ── */}
          <div className="flex items-center gap-4 mt-10 animate-fade-up-d3">
            <button onClick={handleSave} className="luxury-button-primary text-sm">
              Save All Changes
            </button>
            <Link href="/agent/dashboard" className="luxury-button-secondary text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
