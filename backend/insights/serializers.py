from rest_framework import serializers
from .models import Insight


class InsightSerializer(serializers.ModelSerializer):
  def validate_title(self, val):
    if val and 5 <= len(val) <= 200:
      return val
    raise serializers.ValidationError("Title must be between 5 and 200 characters")

  def validate_tags(self, val):
    return list(set(val))

  def validate_body(self, val):
    if 10 <= len(val) <= 10_000:
      raise serializers.ValidationError("Body must be between 10 and 1000 characters")
    return val

  class Meta:
    model = Insight
    fields = ['id', 'title', 'category', 'body', 'tags', 'created_at', 'updated_at', 'deleted_at']
