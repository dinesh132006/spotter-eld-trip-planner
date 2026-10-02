from django.test import TestCase
from planner.hos import HosStateTracker, validate_hos_compliance
from planner.routing import calculate_full_trip_route, geocode_location
from planner.scheduler import simulate_trip_timeline
from planner.utils import (
    STATUS_DRIVING,
    STATUS_ON_DUTY_NOT_DRIVING,
    STATUS_OFF_DUTY,
    STATUS_SLEEPER_BERTH,
    MAX_DRIVING_MINUTES,
    MAX_WINDOW_MINUTES,
    REST_MINUTES,
    RESTART_MINUTES,
)


class HosEngineTestCase(TestCase):
    def test_initial_state(self):
        tracker = HosStateTracker(cycle_used_hours=12.0)
        self.assertEqual(tracker.cycle_used_minutes, 720)
        self.assertEqual(tracker.remaining_cycle_minutes, 4200 - 720)
        self.assertEqual(tracker.remaining_driving_in_window, 660)
        self.assertEqual(tracker.remaining_window_time, 840)

    def test_driving_limits(self):
        tracker = HosStateTracker(cycle_used_hours=0.0)
        tracker.record_driving(duration_minutes=300, miles=250.0)
        self.assertEqual(tracker.driving_in_window, 300)
        self.assertEqual(tracker.remaining_driving_in_window, 360)
        self.assertEqual(tracker.remaining_window_time, 540)
        self.assertEqual(tracker.miles_since_last_fuel, 250.0)

    def test_short_break_does_not_reset_11h_driving_or_14h_window(self):
        tracker = HosStateTracker(cycle_used_hours=0.0)
        tracker.record_driving(duration_minutes=480, miles=400.0)  # 8 hours driving
        self.assertEqual(tracker.driving_since_break, 480)
        self.assertEqual(tracker.driving_in_window, 480)

        # Record 30 min break
        tracker.record_short_break(duration_minutes=30)
        self.assertEqual(tracker.driving_since_break, 0)  # Reset break clock
        self.assertEqual(tracker.window_elapsed, 510)     # 14h window continued (480 + 30)
        self.assertEqual(tracker.driving_in_window, 480)  # 11h driving clock DID NOT RESET!

    def test_on_duty_activities_do_not_reset_11h_driving(self):
        tracker = HosStateTracker(cycle_used_hours=0.0)
        tracker.record_driving(duration_minutes=300, miles=250.0)
        self.assertEqual(tracker.driving_in_window, 300)

        # Record pickup (1h) and fueling (30m)
        tracker.record_on_duty_not_driving(duration_minutes=60)
        tracker.record_on_duty_not_driving(duration_minutes=30)

        # 11h driving clock must remain 300 minutes (not reset)
        self.assertEqual(tracker.driving_in_window, 300)
        # Window elapsed must include driving + on duty (300 + 60 + 30 = 390)
        self.assertEqual(tracker.window_elapsed, 390)

    def test_10h_rest_resets_clocks(self):
        tracker = HosStateTracker(cycle_used_hours=0.0)
        tracker.record_driving(duration_minutes=660, miles=550.0)  # 11 hours driving
        self.assertEqual(tracker.remaining_driving_in_window, 0)

        # 10-hour rest
        tracker.record_10h_rest(duration_minutes=REST_MINUTES)
        self.assertEqual(tracker.driving_in_window, 0)  # Reset driving clock to 0
        self.assertEqual(tracker.window_elapsed, 0)     # Reset window clock to 0
        self.assertEqual(tracker.remaining_driving_in_window, 660)
        self.assertEqual(tracker.remaining_window_time, 840)

    def test_34h_restart_resets_cycle(self):
        tracker = HosStateTracker(cycle_used_hours=65.0)  # 65 hours used
        self.assertEqual(tracker.remaining_cycle_minutes, 300)  # 5 hours left

        # Driver completes 5 hours on-duty -> cycle exhausted
        tracker.record_on_duty_not_driving(duration_minutes=300)
        self.assertEqual(tracker.remaining_cycle_minutes, 0)

        # 34-hour restart
        tracker.record_34h_restart(duration_minutes=RESTART_MINUTES)
        self.assertEqual(tracker.cycle_on_duty_minutes, 0)
        self.assertEqual(tracker.remaining_cycle_minutes, 4200)

    def test_no_duty_period_exceeds_11_cumulative_driving_hours(self):
        """
        Regression test ensuring no duty period (between 10-hour rests)
        exceeds 11 cumulative driving hours (660 minutes).
        """
        ny = geocode_location("New York, NY")
        chicago = geocode_location("Chicago, IL")
        la = geocode_location("Los Angeles, CA")

        route = calculate_full_trip_route(ny, chicago, la)
        raw_events, summary, _ = simulate_trip_timeline(route, cycle_used_hours=10.0, start_time_str="06:00")

        driving_in_duty_period = 0
        for ev in raw_events:
            status = ev.get("status")
            dur = ev.get("duration_minutes", 0)

            if status == STATUS_DRIVING:
                driving_in_duty_period += dur
                self.assertLessEqual(
                    driving_in_duty_period,
                    660,
                    f"Event {ev.get('type')} caused duty period driving to reach {driving_in_duty_period} mins (> 660 max)!"
                )
            elif status == STATUS_OFF_DUTY or status == STATUS_SLEEPER_BERTH:
                if dur >= REST_MINUTES:
                    driving_in_duty_period = 0

    def test_validate_hos_compliance_clean(self):
        events = [
            {"type": "DRIVING", "status": STATUS_DRIVING, "duration_minutes": 300},
            {"type": "BREAK", "status": STATUS_OFF_DUTY, "duration_minutes": 30},
            {"type": "DRIVING", "status": STATUS_DRIVING, "duration_minutes": 360},
            {"type": "REST", "status": STATUS_OFF_DUTY, "duration_minutes": 600}
        ]
        violations = validate_hos_compliance(events)
        self.assertEqual(len(violations), 0)
