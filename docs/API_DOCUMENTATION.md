# 📡 API Documentation

This application provides lightweight REST endpoints for fetching radar businesses and recording outreach calls.

---

## 1. GET `/api/businesses`

Fetches businesses filtered by location, category, recency, or outreach status.

### Query Parameters

| Parameter | Type | Allowed Values | Default | Description |
|---|---|---|---|---|
| `area` | string | Any Hyderabad area name (`Kokapet`, `Gachibowli`, etc.) | `all` | Filters businesses located in the specified area |
| `category` | string | `Food & Beverage`, `Clothing & Fashion`, `Beauty & Wellness`, `Fitness`, `Retail`, etc. | `all` | Filters by business category |
| `recency` | string | `24h`, `7d`, `30d`, `6m`, `all` | `all` | Filters by when the business was first spotted |
| `status` | string | `new`, `contacted`, `interested`, `closed`, `skip`, `all` | `all` | Filters by current sales CRM outreach state |
| `search` | string | Text string | `""` | Searches business name and description |

### Example Request
```http
GET /api/businesses?area=Kokapet&category=Food%20%26%20Beverage&recency=7d
```

### Response
```json
{
  "success": true,
  "count": 3,
  "businesses": [
    {
      "id": "hyd-001",
      "name": "BrewCrafters Artisan Coffee & Boba",
      "category": "Food & Beverage",
      "sub_category": "Beverage / Cafe",
      "area": "Kokapet",
      "city": "Hyderabad",
      "lat": 17.4162,
      "lng": 78.3312,
      "phone": "+91 98490 12831",
      "whatsapp": "919849012831",
      "instagram_handle": "brewcrafters_kokapet",
      "website": null,
      "first_seen_at": "2026-10-30T09:00:00Z",
      "lead_score": 92,
      "outreach_status": "new",
      "grok_summary": "Brand new beverage startup in high-income Kokapet belt..."
    }
  ]
}
```

---

## 2. POST `/api/outreach`

Updates the outreach status and notes for a specific business.

### Request Body
```json
{
  "id": "hyd-001",
  "status": "contacted",
  "notes": "Called owner Ramesh at 3 PM; expressed interest in digital catalog."
}
```

### Response
```json
{
  "success": true
}
```
