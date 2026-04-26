import os
from collections import Counter
from rest_framework import viewsets, permissions, decorators, response, generics
from rest_framework.decorators import permission_classes
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Insight
from .serializers import InsightSerializer

from project import ic


class IsOwner(BasePermission):
  def has_object_permission(self, request, view, obj):
    return obj.owner == request.user


class InsightViewSet(viewsets.ModelViewSet):
  queryset = Insight.objects.all().order_by('-created_at')
  serializer_class = InsightSerializer
  permission_classes = [permissions.DjangoModelPermissionsOrAnonReadOnly]

  def get_queryset(self):
    qs = super().get_queryset()
    params = self.request.query_params;
    search = params.get('search')
    category = params.get('category')
    tag = params.get('tag')

    if search:
      qs = qs.filter(title__icontains=search)
    if category:
      qs = qs.filter(category=category)
    if tag:
      qs = qs.filter(tags__icontains=tag)
    return qs

  def get_permissions(self):
    if self.action in ('create'):
      return [permissions.IsAuthenticated()]
    if self.action in ('update', 'partial_update', 'destroy'):
      return [permissions.IsAuthenticated(), IsOwner()]
    return [permissions.AllowAny()]


class TopTagsView(APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request):
    tags = Insight.objects.values_list('tags', flat=True)
    c = Counter()
    for arr in tags:
      if isinstance(arr, list):
        c.update(arr)
    top = [{'name': k, 'count': v} for k, v in c.most_common(10)]
    return response.Response(top)


class TestView(APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request):
    try:
      datadict = dict(title='Test', category=Insight.Category.ALTERNATIVES, body='foo here')
      item = Insight.objects.create(**datadict)
      ser = InsightSerializer(item)
      return Response(ser.data)
      raise Exception('NO ITEM')
    except Exception as e:
      raise
