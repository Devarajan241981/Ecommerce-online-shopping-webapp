from django.db import models
from django.utils.text import slugify
from decimal import Decimal, ROUND_HALF_UP

class Category(models.Model):
    GENDER_CHOICES = [('men', 'Men'), ('women', 'Women'), ('unisex', 'Unisex'), ('kids', 'Kids')]
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='subcategories')
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.gender})"

class Product(models.Model):
    GENDER_CHOICES = [('men', 'Men'), ('women', 'Women'), ('unisex', 'Unisex'), ('kids', 'Kids')]
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    description = models.TextField()
    material = models.CharField(max_length=200, blank=True)
    care_instructions = models.TextField(blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    brand = models.CharField(max_length=100, default='ClothStore')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    tags = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def discounted_price_decimal(self) -> Decimal:
        """
        Discounted selling price as a Decimal quantized to 2dp (half-up).
        Use this for all monetary calculations to avoid float rounding issues.
        """
        if self.discount_percentage and self.discount_percentage > 0:
            pct = Decimal(self.discount_percentage)
            numerator = Decimal(100) - pct
            result = (self.base_price * numerator) / Decimal(100)
        else:
            result = self.base_price
        return result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def discounted_price(self):
        # Keep API output stable and precise: always return a 2dp string.
        return str(self.discounted_price_decimal())

    @property
    def primary_image(self):
        img = self.images.filter(is_primary=True).first()
        if not img:
            img = self.images.first()
        return img

    @property
    def avg_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0

    @property
    def review_count(self):
        return self.reviews.count()

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

class ProductVariant(models.Model):
    SIZE_CHOICES = [('XS','XS'),('S','S'),('M','M'),('L','L'),('XL','XL'),('XXL','XXL'),('XXXL','XXXL'),
                    ('28','28'),('30','30'),('32','32'),('34','34'),('36','36'),('38','38'),('40','40')]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=10, choices=SIZE_CHOICES)
    color = models.CharField(max_length=50)
    color_hex = models.CharField(max_length=7, default='#000000')
    stock = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = f"{self.product.id}-{self.size}-{self.color[:3].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.size}/{self.color}"

class SizeChart(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='size_chart')
    chart_image = models.ImageField(upload_to='sizecharts/', null=True, blank=True)
    chart_data = models.JSONField(default=dict)  # {size: {chest, waist, hip, length}}
