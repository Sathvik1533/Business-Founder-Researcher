# 🚀 Setup Guide — Hyderabad Business Radar

Follow these instructions to run the application locally or deploy it to production.

---

## 1. Prerequisites

- **Node.js:** v18 or higher (v20+ recommended)
- **Python:** 3.10 or higher
- **Supabase Account (Free Tier):** [supabase.com](https://supabase.com)
- **xAI Grok API Key (Optional):** [console.x.ai](https://console.x.ai)

---

## 2. Local Dashboard Setup (Next.js)

```bash
# 1. Navigate to the repository
cd /Users/k.sathvik/.gemini/antigravity/scratch/Business-Founder-Researcher

# 2. Copy the environment template
cp .env.example .env.local

# 3. Install frontend dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dashboard will load with built-in realistic mock data for Hyderabad commercial corridors (Kokapet, Gachibowli, Madhapur, etc.) even if your Supabase keys are not yet configured!

---

## 3. Database Setup (Supabase)

1. Create a new free project in Supabase named `Business-Radar`.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of [`supabase/migrations/001_init_businesses.sql`](../supabase/migrations/001_init_businesses.sql) and click **Run**.
4. Retrieve your **Project URL** and **anon public key** from *Settings > API*.
5. Paste them into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_KEY=eyJhbGciOi...
   ```

---

## 4. Running Discovery Agents Manually

The crawlers are located in the `agents/` folder:

```bash
cd agents
pip install -r requirements.txt

# Run the OpenStreetMap crawler (Free, 0 cost, no keys required):
python osm_agent.py

# Run the unified orchestrator (runs all 4 stages sequentially):
python orchestrator.py
```

---

## 5. Automated 8-Hour Cron (GitHub Actions)

Once you push the repository to GitHub:
1. Navigate to your repository on GitHub.
2. Go to **Settings > Secrets and variables > Actions**.
3. Add the following repository secrets:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase Service Role Key
   - `GROK_API_KEY`: Your xAI Grok API key (when available)
   - `GOOGLE_PLACES_KEY`: Your Google Maps Places key (optional)
4. GitHub Actions will automatically execute the crawler workflow (`.github/workflows/business-radar.yml`) every 8 hours at `00:00`, `08:00`, and `16:00` UTC.
