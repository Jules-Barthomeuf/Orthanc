#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findFiles(dir, ext, results = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.next' || item === '.git') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) findFiles(full, ext, results);
    else if (item.endsWith(ext)) results.push(full);
  }
  return results;
}

const root = path.resolve(__dirname, '..');
const files = [...findFiles(root, '.tsx'), ...findFiles(root, '.css')];

let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // teal -> gold (all shades)
  content = content.replace(/teal-50/g, 'gold-50');
  content = content.replace(/teal-100/g, 'gold-100');
  content = content.replace(/teal-200/g, 'gold-200');
  content = content.replace(/teal-300/g, 'gold-300');
  content = content.replace(/teal-400/g, 'gold-400');
  content = content.replace(/teal-500/g, 'gold-500');
  content = content.replace(/teal-600/g, 'gold-600');
  content = content.replace(/teal-700/g, 'gold-700');
  content = content.replace(/teal-800/g, 'gold-800');
  content = content.replace(/teal-900/g, 'gold-900');

  // blue -> gold (for accent usage, not semantic like blue-400 info states)
  content = content.replace(/blue-400/g, 'gold-400');
  content = content.replace(/blue-500/g, 'gold-500');

  // "My Projects" -> "My Properties"  
  content = content.replace(/My Projects/g, 'My Properties');
  content = content.replace(/my-projects/g, 'my-properties');
  content = content.replace(/PROJECTS/g, 'PROPERTIES');
  content = content.replace(/"projects"/g, '"properties"');
  content = content.replace(/No projects/g, 'No properties');
  content = content.replace(/project\(s\)/g, 'property(ies)');

  // "project" in descriptive text (be careful - only specific patterns)
  content = content.replace(/Select a project/g, 'Select a property');
  content = content.replace(/project found/g, 'property found');
  content = content.replace(/Projects will appear/g, 'Properties will appear');
  content = content.replace(/projects in progress/g, 'properties in portfolio');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const count = (original.length - content.length === 0) ? 'modified' : 'modified';
    const rel = path.relative(root, file);
    console.log(`  ✓ ${rel}`);
    totalReplacements++;
  }
}

console.log(`\nDone! ${totalReplacements} files updated.`);
