# ClothStore - Full Stack E-Commerce Setup Guide

## 🚀 Quick Start

### Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Razorpay and Twilio credentials

# Database setup
python manage.py migrate

# Create admin user
python manage.py shell -c "
from apps.users.models import User
User.objects.create_superuser(
    email='admin@clothstore.in',
    password='Admin@123',
    name='Store Admin',
    phone='9999999999'
)
print('Admin created: admin@clothstore.in / Admin@123')
"

# Create sample categories
python manage.py shell -c "
from apps.products.models import Category
cats = [
    ('T-Shirts', 'men'), ('Shirts', 'men'), ('Jeans', 'men'), ('Shorts', 'men'), ('Jackets', 'men'),
    ('Dresses', 'women'), ('Kurtis', 'women'), ('Tops', 'women'), ('Leggings', 'women'),
    ('T-Shirts', 'unisex'), ('Hoodies', 'unisex'), ('Track Pants', 'unisex'),
    ('Kids T-Shirts', 'kids'), ('Kids Jeans', 'kids'),
]
for name, gender in cats:
    Category.objects.get_or_create(name=name, gender=gender)
print('Categories created!')
"

# Run server
python manage.py runserver
```

### Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Start development server
npm start
```

## 🔑 Access

| Role | URL | Credentials |
|------|-----|-------------|
| **Admin** | http://localhost:3000/admin/login | admin@clothstore.in / Admin@123 |
| **Customer** | http://localhost:3000/login | Register a new account |

## 💳 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get Key ID and Key Secret from Dashboard → Settings → API Keys
3. Add to `backend/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
   ```

## 📱 OTP Verification (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID, Auth Token, Phone Number
3. Add to `backend/.env`
4. For development: OTP is printed to console — check backend logs!

## 🏗️ Architecture

```
ClothStore/
├── backend/           (Django REST API)
│   ├── config/        (Settings, URLs)
│   └── apps/
│       ├── users/     (Auth, Profiles, Addresses, OTP)
│       ├── products/  (Categories, Products, Variants, Images)
│       ├── orders/    (Cart, Orders, Tracking, Wishlist)
│       ├── payments/  (Razorpay Integration)
│       ├── coupons/   (Discount Codes)
│       ├── reviews/   (Product Reviews)
│       ├── refunds/   (Return & Refund System)
│       ├── wallet/    (Customer Wallet)
│       └── analytics/ (Revenue, Charts, Reports)
│
└── frontend/          (React App)
    └── src/
        ├── pages/
        │   ├── customer/  (10+ customer pages)
        │   └── admin/     (10+ admin pages)
        ├── components/    (Reusable UI)
        ├── store/         (Redux State)
        └── services/      (API calls)
```

## 📊 Admin Features

- **Dashboard**: Real-time stats, revenue charts, order status pie chart, top products bar chart
- **Analytics**: Revenue trends, monthly sales, category-wise breakdown
- **Products**: Add/Edit/Delete with multiple images, variants (size/color/stock), size charts, coupons
- **Orders**: Full order management, status updates with tracking, delivery tracking
- **Customers**: All registered customers list
- **Payments**: All payment records with Razorpay IDs
- **Coupons**: Create/disable coupon codes with expiry and usage limits
- **Refunds**: Review refund requests, approve/reject, process to wallet or original payment

## 🛍️ Customer Features

- **Auth**: OTP-verified registration, JWT login
- **Dashboard**: Personalized homepage with trending products
- **Shopping**: Product listing with advanced filters (gender, price, discount, category, color, size)
- **Product Detail**: Multiple images, size/color selection, size chart, reviews
- **Cart & Checkout**: Full cart management, address selection, coupon codes, wallet usage
- **Payments**: Razorpay integration (UPI, cards, net banking, wallets)
- **Orders**: Order history with real-time tracking
- **Wishlist**: Save and manage liked items
- **Wallet**: Balance management, transaction history
- **Refunds**: Submit with photos, choose refund method (wallet/original)
- **Profile**: Edit details, manage multiple addresses
- **Support**: FAQ, contact form
