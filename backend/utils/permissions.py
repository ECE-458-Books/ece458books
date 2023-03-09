from rest_framework.permissions import BasePermission

class CustomBasePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET']:
            return request.user.is_authenticated
        elif request.method in ['POST', 'PATCH', 'DELETE']:
            return bool(request.user and request.user.is_active and request.user.is_staff)
        else:
            return False