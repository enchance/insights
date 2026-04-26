from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from authentication.models import Account


@admin.register(Account)
class AccountAdmin(UserAdmin):
    """Admin for Account model with Profile inline."""
    model = Account
    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'deleted_at')
