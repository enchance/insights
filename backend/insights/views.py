import os
from collections import Counter
from rest_framework import viewsets, permissions, decorators, response, generics
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Insight
from .serializers import InsightSerializer

from project import ic


class InsightViewSet(viewsets.ModelViewSet):
  queryset = Insight.objects.all().order_by('-created_at')
  serializer_class = InsightSerializer
  permission_classes = [permissions.DjangoModelPermissionsOrAnonReadOnly]

  def get_queryset(self):
    qs = super().get_queryset()
    search = self.request.query_params.get('search')
    category = self.request.query_params.get('category')
    tag = self.request.query_params.get('tag')
    if search:
      qs = qs.filter(title__icontains=search)
    if category:
      qs = qs.filter(category=category)
    if tag:
      qs = qs.filter(tags__icontains=tag)
    return qs


@decorators.api_view(['GET'])
@permission_classes([permissions.AllowAny])
def top_tags(request):
  tags = Insight.objects.values_list('tags', flat=True)
  c = Counter()
  for arr in tags:
    if isinstance(arr, list):
      c.update(arr)
  top = [{'name': k, 'count': v} for k, v in c.most_common(10)]
  return response.Response({'tags': top})


class TestView(APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request):
    try:
      datadict = dict(title='Test', category=Insight.Category.ALTERNATIVES, body='foo here')
      item = Insight.objects.create(**datadict)
      serl = InsightSerializer(item)
      return Response(serl.data)
      raise Exception('NO ITEM')
    except Exception as e:
      raise
