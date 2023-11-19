from django.conf import settings
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User

class UserBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None):
        print('===================')
        print(self)
        print(request)
        print('===================')
        login_valid = (settings.ADMIN_LOGIN == email)
        pwd_valid = check_password(password, settings.ADMIN_PASSWORD)
        if login_valid and pwd_valid:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Create a new user. There's no need to set a password
                # because only the password from settings.py is checked.
                user = User(email=email)
                user.is_staff = True
                user.is_superuser = True
                user.save()
            return user
        return None

    def get_user(self, user_id):
        print('===================')

        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
