"""
Unified Radar Orchestrator.
Runs the discovery pipeline sequentially with fault isolation:
1. OpenStreetMap Discovery (Free base layer)
2. Google Maps Delta Discovery (Targeted commercial grids)
3. Instagram Profile & Hashtag Monitor
4. Grok AI Batch Enrichment (Enriches net-new businesses)
"""

import time
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("RadarOrchestrator")


def run_pipeline():
    start_time = time.time()
    log.info("=" * 60)
    log.info(f"🚀 Starting Hyderabad Business Radar Crawl — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info("=" * 60)

    # 1. OSM Agent
    try:
        log.info("\n--- [Step 1/4] Running OpenStreetMap Agent (Free base layer) ---")
        import osm_agent
        osm_agent.run()
    except Exception as e:
        log.error(f"❌ OSM agent encountered an issue: {e}", exc_info=False)

    # 2. Google Maps Agent
    try:
        log.info("\n--- [Step 2/4] Running Google Maps Grid Scanner ---")
        import google_maps_agent
        google_maps_agent.run()
    except Exception as e:
        log.error(f"❌ Google Maps agent encountered an issue: {e}", exc_info=False)

    # 3. Instagram Agent
    try:
        log.info("\n--- [Step 3/4] Running Instagram Hashtag & Bio Monitor ---")
        import instagram_agent
        instagram_agent.run()
    except Exception as e:
        log.error(f"❌ Instagram agent encountered an issue: {e}", exc_info=False)

    # 4. Grok AI Enrichment (Only runs on un-enriched deltas)
    try:
        log.info("\n--- [Step 4/4] Running Grok AI Enrichment for new leads ---")
        import grok_enrichment_agent
        grok_enrichment_agent.run()
    except Exception as e:
        log.error(f"❌ Grok enrichment agent encountered an issue: {e}", exc_info=False)

    duration = round(time.time() - start_time, 2)
    log.info("=" * 60)
    log.info(f"🏁 Pipeline finished in {duration}s")
    log.info("=" * 60)


if __name__ == "__main__":
    run_pipeline()
