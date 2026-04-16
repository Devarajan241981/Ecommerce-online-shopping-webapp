from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem, OrderTracking, Wishlist
from .serializers import *
from apps.products.models import Product, ProductVariant
from apps.coupons.models import Coupon
from apps.wallet.models import Wallet
import decimal
from decimal import Decimal

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

# Cart
class CartView(APIView):
    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        """Add item to cart"""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))
        product = get_object_or_404(Product, id=product_id)
        variant = get_object_or_404(ProductVariant, id=variant_id) if variant_id else None
        if variant and variant.stock < quantity:
            return Response({'error': 'Insufficient stock.'}, status=400)
        item, created = CartItem.objects.get_or_create(cart=cart, variant=variant, defaults={'product': product, 'quantity': quantity})
        if not created:
            item.quantity += quantity
            item.save()
        return Response(CartSerializer(cart).data)

    def put(self, request):
        """Update cart item quantity"""
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        """Remove item from cart"""
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.query_params.get('item_id')
        get_object_or_404(CartItem, id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart).data)

class ClearCartView(APIView):
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})

# Orders
class CreateOrderView(APIView):
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty.'}, status=400)
        address_id = request.data.get('address_id')
        coupon_code = request.data.get('coupon_code', '')
        use_wallet = request.data.get('use_wallet', False)

        from apps.users.models import Address
        address = get_object_or_404(Address, id=address_id, user=request.user)
        shipping_address = {
            'name': address.name, 'phone': address.phone,
            'line1': address.address_line1, 'line2': address.address_line2,
            'city': address.city, 'state': address.state, 'pincode': address.pincode
        }
        items_total = cart.total
        discount = Decimal('0.00')
        delivery = Decimal('0.00') if items_total >= Decimal('499') else Decimal('49.00')

        # Apply coupon
        if coupon_code:
            coupon = Coupon.objects.filter(code__iexact=coupon_code.strip()).first()
            if not coupon:
                return Response({'error': 'Invalid coupon code.'}, status=400)
            if coupon.is_valid(items_total):
                discount = coupon.get_discount(items_total)
            else:
                return Response({'error': coupon.invalid_reason(items_total)}, status=400)

        wallet_used = Decimal('0.00')
        if use_wallet:
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            amount_due = items_total - discount + delivery
            wallet_used = min(wallet.balance, amount_due)

        total = items_total - discount + delivery - wallet_used

        order = Order.objects.create(
            user=request.user,
            items_total=items_total,
            discount_amount=discount,
            delivery_charge=delivery,
            wallet_amount_used=wallet_used,
            total_amount=max(total, Decimal('0.00')),
            coupon_code=coupon_code.strip().upper() if coupon_code else '',
            shipping_address=shipping_address,
        )

        for item in cart.items.all():
            primary = item.product.images.filter(is_primary=True).first()
            img_url = primary.image.url if primary else ''
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_image=img_url,
                variant_info={'size': item.variant.size if item.variant else '', 'color': item.variant.color if item.variant else ''},
                quantity=item.quantity,
                unit_price=item.product.discounted_price_decimal(),
                subtotal=item.subtotal,
            )
            if item.variant:
                item.variant.stock -= item.quantity
                item.variant.save()

        if wallet_used > 0:
            wallet.deduct(wallet_used, f"Order #{order.order_number}")

        cart.items.all().delete()
        OrderTracking.objects.create(order=order, status='pending', description='Order placed successfully.')
        return Response({'order_id': order.id, 'order_number': order.order_number, 'total': str(order.total_amount)}, status=201)

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class CancelOrderView(APIView):
    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status in ['pending', 'confirmed']:
            order.status = 'cancelled'
            order.save()
            OrderTracking.objects.create(order=order, status='cancelled', description='Order cancelled by customer.')
            return Response({'message': 'Order cancelled.'})
        return Response({'error': 'Cannot cancel this order.'}, status=400)

# Admin order views
class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['status', 'payment_status']
    search_fields = ['order_number', 'user__name', 'user__email']

class AdminOrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

class AdminUpdateOrderStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status')
        location = request.data.get('location', '')
        description = request.data.get('description', f'Order status updated to {new_status}')
        if new_status:
            order.status = new_status
            order.save()
            OrderTracking.objects.create(order=order, status=new_status, description=description, location=location)
        return Response(OrderSerializer(order).data)

# Wishlist
class WishlistView(generics.ListAPIView):
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

class WishlistToggleView(APIView):
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            item.delete()
            return Response({'liked': False})
        return Response({'liked': True})
