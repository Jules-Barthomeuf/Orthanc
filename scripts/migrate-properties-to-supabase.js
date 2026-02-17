const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DATA_FILE = path.join(process.cwd(), 'data', 'properties.json');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_KEY must be set');
    process.exit(1);
  }

  const sb = createClient(url, key);

  if (!fs.existsSync(DATA_FILE)) {
    console.error('No properties.json found at', DATA_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  let properties = [];
  try {
    properties = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse properties.json', e);
    process.exit(1);
  }

  const rows = properties.map((p) => ({ id: p.id, data: p, created_at: p.createdAt || new Date() }));
  const { error } = await sb.from('properties').upsert(rows, { returning: 'minimal' });
  if (error) {
    console.error('Upsert error', error);
    process.exit(1);
  }

  console.log('Migrated', rows.length, 'properties to Supabase');
}

main().catch((e) => { console.error(e); process.exit(1); });
