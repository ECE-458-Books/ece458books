"""hypothetical_books_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.conf import settings
from .version import API_PREFIX

urlpatterns = [
    path(f'{API_PREFIX}books', include('books.urls')),
    path(f'{API_PREFIX}genres', include('genres.urls')),
    path(f'{API_PREFIX}vendors', include('vendors.urls')),
    path(f'{API_PREFIX}sales', include('sales.urls')),
    path(f'{API_PREFIX}purchase_orders', include('purchase_orders.urls')),
    path(f'{API_PREFIX}auth', include('authapp.urls', namespace='authentication')),
    path(f'{API_PREFIX}buybacks', include('buybacks.urls')),
]
