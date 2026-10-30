"""
Grok Enrichment Agent — Uses xAI Grok API to enrich newly discovered businesses.
Fills in phone, email, Instagram, category, lead score, and summary.
"""

import os
import json
import logging
from openai import OpenAI
from supabase_client import get_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s [GROK] %(message)s")
log = logging.getLogger(__name__)

client = OpenAI(
    api_key=os.environ["GROK_API_KEY"],
    base_url="https://api.x.ai/v1"
)


def build_enrichment_prompt(business: dict) -> str:
    return f"""You are a business intelligence assistant. Find details about this Hyderabad business.

Business Name: {business['name']}
Area: {business.get('area', 'Hyderabad')}
Category: {business.get('category', 'Unknown')}
Known Phone: {business.get('phone', 'None')}
Known Website: {business.get('website', 'None')}

Search the web and return a JSON object with ONLY these keys:
{{
  "phone": "string or null",
  "email": "string or null",
  "whatsapp": "string or null (just the number)",
  "instagram_handle": "string or null (without @)",
  "category": "one of: Food & Beverage, Clothing & Fashion, Beauty & Wellness, Fitness, Health, Retail, Services, Tech, Other",
  "has_website": true or false,
  "estimated_open_month": "YYYY-MM or null",
  "lead_score": integer 0-100,
  "grok_summary": "2-sentence description of the business and why it's a good outreach prospect"
}}

Lead score logic:
- No website = +30
- Instagram followers < 500 = +25
- First seen within 30 days = +20
- Has phone/WhatsApp = +5
- Is actively posting = +10
- Has professional content team = -20

Return ONLY valid JSON, no extra text."""


def enrich_business(business: dict) -> dict | None:
    try:
        prompt = build_enrichment_prompt(business)
        response = client.chat.completions.create(
            model="grok-3-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=500,
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        log.error(f"Grok API error for {business['name']}: {e}")
        return None


def run():
    supabase = get_supabase()

    # Find businesses that haven't been enriched yet (no grok_summary)
    result = supabase.table("businesses") \
        .select("*") \
        .is_("grok_summary", "null") \
        .limit(50) \
        .execute()

    businesses = result.data
    log.info(f"Enriching {len(businesses)} businesses with Grok API...")

    for biz in businesses:
        log.info(f"  Enriching: {biz['name']} ({biz.get('area')})")
        enriched = enrich_business(biz)

        if not enriched:
            continue

        update_data = {k: v for k, v in enriched.items() if v is not None}

        supabase.table("businesses") \
            .update(update_data) \
            .eq("id", biz["id"]) \
            .execute()

        log.info(f"  ✅ Enriched: lead_score={enriched.get('lead_score')}")

    log.info("✅ Grok enrichment complete.")


if __name__ == "__main__":
    run()
