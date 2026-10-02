import requests
import logging
from typing import Dict, Any, List, Tuple
from .utils import haversine_distance, interpolate_point

logger = logging.getLogger(__name__)

GEOCODE_CACHE: Dict[str, Dict[str, Any]] = {}

# Fallback coordinates for major US logistics hubs & cities
CITY_FALLBACKS: Dict[str, Dict[str, Any]] = {
    "chicago": {"lat": 41.8781, "lng": -87.6298, "display_name": "Chicago, IL, USA"},
    "indianapolis": {"lat": 39.7684, "lng": -86.1581, "display_name": "Indianapolis, IN, USA"},
    "atlanta": {"lat": 33.7490, "lng": -84.3880, "display_name": "Atlanta, GA, USA"},
    "new york": {"lat": 40.7128, "lng": -74.0060, "display_name": "New York, NY, USA"},
    "los angeles": {"lat": 34.0522, "lng": -118.2437, "display_name": "Los Angeles, CA, USA"},
    "dallas": {"lat": 32.7767, "lng": -96.7970, "display_name": "Dallas, TX, USA"},
    "houston": {"lat": 29.7604, "lng": -95.3698, "display_name": "Houston, TX, USA"},
    "denver": {"lat": 39.7392, "lng": -104.9903, "display_name": "Denver, CO, USA"},
    "seattle": {"lat": 47.6062, "lng": -122.3321, "display_name": "Seattle, WA, USA"},
    "miami": {"lat": 25.7617, "lng": -80.1918, "display_name": "Miami, FL, USA"},
    "phoenix": {"lat": 33.4484, "lng": -112.0740, "display_name": "Phoenix, AZ, USA"},
    "st. louis": {"lat": 38.6270, "lng": -90.1994, "display_name": "St. Louis, MO, USA"},
    "nashville": {"lat": 36.1627, "lng": -86.7816, "display_name": "Nashville, TN, USA"},
    "columbus": {"lat": 39.9612, "lng": -82.9988, "display_name": "Columbus, OH, USA"},
    "detroit": {"lat": 42.3314, "lng": -83.0458, "display_name": "Detroit, MI, USA"},
}


def geocode_location(query: str) -> Dict[str, Any]:
    """
    Geocodes a location query string to lat/lng and formatted display name.
    Uses in-memory cache, Nominatim API with fallback for robustness.
    """
    clean_query = query.strip()
    cache_key = clean_query.lower()

    if cache_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[cache_key]

    # Check fallbacks first for instant match
    for city_key, fallback_data in CITY_FALLBACKS.items():
        if city_key in cache_key:
            GEOCODE_CACHE[cache_key] = {
                "name": clean_query,
                "display_name": fallback_data["display_name"],
                "lat": fallback_data["lat"],
                "lng": fallback_data["lng"]
            }
            return GEOCODE_CACHE[cache_key]

    # Call Nominatim API
    try:
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "SpotterELDPlanner/1.0 (take-home-assessment)"}
        params = {"q": clean_query, "format": "json", "limit": 1}
        response = requests.get(url, headers=headers, params=params, timeout=5)

        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                result = {
                    "name": clean_query,
                    "display_name": data[0].get("display_name", clean_query),
                    "lat": float(data[0]["lat"]),
                    "lng": float(data[0]["lon"])
                }
                GEOCODE_CACHE[cache_key] = result
                return result
    except Exception as e:
        logger.warning(f"Geocoding API error for query '{query}': {e}")

    # Fallback if Nominatim failed and not in dictionary: derive pseudo coords based on hash
    h = sum(ord(c) for c in clean_query)
    lat = 35.0 + (h % 100) / 10.0
    lng = -95.0 - (h % 300) / 10.0
    result = {
        "name": clean_query,
        "display_name": f"{clean_query} (Estimated Location)",
        "lat": round(lat, 4),
        "lng": round(lng, 4)
    }
    GEOCODE_CACHE[cache_key] = result
    return result


def fetch_osrm_leg(p1: Dict[str, Any], p2: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches route between point 1 and point 2 from OSRM public API.
    """
    lat1, lon1 = p1["lat"], p1["lng"]
    lat2, lon2 = p2["lat"], p2["lng"]

    # Direct distance check
    direct_miles = haversine_distance(lat1, lon1, lat2, lon2)
    if direct_miles < 0.1:
        return {
            "distance_miles": 0.0,
            "duration_minutes": 0,
            "coordinates": [[lat1, lon1]]
        }

    try:
        osrm_url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
        res = requests.get(osrm_url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                route = data["routes"][0]
                distance_meters = route["distance"]
                duration_seconds = route["duration"]

                distance_miles = round(distance_meters * 0.000621371, 1)
                duration_minutes = max(1, int(round(duration_seconds / 60.0)))

                # GeoJSON coordinates are [lon, lat] -> convert to [lat, lon]
                geo_coords = route["geometry"]["coordinates"]
                lat_lng_coords = [[coord[1], coord[0]] for coord in geo_coords]

                return {
                    "distance_miles": distance_miles,
                    "duration_minutes": duration_minutes,
                    "coordinates": lat_lng_coords
                }
    except Exception as e:
        logger.warning(f"OSRM API call failed: {e}")

    # Fallback route calculation: Haversine distance with 1.2 road curvature factor
    road_miles = round(direct_miles * 1.2, 1)
    # Average speed 55 mph -> 0.9167 miles per minute
    drive_minutes = max(5, int(round((road_miles / 55.0) * 60)))

    # Generate interpolated waypoints along path
    num_points = max(10, int(road_miles / 20))
    path_coords = []
    for i in range(num_points + 1):
        frac = i / float(num_points)
        pt = interpolate_point(lat1, lon1, lat2, lon2, frac)
        path_coords.append([pt[0], pt[1]])

    return {
        "distance_miles": road_miles,
        "duration_minutes": drive_minutes,
        "coordinates": path_coords
    }


def calculate_full_trip_route(
    current_loc: Dict[str, Any],
    pickup_loc: Dict[str, Any],
    dropoff_loc: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculates combined route data across two legs:
    Leg 1: Current -> Pickup
    Leg 2: Pickup -> Dropoff
    """
    leg1 = fetch_osrm_leg(current_loc, pickup_loc)
    leg2 = fetch_osrm_leg(pickup_loc, dropoff_loc)

    total_distance_miles = round(leg1["distance_miles"] + leg2["distance_miles"], 1)
    total_driving_minutes = leg1["duration_minutes"] + leg2["duration_minutes"]

    # Combine polyline coordinates cleanly
    combined_coords = leg1["coordinates"] + leg2["coordinates"]

    return {
        "current_location": current_loc,
        "pickup_location": pickup_loc,
        "dropoff_location": dropoff_loc,
        "total_distance_miles": total_distance_miles,
        "total_driving_minutes": total_driving_minutes,
        "leg1": {
            "from": current_loc["display_name"],
            "to": pickup_loc["display_name"],
            "distance_miles": leg1["distance_miles"],
            "duration_minutes": leg1["duration_minutes"],
            "coordinates": leg1["coordinates"]
        },
        "leg2": {
            "from": pickup_loc["display_name"],
            "to": dropoff_loc["display_name"],
            "distance_miles": leg2["distance_miles"],
            "duration_minutes": leg2["duration_minutes"],
            "coordinates": leg2["coordinates"]
        },
        "full_coordinates": combined_coords
    }
