from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .serializers import TodoSerializer
from .models import Todo


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")

class TodoView(viewsets.ModelViewSet):
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()