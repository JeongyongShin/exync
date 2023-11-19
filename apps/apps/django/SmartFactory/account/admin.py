from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .forms import UserChangeForm, UserCreationForm
from .models import User


from django.utils.html import format_html_join
from django.utils.safestring import mark_safe


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('user_id', 'phone_number', 'api_key', 'is_admin')
    list_filter = ('is_admin',)
    fieldsets = (
        (None, {'fields': ('user_id', 'password')}),
        ('Personal info', {'fields': ('phone_number', 'api_key')}),
        ('Permissions', {'fields': ('is_admin',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('user_id', 'phone_number', 'password1', 'password2')}
         ),
    )
    search_fields = ('user_id',)
    ordering = ('user_id',)
    readonly_fields = ('api_key',)

    filter_horizontal = ()


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
