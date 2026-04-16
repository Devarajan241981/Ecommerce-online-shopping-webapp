from django.conf import settings


def _format_phone_for_twilio(phone: str) -> str:
    """Return a reasonably-formatted E.164 phone number for Twilio.

    - If phone starts with '+', assume it's already E.164 and return as-is.
    - If phone is 10 digits, assume Indian number and prepend +91.
    - Otherwise, return the phone as provided (caller should pass full E.164).
    """
    phone = phone.strip()
    if phone.startswith('+'):
        return phone
    digits = ''.join(ch for ch in phone if ch.isdigit())
    if len(digits) == 10:
        return f'+91{digits}'
    return phone


def send_otp_sms(phone, otp):
    """Send OTP via Twilio. Returns True on success, False on failure.

    Exceptions are logged to stdout so you can see the Twilio error in server logs.
    """
    to_number = _format_phone_for_twilio(phone)
    print(f"[OTP] Sending OTP {otp} to {to_number}")
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=f"Your ClothStore OTP is: {otp}. Valid for 10 minutes.",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        print(f"OTP sent, message sid={getattr(message, 'sid', None)}")
        return True
    except Exception as e:
        # Keep the exception visible in logs for debugging
        print(f"OTP send error: {e}")
        return False
