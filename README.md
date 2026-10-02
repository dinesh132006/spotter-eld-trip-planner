# 🚚 Spotter ELD Trip Planner

[![Django Tests](https://img.shields.io/badge/Django_Tests-18_Passed-emerald?style=flat-square&logo=django)](file:///Users/dinesh/Desktop/spotter-eld-trip-planner/backend)
[![React Vite](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-blue?style=flat-square&logo=react)](file:///Users/dinesh/Desktop/spotter-eld-trip-planner/frontend)
[![HOS Compliance](https://img.shields.io/badge/FMCSA-HOS_Compliant_70h%2F8d-purple?style=flat-square)](https://www.fmcsa.dot.gov/)

A full-stack web application designed for property-carrying commercial truck drivers. The application geocodes trip locations, calculates real road routes via OSRM, simulates FMCSA Hours of Service (HOS) rules, and dynamically generates official 24-hour ELD daily driver log sheets with interactive SVG vector graphs.

---

## 🌟 Key Features

- **Dynamic Trip Route Calculation**: Geocodes origin, pickup, and dropoff locations using OpenStreetMap Nominatim with fallback caches. Calculates exact road mileage, driving durations, and geometry via OSRM.
- **FMCSA Hours of Service (HOS) Engine**:
  - **11-Hour Driving Limit**: Enforces max 11 total driving hours per window.
  - **14-Hour Duty Window**: Tracks non-pausing consecutive 14-hour work window.
  - **10-Hour Off-Duty Reset**: Schedules 10 consecutive hours off-duty rest to reset driving and window clocks.
  - **30-Minute Break**: Schedules mandatory 30-minute off-duty break after 8 cumulative driving hours.
  - **70-Hour / 8-Day Cycle**: Evaluates driver's prior accumulated cycle hours (`cycle_used`) against the 70-hour limit.
  - **34-Hour Restart**: Automatically triggers 34-hour off-duty restart on long trips when cycle capacity is reached.
- **Mandatory Activities & Stops**:
  - **Pickup Activity**: 1 Hour `ON_DUTY_NOT_DRIVING` at pickup location.
  - **Dropoff Activity**: 1 Hour `ON_DUTY_NOT_DRIVING` at dropoff location.
  - **Fuel Stops**: 30 Minutes `ON_DUTY_NOT_DRIVING` scheduled every 1,000 miles of driving.
- **Dynamic 24-Hour ELD Daily Log Sheets**:
  - Crisp, dynamically generated SVG 24-hour grid graph (Off Duty, Sleeper Berth, Driving, On Duty Not Driving).
  - Ensures every calendar day totals exactly **24.0 hours**.
  - Automatically generates official FMCSA remarks for duty status changes and location stops.
  - Printable / Exportable PDF log layout.
- **Single Canonical Schedule Architecture**: Map polylines, stop markers, timeline events, and ELD log sheets are all rendered from the exact same underlying backend event simulation.
- **Modern Dark SaaS Dashboard UI**: Built with React, Vite, Leaflet, and custom glassmorphism styling.

---

## 🏗️ Architecture & Stack

```
spotter-eld-trip-planner/
├── backend/                  # Python Django + Django REST Framework API
│   ├── core/                 # Django settings, WSGI, CORS & root URLs
│   ├── planner/              # Core HOS engine, routing, scheduler & ELD generator
│   │   ├── hos.py            # FMCSA rule state tracker & compliance validator
│   │   ├── routing.py        # Nominatim geocoding & OSRM road route integration
│   │   ├── scheduler.py      # Integer minute timeline simulator & calendar day splitter
│   │   ├── eld.py            # Dynamic SVG grid builder & log sheet generator
│   │   ├── utils.py          # HOS constants & minute/distance formatters
│   │   ├── views.py          # REST API view handlers & error formatters
│   │   └── test_*.py         # Comprehensive unit test suite (18 tests)
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Header, TripForm, RouteMap, RouteTimeline, EldDailyLogs
│   │   ├── services/         # API fetch client
│   │   └── index.css         # Custom design system & glassmorphism theme
├── docs/
│   └── loom_script.md        # 3-5 minute presentation video script
├── README.md
└── .gitignore
```

### Stack Summary:
- **Frontend**: React 18, Vite, Lucide Icons, Leaflet (OpenStreetMap Dark Carto Tiles), Vanilla CSS with CSS custom properties.
- **Backend**: Python 3.13, Django 6.0, Django REST Framework, Django CORS Headers, Requests.

---

## 📐 Implementation Assumptions

| Requirement / Parameter | Value / Assumption | Rationale |
| :--- | :--- | :--- |
| **Default Trip Start Time** | `06:00 AM` | Required assumption by assessment spec (editable via Advanced Settings). |
| **Pickup Duration** | `1 Hour` (60 min) | `ON_DUTY_NOT_DRIVING` per assessment rules. |
| **Dropoff Duration** | `1 Hour` (60 min) | `ON_DUTY_NOT_DRIVING` per assessment rules. |
| **Fuel Stop Interval** | At least once every `1,000 miles` | Scheduled `ON_DUTY_NOT_DRIVING` based on cumulative mileage. |
| **Fuel Stop Duration** | `30 Minutes` (30 min) | Explicit implementation assumption documented in README. |
| **30-Minute Rest Break** | `30 Minutes` (30 min) | Scheduled `OFF_DUTY` after 8 cumulative driving hours. |
| **10-Hour Rest Period** | `10 Hours` (600 min) | Scheduled `OFF_DUTY` when 11h driving or 14h window is reached. |
| **34-Hour Cycle Restart** | `34 Hours` (2040 min) | Scheduled `OFF_DUTY` when 70h cycle limit is reached. |
| **Demo Log Header Values** | *Spotter Assessment Carrier*, *Assessment Driver*, *TRUCK-001* | Explicitly marked demo header values. |

---

## ⚡ Quick Start & Local Setup

### Prerequisites:
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Set Up Backend

```bash
cd spotter-eld-trip-planner/backend

# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Run Django development server (Port 8000)
python manage.py runserver
```

The Django REST API will be available at: `http://localhost:8000/api/trips/plan/`

### 2. Set Up & Start Frontend

In a new terminal window:

```bash
cd spotter-eld-trip-planner/frontend

# Install npm dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Open your browser and navigate to: `http://localhost:5173`

---

## 🧪 Running Unit Tests

The backend includes a 15-test unit suite verifying HOS limits, 1-hour pickup/dropoff, fuel intervals, calendar day 24-hour totals, SVG path rendering, and API endpoint validation.

```bash
cd spotter-eld-trip-planner/backend
./venv/bin/python manage.py test
```

Expected output:
```text
Ran 18 tests in 12.213s

OK
```

---

## 📡 REST API Documentation

### `POST /api/trips/plan/`

Calculates road route, HOS schedule, stop markers, timeline events, and dynamic ELD logs.

#### Request Body:
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Indianapolis, IN",
  "dropoff_location": "Atlanta, GA",
  "cycle_used": 12.0,
  "start_time": "06:00"
}
```

#### Successful Response (`200 OK`):
```json
{
  "trip_summary": {
    "total_distance_miles": 715.4,
    "total_driving_minutes": 708,
    "total_driving_formatted": "11h 48m",
    "total_trip_duration_days": 2,
    "fuel_stops_count": 0,
    "rest_stops_count": 1,
    "daily_logs_count": 2,
    "initial_cycle_used_hours": 12.0,
    "final_cycle_used_hours": 25.8,
    "remaining_cycle_hours": 44.2
  },
  "route": { ... },
  "stops": [ ... ],
  "timeline": [ ... ],
  "daily_logs": [ ... ]
}
```

---

## 🚢 Deployment Guide

### Deploying Frontend to Vercel:
1. Push workspace repository to GitHub.
2. Import `spotter-eld-trip-planner` into Vercel dashboard.
3. Set **Root Directory** to `frontend`.
4. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
5. Add Environment Variable: `VITE_API_URL=https://your-backend-domain.com/api/trips`.

### Deploying Backend (Render / Railway / Fly.io / Heroku):
1. Set environment variables: `DEBUG=False`, `ALLOWED_HOSTS=*`, `SECRET_KEY=your-production-key`.
2. Configure Start Command: `gunicorn core.wsgi:application`.

---

## 📜 Assessment Verification Checklist

- [x] Full-stack Django REST Framework + React Vite implementation.
- [x] Accepts 4 required inputs: Current Location, Pickup, Dropoff, Current Cycle Used.
- [x] OpenStreetMap Nominatim geocoding & OSRM road route integration.
- [x] 11-Hour Driving limit enforced.
- [x] 14-Hour Duty Window enforced (does not pause for 30-min break).
- [x] 10-Hour Off-duty rest reset.
- [x] 30-Minute Off-duty break after 8 cumulative driving hours.
- [x] 70-Hour / 8-Day rolling cycle tracking.
- [x] 34-Hour Restart when cycle limits are reached on long trips.
- [x] Pickup = 1 Hour `ON_DUTY_NOT_DRIVING`.
- [x] Dropoff = 1 Hour `ON_DUTY_NOT_DRIVING`.
- [x] Fueling = 30 Minutes `ON_DUTY_NOT_DRIVING` scheduled at least every 1,000 miles.
- [x] Dynamic SVG 24-Hour ELD Daily Log Sheets.
- [x] Every daily ELD log equals exactly 24.0 hours (1440 mins).
- [x] Single canonical schedule links Map, Timeline, and ELD Logs.
- [x] 18 Django unit tests passing cleanly.
- [x] Responsive dark SaaS dashboard UI with print capability.
