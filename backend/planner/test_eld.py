from django.test import TestCase
from planner.routing import calculate_full_trip_route, geocode_location
from planner.scheduler import simulate_trip_timeline, split_events_into_calendar_days
from planner.eld import generate_eld_daily_logs


class EldLogGeneratorTestCase(TestCase):
    def test_eld_log_generation(self):
        chicago = geocode_location("Chicago, IL")
        indy = geocode_location("Indianapolis, IN")
        atlanta = geocode_location("Atlanta, GA")

        route = calculate_full_trip_route(chicago, indy, atlanta)
        raw_events, summary, _ = simulate_trip_timeline(route, cycle_used_hours=12.0, start_time_str="06:00")
        daily_schedules = split_events_into_calendar_days(raw_events)

        logs = generate_eld_daily_logs(daily_schedules)
        self.assertEqual(len(logs), len(daily_schedules))

        for log in logs:
            self.assertIn("header", log)
            self.assertIn("svg_grid", log)
            self.assertIn("remarks", log)
            self.assertIn("duty_totals", log)

            self.assertEqual(log["header"]["carrier_name"], "Spotter Assessment Carrier")
            self.assertEqual(log["header"]["driver_name"], "Assessment Driver")

            self.assertTrue(log["svg_grid"]["path_d"].startswith("M"))
            self.assertEqual(log["duty_totals"]["total_hours"], 24.0)
