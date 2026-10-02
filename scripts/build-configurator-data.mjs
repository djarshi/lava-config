#!/usr/bin/env node
// Build step: reads configurator-input/ and emits two JSON files that map
// the categories + tweaks into the configurator.
//
//   src/app/configurator-data/tweaks.json     — tweaks with info, authors, versions, raw lua
//   src/app/configurator-data/categories.json — categories with title, info, choices markdown, parsed options
//
// Hard-fails on any structural problem (missing tweak ref, empty category,
// invalid authors JSON, duplicate versions, ...).

import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('../configurator-input/', import.meta.url);
const OUT_DIR = new URL('../src/app/configurator-data/', import.meta.url);

// ---------- helpers ----------

function readText(p) {
  return readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

function seoFriendly(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// first line starting with `--` (single-line comment) — the in-game info line
function firstCommentLine(lua) {
  for (const line of lua.split('\n')) {
    const t = line.trim();
    if (t.startsWith('--')) return t;
  }
  return null;
}

// Parse a tweak lua filename and validate naming conventions:
//   - base name (a-z, 0-9, hyphens only; lowercase)
//   - base name must equal the folder name
//   - version suffix must be N.N or N.N.N (versionless file allowed -> "1.0")
function parseTweakFileName(fileName, folderName) {
  const base = fileName.replace(/\.lua$/, '');
  if (/[A-Z]/.test(base)) {
    fail(`tweak file "${fileName}" in "${folderName}/" must be lowercase (no uppercase letters)`);
  }
  if (base === folderName) return { version: '1.0' };
  const prefix = folderName + '-';
  if (!base.startsWith(prefix)) {
    fail(`tweak file "${fileName}" in "${folderName}/" must start with "${folderName}-" or equal the folder name "${folderName}"`);
  }
  const raw = base.slice(prefix.length);
  const m = raw.match(/^(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!m) {
    fail(`tweak file "${fileName}" in "${folderName}/" has invalid version "${raw}" (expected N.N or N.N.N, e.g. ${folderName}-1.0.lua)`);
  }
  return m[3] ? { version: `${m[1]}.${m[2]}.${m[3]}` } : { version: `${m[1]}.${m[2]}` };
}

function extractTweakRefs(effectLines) {
  const refs = [];
  for (const line of effectLines) {
    const m = line.match(/@tweak(defs|units)\s+([A-Za-z0-9_-]+)/);
    if (m) refs.push({ kind: 'tweak' + m[1], name: m[2] });
  }
  return refs;
}

// lightweight markdown parser tailored to the choices format:
//   # H1, ## H2 option, fenced code blocks = effect lines, prose = description
function parseChoices(md) {
  const lines = md.split('\n');
  let h1 = null;
  const options = [];
  let current = null;
  let inCode = false;
  let codeLines = [];

  for (const line of lines) {
    if (inCode) {
      if (line.trim().startsWith('```')) {
        inCode = false;
        if (current && codeLines.length) {
          current.effectLines = codeLines;
          current.tweakRefs = extractTweakRefs(codeLines);
        }
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (line.startsWith('# ')) {
      h1 = line.slice(2).trim();
    } else if (line.startsWith('## ')) {
      if (current) options.push(current);
      current = {
        title: line.slice(3).trim(),
        descriptionLines: [],
        effectLines: [],
        tweakRefs: [],
      };
    } else if (line.trim().startsWith('```')) {
      if (!current) continue; // code block before any option — ignore
      inCode = true;
      codeLines = [];
    } else if (current) {
      current.descriptionLines.push(line);
    }
  }
  if (current) options.push(current);

  for (const opt of options) {
    opt.slug = seoFriendly(opt.title);
    opt.description = opt.descriptionLines.join('\n').trim();
    delete opt.descriptionLines;
  }
  return { h1, options };
}

function fail(msg) {
  console.error(`\x1b[31m[build-configurator-data] FAIL\x1b[0m ${msg}`);
  process.exit(1);
}

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

// ---------- tweaks ----------

const tweaksDir = new URL('tweaks/', ROOT);
const tweakNames = readdirSync(tweaksDir)
  .filter((n) => isDir(new URL(`tweaks/${n}/`, ROOT)))
  .sort();

const tweaks = [];
const tweakNameSet = new Set();

for (const name of tweakNames) {
  if (!/^[a-z0-9-]+$/.test(name)) {
    fail(`tweak folder "${name}" must be lowercase with hyphens only (a-z, 0-9, "-")`);
  }
  tweakNameSet.add(name);
  const dir = new URL(`tweaks/${name}/`, ROOT);
  const infoPath = new URL('0-info.md', dir);
  const authorsPath = new URL('0-authors.json', dir);

  let info, authors;
  try { info = readText(infoPath); } catch { fail(`tweak "${name}" missing 0-info.md`); }
  try { authors = JSON.parse(readText(authorsPath)); }
  catch (e) { fail(`tweak "${name}" has invalid 0-authors.json: ${e.message}`); }
  if (!Array.isArray(authors.authors)) fail(`tweak "${name}" 0-authors.json missing "authors" array`);

  const luaFiles = readdirSync(dir).filter((f) => f.endsWith('.lua'));
  if (luaFiles.length === 0) fail(`tweak "${name}" has no .lua files`);

  const versions = [];
  const seenVersions = new Set();
  for (const file of luaFiles.sort()) {
    const lua = readText(new URL(file, dir));
    const { version } = parseTweakFileName(file, name);
    if (seenVersions.has(version)) {
      fail(`tweak "${name}" duplicate version "${version}" (from ${file})`);
    }
    seenVersions.add(version);
    versions.push({
      version,
      file,
      firstComment: firstCommentLine(lua),
      lua,
    });
  }

  tweaks.push({
    name,
    info,
    authors: authors.authors,
    versions,
  });
}

// ---------- categories ----------

const categoriesDir = new URL('categories/', ROOT);
const orderPath = new URL('categories/order', ROOT);
const orderRaw = readText(orderPath).trim();
const orderEntries = orderRaw.split(/\s+/).filter(Boolean).map((entry) => {
  const m = entry.match(/^([a-z0-9-]+):(left|right)$/);
  if (!m) fail(`categories/order entry "${entry}" must be "name:left" or "name:right"`);
  return { name: m[1], column: m[2] };
});
if (orderEntries.length === 0) fail('categories/order is empty');
const order = orderEntries.map((e) => e.name);
const columnByName = new Map(orderEntries.map((e) => [e.name, e.column]));

const categoryFolders = readdirSync(categoriesDir)
  .filter((n) => isDir(new URL(`${n}/`, categoriesDir)))
  .sort();

// every category folder must be in order, and vice versa
for (const name of categoryFolders) {
  if (!order.includes(name)) {
    fail(`category folder "${name}" not listed in categories/order`);
  }
}
for (const name of order) {
  if (!categoryFolders.includes(name)) {
    fail(`categories/order references "${name}" but no such category folder exists`);
  }
}
if (new Set(order).size !== order.length) {
  fail('categories/order contains duplicates');
}

const categories = [];
for (const name of order) {
  const dir = new URL(`${name}/`, categoriesDir);
  const choicesPath = new URL('0-choices.md', dir);
  const infoPath = new URL('0-info.md', dir);

  let choices, info;
  try { choices = readText(choicesPath); }
  catch { fail(`category "${name}" missing 0-choices.md`); }
  try { info = readText(infoPath); }
  catch { fail(`category "${name}" missing 0-info.md`); }

  // title from 0-info.md H1
  const infoH1 = info.split('\n').find((l) => l.startsWith('# '));
  if (!infoH1) fail(`category "${name}" 0-info.md has no H1 title`);
  const title = infoH1.slice(2).trim();

  const parsed = parseChoices(choices);
  if (parsed.options.length === 0) {
    fail(`category "${name}" 0-choices.md has no options (## headings)`);
  }

  // validate tweak refs exist
  for (const opt of parsed.options) {
    for (const ref of opt.tweakRefs) {
      if (!tweakNameSet.has(ref.name)) {
        fail(`category "${name}" option "${opt.title}" references unknown tweak "${ref.name}"`);
      }
    }
  }

  categories.push({
    name,
    title,
    column: columnByName.get(name),
    info,
    choices,          // raw markdown — for the '?' modal
    options: parsed.options.map((o) => ({
      slug: o.slug,
      title: o.title,
      description: o.description,
      effectLines: o.effectLines,
      tweakRefs: o.tweakRefs,
    })),
  });
}

// ---------- write ----------

mkdirSync(OUT_DIR, { recursive: true });

const tweaksOut = { tweaks };
const categoriesOut = {
  order,
  categories,
};

writeFileSync(new URL('tweaks.json', OUT_DIR), JSON.stringify(tweaksOut, null, 2) + '\n');
writeFileSync(new URL('categories.json', OUT_DIR), JSON.stringify(categoriesOut, null, 2) + '\n');

console.log(`\x1b[32m[build-configurator-data] OK\x1b[0m`);
console.log(`  tweaks:      ${tweaks.length}`);
console.log(`  categories:  ${categories.length} (order: ${order.join(', ')})`);
const totalVersions = tweaks.reduce((a, t) => a + t.versions.length, 0);
console.log(`  versions:    ${totalVersions}`);
console.log(`  -> src/app/configurator-data/tweaks.json`);
console.log(`  -> src/app/configurator-data/categories.json`);