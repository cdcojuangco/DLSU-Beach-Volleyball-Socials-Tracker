# DLSU Beach Volleyball Social Tracker — Setup Guide

This guide takes you from zero to a live dashboard. Estimated time: 60–90 minutes.
You don't need a developer for these steps — just follow each section in order.

---

## Part 1 — Deploy to Railway (15 min)

Railway hosts your app for free (500 hrs/month on the free plan).

### Step 1 — Create a GitHub account (if you don't have one)
Go to https://github.com and sign up. Free account is fine.

### Step 2 — Upload the project to GitHub
1. Go to https://github.com/new
2. Name the repo: `dlsu-bv-tracker`
3. Keep it **Private**
4. Click **Create repository**
5. On your computer, unzip the `dlsu-bv-tracker` folder you received
6. Follow GitHub's instructions to upload the files (drag-and-drop works in the web UI)

### Step 3 — Deploy on Railway
1. Go to https://railway.app and sign up with your GitHub account
2. Click **New Project → Deploy from GitHub repo**
3. Select `dlsu-bv-tracker`
4. Railway will detect the Node.js app and deploy it automatically
5. Once deployed, click **Settings → Generate Domain** — this gives you a public URL like `https://dlsu-bv-tracker.up.railway.app`

Your dashboard is now live at that URL. It will show "Setup needed" on all three platforms until you add your API keys (next steps).

---

## Part 2 — Facebook API (20 min)

### What you need
- Admin access to the DLSU Beach Volleyball Facebook Page
- A Facebook account to create a developer app

### Steps
1. Go to https://developers.facebook.com
2. Click **My Apps → Create App**
3. Choose **Other**, then **Business** → give it any name (e.g. "DLSU BV Tracker")
4. In the left sidebar, click **Tools → Graph API Explorer**
5. In the top-right dropdown, select your app
6. In the second dropdown, select your **DLSU Beach Volleyball Page**
7. Under **Permissions**, add: `pages_read_engagement`
8. Click **Generate Access Token** and approve it
9. **Copy the token** — paste it somewhere safe for now

10. Find your **Page ID**:
    - Go to your Facebook Page
    - Click **About** in the left menu
    - Scroll to the bottom — you'll see **Page ID** (a long number)

11. Go to Railway → your project → **Variables tab**
12. Add two variables:
    - `FB_PAGE_ID` = (the number from step 10)
    - `FB_ACCESS_TOKEN` = (the token from step 9)
13. Railway will redeploy automatically. Refresh your dashboard — Facebook should now show a green LIVE badge.

> **Note on token expiry**: The token from Graph API Explorer expires in about 60 days.
> Before it expires, you'll need to regenerate it. For a permanent solution, ask a developer
> to set up a System User token in Meta Business Manager.

---

## Part 3 — YouTube API (15 min)

### What you need
- A Google account (your personal Gmail is fine)

### Steps
1. Go to https://console.cloud.google.com
2. Click **Select a project → New Project** → name it "DLSU BV Tracker" → Create
3. In the search bar at the top, type **YouTube Data API v3** → click it → click **Enable**
4. In the left menu, go to **APIs & Services → Credentials**
5. Click **Create Credentials → API Key**
6. Copy the API key

7. Find your **YouTube Channel ID**:
   - Go to https://studio.youtube.com
   - Click **Settings** (gear icon, bottom left)
   - Click **Channel → Advanced settings**
   - Copy the **Channel ID** (starts with `UC...`)

8. Go to Railway → Variables tab → add:
    - `YT_API_KEY` = (your API key)
    - `YT_CHANNEL_ID` = (the UC... channel ID)
9. Railway redeploys. YouTube should now show LIVE on the dashboard.

> **Note on watch hours**: The YouTube API does not expose watch hours to external apps.
> You'll need to log into YouTube Studio, check the watch hours manually, and enter them
> in the dashboard's "Manual override" panel at the bottom of the page.

---

## Part 4 — TikTok API (30 min + 2–5 day wait)

TikTok requires an app review before you can access follower data. Submit today and
use the manual override panel in the meantime.

### Steps
1. Go to https://developers.tiktok.com
2. Sign in with the TikTok account that manages the DLSU Beach Volleyball page
   (or any TikTok account — you just need a developer account)
3. Click **Manage Apps → Create App**
   - App name: DLSU BV Tracker
   - App description: Internal social media analytics dashboard for our sports team
   - Category: Analytics
4. Under **Products**, click **Add product → Login Kit**
5. Under **Redirect URI**, add: `https://dlsu-bv-tracker.up.railway.app/auth/tiktok/callback`
   (replace with your actual Railway URL)
6. Under **Scopes**, request: `user.info.basic`
7. Submit for review

### While waiting for review (use manual override)
- Open your tracker dashboard
- Scroll to the **Manual override** section at the bottom
- Enter your TikTok follower count manually
- Click **Save fallback data**

### After approval
Once TikTok approves your app (usually 2–5 business days):
1. You'll receive a Client Key and Client Secret
2. Add them to Railway Variables:
   - `TIKTOK_CLIENT_KEY` = your client key
   - `TIKTOK_CLIENT_SECRET` = your client secret
3. The page admin needs to click an authorization link once — contact me and I'll generate it for you

---

## Part 5 — Keeping tokens alive

| Platform | Token expires | Action needed |
|----------|--------------|---------------|
| Facebook | ~60 days | Regenerate token in Graph API Explorer |
| YouTube | Never | API key doesn't expire |
| TikTok | 24 hours (access token) | Automated refresh built in |

For Facebook long-term, a developer can set up a **System User token** that never expires. This is optional but recommended if you're running this for more than 2 months.

---

## Troubleshooting

**Dashboard shows "Error" instead of "Live"**
- Check that the env variable is spelled exactly right in Railway (no spaces, no quotes)
- Make sure the Railway deploy completed after you added the variable (check the Deployments tab)

**Facebook says "Invalid OAuth access token"**
- Your token has expired. Regenerate it in Graph API Explorer and update the Railway variable.

**YouTube says "Channel not found"**
- Double-check the Channel ID — it must start with `UC` and be copied exactly.

**TikTok still shows "Setup needed" after approval**
- The OAuth authorization step (the page admin clicking a link) still needs to be done.
  Contact your developer or email the address in your Railway project for next steps.

---

Questions? The setup guide was written for you — there's no question too basic.
