from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Address
from .serializers import *
from .utils import send_otp_sms
from django.conf import settings
from django.db import IntegrityError
from rest_framework.validators import UniqueValidator

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        # If this is a configured test phone and a user already exists with
        # that phone, remove the serializer's UniqueValidator on the phone
        # field so validation doesn't block our test-update flow.
        phone_in_request = request.data.get('phone')
        if phone_in_request and phone_in_request in getattr(settings, 'TEST_PHONE_NUMBERS', []) and User.objects.filter(phone=phone_in_request).exists():
            phone_field = serializer.fields.get('phone')
            if phone_field and hasattr(phone_field, 'validators'):
                phone_field.validators = [v for v in phone_field.validators if not isinstance(v, UniqueValidator)]

        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        phone = validated.get('phone')

        # If a user with this phone already exists, allow special handling for
        # development/test numbers specified in `TEST_PHONE_NUMBERS`.
        if User.objects.filter(phone=phone).exists():
            # If this is a configured test phone, update the existing user and
            # resend OTP so you can test repeatedly without deleting the user.
            if phone in getattr(settings, 'TEST_PHONE_NUMBERS', []):
                user = User.objects.get(phone=phone)
                # Update simple profile fields and password if provided
                user.name = validated.get('name', user.name)
                user.email = validated.get('email', user.email)
                pwd = validated.get('password')
                if pwd:
                    user.set_password(pwd)
                user.save()
            else:
                return Response({'phone': ['user with this phone already exists.']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Normal create
            try:
                user = serializer.save()
            except IntegrityError:
                return Response({'phone': ['user with this phone already exists.']}, status=status.HTTP_400_BAD_REQUEST)

        otp = user.generate_otp()
        send_otp_sms(user.phone, otp)
        return Response({'message': 'OTP sent to your mobile number.', 'phone': user.phone}, status=status.HTTP_201_CREATED)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        try:
            user = User.objects.get(phone=phone)
            otp = user.generate_otp()
            send_otp_sms(phone, otp)
            return Response({'message': 'OTP sent successfully.'})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        try:
            user = User.objects.get(phone=phone)
            if user.verify_otp(otp):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            return Response({'error': 'Invalid or expired OTP.'}, status=400)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

class CustomerLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)
        if user and user.role == 'customer':
            if not user.is_verified:
                otp = user.generate_otp()
                send_otp_sms(user.phone, otp)
                return Response({'message': 'OTP sent. Please verify.', 'phone': user.phone, 'needs_otp': True})
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials.'}, status=401)

class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(email=serializer.validated_data['email'], password=serializer.validated_data['password'])
        if user and user.role == 'admin':
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid admin credentials.'}, status=401)

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=400)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

class AllCustomersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(role='customer').order_by('-date_joined')
