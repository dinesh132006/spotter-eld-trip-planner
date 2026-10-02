from django.urls import path
from .views import PlanTripView, HealthCheckView

urlpatterns = [
    path('plan/', PlanTripView.as_view(), name='plan-trip'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
