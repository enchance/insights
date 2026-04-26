from django.urls import path, include

from . import views


app_name = 'authentication'
urlpatterns = [
    # Override Djoser's users/me/ to support multipart avatar uploads
    path('', include('djoser.urls')),
    # Cookie-aware overrides — must come before djoser.urls.jwt
    path('jwt/login/', views.AuthLoginView.as_view(), name='jwt-login'),
    path('jwt/refresh/', views.AuthRegenerateTokenView.as_view(), name='jwt-refresh'),
    path('jwt/logout/', views.AuthLogoutView.as_view(), name='jwt-logout'),
    path('', include('djoser.urls.jwt')),
]
