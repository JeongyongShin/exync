from django.contrib import admin
from django.conf.urls import url
from django.urls import path, re_path
from .interceptor import interceptor
from proxy.views import ProxyView


urlpatterns = [
    path('admin/', admin.site.urls),
    url('grafana/(?P<path>.*)$', ProxyView.as_view(upstream='http://localhost:3000/')),
    re_path(r'^.*', interceptor),
]
