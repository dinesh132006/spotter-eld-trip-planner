from django.test import TestCase
from planner.routing import calculate_full_trip_route, geocode_location
from planner.scheduler import simulate_trip_timeline, split_events_into_calendar_days
from planner.utils import STATUS_ON_DUTY_NOT_DRIVING, STATUS_DRIVING, STATUS_OFF_DUTY


class SchedulerEngineTestCase(TestCase):
    def setUp(self):
        self.chicago = geocode_location("Chicago, IL")
        self.indianapolis = geocode_location("Indianapolis, IN")
        self.atlanta = geocode_location("Atlanta, GA")

    def test_short_trip_schedule(self):
        route = calculate_full_trip_route(self.chicago, self.indianapolis, self.atlanta)
        raw_events, summary, stop_markers = simulate_trip_timeline(
            route_info=route,
            cycle_used_hours=12.0,
            start_time_str="06:00"
        )

        pickup_events = [e for e in raw_events if e["type"] == "PICKUP"]
        self.assertEqual(len(pickup_events), 1)
        self.assertEqual(pickup_events[0]["duration_minutes"], 60)
        self.assertEqual(pickup_events[0]["status"], STATUS_ON_DUTY_NOT_DRIVING)

        dropoff_events = [e for e in raw_events if e["type"] == "DROPOFF"]
        self.assertEqual(len(dropoff_events), 1)
        self.assertEqual(dropoff_events[0]["duration_minutes"], 60)
        self.assertEqual(dropoff_events[0]["status"], STATUS_ON_DUTY_NOT_DRIVING)

        # Short trip < 1,000 miles requires 0 fuel stops
        self.assertEqual(summary["fuel_stops_count"], 0)

    def test_daily_split_totals_24_hours(self):
        route = calculate_full_trip_route(self.chicago, self.indianapolis, self.atlanta)
        raw_events, summary, _ = simulate_trip_timeline(route, cycle_used_hours=10.0, start_time_str="06:00")
        daily_schedules = split_events_into_calendar_days(raw_events)

        self.assertGreaterEqual(len(daily_schedules), 1)
        for day in daily_schedules:
            self.assertEqual(day["totals"]["total_minutes"], 1440)
            self.assertEqual(day["totals"]["total_hours"], 24.0)

    def test_fuel_stops_interval_regression(self):
        """
        Regression test to strictly verify:
        - First fuel stop <= 1,000.0 miles
        - Distance between consecutive fuel stops <= 1,000.0 miles
        - Distance from final fuel stop to destination <= 1,000.0 miles
        """
        ny = geocode_location("New York, NY")
        chicago = geocode_location("Chicago, IL")
        la = geocode_location("Los Angeles, CA")

        route = calculate_full_trip_route(ny, chicago, la)
        raw_events, summary, stop_markers = simulate_trip_timeline(route, cycle_used_hours=10.0, start_time_str="06:00")

        total_dist = summary["total_distance_miles"]
        fuel_events = [e for e in raw_events if e["type"] == "FUELING"]

        prev_miles = 0.0
        for idx, fuel_ev in enumerate(fuel_events):
            # Compute cumulative miles driven up to this fuel event
            ev_index = raw_events.index(fuel_ev)
            cum_miles = sum(e.get("distance_miles", 0) for e in raw_events[:ev_index])
            
            interval = cum_miles - prev_miles
            # Assert that no fuel interval exceeds 1000.0 miles
            self.assertLessEqual(cum_miles, 1000.0 * (idx + 1), f"Fuel Stop #{idx+1} at {cum_miles:.1f} mi exceeded 1,000-mile limit!")
            self.assertLessEqual(interval, 1000.0, f"Fuel interval #{idx+1} ({interval:.1f} mi) exceeded 1,000 miles!")
            prev_miles = cum_miles

        # Final segment from last fuel stop to destination
        final_segment = total_dist - prev_miles
        self.assertLessEqual(final_segment, 1000.0, f"Final segment to destination ({final_segment:.1f} mi) exceeded 1,000 miles!")

    def test_trip_slightly_above_1000_miles(self):
        """Test a trip of ~1,100 miles (e.g., New York, NY to Jacksonville, FL)."""
        ny = geocode_location("New York, NY")
        jax = geocode_location("Miami, FL")

        route = calculate_full_trip_route(ny, ny, jax)
        raw_events, summary, _ = simulate_trip_timeline(route, cycle_used_hours=0.0, start_time_str="06:00")

        if route["total_distance_miles"] > 1000.0:
            self.assertGreaterEqual(summary["fuel_stops_count"], 1)
            fuel_events = [e for e in raw_events if e["type"] == "FUELING"]
            ev_index = raw_events.index(fuel_events[0])
            first_fuel_miles = sum(e.get("distance_miles", 0) for e in raw_events[:ev_index])
            self.assertLessEqual(first_fuel_miles, 1000.0)
