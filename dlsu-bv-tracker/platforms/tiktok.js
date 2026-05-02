const https = require('https');

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const s = JSON.stringify(body);
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s), ...headers },
    }, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { reject(new Error('Invalid JSON from TikTok')); } });
    });
    req.on('error', reject);
    req.write(s);
    req.end();
  });
}

async function fetchTikTok() {
  const { TIKTOK_ACCESS_TOKEN } = process.env;
  if (!TIKTOK_ACCESS_TOKEN) throw new Error('Missing TIKTOK_ACCESS_TOKEN — not configured');

  const data = await post(
    'https://open.tiktokapis.com/v2/user/info/',
    { fields: ['display_name', 'follower_count', 'video_count', 'likes_count'] },
    { Authorization: `Bearer ${TIKTOK_ACCESS_TOKEN}` }
  );

  if (data.error?.code && data.error.code !== 'ok') {
    throw new Error(`TikTok API: ${data.error.message}`);
  }

  const user = data.data?.user;
  if (!user) throw new Error('TikTok API returned no user data');

  const followers = user.follower_count ?? 0;
  return {
    name: user.display_name,
    followers,
    videoCount: user.video_count ?? null,
    totalLikes: user.likes_count ?? null,
    monetizationThresholds: {
      liveAccessEligible: followers >= 1000,
      creatorFundEligible: followers >= 10000,
    },
  };
}

module.exports = { fetchTikTok };
