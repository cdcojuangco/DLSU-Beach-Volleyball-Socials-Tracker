const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'snapshots.json');
const OVERRIDES_FILE = path.join(DATA_DIR, 'overrides.json');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function saveSnapshot(snapshot) {
  const list = await readJson(SNAPSHOTS_FILE, []);
  list.push(snapshot);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);
  await writeJson(SNAPSHOTS_FILE, list.filter(s => new Date(s.timestamp) >= cutoff));
}

async function loadHistory(days = 30) {
  const list = await readJson(SNAPSHOTS_FILE, []);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return list.filter(s => new Date(s.timestamp) >= cutoff);
}

async function loadLatest() {
  const list = await readJson(SNAPSHOTS_FILE, []);
  return list.length ? list[list.length - 1] : null;
}

async function loadManualOverrides() {
  return readJson(OVERRIDES_FILE, {});
}

async function saveManualOverride(platform, data) {
  const overrides = await loadManualOverrides();
  overrides[platform] = { ...overrides[platform], ...data, updatedAt: new Date().toISOString() };
  await writeJson(OVERRIDES_FILE, overrides);
}

module.exports = { saveSnapshot, loadHistory, loadLatest, loadManualOverrides, saveManualOverride };
