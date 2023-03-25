from rest_framework import status, filters
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .exceptions import NoRefreshTokenWhenLoggingOut, ModifyUserError

from .serializers import AdminUserModifySerializer, UserListSerializer, RegistrationSerializer, ChangePasswordSerializer
from .models import User
from .paginations import UsersPagination
from books.utils import str2bool
from .utils import can_modify

class UserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        username = request.user.username
        queryset = User.objects.filter(is_active=True, username=username)
        is_staff = queryset[0].is_staff
        return Response({
            "is_staff": is_staff
        }, status=status.HTTP_200_OK)


class UserListAPIView(ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    pagination_class = UsersPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = '__all__'
    ordering = ['id']

    def get_queryset(self):
        default_queryset = User.objects.filter(is_active=True)
    
        if str2bool(self.request.query_params.get('is_staff')):
            default_queryset = User.objects.filter(is_staff=True)
        
        return default_queryset

class RegistrationAPIView(CreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = RegistrationSerializer

class UserRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserModifySerializer
    lookup_field = 'id'
    queryset = User.objects.filter(is_active=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        is_modifiable, error_msg = can_modify(request, instance)

        if not is_modifiable:
            raise ModifyUserError(error_msg)
        
        # Deleting a User means setting is_active to False
        instance.is_active = False
        instance.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

class ChangePasswordView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    queryset = User.objects.all()
    lookup_field = 'id'

    # Override Update for default behavior
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        if request.user != instance:
            # This means a user is trying to change another user's pw
            raise ModifyUserError("Not allowed to change another user's password")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response({"status":"success"}, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

class LogOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except KeyError as ke:
            raise NoRefreshTokenWhenLoggingOut(str(ke))
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        case_insensitive_username = request.data.get('username').strip().lower()

        data = dict()
        user = User.objects.filter(username=case_insensitive_username)[0]
        data['id'] = user.id
        data['is_staff'] = user.is_staff

        data.update(serializer.validated_data)
    
        return Response(data, status=status.HTTP_200_OK)