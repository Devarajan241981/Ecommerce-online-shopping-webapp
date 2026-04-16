from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Wallet
from .serializers import WalletSerializer

class WalletView(APIView):
    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        return Response(WalletSerializer(wallet).data)
