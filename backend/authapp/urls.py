from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegistrationAPIView, LoginAPIView, UserRetrieveUpdateAPIView

app_name = 'authapp'
urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('users/', RegistrationAPIView.as_view()),
    path('users/login/', LoginAPIView.as_view()),
    path('user/', UserRetrieveUpdateAPIView.as_view()),
]
