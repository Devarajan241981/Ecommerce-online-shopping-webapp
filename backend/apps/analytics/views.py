from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order, OrderItem
from apps.users.models import User
from apps.payments.models import Payment
from apps.products.models import Product

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now()
        start_of_today = today.replace(hour=0, minute=0, second=0)
        last_30 = today - timedelta(days=30)

        total_revenue = Payment.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0
        today_revenue = Payment.objects.filter(status='paid', created_at__gte=start_of_today).aggregate(total=Sum('amount'))['total'] or 0
        total_orders = Order.objects.count()
        new_orders = Order.objects.filter(status='pending').count()
        total_customers = User.objects.filter(role='customer').count()
        on_delivery = Order.objects.filter(status='out_for_delivery').count()
        packed = Order.objects.filter(status='packed').count()
        shipped = Order.objects.filter(status='shipped').count()
        total_products = Product.objects.filter(is_active=True).count()
        pending_refunds = 0
        try:
            from apps.refunds.models import Refund
            pending_refunds = Refund.objects.filter(status__in=['requested','under_review']).count()
        except:
            pass

        return Response({
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'total_orders': total_orders,
            'new_orders': new_orders,
            'total_customers': total_customers,
            'on_delivery': on_delivery,
            'packed': packed,
            'shipped': shipped,
            'total_products': total_products,
            'pending_refunds': pending_refunds,
        })

class RevenueChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', '30')
        days = int(period)
        start = timezone.now() - timedelta(days=days)
        data = (Payment.objects.filter(status='paid', created_at__gte=start)
                .annotate(day=TruncDay('created_at'))
                .values('day')
                .annotate(revenue=Sum('amount'), orders=Count('id'))
                .order_by('day'))
        return Response([{'date': d['day'].strftime('%Y-%m-%d'), 'revenue': float(d['revenue']), 'orders': d['orders']} for d in data])

class OrderStatusChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = Order.objects.values('status').annotate(count=Count('id')).order_by('status')
        return Response(list(data))

class TopProductsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = (OrderItem.objects.filter(order__payment_status='paid')
                .values('product_name')
                .annotate(total_sold=Sum('quantity'), revenue=Sum('subtotal'))
                .order_by('-total_sold')[:10])
        return Response(list(data))

class MonthlySalesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = (Payment.objects.filter(status='paid')
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(revenue=Sum('amount'), orders=Count('id'))
                .order_by('month'))
        return Response([{'month': d['month'].strftime('%b %Y'), 'revenue': float(d['revenue']), 'orders': d['orders']} for d in data])

class CategorySalesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = (OrderItem.objects.filter(order__payment_status='paid')
                .values('product__category__name')
                .annotate(total=Sum('subtotal'), count=Sum('quantity'))
                .order_by('-total'))
        return Response(list(data))
