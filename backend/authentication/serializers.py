from djoser.serializers import UserSerializer as BaseUserSerializer


class AccountSerializer(BaseUserSerializer):
  class Meta(BaseUserSerializer.Meta):
    fields = ('id', 'username', 'email', 'display')
