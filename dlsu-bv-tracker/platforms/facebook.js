const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(new Error('Invalid JSON from Facebook')); } });
    }).on('error', reject);
  });
}

async function fetchFacebook() {
  const { FB_PAGE_ID, FB_ACCESS_TOKEN } = process.env;
  if (!FB_PAGE_ID || !FB_ACCESS_TOKEN) throw new Error('Missing FB_PAGE_ID or FB_ACCESS_TOKEN — not configured');

  const url = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}?fields=name,fan_count,followers_count&access_token=${FB_ACCESS_TOKEN}`;
  const data = await get(url);

  if (data.error) throw new Error(`Facebook API: ${data.error.message}`);

  const followers = data.followers_count ?? data.fan_count ?? 0;
  return {
    name: data.name,
    followers,
    fans: data.fan_count ?? 0,
    monetizationThresholds: {
      starsEligible: followers >= 500,
      instreamAdsEligible: followers >= 10000,
    },
  };
}

module.exports = { fetchFacebook };
