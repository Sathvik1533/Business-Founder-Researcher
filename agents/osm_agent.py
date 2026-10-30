"""
OSM Agent — Overpass API business discovery for Hyderabad.
100% free, no API key required. Run every 8h via GitHub Actions.
"""

import os
import json
import time
import logging
import requests
from datetime import datetime
from supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s [OSM] %(message)s")
log = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

HYDERABAD_AREAS = {
    "Kokapet":       (17.4156, 78.3298, 3000),
    "Gachibowli":    (17.4400, 78.3489, 3000),
    "HITECH City":   (17.4486, 78.3908, 3000),
    "Madhapur":      (17.4484, 78.3908, 2500),
    "Kondapur":      (17.4600, 78.3550, 2500),
    "Banjara Hills": (17.4312, 78.4072, 3000),
    "Jubilee Hills": (17.4239, 78.4082, 3000),
    "Kukatpally":    (17.4947, 78.3996, 3000),
    "Secunderabad":  (17.4399, 78.4983, 3000),
    "Uppal":         (17.4042, 78.5598, 3000),
    "Miyapur":       (17.4947, 78.3500, 2500),
    "Narsingi":      (17.3883, 78.3588, 3000),
}

OSM_CATEGORY_MAP = {
    "restaurant": "Food & Beverage",
    "cafe":        "Food & Beverage",
    "fast_food":   "Food & Beverage",
    "bar":         "Food & Beverage",
    "pub":         "Food & Beverage",
    "clothes":     "Clothing & Fashion",
    "boutique":    "Clothing & Fashion",
    "beauty":      "Beauty & Wellness",
    "hairdresser": "Beauty & Wellness",
    "gym":         "Fitness",
    "pharmacy":    "Health",
    "supermarket": "Retail",
    "bakery":      "Food & Beverage",
}


def build_overpass_query(lat: float, lng: float, radius: int) -> str:
    return f"""
[out:json][timeout:60];
(
  node["amenity"~"restaurant|cafe|fast_food|bar|pub|bakery|pharmacy"](around:{radius},{lat},{lng});
  node["shop"~"clothes|beauty|hairdresser|supermarket|gift|electronics"](around:{radius},{lat},{lng});
  node["leisure"~"gym|fitness_centre"](around:{radius},{lat},{lng});
);
out body;
"""


def parse_osm_element(el: dict, area_name: str) -> dict | None:
    tags = el.get("tags", {})
    name = tags.get("name") or tags.get("name:en")
    if not name:
        return None

    amenity = tags.get("amenity", "")
    shop = tags.get("shop", "")
    category_key = amenity or shop
    category = OSM_CATEGORY_MAP.get(category_key, "Other")

    return {
        "name": name,
        "osm_id": str(el["id"]),
        "lat": el.get("lat"),
        "lng": el.get("lon"),
        "area": area_name,
        "city": "Hyderabad",
        "category": category,
        "phone": tags.get("phone") or tags.get("contact:phone"),
        "website": tags.get("website") or tags.get("contact:website"),
        "source": "osm",
        "raw_data": tags,
    }


def run():
    supabase = get_supabase()
    run_id = supabase.table("scrape_runs").insert({
        "source": "osm", "status": "running"
    }).execute().data[0]["id"]

    total_new = 0
    errors = 0

    for area_name, (lat, lng, radius) in HYDERABAD_AREAS.items():
        log.info(f"Scanning {area_name}...")
        try:
            query = build_overpass_query(lat, lng, radius)
            resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=90)
            resp.raise_for_status()
            elements = resp.json().get("elements", [])
            log.info(f"  → {len(elements)} elements from OSM")

            for el in elements:
                business = parse_osm_element(el, area_name)
                if not business:
                    continue

                osm_id = business["osm_id"]

                # Check if already seen
                existing = supabase.table("business_sources") \
                    .select("id") \
                    .eq("source", "osm") \
                    .eq("source_id", osm_id) \
                    .execute()

                if existing.data:
                    continue  # Already in DB

                # Insert new business
                result = supabase.table("businesses").upsert(
                    {k: v for k, v in business.items() if k != "osm_id"},
                    on_conflict="osm_id"
                ).execute()

                if result.data:
                    biz_id = result.data[0]["id"]
                    supabase.table("business_sources").insert({
                        "business_id": biz_id,
                        "source": "osm",
                        "source_id": osm_id,
                    }).execute()
                    total_new += 1
                    log.info(f"  ✅ New: {business['name']} ({area_name})")

            time.sleep(2)  # Be polite to Overpass

        except Exception as e:
            log.error(f"  ❌ Error scanning {area_name}: {e}")
            errors += 1

    # Update run log
    supabase.table("scrape_runs").update({
        "status": "completed",
        "finished_at": datetime.utcnow().isoformat(),
        "new_found": total_new,
        "errors": errors,
    }).eq("id", run_id).execute()

    log.info(f"✅ OSM agent done. New: {total_new}, Errors: {errors}")


if __name__ == "__main__":
    run()
