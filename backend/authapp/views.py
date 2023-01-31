from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegistrationSerializer, UserSerializer
from .renderers import UserJSONRenderer


class RegistrationAPIView(CreateAPIView):
    # static variables
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        user = request.data.get('user-registration', {})

        user_serializer = self.serializer_class(data=user)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        return Response(user_serializer.data, status=status.HTTP_201_CREATED)


class LoginAPIView(TokenObtainPairView):
    renderer_classes = (UserJSONRenderer,)


class UserRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    # static vars
    permission_classes = (IsAuthenticated,)
    renderer_classes = (UserJSONRenderer,)
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        user_serializer = self.serializer_class(request.user)

        return Response(user_serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        serializer_data = request.data.get('user', {})

        serializer = self.serializer_class(request.user, data=serializer_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)
