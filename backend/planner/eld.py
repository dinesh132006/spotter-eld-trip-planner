from typing import Dict, Any, List
from .utils import (
    STATUS_OFF_DUTY,
    STATUS_SLEEPER_BERTH,
    STATUS_DRIVING,
    STATUS_ON_DUTY_NOT_DRIVING,
    minutes_to_hhmm,
)


def generate_eld_daily_logs(
    daily_schedules: List[Dict[str, Any]],
    carrier_name: str = "Spotter Assessment Carrier",
    driver_name: str = "Assessment Driver",
    vehicle_id: str = "TRUCK-001 / TRAILER-99",
    main_office: str = "100 Spotter Way, Chicago, IL 60601",
    shipping_doc: str = "BOL #SPOT-2026-98765"
) -> List[Dict[str, Any]]:
    """
    Generates dynamic FMCSA-formatted ELD log sheets for each day of the trip.
    """
    eld_logs = []

    for day_sched in daily_schedules:
        day_num = day_sched["day_number"]
        events = day_sched["events"]
        totals = day_sched["totals"]

        # Build SVG path points for 24-hour duty status graph
        # Width: 800px grid (representing 1440 minutes) -> 1 min = 800 / 1440 = 0.555556 px
        svg_grid_data = build_eld_svg_grid(events)

        # Build FMCSA Remarks section
        remarks = build_eld_remarks(events)

        # Sum driving miles for this day
        driving_miles_today = round(
            sum(e.get("distance_miles", 0) for e in events if e["status"] == STATUS_DRIVING),
            1
        )

        log_sheet = {
            "day_number": day_num,
            "day_label": f"Day {day_num}",
            "header": {
                "date_label": f"Day {day_num} of Trip",
                "carrier_name": carrier_name,
                "main_office_address": main_office,
                "driver_name": driver_name,
                "co_driver": "N/A",
                "vehicle_tractor_trailer": vehicle_id,
                "shipping_document": shipping_doc,
                "total_miles_driven_today": driving_miles_today,
                "home_terminal": "Chicago Terminal"
            },
            "duty_totals": totals,
            "svg_grid": svg_grid_data,
            "remarks": remarks,
            "events": events
        }

        eld_logs.append(log_sheet)

    return eld_logs


def get_status_row_index(status: str) -> int:
    """Returns 0-based row index for duty status."""
    if status == STATUS_OFF_DUTY:
        return 0
    elif status == STATUS_SLEEPER_BERTH:
        return 1
    elif status == STATUS_DRIVING:
        return 2
    elif status == STATUS_ON_DUTY_NOT_DRIVING:
        return 3
    return 0


def build_eld_svg_grid(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes exact SVG polyline points and line segments for rendering
    the FMCSA 24-hour grid graph.
    Grid coordinates:
    Width = 1440 units (1 unit per minute, 0 to 1440)
    Row height = 40 units per status row
    Y coordinates:
    Row 0 (OFF_DUTY): Y = 20
    Row 1 (SLEEPER_BERTH): Y = 60
    Row 2 (DRIVING): Y = 100
    Row 3 (ON_DUTY_NOT_DRIVING): Y = 140
    """
    row_y_map = {
        STATUS_OFF_DUTY: 20,
        STATUS_SLEEPER_BERTH: 60,
        STATUS_DRIVING: 100,
        STATUS_ON_DUTY_NOT_DRIVING: 140
    }

    segments = []
    path_d_parts = []
    prev_y = None

    for ev in events:
        start_m = ev["start_minute_day"]
        end_m = ev["end_minute_day"]
        status = ev["status"]
        curr_y = row_y_map.get(status, 20)

        if prev_y is not None and prev_y != curr_y:
            # Vertical step line at status change
            path_d_parts.append(f"V {curr_y}")
            segments.append({
                "type": "vertical",
                "x": start_m,
                "y1": prev_y,
                "y2": curr_y
            })

        if prev_y is None:
            path_d_parts.append(f"M {start_m} {curr_y}")

        # Horizontal line for duration of status
        path_d_parts.append(f"H {end_m}")
        segments.append({
            "type": "horizontal",
            "x1": start_m,
            "x2": end_m,
            "y": curr_y,
            "status": status,
            "duration": end_m - start_m
        })

        prev_y = curr_y

    path_string = " ".join(path_d_parts)

    return {
        "view_box": "0 0 1440 160",
        "path_d": path_string,
        "segments": segments,
        "row_y_map": row_y_map
    }


def build_eld_remarks(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generates official FMCSA duty-status change remarks."""
    remarks = []
    for ev in events:
        start_time = ev["start_time_formatted"]
        loc = ev.get("location", "En route")
        desc = ev.get("description", ev.get("title", ""))
        status = ev["status"]

        # Highlight major events in remarks
        if ev["type"] in ["START", "PICKUP", "DROPOFF", "FUELING", "REST_10H", "BREAK_30M", "REST_34H_RESTART"]:
            remarks.append({
                "time": start_time,
                "location": loc,
                "status": status,
                "remark_text": f"{start_time} - {loc}: {desc}"
            })
        elif status == STATUS_DRIVING and ev["start_minute_day"] == 0:
            remarks.append({
                "time": start_time,
                "location": loc,
                "status": status,
                "remark_text": f"{start_time} - {loc}: Continued driving segment"
            })

    return remarks
