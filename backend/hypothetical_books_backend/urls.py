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

api_version = 1
api_prefix = f'api/v{api_version}/'

urlpatterns = [
    path(f'{api_prefix}books/', include('books.urls')),
    path(f'{api_prefix}genres/', include('genres.urls')),
    path(f'{api_prefix}vendors/', include('vendors.urls')),
    path(f'{api_prefix}sales/', include('sales.urls')),
    path(f'{api_prefix}purchase_orders/', include('purchase_orders.urls')),
    path(f'{api_prefix}auth/', include('authapp.urls', namespace='authentication')),
]
