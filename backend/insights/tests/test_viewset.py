import pytest
from faker import Faker
from rest_framework.test import APIClient

from authentication.models import Account
from insights.models import Insight
from project import ic


fake = Faker()

VALID_PAYLOAD = {
  'title': 'Global Rate Outlook',
  'category': 'Macro',
  'body': 'Central banks are navigating a delicate balance between inflation and growth.',
  'tags': ['rates', 'inflation'],
}

LIST_URL = '/api/insights/'
TOP_TAGS_URL = '/api/analytics/top-tags'


def detail(pk):
  return f'/api/insights/{pk}/'


@pytest.mark.django_db
class TestInsightList:
  def test_anon_can_list(self, anon):
    resp = anon.get(LIST_URL)
    assert resp.status_code == 200

  def test_lists_existing_insights(self, anon, insight):
    resp = anon.get(LIST_URL)
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['title'] == insight.title

  def test_soft_deleted_insight_excluded(self, anon, insight):
    insight.delete()
    resp = anon.get(LIST_URL)
    assert resp.data['count'] == 0


@pytest.mark.django_db
class TestInsightRetrieve:
  def test_anon_can_retrieve(self, anon, insight):
    resp = anon.get(detail(insight.pk))
    assert resp.status_code == 200
    assert resp.data['id'] == insight.id

  def test_returns_expected_fields(self, anon, insight):
    resp = anon.get(detail(insight.pk))
    for field in ('id', 'title', 'category', 'body', 'tags', 'created_at', 'updated_at'):
      assert field in resp.data

  def test_nonexistent_returns_404(self, anon):
    resp = anon.get(detail(99999))
    assert resp.status_code == 404


@pytest.mark.django_db
class TestInsightCreate:
  def test_anon_cannot_create(self, anon):
    resp = anon.post(LIST_URL, VALID_PAYLOAD, format='json')
    assert resp.status_code in (401, 403)

  def test_authenticated_can_create(self, auth_client):
    resp = auth_client.post(LIST_URL, VALID_PAYLOAD, format='json')
    assert resp.status_code == 201

  def test_owner_set_to_request_user(self, auth_client, user):
    auth_client.post(LIST_URL, VALID_PAYLOAD, format='json')
    assert Insight.objects.get(title=VALID_PAYLOAD['title']).owner == user

  def test_response_contains_expected_fields(self, auth_client):
    resp = auth_client.post(LIST_URL, VALID_PAYLOAD, format='json')
    for field in ('id', 'title', 'category', 'body', 'tags', 'created_at'):
      assert field in resp.data


@pytest.mark.django_db
class TestInsightUpdate:
  def test_anon_cannot_update(self, anon, insight):
    resp = anon.patch(detail(insight.pk), {'title': 'Hacked'}, format='json')
    assert resp.status_code in (401, 403)

  def test_owner_can_partial_update(self, auth_client, insight):
    resp = auth_client.patch(detail(insight.pk), {'title': 'Updated Title'}, format='json')
    assert resp.status_code == 200
    assert resp.data['title'] == 'Updated Title'

  def test_owner_can_full_update(self, auth_client, insight):
    payload = {**VALID_PAYLOAD, 'title': 'Completely New Title'}
    resp = auth_client.put(detail(insight.pk), payload, format='json')
    assert resp.status_code == 200
    assert resp.data['title'] == 'Completely New Title'

  def test_non_owner_cannot_update(self, other_client, insight):
    resp = other_client.patch(detail(insight.pk), {'title': 'Hijacked'}, format='json')
    assert resp.status_code == 403


@pytest.mark.django_db
class TestInsightDelete:
  def test_anon_cannot_delete(self, anon, insight):
    resp = anon.delete(detail(insight.pk))
    assert resp.status_code in (401, 403)

  def test_non_owner_cannot_delete(self, other_client, insight):
    resp = other_client.delete(detail(insight.pk))
    assert resp.status_code == 403

  def test_owner_can_delete(self, auth_client, insight):
    resp = auth_client.delete(detail(insight.pk))
    assert resp.status_code == 204

  def test_delete_is_soft(self, auth_client, insight):
    auth_client.delete(detail(insight.pk))
    assert Insight.all_objects.filter(pk=insight.pk).exists()
    assert not Insight.objects.filter(pk=insight.pk).exists()

  def test_deleted_insight_returns_404_on_retrieve(self, auth_client, insight):
    auth_client.delete(detail(insight.pk))
    resp = auth_client.get(detail(insight.pk))
    assert resp.status_code == 404


@pytest.mark.django_db
class TestInsightFiltering:
  def test_search_by_title(self, anon, user):
    Insight.objects.create(title='Dollar Strength', category='Macro', body=fake.text(), tags=[], owner=user)
    Insight.objects.create(title='Tech Earnings', category='Equities', body=fake.text(), tags=[], owner=user)
    resp = anon.get(LIST_URL + '?search=dollar')
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['title'] == 'Dollar Strength'

  def test_search_is_case_insensitive(self, anon, user):
    Insight.objects.create(title='Dollar Strength', category='Macro', body=fake.text(), tags=[], owner=user)
    resp = anon.get(LIST_URL + '?search=DOLLAR')
    assert resp.data['count'] == 1

  def test_filter_by_category(self, anon, user):
    Insight.objects.create(title='Bond Rally', category='FixedIncome', body=fake.text(), tags=[], owner=user)
    Insight.objects.create(title='Tech Boom', category='Equities', body=fake.text(), tags=[], owner=user)
    resp = anon.get(LIST_URL + '?category=FixedIncome')
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['title'] == 'Bond Rally'

  def test_filter_by_tag(self, anon, user):
    Insight.objects.create(title='Rate Watch', category='Macro', body=fake.text(), tags=['rates', 'fed'], owner=user)
    Insight.objects.create(title='Equity Pick', category='Equities', body=fake.text(), tags=['growth'], owner=user)
    resp = anon.get(LIST_URL + '?tag=rates')
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['title'] == 'Rate Watch'

  def test_no_match_returns_empty(self, anon, insight):
    resp = anon.get(LIST_URL + '?search=zzznomatch')
    assert resp.data['count'] == 0

  def test_combined_search_and_category(self, anon, user):
    Insight.objects.create(title='Rate Hike', category='Macro', body=fake.text(), tags=[], owner=user)
    Insight.objects.create(title='Rate Rally', category='Equities', body=fake.text(), tags=[], owner=user)
    resp = anon.get(LIST_URL + '?search=rate&category=Macro')
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['title'] == 'Rate Hike'


@pytest.mark.django_db
class TestInsightValidation:

  # title
  def test_title_minmax_length_accepted(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': 'Hello'}, format='json')
    assert resp.status_code == 201
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': 'A' * 200}, format='json')
    assert resp.status_code == 201

  def test_title_too_short_rejected(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': 'Hi'}, format='json')
    assert resp.status_code == 400
    assert 'title' in resp.data

  def test_title_over_limit_rejected(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': 'A' * 201}, format='json')
    assert resp.status_code == 400
    assert 'title' in resp.data

  # body
  def test_body_too_short_rejected(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': 'Short'}, format='json')
    assert resp.status_code == 400
    assert 'body' in resp.data

  def test_body_minmax_length_accepted(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': 'x' * 10}, format='json')
    assert resp.status_code == 201
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': 'x' * 10_000}, format='json')
    assert resp.status_code == 201

  def test_body_over_limit_rejected(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': 'x' * 10_001}, format='json')
    assert resp.status_code == 400
    assert 'body' in resp.data

  def test_empty_body_rejected(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': ''}, format='json')
    assert resp.status_code == 400

  # category
  def test_invalid_category_rejected(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'category': 'Crypto'}, format='json')
    assert resp.status_code == 400
    assert 'category' in resp.data

  def test_all_valid_categories_accepted(self, auth_client):
    for cat in ('Macro', 'Equities', 'FixedIncome', 'Alternatives'):
      resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': f'Test {cat}', 'category': cat}, format='json')
      assert resp.status_code == 201, f'Expected 201 for category={cat}, got {resp.status_code}'

  # missing required fields
  def test_missing_title_rejected(self, auth_client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != 'title'}
    resp = auth_client.post(LIST_URL, payload, format='json')
    assert resp.status_code == 400
    assert 'title' in resp.data

  def test_missing_body_rejected(self, auth_client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != 'body'}
    resp = auth_client.post(LIST_URL, payload, format='json')
    assert resp.status_code == 400
    assert 'body' in resp.data

  def test_missing_category_rejected(self, auth_client):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != 'category'}
    resp = auth_client.post(LIST_URL, payload, format='json')
    assert resp.status_code == 400
    assert 'category' in resp.data

  def test_body_exactly_at_minmax(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': 'x' * 10}, format='json')
    assert resp.status_code == 201
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'body': 'x' * 10_000}, format='json')
    assert resp.status_code == 201

  def test_title_exactly_at_minmax(self, auth_client):
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': 'x' * 5}, format='json')
    assert resp.status_code == 201
    resp = auth_client.post(LIST_URL, {**VALID_PAYLOAD, 'title': 'x' * 200}, format='json')
    assert resp.status_code == 201


@pytest.mark.django_db
class TestTopTagsView:
  def test_anon_can_access(self, anon):
    resp = anon.get(TOP_TAGS_URL)
    assert resp.status_code == 200

  def test_returns_list(self, anon):
    resp = anon.get(TOP_TAGS_URL)
    assert isinstance(resp.data, list)

  def test_empty_when_no_insights(self, anon):
    resp = anon.get(TOP_TAGS_URL)
    assert resp.data == []

  def test_capped_at_ten_entries(self, anon, user):
    tags = [f'tag{i}' for i in range(15)]
    Insight.objects.create(title='Big', category='Macro', body=fake.text(), tags=tags, owner=user)
    resp = anon.get(TOP_TAGS_URL)
    assert len(resp.data) <= 10

  def test_each_entry_has_name_and_count(self, anon, user):
    Insight.objects.create(title='A', category='Macro', body=fake.text(), tags=['rates'], owner=user)
    resp = anon.get(TOP_TAGS_URL)
    entry = resp.data[0]
    assert 'name' in entry
    assert 'count' in entry

  def test_soft_deleted_insights_excluded(self, anon, user):
    insight = Insight.objects.create(title='A', category='Macro', body=fake.text(), tags=['rates'], owner=user)
    insight.delete()
    resp = anon.get(TOP_TAGS_URL)
    assert resp.data == []
