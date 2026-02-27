import fs from "fs";
import path from "path";
import { Property } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

// ─── GitHub sync config ───
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "Jules-Barthomeuf/Orthanc";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_FILE_PATH = "data/properties.json";

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// ─── GitHub API auto-sync ───
// Pushes data/properties.json to GitHub after every write, so deploys always have latest data.

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

async function syncToGitHub() {
  if (!GITHUB_TOKEN) {
    console.warn("[propertyStorage] GITHUB_TOKEN not set — skipping GitHub sync. Properties will be lost on redeploy!");
    return;
  }

  try {
    const content = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    const base64Content = Buffer.from(content).toString("base64");

    // Get current file SHA (required for update)
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // Commit the updated file
    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `[skip render] Update properties.json (${new Date().toISOString()})`,
          content: base64Content,
          branch: GITHUB_BRANCH,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (putRes.ok) {
      console.log("[propertyStorage] ✓ Synced properties.json to GitHub");
    } else {
      const err = await putRes.text();
      console.error("[propertyStorage] ✗ GitHub sync failed:", putRes.status, err);
    }
  } catch (e) {
    console.error("[propertyStorage] ✗ GitHub sync error:", e);
  }
}

/** Debounced sync to avoid too many commits in quick succession */
function scheduleSyncToGitHub() {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncToGitHub().catch(console.error);
  }, 5000); // Wait 5s after last write before syncing
}

/** Read all properties */
export async function readProperties(): Promise<Property[]> {
  ensureDataDir();
  if (!fs.existsSync(PROPERTIES_FILE)) return [];
  try {
    const raw = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

/** Create an automatic backup before writing (local mode only) */
function createBackup() {
  try {
    if (!fs.existsSync(PROPERTIES_FILE)) return;
    ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `properties-${timestamp}.json`);
    fs.copyFileSync(PROPERTIES_FILE, backupFile);

    // Keep only last 20 backups to avoid filling disk
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("properties-") && f.endsWith(".json"))
      .sort();
    while (backups.length > 20) {
      const oldest = backups.shift()!;
      fs.unlinkSync(path.join(BACKUP_DIR, oldest));
    }
  } catch (e) {
    console.error("[propertyStorage] Backup failed:", e);
  }
}

/** Write all properties to disk + auto-sync to GitHub */
function writeProperties(properties: Property[]) {
  ensureDataDir();
  createBackup();
  fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), "utf-8");
  scheduleSyncToGitHub(); // Auto-push to GitHub so deploys always have latest data
}

/** Bulk write properties — MERGES with existing data, never overwrites */
export async function writePropertiesBulk(properties: Property[]) {
  const existing = readPropertiesSyncFallback();
  const existingMap = new Map(existing.map((p) => [p.id, p]));
  for (const p of properties) {
    existingMap.set(p.id, p);
  }
  writeProperties(Array.from(existingMap.values()));
}

/** Add or update a property and persist */
export async function saveProperty(property: Property): Promise<Property> {
  const properties = readPropertiesSyncFallback();
  const idx = properties.findIndex((p) => p.id === property.id);
  if (idx !== -1) properties[idx] = property; else properties.push(property);
  writeProperties(properties);
  return property;
}

function readPropertiesSyncFallback(): Property[] {
  ensureDataDir();
  if (!fs.existsSync(PROPERTIES_FILE)) return [];
  try {
    const raw = fs.readFileSync(PROPERTIES_FILE, "utf-8");
    return JSON.parse(raw) as Property[];
  } catch {
    return [];
  }
}

/** Delete a property by id — locked properties cannot be deleted */
export async function deleteProperty(id: string): Promise<boolean | "locked"> {
  const existing = await findStoredPropertyById(id);
  if (!existing) return false;
  if (existing.locked) return "locked";

  const properties = readPropertiesSyncFallback();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  properties.splice(idx, 1);
  writeProperties(properties);
  return true;
}

/** Find a property by id */
export async function findStoredPropertyById(id: string): Promise<Property | undefined> {
  return readPropertiesSyncFallback().find((p) => p.id === id);
}

/** Update a property (partial merge) */
export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const properties = readPropertiesSyncFallback();
  const idx = properties.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  properties[idx] = { ...properties[idx], ...updates };
  writeProperties(properties);
  return properties[idx];
}

/** Lock or unlock ALL properties in a single write (memory-efficient) */
export async function lockAllProperties(locked: boolean): Promise<number> {
  const properties = readPropertiesSyncFallback();
  let count = 0;
  for (let i = 0; i < properties.length; i++) {
    if (properties[i].locked !== locked) {
      properties[i].locked = locked;
      count++;
    }
  }
  if (count > 0) writeProperties(properties);
  return count;
}

/** Export all properties as a JSON backup (for download) */
export async function exportProperties(): Promise<{ count: number; data: Property[]; exportedAt: string }> {
  const properties = await readProperties();
  return {
    count: properties.length,
    data: properties,
    exportedAt: new Date().toISOString(),
  };
}

/** Get storage info for diagnostics */
export function getStorageInfo() {
  return {
    provider: GITHUB_TOKEN ? "github-sync" : "local-only",
    filePath: PROPERTIES_FILE,
    fileExists: fs.existsSync(PROPERTIES_FILE),
    backupDir: BACKUP_DIR,
    backupCount: fs.existsSync(BACKUP_DIR)
      ? fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).length
      : 0,
    githubRepo: GITHUB_REPO,
    githubSyncEnabled: !!GITHUB_TOKEN,
  };
}