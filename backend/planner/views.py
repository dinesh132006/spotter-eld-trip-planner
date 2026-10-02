import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import exception_handler

from .serializers import TripPlanRequestSerializer
from .routing import geocode_location, calculate_full_trip_route
from .scheduler import simulate_trip_timeline, split_events_into_calendar_days
from .eld import generate_eld_daily_logs

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Formats standard JSON error responses without exposing tracebacks."""
    response = exception_handler(exc, context)
    if response is not None:
        custom_data = {
            "error": "Invalid Request",
            "message": response.data
        }
        response.data = custom_data
    return response


class PlanTripView(APIView):
    """
    POST /api/trips/plan/
    Calculates route, HOS compliance schedule, stop markers, timeline, and ELD daily logs.
    """

    def post(self, request):
        serializer = TripPlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            # Extract first user-friendly message
            first_msg = "Invalid input data."
            for field, msgs in errors.items():
                if isinstance(msgs, list) and len(msgs) > 0:
                    first_msg = str(msgs[0])
                    break
            return Response(
                {
                    "error": "Validation Error",
                    "message": first_msg,
                    "details": errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        current_loc_str = data["current_location"]
        pickup_loc_str = data["pickup_location"]
        dropoff_loc_str = data["dropoff_location"]
        cycle_used = data["cycle_used"]
        start_time = data.get("start_time", "06:00")

        try:
            # Step 1: Geocode locations
            current_loc = geocode_location(current_loc_str)
            pickup_loc = geocode_location(pickup_loc_str)
            dropoff_loc = geocode_location(dropoff_loc_str)

            if not current_loc or not pickup_loc or not dropoff_loc:
                return Response(
                    {
                        "error": "Geocoding Failed",
                        "message": "Unable to geocode one or more specified locations. Please verify city names."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Step 2: Calculate road route
            route_info = calculate_full_trip_route(current_loc, pickup_loc, dropoff_loc)

            # Step 3: Run HOS timeline simulation engine
            raw_events, summary, stop_markers = simulate_trip_timeline(
                route_info=route_info,
                cycle_used_hours=cycle_used,
                start_time_str=start_time
            )

            # Step 4: Split timeline into 24-hour calendar days
            daily_schedules = split_events_into_calendar_days(raw_events)

            # Step 5: Generate FMCSA ELD daily log sheets
            daily_logs = generate_eld_daily_logs(daily_schedules)

            # Assemble full response
            response_payload = {
                "trip_summary": summary,
                "route": route_info,
                "stops": stop_markers,
                "timeline": raw_events,
                "daily_schedules": daily_schedules,
                "daily_logs": daily_logs,
                "inputs": {
                    "current_location": current_loc_str,
                    "pickup_location": pickup_loc_str,
                    "dropoff_location": dropoff_loc_str,
                    "cycle_used": cycle_used,
                    "start_time": start_time
                }
            }

            return Response(response_payload, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error processing trip calculation")
            return Response(
                {
                    "error": "Calculation Failed",
                    "message": f"An unexpected error occurred while calculating your trip plan: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthCheckView(APIView):
    """GET /api/trips/health/"""

    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "Spotter ELD Trip Planner API",
                "version": "1.0.0"
            },
            status=status.HTTP_200_OK
        )
