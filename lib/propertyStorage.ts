import fs from "fs";
import path from "path";
import { Property } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** Read all properties from disk */
export function readProperties(): Property[] {
  ensureDataDir();
  if (!fs.existsSync(PROPERTIES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

/** Write all properties to disk */
function writeProperties(properties: Property[]) {
  ensureDataDir();
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
}

/** Write all properties to disk (public, for bulk updates) */
export function writePropertiesBulk(properties: Property[]) {
  writeProperties(properties);
}

/** Add a property and persist */
export function saveProperty(property: Property): Property {
  const properties = readProperties();
  // Replace if same id exists, otherwise push
  const idx = properties.findIndex((p) => p.id === property.id);
  if (idx !== -1) {
    properties[idx] = property;
  } else {
    properties.push(property);
  }
  writeProperties(properties);
  return property;
}

/** Delete a property by id */
export function deleteProperty(id: string): boolean {
  const properties = readProperties();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  properties.splice(idx, 1);
  writeProperties(properties);
  return true;
}

/** Find a property by id */
export function findStoredPropertyById(id: string): Property | undefined {
  return readProperties().find((p) => p.id === id);
}

/** Update a property (partial merge) */
export function updateProperty(id: string, updates: Partial<Property>): Property | null {
  const properties = readProperties();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  properties[idx] = { ...properties[idx], ...updates };
  writeProperties(properties);
  return properties[idx];
}
