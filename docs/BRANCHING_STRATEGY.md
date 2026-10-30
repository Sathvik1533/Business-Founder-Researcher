# 🌿 Git Branching Strategy & Workflow

This project is organized across modular branches so multiple team members can contribute without merge conflicts.

---

## 1. Branch Architecture

| Branch | Focus Area | Contents |
|---|---|---|
| **`main`** | Production release | Stable, fully integrated app + unified orchestrator |
| **`frontend`** | UI & User Experience | Next.js 14, MapLibre GL JS radar map, Tailwind styles |
| **`backend`** | Agents & Crawlers | Python crawlers (`osm`, `gmaps`, `instagram`, `grok`), GitHub Actions |
| **`database`** | Persistence & Data Model | Supabase SQL migrations, PostGIS indexes, Delta Engine logic |
| **`docs`** | Documentation | Architectural guides, setup steps, and API contracts |

---

## 2. Working with Branches Locally

You can switch between branches anytime without affecting other areas of the system:

```bash
# Switch to the frontend branch to work on map visuals or cards:
git checkout frontend

# Switch to the backend branch to tweak scraping logic or Grok prompts:
git checkout backend

# Switch to the database branch for SQL schema changes:
git checkout database

# Return to main:
git checkout main
```

---

## 3. How to Push All Branches to GitHub Once Logged In

Once you have completed your Chrome login refresh and authenticated the terminal via `gh auth login`, push all branches to your GitHub repository with one command:

```bash
cd /Users/k.sathvik/.gemini/antigravity/scratch/Business-Founder-Researcher

# Create the remote repository on your GitHub account
gh repo create "Business-Founder-Researcher" --public --source=. --remote=origin

# Push all branches (main, frontend, backend, database, docs) at once:
git push --all origin
```
