"""
Google Maps / Places API Agent for Hyderabad.
Scans priority areas (Kokapet, Gachibowli, HITECH City, etc.) for new businesses,
performs delta tracking against Supabase to only flag newly opened/listed businesses.
"""

import os
import json
import time
import logging
import requests
from datetime import datetime
from supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s [GMAPS] %(message)s")
log = logging.getLogger(__name__)

GOOGLE_PLACES_KEY = os.environ.get("GOOGLE_PLACES_KEY", "")
PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

# Priority grid coordinates across Hyderabad
HYDERABAD_GRIDS = [
    {"name": "Kokapet", "lat": 17.4156, "lng": 78.3298, "radius": 2500},
    {"name": "Gachibowli", "lat": 17.4400, "lng": 78.3489, "radius": 2500},
    {"name": "HITECH City", "lat": 17.4486, "lng": 78.3908, "radius": 2500},
    {"name": "Madhapur", "lat": 17.4484, "lng": 78.3908, "radius": 2000},
    {"name": "Financial District", "lat": 17.4170, "lng": 78.3430, "radius": 2000},
    {"name": "Nanakramguda", "lat": 17.4180, "lng": 78.3550, "radius": 2000},
    {"name": "Jubilee Hills", "lat": 17.4312, "lng": 78.4072, "radius": 2500},
    {"name": "Banjara Hills", "lat": 17.4156, "lng": 78.4350, "radius": 2500},
    {"name": "Kondapur", "lat": 17.4600, "lng": 78.3550, "radius": 2000},
    {"name": "Narsingi", "lat": 17.3883, "lng": 78.3588, "radius": 2500},
]

TARGET_TYPES = [
    "restaurant", "cafe", "bakery", "bar",
    "clothing_store", "beauty_salon", "gym",
    "supermarket", "store"
]

CATEGORY_MAP = {
    "restaurant": "Food & Beverage",
    "cafe": "Food & Beverage",
    "bakery": "Food & Beverage",
    "bar": "Food & Beverage",
    "clothing_store": "Clothing & Fashion",
    "beauty_salon": "Beauty & Wellness",
    "gym": "Fitness",
    "supermarket": "Retail",
    "store": "Retail"
}


def fetch_place_details(place_id: str) -> dict:
    if not GOOGLE_PLACES_KEY:
        return {}
    params = {
        "place_id": place_id,
        "fields": "name,formatted_phone_number,international_phone_number,website,formatted_address,url,business_status,opening_hours",
        "key": GOOGLE_PLACES_KEY,
    }
    try:
        res = requests.get(PLACE_DETAILS_URL, params=params, timeout=10)
        if res.status_code == 200:
            return res.json().get("result", {})
    except Exception as e:
        log.warning(f"Error fetching details for {place_id}: {e}")
    return {}


def scan_grid(area_info: dict, place_type: str, supabase) -> int:
    new_found = 0
    if not GOOGLE_PLACES_KEY:
        log.warning("No GOOGLE_PLACES_KEY provided. Skipping live Places API call.")
        return 0

    params = {
        "location": f"{area_info['lat']},{area_info['lng']}",
        "radius": area_info["radius"],
        "type": place_type,
        "key": GOOGLE_PLACES_KEY,
    }

    try:
        res = requests.get(PLACES_NEARBY_URL, params=params, timeout=15)
        if res.status_code != 200:
            log.error(f"Failed API call: {res.text}")
            return 0

        data = res.json()
        results = data.get("results", [])

        for place in results:
            place_id = place.get("place_id")
            if not place_id:
                continue

            # Check if existing in DB
            seen = supabase.table("business_sources") \
                .select("id") \
                .eq("source", "google_maps") \
                .eq("source_id", place_id) \
                .execute()

            if seen.data:
                continue  # already known

            details = fetch_place_details(place_id)
            geo = place.get("geometry", {}).get("location", {})

            category = CATEGORY_MAP.get(place_type, "Retail")

            business_data = {
                "name": place.get("name"),
                "category": category,
                "sub_category": place_type,
                "area": area_info["name"],
                "city": "Hyderabad",
                "lat": geo.get("lat"),
                "lng": geo.get("lng"),
                "phone": details.get("formatted_phone_number"),
                "website": details.get("website"),
                "google_place_id": place_id,
                "source": "google_maps",
                "outreach_status": "new",
                "raw_data": place
            }

            inserted = supabase.table("businesses").insert(business_data).execute()
            if inserted.data:
                biz_id = inserted.data[0]["id"]
                supabase.table("business_sources").insert({
                    "business_id": biz_id,
                    "source": "google_maps",
                    "source_id": place_id,
                    "source_url": details.get("url")
                }).execute()
                new_found += 1
                log.info(f"  [+] New place in {area_info['name']}: {place.get('name')}")

            time.sleep(0.5)

    except Exception as e:
        log.error(f"Error querying {area_info['name']} for {place_type}: {e}")

    return new_found


def run():
    supabase = get_supabase()
    run_log = supabase.table("scrape_runs").insert({
        "source": "google_maps",
        "status": "running"
    }).execute()
    run_id = run_log.data[0]["id"]

    total_new = 0
    errors = 0

    log.info("Starting Google Maps delta scanner across Hyderabad...")
    for area in HYDERABAD_GRIDS:
        for ptype in TARGET_TYPES:
            try:
                cnt = scan_grid(area, ptype, supabase)
                total_new += cnt
            except Exception as e:
                errors += 1
                log.error(f"Error in grid {area['name']} / {ptype}: {e}")

    supabase.table("scrape_runs").update({
        "status": "completed",
        "finished_at": datetime.utcnow().isoformat(),
        "new_found": total_new,
        "errors": errors
    }).eq("id", run_id).execute()

    log.info(f"Done Google Maps scan. Discovered {total_new} new businesses.")


if __name__ == "__main__":
    run()
