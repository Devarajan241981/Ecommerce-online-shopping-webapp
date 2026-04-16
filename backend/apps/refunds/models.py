from django.db import models
from apps.users.models import User
from apps.orders.models import Order, OrderItem

class Refund(models.Model):
    STATUS_CHOICES = [('requested','Requested'),('under_review','Under Review'),('approved','Approved'),('rejected','Rejected'),('processed','Processed')]
    REFUND_METHOD = [('wallet','Wallet'),('original','Original Payment Method')]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refunds')
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    admin_notes = models.TextField(blank=True)
    refund_method = models.CharField(max_length=20, choices=REFUND_METHOD, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    customer_choice = models.CharField(max_length=20, choices=REFUND_METHOD, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class RefundImage(models.Model):
    refund = models.ForeignKey(Refund, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='refunds/')
