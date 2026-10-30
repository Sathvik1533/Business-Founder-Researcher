# 🏛️ Architecture & System Design — Hyderabad Business Radar

> **Codename:** `biz-radar-hyd`  
> **Target:** Micro, Small & Medium Enterprises (MSMEs) launching across Hyderabad  
> **Core Principle:** Zero-cost, high-velocity discovery, decoupled architecture

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. EXTRACTION LAYER (CRON)                         │
│                           [Runs Every 8 Hours]                              │
│                                                                             │
│   ┌────────────────────┐   ┌────────────────────┐   ┌───────────────────┐   │
│   │ OpenStreetMap (OSM)│   │  Google Maps Grids │   │ Instagram Scanner │   │
│   │ Overpass API (Free)│   │  Places API/gosom  │   │ Hashtag & Bios    │   │
│   └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬─────────┘   │
└─────────────┼────────────────────────┼────────────────────────┼─────────────┘
              └────────────────────────┼────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      2. IDEMPOTENT DELTA ENGINE                             │
│                                                                             │
│   - Check if (source, source_id) exists in `business_sources`                │
│   - Filter: Exclude duplicates                                              │
│   - Pass ONLY net-new businesses to the AI enrichment layer                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      3. AI ENRICHMENT (GROK API)                            │
│                                                                             │
│   - Phone, WhatsApp, and social handle extraction                           │
│   - Category normalization (Beverage, Fashion, Wellness, etc.)              │
│   - Lead Opportunity Scoring (0 - 100)                                      │
│   - 2-line strategic outreach brief                                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     4. PERSISTENCE LAYER (SUPABASE)                         │
│                                                                             │
│   - `businesses` table with PostGIS geometry & indexes                      │
│   - `scrape_runs` log table                                                 │
│   - Supabase Realtime WebSocket broadcast                                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     5. PRESENTATION LAYER (NEXT.JS 14)                      │
│                                                                             │
│   - MapLibre GL GPU-rendered map with clustering & pin styling              │
│   - Multi-factor filtering: Area (Kokapet, etc.), Recency (<24h), Category  │
│   - Direct outreach actions: tel: links, WhatsApp chat, CRM status tracker  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core System Design Patterns

### A. Idempotent Delta Tracking
In a scheduled discovery system, running a scraper twice should **never** produce duplicate records or inflate counts.
- **Natural Composite Key:** `(source, source_id)`
- When OSM produces node `9823412` or Google produces place ID `ChIJ...`, the delta engine checks against `business_sources`.
- If found, it skips immediately. If not found, it inserts the record and logs the source reference.

### B. Decoupled Read and Write Paths
- **Scrapers:** Write-heavy background workers running on GitHub Actions or cron. If a scraper is blocked or hits rate limits, the client-facing radar remains 100% unaffected.
- **Web Dashboard:** Read-heavy application served by Vercel and querying Supabase. Reads are fast, cached, and independent of scraper uptime.

### C. Cost-Optimized AI Pipeline
- Running an LLM over thousands of existing records every 8 hours is expensive.
- Our architecture ensures **Grok AI is invoked exclusively for newly discovered records (deltas)**.
- For 10–20 new businesses per day in Hyderabad, Grok API consumption is less than \$0.05/month.

### D. PostGIS Geospatial Queries
- Rather than calculating Euclidean distances across all rows in Python or JavaScript, the database uses PostGIS spatial indexing (`GIST`).
- Bounding-box queries for areas like Kokapet or Gachibowli execute in sub-millisecond database queries.
