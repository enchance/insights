from django.conf import settings
from django.db import models

from project.mixins import DTSoftMixin


class Insight(DTSoftMixin):
  class Category(models.TextChoices):
    MACRO = 'macro', 'Macro'
    EQUITIES = 'equities', 'Equities'
    FIXED_INCOME = 'fixedincome', 'Fixed Income'
    ALTERNATIVES = 'alternatives', 'Alternatives'

  title = models.CharField(max_length=200)
  category = models.CharField(max_length=20, choices=Category.choices, db_index=True)  # noqa
  body = models.TextField()
  tags = models.JSONField(default=list)
  owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

  def __str__(self):
    return self.title

