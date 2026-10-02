from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status


class TripPlannerApiTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_plan_trip_success(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "cycle_used": 12.0,
            "start_time": "06:00"
        }
        response = self.client.post('/api/trips/plan/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn("trip_summary", data)
        self.assertIn("route", data)
        self.assertIn("stops", data)
        self.assertIn("timeline", data)
        self.assertIn("daily_logs", data)

        summary = data["trip_summary"]
        self.assertGreater(summary["total_distance_miles"], 0)
        self.assertEqual(summary["initial_cycle_used_hours"], 12.0)

    def test_validation_empty_locations(self):
        payload = {
            "current_location": "",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "cycle_used": 12.0
        }
        response = self.client.post('/api/trips/plan/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertIn("error", data)

    def test_validation_cycle_hours_exceeded(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "cycle_used": 85.0
        }
        response = self.client.post('/api/trips/plan/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validation_negative_cycle(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Indianapolis, IN",
            "dropoff_location": "Atlanta, GA",
            "cycle_used": -5.0
        }
        response = self.client.post('/api/trips/plan/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_health_check(self):
        response = self.client.get('/api/trips/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
