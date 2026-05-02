require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { fetchFacebook } = require('./platforms/facebook');
const { fetchYouTube } = require('./platforms/youtube');
const { fetchTikTok } = require('./platforms/tiktok');
const { loadHistory, saveSnapshot, loadLatest, saveManualOverride, loadManualOverrides } = require('./storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/stats ────────────────────────────────────────────────────────────
// Fetches live data from all platforms. Falls back to last snapshot if a
// platform call fails. If no token is configured, returns a "not_configured"
// status so the frontend can show the setup prompt.
app.get('/api/stats', async (req, res) => {
  const overrides = await loadManualOverrides();

  const results = await Promise.allSettled([
    fetchFacebook(),
    fetchYouTube(),
    fetchTikTok(),
  ]);

  const platforms = ['facebook', 'youtube', 'tiktok'];
  const stats = {};

  results.forEach((r, i) => {
    const key = platforms[i];
    if (r.status === 'fulfilled') {
      stats[key] = { ...r.value, status: 'live', error: null };
    } else {
      const msg = r.reason?.message || 'Unknown error';
      const isNotConfigured = msg.includes('Missing') || msg.includes('not configured');
      stats[key] = {
        status: isNotConfigured ? 'not_configured' : 'error',
        error: msg,
        followers: overrides[key]?.followers ?? null,
        monetization: overrides[key]?.monetization ?? 'Not monetized',
      };
    }
  });

  // Merge manual watch hours for YouTube (API can't provide this)
  if (stats.youtube && overrides.youtube?.watchHours != null) {
    stats.youtube.watchHours = overrides.youtube.watchHours;
  }

  const snapshot = { timestamp: new Date().toISOString(), ...stats };

  // Only persist snapshot if at least one platform returned live data
  const hasLive = Object.values(stats).some(s => s.status === 'live');
  if (hasLive) await saveSnapshot(snapshot);

  res.json(snapshot);
});

// ── GET /api/history ──────────────────────────────────────────────────────────
app.get('/api/history', async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  res.json(await loadHistory(days));
});

// ── GET /api/latest ───────────────────────────────────────────────────────────
app.get('/api/latest', async (req, res) => {
  res.json(await loadLatest());
});

// ── POST /api/manual ──────────────────────────────────────────────────────────
// Accepts manual overrides for followers / monetization / watch hours.
// Used as fallback when a platform token isn't configured yet (e.g. TikTok
// during app review).
app.post('/api/manual', async (req, res) => {
  const { platform, followers, prevFollowers, monthlyViews, watchHours, monetization } = req.body;
  const allowed = ['facebook', 'youtube', 'tiktok'];
  if (!allowed.includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }
  await saveManualOverride(platform, { followers, prevFollowers, monthlyViews, watchHours, monetization });
  res.json({ ok: true });
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Fallback: serve frontend ──────────────────────────────────────────────────
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`DLSU BV Tracker → http://localhost:${PORT}`));
