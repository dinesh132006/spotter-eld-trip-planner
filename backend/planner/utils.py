import math

# Duty Status Constants
STATUS_OFF_DUTY = 'OFF_DUTY'
STATUS_SLEEPER_BERTH = 'SLEEPER_BERTH'
STATUS_DRIVING = 'DRIVING'
STATUS_ON_DUTY_NOT_DRIVING = 'ON_DUTY_NOT_DRIVING'

# HOS Rules Constants (Integer Minutes)
MAX_DRIVING_MINUTES = 660          # 11 hours maximum driving per window
MAX_WINDOW_MINUTES = 840           # 14 hours maximum duty window
BREAK_THRESHOLD_MINUTES = 480      # 8 cumulative driving hours requires 30-min break
BREAK_MINUTES = 30                 # 30-minute consecutive off-duty break
REST_MINUTES = 600                 # 10-hour consecutive off-duty rest period
RESTART_MINUTES = 2040             # 34-hour consecutive off-duty cycle restart
CYCLE_MAX_MINUTES = 4200           # 70-hour cycle limit

# Trip Event Durations (Integer Minutes)
PICKUP_DURATION_MINUTES = 60       # 1 hour pickup
DROPOFF_DURATION_MINUTES = 60      # 1 hour dropoff
FUEL_DURATION_MINUTES = 30         # 30 minutes fueling
FUEL_INTERVAL_MILES = 1000.0       # Fuel required at least once every 1,000 miles

DEFAULT_START_TIME = "06:00"       # Default trip start time (06:00 AM)


def hhmm_to_minutes(hhmm_str: str) -> int:
    """Converts HH:MM string to integer minutes from midnight."""
    if not hhmm_str or ':' not in hhmm_str:
        return 360  # Default 06:00 AM
    try:
        parts = hhmm_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1])
        return hours * 60 + minutes
    except ValueError:
        return 360


def minutes_to_hhmm(minutes: int) -> str:
    """Converts total minutes from start into 24-hour HH:MM format for a day."""
    min_in_day = minutes % 1440
    hours = min_in_day // 60
    mins = min_in_day % 60
    return f"{hours:02d}:{mins:02d}"


def minutes_to_12h_format(minutes: int) -> str:
    """Converts total minutes into human readable 12-hour format with AM/PM."""
    min_in_day = minutes % 1440
    hours = min_in_day // 60
    mins = min_in_day % 60
    period = "AM" if hours < 12 else "PM"
    display_hour = hours % 12
    if display_hour == 0:
        display_hour = 12
    return f"{display_hour:02d}:{mins:02d} {period}"


def format_minutes_duration(minutes: int) -> str:
    """Formats minute duration into 'Xh Ym' string."""
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0 and mins > 0:
        return f"{hours}h {mins}m"
    elif hours > 0:
        return f"{hours}h"
    else:
        return f"{mins}m"


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two lat/lng coordinates in miles.
    """
    R = 3958.8  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def interpolate_point(lat1: float, lon1: float, lat2: float, lon2: float, fraction: float) -> tuple[float, float]:
    """Interpolates lat/lng coordinate between point 1 and point 2 by fraction (0.0 to 1.0)."""
    fraction = max(0.0, min(1.0, fraction))
    lat = lat1 + (lat2 - lat1) * fraction
    lng = lon1 + (lon2 - lon1) * fraction
    return (round(lat, 6), round(lng, 6))
