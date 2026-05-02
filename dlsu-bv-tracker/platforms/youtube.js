const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(new Error('Invalid JSON from YouTube')); } });
    }).on('error', reject);
  });
}

async function fetchYouTube() {
  const { YT_API_KEY, YT_CHANNEL_ID } = process.env;
  if (!YT_API_KEY || !YT_CHANNEL_ID) throw new Error('Missing YT_API_KEY or YT_CHANNEL_ID — not configured');

  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`;
  const data = await get(url);

  if (data.error) throw new Error(`YouTube API: ${data.error.message}`);
  if (!data.items?.length) throw new Error(`YouTube channel not found: ${YT_CHANNEL_ID}`);

  const ch = data.items[0];
  const stats = ch.statistics;
  const subscribers = stats.hiddenSubscriberCount ? null : parseInt(stats.subscriberCount, 10);

  return {
    name: ch.snippet.title,
    handle: ch.snippet.customUrl ?? null,
    followers: subscribers,
    subscriberCountHidden: !!stats.hiddenSubscriberCount,
    totalViews: parseInt(stats.viewCount, 10),
    videoCount: parseInt(stats.videoCount, 10),
    // watchHours not available via public API — merged from manual override in server.js
    monetizationThresholds: {
      yppTier1Subs: subscribers !== null && subscribers >= 500,
      yppFullSubs: subscribers !== null && subscribers >= 1000,
    },
  };
}

module.exports = { fetchYouTube };
