import random
from faker import Faker

from authentication.models import Account
from insights.models import Insight
from project import ic

fake = Faker()


TEMP_SUPERUSER = {
    "username": "admin",
    "email": "admin@email.com",
    "password": "pass123",
}

def run():
  taglist = fake.words(nb=10)
  categories = [i.title() for i in fake.words(nb=5)]

  try:
    account = Account.objects.get(username=TEMP_SUPERUSER["username"])
  except Exception as e:  # noqa
      account = Account.objects.create_superuser(**TEMP_SUPERUSER)

  ll = []
  for _ in range(20) :
    tags = random.sample(taglist, random.randint(1, 5))
    item = Insight(title=fake.sentence(5)[:-1].title(), tags=tags, category=random.choice(categories), body=fake.text(), owner=account)
    ll.append(item)

  if ll:
    count = Insight.objects.bulk_create(ll)
    ic(f'Insights created {count} items')
