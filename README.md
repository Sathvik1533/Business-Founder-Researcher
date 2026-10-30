# 🗺️ Business Founder / Researcher — Hyderabad Business Radar

> **Codename:** `biz-radar-hyd`  
> An automated intelligence radar that discovers newly launched MSME businesses across Hyderabad every 8 hours — before they have websites or agency partners.

## Stack
- **Frontend:** Next.js 14 + MapLibre GL JS + Tailwind CSS → Vercel
- **Database:** Supabase (PostgreSQL + Realtime)
- **Agents:** Python crawlers → GitHub Actions (8-hour cron)
- **AI Enrichment:** Grok API (xAI) — OpenAI-compatible
- **Maps:** MapLibre GL JS + CARTO free tiles (3 options available)
- **Data Sources:** Google Maps Places API · Instagram (instaloader) · OpenStreetMap/Overpass API

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/Business-Founder-Researcher
cd Business-Founder-Researcher

# 2. Install frontend dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.

# 4. Run migrations
npx supabase db push

# 5. Start dev server
npm run dev

# 6. (Optional) Run an agent manually
cd agents && pip install -r requirements.txt
python osm_agent.py  # fastest, zero API cost
```

## Architecture
See [tasks/prd-business-radar.md](./tasks/prd-business-radar.md) for full PRD and architecture diagram.

## Contributors
- Karthik Battiporlu — contributions welcome!
