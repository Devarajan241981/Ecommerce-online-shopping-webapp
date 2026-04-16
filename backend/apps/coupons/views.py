from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer
import decimal

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = (request.data.get('code') or '').strip().upper()
        if not code:
            return Response({'valid': False, 'error': 'Coupon code is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            order_total = decimal.Decimal(str(request.data.get('order_total', 0)))
        except (decimal.InvalidOperation, TypeError, ValueError):
            return Response({'valid': False, 'error': 'Invalid order total.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            coupon = Coupon.objects.filter(code__iexact=code).first()
            if not coupon:
                return Response({'valid': False, 'error': 'Invalid coupon code.'})
            if coupon.is_valid(order_total):
                discount = coupon.get_discount(order_total)
                return Response({'valid': True, 'discount': str(discount), 'description': coupon.description})
            return Response({'valid': False, 'error': coupon.invalid_reason(order_total)})
        except Exception:
            return Response({'valid': False, 'error': 'Invalid coupon code.'})

class AdminCouponListCreateView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
