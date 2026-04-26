from django.conf import settings as django_settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import AccountSerializer


REFRESH_COOKIE = 'refresh_token'


def _refresh_cookie_kwargs():
  lifetime = django_settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME']
  return {
    'key': REFRESH_COOKIE,
    'httponly': True,
    'secure': not django_settings.DEBUG,
    'samesite': 'Lax',
    'max_age': int(lifetime.total_seconds()),
    'path': '/',
  }


class AuthLoginView(TokenObtainPairView):
  """Log in the user."""

  def post(self, request, *args, **kwargs):
    response = super().post(request, *args, **kwargs)
    if response.status_code == 200:
      if refresh := response.data.pop('refresh', None):
        response.set_cookie(value=refresh, **_refresh_cookie_kwargs())
    return response


class AuthRegenerateTokenView(TokenRefreshView):
  """Regenerate an expired access token."""

  def post(self, request, *args, **kwargs):
    if not (refresh := request.COOKIES.get(REFRESH_COOKIE)):
      return Response({'detail': 'Refresh token not found.'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = self.get_serializer(data={'refresh': refresh})
    try:
      serializer.is_valid(raise_exception=True)
    except TokenError as e:
      raise InvalidToken(e.args[0])

    response = Response(serializer.validated_data, status=status.HTTP_200_OK)

    # Handle refresh token rotation if ROTATE_REFRESH_TOKENS is enabled
    if new_refresh := response.data.pop('refresh', None):
      response.set_cookie(value=new_refresh, **_refresh_cookie_kwargs())

    return response


class AuthLogoutView(APIView):
  permission_classes = (AllowAny,)

  def post(self, request):
    response = Response({'detail': 'Logged out.'})
    response.delete_cookie(REFRESH_COOKIE, path='/')
    return response
