from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

from .views import UserListAPIView, RegistrationAPIView, UserRetrieveUpdateDestroyAPIView, ChangePasswordView, LogOutView, UserAPIView

app_name = 'authapp'
urlpatterns = [
    path('/users', UserListAPIView.as_view()),
    path('/users/register', RegistrationAPIView.as_view()),
    path('/users/login', TokenObtainPairView.as_view()),
    path('/token/refresh', TokenRefreshView.as_view()),
    path('/user/<username>', UserRetrieveUpdateDestroyAPIView.as_view()),
    path('/user', UserAPIView.as_view()),
    path('/change_password/<username>', ChangePasswordView.as_view()),
    path('/users/logout', LogOutView.as_view()),
]
