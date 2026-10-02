import math
from typing import Dict, Any, List, Tuple
from .utils import (
    STATUS_OFF_DUTY,
    STATUS_SLEEPER_BERTH,
    STATUS_DRIVING,
    STATUS_ON_DUTY_NOT_DRIVING,
    MAX_DRIVING_MINUTES,
    MAX_WINDOW_MINUTES,
    BREAK_THRESHOLD_MINUTES,
    BREAK_MINUTES,
    REST_MINUTES,
    RESTART_MINUTES,
    CYCLE_MAX_MINUTES,
    PICKUP_DURATION_MINUTES,
    DROPOFF_DURATION_MINUTES,
    FUEL_DURATION_MINUTES,
    FUEL_INTERVAL_MILES,
    hhmm_to_minutes,
    minutes_to_hhmm,
    minutes_to_12h_format,
    format_minutes_duration,
    interpolate_point,
)
from .hos import HosStateTracker


def simulate_trip_timeline(
    route_info: Dict[str, Any],
    cycle_used_hours: float,
    start_time_str: str = "06:00"
) -> Tuple[List[Dict[str, Any]], Dict[str, Any], List[Dict[str, Any]]]:
    """
    Executes precise minute-by-minute HOS simulation for the trip.
    Returns:
    - full_raw_events: List of complete un-split events in absolute minute timeline
    - summary: Aggregated metrics card data
    - stop_markers: Map marker objects for rest stops, fuel stops, pickup, dropoff
    """
    start_minute = hhmm_to_minutes(start_time_str)
    tracker = HosStateTracker(cycle_used_hours)

    raw_events = []
    stop_markers = []

    current_loc = route_info["current_location"]
    pickup_loc = route_info["pickup_location"]
    dropoff_loc = route_info["dropoff_location"]

    # Initial pre-trip off-duty slice if start_minute > 0
    clock = 0
    if start_minute > 0:
        raw_events.append({
            "type": "OFF_DUTY_INITIAL",
            "title": "Initial Off Duty",
            "status": STATUS_OFF_DUTY,
            "start_minute": 0,
            "end_minute": start_minute,
            "duration_minutes": start_minute,
            "location": current_loc["display_name"],
            "description": "Off duty prior to scheduled departure",
            "coords": [current_loc["lat"], current_loc["lng"]]
        })
        clock = start_minute

    # Add initial departure marker
    stop_markers.append({
        "type": "START",
        "title": "Trip Origin",
        "location": current_loc["display_name"],
        "minute": clock,
        "time_display": minutes_to_12h_format(clock),
        "coords": [current_loc["lat"], current_loc["lng"]],
        "reason": "Depart initial location"
    })

    # Prepare legs
    legs = [
        {
            "name": "Leg 1 (Origin to Pickup)",
            "from_loc": current_loc,
            "to_loc": pickup_loc,
            "distance_miles": route_info["leg1"]["distance_miles"],
            "driving_minutes": route_info["leg1"]["duration_minutes"],
            "coordinates": route_info["leg1"]["coordinates"],
            "post_activity": "PICKUP"
        },
        {
            "name": "Leg 2 (Pickup to Dropoff)",
            "from_loc": pickup_loc,
            "to_loc": dropoff_loc,
            "distance_miles": route_info["leg2"]["distance_miles"],
            "driving_minutes": route_info["leg2"]["duration_minutes"],
            "coordinates": route_info["leg2"]["coordinates"],
            "post_activity": "DROPOFF"
        }
    ]

    total_fuel_stops = 0
    total_rest_stops = 0
    total_restarts = 0

    for leg in legs:
        leg_name = leg["name"]
        from_loc = leg["from_loc"]
        to_loc = leg["to_loc"]
        leg_distance = leg["distance_miles"]
        leg_drive_time = leg["driving_minutes"]
        leg_coords = leg["coordinates"]
        post_activity = leg["post_activity"]

        remaining_leg_drive_min = leg_drive_time
        remaining_leg_distance = leg_distance

        # Simulation loop for driving leg
        while remaining_leg_drive_min > 0:

            # Check 1: 70-hour cycle check
            if tracker.remaining_cycle_minutes <= 0:
                # Need 34-hour restart
                total_restarts += 1
                total_rest_stops += 1
                curr_pos = interpolate_along_coords(leg_coords, 1.0 - (remaining_leg_distance / max(1.0, leg_distance)))
                restart_event = {
                    "type": "REST_34H_RESTART",
                    "title": "34-Hour Cycle Restart",
                    "status": STATUS_OFF_DUTY,
                    "start_minute": clock,
                    "end_minute": clock + RESTART_MINUTES,
                    "duration_minutes": RESTART_MINUTES,
                    "location": f"Rest Area near {to_loc['display_name']}",
                    "description": "34 consecutive hours off-duty to reset 70-hour cycle",
                    "coords": curr_pos
                }
                raw_events.append(restart_event)
                stop_markers.append({
                    "type": "REST",
                    "title": "34-Hour Restart",
                    "location": restart_event["location"],
                    "minute": clock,
                    "time_display": minutes_to_12h_format(clock),
                    "duration": "34 hours",
                    "reason": "70-hour cycle limit reached",
                    "coords": curr_pos
                })
                clock += RESTART_MINUTES
                tracker.record_34h_restart(RESTART_MINUTES)
                continue

            # Check 2: 11-hour driving or 14-hour window limit
            if tracker.remaining_driving_in_window <= 0 or tracker.remaining_window_time <= 0:
                # Need 10-hour rest
                total_rest_stops += 1
                curr_pos = interpolate_along_coords(leg_coords, 1.0 - (remaining_leg_distance / max(1.0, leg_distance)))
                rest_reason = "11-hour driving limit reached" if tracker.remaining_driving_in_window <= 0 else "14-hour duty window expired"
                rest_event = {
                    "type": "REST_10H",
                    "title": "10-Hour Mandatory Rest",
                    "status": STATUS_OFF_DUTY,
                    "start_minute": clock,
                    "end_minute": clock + REST_MINUTES,
                    "duration_minutes": REST_MINUTES,
                    "location": f"Truck Stop near {to_loc['display_name']}",
                    "description": f"10 consecutive hours off-duty rest ({rest_reason})",
                    "coords": curr_pos
                }
                raw_events.append(rest_event)
                stop_markers.append({
                    "type": "REST",
                    "title": "10-Hour Rest Stop",
                    "location": rest_event["location"],
                    "minute": clock,
                    "time_display": minutes_to_12h_format(clock),
                    "duration": "10 hours",
                    "reason": rest_reason,
                    "coords": curr_pos
                })
                clock += REST_MINUTES
                tracker.record_10h_rest(REST_MINUTES)
                continue

            # Check 3: 30-minute break check (after 8 driving hours = 480 mins)
            if tracker.remaining_driving_before_break <= 0:
                # Take 30-min break
                curr_pos = interpolate_along_coords(leg_coords, 1.0 - (remaining_leg_distance / max(1.0, leg_distance)))
                break_event = {
                    "type": "BREAK_30M",
                    "title": "30-Minute Off-Duty Break",
                    "status": STATUS_OFF_DUTY,
                    "start_minute": clock,
                    "end_minute": clock + BREAK_MINUTES,
                    "duration_minutes": BREAK_MINUTES,
                    "location": f"Highway Rest Area",
                    "description": "30-minute mandatory off-duty break after 8 hours driving",
                    "coords": curr_pos
                }
                raw_events.append(break_event)
                stop_markers.append({
                    "type": "REST",
                    "title": "30-Min Break",
                    "location": break_event["location"],
                    "minute": clock,
                    "time_display": minutes_to_12h_format(clock),
                    "duration": "30 mins",
                    "reason": "8 cumulative driving hours reached",
                    "coords": curr_pos
                })
                clock += BREAK_MINUTES
                tracker.record_short_break(BREAK_MINUTES)
                continue

            # Check 4: Fueling interval check (every 1,000 miles)
            miles_until_fuel = FUEL_INTERVAL_MILES - tracker.miles_since_last_fuel
            if miles_until_fuel <= 0.05:
                # Schedule fuel stop (30 min ON_DUTY_NOT_DRIVING)
                total_fuel_stops += 1
                curr_pos = interpolate_along_coords(leg_coords, 1.0 - (remaining_leg_distance / max(1.0, leg_distance)))
                fuel_event = {
                    "type": "FUELING",
                    "title": "Fuel Stop (30 min)",
                    "status": STATUS_ON_DUTY_NOT_DRIVING,
                    "start_minute": clock,
                    "end_minute": clock + FUEL_DURATION_MINUTES,
                    "duration_minutes": FUEL_DURATION_MINUTES,
                    "location": "Love's / Pilot Flying J Station",
                    "description": "Mandatory fuel stop (accumulated 1,000 miles)",
                    "coords": curr_pos
                }
                raw_events.append(fuel_event)
                stop_markers.append({
                    "type": "FUEL",
                    "title": "Fuel Stop",
                    "location": fuel_event["location"],
                    "minute": clock,
                    "time_display": minutes_to_12h_format(clock),
                    "duration": "30 mins",
                    "reason": "1,000-mile fuel interval reached",
                    "coords": curr_pos
                })
                clock += FUEL_DURATION_MINUTES
                tracker.record_on_duty_not_driving(FUEL_DURATION_MINUTES)
                tracker.miles_since_last_fuel = 0.0
                continue

            # Compute maximum drive minutes for current chunk
            chunk_drive_time = min(
                remaining_leg_drive_min,
                tracker.remaining_driving_in_window,
                tracker.remaining_window_time,
                tracker.remaining_driving_before_break,
                tracker.remaining_cycle_minutes
            )

            # Cap chunk drive time so driving NEVER exceeds the 1,000-mile fuel limit
            if leg_drive_time > 0 and leg_distance > 0:
                max_mins_for_fuel = math.floor((miles_until_fuel / float(leg_distance)) * leg_drive_time)
                if max_mins_for_fuel <= 0:
                    # Must fuel immediately
                    total_fuel_stops += 1
                    curr_pos = interpolate_along_coords(leg_coords, 1.0 - (remaining_leg_distance / max(1.0, leg_distance)))
                    fuel_event = {
                        "type": "FUELING",
                        "title": "Fuel Stop (30 min)",
                        "status": STATUS_ON_DUTY_NOT_DRIVING,
                        "start_minute": clock,
                        "end_minute": clock + FUEL_DURATION_MINUTES,
                        "duration_minutes": FUEL_DURATION_MINUTES,
                        "location": "Love's / Pilot Flying J Station",
                        "description": "Mandatory fuel stop (accumulated 1,000 miles)",
                        "coords": curr_pos
                    }
                    raw_events.append(fuel_event)
                    stop_markers.append({
                        "type": "FUEL",
                        "title": "Fuel Stop",
                        "location": fuel_event["location"],
                        "minute": clock,
                        "time_display": minutes_to_12h_format(clock),
                        "duration": "30 mins",
                        "reason": "1,000-mile fuel interval reached",
                        "coords": curr_pos
                    })
                    clock += FUEL_DURATION_MINUTES
                    tracker.record_on_duty_not_driving(FUEL_DURATION_MINUTES)
                    tracker.miles_since_last_fuel = 0.0
                    continue
                else:
                    chunk_drive_time = min(chunk_drive_time, max_mins_for_fuel)

            chunk_drive_time = max(1, chunk_drive_time)

            # Compute miles driven in chunk
            if leg_drive_time > 0:
                chunk_miles = round((chunk_drive_time / float(leg_drive_time)) * leg_distance, 1)
            else:
                chunk_miles = 0.0

            start_fraction = 1.0 - (remaining_leg_distance / max(1.0, leg_distance))
            end_fraction = 1.0 - (max(0.0, remaining_leg_distance - chunk_miles) / max(1.0, leg_distance))
            chunk_coords = interpolate_along_coords(leg_coords, end_fraction)

            # Append driving event
            raw_events.append({
                "type": "DRIVING",
                "title": f"Driving ({leg_name})",
                "status": STATUS_DRIVING,
                "start_minute": clock,
                "end_minute": clock + chunk_drive_time,
                "duration_minutes": chunk_drive_time,
                "location": f"En route on {leg_name}",
                "description": f"Driving {chunk_miles} miles towards destination",
                "distance_miles": chunk_miles,
                "coords": chunk_coords
            })

            clock += chunk_drive_time
            tracker.record_driving(chunk_drive_time, chunk_miles)

            remaining_leg_drive_min -= chunk_drive_time
            remaining_leg_distance = max(0.0, remaining_leg_distance - chunk_miles)

        # Handle post-leg activity (PICKUP or DROPOFF)
        if post_activity == "PICKUP":
            # Check if 14-hr window or cycle allows 1 hour ON_DUTY_NOT_DRIVING
            if tracker.remaining_window_time < PICKUP_DURATION_MINUTES or tracker.remaining_cycle_minutes < PICKUP_DURATION_MINUTES:
                # Rest before pickup
                total_rest_stops += 1
                rest_event = {
                    "type": "REST_10H",
                    "title": "10-Hour Pre-Pickup Rest",
                    "status": STATUS_OFF_DUTY,
                    "start_minute": clock,
                    "end_minute": clock + REST_MINUTES,
                    "duration_minutes": REST_MINUTES,
                    "location": f"Staging Area - {pickup_loc['display_name']}",
                    "description": "10-hour rest taken before pickup activity to preserve 14-hour duty window",
                    "coords": [pickup_loc["lat"], pickup_loc["lng"]]
                }
                raw_events.append(rest_event)
                clock += REST_MINUTES
                tracker.record_10h_rest(REST_MINUTES)

            pickup_event = {
                "type": "PICKUP",
                "title": "Cargo Pickup (1 Hour)",
                "status": STATUS_ON_DUTY_NOT_DRIVING,
                "start_minute": clock,
                "end_minute": clock + PICKUP_DURATION_MINUTES,
                "duration_minutes": PICKUP_DURATION_MINUTES,
                "location": pickup_loc["display_name"],
                "description": "On duty loading cargo & paperwork at pickup location",
                "coords": [pickup_loc["lat"], pickup_loc["lng"]]
            }
            raw_events.append(pickup_event)
            stop_markers.append({
                "type": "PICKUP",
                "title": "Pickup Location",
                "location": pickup_loc["display_name"],
                "minute": clock,
                "time_display": minutes_to_12h_format(clock),
                "duration": "1 hour",
                "reason": "Cargo loading & inspection",
                "coords": [pickup_loc["lat"], pickup_loc["lng"]]
            })
            clock += PICKUP_DURATION_MINUTES
            tracker.record_on_duty_not_driving(PICKUP_DURATION_MINUTES)

        elif post_activity == "DROPOFF":
            if tracker.remaining_window_time < DROPOFF_DURATION_MINUTES or tracker.remaining_cycle_minutes < DROPOFF_DURATION_MINUTES:
                total_rest_stops += 1
                rest_event = {
                    "type": "REST_10H",
                    "title": "10-Hour Pre-Dropoff Rest",
                    "status": STATUS_OFF_DUTY,
                    "start_minute": clock,
                    "end_minute": clock + REST_MINUTES,
                    "duration_minutes": REST_MINUTES,
                    "location": f"Staging Area - {dropoff_loc['display_name']}",
                    "description": "10-hour rest taken before dropoff activity",
                    "coords": [dropoff_loc["lat"], dropoff_loc["lng"]]
                }
                raw_events.append(rest_event)
                clock += REST_MINUTES
                tracker.record_10h_rest(REST_MINUTES)

            dropoff_event = {
                "type": "DROPOFF",
                "title": "Cargo Dropoff (1 Hour)",
                "status": STATUS_ON_DUTY_NOT_DRIVING,
                "start_minute": clock,
                "end_minute": clock + DROPOFF_DURATION_MINUTES,
                "duration_minutes": DROPOFF_DURATION_MINUTES,
                "location": dropoff_loc["display_name"],
                "description": "On duty unloading cargo & completing delivery manifest",
                "coords": [dropoff_loc["lat"], dropoff_loc["lng"]]
            }
            raw_events.append(dropoff_event)
            stop_markers.append({
                "type": "DROPOFF",
                "title": "Dropoff Location",
                "location": dropoff_loc["display_name"],
                "minute": clock,
                "time_display": minutes_to_12h_format(clock),
                "duration": "1 hour",
                "reason": "Cargo delivery & unloading",
                "coords": [dropoff_loc["lat"], dropoff_loc["lng"]]
            })
            clock += DROPOFF_DURATION_MINUTES
            tracker.record_on_duty_not_driving(DROPOFF_DURATION_MINUTES)

    # Post-trip completion off-duty fill up to midnight boundary of final day
    final_minute_of_day = ((clock // 1440) + 1) * 1440
    if clock < final_minute_of_day:
        raw_events.append({
            "type": "OFF_DUTY_FINAL",
            "title": "Post-Trip Off Duty",
            "status": STATUS_OFF_DUTY,
            "start_minute": clock,
            "end_minute": final_minute_of_day,
            "duration_minutes": final_minute_of_day - clock,
            "location": dropoff_loc["display_name"],
            "description": "Off duty following trip completion",
            "coords": [dropoff_loc["lat"], dropoff_loc["lng"]]
        })

    # Calculate summary metrics
    total_elapsed_minutes = final_minute_of_day
    total_days = max(1, total_elapsed_minutes // 1440)

    summary = {
        "total_distance_miles": route_info["total_distance_miles"],
        "total_driving_minutes": tracker.total_driving_minutes,
        "total_driving_formatted": format_minutes_duration(tracker.total_driving_minutes),
        "total_on_duty_minutes": tracker.total_driving_minutes + tracker.total_on_duty_not_driving_minutes,
        "total_on_duty_formatted": format_minutes_duration(tracker.total_driving_minutes + tracker.total_on_duty_not_driving_minutes),
        "total_trip_duration_days": total_days,
        "total_trip_duration_hours": round((clock - start_minute) / 60.0, 1),
        "fuel_stops_count": total_fuel_stops,
        "rest_stops_count": total_rest_stops,
        "restarts_count": total_restarts,
        "daily_logs_count": total_days,
        "initial_cycle_used_hours": cycle_used_hours,
        "final_cycle_used_hours": round(tracker.cycle_on_duty_minutes / 60.0, 1),
        "remaining_cycle_hours": round(tracker.remaining_cycle_minutes / 60.0, 1),
    }

    return raw_events, summary, stop_markers


def interpolate_along_coords(coords: List[List[float]], fraction: float) -> List[float]:
    """Helper to pick coordinate along coordinate array based on fraction 0.0 .. 1.0."""
    if not coords:
        return [0.0, 0.0]
    if len(coords) == 1:
        return coords[0]
    fraction = max(0.0, min(1.0, fraction))
    idx = int(round(fraction * (len(coords) - 1)))
    return coords[idx]


def split_events_into_calendar_days(raw_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Splits un-split absolute timeline events into discrete 24-hour calendar days.
    Guarantees every calendar day sums up to exactly 1440 minutes (24.0 hours).
    """
    if not raw_events:
        return []

    max_minute = max(ev["end_minute"] for ev in raw_events)
    num_days = max(1, math.ceil(max_minute / 1440.0))

    daily_schedules = []

    for day_idx in range(num_days):
        day_number = day_idx + 1
        day_start_min = day_idx * 1440
        day_end_min = (day_idx + 1) * 1440

        day_events = []

        for ev in raw_events:
            ev_start = ev["start_minute"]
            ev_end = ev["end_minute"]

            # Check overlap with day window [day_start_min, day_end_min]
            overlap_start = max(ev_start, day_start_min)
            overlap_end = min(ev_end, day_end_min)

            if overlap_start < overlap_end:
                duration = overlap_end - overlap_start

                # Minute relative to start of day 00:00
                rel_start = overlap_start - day_start_min
                rel_end = overlap_end - day_start_min

                day_events.append({
                    "type": ev["type"],
                    "title": ev["title"],
                    "status": ev["status"],
                    "start_minute_abs": overlap_start,
                    "end_minute_abs": overlap_end,
                    "start_minute_day": rel_start,
                    "end_minute_day": rel_end,
                    "start_time_formatted": minutes_to_hhmm(rel_start),
                    "end_time_formatted": minutes_to_hhmm(rel_end),
                    "duration_minutes": duration,
                    "duration_formatted": format_minutes_duration(duration),
                    "location": ev.get("location", ""),
                    "description": ev.get("description", ""),
                    "distance_miles": ev.get("distance_miles", 0),
                    "coords": ev.get("coords", [0, 0])
                })

        # Calculate duty breakdown totals for this day
        off_duty_min = sum(e["duration_minutes"] for e in day_events if e["status"] == STATUS_OFF_DUTY)
        sleeper_min = sum(e["duration_minutes"] for e in day_events if e["status"] == STATUS_SLEEPER_BERTH)
        driving_min = sum(e["duration_minutes"] for e in day_events if e["status"] == STATUS_DRIVING)
        on_duty_min = sum(e["duration_minutes"] for e in day_events if e["status"] == STATUS_ON_DUTY_NOT_DRIVING)

        total_day_min = off_duty_min + sleeper_min + driving_min + on_duty_min

        daily_schedules.append({
            "day_number": day_number,
            "day_label": f"Day {day_number}",
            "events": day_events,
            "totals": {
                "off_duty_minutes": off_duty_min,
                "off_duty_hours": round(off_duty_min / 60.0, 2),
                "sleeper_berth_minutes": sleeper_min,
                "sleeper_berth_hours": round(sleeper_min / 60.0, 2),
                "driving_minutes": driving_min,
                "driving_hours": round(driving_min / 60.0, 2),
                "on_duty_not_driving_minutes": on_duty_min,
                "on_duty_not_driving_hours": round(on_duty_min / 60.0, 2),
                "total_minutes": total_day_min,
                "total_hours": round(total_day_min / 60.0, 2)
            }
        })

    return daily_schedules
