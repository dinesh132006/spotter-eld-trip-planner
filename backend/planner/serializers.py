from rest_framework import serializers


class TripPlanRequestSerializer(serializers.Serializer):
    current_location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={"blank": "Please enter a valid current location."}
    )
    pickup_location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={"blank": "Please enter a valid pickup location."}
    )
    dropoff_location = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        error_messages={"blank": "Please enter a valid dropoff location."}
    )
    cycle_used = serializers.FloatField(
        required=True,
        min_value=0.0,
        max_value=70.0,
        error_messages={
            "invalid": "Current cycle used must be a valid number.",
            "min_value": "Cycle hours used cannot be negative.",
            "max_value": "Cycle used cannot exceed 70 hours."
        }
    )
    start_time = serializers.CharField(
        required=False,
        default="06:00",
        max_length=10
    )
