from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import CustomTokenObtainPairView, UserListAPIView, RegistrationAPIView, UserRetrieveUpdateDestroyAPIView, ChangePasswordView, LogOutView, UserAPIView

app_name = 'authapp'
urlpatterns = [
    path('/users', UserListAPIView.as_view()),
    path('/users/register', RegistrationAPIView.as_view()),
    path('/users/login', CustomTokenObtainPairView.as_view()),
    path('/users/logout', LogOutView.as_view()),
    path('/token/refresh', TokenRefreshView.as_view()),
    path('/user/change_password/<id>', ChangePasswordView.as_view()),
    path('/user/<id>', UserRetrieveUpdateDestroyAPIView.as_view()),
    path('/user', UserAPIView.as_view()),
]
