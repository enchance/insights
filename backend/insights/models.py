from django.db import models

from project.mixins import DTSoftMixin


class Insight(DTSoftMixin):
  class Category(models.TextChoices):
    MACRO = 'Macro', 'Macro'
    EQUITIES = 'Equities', 'Equities'
    FIXED_INCOME = 'FixedIncome', 'Fixed Income'
    ALTERNATIVES = 'Alternatives', 'Alternatives'

  title = models.CharField(max_length=200)
  category = models.CharField(max_length=20, choices=Category.choices, db_index=True)  # noqa
  body = models.TextField()
  tags = models.JSONField(default=list)

  def __str__(self):
    return self.title

