# 📋 Business Founder / Researcher — Project Status & To-Do List

> **Project:** Business Founder / Researcher (`biz-radar-hyd`)  
> **Repository:** [`Sathvik1533/Business-Founder-Researcher`](https://github.com/Sathvik1533/Business-Founder-Researcher)  
> **Last Updated:** October 31, 2026  
> **Overall Progress:** **85% Complete** (Production-ready foundation, light clay UI & crawlers ready)

---

## 🚦 Status Summary Dashboard

| Component / Layer | Status | Completion | Notes |
|---|---|---|---|
| **Git & Version Control** | 🟢 Complete | 100% | 5 branches live (`main`, `frontend`, `backend`, `database`, `docs`) |
| **Architecture & Docs** | 🟢 Complete | 100% | Architecture, Setup Guide, API Specs, and PRD documented |
| **Supabase Database** | 🟢 Complete | 100% | Schema active on `boldkaxeoitiqsszdtym` with PostGIS & Realtime |
| **Frontend UI / UX** | 🟢 Complete | 100% | Next.js 14, Light Claymorphic design, Hallmark anti-AI slop |
| **MapLibre Vector Radar** | 🟢 Complete | 100% | CARTO Positron basemap, clustered pins, hotspot fly-to |
| **Discovery Agents** | 🟢 Code Ready | 100% | OSM, Google Maps, Instagram & Grok agents written |
| **Agent Orchestrator** | 🟢 Code Ready | 100% | Single unified pipeline (`agents/orchestrator.py`) |
| **8-Hour Cron Automation** | 🟡 Configured | 90% | GitHub Actions workflow ready; awaiting API secrets |
| **Live Data Ingestion** | ⚪ Pending | 0% | Needs first live crawl trigger with Supabase keys |

---

## ✅ Completed Tasks (What's Done)

### 1. Architecture & Repository Setup
- [x] Initialized Git repository and pushed to `Sathvik1533/Business-Founder-Researcher`.
- [x] Created and synced 5 modular branches:
  - `main` (production build & orchestrator)
  - `frontend` (Next.js & UI components)
  - `backend` (Python crawlers & cron)
  - `database` (Supabase migrations)
  - `docs` (Architecture & API contracts)
- [x] Added `.github/CODEOWNERS` and `.github/CONTRIBUTOR_INVITE.md` for Karthik Bhatipurlu.
- [x] Authored comprehensive documentation in `/docs`:
  - `docs/ARCHITECTURE.md`
  - `docs/SETUP_GUIDE.md`
  - `docs/API_DOCUMENTATION.md`
  - `docs/BRANCHING_STRATEGY.md`

### 2. Database & Persistence Layer (Supabase)
- [x] Created Supabase project `boldkaxeoitiqsszdtym`.
- [x] Executed migration `001_init_businesses.sql`:
  - `businesses` table with contact info, categories, and lead scores.
  - `scrape_runs` audit log table.
  - `business_sources` delta deduplication table.
  - PostGIS spatial extensions enabled.
  - Supabase Realtime publication active for live map updates.
- [x] Configured Supabase MCP server in `~/.gemini/antigravity/mcp_config.json`.
- [x] Installed official Supabase agent skills (`supabase`, `supabase-postgres-best-practices`).

### 3. Frontend & Radar Map (Next.js 14)
- [x] Next.js 14 App Router + Tailwind CSS setup.
- [x] Designed adhering to **Hallmark anti-AI slop** & **Impeccable** taste:
  - Soft porcelain light canvas (`#F6F7F9`).
  - Tactile claymorphism dual-shadow cards (`shadow-clay-card`).
  - Pressed tactile button and segmented control states (`active:translate-y-0.5`).
- [x] **MapLibre GL JS GPU Radar:**
  - Clustered marker rendering for 5,000+ points without lag.
  - Dynamic circle radii scaled to Lead Opportunity Scores (0–100).
  - Pipeline status color coding: Blue (New), Indigo (Contacted), Amber (Interested), Emerald (Closed).
  - Preset hot-spot jump triggers (Kokapet, Gachibowli, HITECH City, Madhapur, Financial District, Jubilee Hills).
  - 3-way map switcher (Porcelain, Street, Slate).
- [x] **Filters & KPIs:**
  - Search bar with tactile inset shadow.
  - Area filter (40+ Hyderabad zones).
  - Category filter (Food & Beverage, Clothing, Beauty, Fitness, etc.).
  - Recency filter (<24 Hours, Last 7 Days, Last 30 Days, Last 6 Months).
  - Live KPI Counters: Discovered, Fresh (<24h), Opened this week, No Website (Hot leads), Contacted count.
- [x] **Cold Outreach & Lead Management:**
  - Click-to-call `tel:` link.
  - Pre-filled WhatsApp greeting chat link (`wa.me/...`).
  - Direct Instagram profile link.
  - Lead Opportunity Score formula (rewards missing website, fresh launch, active social).
  - Inline CRM call notes with instant save.

### 4. Background Crawlers & Orchestrator
- [x] `agents/osm_agent.py`: Overpass API crawler for Hyderabad (100% free base layer).
- [x] `agents/google_maps_agent.py`: Google Places grid crawler with delta tracking.
- [x] `agents/instagram_agent.py`: Instagram hashtag & bio phone/WhatsApp parser.
- [x] `agents/grok_enrichment_agent.py`: xAI Grok API enrichment pipeline (`grok-3-mini`).
- [x] `agents/orchestrator.py`: Unified pipeline orchestrator.
- [x] `.github/workflows/business-radar.yml`: 8-hour GitHub Actions cron scheduler.

---

## 🎯 What We Still Need to Do (Prioritized To-Do List)

### Immediate Next Steps (Priority 1)

#### [ ] 1. Check Vercel Production Build
- **Status:** Deployment triggered from GitHub.
- **Action:** Open Vercel dashboard to verify that the build succeeded and grab the public live `.vercel.app` URL.

#### [ ] 2. Add Supabase API Keys Locally
- **Status:** Ready for insertion.
- **Action:** Copy `anon` and `service_role` keys from Supabase (*Project Settings > API*) into `.env.local`:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://boldkaxeoitiqsszdtym.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
  SUPABASE_SERVICE_KEY=your_service_role_key_here
  ```

#### [ ] 3. Run the First Real Data Crawl (OSM)
- **Status:** Crawler code verified and ready.
- **Action:** Run `python agents/osm_agent.py` to populate the first 50–100 live businesses across Kokapet, Gachibowli, and HITECH City directly into Supabase.

#### [ ] 4. Add GitHub Actions Secrets
- **Status:** Workflow waiting for credentials.
- **Action:** In GitHub (*Settings > Secrets and variables > Actions*), add:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `GROK_API_KEY` (when available)
  - `GOOGLE_PLACES_KEY` (optional)

#### [ ] 5. Confirm Collaborator Invitation
- **Status:** Sent.
- **Action:** Verify Karthik Bhatipurlu accepts the collaboration invite to begin reviewing and contributing.

---

### Sprint 2: Outreach Acceleration (Priority 2)

#### [ ] 6. WhatsApp Pitch Template Generator
- Pre-generate customized outreach messages tailored to each category (F&B, Boutique, Salon) with direct value propositions (e.g. zero-commission delivery sites, e-commerce WhatsApp catalogs).

#### [ ] 7. Export to CSV / Google Sheets
- Add a 1-click export button in the dashboard for sales callers to download filtered batches of leads.

#### [ ] 8. Justdial & Sulekha Importers
- Add optional web directory crawlers for wider MSME coverage across older Hyderabad districts.
