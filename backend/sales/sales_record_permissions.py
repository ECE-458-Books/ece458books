from rest_framework import permissions


class SalesRecordsWhitelistPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        remote_ip_addr = request.META['HTTP_X_REAL_IP']
        return remote_ip_addr == "152.3.54.108"


class BodySizePermission(permissions.BasePermission):
    message = "Body must be under 1MB."
    code = 413

    def has_permission(self, request, view):
        return int(request.META["CONTENT_LENGTH"]) <= 1024 * 1024
