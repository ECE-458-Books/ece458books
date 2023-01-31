from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from .views import RegistrationAPIView, UserRetrieveUpdateAPIView, ChangePasswordView

app_name = 'authapp'
urlpatterns = [
    path('users/register/', RegistrationAPIView.as_view()),
    path('users/login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('user/<email>/', UserRetrieveUpdateAPIView.as_view()),
    path('change_password/<username>/', ChangePasswordView.as_view()),
]
