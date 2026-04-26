from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models, transaction
from django.dispatch import Signal
from django.conf import settings


pre_soft_delete = Signal()
post_soft_delete = Signal()


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        instances = list(self)
        now = timezone.now()

        with transaction.atomic():
            for obj in instances:
                pre_soft_delete.send(sender=obj.__class__, instance=obj)

            result = super().update(deleted_at=now)

            for obj in instances:
                obj.deleted_at = now
                post_soft_delete.send(sender=obj.__class__, instance=obj)

        return result, {self.model._meta.label: result}  # noqa

    def hard_delete(self):
        return super().delete()

    def alive(self):
        return self.filter(deleted_at__isnull=True)

    def dead(self):
        return self.filter(deleted_at__isnull=False)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class AllObjectsManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db)


class DTMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        abstract = True


class DTSoftMixin(DTMixin):
    """
    Soft delete mixin providing logical deletion without removing records.

    Inherits created_at and updated_at timestamps from DTMixin.
    Adds deleted_at field for soft deletion tracking.

    Attributes:
        deleted_at: Timestamp when record was soft-deleted (null if active)
        objects: Default manager - returns only non-deleted (alive) records
        all_objects: Manager returning all records including deleted ones

    Examples:
        Fetch only active (non-deleted) records:

            Agent.objects.all()

        Fetch all records (including deleted):

            Agent.all_objects.all()

        Filter to only deleted records:

            Agent.all_objects.dead()

        Soft-delete a record (sets deleted_at timestamp):

            agent = Agent.objects.get(pk=1)
            agent.delete()  # Sends pre_soft_delete and post_soft_delete signals

        Permanently delete a record:

            agent = Agent.objects.get(pk=1)
            agent.hard_delete()
    """
    deleted_at = models.DateTimeField(null=True, blank=True, default=None)

    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()


    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['deleted_at'], name='idx_%(class)s_delat',
                         condition=models.Q(deleted_at__isnull=True)),
        ]


    def delete(self, using=None, keep_parents=False):
        pre_soft_delete.send(sender=self.__class__, instance=self, using=using)

        self.deleted_at = timezone.now()
        self.save(using=using, update_fields=['deleted_at'])

        post_soft_delete.send(sender=self.__class__, instance=self, using=using)

        return 1, {self._meta.label: 1}

    def hard_delete(self, using=None, keep_parents=False):
        return super().delete(using=using, keep_parents=keep_parents)
