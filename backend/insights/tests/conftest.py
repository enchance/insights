import pytest
from faker import Faker
from rest_framework.test import APIClient

from authentication.models import Account
from insights.models import Insight

fake = Faker()


@pytest.fixture
def user(db):
  return Account.objects.create_user(username='alice', password='pass123')


@pytest.fixture
def other_user(db):
  return Account.objects.create_user(username='bob', password='pass123')


@pytest.fixture
def anon():
  return APIClient()


@pytest.fixture
def auth_client(user):
  c = APIClient()
  c.force_authenticate(user=user)
  return c


@pytest.fixture
def other_client(other_user):
  c = APIClient()
  c.force_authenticate(user=other_user)
  return c


@pytest.fixture
def insight(user):
  return Insight.objects.create(
    title=fake.sentence(5)[:-1].title(),
    category=Insight.Category.MACRO,
    body=fake.text(),
    tags=fake.words(nb=2),
    owner=user,
  )
