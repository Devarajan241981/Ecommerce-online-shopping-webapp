from django.db import models
from django.utils import timezone
import decimal

class Coupon(models.Model):
    TYPE_CHOICES = [('percentage','Percentage'),('fixed','Fixed Amount')]
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expiry_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    used_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.code is not None:
            self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def is_valid(self, order_total):
        order_total = decimal.Decimal(str(order_total))
        if not self.is_active:
            return False
        if timezone.now() > self.expiry_date:
            return False
        if order_total < self.min_order_value:
            return False
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False
        return True

    def invalid_reason(self, order_total):
        order_total = decimal.Decimal(str(order_total))
        if not self.is_active:
            return 'Coupon is inactive.'
        if timezone.now() > self.expiry_date:
            return 'Coupon has expired.'
        if order_total < self.min_order_value:
            return f"Minimum order value is ₹{self.min_order_value}."
        if self.usage_limit and self.used_count >= self.usage_limit:
            return 'Coupon usage limit reached.'
        return 'Coupon is not valid.'

    def get_discount(self, order_total):
        order_total = decimal.Decimal(str(order_total))
        if self.discount_type == 'percentage':
            discount = order_total * (self.discount_value / 100)
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:
            discount = self.discount_value
        discount = min(discount, order_total)
        return discount.quantize(decimal.Decimal('0.01'), rounding=decimal.ROUND_HALF_UP)

    def __str__(self):
        return self.code
