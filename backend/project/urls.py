from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView  # noqa


urlpatterns = [
  path('admin/', admin.site.urls),
  path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
  path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
  path('api/v1/', include('insights.urls')),
  re_path(r'^auth/', include('authentication.urls')),
]
