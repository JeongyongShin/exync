from django.contrib import admin
from django.views.generic.base import RedirectView
from django.conf.urls import url
from django.urls import path, re_path
from app.views import login  # Ensure this is the correct import path
from .interceptor import interceptor
from proxy.views import ProxyView
import app.views

urlpatterns = [
    path('admin/', admin.site.urls),
    # url(r'^grafana/(?P<path>.*)$', ProxyView.as_view(upstream='http://192.168.0.4:3000/login')),
    re_path(r'^favicon\.ico$', RedirectView.as_view(url='/static/favicon.ico', permanent=True)),

    # Update the login URL pattern
    path('cloud/login/', login, name='cloud_login'),  # Adjusted URL pattern for login

    # Grafana 로그인 페이지로 리다이렉션하는 패턴을 추가합니다.
    path('login/', ProxyView.as_view(upstream='http://192.168.0.4:3000/')),

    # Add a new pattern for the '/server' URL.
    # This pattern will use the interceptor to handle the redirection.
    path('server/', app.views.cloud, name='server'),

    # The interceptor pattern might catch all requests, so ensure it is last
    re_path(r'^.*', interceptor),
]
