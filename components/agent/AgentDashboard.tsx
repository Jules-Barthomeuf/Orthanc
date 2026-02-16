"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToastStore } from "@/lib/toast";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

/* ─── Auto-resize textarea hook ─── */
function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (reset) { ta.style.height = `${minHeight}px`; return; }
      ta.style.height = `${minHeight}px`;
      ta.style.height = `${Math.max(minHeight, Math.min(ta.scrollHeight, maxHeight ?? Infinity))}px`;
    },
    [minHeight, maxHeight],
  );
  useEffect(() => { if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`; }, [minHeight]);
  return { textareaRef, adjustHeight };
}

/* ─── SVG icons ─── */
const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
);
const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);
const DocIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const ImageIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
  </svg>
);
const PaperclipIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);
const AnalyzeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const KnowledgeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

/* ─── Chat message type ─── */
interface ChatMessage {
  role: "user" | "ai";
  content: string;
  property?: any;
}

/* ─── Typing dots ─── */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      <span className="w-1.5 h-1.5 bg-gold-400/80 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
      <span className="w-1.5 h-1.5 bg-gold-400/80 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
      <span className="w-1.5 h-1.5 bg-gold-400/80 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
    </span>
  );
}

/* ─── Property creation — paste & parse flow ─── */
interface PropertyDraft {
  address?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  description?: string;
  lot?: number;
  homeType?: string;
  hoa?: number;
  parking?: number;
  propertyTax?: number;
  zestimate?: number;
  pricePerSqFt?: number;
  rentEstimate?: number;
  neighborhood?: string;
  features?: string[];
}

/* ── Parse raw listing text (Zillow / MLS / any format) ── */
function parseListingText(text: string): PropertyDraft {
  const draft: PropertyDraft = {};
  const lines = text.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
  const full = text;

  // Price — "$5,999,500" or "Listed for $X" or "Price: $X"
  const priceM = full.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(?:M(?:illion)?)?/i);
  if (priceM) {
    const raw = priceM[1].replace(/,/g, '');
    let val = parseFloat(raw);
    if (/M(?:illion)?/i.test(priceM[0])) val *= 1_000_000;
    if (val > 10_000) draft.price = val;
  }

  // Address — look for a line with street + state/zip pattern
  for (const line of lines) {
    if (/\d+\s+\w+.*(?:st|ave|blvd|dr|ct|rd|ln|way|pl|cir|ter|pkwy),?\s+\w+.*\b[A-Z]{2}\s+\d{5}/i.test(line)) {
      draft.address = line.replace(/^\$[\d,.]+\s*/, '').trim();
      break;
    }
  }
  if (!draft.address) {
    for (const line of lines) {
      if (/\d+\s+\w+.*(?:st|street|ave|avenue|blvd|boulevard|dr|drive|ct|court|rd|road|ln|lane|way|pl|place|cir|circle|ter|terrace)/i.test(line) && line.length < 150) {
        draft.address = line.replace(/^\$[\d,.]+\s*/, '').trim();
        break;
      }
    }
  }

  // Beds
  const bedM = full.match(/(\d+)\s*(?:bed(?:room)?s?\b|bd\b|br\b)/i);
  if (bedM) draft.bedrooms = parseInt(bedM[1]);

  // Baths
  const bathM = full.match(/(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?\b|ba\b)/i);
  if (bathM) draft.bathrooms = Math.ceil(parseFloat(bathM[1]));

  // Square feet
  const sqftPatterns = [
    /([\d,]+)\s*(?:sq\s*\.?\s*ft|sqft|square\s*feet)/i,
    /(?:livable|interior|living)\s*(?:area)?\s*:?\s*([\d,]+)\s*(?:sq|sqft)/i,
    /(?:total\s+(?:structure|interior|livable)\s+area)\s*:?\s*([\d,]+)/i,
  ];
  for (const pat of sqftPatterns) {
    const m = full.match(pat);
    if (m) { draft.squareFeet = parseInt(m[1].replace(/,/g, '')); break; }
  }

  // Year built
  const ybM = full.match(/(?:built\s+(?:in\s+)?(\d{4})|year\s*built\s*:?\s*(\d{4}))/i);
  if (ybM) draft.yearBuilt = parseInt(ybM[1] || ybM[2]);

  // Lot size
  const lotM = full.match(/([\d.]+)\s*(?:acres?|acre)\s*(?:lot)?/i);
  if (lotM) draft.lot = parseFloat(lotM[1]);

  // Home type
  const typeM = full.match(/(?:single\s*family|condo|townhouse|townhome|co-?op|multi-?family|duplex|triplex|penthouse)/i);
  if (typeM) draft.homeType = typeM[0];

  // HOA
  const hoaM = full.match(/\$\s*([\d,]+)\s*\/\s*mo\s*HOA/i) ||
    full.match(/HOA\s*(?:fee)?\s*:?\s*\$\s*([\d,]+)\s*(?:quarterly|monthly|\/\s*mo)/i);
  if (hoaM) {
    const val = parseInt(hoaM[1].replace(/,/g, ''));
    if (/quarterly/i.test(hoaM[0])) draft.hoa = Math.round(val / 3);
    else draft.hoa = val;
  }

  // Parking
  const parkM = full.match(/(?:garage|parking)\s*(?:spaces?)?\s*:?\s*(\d+)/i) ||
    full.match(/(\d+)\s*(?:car\s+)?garage/i);
  if (parkM) draft.parking = parseInt(parkM[1]);

  // Property tax
  const taxM = full.match(/(?:annual\s*)?tax\s*(?:amount)?\s*:?\s*\$\s*([\d,]+)/i) ||
    full.match(/property\s*tax(?:es)?\s*:?\s*\$\s*([\d,]+)/i);
  if (taxM) draft.propertyTax = parseInt(taxM[1].replace(/,/g, ''));

  // Zestimate
  const zestM = full.match(/\$\s*([\d,]+(?:\.\d+)?)\s*Zestimate/i);
  if (zestM) draft.zestimate = parseInt(zestM[1].replace(/,/g, ''));

  // Price per sqft
  const ppsfM = full.match(/\$\s*([\d,]+)\s*\/\s*sqft/i);
  if (ppsfM) draft.pricePerSqFt = parseInt(ppsfM[1].replace(/,/g, ''));

  // Rent estimate
  const rentM = full.match(/Rent\s*Zestimate[^$]*\$\s*([\d,]+)\s*\/\s*mo/i);
  if (rentM) draft.rentEstimate = parseInt(rentM[1].replace(/,/g, ''));

  // Neighborhood/subdivision
  const neighM = full.match(/(?:Subdivision|Community|Neighborhood)\s*:?\s*(.+)/i);
  if (neighM) draft.neighborhood = neighM[1].trim();

  // Region from address
  if (!draft.neighborhood && draft.address) {
    const parts = draft.address.split(',');
    if (parts.length >= 2) draft.neighborhood = parts[parts.length - 2].trim();
  }

  // Description — look for the longest prose paragraph
  const proseLines = lines.filter(l => l.length > 80 && !/\$|sqft|beds?|baths?|Zestimate|MLS|NMLS/i.test(l));
  if (proseLines.length > 0) {
    draft.description = proseLines.sort((a, b) => b.length - a.length)[0];
  }
  if (!draft.description) {
    // Try combining special features
    const specialIdx = lines.findIndex(l => /what'?s\s+special/i.test(l));
    if (specialIdx >= 0) {
      const after = lines.slice(specialIdx + 1);
      const feats: string[] = [];
      for (const l of after) {
        if (l.length > 30 && l.length < 500 && !/\$|MLS|NMLS/i.test(l)) { feats.push(l); break; }
      }
      if (feats.length > 0) draft.description = feats.join(' ');
    }
  }

  // Features — pool, sauna, view, gated, etc.
  const features: string[] = [];
  if (/\bpool\b/i.test(full)) features.push('Pool');
  if (/\bsauna\b/i.test(full)) features.push('Sauna');
  if (/\bgated\b/i.test(full)) features.push('Gated Community');
  if (/\bocean\s*(?:front|view)|\bwater\s*front/i.test(full)) features.push('Waterfront');
  if (/\bbalcony\b/i.test(full)) features.push('Balcony');
  if (/\belevator\b/i.test(full)) features.push('Elevator');
  if (/\bsmart\s*home/i.test(full)) features.push('Smart Home');
  if (/\bwine\s*(?:cellar|room)/i.test(full)) features.push('Wine Cellar');
  if (/\bgym\b|\bfitness/i.test(full)) features.push('Gym/Fitness');
  if (/\btennis/i.test(full)) features.push('Tennis Court');
  if (/\bpickleball/i.test(full)) features.push('Pickleball');
  if (/\bbasketball/i.test(full)) features.push('Basketball Court');
  if (/\bconcierge/i.test(full)) features.push('Concierge');
  if (/\bflood\s*zone/i.test(full)) features.push('Flood Zone');
  if (features.length > 0) draft.features = features;

  return draft;
}

export function AgentDashboard() {
  const agentId = "agent-1";
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const firstName = user?.email?.split("@")[0]?.replace(/[._-]/g, " ")?.split(" ")[0] || "";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* ── Mode: "default" (general chat) | "create" | "analyze" | "knowledge" ── */
  const [mode, setMode] = useState<"default" | "create" | "analyze" | "knowledge">("default");

  /* ── Create mode state ── */
  const [draft, setDraft] = useState<PropertyDraft>({});
  const [showPreview, setShowPreview] = useState(false);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 56, maxHeight: 200 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const inChat = messages.length > 0 || isTyping;

  /* ── Activate Create Property mode ── */
  const activateCreateMode = () => {
    setMode("create");
    setDraft({});
    setShowPreview(false);
    setMessages([
      { role: "ai", content: "**Paste everything you have about this property** — a Zillow listing, MLS sheet, or just a description with the key details.\n\nI'll extract the price, address, beds, baths, sqft, year built, lot size, HOA, taxes, features, and description all at once.\n\nYou can also upload photos after." },
    ]);
  };

  /* ── Activate Analyze Market mode ── */
  const activateAnalyzeMode = () => {
    setMode("analyze");
    setMessages([
      { role: "ai", content: "Let's analyze a market. Tell me a **city**, **neighborhood**, **zip code**, or **street** and I'll provide insights on pricing trends, demand, comparable sales, and investment potential." },
    ]);
  };

  /* ── Activate Import Knowledge mode ── */
  const activateKnowledgeMode = () => {
    setMode("knowledge");
    setMessages([
      { role: "ai", content: "Share any knowledge you'd like me to remember — local market intel, a specific street you know well, neighborhood insights, buyer trends, or anything else. I'll save it to your profile for future reference." },
    ]);
  };

  /* ── Reset to default (general chat) ── */
  const resetToDefault = () => {
    setMode("default");
    setMessages([]);
    setDraft({});
    setShowPreview(false);
    setValue("");
    setUploadedImages([]);
    setUploadedDocs([]);
    adjustHeight(true);
  };

  /* ── Handle answer in Create mode — parse pasted listing text ── */
  const handleCreateModeAnswer = (answer: string) => {
    // If preview is already showing, treat as a follow-up tweak
    if (showPreview) {
      setMessages((prev) => [...prev, { role: "user", content: answer }, { role: "ai", content: "Use the form on the right to edit fields directly, or paste a new listing to start over." }]);
      return;
    }

    const parsed = parseListingText(answer);
    const fieldCount = Object.keys(parsed).filter(k => parsed[k as keyof PropertyDraft] !== undefined).length;

    if (fieldCount === 0) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: answer.slice(0, 200) + (answer.length > 200 ? '...' : '') },
        { role: "ai", content: "I couldn't extract any property data from that. Try pasting a full Zillow listing, MLS sheet, or include at least the **price and address**." },
      ]);
      return;
    }

    setDraft(parsed);

    // Build summary
    const items: string[] = [];
    if (parsed.price) items.push(`**Price:** $${parsed.price.toLocaleString()}`);
    if (parsed.address) items.push(`**Address:** ${parsed.address}`);
    if (parsed.bedrooms) items.push(`**Beds:** ${parsed.bedrooms}`);
    if (parsed.bathrooms) items.push(`**Baths:** ${parsed.bathrooms}`);
    if (parsed.squareFeet) items.push(`**Sqft:** ${parsed.squareFeet.toLocaleString()}`);
    if (parsed.yearBuilt) items.push(`**Built:** ${parsed.yearBuilt}`);
    if (parsed.lot) items.push(`**Lot:** ${parsed.lot} acres`);
    if (parsed.homeType) items.push(`**Type:** ${parsed.homeType}`);
    if (parsed.hoa) items.push(`**HOA:** $${parsed.hoa}/mo`);
    if (parsed.propertyTax) items.push(`**Annual Tax:** $${parsed.propertyTax.toLocaleString()}`);
    if (parsed.rentEstimate) items.push(`**Rent Est:** $${parsed.rentEstimate.toLocaleString()}/mo`);
    if (parsed.features?.length) items.push(`**Features:** ${parsed.features.join(', ')}`);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: answer.slice(0, 200) + (answer.length > 200 ? '...' : '') },
      { role: "ai", content: `**Detected ${fieldCount} fields from your listing:**\n\n${items.join('\n')}\n\nThe property preview is now showing on the right. You can edit any field there, upload photos, then click **"Create Property"**.` },
    ]);

    setShowPreview(true);
  };

  /* ── Create property from draft ── */
  const createPropertyFromDraft = async (draftData: PropertyDraft) => {
    setCreating(true);
    setIsTyping(true);
    const now = Date.now();
    const price = draftData.price || 5000000;
    const address = draftData.address || `Auto-generated Address ${now}`;

    // Génération description premium
    function generatePremiumDescription(d: PropertyDraft) {
      const beds = d.bedrooms || 4;
      const baths = d.bathrooms || 3;
      const sqft = d.squareFeet || 4000;
      const lot = d.lot ? `${d.lot} acre${d.lot > 1 ? 's' : ''}` : undefined;
      const year = d.yearBuilt || 2020;
      const features = d.features?.length ? d.features : [];
      const addressText = d.address ? `in ${d.address.split(',').slice(-2).join(', ').trim()}` : '';
      const extras = [];
      if (features.includes('Pool')) extras.push('heated pool');
      if (features.includes('Sauna')) extras.push('indoor sauna');
      if (features.includes('Wine Cellar')) extras.push('wine cellar');
      if (features.includes('Gated Community')) extras.push('in exclusive gated community');
      if (features.includes('Smart Home')) extras.push('smart home automation');
      if (features.includes('Gym/Fitness')) extras.push('private gym');
      if (features.includes('Tennis Court')) extras.push('tennis court');
      if (features.includes('Pickleball')) extras.push('pickleball court');
      if (features.includes('Basketball Court')) extras.push('basketball court');
      if (features.includes('Balcony')) extras.push('expansive balcony');
      if (features.includes('Waterfront')) extras.push('waterfront access');
      if (features.includes('Concierge')) extras.push('concierge services');
      const extrasText = extras.length ? 'Features ' + extras.join(', ') + '.' : '';
      return `Refined, fully remodeled ${beds}-bed, ${baths}-bath residence${lot ? ` on a ${lot}` : ''} ${addressText}. Boasts ${sqft.toLocaleString()} sqft, built in ${year}. ${extrasText} Luxurious sanctuary for grand entertaining and serene family living.`;
    }

    const propertyPayload = {
      id: `prop-ai-${now}`,
      title: address,
      address,
      price,
      description: draftData.description || generatePremiumDescription(draftData),
      images: uploadedImages.length > 0 ? uploadedImages : ["https://images.unsplash.com/photo-1600585152552-5d5ef8e2b0f8?w=1200"],
      agentId,
      bedroom: draftData.bedrooms || 4,
      bathroom: draftData.bathrooms || 3,
      squareFeet: draftData.squareFeet || 4000,
      yearBuilt: draftData.yearBuilt || 2020,
      lot: draftData.lot || 0.45,
      owner: "Unknown Owner",
      documents: uploadedDocs.length > 0 ? uploadedDocs : [
        { id: `doc-${now}-1`, name: "Deed - Auto", type: "deed", url: "#", uploadedAt: new Date(), analysis: "Mock deed record." },
        { id: `doc-${now}-2`, name: "Inspection - Auto", type: "inspection", url: "#", uploadedAt: new Date(), analysis: "Mock inspection report." },
      ],
      maintenanceHistory: [
        { id: `maint-${now}-1`, date: new Date("2023-09-10"), description: "Full HVAC service", cost: 4500, category: "HVAC" },
      ],
      ownershipHistory: [
        { id: `own-${now}-1`, owner: "Previous Owner", purchaseDate: new Date("2016-05-01"), saleDate: new Date(), purchasePrice: Math.floor(price * 0.78), salePrice: price, reason: "Estate sale" },
      ],
    };

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyPayload),
      });
      if (res.ok) {
        setIsTyping(false);
        setMessages((prev) => [...prev, { role: "ai", content: `Property "${address}" has been created successfully! Redirecting to your properties...` }]);
        addToast({ type: "success", message: `Property "${address}" created!` });
        setTimeout(() => router.push("/agent/my-properties"), 1200);
      } else {
        throw new Error("Failed");
      }
    } catch {
      setIsTyping(false);
      addToast({ type: "error", message: "Failed to create property" });
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, something went wrong while creating the property. Please try again." }]);
    } finally {
      setCreating(false);
    }
  };

  /* ── Handle default chat message (general Q&A) ── */
  const handleDefaultChat = async (q: string) => {
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));

    const responses = [
      `That's a great question about "${q.slice(0, 40)}...". In the current luxury market, valuations depend heavily on location, condition, and comparable sales in the area. Would you like me to dig deeper into any specific aspect?`,
      `Regarding "${q.slice(0, 40)}..." — market trends suggest strong demand in premium segments. Interest rates and local inventory levels are the key factors to watch right now.`,
      `I can help with that! For "${q.slice(0, 40)}...", I'd recommend looking at recent comparable sales and considering factors like neighborhood growth trajectory and planned infrastructure investments.`,
      `Good question. Based on my analysis of "${q.slice(0, 40)}...", here are the key considerations: market liquidity, cap rate benchmarks for the area, and buyer demographics. Want more detail on any of these?`,
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "ai", content: reply }]);
  };

  /* ── Handle Analyze Market message ── */
  const handleAnalyzeMessage = async (q: string) => {
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

    const area = q.slice(0, 50);
    const medianPrice = (400000 + Math.floor(Math.random() * 1600000)).toLocaleString();
    const appreciation = (2 + Math.random() * 8).toFixed(1);
    const daysOnMarket = Math.floor(20 + Math.random() * 60);
    const inventory = (Math.random() * 4 + 0.5).toFixed(1);

    const reply = `📊 **Market Analysis — ${area}**\n\n` +
      `**Median Price:** $${medianPrice}\n` +
      `**YoY Appreciation:** +${appreciation}%\n` +
      `**Avg Days on Market:** ${daysOnMarket}\n` +
      `**Months of Inventory:** ${inventory}\n\n` +
      `${parseFloat(inventory) < 2 ? "This is a strong seller's market with limited inventory." : parseFloat(inventory) < 4 ? "The market is balanced with moderate competition." : "This is a buyer's market — good negotiation leverage."}\n\n` +
      `Would you like me to dive deeper into comparable sales, price forecasts, or investment potential for this area?`;

    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "ai", content: reply }]);
  };

  /* ── Handle Import Knowledge message ── */
  const handleKnowledgeMessage = async (q: string) => {
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

    const reply = `✅ **Knowledge saved to your profile.**\n\n` +
      `I've recorded the following insight:\n> "${q.slice(0, 120)}${q.length > 120 ? "..." : ""}"\n\n` +
      `This will be used to provide you with more personalized recommendations and market context. Share more anytime — the more I know, the better I can assist you.`;

    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "ai", content: reply }]);
  };

  /* ─── Send message ─── */
  const handleSend = async () => {
    const q = value.trim();
    if (!q || isTyping || creating) return;

    setValue("");
    adjustHeight(true);

    if (mode === "create") {
      handleCreateModeAnswer(q);
    } else if (mode === "analyze") {
      await handleAnalyzeMessage(q);
    } else if (mode === "knowledge") {
      await handleKnowledgeMessage(q);
    } else {
      await handleDefaultChat(q);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Hidden file inputs */
  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setUploadedImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
    setMessages((prev) => [...prev, { role: "user", content: `Uploaded ${files.length} image(s)` }]);
  };

  const onDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const names = files.map((f) => f.name);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: names }),
      });
      const data = await res.json();
      setUploadedDocs(data.documents || []);
      addToast({ type: "success", message: `${data.documents?.length || 0} document(s) uploaded` });
      setMessages((prev) => [...prev, { role: "user", content: `Uploaded ${names.length} document(s): ${names.join(", ")}` }]);
    } catch {
      addToast({ type: "error", message: "Failed to upload documents" });
    }
    e.target.value = "";
  };

  /* ── Update draft field from preview editor ── */
  const updateDraftField = (key: keyof PropertyDraft, value: any) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`flex-1 w-full flex ${showPreview ? 'flex-row' : 'flex-col items-center justify-center'} relative overflow-hidden px-6 gap-0`}>
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-gold-400/[0.035] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] bg-gold-400/[0.025] rounded-full blur-[140px] animate-pulse" style={{ animationDelay: "700ms" }} />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gold-400/[0.02] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1200ms" }} />
      </div>

      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-gold-400/[0.08] rounded-tl-2xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-gold-400/[0.08] rounded-br-2xl pointer-events-none" />

      {/* Hidden file inputs */}
      <input ref={imgInputRef} type="file" multiple accept="image/*" className="hidden" onChange={onImageUpload} />
      <input ref={docInputRef} type="file" multiple className="hidden" onChange={onDocUpload} />

      <div className={`${showPreview ? 'w-[420px] flex-shrink-0 h-full overflow-y-auto py-6' : 'w-full max-w-2xl mx-auto'} relative z-10 flex flex-col transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>

        {/* ─── Header (fades when chatting) ─── */}
        <div className={`text-center transition-all duration-500 ${inChat ? "mb-4 opacity-0 h-0 overflow-hidden" : "mb-10"}`}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-400/[0.06] border border-gold-400/[0.12] mb-5">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div className="inline-block">
            <h1 className="text-4xl font-display tracking-normal pb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-400 via-white to-gold-400/60">Hi {displayName}, How can I help today?</span>
            </h1>
          </div>
          <p className="text-sm text-white/30 mt-4">Select a mode and start typing</p>
        </div>

        {/* ─── Active mode indicator + exit (visible when in a specialized mode) ─── */}
        {inChat && mode !== "default" && (
          <div className="flex items-center justify-between mb-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                mode === "create" ? "bg-gold-400" : mode === "analyze" ? "bg-blue-400" : "bg-violet-400"
              } animate-pulse`} />
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
                {mode === "create" ? "Create Property" : mode === "analyze" ? "Analyze Market" : "Import Knowledge"}
              </span>
            </div>
            <button
              onClick={resetToDefault}
              className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Exit
            </button>
          </div>
        )}

        {/* ─── Chat messages area ─── */}
        {inChat && (
          <div className="flex-1 overflow-y-auto max-h-[50vh] mb-4 space-y-4 px-1 scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-[fadeSlideIn_0.3s_ease-out]`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gold-400/10 text-white border border-gold-400/10"
                      : "bg-white/[0.03] text-dark-200 border border-white/[0.05]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-[fadeSlideIn_0.3s_ease-out]">
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <span className="text-sm text-white/50">Thinking</span>
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* (Preview panel replaces old "Create Now" button — rendered outside this column) */}

        {/* ─── Mode toggle pills (always visible above input) ─── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => { if (mode !== "create") activateCreateMode(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
              mode === "create"
                ? "bg-gold-400/15 border-gold-400/30 text-gold-400 shadow-lg shadow-gold-400/[0.08]"
                : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <HomeIcon />
            <span>Create Property</span>
          </button>
          <button
            onClick={() => { if (mode !== "analyze") activateAnalyzeMode(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
              mode === "analyze"
                ? "bg-blue-400/15 border-blue-400/30 text-blue-400 shadow-lg shadow-blue-400/[0.08]"
                : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <AnalyzeIcon />
            <span>Analyze Market</span>
          </button>
          <button
            onClick={() => { if (mode !== "knowledge") activateKnowledgeMode(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
              mode === "knowledge"
                ? "bg-violet-400/15 border-violet-400/30 text-violet-400 shadow-lg shadow-violet-400/[0.08]"
                : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <KnowledgeIcon />
            <span>Import Knowledge</span>
          </button>
        </div>

        {/* ─── Input Box (always visible) ─── */}
        <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-gold-400/20 shadow-lg shadow-gold-400/[0.04] transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] hover:border-gold-400/30 focus-within:border-gold-400/40 focus-within:shadow-[0_0_40px_rgba(212,175,55,0.12)]">
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder={mode === "create" ? "Type your answer..." : mode === "analyze" ? "Enter a city, neighborhood, or address..." : mode === "knowledge" ? "Share local insights, market intel, neighborhood info..." : "Ask me anything about real estate..."}
              className="w-full px-4 py-3 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/20"
              style={{ overflow: "hidden", minHeight: 56 }}
            />
          </div>

          {/* Uploaded images preview */}
          {uploadedImages.length > 0 && (
            <div className="px-4 pb-3 flex gap-2 flex-wrap">
              {uploadedImages.map((img, i) => (
                <div
                  key={i}
                  className="relative group cursor-move"
                  draggable
                  onDragStart={() => setDraggedImgIdx(i)}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={e => {
                    e.preventDefault();
                    if (draggedImgIdx === null || draggedImgIdx === i) return;
                    setUploadedImages(prev => {
                      const arr = [...prev];
                      const [removed] = arr.splice(draggedImgIdx, 1);
                      arr.splice(i, 0, removed);
                      return arr;
                    });
                    setDraggedImgIdx(null);
                  }}
                  onDragEnd={() => setDraggedImgIdx(null)}
                >
                  <img src={img} alt="" className="w-12 h-9 rounded-lg object-cover border border-dark-600/30" />
                  <button
                    onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600/90 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="px-4 py-3 border-t border-gold-400/[0.06] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {mode === "create" && (
                <>
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="p-2 text-white/30 hover:text-gold-400/80 rounded-lg transition-colors hover:bg-gold-400/[0.05]"
                    title="Upload images"
                  >
                    <PaperclipIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="p-2 text-white/30 hover:text-gold-400/80 rounded-lg transition-colors hover:bg-gold-400/[0.05]"
                    title="Upload documents"
                  >
                    <DocIcon />
                  </button>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={isTyping || creating || !value.trim()}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                value.trim() && !isTyping && !creating
                  ? "bg-gold-400 text-dark-900 shadow-lg shadow-gold-400/10 hover:bg-gold-300"
                  : "bg-white/[0.05] text-white/30 cursor-not-allowed"
              }`}
            >
              <SendIcon />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className={`text-center text-dark-600 text-[10px] mt-4 transition-opacity duration-300 ${inChat ? "opacity-0 h-0" : "opacity-100"}`}>
          Press Enter to send <span className="text-gold-400/30">·</span> Shift+Enter for new line
        </p>
      </div>

      {/* ─── Property Preview / Editor Panel (right side in split layout) ─── */}
      {showPreview && mode === "create" && (
        <div className="flex-1 h-full overflow-y-auto border-l border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-sm animate-[fadeSlideIn_0.4s_ease-out]">
          <div className="p-6 space-y-6 max-w-xl mx-auto">
            {/* Header */}
            <div>
              <h2 className="text-lg font-semibold text-white/90 mb-1">Property Preview</h2>
              <p className="text-xs text-white/30">Review & edit before creating</p>
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Photos</label>
              <div className="flex gap-2 flex-wrap">
                {uploadedImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative group cursor-move"
                    draggable
                    onDragStart={() => setDraggedImgIdx(i)}
                    onDragOver={e => { e.preventDefault(); }}
                    onDrop={e => {
                      e.preventDefault();
                      if (draggedImgIdx === null || draggedImgIdx === i) return;
                      setUploadedImages(prev => {
                        const arr = [...prev];
                        const [removed] = arr.splice(draggedImgIdx, 1);
                        arr.splice(i, 0, removed);
                        return arr;
                      });
                      setDraggedImgIdx(null);
                    }}
                    onDragEnd={() => setDraggedImgIdx(null)}
                  >
                    <img src={img} alt="" className="w-20 h-16 rounded-lg object-cover border border-white/10" />
                    <button
                      onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600/90 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => imgInputRef.current?.click()}
                  className="w-20 h-16 rounded-lg border border-dashed border-white/15 flex flex-col items-center justify-center gap-1 text-white/25 hover:text-gold-400/60 hover:border-gold-400/30 transition-colors cursor-pointer"
                >
                  <ImageIcon />
                  <span className="text-[9px]">Add</span>
                </button>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Address</label>
                <input value={draft.address || ''} onChange={e => updateDraftField('address', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Price ($)</label>
                <input type="number" value={draft.price || ''} onChange={e => updateDraftField('price', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Home Type</label>
                <input value={draft.homeType || ''} onChange={e => updateDraftField('homeType', e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Bedrooms</label>
                <input type="number" value={draft.bedrooms || ''} onChange={e => updateDraftField('bedrooms', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Bathrooms</label>
                <input type="number" value={draft.bathrooms || ''} onChange={e => updateDraftField('bathrooms', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Sqft</label>
                <input type="number" value={draft.squareFeet || ''} onChange={e => updateDraftField('squareFeet', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Year Built</label>
                <input type="number" value={draft.yearBuilt || ''} onChange={e => updateDraftField('yearBuilt', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Lot (acres)</label>
                <input type="number" step="0.01" value={draft.lot || ''} onChange={e => updateDraftField('lot', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">HOA ($/mo)</label>
                <input type="number" value={draft.hoa || ''} onChange={e => updateDraftField('hoa', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Parking Spaces</label>
                <input type="number" value={draft.parking || ''} onChange={e => updateDraftField('parking', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Annual Property Tax ($)</label>
                <input type="number" value={draft.propertyTax || ''} onChange={e => updateDraftField('propertyTax', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Rent Estimate ($/mo)</label>
                <input type="number" value={draft.rentEstimate || ''} onChange={e => updateDraftField('rentEstimate', Number(e.target.value) || undefined)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Description</label>
                <textarea value={draft.description || ''} onChange={e => updateDraftField('description', e.target.value)} rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-gold-400/30 resize-none" />
              </div>
            </div>

            {/* Features tags */}
            {draft.features && draft.features.length > 0 && (
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Features</label>
                <div className="flex flex-wrap gap-1.5">
                  {draft.features.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-gold-400/10 border border-gold-400/15 text-[11px] text-gold-400/70">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Create button */}
            <button
              onClick={() => createPropertyFromDraft(draft)}
              disabled={creating || (!draft.address && !draft.price)}
              className="w-full py-3.5 rounded-xl bg-gold-400 text-dark-900 font-semibold text-sm hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/15 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Property'}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
