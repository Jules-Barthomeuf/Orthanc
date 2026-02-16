/**
 * Generates realistic market data and investment analysis from an address and price.
 * Uses deterministic seeding so the same address always produces the same data.
 */

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function generateMarketData(address: string, price: number) {
  const addressParts = address.split(',').map((s: string) => s.trim());
  let city = 'Unknown City';
  let stateAbbr = '';
  let neighborhood = addressParts[0] || 'Central District';

  if (addressParts.length >= 3) {
    city = addressParts[1];
    stateAbbr = (addressParts[2] || '').replace(/\d{5}(-\d{4})?/, '').trim();
  } else if (addressParts.length === 2) {
    city = addressParts[1];
  }

  const streetWords = (addressParts[0] || '').replace(/^\d+\s*/, '').trim();
  if (streetWords.length > 3) neighborhood = streetWords;

  const seed = Math.abs(hashCode(address));
  const seeded = (min: number, max: number) => min + (seed % (max - min + 1));
  const seededF = (min: number, max: number, decimals: number = 1) => {
    const raw = min + ((seed % 10000) / 10000) * (max - min);
    return Number(raw.toFixed(decimals));
  };

  const medianPrice = seeded(800000, 6000000);
  const appreciationRate = seededF(3.5, 14.0);
  const avgDaysOnMarket = seeded(12, 65);
  const pricePerSqFt = seeded(350, 2200);
  const safetyScore = seeded(78, 98);
  const medianAge = seeded(32, 52);
  const medianIncome = seeded(75000, 250000);
  const ownerOccupied = seeded(40, 85);
  const population = seeded(18000, 350000);
  const transitScore = seeded(30, 95);
  const walkScore = seeded(50, 98);
  const bikeScore = seeded(35, 90);

  const schoolTypes = ['Public', 'Private', 'Charter', 'Magnet'];
  const schoolSuffixes = ['Elementary', 'Academy', 'Preparatory', 'High School', 'Middle School'];
  const stationPrefixes = ['Main St &', 'Central', 'Downtown', 'Park Ave &', 'Harbor'];
  const inventoryLevels = ['Low', 'Balanced', 'Tight', 'Very Low'];
  const crimeRates = ['Very Low', 'Low', 'Very Low', 'Low'];
  const vibes = [
    `Prestigious enclave with tree-lined streets, manicured estates, and a strong sense of community. Known for top-rated schools and exclusivity.`,
    `Upscale residential neighborhood balancing urban convenience with suburban tranquility. Excellent dining, boutique shopping, and cultural scene.`,
    `Highly desirable area with a mix of modern architecture and classic charm. Walkable streets, active outdoor lifestyle, and premium amenities.`,
    `Affluent community surrounded by natural beauty. Private, secure, and serene — ideal for discerning buyers seeking long-term value.`,
  ];

  const currentYear = new Date().getFullYear();
  const priceHistory = [];
  for (let y = currentYear - 4; y <= currentYear; y++) {
    const factor = 1 - ((currentYear - y) * (appreciationRate / 100));
    priceHistory.push({
      date: new Date(`${y}-01-01`),
      price: Math.floor(price * Math.max(0.6, factor)),
    });
  }

  const marketData = {
    neighborhood,
    city,
    neighborhoodVibe: vibes[seed % vibes.length],
    demographics: {
      population: population.toLocaleString('en-US'),
      medianAge,
      medianIncome,
      ownerOccupied,
    },
    schools: [
      { name: `${city} ${schoolSuffixes[seed % schoolSuffixes.length]}`, rating: seeded(7, 10), type: schoolTypes[seed % schoolTypes.length], distance: `${seededF(0.3, 2.5)} miles` },
      { name: `${neighborhood.split(' ')[0]} ${schoolSuffixes[(seed + 2) % schoolSuffixes.length]}`, rating: seeded(6, 10), type: schoolTypes[(seed + 1) % schoolTypes.length], distance: `${seededF(0.5, 4.0)} miles` },
    ],
    transportation: {
      transitScore,
      walkScore,
      bikeScore,
      nearbyStations: [
        `${stationPrefixes[seed % stationPrefixes.length]} ${city.split(' ')[0]}`,
        `${stationPrefixes[(seed + 3) % stationPrefixes.length]} ${neighborhood.split(' ')[0]}`,
      ],
    },
    safety: {
      crimeRate: crimeRates[seed % crimeRates.length],
      safetyScore,
    },
    marketTrends: {
      medianPrice,
      avgDaysOnMarket,
      pricePerSqFt,
      inventoryLevel: inventoryLevels[seed % inventoryLevels.length],
      appreciationRate,
    },
    attractions: [`${city} Country Club`, `${neighborhood.split(' ')[0]} Park`, 'Gourmet Market District'],
    localPolicies: ['Upcoming zoning review for accessory dwelling units', 'Short-term rental registration required'],
    zoningInfo: `Single-family residential, low-density (${stateAbbr || 'R-1'})`,
    economicOutlook: `Strong demand driven by local employment growth and limited premium inventory in ${city}. Steady appreciation expected over the next 5–10 years.`,
    priceHistory,
  };

  const investmentAnalysis = {
    currentValue: price,
    projectedValue5Year: Math.floor(price * Math.pow(1 + appreciationRate / 100, 5) * 0.85),
    projectedValue10Year: Math.floor(price * Math.pow(1 + appreciationRate / 100, 10) * 0.8),
    capRate: seededF(2.5, 6.0),
    roiProjection: seededF(3.0, 8.0),
    scenarios: [
      { name: 'Conservative', downPayment: Math.floor(price * 0.3), loanTerm: 30, interestRate: 6.5, monthlyPayment: 0, totalCost: 0, equity5Year: Math.floor(price * 0.25), marketValue5Year: Math.floor(price * 1.20) }
    ],
  };

  return { marketData, investmentAnalysis };
}
