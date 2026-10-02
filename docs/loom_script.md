# Spotter ELD Trip Planner — 3-5 Minute Loom Presentation Script

This script is structured to demonstrate the dynamic calculation engine, FMCSA compliance accuracy, interactive UI, and backend architecture during your video recording.

---

## 🕒 Timestamp Breakdown & Dialogue

### 0:00 - 0:30 | Introduction & Assessment Overview
**Visual:** Full screen view of the application dashboard.
- **Presenter:** *"Hi everyone! My name is [Your Name], and this is my submission for the Spotter AI Full-Stack Developer Take-Home Assessment: **Spotter ELD Trip Planner**."*
- **Presenter:** *"This application is a full-stack Django + REST Framework and React application designed to calculate real truck driving routes and dynamically generate FMCSA-compliant Hours of Service (HOS) daily driver log sheets based on driver inputs."*

---

### 0:30 - 1:30 | Input & Dynamic Schedule Generation
**Visual:** Mouse cursor entering inputs: Chicago, IL -> Indianapolis, IN -> Atlanta, GA, Cycle Used: 12 Hours.
- **Presenter:** *"Let's input a real trip. We enter our **Current Location** as Chicago, IL, **Pickup Location** as Indianapolis, IN, **Dropoff Location** as Atlanta, GA, and **Current Cycle Used** as 12 hours. We can also inspect the advanced setting for trip start time, defaulted to 06:00 AM."*
- **Presenter:** *"When I click 'Generate Trip Plan', the app makes a call to our Django backend API. The backend geocodes the locations, fetches real road geometry from OSRM, runs our HOS rule engine, and generates the exact timeline and log sheets."*

---

### 1:30 - 2:15 | Map, Route, Fuel Stops & Rest Periods
**Visual:** Hovering over the summary cards, status gauges, interactive Leaflet map, and event timeline.
- **Presenter:** *"Here we see our summary cards: Total road distance is 715 miles, driving time is 11 hours 48 minutes, spanning 2 calendar days. Notice our HOS status gauges: The 70-hour cycle has 58 hours remaining, and 10-hour rest and 30-minute off-duty breaks are calculated."*
- **Presenter:** *"On the interactive Leaflet map, you can see the exact road route geometry with markers for Start, 1-hour Pickup in Indianapolis, 1-hour Dropoff in Atlanta, and scheduled rest stops."*

---

### 2:15 - 3:15 | Dynamic ELD Daily Log Sheets
**Visual:** Scrolling to the ELD Daily Logs section, switching between Day 1 and Day 2 tabs.
- **Presenter:** *"Now let's look at the core requirement: the **Daily ELD Log Sheets**. Unlike static screenshots, these 24-hour log grids are rendered dynamically using SVG vectors directly from our single canonical backend schedule."*
- **Presenter:** *"Notice the 4 duty status rows: Off Duty, Sleeper Berth, Driving, and On Duty Not Driving. Every calendar day totals exactly 24.0 hours, with FMCSA remarks generated for every status change (like 1-hour loading at pickup). We can also click 'Print / Save Log' to export clean PDF log sheets."*

---

### 3:15 - 4:15 | Django Architecture & HOS Engine Code
**Visual:** VS Code editor showing `planner/hos.py`, `planner/scheduler.py`, and running `python manage.py test`.
- **Presenter:** *"Behind the scenes, our Django backend separates routing (`routing.py`), HOS rule tracking (`hos.py`), timeline scheduling (`scheduler.py`), and log generation (`eld.py`). All calculations use integer minutes to prevent floating point inaccuracies."*
- **Presenter:** *"We have 15 comprehensive unit tests covering the 11-hour driving maximum, 14-hour window, 30-minute break after 8 driving hours, 70-hour rolling cycle, 34-hour restart, and 1,000-mile fueling intervals."*

---

### 4:15 - 5:00 | Conclusion & Architecture Summary
**Visual:** Return to dashboard view.
- **Presenter:** *"To summarize, the map, timeline, and ELD logs are all derived from a single canonical schedule. The application is responsive, production-ready, fully compliant, and deployable to Vercel and hosting platforms. Thank you for watching!"*
