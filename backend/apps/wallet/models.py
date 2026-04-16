from django.db import models
from apps.users.models import User
import decimal

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def credit(self, amount, description='', reference=''):
        self.balance += decimal.Decimal(str(amount))
        self.save()
        WalletTransaction.objects.create(wallet=self, transaction_type='credit', amount=amount, description=description, reference_id=reference)

    def deduct(self, amount, description='', reference=''):
        if self.balance >= decimal.Decimal(str(amount)):
            self.balance -= decimal.Decimal(str(amount))
            self.save()
            WalletTransaction.objects.create(wallet=self, transaction_type='debit', amount=amount, description=description, reference_id=reference)
            return True
        return False

    def __str__(self):
        return f"{self.user.name}'s Wallet - ₹{self.balance}"

class WalletTransaction(models.Model):
    TYPE_CHOICES = [('credit','Credit'),('debit','Debit')]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=300)
    reference_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
