from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from project.mixins import DTSoftMixin, DTMixin, SoftDeleteQuerySet, AllObjectsManager


class AccountManager(BaseUserManager):
  """Manager for Account model with soft-delete support."""

  def get_queryset(self):
    return SoftDeleteQuerySet(self.model, using=self._db).alive()

  def create_user(self, username, password=None, **extra_fields):
    """Create and save a regular user."""
    extra_fields.setdefault('is_staff', False)
    extra_fields.setdefault('is_superuser', False)
    user = self.model(username=username, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_superuser(self, username, password=None, **extra_fields):
    """Create and save a superuser."""
    extra_fields.setdefault('is_staff', True)
    extra_fields.setdefault('is_superuser', True)
    return self.create_user(username, password, **extra_fields)


class Account(AbstractBaseUser, PermissionsMixin, DTSoftMixin):
  """
  Custom user model extending Django's AbstractBaseUser with soft-delete support.
  Uses username-based authentication. Roles are managed via Django Groups.
  """
  username = models.CharField(max_length=150, unique=True)
  email = models.EmailField(blank=True, db_index=True)
  display = models.CharField(max_length=150)
  # avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, max_length=1000)
  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=False)

  objects = AccountManager()
  all_objects = AllObjectsManager()

  USERNAME_FIELD = 'username'
  REQUIRED_FIELDS = ['email']

  def delete(self, using=None, keep_parents=False):
    self.profile.delete(using=using)
    return super().delete(using=using, keep_parents=keep_parents)

  def hard_delete(self, using=None, keep_parents=False):
    self.profile.hard_delete(using=using)
    return super().hard_delete(using=using, keep_parents=keep_parents)

  def save(self, *args, **kwargs):
    if not self.pk:
      self.display = self.username
    super().save(*args, **kwargs)

  def __str__(self):
    return self.username
