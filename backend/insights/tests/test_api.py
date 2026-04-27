import pytest
from faker import Faker
from rest_framework.test import APIClient

from authentication.models import Account
from insights.models import Insight


fake = Faker()


@pytest.mark.django_db
def test_list_insights_returns_empty_list_initially():
  client = APIClient()
  resp = client.get('/api/v1/insights/')
  assert resp.status_code == 200
  assert resp.data['results'] == []


@pytest.mark.django_db
def test_create_and_filter_insight(user):
  client = APIClient()
  # anonymous cannot create
  resp = client.post('/api/v1/insights/', {'title': 't', 'category': 'macro', 'body': 'b', 'tags': ['Inflation']},
                     format='json')
  assert resp.status_code in (401, 403)

  Insight.objects.create(title='Alpha', category=Insight.Category.MACRO, body=fake.text(), tags=['Rates', 'CPI'], owner=user)
  r = client.get('/api/v1/insights/?search=alp')
  assert r.status_code == 200
  assert r.data['count'] == 1

  a = client.get('/api/v1/analytics/top-tags')
  assert a.status_code == 200
  assert any(t['name'] == 'Rates' for t in a.data)
