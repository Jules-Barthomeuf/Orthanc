'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Maximize2,
  Minimize2,
  GripVertical,
  Bot,
  User,
  Sparkles,
  ArrowDownRight,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

export interface SimStatePartial {
  propertyValue?: number;
  grossAnnualRent?: number;
  vacancyRate?: number;
  closingCosts?: number;
  renovationCosts?: number;
  ltvRatio?: number;
  interestRate?: number;
  loanTermYears?: number;
  holdPeriodYears?: number;
  holdingStructure?: 'personal' | 'llc' | 'trust' | 'sci';
  baseAppreciationRate?: number;
  propertyTaxRate?: number;
  annualInsurance?: number;
  targetExitProfit?: number;
  marketRegion?: string;
  concierge?: number;
  specializedSecurity?: number;
  highEndLandscaping?: number;
  poolMaintenance?: number;
  wineClimate?: number;
  smartHomeSystems?: number;
  propertyManagement?: number;
  liveInStaff?: number;
  securityTeam?: number;
  propertyManagers?: number;
  avgStaffSalary?: number;
  priceBracket?: 'ultra' | 'premium' | 'entry';
  infinityPool?: boolean;
  wineClimateControl?: boolean;
  smartHomeUpdates?: boolean;
  scarcityPrivateBeach?: boolean;
  scarcityHistoricHeritage?: boolean;
  scarcityStarchitect?: boolean;
  scarcityUniqueView?: boolean;
  [key: string]: any;
}

interface FinSummary {
  noi: number;
  capRate: number;
  cashOnCash: number;
  irrPercent: number;
  carryRatio: number;
  breakEvenAppreciation: number;
  totalCarryCost: number;
  annualCashFlow: number;
  annualDebtService: number;
  monthlyPayment: number;
  loanAmount: number;
  equityInvested: number;
  totalCashInvested: number;
  effectiveAppreciation: number;
  exitValue: number;
  netExitWithBenefit: number;
  dscr: number;
  effectiveRent: number;
  vacancyLoss: number;
  [key: string]: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  params?: SimStatePartial;
  timestamp: number;
}

interface SimulatorChatProps {
  currentState: any;
  financials: FinSummary;
  onUpdateParams: (params: SimStatePartial) => void;
}

/* ═══════════════════════════════════════════════════════════════
   NLP PARAMETER PARSER
   ═══════════════════════════════════════════════════════════════ */

function parseMoney(str: string): number | null {
  // Handles: $14.5M, $14.5 million, $500K, $500,000, 14.5M, 2.5m, etc.
  const patterns = [
    /\$?\s*([\d,.]+)\s*[Mm](?:illion)?/,
    /\$?\s*([\d,.]+)\s*[Bb](?:illion)?/,
    /\$?\s*([\d,.]+)\s*[Kk]/,
    /\$\s*([\d,]+(?:\.\d+)?)/,
    /([\d,]+(?:\.\d+)?)\s*(?:dollars?)/i,
  ];

  for (const pat of patterns) {
    const m = str.match(pat);
    if (m) {
      const num = parseFloat(m[1].replace(/,/g, ''));
      if (pat.source.includes('[Bb]')) return num * 1_000_000_000;
      if (pat.source.includes('[Mm]')) return num * 1_000_000;
      if (pat.source.includes('[Kk]')) return num * 1_000;
      return num;
    }
  }
  return null;
}

function parsePercent(str: string): number | null {
  const m = str.match(/([\d.]+)\s*%/);
  return m ? parseFloat(m[1]) : null;
}

function parseYears(str: string): number | null {
  const m = str.match(/([\d]+)\s*(?:year|yr|years|yrs)/i);
  return m ? parseInt(m[1]) : null;
}

const REGION_KEYWORDS: Record<string, string[]> = {
  'miami-beach': ['miami', 'south beach', 'biscayne', 'brickell'],
  'palm-beach': ['palm beach', 'boca raton'],
  'bel-air': ['bel air', 'bel-air'],
  'beverly-hills': ['beverly hills'],
  'malibu': ['malibu', 'pacific palisades'],
  'hamptons': ['hamptons', 'east hampton', 'southampton'],
  'aspen': ['aspen', 'snowmass'],
  'monaco': ['monaco', 'monte carlo'],
  'manhattan': ['manhattan', 'tribeca', 'soho', 'new york', 'nyc'],
  'mayfair': ['mayfair', 'belgravia', 'london'],
  'saint-tropez': ['saint-tropez', 'st tropez', 'saint tropez'],
  'paris-16': ['paris'],
};

function detectRegionFromText(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, keywords] of Object.entries(REGION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return key;
  }
  return null;
}

function detectStructure(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\bsci\b/.test(lower)) return 'sci';
  if (/\btrust\b|irrevocable/i.test(lower)) return 'trust';
  if (/\bllc\b/.test(lower)) return 'llc';
  if (/\bpersonal\b|personally/i.test(lower)) return 'personal';
  return null;
}

/* ── Service keywords → field mapping (longest-first so "pool maintenance" beats "pool") ── */
const SERVICE_MAP: [string, { costField: string; boolField?: string; ratio: number }][] = [
  ['pool maintenance',      { costField: 'poolMaintenance', boolField: 'infinityPool', ratio: 0.0025 }],
  ['infinity pool',         { costField: 'poolMaintenance', boolField: 'infinityPool', ratio: 0.003 }],
  ['property management',   { costField: 'propertyManagement', ratio: 0.004 }],
  ['smart home',            { costField: 'smartHomeSystems', boolField: 'smartHomeUpdates', ratio: 0.0023 }],
  ['wine cellar',           { costField: 'wineClimate', boolField: 'wineClimateControl', ratio: 0.0017 }],
  ['wine climate',          { costField: 'wineClimate', boolField: 'wineClimateControl', ratio: 0.0017 }],
  ['high end landscaping',  { costField: 'highEndLandscaping', ratio: 0.005 }],
  ['high-end landscaping',  { costField: 'highEndLandscaping', ratio: 0.005 }],
  ['landscaping',           { costField: 'highEndLandscaping', ratio: 0.005 }],
  ['security',              { costField: 'specializedSecurity', ratio: 0.012 }],
  ['concierge',             { costField: 'concierge', ratio: 0.008 }],
  ['pool',                  { costField: 'poolMaintenance', boolField: 'infinityPool', ratio: 0.0025 }],
  ['wine',                  { costField: 'wineClimate', boolField: 'wineClimateControl', ratio: 0.0017 }],
  ['management',            { costField: 'propertyManagement', ratio: 0.004 }],
];

/* ── Generic param name → field mapping for "set/put/change X to Y" ── */
const PARAM_NAME_MAP: Record<string, { field: string; type: 'percent' | 'years' | 'money'; label: string }> = {
  'loan term':        { field: 'loanTermYears', type: 'years', label: 'Loan term' },
  'term':             { field: 'loanTermYears', type: 'years', label: 'Loan term' },
  'hold period':      { field: 'holdPeriodYears', type: 'years', label: 'Hold period' },
  'hold':             { field: 'holdPeriodYears', type: 'years', label: 'Hold period' },
  'rate':             { field: 'interestRate', type: 'percent', label: 'Interest rate' },
  'interest rate':    { field: 'interestRate', type: 'percent', label: 'Interest rate' },
  'mortgage rate':    { field: 'interestRate', type: 'percent', label: 'Interest rate' },
  'vacancy':          { field: 'vacancyRate', type: 'percent', label: 'Vacancy rate' },
  'vacancy rate':     { field: 'vacancyRate', type: 'percent', label: 'Vacancy rate' },
  'appreciation':     { field: 'baseAppreciationRate', type: 'percent', label: 'Appreciation' },
  'appreciation rate': { field: 'baseAppreciationRate', type: 'percent', label: 'Appreciation' },
  'growth':           { field: 'baseAppreciationRate', type: 'percent', label: 'Appreciation' },
  'growth rate':      { field: 'baseAppreciationRate', type: 'percent', label: 'Appreciation' },
  'tax':              { field: 'propertyTaxRate', type: 'percent', label: 'Property tax' },
  'property tax':     { field: 'propertyTaxRate', type: 'percent', label: 'Property tax' },
  'tax rate':         { field: 'propertyTaxRate', type: 'percent', label: 'Property tax' },
  'rent':             { field: 'grossAnnualRent', type: 'money', label: 'Gross annual rent' },
  'annual rent':      { field: 'grossAnnualRent', type: 'money', label: 'Gross annual rent' },
  'insurance':        { field: 'annualInsurance', type: 'money', label: 'Insurance' },
  'closing costs':    { field: 'closingCosts', type: 'money', label: 'Closing costs' },
  'closing':          { field: 'closingCosts', type: 'money', label: 'Closing costs' },
  'renovation':       { field: 'renovationCosts', type: 'money', label: 'Renovation' },
  'reno':             { field: 'renovationCosts', type: 'money', label: 'Renovation' },
  'ltv':              { field: 'ltvRatio', type: 'percent', label: 'LTV' },
  'leverage':         { field: 'ltvRatio', type: 'percent', label: 'LTV' },
  'concierge budget': { field: 'concierge', type: 'money', label: 'Concierge' },
  'security budget':  { field: 'specializedSecurity', type: 'money', label: 'Security' },
  'landscaping budget': { field: 'highEndLandscaping', type: 'money', label: 'Landscaping' },
  'pool budget':      { field: 'poolMaintenance', type: 'money', label: 'Pool maintenance' },
  'smart home budget': { field: 'smartHomeSystems', type: 'money', label: 'Smart home' },
  'staff salary':     { field: 'avgStaffSalary', type: 'money', label: 'Staff salary' },
  'salary':           { field: 'avgStaffSalary', type: 'money', label: 'Staff salary' },
  'management fee':   { field: 'propertyManagement', type: 'money', label: 'Management' },
};

export function parseUserMessage(text: string, currentPropertyValue: number): { params: SimStatePartial; descriptions: string[] } {
  const params: SimStatePartial = {};
  const descriptions: string[] = [];
  const lower = text.toLowerCase();

  // ── Property Value ── detect price in many natural phrasing styles
  const pricePatterns = [
    /(?:listed|listing|asking|ask)\s*(?:price|at|for)?\s*(?:is|of|at|:)?\s*(\$?\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)/i,
    /(?:buy|purchase|acquire|get)\s+(?:a\s+)?(\$?\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)\s*(?:home|house|property|villa|condo|apartment|estate|place)?/i,
    /(?:home|house|property|villa|condo|apartment|estate|place)\s+(?:worth|valued?\s+at|priced?\s+at|for|at|of)\s+(\$?\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)/i,
    /(\$\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)\s*(?:home|house|property|villa|condo|apartment|estate|place)/i,
    /property\s*(?:value|price)\s*(?:to|at|of|=|:)?\s*(\$?\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)/i,
    /(?:value|price|worth|cost|priced)\s*(?:is|of|at|=|:)\s*(\$?\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)/i,
    /(?:it'?s|its|the\s+price\s+is|it\s+(?:is|was)|goes\s+for|selling\s+(?:for|at))\s*(\$?\s*[\d,.]+\s*[MmKkBb]?(?:illion)?)/i,
  ];
  for (const pat of pricePatterns) {
    const m = text.match(pat);
    if (m) {
      const v = parseMoney(m[1]);
      if (v && v >= 100_000) {
        params.propertyValue = v;
        descriptions.push(`Property value → $${(v / 1_000_000).toFixed(1)}M`);
        break;
      }
    }
  }

  // ── Down Payment ── "put $500K down", "down payment of 20%", "500K down"
  const downPatterns = [
    /(?:put|place|make)\s+(\$?\s*[\d,.]+\s*[MmKk]?)\s+down/i,
    /down\s*(?:payment)?\s*(?:of|=|:)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i,
    /(\$?\s*[\d,.]+\s*[MmKk]?)\s+down\s*(?:payment)?/i,
    /(?:put|place)\s+([\d.]+)\s*%?\s*down/i,
  ];
  for (const pat of downPatterns) {
    const m = text.match(pat);
    if (m) {
      const pctMatch = m[1].match(/^([\d.]+)\s*%$/);
      if (pctMatch) {
        const pct = parseFloat(pctMatch[1]);
        params.ltvRatio = 100 - pct;
        descriptions.push(`Down payment ${pct}% → LTV ${params.ltvRatio}%`);
      } else {
        const v = parseMoney(m[1]);
        if (v) {
          const propVal = params.propertyValue || currentPropertyValue;
          const ltv = Math.max(0, Math.min(100, ((propVal - v) / propVal) * 100));
          params.ltvRatio = Math.round(ltv / 5) * 5; // round to nearest 5
          descriptions.push(`Down payment $${(v / 1_000).toFixed(0)}K → LTV ${params.ltvRatio}%`);
        }
      }
      break;
    }
  }

  // ── Rent from natural prose ── "could rent for $X", "rental income around $X", "tenant pays $X"
  const proseRentMonthly = [
    /(?:rents?|tenant|leased?)\s+(?:for|at|pays?|around|approximately|roughly|about)\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:month|mo|monthly)/i,
    /(?:could|can|would|should)\s+(?:rent|lease)\s+(?:for|at)\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:month|mo)/i,
    /(?:monthly|month)\s+(?:rental?|income|revenue)\s*(?:is|of|about|around|approximately)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i,
  ];
  if (!params.grossAnnualRent) {
    for (const pat of proseRentMonthly) {
      const m = text.match(pat);
      if (m) { const v = parseMoney(m[1]); if (v) { params.grossAnnualRent = v * 12; descriptions.push(`Gross rent → ${fmt$(v * 12)}/yr (${fmt$(v)}/mo)`); break; } }
    }
  }
  const proseRentAnnual = [
    /(?:annual|yearly)\s+(?:rental?|income|revenue)\s*(?:is|of|about|around|approximately)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i,
    /(?:generates?|produces?|brings?\s+in|earns?)\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:year|yr|annually)/i,
  ];
  if (!params.grossAnnualRent) {
    for (const pat of proseRentAnnual) {
      const m = text.match(pat);
      if (m) { const v = parseMoney(m[1]); if (v) { params.grossAnnualRent = v; descriptions.push(`Gross rent → ${fmt$(v)}/yr`); break; } }
    }
  }

  // ── Interest Rate ── "finance at 4%", "4% rate", "interest rate of 4%"
  const ratePatterns = [
    /(?:finance|financed?|mortgage|borrow)\s+(?:it\s+)?(?:at|for)\s+([\d.]+)\s*%/i,
    /(?:interest|rate|mortgage\s+rate)\s*(?:of|at|=|:)?\s*([\d.]+)\s*%/i,
    /([\d.]+)\s*%\s*(?:interest|rate|mortgage|financing|loan)/i,
    /(?:at|for)\s+([\d.]+)\s*%\s*(?:a\s+year|per\s+year|annually|annual|p\.?a\.?)?/i,
  ];
  for (const pat of ratePatterns) {
    const m = text.match(pat);
    if (m) {
      const rate = parseFloat(m[1]);
      if (rate > 0 && rate <= 20) {
        params.interestRate = rate;
        descriptions.push(`Interest rate → ${rate}%`);
        break;
      }
    }
  }

  // ── LTV directly ── "LTV 70%", "70% LTV", "leverage 70%"
  if (!params.ltvRatio) {
    const ltvPat = /(?:ltv|leverage)\s*(?:of|at|=|:)?\s*([\d.]+)\s*%/i;
    const m = text.match(ltvPat);
    if (m) {
      params.ltvRatio = parseFloat(m[1]);
      descriptions.push(`LTV → ${params.ltvRatio}%`);
    }
  }

  // ── Loan Term ── "30 year loan", "loan for 15 years", "financed over 20 years"
  const termPats = [
    /(?:loan|mortgage|term)\s*(?:for|of|=|:)?\s*(\d+)\s*(?:year|yr)/i,
    /(\d+)\s*(?:year|yr)\s*(?:loan|mortgage|term|fixed|arm)/i,
    /(?:financed?|amortized?)\s+(?:over|for)\s*(\d+)\s*(?:year|yr)/i,
  ];
  for (const pat of termPats) {
    const m = text.match(pat);
    if (m) {
      const y = parseInt(m[1]);
      if (y >= 5 && y <= 30) {
        params.loanTermYears = y;
        descriptions.push(`Loan term → ${y} years`);
        break;
      }
    }
  }

  // ── Hold Period ── "hold for 5 years", "5 year hold"
  const holdPat = /hold\s*(?:for|period)?\s*(\d+)\s*(?:year|yr)/i;
  const holdPat2 = /(\d+)\s*(?:year|yr)\s*hold/i;
  for (const pat of [holdPat, holdPat2]) {
    const m = text.match(pat);
    if (m) {
      const y = parseInt(m[1]);
      if (y >= 1 && y <= 30) {
        params.holdPeriodYears = y;
        descriptions.push(`Hold period → ${y} years`);
        break;
      }
    }
  }

  // ── Rent ── "$10K/month rent", "rent for $120K/year"
  if (!params.grossAnnualRent) {
    const rentPat = /(?:rent|rental|income)\s*(?:of|for|at|=|:)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)\s*(?:month|mo)/i;
    const rentPat2 = /(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)\s*(?:month|mo)\s*(?:rent|rental|income)?/i;
    const rentPat3 = /(?:rent|rental|income)\s*(?:of|for|at|=|:)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:year|yr|annual)/i;
    for (const pat of [rentPat, rentPat2]) {
      const m = text.match(pat);
      if (m) {
        const v = parseMoney(m[1]);
        if (v) {
          params.grossAnnualRent = v * 12;
          descriptions.push(`Gross rent → $${(v * 12 / 1_000).toFixed(0)}K/yr ($${(v / 1_000).toFixed(1)}K/mo)`);
          break;
        }
      }
    }
    if (!params.grossAnnualRent) {
      const m = text.match(rentPat3);
      if (m) {
        const v = parseMoney(m[1]);
        if (v) {
          params.grossAnnualRent = v;
          descriptions.push(`Gross rent → $${(v / 1_000).toFixed(0)}K/yr`);
        }
      }
    }
  }

  // ── Vacancy ── "10% vacancy", "vacancy of 15%"
  const vacPat = /vacancy\s*(?:rate|of|at|=|:)?\s*([\d.]+)\s*%/i;
  const vacPat2 = /([\d.]+)\s*%\s*vacancy/i;
  for (const pat of [vacPat, vacPat2]) {
    const m = text.match(pat);
    if (m) {
      params.vacancyRate = parseFloat(m[1]);
      descriptions.push(`Vacancy rate → ${params.vacancyRate}%`);
      break;
    }
  }

  // ── Appreciation ── "4% appreciation", "appreciation of 3.5%"
  const appPat = /(?:appreciation|growth)\s*(?:rate|of|at|=|:)?\s*([\d.]+)\s*%/i;
  const appPat2 = /([\d.]+)\s*%\s*(?:appreciation|growth)/i;
  for (const pat of [appPat, appPat2]) {
    const m = text.match(pat);
    if (m) {
      params.baseAppreciationRate = parseFloat(m[1]);
      descriptions.push(`Base appreciation → ${params.baseAppreciationRate}%/yr`);
      break;
    }
  }

  // ── Property Tax ── "property tax 1.2%", "taxes are $X/year", "tax rate is 1.5%"
  const taxPat = /(?:property\s+)?tax\s*(?:rate|of|at|=|:)?\s*([\d.]+)\s*%/i;
  const taxM = text.match(taxPat);
  if (taxM) {
    const v = parseFloat(taxM[1]);
    if (v <= 5) {
      params.propertyTaxRate = v;
      descriptions.push(`Property tax → ${v}%`);
    }
  }
  // Property tax as dollar amount → convert to rate
  if (!params.propertyTaxRate) {
    const taxDollarPat = /(?:property\s+)?tax(?:es)?\s*(?:are|is|of|about|around|approximately)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:year|yr|annual)/i;
    const tdm = text.match(taxDollarPat);
    if (tdm) {
      const v = parseMoney(tdm[1]);
      const propVal = params.propertyValue || currentPropertyValue;
      if (v && propVal > 0) {
        params.propertyTaxRate = Math.round((v / propVal) * 10000) / 100;
        descriptions.push(`Property tax → ${params.propertyTaxRate}% (${fmt$(v)}/yr)`);
      }
    }
  }

  // ── All cash ── "all cash", "no financing", "cash purchase"
  if (/\ball[\s-]?cash\b|no\s+(?:financing|mortgage|loan)|cash\s+(?:purchase|buy)/i.test(lower)) {
    params.ltvRatio = 0;
    descriptions.push(`All-cash purchase → LTV 0%`);
  }

  // ── Region ──
  const region = detectRegionFromText(text);
  if (region) {
    params.marketRegion = region;
    descriptions.push(`Market region → ${region}`);
  }

  // ── Holding structure ──
  const structure = detectStructure(text);
  if (structure) {
    params.holdingStructure = structure as any;
    descriptions.push(`Holding structure → ${structure.toUpperCase()}`);
  }

  // ── Closing costs ──
  const closePat = /closing\s*(?:costs?)?\s*(?:of|at|=|:)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i;
  const cm = text.match(closePat);
  if (cm) {
    const v = parseMoney(cm[1]);
    if (v) {
      params.closingCosts = v;
      descriptions.push(`Closing costs → $${(v / 1_000).toFixed(0)}K`);
    }
  }

  // ── Renovation ──
  const renoPat = /(?:renovation|reno|furnish|remodel|luxury\s*lift|updates?|upgrades?)\s*(?:of|at|=|:|cost|needed|required|budget)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i;
  const rm = text.match(renoPat);
  if (rm) {
    const v = parseMoney(rm[1]);
    if (v) {
      params.renovationCosts = v;
      descriptions.push(`Renovation → $${(v / 1_000).toFixed(0)}K`);
    }
  }
  // Needs renovation without dollar amount
  if (params.renovationCosts === undefined && /\b(?:needs|requires?|needs?\s+some)\s+(?:renovation|work|updating|remodel)/i.test(lower)) {
    const propVal = params.propertyValue || currentPropertyValue;
    const reno = Math.round(propVal * 0.04 / 25_000) * 25_000 || 100_000;
    params.renovationCosts = reno;
    descriptions.push(`Renovation (estimated) → ${fmt$(reno)}`);
  }

  // ── Generic "set/put/change X to Y" — catches "put the loan term to 20 years" ──
  const setMatches = [...text.matchAll(/(?:set|put|change|adjust|make)\s+(?:the\s+)?(.+?)\s+(?:to|at|=)\s+(.+?)(?:\.|,|$|\s+(?:too|also|as\s+well|and\b))/gi)];
  for (const sm of setMatches) {
    const paramNameRaw = sm[1].trim().toLowerCase();
    const valueRaw = sm[2].trim();
    const sorted = Object.entries(PARAM_NAME_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const [key, cfg] of sorted) {
      if (!paramNameRaw.includes(key)) continue;
      if (params[cfg.field] !== undefined) break;
      if (cfg.type === 'years') {
        const y = parseInt(valueRaw);
        if (y > 0 && y <= 50) { params[cfg.field] = y; descriptions.push(`${cfg.label} → ${y} years`); }
      } else if (cfg.type === 'percent') {
        const pct = parseFloat(valueRaw);
        if (!isNaN(pct) && pct >= 0 && pct <= 100) { params[cfg.field] = pct; descriptions.push(`${cfg.label} → ${pct}%`); }
      } else {
        const v = parseMoney(valueRaw);
        if (v) { params[cfg.field] = v; descriptions.push(`${cfg.label} → ${fmt$(v)}`); }
      }
      break;
    }
  }

  // ── Service & feature toggles — "I want security", "add landscaping", "turn off pool" ──
  const handledCostFields = new Set<string>();
  const DISABLE_RE = /\b(?:turn\s+off|remove|disable|cut|drop|without|eliminate|cancel|stop)\b/i;
  const propVal = params.propertyValue || currentPropertyValue;

  for (const [keyword, cfg] of SERVICE_MAP) {
    if (handledCostFields.has(cfg.costField)) continue;
    const kwPat = new RegExp(`\\b${keyword.replace(/[-]/g, '\\-').replace(/\s+/g, '[\\s-]+')}\\b`, 'i');
    if (!kwPat.test(text)) continue;
    handledCostFields.add(cfg.costField);
    if (params[cfg.costField] !== undefined) continue;

    const idx = lower.search(kwPat);
    const before = lower.slice(Math.max(0, idx - 50), idx);
    const isDisabling = DISABLE_RE.test(before) || /\bno\s+$/.test(before);

    if (isDisabling) {
      params[cfg.costField] = 0;
      if (cfg.boolField) (params as any)[cfg.boolField] = false;
      descriptions.push(`Disabled ${keyword}`);
    } else {
      const afterText = text.slice(idx);
      const amtMatch = afterText.match(new RegExp(
        `${keyword.replace(/\s+/g, '[\\s-]+')}\\s*(?:at|of|for|=|:|budget)?\\s*(\\$?\\s*[\\d,.]+\\s*[MmKk])`, 'i'
      ));
      let amount: number | null = null;
      if (amtMatch) amount = parseMoney(amtMatch[1]);

      if (amount) {
        params[cfg.costField] = amount;
        if (cfg.boolField) (params as any)[cfg.boolField] = true;
        descriptions.push(`${keyword} → ${fmt$(amount)}/yr`);
      } else {
        const defaultVal = Math.round(propVal * cfg.ratio / 5_000) * 5_000 || 15_000;
        params[cfg.costField] = defaultVal;
        if (cfg.boolField) (params as any)[cfg.boolField] = true;
        descriptions.push(`Enabled ${keyword} → ${fmt$(defaultVal)}/yr`);
      }
    }
  }

  // ── Staffing commands — "add 2 staff", "hire a security team", "remove staff" ──
  const staffDisable = /(?:remove|no|cut|eliminate|fire|drop)\s+(?:all\s+)?(?:staff|employee|team|personnel)/i.test(lower);
  if (staffDisable) {
    params.liveInStaff = 0; params.securityTeam = 0; params.propertyManagers = 0;
    descriptions.push('Removed all staff');
  } else {
    const staffPat = /(?:add|hire|want|get|with)\s+(\d+)\s*(?:live[\s-]?in\s+)?(?:staff|employee|people)/i;
    const sm1 = text.match(staffPat);
    if (sm1) { params.liveInStaff = parseInt(sm1[1]); descriptions.push(`Live-in staff → ${sm1[1]}`); }

    if (/(?:add|hire|want|get|with)\s+(?:a\s+)?security\s+team/i.test(text) && params.securityTeam === undefined) {
      params.securityTeam = 1; descriptions.push('Security team → 1');
    }
    const secTeamPat = /(\d+)\s*(?:security\s+team|guards?|security\s+staff)/i;
    const sm2 = text.match(secTeamPat);
    if (sm2) { params.securityTeam = parseInt(sm2[1]); descriptions.push(`Security team → ${sm2[1]}`); }

    const mgrPat = /(?:add|hire|want|get|with)\s+(\d+)\s*(?:property\s+)?manager/i;
    const sm3 = text.match(mgrPat);
    if (sm3) { params.propertyManagers = parseInt(sm3[1]); descriptions.push(`Property managers → ${sm3[1]}`); }
  }

  // ── Insurance ──
  if (params.annualInsurance === undefined) {
    const insPat = /insurance\s*(?:of|at|=|:)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i;
    const im = text.match(insPat);
    if (im) { const v = parseMoney(im[1]); if (v) { params.annualInsurance = v; descriptions.push(`Insurance → ${fmt$(v)}/yr`); } }
  }

  // ── Scarcity toggles — "private beach", "historic", "starchitect", "unique view" ──
  if (/\b(?:private|secluded)\s+beach\b|\bbeachfront\b|\boceanfront\b|\bdirect\s+beach/i.test(text))  {
    (params as any).scarcityPrivateBeach = true; descriptions.push('Scarcity: private beach / oceanfront');
  }
  if (/\bhistoric\b|\bheritage\b|\blandmark\b|\bcentury[\s-]old\b/i.test(text))  {
    (params as any).scarcityHistoricHeritage = true; descriptions.push('Scarcity: historic heritage');
  }
  if (/\bstarchitect\b|\bfamous\s+architect|\bpritzker\b|\b(?:designed\s+by|architect)\s+\w+\s+\w+/i.test(text))  {
    (params as any).scarcityStarchitect = true; descriptions.push('Scarcity: starchitect design');
  }
  if (/\bunique\s+view\b|\bocean\s+view\b|\bpanoramic\b|\bunobstructed\s+view\b|\bcity\s+view\b|\bskyline\s+view/i.test(text))  {
    (params as any).scarcityUniqueView = true; descriptions.push('Scarcity: unique view');
  }

  // ── All-cash from prose ── "paying cash", "no mortgage needed"
  if (!params.ltvRatio && params.ltvRatio !== 0) {
    if (/\b(?:all[\s-]?cash|cash\s+(?:purchase|buyer?|deal)|no\s+(?:financing|mortgage|loan)|paying\s+cash|without\s+(?:a\s+)?(?:mortgage|loan))\b/i.test(lower)) {
      params.ltvRatio = 0;
      descriptions.push('All-cash purchase → LTV 0%');
    }
  }

  // ── HOA / condo fees → add to insurance as proxy ──
  if (params.annualInsurance === undefined) {
    const hoaPat = /(?:hoa|condo\s+fee|maintenance\s+fee|building\s+fee)s?\s*(?:is|are|of|about|around|:)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:month|mo)/i;
    const hoaM = text.match(hoaPat);
    if (hoaM) {
      const v = parseMoney(hoaM[1]);
      if (v) { params.annualInsurance = v * 12; descriptions.push(`HOA/Fees → ${fmt$(v * 12)}/yr (added as insurance)`); }
    }
  }

  // ── Insurance from prose ── "insurance is $X/year", "insured for $X"
  if (params.annualInsurance === undefined) {
    const insPatterns = [
      /insurance\s*(?:is|of|at|about|around|approximately|costs?|runs?)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)\s*(?:\/|per|a)?\s*(?:year|yr|annual)/i,
      /insurance\s*(?:is|of|at|about|around|approximately|costs?|runs?)?\s*(\$?\s*[\d,.]+\s*[MmKk]?)/i,
    ];
    for (const pat of insPatterns) {
      const im = text.match(pat);
      if (im) { const v = parseMoney(im[1]); if (v) { params.annualInsurance = v; descriptions.push(`Insurance → ${fmt$(v)}/yr`); break; } }
    }
  }

  return { params, descriptions };
}

/* ═══════════════════════════════════════════════════════════════
   ANALYSIS GENERATOR
   ═══════════════════════════════════════════════════════════════ */

function fmt$(v: number, decimals = 0): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(decimals || 1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function generateIntakeSummary(state: any, fin: FinSummary, changes: SimStatePartial, changeDescriptions: string[]): string {
  const lines: string[] = [];
  lines.push(`**I've set up the property. Here's what I detected:**\n`);

  // Group descriptions by category
  const propDescs = changeDescriptions.filter(d => /property value|listing|price|worth/i.test(d));
  const incomeDescs = changeDescriptions.filter(d => /rent|income|vacancy/i.test(d));
  const finDescs = changeDescriptions.filter(d => /ltv|down payment|interest|loan|mortgage|all-cash|leverage/i.test(d));
  const costDescs = changeDescriptions.filter(d => /closing|renovation|tax|insurance|hoa/i.test(d));
  const serviceDescs = changeDescriptions.filter(d => /security|landscaping|pool|concierge|wine|smart|management|staff|enabled|disabled/i.test(d));
  const stratDescs = changeDescriptions.filter(d => /hold|structure|region|appreciation|scarcity/i.test(d));
  const otherDescs = changeDescriptions.filter(d =>
    !propDescs.includes(d) && !incomeDescs.includes(d) && !finDescs.includes(d) &&
    !costDescs.includes(d) && !serviceDescs.includes(d) && !stratDescs.includes(d)
  );

  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push(`**${title}:**`);
    items.forEach(d => lines.push(`• ${d}`));
    lines.push('');
  };

  section('Property', propDescs);
  section('Income', incomeDescs);
  section('Financing', finDescs);
  section('Acquisition & Fixed Costs', costDescs);
  section('Services & Amenities', serviceDescs);
  section('Strategy & Market', stratDescs);
  section('Other', otherDescs);

  // Quick KPIs
  lines.push(`**Instant Analysis:**`);
  lines.push(`• NOI: **${fmt$(fin.noi)}/yr** · Cap Rate: **${fin.capRate.toFixed(2)}%**`);
  if (fin.loanAmount > 0) {
    lines.push(`• Cash-on-Cash: **${fin.cashOnCash.toFixed(2)}%** · DSCR: **${fin.dscr === Infinity ? '∞' : fin.dscr.toFixed(2)}**`);
    lines.push(`• Monthly payment: **${fmt$(fin.monthlyPayment)}** · Annual cash flow: **${fin.annualCashFlow >= 0 ? '+' : ''}${fmt$(fin.annualCashFlow)}**`);
  }
  lines.push(`• Carry Cost: **${fin.carryRatio.toFixed(2)}%** of value (${fmt$(fin.totalCarryCost)}/yr)`);
  lines.push(`• IRR (${state.holdPeriodYears}yr): **${isFinite(fin.irrPercent) ? fin.irrPercent.toFixed(1) + '%' : 'N/A'}**`);
  lines.push(`• Break-Even Appreciation: **${fin.breakEvenAppreciation.toFixed(2)}%/yr**`);
  lines.push('');

  // Quick assessment
  if (fin.capRate >= 4) lines.push(`_Strong cap rate for luxury — this is a genuine income-producing asset._`);
  else if (fin.capRate >= 2) lines.push(`_Solid cap rate for prime luxury — a safe-haven asset with reliable income._`);
  else lines.push(`_This is a prestige asset — the investment thesis rests on appreciation and lifestyle value._`);

  lines.push('');
  lines.push(`_The simulator is now live with all your data. Feel free to tweak anything — just tell me what to change, or ask me to **"minimize my cost"** or **"maximize my return"**._`);

  return lines.join('\n');
}

function generateAnalysis(state: any, fin: FinSummary, changes: SimStatePartial, changeDescriptions: string[]): string {
  const lines: string[] = [];

  // Opening with what changed
  if (changeDescriptions.length > 0) {
    lines.push(`**Updated the simulator:**`);
    changeDescriptions.forEach(d => lines.push(`• ${d}`));
    lines.push('');
  }

  lines.push(`**Investment Analysis**`);
  lines.push('');

  // Entry cost
  const totalEntry = fin.totalCashInvested;
  lines.push(`**Entry Cost (Year 0):**`);
  lines.push(`Purchase: ${fmt$(state.propertyValue)} · Down payment: ${fmt$(fin.equityInvested)} · Closing: ${fmt$(state.closingCosts)} · Renovations: ${fmt$(state.renovationCosts)}`);
  lines.push(`Total cash outlay: **${fmt$(totalEntry)}**`);
  lines.push('');

  // NOI & Cap Rate
  lines.push(`**Annual Performance:**`);
  lines.push(`Gross rent: ${fmt$(state.grossAnnualRent)}/yr → Effective (after ${state.vacancyRate}% vacancy): ${fmt$(fin.effectiveRent)}/yr`);
  lines.push(`Operating expenses: ${fmt$(fin.totalCarryCost)}/yr`);
  lines.push(`**NOI: ${fmt$(fin.noi)}/yr** · Cap Rate: **${fin.capRate.toFixed(2)}%**`);

  if (fin.capRate < 2) {
    lines.push(`_At ${fin.capRate.toFixed(1)}%, this is a lifestyle asset — low yield but high prestige and appreciation potential._`);
  } else if (fin.capRate < 4) {
    lines.push(`_A ${fin.capRate.toFixed(1)}% cap rate is typical for stable prime luxury — it beats inflation and provides a safe haven._`);
  } else {
    lines.push(`_${fin.capRate.toFixed(1)}% is strong for luxury — potential value-add opportunity._`);
  }
  lines.push('');

  // Carry Cost Ratio
  lines.push(`**Carry Cost Ratio: ${fin.carryRatio.toFixed(2)}%**`);
  lines.push(`The property burns ${fmt$(fin.totalCarryCost)}/yr (${fin.carryRatio.toFixed(1)}% of value) just to stay open. Without rental income, you'd need ${fin.carryRatio.toFixed(1)}%+ annual appreciation just to break even.`);
  lines.push('');

  // Cash flow & CoC
  if (fin.loanAmount > 0) {
    lines.push(`**Financing:**`);
    lines.push(`Loan: ${fmt$(fin.loanAmount)} at ${state.interestRate}% over ${state.loanTermYears}yr → ${fmt$(fin.monthlyPayment)}/mo`);
    lines.push(`Annual cash flow after debt: **${fin.annualCashFlow >= 0 ? '+' : ''}${fmt$(fin.annualCashFlow)}**`);
    lines.push(`Cash-on-Cash return: **${fin.cashOnCash.toFixed(2)}%**`);

    if (fin.cashOnCash < 3) {
      lines.push(`_A ${fin.cashOnCash.toFixed(1)}% CoC is below risk-free Treasury yields — the investment thesis relies on appreciation and lifestyle value._`);
    } else if (fin.cashOnCash < 6) {
      lines.push(`_Decent cash yield for luxury real estate. The property carries itself._`);
    } else {
      lines.push(`_Strong cash returns — this property is a genuine income producer._`);
    }
    lines.push('');
  }

  // IRR
  const irrStr = isFinite(fin.irrPercent) ? `${fin.irrPercent.toFixed(1)}%` : 'N/A';
  lines.push(`**${state.holdPeriodYears}-Year Exit (IRR):**`);
  lines.push(`Projected exit value: ${fmt$(fin.exitValue)} · Net proceeds: ${fmt$(fin.netExitWithBenefit)}`);
  lines.push(`**IRR: ${irrStr}** over ${state.holdPeriodYears} years`);

  if (isFinite(fin.irrPercent)) {
    if (fin.irrPercent >= 10) {
      lines.push(`_Excellent — outperforms most asset classes._`);
    } else if (fin.irrPercent >= 7) {
      lines.push(`_Solid return. Competitive with S&P 500 averages, and you get a tangible luxury asset — a physical hedge against currency devaluation and a legacy asset._`);
    } else if (fin.irrPercent >= 4) {
      lines.push(`_Moderate return. The investment works if you value lifestyle utility and portfolio diversification._`);
    } else {
      lines.push(`_Below-market return. Consider whether the lifestyle value and asset class diversification justify the opportunity cost._`);
    }
  }
  lines.push('');

  // Break-even
  lines.push(`**Break-Even Appreciation: ${fin.breakEvenAppreciation.toFixed(2)}%/yr**`);
  if (fin.breakEvenAppreciation <= fin.effectiveAppreciation) {
    lines.push(`_Current expected growth (${fin.effectiveAppreciation.toFixed(1)}%) exceeds the break-even threshold — the numbers work._`);
  } else {
    lines.push(`_The market needs to grow by at least ${fin.breakEvenAppreciation.toFixed(1)}%/yr for this to not lose money. Current estimate is ${fin.effectiveAppreciation.toFixed(1)}% — there's a gap of ${(fin.breakEvenAppreciation - fin.effectiveAppreciation).toFixed(1)}%._`);
  }

  return lines.join('\n');
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function isAnalysisRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return /\b(analy[zs]e|review|summary|summarize|tell me|how does|what do you think|opinion|assess|evaluate|break.?down|overview|report|current|this property|the numbers)\b/i.test(lower);
}

/* ═══════════════════════════════════════════════════════════════
   ADVICE ENGINE — goal-oriented optimization recommendations
   ═══════════════════════════════════════════════════════════════ */

function detectAdviceGoal(text: string): { isAdvice: boolean; goal: string } {
  const goals: [RegExp, string][] = [
    [/\b(?:minimize|reduce|lower|cut|decrease)\s+(?:my\s+)?(?:cost|expense|spending|carry|overhead|burn|outgoing)/i, 'minimize-cost'],
    [/\b(?:maximize|increase|boost|improve|best|highest|optimize)\s+(?:my\s+)?(?:return|irr|yield|profit|gain|roi)/i, 'maximize-return'],
    [/\b(?:improve|increase|boost|maximize|positive)\s+(?:my\s+)?(?:cash\s*flow|income|revenue|net\s+income)/i, 'maximize-cashflow'],
    [/\b(?:reduce|minimize|lower|limit)\s+(?:my\s+)?(?:risk|exposure|downside|volatility)/i, 'reduce-risk'],
    [/\b(?:optimize|best|minimize)\s+(?:my\s+)?(?:tax|taxes|structure|fiscal)/i, 'optimize-tax'],
    [/\b(?:advice|recommend|suggest|optimize|what\s+should\s+i|how\s+(?:can|do|should)\s+i|best\s+(?:way|strategy|approach|move))\b/i, 'general'],
  ];
  for (const [pat, goal] of goals) {
    if (pat.test(text)) return { isAdvice: true, goal };
  }
  return { isAdvice: false, goal: '' };
}

function generateAdvice(goal: string, state: any, fin: FinSummary): { text: string; recommendedParams: SimStatePartial } {
  const lines: string[] = [];
  const rec: SimStatePartial = {};

  const costs = [
    { name: 'Concierge', field: 'concierge', value: state.concierge || 0 },
    { name: 'Security', field: 'specializedSecurity', value: state.specializedSecurity || 0 },
    { name: 'Landscaping', field: 'highEndLandscaping', value: state.highEndLandscaping || 0 },
    { name: 'Pool maintenance', field: 'poolMaintenance', value: state.poolMaintenance || 0 },
    { name: 'Wine climate', field: 'wineClimate', value: state.wineClimate || 0 },
    { name: 'Smart home', field: 'smartHomeSystems', value: state.smartHomeSystems || 0 },
    { name: 'Management', field: 'propertyManagement', value: state.propertyManagement || 0 },
  ].filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  const staffCost = ((state.liveInStaff || 0) + (state.securityTeam || 0) + (state.propertyManagers || 0)) * (state.avgStaffSalary || 85_000);

  switch (goal) {
    case 'minimize-cost': {
      lines.push(`**Goal: Minimize Carry Cost**\n`);
      lines.push(`Current annual carry: **${fmt$(fin.totalCarryCost)}** (${fin.carryRatio.toFixed(1)}% of property value)\n`);
      lines.push(`**Cost breakdown (ranked by impact):**\n`);
      if (fin.annualDebtService > 0) lines.push(`• Debt service: ${fmt$(fin.annualDebtService)}/yr`);
      if (staffCost > 0) lines.push(`• Staffing (${(state.liveInStaff||0)+(state.securityTeam||0)+(state.propertyManagers||0)} people): ${fmt$(staffCost)}/yr`);
      for (const c of costs) lines.push(`• ${c.name}: ${fmt$(c.value)}/yr`);
      lines.push(`• Property tax: ${fmt$(state.propertyValue * state.propertyTaxRate / 100)}/yr`);
      lines.push(`• Insurance: ${fmt$(state.annualInsurance)}/yr\n`);

      lines.push(`**Recommendations:**\n`);
      let totalSaved = 0;
      let n = 1;

      for (const c of costs) {
        if (c.value >= 25_000) { (rec as any)[c.field] = 0; totalSaved += c.value; lines.push(`${n++}. **Eliminate ${c.name}** → save ${fmt$(c.value)}/yr`); }
      }
      if (staffCost > 0) {
        rec.liveInStaff = 0; rec.securityTeam = 0; rec.propertyManagers = Math.min(1, state.propertyManagers || 0);
        const newCost = (rec.propertyManagers || 0) * (state.avgStaffSalary || 85_000);
        const saved = staffCost - newCost;
        if (saved > 0) { totalSaved += saved; lines.push(`${n++}. **Reduce staff** to 1 property manager → save ${fmt$(saved)}/yr`); }
      }
      if (state.loanTermYears < 30 && fin.loanAmount > 0) {
        rec.loanTermYears = 30;
        lines.push(`${n++}. **Extend loan to 30 years** → lower monthly payment`);
      }
      lines.push(`\n**Estimated annual savings: ${fmt$(totalSaved)}/yr**`);
      lines.push(`\n_Applying cost-cutting changes now…_`);
      break;
    }

    case 'maximize-return': {
      lines.push(`**Goal: Maximize IRR & Return**\n`);
      lines.push(`Current IRR: **${isFinite(fin.irrPercent) ? fin.irrPercent.toFixed(1) + '%' : 'N/A'}** · CoC: **${fin.cashOnCash.toFixed(1)}%**\n`);
      lines.push(`**Recommendations:**\n`);
      let n = 1;
      if (state.ltvRatio < 70) { rec.ltvRatio = 70; lines.push(`${n++}. **Increase leverage to 70% LTV** → more capital-efficient`); }
      let nonEss = 0;
      for (const c of costs) {
        if (['concierge', 'wineClimate', 'smartHomeSystems'].includes(c.field) && c.value > 0) { (rec as any)[c.field] = 0; nonEss += c.value; }
      }
      if (nonEss > 0) lines.push(`${n++}. **Cut non-essential services** → +${fmt$(nonEss)}/yr to NOI`);
      if (staffCost > (state.avgStaffSalary || 85_000)) {
        rec.liveInStaff = 0; rec.securityTeam = 0; rec.propertyManagers = 1;
        lines.push(`${n++}. **Minimize staffing** → keep 1 manager`);
      }
      if (state.holdPeriodYears < 7) { rec.holdPeriodYears = 7; lines.push(`${n++}. **Hold at least 7 years** → compound appreciation`); }
      if (state.holdingStructure === 'personal') { rec.holdingStructure = 'llc'; lines.push(`${n++}. **Switch to LLC** → liability protection + tax flexibility`); }
      lines.push(`\n_Applying return-maximizing changes…_`);
      break;
    }

    case 'maximize-cashflow': {
      lines.push(`**Goal: Maximize Cash Flow**\n`);
      lines.push(`Current annual cash flow: **${fin.annualCashFlow >= 0 ? '+' : ''}${fmt$(fin.annualCashFlow)}**\n`);
      lines.push(`**Recommendations:**\n`);
      let n = 1;
      if (state.ltvRatio > 50) { rec.ltvRatio = 50; lines.push(`${n++}. **Reduce leverage to 50%** → lower debt service`); }
      if (state.loanTermYears < 30 && fin.loanAmount > 0) { rec.loanTermYears = 30; lines.push(`${n++}. **Extend loan to 30 years** → lower payments`); }
      let cutT = 0;
      for (const c of costs) {
        if (c.value > 20_000) { const half = Math.round(c.value * 0.5 / 5_000) * 5_000; (rec as any)[c.field] = half; cutT += c.value - half; }
      }
      if (cutT > 0) lines.push(`${n++}. **Halve service budgets** → save ${fmt$(cutT)}/yr`);
      if (state.vacancyRate > 8) { rec.vacancyRate = 5; lines.push(`${n++}. **Target 5% vacancy** through premium tenant retention`); }
      lines.push(`\n_Applying cash-flow optimizations…_`);
      break;
    }

    case 'reduce-risk': {
      lines.push(`**Goal: Reduce Risk & Protect Downside**\n`);
      lines.push(`**Recommendations:**\n`);
      let n = 1;
      if (state.ltvRatio > 40) { rec.ltvRatio = 40; lines.push(`${n++}. **Lower leverage to 40% LTV** → bigger equity cushion`); }
      if (state.holdingStructure === 'personal') { rec.holdingStructure = 'llc'; lines.push(`${n++}. **Use LLC** → asset protection + liability shield`); }
      if (state.holdPeriodYears < 10) { rec.holdPeriodYears = 10; lines.push(`${n++}. **Plan 10+ year hold** → ride out market cycles`); }
      if (state.vacancyRate < 10) { rec.vacancyRate = 15; lines.push(`${n++}. **Model 15% vacancy** → conservative stress test`); }
      if (state.baseAppreciationRate > 3) { rec.baseAppreciationRate = 2.5; lines.push(`${n++}. **Use 2.5% appreciation** → conservative growth assumption`); }
      lines.push(`\n_Applying conservative parameters…_`);
      break;
    }

    case 'optimize-tax': {
      lines.push(`**Goal: Tax Optimization**\n`);
      lines.push(`**Recommendations:**\n`);
      let n = 1;
      if (state.holdingStructure === 'personal') { rec.holdingStructure = 'llc'; lines.push(`${n++}. **Move to LLC** → pass-through taxation, deductible expenses`); }
      else if (state.holdingStructure === 'llc') { rec.holdingStructure = 'trust'; lines.push(`${n++}. **Consider irrevocable trust** → estate planning + tax deferral`); }
      if (state.renovationCosts === 0) {
        const rv = Math.round(state.propertyValue * 0.03 / 25_000) * 25_000;
        rec.renovationCosts = rv; lines.push(`${n++}. **Budget ${fmt$(rv)} for renovation** → deductible improvements`);
      }
      if (state.holdPeriodYears < 5) { rec.holdPeriodYears = 5; lines.push(`${n++}. **Hold 5+ years** → long-term capital gains treatment`); }
      const annualDepr = Math.round(state.propertyValue * 0.8 / 27.5);
      lines.push(`\n**Note:** Estimated annual depreciation: ~${fmt$(annualDepr)} (27.5-year schedule on 80% of value) — a non-cash deduction that reduces taxable income.`);
      lines.push(`\n_Applying tax-optimized parameters…_`);
      break;
    }

    default: {
      lines.push(`**Investment Optimization Summary**\n`);
      if (fin.cashOnCash < 3 && fin.loanAmount > 0) {
        lines.push(`**Challenge: Low cash yield (${fin.cashOnCash.toFixed(1)}% CoC)**`);
        for (const c of costs.slice(0, 2)) {
          if (c.value >= 20_000) { (rec as any)[c.field] = Math.round(c.value * 0.5 / 5_000) * 5_000; lines.push(`• Reduce ${c.name}: ${fmt$(c.value)} → ${fmt$((rec as any)[c.field])}`); }
        }
      }
      if (fin.carryRatio > 3) lines.push(`\n**Challenge: High carry (${fin.carryRatio.toFixed(1)}%)**. Target: under 3%.`);
      if ((!isFinite(fin.irrPercent) || fin.irrPercent < 5) && state.holdPeriodYears < 7) {
        rec.holdPeriodYears = 10; lines.push(`\n• **Extend hold to 10 years** for compounding`);
      }
      if (Object.keys(rec).length === 0) {
        lines.push(`\nYour setup looks solid. Try a specific goal:\n`);
        lines.push(`• *"minimize my cost"* — cut every expense`);
        lines.push(`• *"maximize my return"* — optimize for IRR`);
        lines.push(`• *"improve cash flow"* — boost net income`);
        lines.push(`• *"reduce risk"* — conservative posture`);
        lines.push(`• *"optimize taxes"* — best structure`);
      } else {
        lines.push(`\n_Applying improvements…_`);
      }
      break;
    }
  }

  return { text: lines.join('\n'), recommendedParams: rec };
}

/* ═══════════════════════════════════════════════════════════════
   CHAT COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function SimulatorChat({ currentState, financials, onUpdateParams }: SimulatorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Welcome! I'm your investment advisor.\n\n**Tell me everything you know about this property** — price, location, rent potential, financing terms, square footage, amenities, condition… anything. Drop it all in one message and I'll configure the entire simulator instantly.\n\nFor example:\n*"It's a $6.5M villa in Miami Beach, 6 bed 8 bath, 8,000 sqft, oceanfront with a private pool. Currently rented at $35K/month. Taxes are $78K/year, insurance $42K. We'd put 30% down at 6.5% over 30 years. Needs about $200K in renovation. Has a wine cellar, smart home system, and concierge service. We plan to hold for 7 years."*\n\nI'll parse everything and give you an instant investment analysis — or just ask me to **"minimize cost"** or **"maximize return"** anytime.`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep latest props in refs so async callbacks always read fresh data
  const stateRef = useRef(currentState);
  stateRef.current = currentState;
  const finRef = useRef(financials);
  finRef.current = financials;

  // Dragging
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resizing
  const [size, setSize] = useState({ width: 420, height: 520 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isDragging]);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMove = (e: MouseEvent) => {
      const dw = resizeStart.current.x - e.clientX;
      const dh = resizeStart.current.y - e.clientY;
      setSize({
        width: Math.max(340, Math.min(800, resizeStart.current.w + dw)),
        height: Math.max(400, Math.min(900, resizeStart.current.h + dh)),
      });
    };
    const handleUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, [isResizing]);

  // Send message
  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Process with a small delay for UX
    setTimeout(() => {
      // ── Advice mode: detect goal-seeking questions first ──
      const advice = detectAdviceGoal(text);
      if (advice.isAdvice) {
        setTimeout(() => {
          const ls = stateRef.current;
          const lf = finRef.current;
          const { text: adviceText, recommendedParams } = generateAdvice(advice.goal, ls, lf);
          if (Object.keys(recommendedParams).length > 0) onUpdateParams(recommendedParams);
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`, role: 'assistant',
            text: adviceText, params: recommendedParams, timestamp: Date.now(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setIsThinking(false);
        }, 300);
        return;
      }

      // ── Normal parameter parsing ──
      const { params, descriptions } = parseUserMessage(text, stateRef.current.propertyValue);

      let finalParams = { ...params };

      // Apply updates to the simulator
      if (Object.keys(finalParams).length > 0) {
        onUpdateParams(finalParams);
      }

      // Wait for React to re-render with new state, then generate analysis from fresh refs
      setTimeout(() => {
        const latestState = stateRef.current;
        const latestFin = finRef.current;

        // Use intake summary for bulk property descriptions (4+ params = initial setup)
        const isBulkIntake = descriptions.length >= 4;
        const analysis = isBulkIntake
          ? generateIntakeSummary(latestState, latestFin, finalParams, descriptions)
          : generateAnalysis(latestState, latestFin, finalParams, descriptions);

        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: Object.keys(finalParams).length > 0
            ? analysis
            : isAnalysisRequest(text)
              ? generateAnalysis(latestState, latestFin, {}, ['Analyzing current scenario'])
              : `I couldn't detect specific parameters. Try telling me everything about the property in one message — price, rent, location, financing, amenities — and I'll set it all up.\n\nOr ask me to *"analyze this"*, *"minimize my cost"*, or *"maximize my return"*.`,
          params: finalParams,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        setIsThinking(false);
      }, 300);
    }, 200);
  }, [input, onUpdateParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Expanded mode takes more space
  const chatWidth = isExpanded ? Math.max(size.width, 560) : size.width;
  const chatHeight = isExpanded ? Math.max(size.height, 640) : size.height;

  // SSR safety — only render portal after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-400/30 flex items-center justify-center hover:shadow-gold-400/50 transition-shadow group"
          >
            <MessageCircle size={24} className="text-dark-900 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-dark-900 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/95 backdrop-blur-xl shadow-2xl shadow-black/50"
            style={{
              width: chatWidth,
              height: chatHeight,
              right: Math.max(16, 24 - position.x),
              bottom: Math.max(16, 24 - position.y),
            }}
          >
            {/* Resize handle (top-left corner) */}
            <div
              onMouseDown={handleResizeStart}
              className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-20 flex items-center justify-center opacity-0 hover:opacity-60 transition-opacity"
            >
              <ArrowDownRight size={10} className="text-white/40 rotate-180" />
            </div>

            {/* Header - draggable */}
            <div
              onMouseDown={handleDragStart}
              className={`flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-gold-400/[0.08] to-transparent flex-shrink-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400/20 to-gold-400/5 border border-gold-400/25 flex items-center justify-center">
                  <Sparkles size={14} className="text-gold-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/80">Investment Advisor</div>
                  <div className="text-[10px] text-gold-400/50 uppercase tracking-wider">AI-Powered Analysis</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
                  title={isExpanded ? 'Compress' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 sim-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-gold-400/15 border border-gold-400/25'
                  }`}>
                    {msg.role === 'user' ? <User size={12} className="text-blue-400" /> : <Bot size={12} className="text-gold-400" />}
                  </div>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-500/10 border border-blue-500/15 text-white/80'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/70'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-1.5 whitespace-pre-wrap">
                        {msg.text.split('\n').map((line, i) => {
                          // Bold
                          let rendered = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/90">$1</strong>');
                          // Italic
                          rendered = rendered.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="text-white/50">$1</em>');
                          // Underscored italic (_text_)
                          rendered = rendered.replace(/_(.+?)_/g, '<em class="text-white/50 italic">$1</em>');
                          return (
                            <div key={i} dangerouslySetInnerHTML={{ __html: rendered }} className={line === '' ? 'h-2' : ''} />
                          );
                        })}
                      </div>
                    ) : (
                      <div>{msg.text}</div>
                    )}
                    {msg.params && Object.keys(msg.params).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                        {Object.entries(msg.params).map(([k, v]) => (
                          <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gold-400/10 border border-gold-400/15 text-[10px] text-gold-400/70 font-mono">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-gold-400/15 border border-gold-400/25">
                    <Bot size={12} className="text-gold-400" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-white/30">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-white/[0.06] p-3 bg-[#0a0a0c]">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me everything about the property…"
                  disabled={isThinking}
                  rows={Math.min(5, Math.max(1, input.split('\n').length))}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-gold-400/30 focus:ring-1 focus:ring-gold-400/10 transition-colors disabled:opacity-50 resize-none sim-scrollbar"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isThinking}
                  className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 hover:bg-gold-400/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="text-[10px] text-white/20 mt-1.5 px-1">
                Enter to send · Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
