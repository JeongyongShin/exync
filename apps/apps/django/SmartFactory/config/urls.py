from django.contrib import admin
from django.views.generic.base import RedirectView
from django.conf.urls import url
from django.urls import path, re_path
from app.views import login  # Ensure this is the correct import path
from .interceptor import interceptor
from proxy.views import ProxyView

urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'^grafana/(?P<path>.*)$', ProxyView.as_view(upstream='http://localhost:3000/')),
    re_path(r'^favicon\.ico$', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),

    # Update the login URL pattern
    path('cloud/login/', login, name='cloud_login'),  # Adjusted URL pattern for login

    # The interceptor pattern might catch all requests, so ensure it is last
    re_path(r'^.*', interceptor),
]
