from typing import Dict, Any, List
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
)


class HosStateTracker:
    """
    Tracks state of driver's FMCSA hours of service clocks during trip simulation.
    """

    def __init__(self, cycle_used_hours: float):
        self.cycle_used_minutes = int(round(cycle_used_hours * 60))
        self.cycle_on_duty_minutes = self.cycle_used_minutes

        self.driving_in_window = 0         # Max 660 min (11h)
        self.window_elapsed = 0            # Max 840 min (14h)
        self.driving_since_break = 0       # Max 480 min (8h) before 30m break

        self.total_driving_minutes = 0
        self.total_on_duty_not_driving_minutes = 0
        self.total_off_duty_minutes = 0
        self.miles_since_last_fuel = 0.0

    @property
    def remaining_cycle_minutes(self) -> int:
        return max(0, CYCLE_MAX_MINUTES - self.cycle_on_duty_minutes)

    @property
    def remaining_driving_in_window(self) -> int:
        return max(0, MAX_DRIVING_MINUTES - self.driving_in_window)

    @property
    def remaining_window_time(self) -> int:
        return max(0, MAX_WINDOW_MINUTES - self.window_elapsed)

    @property
    def remaining_driving_before_break(self) -> int:
        return max(0, BREAK_THRESHOLD_MINUTES - self.driving_since_break)

    def record_driving(self, duration_minutes: int, miles: float):
        """Updates clocks for a driving duration."""
        self.driving_in_window += duration_minutes
        self.window_elapsed += duration_minutes
        self.driving_since_break += duration_minutes
        self.cycle_on_duty_minutes += duration_minutes
        self.total_driving_minutes += duration_minutes
        self.miles_since_last_fuel += miles

    def record_on_duty_not_driving(self, duration_minutes: int):
        """Updates clocks for on-duty non-driving activities (Pickup, Dropoff, Fueling)."""
        self.window_elapsed += duration_minutes
        self.cycle_on_duty_minutes += duration_minutes
        self.total_on_duty_not_driving_minutes += duration_minutes

    def record_short_break(self, duration_minutes: int):
        """
        Records a 30-minute off-duty break.
        Resets 30-min break driving counter, but 14-hour duty window continues to elapse!
        """
        self.window_elapsed += duration_minutes
        self.driving_since_break = 0
        self.total_off_duty_minutes += duration_minutes

    def record_10h_rest(self, duration_minutes: int = REST_MINUTES):
        """
        Records 10-hour consecutive off-duty rest.
        Resets 11-hour driving clock, 14-hour duty window, and 30-min break driving clock!
        """
        self.driving_in_window = 0
        self.window_elapsed = 0
        self.driving_since_break = 0
        self.total_off_duty_minutes += duration_minutes

    def record_34h_restart(self, duration_minutes: int = RESTART_MINUTES):
        """
        Records 34-hour consecutive off-duty restart.
        Resets 70-hour cycle on-duty clock to 0, plus 11-hour driving, 14-hour window, 30m break.
        """
        self.cycle_on_duty_minutes = 0
        self.driving_in_window = 0
        self.window_elapsed = 0
        self.driving_since_break = 0
        self.total_off_duty_minutes += duration_minutes


def validate_hos_compliance(events: List[Dict[str, Any]]) -> List[str]:
    """
    Validates a list of schedule events for any potential HOS violations.
    Returns list of warning strings if any non-compliance detected.
    """
    violations = []
    driving_in_win = 0
    win_elapsed = 0
    driving_since_brk = 0

    for idx, ev in enumerate(events):
        status = ev.get("status")
        duration = ev.get("duration_minutes", 0)

        if status == STATUS_DRIVING:
            driving_in_win += duration
            win_elapsed += duration
            driving_since_brk += duration

            if driving_in_win > MAX_DRIVING_MINUTES:
                violations.append(f"Event {idx + 1} ({ev.get('type')}) exceeded 11-hour driving limit.")
            if win_elapsed > MAX_WINDOW_MINUTES:
                violations.append(f"Event {idx + 1} ({ev.get('type')}) exceeded 14-hour duty window.")
            if driving_since_brk > BREAK_THRESHOLD_MINUTES:
                violations.append(f"Event {idx + 1} ({ev.get('type')}) drove > 8 hours without 30-min break.")

        elif status == STATUS_ON_DUTY_NOT_DRIVING:
            win_elapsed += duration
            if win_elapsed > MAX_WINDOW_MINUTES:
                violations.append(f"Event {idx + 1} ({ev.get('type')}) pushed duty window past 14 hours.")

        elif status == STATUS_OFF_DUTY or status == STATUS_SLEEPER_BERTH:
            if duration >= REST_MINUTES:
                driving_in_win = 0
                win_elapsed = 0
                driving_since_brk = 0
            elif duration >= BREAK_MINUTES:
                win_elapsed += duration
                driving_since_brk = 0
            else:
                win_elapsed += duration

    return violations
